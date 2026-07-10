package handler

import (
	"time"
	"researchhub-server/internal/config"
	"researchhub-server/internal/database"
	"researchhub-server/internal/middleware"
	"researchhub-server/internal/model"
	"github.com/gin-gonic/gin"
	"github.com/google/uuid"
	"golang.org/x/crypto/bcrypt"
)

type AuthHandler struct {
	Config *config.Config
}

func NewAuthHandler(cfg *config.Config) *AuthHandler {
	return &AuthHandler{Config: cfg}
}

type LoginRequest struct {
	Username string `json:"username" binding:"required"`
	Password string `json:"password" binding:"required"`
}

func (h *AuthHandler) Login(c *gin.Context) {
	var req LoginRequest
	if err := c.ShouldBindJSON(&req); err != nil {
		Error(c, 400, "请提供用户名和密码")
		return
	}

	var user model.User
	result := database.DB.Preload("Roles.Permissions").Where("username = ?", req.Username).First(&user)
	if result.Error != nil {
		Error(c, 401, "用户名或密码错误")
		return
	}

	if err := bcrypt.CompareHashAndPassword([]byte(user.Password), []byte(req.Password)); err != nil {
		Error(c, 401, "用户名或密码错误")
		return
	}

	if user.Status != "active" {
		Error(c, 403, "账号已被禁用")
		return
	}

	// Generate tokens
	accessToken, _ := middleware.GenerateToken(user.ID, user.Username, h.Config)
	refreshToken := uuid.NewString()

	database.DB.Create(&model.RefreshToken{
		Token: refreshToken, UserID: user.ID,
		ExpiresAt: time.Now().Add(7 * 24 * time.Hour),
	})

	// Update last login
	now := time.Now()
	user.LastLoginAt = &now
	database.DB.Save(&user)

	// Collect permission codes
	var permissions []string
	for _, role := range user.Roles {
		for _, perm := range role.Permissions {
			permissions = append(permissions, perm.Code)
		}
	}
	if permissions == nil {
		permissions = []string{}
	}

	Success(c, gin.H{
		"accessToken":  accessToken,
		"refreshToken": refreshToken,
		"expiresIn":    86400,
		"userInfo": gin.H{
			"id": user.ID, "username": user.Username,
			"displayName": user.DisplayName, "email": user.Email,
			"avatar": user.Avatar, "bio": user.Bio,
			"department": user.Department, "title": user.Title,
			"roles":       user.Roles,
			"permissions": permissions,
			"createdAt":   user.CreatedAt, "updatedAt": user.UpdatedAt,
		},
	})
}

func (h *AuthHandler) Refresh(c *gin.Context) {
	var req struct {
		RefreshToken string `json:"refreshToken" binding:"required"`
	}
	if err := c.ShouldBindJSON(&req); err != nil {
		Error(c, 400, "请提供刷新令牌")
		return
	}

	var rt model.RefreshToken
	if err := database.DB.Where("token = ?", req.RefreshToken).First(&rt).Error; err != nil {
		Error(c, 401, "刷新令牌无效")
		return
	}

	if time.Now().After(rt.ExpiresAt) {
		database.DB.Delete(&rt)
		Error(c, 401, "刷新令牌已过期")
		return
	}

	var user model.User
	database.DB.First(&user, rt.UserID)

	// Rotate tokens
	database.DB.Delete(&rt)
	accessToken, _ := middleware.GenerateToken(user.ID, user.Username, h.Config)
	newRefreshToken := uuid.NewString()
	database.DB.Create(&model.RefreshToken{
		Token: newRefreshToken, UserID: user.ID,
		ExpiresAt: time.Now().Add(7 * 24 * time.Hour),
	})

	Success(c, gin.H{
		"accessToken":  accessToken,
		"refreshToken": newRefreshToken,
		"expiresIn":    86400,
	})
}

func (h *AuthHandler) Logout(c *gin.Context) {
	var req struct {
		RefreshToken string `json:"refreshToken"`
	}
	c.ShouldBindJSON(&req)
	if req.RefreshToken != "" {
		database.DB.Where("token = ?", req.RefreshToken).Delete(&model.RefreshToken{})
	}
	Success(c, nil)
}
