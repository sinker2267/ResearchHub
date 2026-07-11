package database

import (
	"log"
	"time"
	"researchhub-server/internal/model"
	"golang.org/x/crypto/bcrypt"
	"gorm.io/gorm"
)

func Seed(db *gorm.DB) {
	if db.Where("id = ?", 1).First(&model.User{}).RowsAffected > 0 {
		return // already seeded
	}

	// Permissions
	perms := []model.Permission{
		{Name: "查看博客", Code: "blog:view", Resource: "blog", Action: "view"},
		{Name: "创建博客", Code: "blog:create", Resource: "blog", Action: "create"},
		{Name: "编辑博客", Code: "blog:edit", Resource: "blog", Action: "edit"},
		{Name: "删除博客", Code: "blog:delete", Resource: "blog", Action: "delete"},
		{Name: "发布博客", Code: "blog:publish", Resource: "blog", Action: "publish"},
		{Name: "查看资源", Code: "resource:view", Resource: "resource", Action: "view"},
		{Name: "创建资源", Code: "resource:create", Resource: "resource", Action: "create"},
		{Name: "编辑资源", Code: "resource:edit", Resource: "resource", Action: "edit"},
		{Name: "删除资源", Code: "resource:delete", Resource: "resource", Action: "delete"},
		{Name: "下载资源", Code: "resource:download", Resource: "resource", Action: "download"},
		{Name: "查看通知", Code: "notice:view", Resource: "notice", Action: "view"},
		{Name: "创建通知", Code: "notice:create", Resource: "notice", Action: "create"},
		{Name: "管理通知", Code: "notice:manage", Resource: "notice", Action: "manage"},
		{Name: "访问后台", Code: "admin:access", Resource: "admin", Action: "access"},
		{Name: "用户管理", Code: "admin:user:manage", Resource: "admin", Action: "user"},
		{Name: "角色管理", Code: "admin:role:manage", Resource: "admin", Action: "role"},
		{Name: "权限管理", Code: "admin:permission:manage", Resource: "admin", Action: "permission"},
		{Name: "资源管理", Code: "admin:resource:manage", Resource: "admin", Action: "resource"},
		{Name: "查看日志", Code: "admin:log:view", Resource: "admin", Action: "log"},
		{Name: "系统设置", Code: "admin:setting:manage", Resource: "admin", Action: "setting"},
	}
	db.Create(&perms)

	// Roles
	adminRole := model.Role{Name: "系统管理员", Code: "admin", Description: "拥有所有权限"}
	userRole := model.Role{Name: "普通用户", Code: "user", Description: "基本访问权限"}
	editorRole := model.Role{Name: "内容编辑", Code: "editor", Description: "可发布和管理内容"}
	db.Create(&adminRole)
	db.Create(&userRole)
	db.Create(&editorRole)

	// Assign permissions to roles
	db.Model(&adminRole).Association("Permissions").Append(perms)

	var userPerms []model.Permission
	for _, p := range perms {
		if p.Code == "blog:view" || p.Code == "resource:view" || p.Code == "resource:download" || p.Code == "notice:view" {
			
		}
	}
	db.Model(&userRole).Association("Permissions").Append(userPerms)

	var editorPerms []model.Permission
	for _, p := range perms {
		if p.Resource == "blog" || p.Resource == "resource" || p.Code == "notice:view" || p.Code == "notice:create" {
			editorPerms = append(editorPerms, p)
		}
	}
	db.Model(&editorRole).Association("Permissions").Append(editorPerms)

	// Users (password: 123456)
	hash, _ := bcrypt.GenerateFromPassword([]byte("123456"), bcrypt.DefaultCost)

	admin := model.User{
		Username: "admin", Password: string(hash), DisplayName: "张教授",
		Email: "zhang@lab.cn", Bio: "课题组负责人", Department: "生物信息学实验室", Title: "教授",
	}
	liming := model.User{
		Username: "liming", Password: string(hash), DisplayName: "李明",
		Email: "liming@lab.cn", Bio: "博士生", Department: "生物信息学实验室", Title: "博士生",
	}
	wangfang := model.User{
		Username: "wangfang", Password: string(hash), DisplayName: "王芳",
		Email: "wangfang@lab.cn", Bio: "博士后", Department: "结构生物学实验室", Title: "博士后",
	}
	db.Create(&admin)
	db.Create(&liming)
	db.Create(&wangfang)

	db.Model(&admin).Association("Roles").Append(&adminRole)
	db.Model(&liming).Association("Roles").Append(&userRole)
	db.Model(&wangfang).Association("Roles").Append(&userRole)

	// Categories
	cats := []model.Category{
		{Name: "计算生物学", Slug: "comp-bio", Description: "计算方法在生物学中的应用"},
		{Name: "基因组学", Slug: "genomics", Description: "基因组数据分析与解读"},
		{Name: "蛋白质科学", Slug: "protein-science", Description: "蛋白质结构与功能研究"},
		{Name: "药物设计", Slug: "drug-design", Description: "计算机辅助药物设计"},
		{Name: "工具资源", Slug: "tools", Description: "科研软件与工具分享"},
		{Name: "实验室动态", Slug: "lab-news", Description: "实验室新闻与活动"},
	}
	db.Create(&cats)

	// Tags
	tags := []model.Tag{
		{Name: "深度学习", Slug: "deep-learning", Color: "#4c6ef5"},
		{Name: "AlphaFold", Slug: "alphafold", Color: "#40c057"},
		{Name: "单细胞", Slug: "single-cell", Color: "#fa5252"},
		{Name: "CRISPR", Slug: "crispr", Color: "#f59f00"},
		{Name: "Python", Slug: "python", Color: "#339af0"},
		{Name: "蛋白质设计", Slug: "protein-design", Color: "#40c057"},
		{Name: "分子动力学", Slug: "md-simulation", Color: "#fab005"},
	}
	db.Create(&tags)

	// Sample blog
	now := time.Now()
	blog := model.Blog{
		Title: "欢迎使用 ResearchHub", Slug: "welcome-to-researchhub",
		Summary: "这是第一篇自动生成的示例博客文章，欢迎使用 ResearchHub 科研知识管理平台。",
		Content:   "# 欢迎使用 ResearchHub\n\n这是一个面向科研团队的知识管理平台。\n\n## 功能\n\n- 📝 科研博客分享\n- 📦 资源管理\n- 📊 数据集管理\n- 🔔 公告通知\n\n您可以在此撰写、分享和协作科研内容。",
		Status: "published", PublishedAt: &now,
		AuthorID: admin.ID, CategoryID: cats[5].ID,
	}
	db.Create(&blog)
	db.Model(&blog).Association("Tags").Append(&tags[0], &tags[4])

	// System settings
	settings := []model.SystemSetting{
		{Key: "site_title", Value: "ResearchHub", Group: "基础设置", Description: "站点标题"},
		{Key: "site_description", Value: "科研知识管理平台", Group: "基础设置", Description: "站点描述"},
		{Key: "max_upload_size", Value: "500", Group: "上传设置", Description: "单个文件最大上传体积（MB）"},
		{Key: "upload_dir", Value: "/app/uploads", Group: "上传设置", Description: "资源文件存储目录"},
		{Key: "allow_registration", Value: "true", Group: "安全设置", Description: "是否开放注册"},
	}
	db.Create(&settings)

	log.Println("Seed data inserted successfully")
}
