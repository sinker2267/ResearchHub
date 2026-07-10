package handler

import (
	"math"
	"researchhub-server/internal/database"
	"researchhub-server/internal/middleware"
	"researchhub-server/internal/model"
	"github.com/gin-gonic/gin"
)

type UserHandler struct{}

func NewUserHandler() *UserHandler { return &UserHandler{} }

func (h *UserHandler) Profile(c *gin.Context) {
	user := middleware.GetCurrentUser(c)

	var favorites []model.Favorite
	database.DB.Where("user_id = ?", user.ID).Find(&favorites)

	var downloads []model.DownloadRecord
	database.DB.Where("user_id = ?", user.ID).Order("downloaded_at DESC").Find(&downloads)

	database.DB.Preload("Roles.Permissions").First(&user, user.ID)

	var permissions []string
	for _, role := range user.Roles {
		for _, perm := range role.Permissions {
			permissions = append(permissions, perm.Code)
		}
	}
	if permissions == nil { permissions = []string{} }

	Success(c, gin.H{
		"id": user.ID, "username": user.Username,
		"displayName": user.DisplayName, "email": user.Email,
		"avatar": user.Avatar, "bio": user.Bio,
		"department": user.Department, "title": user.Title,
		"roles": user.Roles, "permissions": permissions,
		"createdAt": user.CreatedAt, "updatedAt": user.UpdatedAt,
		"downloadHistory": downloads,
		"favorites":       favorites,
	})
}

func (h *UserHandler) UpdateProfile(c *gin.Context) {
	user := middleware.GetCurrentUser(c)
	var input struct {
		DisplayName string `json:"displayName"`
		Bio         string `json:"bio"`
		Email       string `json:"email"`
		Avatar      string `json:"avatar"`
	}
	c.ShouldBindJSON(&input)
	database.DB.Model(&user).Updates(map[string]interface{}{
		"display_name": input.DisplayName, "bio": input.Bio,
		"email": input.Email, "avatar": input.Avatar,
	})
	Success(c, user)
}

func (h *UserHandler) Favorites(c *gin.Context) {
	user := middleware.GetCurrentUser(c)
	page, pageSize := ParsePagination(c)
	var favs []model.Favorite
	var total int64

	database.DB.Model(&model.Favorite{}).Where("user_id = ?", user.ID).Count(&total)
	database.DB.Where("user_id = ?", user.ID).Order("created_at DESC").
		Offset((page - 1) * pageSize).Limit(pageSize).Find(&favs)

	totalPages := int64(math.Ceil(float64(total) / float64(pageSize)))
	Success(c, PageResponse{
		Data: favs,
		Pagination: Pagination{Page: page, PageSize: pageSize, Total: total, TotalPages: totalPages},
	})
}

func (h *UserHandler) DownloadHistory(c *gin.Context) {
	user := middleware.GetCurrentUser(c)
	page, pageSize := ParsePagination(c)
	var downloads []model.DownloadRecord
	var total int64

	database.DB.Model(&model.DownloadRecord{}).Where("user_id = ?", user.ID).Count(&total)
	database.DB.Where("user_id = ?", user.ID).Order("downloaded_at DESC").
		Offset((page - 1) * pageSize).Limit(pageSize).Find(&downloads)

	totalPages := int64(math.Ceil(float64(total) / float64(pageSize)))
	Success(c, PageResponse{
		Data: downloads,
		Pagination: Pagination{Page: page, PageSize: pageSize, Total: total, TotalPages: totalPages},
	})
}
