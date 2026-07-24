# 兰政鹏个人主页

我的个人主页，展示研究方向、发表论文、联系方式与个人作品。基于原生 HTML/CSS/JS 构建，后端使用 Cloudflare Pages Functions，数据存储在 Cloudflare KV。

## 在线预览

[https://lanzhengpeng.github.io](https://lanzhengpeng.github.io)

## 功能特性

- 响应式单页作品集
- 中英双语切换
- 深色 / 浅色主题切换
- 打字机效果标题
- 黑胶唱片机头像动画 + 背景音乐播放
- 蒲公英粒子背景 + 可互动的 Boids 鱼群效果
- 点赞按钮（每个 IP 每天限一次）
- 访客计数
- +1 计数器
- 个人作品展示页（`/works/`）
- WebRTC 局域网屏幕直播演示（`/works/webrtc-live/`）

## 技术栈

- 前端：原生 HTML5、CSS3、ES Modules
- 后端：Cloudflare Pages Functions
- 数据存储：Cloudflare KV
- 本地开发：Wrangler

## 项目结构

```
.
├── css/                  # 主页样式文件
├── files/                # 静态资源（PDF、音乐等）
├── functions/            # Cloudflare Pages Functions
│   ├── _middleware.js    # CORS 中间件
│   ├── like.js           # 点赞接口
│   ├── visitors.js       # 访客统计接口
│   ├── plus-one.js       # +1 接口
│   └── webrtc-signal/    # WebRTC 信令接口
├── images/               # 图片资源
├── js/                   # 主页脚本
├── works/                # 个人作品页
│   ├── index.html        # 作品列表
│   └── webrtc-live/      # WebRTC 直播演示
├── index.html            # 主页面
├── README.md             # 本文件
└── .gitignore            # git 忽略规则
```

## 本地开发

由于项目包含 Cloudflare Pages Functions，不能直接用 `file://` 协议打开 `index.html` 测试。请使用 Wrangler 在本地模拟 Cloudflare 环境。

**只需要启动一个服务：** Wrangler 会同时托管静态页面和云函数。

### 前置条件

- 安装 [Node.js](https://nodejs.org/)（LTS 版本）

### 启动本地服务器

在项目根目录运行：

```bash
npx wrangler pages dev . --kv=PORTFOLIO_KV --port=8080
```

首次运行会提示安装 Wrangler，按 `y` 确认即可。

启动后访问：http://localhost:8080

Wrangler 会自动处理：

- 静态资源服务
- `functions/` 目录中的云函数
- 本地 KV 命名空间 `PORTFOLIO_KV` 的模拟

修改 `functions/` 或静态文件后保存，Wrangler 会热重载，刷新浏览器即可看到最新效果。

## API 接口

| 方法 | 路径 | 说明 |
|------|------|------|
| GET | `/visitors` | 访客数 +1，返回最新计数 |
| GET | `/like` | 获取当前点赞数 |
| POST | `/like` | 点赞数 +1，返回最新计数 |
| GET | `/plus-one` | 获取当前 +1 计数 |
| POST | `/plus-one` | +1 计数 |
| POST | `/webrtc-signal/:room/:type` | WebRTC 信令：存储 offer/answer/ICE |
| GET | `/webrtc-signal/:room/:type` | WebRTC 信令：读取 offer/answer/ICE |

所有接口均通过 `functions/_middleware.js` 添加 CORS 响应头，允许前端跨域调用。

## 部署

本项目部署在 Cloudflare Pages 上，绑定 KV 命名空间 `PORTFOLIO_KV`：

1. 将代码推送到 GitHub
2. 在 Cloudflare Pages 创建项目并关联仓库
3. 进入项目设置 → Functions → KV namespace bindings
4. 添加绑定名称为 `PORTFOLIO_KV` 的 KV 命名空间

## License

MIT
