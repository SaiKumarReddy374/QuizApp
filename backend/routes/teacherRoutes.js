import express from 'express';
import {
  createBatch,
  createQuiz,
  getTeacherQuizzes,
  getTeacherDashboard,
  listTeacherBatches,
  getLeaderboard,
  getTeacherProfile,
} from '../controllers/teacherController.js';
// import { uploadAndGenerateQuiz,publishQuiz } from '../controllers/uploadAndGenerateQuiz.js';
import { verifyToken, requireRole } from '../middleware/auth.js';

const teacherRouter = express.Router();
import { uploadAndGenerateQuiz,publishQuiz ,uploadMiddleware} from '../controllers/uploadAndGenerateQuiz.js';

teacherRouter.get('/profile', verifyToken, requireRole('teacher'), getTeacherProfile);
teacherRouter.get('/dashboard', verifyToken, requireRole('teacher'), getTeacherDashboard);

teacherRouter.post('/batch/create', verifyToken, requireRole('teacher'), createBatch);
teacherRouter.get('/batches', verifyToken, requireRole('teacher'), listTeacherBatches); // optional

teacherRouter.get('/quizzes', verifyToken, requireRole('teacher'), getTeacherQuizzes);

teacherRouter.post('/create-batch', verifyToken, requireRole('teacher'), createBatch);
teacherRouter.post('/create-quiz', verifyToken, requireRole('teacher'), createQuiz);
teacherRouter.get('/quiz', verifyToken, requireRole('teacher'), getTeacherQuizzes);
teacherRouter.get('/leaderboard/:quizId', verifyToken, requireRole('teacher'), getLeaderboard);

teacherRouter.get('/leaderboard', verifyToken,requireRole('teacher'), getLeaderboard);

teacherRouter.post('/upload-and-generate',uploadMiddleware, uploadAndGenerateQuiz);
teacherRouter.post('/publish-quiz', verifyToken,requireRole('teacher'),publishQuiz);

export default teacherRouter;

