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


/**
 * @swagger
 * tags:
 *   name: Auth
 *   description: User authentication endpoints
 */

/**
 * @swagger
 * /auth/login:
 *   post:
 *     summary: Log in a user
 *     tags: [Auth]
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               email:
 *                 type: string
 *               password:
 *                 type: string
 *     responses:
 *       200:
 *         description: Login successful
 */
authRouter.post('/login', login);

/**
 * @swagger
 * /auth/register:
 *   post:
 *     summary: Register a new user
 *     tags: [Auth]
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               name:
 *                 type: string
 *               email:
 *                 type: string
 *               password:
 *                 type: string
 *               role:
 *                 type: string
 *                 enum: [student, teacher]
 *     responses:
 *       201:
 *         description: User registered successfully
 */
authRouter.post('/register', register);

/**
 * @swagger
 * /auth/logout:
 *   post:
 *     summary: Log out a user
 *     tags: [Auth]
 *     responses:
 *       200:
 *         description: Logged out successfully
 */
authRouter.post('/logout', logout);

/**
 * @swagger
 * /auth/check:
 *   get:
 *     summary: Check if the JWT token is valid
 *     tags: [Auth]
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: Token valid
 */
authRouter.get('/check', verifyToken, (req, res) => {
  res.status(200).json({ valid: true });
});
