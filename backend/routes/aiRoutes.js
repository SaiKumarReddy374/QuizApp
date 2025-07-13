import express from 'express';
import { generateQuizFromPDF, askAI } from '../controllers/aiController.js';
import { verifyToken } from '../middleware/auth.js';

const aiRouter = express.Router();

aiRouter.post('/generate-quiz', verifyToken, generateQuizFromPDF);
aiRouter.post('/ask-question', verifyToken, askAI);

export default aiRouter;