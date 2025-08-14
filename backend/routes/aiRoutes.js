import express from 'express';
import { generateQuizFromPDF, askAI } from '../controllers/aiController.js';
import { verifyToken } from '../middleware/auth.js';

const aiRouter = express.Router();

aiRouter.post('/generate-quiz', verifyToken, generateQuizFromPDF);
aiRouter.post('/ask-question', verifyToken, askAI);

export default aiRouter;


/**
 * @swagger
 * tags:
 *   name: AI
 *   description: Endpoints for AI quiz generation and Q&A
 */

/**
 * @swagger
 * /ai/generate-quiz:
 *   post:
 *     summary: Generate a quiz from a PDF
 *     tags: [AI]
 *     requestBody:
 *       required: true
 *       content:
 *         multipart/form-data:
 *           schema:
 *             type: object
 *             properties:
 *               file:
 *                 type: string
 *                 format: binary
 *                 description: PDF file to generate quiz from
 *     responses:
 *       200:
 *         description: Quiz generated successfully
 *         content:
 *           application/json:
 *             example:
 *               quizId: "64bbcc223344"
 *               title: "Generated Math Quiz"
 *               questions:
 *                 - question: "What is 2+2?"
 *                   options: ["2", "3", "4", "5"]
 *                   answer: "4"
 */
aiRouter.post('/generate-quiz', verifyToken, generateQuizFromPDF);

/**
 * @swagger
 * /ai/ask-question:
 *   post:
 *     summary: Ask a question to the AI
 *     tags: [AI]
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - question
 *             properties:
 *               question:
 *                 type: string
 *                 description: The question you want to ask the AI
 *             example:
 *               question: "Explain Newton's laws in simple terms."
 *     responses:
 *       200:
 *         description: AI response
 *         content:
 *           application/json:
 *             example:
 *               answer: "Newton's laws describe how objects move..."
 */
aiRouter.post('/ask-question', verifyToken, askAI);
