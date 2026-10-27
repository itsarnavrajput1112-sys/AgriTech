# AgriTech — MERN Smart Farming Platform

A starter full-stack project using MongoDB, Express, React, and Node.js. It includes JWT registration/login, protected farm and crop CRUD APIs, a dashboard, responsive styling, and an optional weather API integration.

## Requirements
- Node.js 18+ (recommended) and npm
- MongoDB Atlas account or local MongoDB
- Optional: OpenWeather API key for live weather

## 1. Configure the backend
Open `server/.env.example`, copy it to `server/.env`, and update:
- `MONGODB_URI`: paste your MongoDB Atlas connection string (replace `<password>` and URL-encode special characters in the password).
- `JWT_SECRET`: use a long random secret.
- `CLIENT_URL=http://localhost:5173`
- `OPENWEATHER_API_KEY` (optional)

In MongoDB Atlas, add your current IP under **Network Access** and create a database user under **Database Access**. Do not share `.env` or commit it to GitHub.

## 2. Install and run
From the project root:

```bash
npm install
npm run install:all
npm run dev
```

Frontend: http://localhost:5173  
Backend health check: http://localhost:5000/api/health

If dependencies install separately, run `npm install` in `server` and `client` folders.

## 3. Features
- Register and log in with bcrypt password hashing and JWT authentication
- Farmer profile basics
- Add, view, edit, and delete farm records
- Add, view, edit, and delete crop records
- Dashboard summary cards
- Optional live weather lookup by city
- Responsive UI and clear error messages

## 4. GitHub and demo links
Create a GitHub repository, then:
```bash
git init
git add .
git commit -m "Initial AgriTech MERN project"
git branch -M main
git remote add origin https://github.com/YOUR-USERNAME/YOUR-REPOSITORY.git
git push -u origin main
```
Deploy the server to Render/Railway and the client to Vercel/Netlify. Set environment variables on the hosting services and update the frontend `VITE_API_URL` to the deployed backend URL. Only add links to Skillwallet after you have actually deployed the app and pushed the code.

## Troubleshooting
- **MongoDB connection error:** verify URI, database password, IP access list, and database user permissions.
- **401 Unauthorized:** log in again; the JWT is stored in browser local storage for this starter.
- **Weather unavailable:** add a valid OpenWeather API key, or use the app without the weather feature.
- **Port in use:** change `PORT` in `server/.env` or stop the process using port 5000.

This is a learning/submission starter. Before production use, add stronger rate limiting, refresh-token strategy, email verification, tests, and deployment hardening.
