package handler

import (
	"math"
	"researchhub-server/internal/database"
	"researchhub-server/internal/middleware"
	"researchhub-server/internal/model"
	"time"

	"github.com/gin-gonic/gin"
)

type BlogHandler struct{}

func NewBlogHandler() *BlogHandler { return &BlogHandler{} }

func (h *BlogHandler) List(c *gin.Context) {
	page, pageSize := ParsePagination(c)
	var blogs []model.Blog
	var total int64

	query := database.DB.Model(&model.Blog{}).Where("status = ?", "published")

	if cat := c.Query("category"); cat != "" {
		query = query.Joins("JOIN categories ON categories.id = blogs.category_id").
			Where("categories.slug = ?", cat)
	}
	if tag := c.Query("tag"); tag != "" {
		query = query.Joins("JOIN blog_tags ON blog_tags.blog_id = blogs.id").
			Joins("JOIN tags ON tags.id = blog_tags.tag_id").
			Where("tags.slug = ?", tag)
	}
	if kw := c.Query("keyword"); kw != "" {
		query = query.Where("title ILIKE ? OR summary ILIKE ?", "%"+kw+"%", "%"+kw+"%")
	}

	sort := c.DefaultQuery("sort", "latest")
	if sort == "popular" {
		query = query.Order("is_pinned DESC, view_count DESC")
	} else {
		query = query.Order("is_pinned DESC, pinned_at DESC, published_at DESC")
	}

	query.Count(&total)
	offset := (page - 1) * pageSize
	query.Offset(offset).Limit(pageSize).
		Preload("Author").Preload("Category").Preload("Tags").
		Find(&blogs)

	totalPages := int64(math.Ceil(float64(total) / float64(pageSize)))

	Success(c, PageResponse{
		Data: blogs,
		Pagination: Pagination{Page: page, PageSize: pageSize, Total: total, TotalPages: totalPages},
	})
}

func (h *BlogHandler) Detail(c *gin.Context) {
	id, err := ParseID(c, "id")
	if err != nil { Error(c, 400, "无效的ID"); return }

	var blog model.Blog
	if err := database.DB.Preload("Author").Preload("Category").Preload("Tags").
		First(&blog, id).Error; err != nil {
		Error(c, 404, "文章不存在")
		return
	}

	// Increment view count
	database.DB.Model(&blog).UpdateColumn("view_count", blog.ViewCount+1)
	blog.ViewCount++

	// Check if current user liked/favorited
	user := middleware.GetCurrentUser(c)
	if user.ID != 0 {
		var likeCount, favCount int64
		database.DB.Table("blog_likes").Where("blog_id = ? AND user_id = ?", id, user.ID).Count(&likeCount)
		database.DB.Table("blog_favorites").Where("blog_id = ? AND user_id = ?", id, user.ID).Count(&favCount)
		c.Set("isLiked", likeCount > 0)
		c.Set("isFavorited", favCount > 0)
	}

	Success(c, blog)
}

func (h *BlogHandler) Create(c *gin.Context) {
	user := middleware.GetCurrentUser(c)
	var blog model.Blog
	if err := c.ShouldBindJSON(&blog); err != nil {
		Error(c, 400, "请求参数错误")
		return
	}
	blog.AuthorID = user.ID
	blog.Slug = generateSlug(blog.Title)

	if err := database.DB.Create(&blog).Error; err != nil {
		Error(c, 500, "创建失败")
		return
	}
	Success(c, blog)
}

func (h *BlogHandler) Update(c *gin.Context) {
	id, _ := ParseID(c, "id")
	var blog model.Blog
	if err := database.DB.First(&blog, id).Error; err != nil {
		Error(c, 404, "文章不存在"); return
	}

	user := middleware.GetCurrentUser(c)
	if blog.AuthorID != user.ID {
		isAdmin := false
		for _, r := range user.Roles {
			if r.Code == "admin" { isAdmin = true; break }
		}
		if !isAdmin { Error(c, 403, "无权限修改"); return }
	}

	var input model.Blog
	if err := c.ShouldBindJSON(&input); err != nil { Error(c, 400, "请求参数错误"); return }

	database.DB.Model(&blog).Updates(map[string]interface{}{
		"title": input.Title, "content": input.Content,
		"summary": input.Summary, "status": input.Status,
		"category_id": input.CategoryID,
	})
	if len(input.Tags) > 0 {
		database.DB.Model(&blog).Association("Tags").Replace(input.Tags)
	}
	Success(c, blog)
}

func (h *BlogHandler) Delete(c *gin.Context) {
	id, _ := ParseID(c, "id")
	database.DB.Delete(&model.Blog{}, id)
	Success(c, nil)
}

func (h *BlogHandler) ToggleLike(c *gin.Context) {
	id, _ := ParseID(c, "id")
	user := middleware.GetCurrentUser(c)

	var count int64
	database.DB.Table("blog_likes").Where("blog_id = ? AND user_id = ?", id, user.ID).Count(&count)

	if count > 0 {
		database.DB.Table("blog_likes").Where("blog_id = ? AND user_id = ?", id, user.ID).Delete(nil)
		database.DB.Model(&model.Blog{}).Where("id = ?", id).UpdateColumn("like_count", database.DB.Raw("like_count - 1"))
		Success(c, gin.H{"liked": false})
	} else {
		database.DB.Table("blog_likes").Create(map[string]interface{}{"blog_id": id, "user_id": user.ID})
		database.DB.Model(&model.Blog{}).Where("id = ?", id).UpdateColumn("like_count", database.DB.Raw("like_count + 1"))
		Success(c, gin.H{"liked": true})
	}
}

func (h *BlogHandler) ToggleFavorite(c *gin.Context) {
	id, _ := ParseID(c, "id")
	user := middleware.GetCurrentUser(c)

	var count int64
	database.DB.Table("blog_favorites").Where("blog_id = ? AND user_id = ?", id, user.ID).Count(&count)

	if count > 0 {
		database.DB.Table("blog_favorites").Where("blog_id = ? AND user_id = ?", id, user.ID).Delete(nil)
		Success(c, gin.H{"favorited": false})
	} else {
		database.DB.Table("blog_favorites").Create(map[string]interface{}{"blog_id": id, "user_id": user.ID})
		Success(c, gin.H{"favorited": true})
	}
}

func (h *BlogHandler) Comments(c *gin.Context) {
	id, _ := ParseID(c, "id")
	page, pageSize := ParsePagination(c)

	var comments []model.BlogComment
	var total int64
	database.DB.Model(&model.BlogComment{}).Where("blog_id = ? AND parent_id IS NULL", id).Count(&total)
	database.DB.Where("blog_id = ? AND parent_id IS NULL", id).
		Preload("Author").Preload("Replies.Author").
		Offset((page-1)*pageSize).Limit(pageSize).Order("created_at DESC").
		Find(&comments)

	totalPages := int64(math.Ceil(float64(total) / float64(pageSize)))
	Success(c, PageResponse{
		Data: comments,
		Pagination: Pagination{Page: page, PageSize: pageSize, Total: total, TotalPages: totalPages},
	})
}

func (h *BlogHandler) AddComment(c *gin.Context) {
	id, _ := ParseID(c, "id")
	user := middleware.GetCurrentUser(c)

	var input struct {
		Content  string `json:"content" binding:"required"`
		ParentID *uint  `json:"parentId"`
	}
	if err := c.ShouldBindJSON(&input); err != nil { Error(c, 400, "请输入评论内容"); return }

	comment := model.BlogComment{
		BlogID: id, AuthorID: user.ID, Content: input.Content, ParentID: input.ParentID,
	}
	database.DB.Create(&comment)
	database.DB.Model(&model.Blog{}).Where("id = ?", id).
		UpdateColumn("comment_count", database.DB.Raw("comment_count + 1"))

	database.DB.Preload("Author").First(&comment, comment.ID)
	Success(c, comment)
}

func (h *BlogHandler) Recommendations(c *gin.Context) {
	id, _ := ParseID(c, "id")
	var blog model.Blog
	database.DB.First(&blog, id)

	var recs []model.Blog
	database.DB.Where("id != ? AND status = ? AND category_id = ?", id, "published", blog.CategoryID).
		Preload("Author").Preload("Category").Order("is_pinned DESC, view_count DESC").Limit(3).Find(&recs)

	if len(recs) < 3 {
		var more []model.Blog
		database.DB.Where("id != ? AND status = ? AND id NOT IN ?", id, "published", pluckIDs(recs)).
			Preload("Author").Preload("Category").Order("is_pinned DESC, pinned_at DESC, published_at DESC").Limit(3 - len(recs)).Find(&more)
		recs = append(recs, more...)
	}
	Success(c, recs)
}

func generateSlug(title string) string {
	slug := ""
	for _, r := range title {
		if (r >= 'a' && r <= 'z') || (r >= 'A' && r <= 'Z') || (r >= '0' && r <= '9') || r == '-' {
			slug += string(r)
		} else if r == ' ' {
			slug += "-"
		}
	}
	if len(slug) > 200 { slug = slug[:200] }
	return slug
}

func pluckIDs(blogs []model.Blog) []uint {
	ids := make([]uint, len(blogs))
	for i, b := range blogs { ids[i] = b.ID }
	return ids
}

func (h *BlogHandler) TogglePin(c *gin.Context) {
	id, _ := ParseID(c, "id")
	var blog model.Blog
	if err := database.DB.First(&blog, id).Error; err != nil {
		Error(c, 404, "文章不存在")
		return
	}
	now := time.Now()
	if blog.IsPinned {
		database.DB.Model(&blog).Updates(map[string]interface{}{"is_pinned": false, "pinned_at": nil})
		Success(c, gin.H{"isPinned": false})
	} else {
		database.DB.Model(&blog).Updates(map[string]interface{}{"is_pinned": true, "pinned_at": now})
		Success(c, gin.H{"isPinned": true, "pinnedAt": now})
	}
}
