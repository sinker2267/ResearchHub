package router

import (
	"researchhub-server/internal/config"
	"researchhub-server/internal/handler"
	"researchhub-server/internal/middleware"
	"github.com/gin-gonic/gin"
)

func Setup(cfg *config.Config) *gin.Engine {
	r := gin.Default()

	// CORS
	r.Use(middleware.CORSMiddleware(cfg.CORSOrigins))

	// Handlers
	authH := handler.NewAuthHandler(cfg)
	blogH := handler.NewBlogHandler()
	resourceH := handler.NewResourceHandler()
	noticeH := handler.NewNoticeHandler()
	userH := handler.NewUserHandler()
	adminH := handler.NewAdminHandler()

	api := r.Group("/api")

	// Public routes
	auth := api.Group("/auth")
	{
		auth.POST("/login", authH.Login)
		auth.POST("/refresh", authH.Refresh)
	}

	// Protected routes
	protected := api.Group("")
	protected.Use(middleware.AuthMiddleware(cfg))
	protected.Use(middleware.LoggerMiddleware())
	{
		// Auth
		protected.POST("/auth/logout", authH.Logout)

		// Blogs
		protected.GET("/blogs", blogH.List)
		protected.GET("/blogs/:id", blogH.Detail)
		protected.POST("/blogs", middleware.RequirePermission("blog:create"), blogH.Create)
		protected.PUT("/blogs/:id", middleware.RequirePermission("blog:edit"), blogH.Update)
		protected.DELETE("/blogs/:id", middleware.RequirePermission("blog:delete"), blogH.Delete)
		protected.POST("/blogs/:id/like", blogH.ToggleLike)
		protected.POST("/blogs/:id/favorite", blogH.ToggleFavorite)
		protected.GET("/blogs/:id/comments", blogH.Comments)
		protected.POST("/blogs/:id/comments", blogH.AddComment)
		protected.GET("/blogs/:id/recommendations", blogH.Recommendations)
		protected.PUT("/blogs/:id/pin", middleware.RequirePermission("blog:edit"), blogH.TogglePin)

		// Resources
		protected.GET("/resources", resourceH.List)
		protected.GET("/resources/:id", resourceH.Detail)
		protected.POST("/resources", middleware.RequirePermission("resource:create"), resourceH.Create)
		protected.PUT("/resources/:id", middleware.RequirePermission("resource:edit"), resourceH.Update)
		protected.DELETE("/resources/:id", middleware.RequirePermission("resource:delete"), resourceH.Delete)
		protected.GET("/resources/categories", resourceH.Categories)
		protected.GET("/resources/tags", resourceH.Tags)
		protected.PUT("/resources/:id/pin", middleware.RequirePermission("resource:edit"), resourceH.TogglePin)

		// Notices
		protected.GET("/notices", noticeH.List)
		protected.GET("/notices/unread-count", noticeH.UnreadCount)
		protected.POST("/notices", middleware.RequirePermission("notice:create"), noticeH.Create)
		protected.PUT("/notices/:id", middleware.RequirePermission("notice:manage"), noticeH.Update)
		protected.DELETE("/notices/:id", middleware.RequirePermission("notice:manage"), noticeH.Delete)
		protected.PUT("/notices/:id/read", noticeH.MarkRead)
		protected.PUT("/notices/read-all", noticeH.MarkAllRead)

		// User
		protected.GET("/user/profile", userH.Profile)
		protected.PUT("/user/profile", userH.UpdateProfile)
		protected.GET("/user/favorites", userH.Favorites)
		protected.GET("/user/downloads", userH.DownloadHistory)

		// Admin
		admin := protected.Group("/admin")
		admin.Use(middleware.RequirePermission("admin:access"))
		{
			admin.GET("/dashboard", adminH.Dashboard)
			admin.GET("/users", middleware.RequirePermission("admin:user:manage"), adminH.Users)
			admin.POST("/users", middleware.RequirePermission("admin:user:manage"), adminH.CreateUser)
			admin.PUT("/users/:id", middleware.RequirePermission("admin:user:manage"), adminH.UpdateUser)
			admin.DELETE("/users/:id", middleware.RequirePermission("admin:user:manage"), adminH.DeleteUser)
			admin.GET("/roles", middleware.RequirePermission("admin:role:manage"), adminH.Roles)
			admin.POST("/roles", middleware.RequirePermission("admin:role:manage"), adminH.CreateRole)
			admin.PUT("/roles/:id", middleware.RequirePermission("admin:role:manage"), adminH.UpdateRole)
			admin.DELETE("/roles/:id", middleware.RequirePermission("admin:role:manage"), adminH.DeleteRole)
			admin.GET("/categories", adminH.GetCategories)
			admin.POST("/categories", middleware.RequirePermission("admin:setting:manage"), adminH.CreateCategory)
			admin.PUT("/categories/:id", middleware.RequirePermission("admin:setting:manage"), adminH.UpdateCategory)
			admin.DELETE("/categories/:id", middleware.RequirePermission("admin:setting:manage"), adminH.DeleteCategory)
			admin.GET("/tags", adminH.GetTags)
			admin.POST("/tags", middleware.RequirePermission("admin:setting:manage"), adminH.CreateTag)
			admin.PUT("/tags/:id", middleware.RequirePermission("admin:setting:manage"), adminH.UpdateTag)
			admin.DELETE("/tags/:id", middleware.RequirePermission("admin:setting:manage"), adminH.DeleteTag)
			admin.GET("/permissions", adminH.Permissions)
			admin.GET("/logs", middleware.RequirePermission("admin:log:view"), adminH.Logs)
			admin.GET("/settings", middleware.RequirePermission("admin:setting:manage"), adminH.Settings)
			admin.PUT("/settings", middleware.RequirePermission("admin:setting:manage"), adminH.UpdateSettings)
		}
	}

	return r
}
