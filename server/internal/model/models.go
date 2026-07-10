package model

import (
	"time"
	"gorm.io/gorm"
)

// --- User & Auth ---

type User struct {
	ID          uint      `gorm:"primaryKey" json:"id"`
	Username    string    `gorm:"uniqueIndex;size:50" json:"username"`
	Password    string    `gorm:"size:255" json:"-"`
	DisplayName string    `gorm:"size:100" json:"displayName"`
	Email       string    `gorm:"size:200" json:"email"`
	Avatar      string    `gorm:"size:500" json:"avatar"`
	Bio         string    `gorm:"size:500" json:"bio"`
	Department  string    `gorm:"size:200" json:"department"`
	Title       string    `gorm:"size:100" json:"title"`
	Status      string    `gorm:"size:20;default:active" json:"status"`
	LastLoginAt *time.Time `json:"lastLoginAt"`
	CreatedAt   time.Time `json:"createdAt"`
	UpdatedAt   time.Time `json:"updatedAt"`
	Roles       []Role    `gorm:"many2many:user_roles;" json:"roles"`
}

type Role struct {
	ID          uint         `gorm:"primaryKey" json:"id"`
	Name        string       `gorm:"size:100" json:"name"`
	Code        string       `gorm:"uniqueIndex;size:50" json:"code"`
	Description string       `gorm:"size:500" json:"description"`
	Permissions []Permission `gorm:"many2many:role_permissions;" json:"permissions"`
}

type Permission struct {
	ID       uint   `gorm:"primaryKey" json:"id"`
	Name     string `gorm:"size:100" json:"name"`
	Code     string `gorm:"uniqueIndex;size:100" json:"code"`
	Resource string `gorm:"size:50" json:"resource"`
	Action   string `gorm:"size:50" json:"action"`
}

type RefreshToken struct {
	ID        uint      `gorm:"primaryKey" json:"id"`
	Token     string    `gorm:"uniqueIndex;size:500" json:"token"`
	UserID    uint      `json:"userId"`
	ExpiresAt time.Time `json:"expiresAt"`
	CreatedAt time.Time `json:"createdAt"`
}

// --- Blog ---

type Blog struct {
	ID           uint      `gorm:"primaryKey" json:"id"`
	Title        string    `gorm:"size:500" json:"title"`
	Slug         string    `gorm:"uniqueIndex;size:500" json:"slug"`
	Summary      string    `gorm:"size:1000" json:"summary"`
	Content      string    `gorm:"type:text" json:"content"`
	CoverImage   string    `gorm:"size:500" json:"coverImage"`
	Status       string    `gorm:"size:20;default:draft" json:"status"`
	ViewCount    int       `gorm:"default:0" json:"viewCount"`
	LikeCount    int       `gorm:"default:0" json:"likeCount"`
	CommentCount int       `gorm:"default:0" json:"commentCount"`
	PublishedAt  *time.Time `json:"publishedAt"`
	CreatedAt    time.Time `json:"createdAt"`
	UpdatedAt    time.Time `json:"updatedAt"`
	AuthorID     uint      `json:"-"`
	IsPinned     bool       `gorm:"default:false" json:"isPinned"`
	PinnedAt     *time.Time `json:"pinnedAt"`
	Author       User      `gorm:"foreignKey:AuthorID" json:"author"`
	CategoryID   uint      `json:"-"`
	Category     Category  `gorm:"foreignKey:CategoryID" json:"category"`
	Tags         []Tag     `gorm:"many2many:blog_tags;" json:"tags"`
	Likes        []User    `gorm:"many2many:blog_likes;" json:"-"`
	Favorites    []User    `gorm:"many2many:blog_favorites;" json:"-"`
}

type BlogComment struct {
	ID        uint          `gorm:"primaryKey" json:"id"`
	Content   string        `gorm:"type:text" json:"content"`
	BlogID    uint          `json:"blogId"`
	AuthorID  uint          `json:"-"`
	Author    User          `gorm:"foreignKey:AuthorID" json:"author"`
	ParentID  *uint         `json:"parentId"`
	Parent    *BlogComment  `gorm:"foreignKey:ParentID" json:"-"`
	Replies   []BlogComment `gorm:"foreignKey:ParentID" json:"replies,omitempty"`
	CreatedAt time.Time     `json:"createdAt"`
}

// --- Resource ---

type Resource struct {
	ID            uint              `gorm:"primaryKey" json:"id"`
	Title         string            `gorm:"size:500" json:"title"`
	Slug          string            `gorm:"uniqueIndex;size:500" json:"slug"`
	Description   string            `gorm:"type:text" json:"description"`
	Type          string            `gorm:"size:20" json:"type"`
	License       string            `gorm:"size:200" json:"license"`
	Citation      string            `gorm:"type:text" json:"citation"`
	Status        string            `gorm:"size:20;default:draft" json:"status"`
	ViewCount     int               `gorm:"default:0" json:"viewCount"`
	DownloadCount int               `gorm:"default:0" json:"downloadCount"`
	LikeCount     int               `gorm:"default:0" json:"likeCount"`
	CreatedAt     time.Time         `json:"createdAt"`
	UpdatedAt     time.Time         `json:"updatedAt"`
	AuthorID      uint              `json:"-"`
	IsPinned     bool       `gorm:"default:false" json:"isPinned"`
	PinnedAt     *time.Time `json:"pinnedAt"`
	Author        User              `gorm:"foreignKey:AuthorID" json:"author"`
	CategoryID    uint              `json:"-"`
	Category      Category          `gorm:"foreignKey:CategoryID" json:"category"`
	Tags          []Tag             `gorm:"many2many:resource_tags;" json:"tags"`
	Files         []ResourceFile    `gorm:"foreignKey:ResourceID" json:"files"`
	Versions      []ResourceVersion `gorm:"foreignKey:ResourceID" json:"versions"`
}

type ResourceFile struct {
	ID            uint      `gorm:"primaryKey" json:"id"`
	Filename      string    `gorm:"size:500" json:"filename"`
	FilePath      string    `gorm:"size:1000" json:"-"`
	Size          int64     `json:"size"`
	MD5           string    `gorm:"size:32" json:"md5"`
	SHA256        string    `gorm:"size:64" json:"sha256"`
	MimeType      string    `gorm:"size:100" json:"mimeType"`
	DownloadCount int       `gorm:"default:0" json:"downloadCount"`
	ResourceID    uint      `json:"-"`
	CreatedAt     time.Time `json:"createdAt"`
}

type ResourceVersion struct {
	ID         uint      `gorm:"primaryKey" json:"id"`
	Version    string    `gorm:"size:50" json:"version"`
	Changelog  string    `gorm:"type:text" json:"changelog"`
	ResourceID uint      `json:"-"`
	CreatedAt  time.Time `json:"createdAt"`
}

// --- Common ---

type Category struct {
	ID          uint   `gorm:"primaryKey" json:"id"`
	Name        string `gorm:"size:100" json:"name"`
	Slug        string `gorm:"uniqueIndex;size:100" json:"slug"`
	Description string `gorm:"size:500" json:"description"`
	ParentID    *uint  `json:"parentId"`
}

type Tag struct {
	ID    uint   `gorm:"primaryKey" json:"id"`
	Name  string `gorm:"size:100" json:"name"`
	Slug  string `gorm:"uniqueIndex;size:100" json:"slug"`
	Color string `gorm:"size:20" json:"color"`
}

// --- Notice ---

type Notice struct {
	ID          uint      `gorm:"primaryKey" json:"id"`
	Title       string    `gorm:"size:500" json:"title"`
	Content     string    `gorm:"type:text" json:"content"`
	Type        string    `gorm:"size:20" json:"type"`
	Level       string    `gorm:"size:20;default:info" json:"level"`
	PublishedAt time.Time `json:"publishedAt"`
	CreatedAt   time.Time `json:"createdAt"`
	PublisherID uint      `json:"-"`
	Publisher   User      `gorm:"foreignKey:PublisherID" json:"publisher"`
}

type NoticeRead struct {
	ID       uint `gorm:"primaryKey"`
	NoticeID uint
	UserID   uint
}

// --- System ---

type OperationLog struct {
	ID        uint      `gorm:"primaryKey" json:"id"`
	UserID    uint      `json:"userId"`
	Username  string    `gorm:"size:50" json:"username"`
	Action    string    `gorm:"size:50" json:"action"`
	Resource  string    `gorm:"size:100" json:"resource"`
	Detail    string    `gorm:"size:1000" json:"detail"`
	IP        string    `gorm:"size:50" json:"ip"`
	CreatedAt time.Time `json:"createdAt"`
}

type SystemSetting struct {
	ID          uint   `gorm:"primaryKey" json:"id"`
	Key         string `gorm:"uniqueIndex;size:100" json:"key"`
	Value       string `gorm:"type:text" json:"value"`
	Group       string `gorm:"size:50" json:"group"`
	Description string `gorm:"size:500" json:"description"`
}

// --- User Relations ---

type DownloadRecord struct {
	ID             uint      `gorm:"primaryKey" json:"id"`
	UserID         uint      `json:"-"`
	ResourceID     uint      `json:"resourceId"`
	ResourceTitle  string    `gorm:"size:500" json:"resourceTitle"`
	FileID         uint      `json:"fileId"`
	FileName       string    `gorm:"size:500" json:"fileName"`
	DownloadedAt   time.Time `json:"downloadedAt"`
}

type Favorite struct {
	ID        uint      `gorm:"primaryKey" json:"id"`
	UserID    uint      `json:"-"`
	Type      string    `gorm:"size:20" json:"type"`
	ItemID    uint      `json:"itemId"`
	ItemTitle string    `gorm:"size:500" json:"itemTitle"`
	CreatedAt time.Time `json:"createdAt"`
}

// --- Migration helpers ---

func AutoMigrate(db *gorm.DB) error {
	return db.AutoMigrate(
		&User{}, &Role{}, &Permission{}, &RefreshToken{},
		&Category{}, &Tag{},
		&Blog{}, &BlogComment{},
		&Resource{}, &ResourceFile{}, &ResourceVersion{},
		&Notice{}, &NoticeRead{},
		&OperationLog{}, &SystemSetting{},
		&DownloadRecord{}, &Favorite{},
	)
}
