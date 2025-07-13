import express from 'express';
import jwt from 'jsonwebtoken'
import { login, register, logout } from '../controllers/authController.js';
import { verifyToken } from '../middleware/auth.js';

const authRouter = express.Router();

authRouter.post('/login', login);
authRouter.post('/register', register);
authRouter.post('/logout', logout);

// routes/authRoutes.js
authRouter.get('/check', verifyToken, (req, res) => {
  res.status(200).json({ valid: true });
});


export default authRouter;