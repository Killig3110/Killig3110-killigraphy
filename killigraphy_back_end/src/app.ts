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
import cron from 'node-cron';
import { refreshSuggestionsForAllUsers } from './cron/refreshSuggestions';
import { seed } from './utils/seed';

const allowedOrigins = ['http://localhost', 'http://localhost:80', 'http://localhost:5173'];
dotenv.config();

const app = express();
const PORT = process.env.PORT || 8085;
const server = http.createServer(app);

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

cron.schedule('*/10 * * * *', () => {
    console.log("Running suggestion refresh job...");
    refreshSuggestionsForAllUsers().catch(console.error);
});

// Routes
app.use('/api/auth', authRoutes);
app.use('/api/posts', postsRouter);
app.use('/api/saves', savesRouter);
app.use('/api/comments', commentRouter);
app.use('/api/users', usersRouter);

// MongoDB connect
mongoose.connect(process.env.MONGODB_URI!)
    .then(async () => {
        console.log('MongoDB connected');

        // Seed the database if` needed
        await seed();

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