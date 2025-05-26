import express, { Response, NextFunction, Request } from 'express';
import mongoose from 'mongoose';
import dotenv from 'dotenv';
import cors from 'cors';
import cookieParser from 'cookie-parser';
import http from "http";

import authRoutes from './routes/auth';
import postsRouter from './routes/posts';
import savesRouter from './routes/saves';
import commentRouter from './routes/comments';
import usersRouter from './routes/users';
import chatsRouter from './routes/chats';
import messageRouter from './routes/messages';
import { initSocket } from "./socket";

const allowedOrigins = ['http://localhost', 'http://localhost:5173'];
dotenv.config();

const app = express();
const PORT = process.env.PORT || 5000;
const server = http.createServer(app);

// Initialize socket.io
const io = initSocket(server);
app.set("io", io);

// Middleware
app.use(cors({
    origin: function (origin, callback) {
        if (!origin || allowedOrigins.includes(origin)) {
            callback(null, true);
        } else {
            callback(new Error('Not allowed by CORS'));
        }
    },
    credentials: true
}));
app.use(express.json());
app.use(cookieParser());

// Routes
app.use('/api/auth', authRoutes);
app.use('/api/posts', postsRouter);
app.use('/api/saves', savesRouter);
app.use('/api/comments', commentRouter);
app.use('/api/users', usersRouter);
app.use('/api/chats', chatsRouter);
app.use('/api/messages', messageRouter);

// MongoDB connect
mongoose.connect(process.env.MONGODB_URI!)
    .then(() => {
        console.log('MongoDB connected');

        // Only call server.listen once here
        server.listen(PORT, () => {
            console.log(`Server running at http://localhost:${PORT}`);
        });
    })
    .catch((err) => {
        console.error('MongoDB connection error:', err);
    });

app.use((err: Error, req: Request, res: Response, next: NextFunction) => {
    console.error('Unhandled error:', err.stack);
    res.status(500).json({ message: 'Internal Server Error', error: err.message });
});