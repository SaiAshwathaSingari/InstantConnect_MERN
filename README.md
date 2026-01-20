InstaConnect 📸
InstaConnect is a full-stack social media platform built using the MERN stack. It allows users to connect, share images via Cloudinary, and leverages a FastAPI service for backend processing.

Shutterstock

🛠 Setup Instructions
1. Server Setup (Backend)
Navigate to the server folder: cd server

Install dependencies: npm install

Create a .env file in the server directory.

Important: Do not use the default values. Create your own accounts and paste your credentials here:

Code snippet
MONGODB_URI=mongodb://127.0.0.1:27017/instaconnect
PORT=5000
JWT_SECRET=your_own_secret_key
VITE_FRONTEND_URL=http://localhost:5173

# Cloudinary Config (Get these from cloudinary.com)
CLOUDINAR_CLOUD_NAME='your_name'
CLOUDINARY_API_KEY='your_key'
CLOUDINARY_API_SECRET='your_secret'

# FastAPI Config
FASTAPI_URL=http://127.0.0.1:8000
FASTAPI_TIMEOUT=10000
2. Client Setup (Frontend)
Navigate to the client folder: cd client

Install dependencies: npm install

Create a .env file in the client directory.

Add the following line to point to your backend:

Code snippet
VITE_BACKEND_URL=http://localhost:5000
🚀 Running the Application
Start the Backend:

Bash
cd server
npm start
Start the Frontend:

Bash
cd client
npm run dev
Start FastAPI: Ensure your FastAPI server is running on port 8000.

📝 Features
User Auth: Secure JWT-based login.

Image Hosting: Cloudinary integration for fast image delivery.

FastAPI Integration: Connection to a specialized Python API.

Responsive UI: Built with React and modern CSS.
