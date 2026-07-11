package handler

import (
	"math"
	"researchhub-server/internal/database"
	"researchhub-server/internal/middleware"
	"researchhub-server/internal/model"
	"time"

	"github.com/gin-gonic/gin"
)

type ResourceHandler struct{}

func NewResourceHandler() *ResourceHandler { return &ResourceHandler{} }

func (h *ResourceHandler) List(c *gin.Context) {
	page, pageSize := ParsePagination(c)
	var resources []model.Resource
	var total int64

	query := database.DB.Model(&model.Resource{}).Where("status = ?", "published")

	if typ := c.Query("type"); typ != "" {
		query = query.Where("type = ?", typ)
	}
	if cat := c.Query("category"); cat != "" {
		query = query.Joins("JOIN categories ON categories.id = resources.category_id").
			Where("categories.slug = ?", cat)
	}
	if tag := c.Query("tag"); tag != "" {
		query = query.Joins("JOIN resource_tags ON resource_tags.resource_id = resources.id").
			Joins("JOIN tags ON tags.id = resource_tags.tag_id").
			Where("tags.slug = ?", tag)
	}
	if kw := c.Query("keyword"); kw != "" {
		query = query.Where("title ILIKE ? OR description ILIKE ?", "%"+kw+"%", "%"+kw+"%")
	}

	sort := c.DefaultQuery("sort", "latest")
	if sort == "downloads" {
		query = query.Order("is_pinned DESC, download_count DESC")
	} else {
		query = query.Order("is_pinned DESC, pinned_at DESC, created_at DESC")
	}

	query.Count(&total)
	offset := (page - 1) * pageSize
	query.Offset(offset).Limit(pageSize).
		Preload("Author").Preload("Category").Preload("Tags").Preload("Files").Preload("Versions").
		Find(&resources)

	totalPages := int64(math.Ceil(float64(total) / float64(pageSize)))
	Success(c, PageResponse{
		Data: resources,
		Pagination: Pagination{Page: page, PageSize: pageSize, Total: total, TotalPages: totalPages},
	})
}

func (h *ResourceHandler) Detail(c *gin.Context) {
	id, err := ParseID(c, "id")
	if err != nil { Error(c, 400, "无效的ID"); return }

	var resource model.Resource
	if err := database.DB.Preload("Author").Preload("Category").Preload("Tags").
		Preload("Files").Preload("Versions").
		First(&resource, id).Error; err != nil {
		Error(c, 404, "资源不存在"); return
	}

	database.DB.Model(&resource).UpdateColumn("view_count", resource.ViewCount+1)
	Success(c, resource)
}

func (h *ResourceHandler) Create(c *gin.Context) {
	var resource model.Resource
	if err := c.ShouldBindJSON(&resource); err != nil { Error(c, 400, "请求参数错误"); return }
	resource.AuthorID = middleware.GetCurrentUser(c).ID
	resource.Slug = generateSlugSafe(resource.Title)
	resource.Status = "published"
	if err := database.DB.Create(&resource).Error; err != nil { Error(c, 500, "创建失败"); return }
	Success(c, resource)
}

func (h *ResourceHandler) Update(c *gin.Context) {
	id, _ := ParseID(c, "id")
	var r model.Resource
	if err := database.DB.First(&r, id).Error; err != nil { Error(c, 404, "资源不存在"); return }

	var input model.Resource
	c.ShouldBindJSON(&input)
	database.DB.Model(&r).Updates(map[string]interface{}{
		"title": input.Title, "description": input.Description,
		"type": input.Type, "license": input.License, "citation": input.Citation,
		"category_id": input.CategoryID,
	})
	if len(input.Tags) > 0 {
		database.DB.Model(&r).Association("Tags").Replace(input.Tags)
	}
	Success(c, r)
}

func (h *ResourceHandler) Delete(c *gin.Context) {
	id, _ := ParseID(c, "id")
	var r model.Resource
	if err := database.DB.First(&r, id).Error; err != nil { Error(c, 404, "资源不存在"); return }
	database.DB.Model(&r).Association("Tags").Clear()
	database.DB.Model(&r).Association("Files").Delete()
	database.DB.Model(&r).Association("Versions").Delete()
	var resource model.Resource
	if err := database.DB.First(&resource, id).Error; err != nil { Error(c, 404, "资源不存在"); return }
	database.DB.Where("resource_id = ?", id).Delete(&model.ResourceFile{})
	database.DB.Where("resource_id = ?", id).Delete(&model.ResourceVersion{})
	database.DB.Model(&resource).Association("Tags").Clear()
	database.DB.Delete(&r)
	Success(c, nil)
}

func (h *ResourceHandler) Categories(c *gin.Context) {
	var cats []model.Category
	database.DB.Find(&cats)
	Success(c, cats)
}

func (h *ResourceHandler) Tags(c *gin.Context) {
	var tags []model.Tag
	database.DB.Find(&tags)
	Success(c, tags)
}

func (h *ResourceHandler) TogglePin(c *gin.Context) {
	id, _ := ParseID(c, "id")
	var resource model.Resource
	if err := database.DB.First(&resource, id).Error; err != nil {
		Error(c, 404, "资源不存在")
		return
	}
	now := time.Now()
	if resource.IsPinned {
		database.DB.Model(&resource).Updates(map[string]interface{}{"is_pinned": false, "pinned_at": nil})
		Success(c, gin.H{"isPinned": false})
	} else {
		database.DB.Model(&resource).Updates(map[string]interface{}{"is_pinned": true, "pinned_at": now})
		Success(c, gin.H{"isPinned": true, "pinnedAt": now})
	}
}

func (h *ResourceHandler) UploadFile(c *gin.Context) {
	id, _ := ParseID(c, "id")
	var resource model.Resource
	if err := database.DB.First(&resource, id).Error; err != nil {
		Error(c, 404, "资源不存在")
		return
	}

	file, err := c.FormFile("file")
	if err != nil {
		Error(c, 400, "请选择文件")
		return
	}

	// Save file
	savePath := "uploads/" + file.Filename
	if err := c.SaveUploadedFile(file, savePath); err != nil {
		Error(c, 500, "文件保存失败")
		return
	}

	rf := model.ResourceFile{
		ResourceID: resource.ID,
		Filename:   file.Filename,
		FilePath:   savePath,
		Size:       file.Size,
		MimeType:   file.Header.Get("Content-Type"),
	}
	database.DB.Create(&rf)
	Success(c, rf)
}

func (h *ResourceHandler) DownloadFile(c *gin.Context) {
	id, _ := ParseID(c, "id")
	fileID, _ := ParseID(c, "fileId")

	var rf model.ResourceFile
	if err := database.DB.Where("id = ? AND resource_id = ?", fileID, id).First(&rf).Error; err != nil {
		Error(c, 404, "文件不存在")
		return
	}

	c.FileAttachment(rf.FilePath, rf.Filename)
}
