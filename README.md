# AI Customer Support Bot

A small full-stack AI-powered customer support chat application. It includes:

- A React + Vite front-end (TypeScript, Tailwind) with a chat UI, quick questions, session management, and a Past Conversations panel.
- An Express + TypeScript server that persists conversations in MongoDB and uses an LLM wrapper to generate assistant replies.

This README explains how the project is organized, how to run it locally, the API contract, and common troubleshooting.

---

## Table of contents

- [Features](#features)
- [Repository structure](#repository-structure)
- [Prerequisites](#prerequisites)
- [Environment variables](#environment-variables)
- [Install & run (dev)](#install--run-dev)
  - [Server](#server)
  - [Client](#client)
- [API reference](#api-reference)
  - [Auth](#auth)
  - [Session / Chat](#session--chat)
- [Front-end notes](#front-end-notes)
- [Persistence & Sessions](#persistence--sessions)
- [Troubleshooting](#troubleshooting)
- [Development notes & next steps](#development-notes--next-steps)
- [License](#license)

---

## Features

- Start new support sessions and continue previous conversations.
- Quick pre-canned question buttons.
- Server-backed sessions persisted to MongoDB when signed in.
- Local fallback sessions stored in `localStorage` if not signed in.
- Preview previous conversations in a popup before loading them into the chat.
- Simple auth (signup/login) with JWT.

## Repository structure

Top-level folders:

- `customer_support_ai_bot/` - front-end (Vite + React + TypeScript)
  - `src/` - React components, pages, API wrappers
  - `public/` - static assets
  - `package.json` - frontend scripts and deps
- `server/` - Express + TypeScript API
  - `src/` - server source: routes, db helpers, LLM wrapper
  - `package.json` - server scripts and deps

Open `customer_support_ai_bot/src/pages/SupportChat.tsx` for the chat UI implementation and `server/src/routes/session.route.ts` for the main chat endpoints.

## Prerequisites

- Node.js (recommended v18+)
- npm (comes with Node)
- MongoDB running locally or accessible via connection string

## Environment variables

Create `.env` files in the `server/` directory (and optionally in the client root for Vite). Important server env variables (used in `server/src/index.ts` and DB connection):

- `PORT` - port for the server (e.g. `3000`)
- `MONGO_URI` - MongoDB connection string (e.g. `mongodb://localhost:27017/support_bot`)
- `JWT_SECRET` - secret used to sign JWTs for authentication
- (Optional) `OPENAI_API_KEY` or other LLM keys if the LLM wrapper uses an external provider. Check `server/src/lib/llm.ts` for specifics.

If you run the front-end behind a different host/port, set `VITE_API_URL` in the front-end environment to point at the server base URL (example: `http://localhost:3000/api`).

## Install & run (dev)

Commands are written for Windows PowerShell. Adjust if you use another shell.

### Server

1. Open a terminal and go to the `server` folder:

```powershell
cd 'c:\Users\Asmi Vats\asmi\Projects\Customer Support Bot\server'
```

2. Install dependencies (if not already installed):

```powershell
npm install
```

3. Ensure you have a `.env` with `PORT`, `MONGO_URI`, and `JWT_SECRET`.

4. Start the server (development mode compiles TypeScript and runs the built code with nodemon):

```powershell
npm start
```

You should see `Server is listening on PORT: <port>` in the console.

### Client (frontend)

1. Open a new terminal and go to the front-end folder:

```powershell
cd 'c:\Users\Asmi Vats\asmi\Projects\Customer Support Bot\customer_support_ai_bot'
```

2. Install dependencies (if not already):

```powershell
npm install
```

3. Run the dev server (Vite):

```powershell
npm run dev
```

This will start the frontend (by default `http://localhost:5173`). The front-end expects the API at `http://localhost:3000/api` by default — set `VITE_API_URL` if your server runs elsewhere.

## API reference

All paths are prefixed by `/api` by default in the front-end client.

### Auth

- POST `/api/auth/signup`
  - Body: `{ username, email, password }`
  - Success: 201 `{ success: true, token, user: { id, username, email } }`
  - Stores JWT as a cookie (server side) and returns token in response. Front-end also stores `localStorage.token`.

- POST `/api/auth/login`
  - Body: `{ email, password }`
  - Success: 200 `{ success: true, token, user: { id, username, email } }`

The front-end SignIn/SignUp pages save `token` to `localStorage` and the client decodes the token to extract `userId` to pass to session creation.

### Session & Chat

- POST `/api/session/new`
  - Body: `{ userId }` (server expects userId currently)
  - Success: 201 `{ sessionId }`
  - Creates an empty conversation document referencing the user. If `userId` is missing, server returns 400.

- POST `/api/session/chat`
  - Body: `{ sessionId, message }`
  - Success: 200 `{ reply, escalation, raw }`
  - Appends the user's message to the conversation, calls the LLM with context, appends bot reply, and returns the reply.

- GET `/api/session/:id`
  - Returns saved conversation object with `messages` array (each message has `sender`, `text`, `timestamp`).

- POST `/api/session/:id/end`
  - Marks/concludes a conversation (current server implementation appends a '[Conversation ended]' bot message).

Notes: The server stores sessions in MongoDB (Mongoose) using `Conversation` model in `server/src/db/session.db.ts`.

## Front-end notes

- Key entrypoint: `customer_support_ai_bot/src/pages/SupportChat.tsx` — contains the chat UI, quick buttons, session creation and management logic.
- API wrapper: `customer_support_ai_bot/src/api/Session.ts` provides `createSession`, `sendMessage`, `getSession`, `endSession` using Axios.
- Sessions:
  - When signed-in, the client attempts to `createSession(userId)` so sessions are persisted server-side.
  - When not signed-in or server create fails, the client falls back to a local-only session (UUID) persisted in `localStorage` under `cs_sessions`.
- Past sessions list: Click a session to preview messages in a modal; load into the main chat with the modal's "Load into chat" button.

## Persistence & sessions

- Sessions created by server contain Mongo _id values and are `server: true` in the front-end session metadata. These sessions allow message persistence and server-side LLM replies.
- Local-only sessions are stored in `localStorage` and will not produce server LLM replies unless synced to a server-backed session.

## Troubleshooting

- 400 on `POST /api/session/new`: The server currently requires `userId` in the request body. Make sure you're signed in and `localStorage.token` is present, or pass the user ID from your auth flow.
- 400 / 500 on `POST /api/session/chat`: Ensure `sessionId` and `message` are included. If you send a locally-generated UUID as `sessionId` to the server, Mongoose will reject it (server requires an ObjectId for Mongo docs). The front-end now avoids sending local UUIDs to server endpoints.
- No assistant replies: Confirm server is running and `botFunction` in `server/src/lib/llm.ts` can connect to any configured LLM provider. Check server logs for errors.
- Tailwind CSS not applying: Ensure the front-end dev server restarted after CSS variable changes and the `tailwind` build step is running.

## Development notes & next steps

- Improve session sync: merge local sessions into server-backed sessions when the user signs in.
- Add a `GET /api/sessions` endpoint to list sessions for the authenticated user (server currently requires `userId` for creation but doesn't provide a list endpoint).
- Improve UX: confirm delete, session summaries, timestamps on session list.
- Add tests (unit + integration) for server routes and front-end components.

## License

This project currently has no explicit license. Add a `LICENSE` file if you plan to open-source it.

---

If you'd like, I can commit this README for you, or extend it with more detailed diagrams (architecture), environment examples, or a CONTRIBUTING guide. What would you like next?
