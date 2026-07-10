package handler

import (
	"math"
	"researchhub-server/internal/database"
	"researchhub-server/internal/middleware"
	"researchhub-server/internal/model"
	"github.com/gin-gonic/gin"
)

type NoticeHandler struct{}

func NewNoticeHandler() *NoticeHandler { return &NoticeHandler{} }

func (h *NoticeHandler) List(c *gin.Context) {
	page, pageSize := ParsePagination(c)
	var notices []model.Notice
	var total int64

	database.DB.Model(&model.Notice{}).Count(&total)
	database.DB.Preload("Publisher").Order("published_at DESC").
		Offset((page - 1) * pageSize).Limit(pageSize).Find(&notices)

	totalPages := int64(math.Ceil(float64(total) / float64(pageSize)))
	Success(c, PageResponse{
		Data: notices,
		Pagination: Pagination{Page: page, PageSize: pageSize, Total: total, TotalPages: totalPages},
	})
}

func (h *NoticeHandler) Create(c *gin.Context) {
	user := middleware.GetCurrentUser(c)
	var notice model.Notice
	if err := c.ShouldBindJSON(&notice); err != nil { Error(c, 400, "请求参数错误"); return }
	notice.PublisherID = user.ID

	if err := database.DB.Create(&notice).Error; err != nil { Error(c, 500, "创建失败"); return }
	database.DB.Preload("Publisher").First(&notice, notice.ID)
	Success(c, notice)
}

func (h *NoticeHandler) Update(c *gin.Context) {
	id, _ := ParseID(c, "id")
	var notice model.Notice
	if err := database.DB.First(&notice, id).Error; err != nil { Error(c, 404, "通知不存在"); return }
	var input model.Notice
	c.ShouldBindJSON(&input)
	database.DB.Model(&notice).Updates(map[string]interface{}{
		"title": input.Title, "content": input.Content,
		"type": input.Type, "level": input.Level,
	})
	Success(c, notice)
}

func (h *NoticeHandler) Delete(c *gin.Context) {
	id, _ := ParseID(c, "id")
	database.DB.Delete(&model.Notice{}, id)
	Success(c, nil)
}

func (h *NoticeHandler) MarkRead(c *gin.Context) {
	id, _ := ParseID(c, "id")
	user := middleware.GetCurrentUser(c)
	database.DB.Where("notice_id = ? AND user_id = ?", id, user.ID).
		FirstOrCreate(&model.NoticeRead{NoticeID: id, UserID: user.ID})
	Success(c, nil)
}

func (h *NoticeHandler) MarkAllRead(c *gin.Context) {
	user := middleware.GetCurrentUser(c)
	var notices []model.Notice
	database.DB.Find(&notices)
	for _, n := range notices {
		database.DB.Where("notice_id = ? AND user_id = ?", n.ID, user.ID).
			FirstOrCreate(&model.NoticeRead{NoticeID: n.ID, UserID: user.ID})
	}
	Success(c, nil)
}

func (h *NoticeHandler) UnreadCount(c *gin.Context) {
	user := middleware.GetCurrentUser(c)
	var total int64
	database.DB.Model(&model.Notice{}).Count(&total)
	var read int64
	database.DB.Model(&model.NoticeRead{}).Where("user_id = ?", user.ID).Count(&read)
	unread := total - read
	if unread < 0 { unread = 0 }
	Success(c, gin.H{"count": unread})
}
