# AI 代码生成器 — 前端

**[English](README.md)**

配套 [AI Code Generator](https://github.com/lyu62873/ai-code-generator) 后端的 Web 界面：对话生成代码、实时预览、部署应用以及后台管理。

## 后端仓库

前端依赖 Spring Boot 提供的 API，请在后端仓库克隆并启动服务：

**[github.com/lyu62873/ai-code-generator](https://github.com/lyu62873/ai-code-generator)**

默认接口基地址见 `src/config/env.ts`：`http://localhost:8123/api`。

## 功能概览

### 普通用户

- 自然语言创建应用
- AI 对话（SSE 流式）与生成结果实时预览
- 管理、编辑、删除自己的应用；分页列表与搜索
- 部署应用；浏览精选应用
- 注册、登录与个人资料

### 管理员

- 应用管理：检索、编辑、删除、精选（优先级）
- 用户管理
- 对话 / 记录管理

## 技术栈

- Vue 3 + TypeScript
- Vite 7
- Ant Design Vue、Vue Router、Pinia
- Axios、Markdown-it、Highlight.js

## 目录结构

```
src/
├── api/                 # OpenAPI 生成的请求封装与类型
├── components/
├── config/              # env.ts（运行时）+ env.example.ts（说明）
├── layouts/
├── pages/
│   ├── app/             # 对话、编辑
│   ├── admin/           # 应用 / 用户 / 对话管理
│   └── user/            # 登录、注册、资料
├── router/
├── stores/
└── utils/
```

## 环境要求

- Node.js 22+（与 `@tsconfig/node22` 一致）
- npm
- 已启动的后端服务（见上文仓库链接）

## 本地开发

### 编辑器

[VS Code](https://code.visualstudio.com/) + [Vue — Official (Volar)](https://marketplace.visualstudio.com/items?itemName=Vue.volar)

### 安装与启动

```sh
npm install
npm run dev
```

开发环境下 Vite 将 `/api` 代理到 `http://localhost:8123`（见 `vite.config.ts`）。

### 环境变量

可在项目根目录添加可选配置，变量需以 `VITE_` 为前缀：

| 变量 | 说明 |
|------|------|
| `VITE_API_BASE_URL` | 后端 API 基地址 |
| `VITE_DEPLOY_DOMAIN` | 部署后对外访问的域名 |

详细说明见 [`src/config/env.example.ts`](src/config/env.example.ts)。

### 构建与预览

```sh
npm run build
npm run preview
```

### 其他命令

```sh
npm run lint
npm run openapi2ts   # 后端 OpenAPI 变更后重新生成 TS 类型
```

## 主要路由

| 路径 | 说明 |
|------|------|
| `/` | 首页、提示词、我的应用、精选 |
| `/app/chat/:id` | 对话、预览、部署 |
| `/app/edit/:id` | 编辑应用（所有者 / 管理员） |
| `/user/login`、`/user/register`、`/user/profile` | 账号相关 |
| `/admin/appManage`、`/admin/userManage`、`/admin/chatManage` | 管理后台 |

## 许可证

MIT。
