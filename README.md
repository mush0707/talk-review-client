# Talk Review Client (Frontend)

Vue 3 + Vite + TypeScript + Pinia + vue-i18n + Laravel Echo (Pusher protocol) for Reverb realtime notifications.

## Requirements
- Node.js 18+ (recommended)
- npm / pnpm / yarn (pick one)

## Setup
From the **frontend repo root**:

1) Install dependencies
```bash
npm install
```

2) Create `.env`
```dotenv
VITE_API_BASE_URL=http://localhost:8080

# Reverb uses the Pusher protocol, so we keep VITE_PUSHER_* vars.
VITE_PUSHER_APP_ID=talkreview
VITE_PUSHER_APP_KEY=localkey123
VITE_PUSHER_HOST=localhost
VITE_PUSHER_PORT=6001
VITE_PUSHER_TLS=false
```

3) Run dev server
```bash
npm run dev
```

Open:
- http://localhost:5173

## Realtime notifications (Reverb)
The frontend connects through `laravel-echo` + `pusher-js` to:
- `ws://localhost:6001/app/<VITE_PUSHER_APP_KEY>`

Private channel auth goes to backend:
- `POST http://localhost:8080/broadcasting/auth`

Make sure:
- You are logged in (bearer token exists)
- Backend CORS allows `http://localhost:5173`
- Reverb allows origin `http://localhost:5173`

## Useful scripts
```bash
npm run dev
npm run build
npm run preview
npm run lint   # if configured
```

## Common troubleshooting
### Echo connects, but you get 403 on /broadcasting/auth
- Confirm your HTTP client attaches `Authorization: Bearer <token>` (not cookie).
- Confirm backend middleware is `auth:sanctum` for broadcasting routes.
- Confirm backend CORS includes `/broadcasting/auth`.

### No notifications appear
- Ensure you call `initEcho(pinia)` once (usually right after creating Pinia), then call `notificationsStore.connectIfConfigured()`.
- Verify you are subscribed to the correct channel:
    - `private-App.Models.User.<id>`
- Verify backend is actually sending notifications to the correct notifiable users.

## Backend dependency
You need the backend running (Docker recommended):
- API: http://localhost:8080
- Reverb: ws://localhost:6001
