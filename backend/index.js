import express from 'express';
import mongoose from 'mongoose';
import dotenv from 'dotenv';
import cors from 'cors';
import path from 'path';

import cookieParser from 'cookie-parser';
import authRoutes from './routes/authRoutes.js'; // Ensure the extension is `.js`

import studentRouter from './routes/studentRoutes.js';
import teacherRouter from './routes/teacherRoutes.js';

import { askAI } from './controllers/aiController.js';

dotenv.config();

const __dirname=path.resolve();

const app = express();
const PORT = process.env.PORT || 5000;

// Middleware

app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use(cookieParser());

app.use(cors({
  origin: ['http://localhost:5173', 'https://your-frontend.onrender.com'],
  credentials: true,
}));


app.post('/api/student/ask-ai', askAI);
// Routes
app.use('/api/auth', authRoutes);
app.use('/api/student', studentRouter); 
app.use('/api/teacher',teacherRouter);

// if(process.env.NODE_ENV==="production"){
//   app.use(express.static(path.join(__dirname,"../frontend/dist")));

//   app.get("*", (req, res) => {
//   res.sendFile(path.join(__dirname, "../frontend", "dist", "index.html"));
// });
// }

// MongoDB Connection
mongoose.connect(process.env.MONGO_URI)
  .then(() => {
    console.log('MongoDB connected');
    app.listen(PORT, () => {
      console.log(` Server running at http://localhost:${PORT}`);
    });
  })
  .catch((err) => {
    console.error(' MongoDB connection error:', err.message);
  });
