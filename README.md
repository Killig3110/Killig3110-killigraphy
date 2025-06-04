
# Killigraphy

**Killigraphy** is a modern social networking platform that allows users to upload, share, comment, and save posts in image format with interactive features such as following, liking, commenting, and saving favorite posts.

![Killigraphy Logo](/killigraphy/public/assets/images/lo_go_remove_bg.png)

## 🌟 Key Features

- Create posts with images, captions, locations, and tags
- Like and comment on posts
- Save favorite posts
- Manage user profiles (Edit profile, change avatar)
- Follow / Unfollow other users
- Personalized post recommendations based on user activity
- OTP email system for secure password changes
- Responsive UI with Dark mode support

## 🛠️ Technology Stack

### Frontend

- **React.js**, **TypeScript**
- **Tailwind CSS** for modern UI
- **React Query** for API state management
- **Vite** for fast frontend build and development

### Backend

- **Node.js** + **Express.js**
- **MongoDB** with **Mongoose** ORM
- **Redis** for caching and recommendations
- **JWT** for user authentication
- **ImageKit.io** for image storage and optimization
- **Nodemailer** for sending OTP emails

### Deployment

- **Docker**, **Docker Compose** for containerization
- **Nginx** as reverse proxy for frontend/backend

## 📁 Project Structure

```bash
killigraphy/
├── killigchat/             # Mini demo project (not the main project)
├── killigraphy/            # Main Frontend (React + Tailwind)
├── killigraphy_back_end/   # Main Backend (Express.js + MongoDB)
├── docker-compose.yml      # Docker Compose setup
├── SECURITY.md
└── README.md
```

### Frontend (killigraphy/)

- `src/_auth/` Authentication pages: Sign-in, Sign-up
- `src/_root/` Main pages: Home, Explore, Profile, Saved
- `src/components/` Shared components: PostCard, CommentInput, etc.
- `src/context/` Authentication context
- `src/hooks/` Custom hooks like `useDebounce`, `useToast`
- `src/lib/` API layer and React Query setup
- `src/constants/` Constants like routes and sidebar links

### Backend (killigraphy_back_end/)

- `src/controllers/` Controllers for handling HTTP requests
- `src/services/` Business logic services
- `src/repositories/` Database access (MongoDB)
- `src/models/` Mongoose models: User, Post, Comment, Save
- `src/utils/` Utility functions: password hashing, email sending, image uploading
- `src/middleware/` Middleware for auth and file uploads
- `src/strategies/` Strategy Pattern for feed and updates
- `src/factories/` Factory Pattern for User, Post, Comment creation

## 🚀 Getting Started

### Setup Environment

```bash
git clone https://github.com/Killig3110/Killig3110-killigraphy.git
cd killigraphy
```

1. **Create `.env` file for backend (`killigraphy_back_end/.env`)**

```env
PORT=5000
MONGO_URI=your_mongo_db_uri
REDIS_URL=your_redis_url
JWT_SECRET=your_jwt_secret
EMAIL_USER=your_email@example.com
EMAIL_PASS=your_email_password
IMAGEKIT_PUBLIC_KEY=your_imagekit_public_key
IMAGEKIT_PRIVATE_KEY=your_imagekit_private_key
IMAGEKIT_URL_ENDPOINT=your_imagekit_url
```

2. **Run with Docker Compose**

```bash
docker-compose up --build
```

- Frontend: `http://localhost`
- Backend: `http://localhost:5000`

### Run locally (without Docker)

**Frontend**

```bash
cd killigraphy
npm install
npm run dev
```

**Backend**

```bash
cd killigraphy_back_end
npm install
npm run dev
```

## ⚡ Sample UI

| Home Page        | Explore Page    | Profile Page     |
|------------------|-----------------|------------------|
| ![Home](https://github.com/user-attachments/assets/4ca25c63-e017-4cc9-88e2-bf1a269fe2eb) | ![Explore](https://github.com/user-attachments/assets/7066e663-66d5-476d-b561-69dec50a8f0f)| ![Profile](https://github.com/user-attachments/assets/17a05432-2e5c-44d0-9e63-a09b8077af64)|

## 📚 Additional Technologies

- **Zod**: Schema validation for forms
- **React Hook Form**: Efficient form management
- **Lucide React**: Beautiful icon library
- **ImageKit**: Fast image storage and resizing
- **Nodemailer**: Email service for OTPs
- **Cropper.js**: Avatar image cropping
- **Shadcn UI**: Beautiful and customizable UI components

## 🧩 Design Patterns

- **MVC Pattern**: Separation of Controller - Service - Repository
- **Factory Pattern**: Create User, Post, Comment entities
- **Strategy Pattern**: Personalized Feed and Update Strategies
- **Adapter Pattern**: ImageKit and Redis integration
- **Singleton Pattern**: Singleton instances for Redis and ImageKit clients

## 🛡️ Security

- JWT Authentication for session security
- OTP Email verification for password changes
- Safe file uploads (MIME type checking)
- Redis caching for optimized recommendation queries

## 📚 About the Author

Hi, I'm [Killig3110]! 👋

- 🌱 I’m passionate about full-stack development, especially in building scalable social media platforms.
- 🛠️ Main Tech Stack: Node.js, React, TypeScript, MongoDB, Redis, Docker.
- 📫 Reach me at: your.email@example.com
- 🔗 Connect with me: [LinkedIn](https://www.linkedin.com/in/killig3110/) | [GitHub]9https://github.com/Killig3110)

Feel free to reach out if you have any questions or want to collaborate!
