# ResearchHub

科研知识管理平台 —— 面向课题组内网的现代化知识共享系统。

## 功能

- 📝 **科研博客** — Markdown 编辑器 + 代码高亮 + 评论 + 点赞收藏
- 📦 **资源中心** — 数据集 / 软件 / 模型管理，MD5/SHA256 校验，版本历史
- 🔔 **公告通知** — 分级公告系统，已读/未读追踪
- 🔍 **全文搜索** — 跨博客和资源的全局搜索
- 👤 **个人中心** — 收藏夹、下载历史
- 🛡️ **RBAC 权限** — 三层角色（管理员/编辑/用户），细粒度权限控制
- 🖥️ **后台管理** — 用户管理、角色管理、权限矩阵、操作日志、系统设置
- 📌 **置顶功能** — 管理员可置顶博客和资源

## 技术栈

| 层级 | 技术 |
|------|------|
| 前端 | Vue 3 + TypeScript + Vite + Element Plus + Pinia |
| 后端 | Go 1.22 + Gin + GORM + JWT |
| 数据库 | PostgreSQL 16 |
| 部署 | Docker + Docker Compose + Nginx |

## 快速开始

```bash
# 1. 构建前端
cd research-hub && npm install && npm run build && cd ..

# 2. 一键启动（前端 + 后端 + 数据库）
docker compose up -d

# 3. 打开浏览器
open http://localhost
```

**默认管理员账号：** `admin / 123456`

## 项目结构

```
Lab/
├── research-hub/          # Vue 3 前端
│   └── src/
│       ├── components/    # 通用组件 + Blog/Resource 组件
│       ├── views/         # 25 个页面视图
│       ├── stores/        # Pinia 状态管理
│       ├── router/        # 动态路由 + 权限守卫
│       ├── api/           # Axios 封装
│       ├── mock/          # 前端 Mock 数据
│       ├── types/         # TypeScript 类型定义
│       └── styles/        # SCSS Design Token
├── server/                # Go 后端
│   └── internal/
│       ├── model/         # 18 张表的 GORM 模型
│       ├── handler/       # 7 个业务 Handler（40+ API）
│       ├── middleware/     # JWT + RBAC + CORS + 日志
│       ├── database/      # 数据库连接 + 种子数据
│       └── router/        # 路由注册
├── nginx/                 # Nginx 配置（SPA + API 反代）
├── docker-compose.yml     # 三容器编排
├── DOCKER_DEPLOY.md       # 完整部署文档
└── README.md
```

## 文档

- [部署文档](DOCKER_DEPLOY.md) — Docker 部署、Nginx 配置、备份恢复、故障排查
