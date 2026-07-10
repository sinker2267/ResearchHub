<div align="center">
  <h1>ResearchHub · Docker 部署文档</h1>
  <p>科研知识管理平台 — 前端 (Vue 3) + 后端 (Go/Gin) + PostgreSQL</p>
</div>

---

## 目录

1. [架构概览](#架构概览)
2. [快速开始](#快速开始)
3. [生产部署](#生产部署)
4. [环境变量](#环境变量)
5. [数据持久化](#数据持久化)
6. [Nginx 反向代理](#nginx-反向代理)
7. [备份与恢复](#备份与恢复)
8. [常用运维命令](#常用运维命令)
9. [故障排查](#故障排查)

---

## 架构概览

```
┌─────────────────────────────────────────────────┐
│                   Nginx (:80)                    │
│         静态文件  │  /api/* 反向代理               │
└────────┬─────────┴──────────┬───────────────────┘
         │                    │
         ▼                    ▼
┌─────────────────┐  ┌─────────────────────────────┐
│  research-hub   │  │     researchhub-server      │
│   (Vue 3 SPA)   │  │    (Go/Gin REST API)        │
│   Nginx/Alpine  │  │       :8080                 │
└─────────────────┘  └────────────┬────────────────┘
                                  │
                                  ▼
                       ┌─────────────────────────┐
                       │    PostgreSQL 16         │
                       │       :5432              │
                       └─────────────────────────┘
```

### 组件说明

| 组件 | 技术栈 | 端口 | 说明 |
|------|--------|------|------|
| 前端 | Vue 3 + Vite + Element Plus | 80 (Nginx) | SPA 静态文件 |
| 后端 | Go 1.22 + Gin + GORM | 8080 | RESTful API |
| 数据库 | PostgreSQL 16 | 5432 | 关系型数据库 |

---

## 快速开始

### 前置条件

- Docker >= 24.0
- Docker Compose >= 2.20
- 至少 2 GB 可用内存

### 1. 克隆项目

```bash
git clone <your-repo-url> researchhub
cd researchhub
```

### 2. 构建前端

```bash
cd research-hub
npm install
npm run build        # 产物在 dist/ 目录
cd ..
```

### 3. 启动全部服务

```bash
docker compose up -d
```

这会启动三个容器：
- `researchhub-db` — PostgreSQL 16
- `researchhub-server` — Go API（自动迁移 + 种子数据）
- `researchhub-nginx` — Nginx（前端 + API 反向代理）

### 4. 验证部署

```bash
# 检查容器状态
docker compose ps

# 测试 API
curl http://localhost/api/auth/login \
  -H "Content-Type: application/json" \
  -d '{"username":"admin","password":"123456"}'

# 浏览器打开
open http://localhost
```

**默认账号：**

| 用户名 | 密码 | 角色 |
|--------|------|------|
| admin | 123456 | 系统管理员 |
| liming | 123456 | 普通用户 |
| wangfang | 123456 | 普通用户 |

---

## 生产部署

### 目录结构

```
researchhub/
├── research-hub/          # 前端项目
│   └── dist/              # npm run build 产物
├── server/                # 后端项目
│   ├── Dockerfile
│   └── ...
├── nginx/
│   └── nginx.conf         # Nginx 配置
├── docker-compose.yml     # 生产编排文件
├── .env.example           # 环境变量模板
└── DOCKER_DEPLOY.md       # 本文档
```

### 生产环境 checklist

1. **修改 JWT 密钥**

   ```bash
   # 生成随机密钥
   openssl rand -base64 64
   ```

   将输出填入 `.env` 文件的 `JWT_SECRET`。

2. **修改数据库密码**

   `.env` 中修改 `POSTGRES_PASSWORD` 和 `DATABASE_URL`。

3. **修改默认用户密码**

   首次启动后立即登录 admin 账户，通过后台用户管理修改密码。

4. **配置 CORS**

   `CORS_ORIGINS` 设置为实际域名，例如：
   ```
   CORS_ORIGINS=https://researchhub.example.com
   ```

5. **关闭注册（可选）**

   登录 admin → 后台管理 → 系统设置 → `allow_registration` 改为 `false`。

### 使用 .env 文件

```bash
# 复制模板
cp .env.example .env

# 编辑配置
vim .env

# 启动
docker compose --env-file .env up -d
```

---

## 环境变量

### 完整变量列表

| 变量 | 默认值 | 说明 |
|------|--------|------|
| `SERVER_PORT` | `8080` | 后端服务端口 |
| `DATABASE_URL` | `postgres://researchhub:researchhub@db:5432/researchhub?sslmode=disable` | PG 连接串 |
| `JWT_SECRET` | `researchhub-dev-secret-change-in-production` | JWT 签名密钥 |
| `CORS_ORIGINS` | `http://localhost:5173,http://localhost:3000,http://localhost` | 允许的跨域来源 |
| `UPLOAD_DIR` | `/app/uploads` | 文件上传目录 |
| `POSTGRES_DB` | `researchhub` | 数据库名称 |
| `POSTGRES_USER` | `researchhub` | 数据库用户 |
| `POSTGRES_PASSWORD` | `researchhub` | 数据库密码 |

---

## 数据持久化

`docker compose` 配置了两个 Docker Volume：

| Volume | 挂载点 | 内容 |
|--------|--------|------|
| `pgdata` | `/var/lib/postgresql/data` | 数据库文件 |
| `uploads` | `/app/uploads` | 用户上传的文件 |

### 查看 Volume

```bash
docker volume ls | grep researchhub
```

### 数据位置（macOS/Linux）

```bash
docker volume inspect researchhub_pgdata
```

---

## Nginx 反向代理

### 推荐架构

```
客户端 → Nginx (:80/443) → 前端静态文件
                          → /api/* → Go 后端 (:8080)
```

### Nginx 配置（`nginx/nginx.conf`）

```nginx
server {
    listen 80;
    server_name researchhub.example.com;
    client_max_body_size 500M;

    # 前端静态文件
    location / {
        root /usr/share/nginx/html;
        try_files $uri $uri/ /index.html;
        expires 7d;
        add_header Cache-Control "public, immutable";
    }

    # API 反向代理
    location /api {
        proxy_pass http://researchhub-server:8080;
        proxy_set_header Host $host;
        proxy_set_header X-Real-IP $remote_addr;
        proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
        proxy_set_header X-Forwarded-Proto $scheme;
        proxy_read_timeout 300s;
    }

    # 上传文件代理
    location /uploads {
        proxy_pass http://researchhub-server:8080;
    }
}
```

### 添加 HTTPS（Let's Encrypt）

```bash
docker compose -f docker-compose.yml -f docker-compose.ssl.yml up -d
```

`docker-compose.ssl.yml`：

```yaml
services:
  nginx:
    ports:
      - "80:80"
      - "443:443"
    volumes:
      - ./nginx/ssl:/etc/nginx/ssl
      - ./certbot/www:/var/www/certbot

  certbot:
    image: certbot/certbot
    volumes:
      - ./certbot/www:/var/www/certbot
      - ./certbot/conf:/etc/letsencrypt
```

---

## 备份与恢复

### 备份数据库

```bash
# 创建备份
docker exec researchhub-db pg_dump -U researchhub researchhub > backup_$(date +%Y%m%d).sql

# 压缩
gzip backup_$(date +%Y%m%d).sql
```

### 恢复数据库

```bash
# 解压（如果是压缩文件）
gunzip backup_20260710.sql.gz

# 恢复
docker exec -i researchhub-db psql -U researchhub researchhub < backup_20260710.sql
```

### 备份上传文件

```bash
docker cp researchhub-server:/app/uploads ./uploads_backup
```

### 定时备份脚本

```bash
#!/bin/bash
# /etc/cron.daily/researchhub-backup

BACKUP_DIR=/var/backups/researchhub
mkdir -p $BACKUP_DIR

docker exec researchhub-db pg_dump -U researchhub researchhub | gzip > $BACKUP_DIR/db_$(date +%Y%m%d).sql.gz
docker cp researchhub-server:/app/uploads $BACKUP_DIR/uploads_$(date +%Y%m%d)

# 保留最近 30 天
find $BACKUP_DIR -mtime +30 -delete
```

---

## 常用运维命令

```bash
# 查看所有容器状态
docker compose ps

# 查看后端日志
docker compose logs -f server

# 查看数据库日志
docker compose logs -f db

# 重启单个服务
docker compose restart server

# 重启全部服务
docker compose restart

# 停止全部服务
docker compose down

# 停止并删除数据卷（危险！）
docker compose down -v

# 更新镜像并重启
docker compose pull
docker compose up -d --build

# 进入后端容器调试
docker compose exec server sh

# 进入数据库
docker compose exec db psql -U researchhub researchhub

# 查看资源使用
docker stats
```

---

## 故障排查

### 后端启动失败

```bash
# 查看详细日志
docker compose logs server

# 常见原因：
# 1. 数据库未就绪 — 等待 db 健康检查通过
# 2. 端口被占用 — 修改 SERVER_PORT
# 3. JWT_SECRET 包含特殊字符 — 用引号包裹
```

### 数据库连接失败

```bash
# 检查数据库是否运行
docker compose ps db

# 测试连接
docker compose exec server sh -c "nc -z db 5432 && echo OK || echo FAIL"

# 检查 DATABASE_URL 格式
# 容器内使用: postgres://researchhub:password@db:5432/researchhub?sslmode=disable
# 宿主机使用: postgres://researchhub:password@localhost:5432/researchhub?sslmode=disable
```

### 前端 404 刷新

确保 Nginx 配置包含：
```nginx
try_files $uri $uri/ /index.html;
```

### 文件上传失败

```bash
# 检查 uploads 目录权限
docker compose exec server ls -la /app/uploads

# 检查上传目录挂载
docker compose exec server df -h /app/uploads
```

### 重置所有数据

```bash
# 完全清除并重建
docker compose down -v
docker compose up -d
```

---

## 性能建议

1. **前端 CDN**：将 `dist/` 部署到 CDN（如阿里云 OSS + CDN），Nginx 只代理 API
2. **数据库连接池**：`server/internal/database/database.go` 中调整 `MaxIdleConns` / `MaxOpenConns`
3. **日志级别**：生产环境将 GORM 日志级别从 `Info` 改为 `Warn`
4. **静态资源缓存**：Nginx 中为 `.js`、`.css`、`.png` 等设置长期缓存

---

## 升级指南

```bash
# 1. 拉取最新代码
git pull origin main

# 2. 构建前端
cd research-hub && npm install && npm run build && cd ..

# 3. 重新构建并启动
docker compose up -d --build

# 4. 检查日志
docker compose logs -f --tail=50
```

---

## 支持

项目地址：ResearchHub  
技术栈：Vue 3 · Go/Gin · PostgreSQL · Docker
