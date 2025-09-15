### YouTube Clone (React + Vite + Express + MongoDB)

This project is a simplified YouTube clone featuring a video player page with full comment CRUD, channel management, authentication, and basic like/dislike stats. The frontend is built with React (Vite) and Tailwind CSS, and the backend is an Express API with MongoDB via Mongoose.

### Features
- Authentication: Register, Login, persisted session
- Channels: Create channel with name and description
- Video Player: Custom controls, keyboard shortcuts, related videos
- Comments: Create, Read, Update, Delete directly on the video page
- Reactions: Like/Dislike counters per video (simple aggregate)

### Tech Stack
- Frontend: React 19, Vite, React Router, Tailwind CSS
- Backend: Node.js, Express, JSON Web Tokens (JWT)
- Database: MongoDB with Mongoose ODM

### Prerequisites
- Node.js 18+
- MongoDB running locally at `mongodb://localhost:27017`

### Project Structure
```
server/                Express API
  index.js             API entrypoint
  models/
    User.js            User model (auth + channel fields)
    Comment.js         Comment model
    VideoStat.js       Per-video like/dislike counters
src/                   React app (Vite)
  pages/               Route pages (Channel, VideoPage, etc.)
  Components/          UI components (VideoPlayer, VideoCard, ...)
  state/               Contexts (Auth, Search)
  lib/api.js           Axios instance with JWT interceptors
```

### Environment Variables
Backend supports an optional `JWT_SECRET` environment variable. Defaults to `dev_secret` if not set.

Windows PowerShell example:
```powershell
$env:JWT_SECRET = "your_secret_here"
```

### Install Dependencies
Run from the project root:
```powershell
npm install
```

### Start MongoDB
Ensure MongoDB is running locally. Default connection string used by the server:
```
mongodb://localhost:27017/youtubeBackend
```

### Run the Backend (Express API)
From the project root in PowerShell:
```powershell
node server/index.js
```
Expected output:
```
API on http://localhost:4000
MongoDB connection successful!
```

### Run the Frontend (Vite)
Open a second terminal at the project root:
```powershell
npm run dev
```
Vite will start at `http://localhost:5173`.

### Authentication Flow
1. Register or Login from the UI. The API returns a JWT saved to `localStorage`.
2. `src/lib/api.js` attaches the token to requests. On a 401 with "Invalid token", it clears storage and redirects to `/login`.

### Key API Endpoints
- Auth
  - `POST /api/auth/register` — { username, email, password }
  - `POST /api/auth/login` — { email, password }
- Me
  - `GET /api/me` — requires Authorization header
- Channel
  - `GET /api/channels` — requires Authorization header
  - `POST /api/channels` — { name, description } requires Authorization header
- Video stats
  - `GET /api/videos/:id/stats`
  - `POST /api/videos/:id/like`
  - `POST /api/videos/:id/dislike`
- Comments (Video Page)
  - `GET /api/videos/:id/comments`
  - `POST /api/videos/:id/comments` — { text } requires Authorization header
  - `PUT /api/videos/:id/comments/:cid` — { text } requires Authorization header (author only)
  - `DELETE /api/videos/:id/comments/:cid` — requires Authorization header (author only)

### Usage Notes
- Demo users are auto-seeded on first run: `admin@demo.com` (admin123), etc. See `server/index.js` for the list.
- Likes/Dislikes are aggregate counters only; no per-user prevention of multiple clicks.
- Comments enforce author-only edit/delete using the email in the JWT.

### Troubleshooting
- PowerShell commands: use `;` between commands instead of `&&`.
- If you see "Invalid token": your session likely expired. You’ll be redirected to `/login`. Sign in and retry.
- If the server can’t find packages, run `npm install` at the project root.

### Scripts
```json
{
  "dev": "vite",
  "build": "vite build",
  "preview": "vite preview"
}
```

### License
For educational use.
