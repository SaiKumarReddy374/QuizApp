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

/**
 * @swagger
 * tags:
 *   name: Student
 *   description: Endpoints for student actions
 */

/**
 * @swagger
 * /student/profile:
 *   get:
 *     summary: Get student profile
 *     tags: [Student]
 *     responses:
 *       200:
 *         description: Student profile data
 *         content:
 *           application/json:
 *             example:
 *               _id: "64aabb112233"
 *               name: "John Doe"
 *               email: "john@example.com"
 *               role: "student"
 */
studentRouter.get('/profile', verifyToken, requireRole('student'), getStudentProfile);

/**
 * @swagger
 * /student/submit:
 *   post:
 *     summary: Submit a quiz
 *     tags: [Student]
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               quizId:
 *                 type: string
 *               answers:
 *                 type: array
 *                 items:
 *                   type: object
 *             example:
 *               quizId: "64bbcc223344"
 *               answers:
 *                 - questionId: "q1"
 *                   answer: "A"
 *                 - questionId: "q2"
 *                   answer: "B"
 *     responses:
 *       200:
 *         description: Quiz submitted successfully
 */
studentRouter.post('/submit', verifyToken, requireRole('student'), submitQuiz);

/**
 * @swagger
 * /student/result/{quizId}:
 *   get:
 *     summary: Get result for a specific quiz
 *     tags: [Student]
 *     parameters:
 *       - in: path
 *         name: quizId
 *         schema:
 *           type: string
 *         required: true
 *         description: The quiz ID
 *         example: "64bbcc223344"
 *     responses:
 *       200:
 *         description: Quiz result data
 *         content:
 *           application/json:
 *             example:
 *               quizId: "64bbcc223344"
 *               score: 85
 *               totalQuestions: 10
 *               correctAnswers: 8
 */
studentRouter.get('/result/:quizId', verifyToken, getStudentResult);

/**
 * @swagger
 * /student/my-results:
 *   get:
 *     summary: Get all quiz results for the student
 *     tags: [Student]
 *     responses:
 *       200:
 *         description: List of quiz results
 *         content:
 *           application/json:
 *             example:
 *               - quizId: "64bbcc223344"
 *                 score: 85
 *               - quizId: "64bbcc223355"
 *                 score: 90
 */
studentRouter.get('/my-results', verifyToken, getAllResultsForStudent);

/**
 * @swagger
 * /student/batches:
 *   get:
 *     summary: Get all available batches (only names)
 *     tags: [Student]
 *     responses:
 *       200:
 *         description: List of batches
 *         content:
 *           application/json:
 *             example:
 *               - _id: "64aabb112233"
 *                 name: "Batch A"
 *               - _id: "64aabb112234"
 *                 name: "Batch B"
 */
studentRouter.get('/batches', verifyToken, requireRole('student'), getAllBatches);

/**
 * @swagger
 * /student/join-batch:
 *   post:
 *     summary: Join a batch
 *     tags: [Student]
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - batchId
 *             properties:
 *               batchId:
 *                 type: string
 *                 description: The ID of the batch to join
 *             example:
 *               batchId: "64f2e8d67f23b67c23a8c1a2"
 *     responses:
 *       200:
 *         description: Successfully joined the batch
 *       400:
 *         description: Missing batchId or already joined
 */
studentRouter.post('/join-batch', verifyToken, requireRole('student'), joinBatch);

/**
 * @swagger
 * /student/quiz/{quizId}:
 *   get:
 *     summary: Get quiz details by ID
 *     tags: [Student]
 *     parameters:
 *       - in: path
 *         name: quizId
 *         schema:
 *           type: string
 *         required: true
 *         description: The ID of the quiz (MongoDB ObjectId)
 *         example: "66b8b6c7e8a0a97d6b74f3ab"
 *     responses:
 *       200:
 *         description: Quiz details retrieved successfully
 */
studentRouter.get('/quiz/:quizId', verifyToken, getStudentQuizById);

/**
 * @swagger
 * /student/stats:
 *   get:
 *     summary: Get student statistics
 *     tags: [Student]
 *     responses:
 *       200:
 *         description: Student statistics including average score
 *         content:
 *           application/json:
 *             example:
 *               averageScore: 87
 */
studentRouter.get('/stats', verifyToken, requireRole('student'), getStudentStats);

/**
 * @swagger
 * /student/batch/{batchId}/quizzes:
 *   get:
 *     summary: Get quizzes by batch ID
 *     tags: [Student]
 *     parameters:
 *       - in: path
 *         name: batchId
 *         required: true
 *         schema:
 *           type: string
 *         description: The ID of the batch
 *         example: "64aabb112233"
 *     responses:
 *       200:
 *         description: List of quizzes for the batch
 *         content:
 *           application/json:
 *             example:
 *               - _id: "64bbcc223344"
 *                 title: "Math Quiz 1"
 *                 active: true
 */
studentRouter.get('/batch/:batchId/quizzes', verifyToken, requireRole('student'), getQuizzesByBatch);

/**
 * @swagger
 * /student/quiz-counts:
 *   get:
 *     summary: Get quiz counts for the student
 *     tags: [Student]
 *     responses:
 *       200:
 *         description: Number of quizzes
 *         content:
 *           application/json:
 *             example:
 *               totalQuizzes: 10
 *               activeQuizzes: 7
 */
studentRouter.get('/quiz-counts', verifyToken, getStudentQuizCounts);

/**
 * @swagger
 * /student/leave-batch/{batchId}:
 *   delete:
 *     summary: Leave a batch
 *     tags: [Student]
 *     parameters:
 *       - in: path
 *         name: batchId
 *         required: true
 *         schema:
 *           type: string
 *         description: The ID of the batch to leave
 *         example: "64aabb112233"
 *     responses:
 *       200:
 *         description: Successfully left the batch
 *         content:
 *           application/json:
 *             example:
 *               message: "Successfully left the batch"
 *       404:
 *         description: Batch not found
 *       500:
 *         description: Server error
 */
studentRouter.delete('/leave-batch/:batchId', verifyToken, requireRole('student'), leaveBatch);

/**
 * @swagger
 * /student/active-quizzes:
 *   get:
 *     summary: Get active quizzes for the student
 *     tags: [Student]
 *     responses:
 *       200:
 *         description: List of active quizzes
 *         content:
 *           application/json:
 *             example:
 *               - _id: "64bbcc223344"
 *                 title: "Math Quiz 1"
 *                 active: true
 */
studentRouter.get('/active-quizzes', verifyToken, requireRole('student'), getActiveQuizzesForStudent);
