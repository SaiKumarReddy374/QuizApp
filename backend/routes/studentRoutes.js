import express from 'express';
import {
  joinBatch,
  submitQuiz,
  getStudentResult,
  getStudentProfile,
  getAllBatches,
  getQuizzesByBatch,
  getStudentQuizById,
  getAllResultsForStudent,
  getStudentStats,
  getStudentQuizCounts,
  leaveBatch,
  getActiveQuizzesForStudent,
} from '../controllers/studentController.js';
import { verifyToken, requireRole } from '../middleware/auth.js';

const studentRouter = express.Router();

studentRouter.get('/profile', verifyToken, requireRole('student'), getStudentProfile);

studentRouter.post('/submit', verifyToken, requireRole('student'), submitQuiz);
studentRouter.get('/result/:quizId', verifyToken, getStudentResult);

studentRouter.get('/my-results', verifyToken, getAllResultsForStudent);

studentRouter.get('/batches', verifyToken, requireRole('student'), getAllBatches);
studentRouter.post('/join-batch', verifyToken, requireRole('student'), joinBatch);
studentRouter.get('/quiz/:quizId', verifyToken, getStudentQuizById);

studentRouter.get('/stats', verifyToken, requireRole('student'), getStudentStats);

// ✅ This is the one your frontend is calling:
studentRouter.get('/batch/:batchId/quizzes', verifyToken, requireRole('student'), getQuizzesByBatch);

studentRouter.get('/quiz-counts', verifyToken, getStudentQuizCounts);

studentRouter.delete('/leave-batch/:batchId',verifyToken,requireRole('student'),leaveBatch);

studentRouter.get('/active-quizzes', verifyToken, requireRole('student'), getActiveQuizzesForStudent);

export default studentRouter;
