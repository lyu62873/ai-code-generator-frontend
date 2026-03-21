# AI Code Generator — Frontend

**[简体中文](README.zh-CN.md)**

Web client for the [AI Code Generator](https://github.com/lyu62873/ai-code-generator) backend: chat-driven code generation, live preview, deploy, and app administration.

## Backend

This UI expects the Spring Boot API. Clone and run the server from:

**[github.com/lyu62873/ai-code-generator](https://github.com/lyu62873/ai-code-generator)**

Default API base (see `src/config/env.ts`): `http://localhost:8123/api`.

## Features

### Users

- Create apps from a natural-language prompt
- AI chat with streaming (SSE) and real-time preview of generated output
- Manage, edit, and delete your apps; paginated lists with search
- Deploy generated apps; browse featured apps
- Registration, login, and profile

### Admins

- App management: search, edit, delete, feature (priority)
- User management
- Chat / history management

## Tech stack

- Vue 3 + TypeScript
- Vite 7
- Ant Design Vue, Vue Router, Pinia
- Axios, Markdown-it, Highlight.js

## Project structure

```
src/
├── api/                 # OpenAPI-generated clients + typings
├── components/
├── config/              # env.ts (runtime) + env.example.ts (reference)
├── layouts/
├── pages/
│   ├── app/             # Chat, edit
│   ├── admin/           # App / user / chat management
│   └── user/            # Login, register, profile
├── router/
├── stores/
└── utils/
```

## Prerequisites

- Node.js 22+ (matches `@tsconfig/node22`)
- npm
- Backend running (see link above)

## Setup

### IDE

[VS Code](https://code.visualstudio.com/) + [Vue — Official (Volar)](https://marketplace.visualstudio.com/items?itemName=Vue.volar)

### Install & run

```sh
npm install
npm run dev
```

Vite dev server proxies `/api` to `http://localhost:8123` (see `vite.config.ts`).

### Environment variables

Optional overrides (project root), prefix `VITE_`:

| Variable | Purpose |
|----------|---------|
| `VITE_API_BASE_URL` | API base URL |
| `VITE_DEPLOY_DOMAIN` | Public deploy domain for built apps |

See comments in [`src/config/env.example.ts`](src/config/env.example.ts).

### Build & preview

```sh
npm run build
npm run preview
```

### Other scripts

```sh
npm run lint
npm run openapi2ts   # regenerate API types when backend OpenAPI changes
```

## Main routes

| Path | Description |
|------|-------------|
| `/` | Home, prompt, my apps, featured |
| `/app/chat/:id` | Chat + preview + deploy |
| `/app/edit/:id` | Edit app (owner / admin) |
| `/user/login`, `/user/register`, `/user/profile` | Auth |
| `/admin/appManage`, `/admin/userManage`, `/admin/chatManage` | Admin |

## License

MIT.
