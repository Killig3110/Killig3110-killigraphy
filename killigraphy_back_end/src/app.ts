import express from 'express';
import mongoose from 'mongoose';
import dotenv from 'dotenv';
import cors from 'cors';
import cookieParser from 'cookie-parser';
import authRoutes from './routes/auth';
import postsRouter from './routes/posts';
import savesRouter from './routes/saves';
import commentRouter from './routes/comments';

dotenv.config();

const app = express();
const PORT = process.env.PORT || 5000;

// Middleware
app.use(cors({
    origin: 'http://localhost',  //frontend domain
    credentials: true,           // enable cookie sending
}));
app.use(express.json());
app.use(cookieParser());

// Routes
app.use('/api/auth', authRoutes);
app.use('/api/posts', postsRouter);
app.use('/api/saves', savesRouter);
app.use('/api/comments', commentRouter);

// MongoDB connect
mongoose.connect(process.env.MONGODB_URI!)
    .then(() => {
        console.log('MongoDB connected');
        app.listen(PORT, () => {
            console.log(`Server running at http://localhost:${PORT}`);
        });
    })
    .catch((err) => {
        console.error('MongoDB connection error:', err);
    });
