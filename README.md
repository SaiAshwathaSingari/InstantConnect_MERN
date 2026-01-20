# InstaConnect

A full-stack social-style application built with the MERN stack: MongoDB, Express, React (Vite), and Node.js.

---

## Requirements

- Node.js and npm or yarn  
- MongoDB (local or hosted)  
- Optional: Cloudinary account for image uploads  
- Optional: FastAPI or other microservice

---

## Environment Variables

Create **two `.env` files**: one for the server and one for the client.

### server/.env

```env
MONGODB_URI=mongodb://127.0.0.1:27017/instaconnect
PORT=5000
JWT_SECRET=your_jwt_secret
VITE_FRONTEND_URL=http://localhost:5173

CLOUDINARY_CLOUD_NAME=your_cloud_name
CLOUDINARY_API_KEY=your_api_key
CLOUDINARY_API_SECRET=your_api_secret

FASTAPI_URL=http://127.0.0.1:8000
FASTAPI_TIMEOUT=10000
client/.env
VITE_BACKEND_URL=http://localhost:5000
Installation & Running
Start MongoDB
Ensure MongoDB is running locally or update MONGODB_URI for a hosted database.

Run Server
cd server
npm install
npm run dev
Run Client
cd client
npm install
npm run dev
Frontend runs on http://localhost:5173 by default.

Project Structure
root/
├─ server/
│  ├─ controllers/
│  ├─ models/
│  ├─ routes/
│  ├─ middleware/
│  ├─ utils/
│  ├─ index.js / app.js
│  └─ .env
└─ client/
   ├─ src/
   ├─ public/
   ├─ vite.config.js
   └─ .env
Notes
Do not commit .env files

Add .env to .gitignore

Use environment variables in production hosting platforms

Update frontend/backend URLs if ports change

Optional .env.example
server/.env.example
MONGODB_URI=your_mongodb_uri
PORT=5000
JWT_SECRET=your_jwt_secret
VITE_FRONTEND_URL=http://localhost:5173
CLOUDINARY_CLOUD_NAME=your_cloud_name
CLOUDINARY_API_KEY=your_api_key
CLOUDINARY_API_SECRET=your_api_secret
FASTAPI_URL=http://127.0.0.1:8000
FASTAPI_TIMEOUT=10000
client/.env.example
VITE_BACKEND_URL=http://localhost:5000
