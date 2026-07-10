# ResearchHub 后端部署文档

## 技术栈

| 组件 | 技术 |
|------|------|
| 语言 | Go 1.22 |
| Web 框架 | Gin |
| ORM | GORM |
| 数据库 | PostgreSQL 16 |
| 认证 | JWT (RS256) |
| 部署 | Docker + Docker Compose |

## 快速开始

### 前置要求

- Docker & Docker Compose >= 2.0
- （本地开发）Go >= 1.22

### 1. 使用 Docker Compose 部署（推荐）

```bash
cd server
docker compose up -d
```

这会启动两个容器：
- `researchhub-db` — PostgreSQL 16，端口 5432
- `researchhub-server` — Go API 服务器，端口 8080

数据库启动后会自动执行 Migration 和 Seed，创建默认用户。

### 2. 本地开发

```bash
# 确保本地 PostgreSQL 正在运行
createdb researchhub

# 安装依赖
go mod tidy

# 运行
DATABASE_URL="postgres://localhost:5432/researchhub?sslmode=disable" go run ./cmd/server
```

### 3. 验证部署

```bash
# 健康检查
curl http://localhost:8080/api/auth/login \
  -H "Content-Type: application/json" \
  -d '{"username":"admin","password":"123456"}'
```

预期返回：
```json
{
  "code": 0,
  "data": {
    "accessToken": "eyJ...",
    "refreshToken": "...",
    "userInfo": { "username": "admin", ... }
  }
}
```

## 默认用户

| 用户名 | 密码 | 角色 |
|--------|------|------|
| admin | 123456 | 系统管理员（所有权限） |
| liming | 123456 | 普通用户（查看、下载） |
| wangfang | 123456 | 普通用户（查看、下载） |

**生产环境请立即修改默认密码！**

## 环境变量

| 变量 | 默认值 | 说明 |
|------|--------|------|
| `SERVER_PORT` | `8080` | 服务端口 |
| `DATABASE_URL` | `postgres://researchhub:researchhub@localhost:5432/researchhub?sslmode=disable` | PostgreSQL 连接串 |
| `JWT_SECRET` | `researchhub-dev-secret-change-in-production` | JWT 签名密钥（生产环境必须修改） |
| `CORS_ORIGINS` | `http://localhost:5173,http://localhost:3000` | 允许的前端来源（逗号分隔） |
| `UPLOAD_DIR` | `./uploads` | 文件上传目录 |

## 前端配置

前端 `research-hub` 项目需要配置 API 地址。在 `research-hub` 目录创建 `.env` 文件：

```
VITE_API_BASE_URL=http://localhost:8080/api
```

如果前后端在同一台服务器上，可以使用 Nginx 反向代理：

```nginx
server {
    listen 80;
    server_name researchhub.example.com;

    # 前端静态文件
    location / {
        root /path/to/research-hub/dist;
        try_files $uri $uri/ /index.html;
    }

    # API 反向代理
    location /api {
        proxy_pass http://127.0.0.1:8080;
        proxy_set_header Host $host;
        proxy_set_header X-Real-IP $remote_addr;
    }
}
```

## 项目结构

```
server/
├── cmd/server/main.go          # 入口
├── internal/
│   ├── config/config.go        # 配置加载
│   ├── database/
│   │   ├── database.go         # 数据库连接 + 自动迁移
│   │   └── seed.go             # 种子数据（用户/角色/权限）
│   ├── handler/
│   │   ├── common.go           # 响应工具 + 分页
│   │   ├── auth.go             # 登录/登出/刷新令牌
│   │   ├── blog.go             # 博客 CRUD + 点赞/收藏/评论
│   │   ├── resource.go         # 资源 CRUD + 分类/标签
│   │   ├── notice.go           # 通知 CRUD + 已读
│   │   ├── user.go             # 个人中心/收藏/下载历史
│   │   └── admin.go            # 后台管理（用户/角色/权限/日志/设置）
│   ├── middleware/
│   │   ├── auth.go             # JWT 认证 + 令牌生成
│   │   └── rbac.go             # RBAC 权限校验 + CORS + 操作日志
│   ├── model/models.go         # 全部 GORM 模型（18 张表）
│   └── router/router.go        # 路由注册（40+ 端点）
├── Dockerfile
├── docker-compose.yml
└── DEPLOY.md                   # 本文档
```

## API 端点总览

### 认证 (Public)
- `POST /api/auth/login`
- `POST /api/auth/refresh`

### 认证 (Protected)
- `POST /api/auth/logout`

### 博客
- `GET /api/blogs` — 列表（分页/分类/标签/关键词/排序）
- `GET /api/blogs/:id` — 详情
- `POST /api/blogs` — 创建 (need: blog:create)
- `PUT /api/blogs/:id` — 更新 (need: blog:edit)
- `DELETE /api/blogs/:id` — 删除 (need: blog:delete)
- `POST /api/blogs/:id/like` — 切换点赞
- `POST /api/blogs/:id/favorite` — 切换收藏
- `GET /api/blogs/:id/comments` — 评论列表
- `POST /api/blogs/:id/comments` — 发表评论
- `GET /api/blogs/:id/recommendations` — 相关推荐

### 资源
- `GET /api/resources` — 列表
- `GET /api/resources/:id` — 详情
- `POST /api/resources` — 创建 (need: resource:create)
- `PUT /api/resources/:id` — 更新 (need: resource:edit)
- `DELETE /api/resources/:id` — 删除 (need: resource:delete)
- `GET /api/resources/categories` — 全部分类
- `GET /api/resources/tags` — 全部标签

### 通知
- `GET /api/notices` — 列表
- `POST /api/notices` — 创建 (need: notice:create)
- `GET /api/notices/unread-count` — 未读数
- `PUT /api/notices/:id/read` — 标记已读
- `PUT /api/notices/read-all` — 全部已读

### 用户
- `GET /api/user/profile` — 个人信息
- `PUT /api/user/profile` — 更新个人信息
- `GET /api/user/favorites` — 收藏列表
- `GET /api/user/downloads` — 下载历史

### 后台管理 (need: admin:access)
- `GET /api/admin/dashboard` — 统计概览
- `GET /api/admin/users` — 用户列表
- `POST /api/admin/users` — 创建用户
- `PUT /api/admin/users/:id` — 更新用户
- `DELETE /api/admin/users/:id` — 删除用户
- `GET /api/admin/roles` — 角色列表
- `POST /api/admin/roles` — 创建角色
- `PUT /api/admin/roles/:id` — 更新角色
- `DELETE /api/admin/roles/:id` — 删除角色
- `GET /api/admin/permissions` — 权限列表
- `GET /api/admin/logs` — 操作日志
- `GET /api/admin/settings` — 系统设置
- `PUT /api/admin/settings` — 更新系统设置
