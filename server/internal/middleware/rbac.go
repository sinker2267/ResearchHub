package middleware

import (
	"net/http"
	"researchhub-server/internal/database"
	"researchhub-server/internal/model"
	"github.com/gin-gonic/gin"
)

func RequirePermission(code string) gin.HandlerFunc {
	return func(c *gin.Context) {
		user := GetCurrentUser(c)
		if hasPermission(user, code) {
			c.Next()
			return
		}
		c.JSON(http.StatusForbidden, gin.H{"code": 403, "message": "没有访问权限"})
		c.Abort()
	}
}

func hasPermission(user model.User, code string) bool {
	for _, role := range user.Roles {
		if role.Code == "admin" {
			return true
		}
		for _, perm := range role.Permissions {
			if perm.Code == code {
				return true
			}
		}
	}
	return false
}

func CORSMiddleware(origins string) gin.HandlerFunc {
	return func(c *gin.Context) {
		c.Header("Access-Control-Allow-Origin", origins)
		c.Header("Access-Control-Allow-Methods", "GET,POST,PUT,DELETE,OPTIONS")
		c.Header("Access-Control-Allow-Headers", "Origin,Content-Type,Authorization")
		c.Header("Access-Control-Allow-Credentials", "true")
		if c.Request.Method == "OPTIONS" {
			c.AbortWithStatus(http.StatusNoContent)
			return
		}
		c.Next()
	}
}

func LoggerMiddleware() gin.HandlerFunc {
	return func(c *gin.Context) {
		c.Next()
		method := c.Request.Method
		if method == "GET" || method == "OPTIONS" {
			return
		}
		user, exists := c.Get("user")
		if !exists {
			return
		}
		u := user.(model.User)
		database.DB.Create(&model.OperationLog{
			UserID: u.ID, Username: u.Username,
			Action: methodToAction(method),
			Resource: c.FullPath(), Detail: c.Request.URL.Path, IP: c.ClientIP(),
		})
	}
}

func methodToAction(method string) string {
	switch method {
	case "POST": return "创建"
	case "PUT": return "更新"
	case "DELETE": return "删除"
	default: return "访问"
	}
}
