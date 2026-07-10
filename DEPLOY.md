# ResearchHub 部署文档

## 环境要求

- Docker >= 24.0 + Docker Compose >= 2.20
- Node.js >= 18（仅构建前端时使用）

---

## 步骤 1：拉取代码

```bash
git clone https://github.com/sinker2267/ResearchHub.git
cd ResearchHub
```

## 步骤 2：构建前端

```bash
cd research-hub
npm install
npm run build        # 产物在 dist-build/，自动复制为 dist/
cd ..
```

## 步骤 3：配置环境变量（可选）

```bash
cp .env.example .env
vim .env
```

| 变量 | 说明 |
|------|------|
| `POSTGRES_PASSWORD` | 数据库密码，默认 `researchhub` |
| `JWT_SECRET` | 用 `openssl rand -base64 64` 生成 |

不改也能跑，生产环境必须改。

## 步骤 4：启动

```bash
docker compose up -d
```

三个容器会依次启动：
- `researchhub-db` — PostgreSQL 16，端口 5432
- `researchhub-server` — Go API，端口 8080
- `researchhub-nginx` — Nginx，端口 80

## 步骤 5：验证

```bash
# 检查状态
docker compose ps
# 应看到 3 个容器都是 Up / healthy

# 测试登录
curl http://localhost/api/auth/login \
  -H "Content-Type: application/json" \
  -d '{"username":"admin","password":"123456"}'
```

浏览器打开 `http://<服务器IP>`，用 `admin / 123456` 登录。

---

## 默认账号

| 用户名 | 密码 | 角色 |
|--------|------|------|
| admin | 123456 | 管理员 |
| liming | 123456 | 普通用户 |
| wangfang | 123456 | 普通用户 |

---

## 更新部署

服务器上拉新代码后：

```bash
git pull
cd research-hub && npm run build && cd ..
docker compose build server --no-cache
docker compose up -d
```

---

## 常用运维

```bash
docker compose ps                    # 查看状态
docker compose logs -f server        # 后端日志
docker compose restart nginx         # 重启前端
docker compose down                  # 停止
docker compose up -d                 # 启动

# 备份数据库
docker exec researchhub-db pg_dump -U researchhub researchhub > backup.sql
```
