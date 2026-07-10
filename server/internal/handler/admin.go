package handler

import (
	"math"
	"researchhub-server/internal/database"
	"researchhub-server/internal/model"
	"github.com/gin-gonic/gin"
	"golang.org/x/crypto/bcrypt"
)

type AdminHandler struct{}

func NewAdminHandler() *AdminHandler { return &AdminHandler{} }

func (h *AdminHandler) Dashboard(c *gin.Context) {
	var userCount, blogCount, resourceCount, noticeCount int64
	database.DB.Model(&model.User{}).Count(&userCount)
	database.DB.Model(&model.Blog{}).Count(&blogCount)
	database.DB.Model(&model.Resource{}).Count(&resourceCount)
	database.DB.Model(&model.Notice{}).Count(&noticeCount)

	Success(c, gin.H{
		"users": userCount, "blogs": blogCount,
		"resources": resourceCount, "notices": noticeCount,
	})
}

func (h *AdminHandler) Users(c *gin.Context) {
	page, pageSize := ParsePagination(c)
	var users []model.User
	var total int64

	query := database.DB.Model(&model.User{})
	if kw := c.Query("keyword"); kw != "" {
		query = query.Where("username ILIKE ? OR display_name ILIKE ?", "%"+kw+"%", "%"+kw+"%")
	}
	query.Count(&total)
	query.Preload("Roles").Offset((page-1)*pageSize).Limit(pageSize).Order("id ASC").Find(&users)

	totalPages := int64(math.Ceil(float64(total) / float64(pageSize)))
	Success(c, PageResponse{
		Data: users,
		Pagination: Pagination{Page: page, PageSize: pageSize, Total: total, TotalPages: totalPages},
	})
}

func (h *AdminHandler) CreateUser(c *gin.Context) {
	var input struct {
		Username    string `json:"username" binding:"required"`
		Password    string `json:"password" binding:"required"`
		DisplayName string `json:"displayName"`
		Email       string `json:"email"`
		Department  string `json:"department"`
		Title       string `json:"title"`
		RoleIDs     []uint `json:"roleIds"`
	}
	if err := c.ShouldBindJSON(&input); err != nil { Error(c, 400, "请提供用户名和密码"); return }

	hash, _ := bcrypt.GenerateFromPassword([]byte(input.Password), bcrypt.DefaultCost)
	user := model.User{
		Username: input.Username, Password: string(hash),
		DisplayName: input.DisplayName, Email: input.Email,
		Department: input.Department, Title: input.Title,
	}
	database.DB.Create(&user)

	var roles []model.Role
	if len(input.RoleIDs) > 0 {
		database.DB.Find(&roles, input.RoleIDs)
		database.DB.Model(&user).Association("Roles").Append(roles)
	}
	Success(c, user)
}

func (h *AdminHandler) UpdateUser(c *gin.Context) {
	id, _ := ParseID(c, "id")
	var user model.User
	if err := database.DB.First(&user, id).Error; err != nil { Error(c, 404, "用户不存在"); return }

	var input map[string]interface{}
	c.ShouldBindJSON(&input)

	if pw, ok := input["password"]; ok && pw != "" {
		hash, _ := bcrypt.GenerateFromPassword([]byte(pw.(string)), bcrypt.DefaultCost)
		input["password"] = string(hash)
	} else {
		delete(input, "password")
	}
	database.DB.Model(&user).Updates(input)
	Success(c, user)
}

func (h *AdminHandler) DeleteUser(c *gin.Context) {
	id, _ := ParseID(c, "id")
	database.DB.Delete(&model.User{}, id)
	Success(c, nil)
}

func (h *AdminHandler) Roles(c *gin.Context) {
	var roles []model.Role
	database.DB.Preload("Permissions").Find(&roles)
	Success(c, roles)
}

func (h *AdminHandler) CreateRole(c *gin.Context) {
	var role model.Role
	if err := c.ShouldBindJSON(&role); err != nil { Error(c, 400, "请求参数错误"); return }
	database.DB.Create(&role)
	Success(c, role)
}

func (h *AdminHandler) UpdateRole(c *gin.Context) {
	id, _ := ParseID(c, "id")
	var role model.Role
	database.DB.First(&role, id)

	var input struct {
		Name        string `json:"name"`
		Description string `json:"description"`
		PermIDs     []uint `json:"permissionIds"`
	}
	c.ShouldBindJSON(&input)
	database.DB.Model(&role).Updates(map[string]interface{}{
		"name": input.Name, "description": input.Description,
	})
	if input.PermIDs != nil {
		var perms []model.Permission
		database.DB.Find(&perms, input.PermIDs)
		database.DB.Model(&role).Association("Permissions").Replace(perms)
	}
	Success(c, role)
}

func (h *AdminHandler) DeleteRole(c *gin.Context) {
	id, _ := ParseID(c, "id")
	database.DB.Delete(&model.Role{}, id)
	Success(c, nil)
}

func (h *AdminHandler) Permissions(c *gin.Context) {
	var perms []model.Permission
	database.DB.Find(&perms)
	Success(c, perms)
}

func (h *AdminHandler) Logs(c *gin.Context) {
	page, pageSize := ParsePagination(c)
	var logs []model.OperationLog
	var total int64
	database.DB.Model(&model.OperationLog{}).Count(&total)
	database.DB.Order("created_at DESC").Offset((page-1)*pageSize).Limit(pageSize).Find(&logs)

	totalPages := int64(math.Ceil(float64(total) / float64(pageSize)))
	Success(c, PageResponse{
		Data: logs,
		Pagination: Pagination{Page: page, PageSize: pageSize, Total: total, TotalPages: totalPages},
	})
}

func (h *AdminHandler) Settings(c *gin.Context) {
	var settings []model.SystemSetting
	database.DB.Find(&settings)
	Success(c, settings)
}

func (h *AdminHandler) UpdateSettings(c *gin.Context) {
	var settings []model.SystemSetting
	if err := c.ShouldBindJSON(&settings); err != nil { Error(c, 400, "请求参数错误"); return }
	for _, s := range settings {
		database.DB.Model(&model.SystemSetting{}).Where("key = ?", s.Key).Update("value", s.Value)
	}
	Success(c, nil)
}
