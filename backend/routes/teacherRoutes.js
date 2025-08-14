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


/**
 * @swagger
 * tags:
 *   name: Teacher
 *   description: Endpoints for teacher actions
 */

/**
 * @swagger
 * /teacher/profile:
 *   get:
 *     summary: Get teacher profile
 *     tags: [Teacher]
 *     responses:
 *       200:
 *         description: Teacher profile data
 *         content:
 *           application/json:
 *             example:
 *               _id: "64aabb112233"
 *               name: "Jane Doe"
 *               email: "jane@example.com"
 *               role: "teacher"
 */
teacherRouter.get('/profile', verifyToken, requireRole('teacher'), getTeacherProfile);

/**
 * @swagger
 * /teacher/dashboard:
 *   get:
 *     summary: Get teacher dashboard stats
 *     tags: [Teacher]
 *     responses:
 *       200:
 *         description: Teacher dashboard data
 *         content:
 *           application/json:
 *             example:
 *               totalBatches: 5
 *               totalQuizzes: 12
 *               totalStudents: 100
 */
teacherRouter.get('/dashboard', verifyToken, requireRole('teacher'), getTeacherDashboard);

/**
 * @swagger
 * /teacher/batch/create:
 *   post:
 *     summary: Create a new batch
 *     tags: [Teacher]
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - name
 *             properties:
 *               name:
 *                 type: string
 *                 description: Name of the batch
 *             example:
 *               name: "Batch A"
 *     responses:
 *       200:
 *         description: Batch created successfully
 */
teacherRouter.post('/batch/create', verifyToken, requireRole('teacher'), createBatch);
teacherRouter.post('/create-batch', verifyToken, requireRole('teacher'), createBatch);

/**
 * @swagger
 * /teacher/batches:
 *   get:
 *     summary: Get all batches for the teacher
 *     tags: [Teacher]
 *     responses:
 *       200:
 *         description: List of teacher's batches
 *         content:
 *           application/json:
 *             example:
 *               - _id: "64aabb112233"
 *                 name: "Batch A"
 *               - _id: "64aabb112234"
 *                 name: "Batch B"
 */
teacherRouter.get('/batches', verifyToken, requireRole('teacher'), listTeacherBatches);

/**
 * @swagger
 * /teacher/quizzes:
 *   get:
 *     summary: Get all quizzes created by the teacher
 *     tags: [Teacher]
 *     responses:
 *       200:
 *         description: List of quizzes
 *         content:
 *           application/json:
 *             example:
 *               - _id: "64bbcc223344"
 *                 title: "Math Quiz 1"
 *                 batch: "Batch A"
 *               - _id: "64bbcc223355"
 *                 title: "Science Quiz 1"
 *                 batch: "Batch B"
 */
teacherRouter.get('/quizzes', verifyToken, requireRole('teacher'), getTeacherQuizzes);
teacherRouter.get('/quiz', verifyToken, requireRole('teacher'), getTeacherQuizzes);

/**
 * @swagger
 * /teacher/create-quiz:
 *   post:
 *     summary: Create a new quiz
 *     tags: [Teacher]
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - title
 *               - batchId
 *             properties:
 *               title:
 *                 type: string
 *               batchId:
 *                 type: string
 *             example:
 *               title: "Math Quiz 1"
 *               batchId: "64aabb112233"
 *     responses:
 *       200:
 *         description: Quiz created successfully
 */
teacherRouter.post('/create-quiz', verifyToken, requireRole('teacher'), createQuiz);

/**
 * @swagger
 * /teacher/leaderboard/{quizId}:
 *   get:
 *     summary: Get leaderboard for a specific quiz
 *     tags: [Teacher]
 *     parameters:
 *       - in: path
 *         name: quizId
 *         required: true
 *         schema:
 *           type: string
 *         description: Quiz ID
 *         example: "64bbcc223344"
 *     responses:
 *       200:
 *         description: Leaderboard data
 *         content:
 *           application/json:
 *             example:
 *               - student: "John Doe"
 *                 score: 90
 *               - student: "Jane Smith"
 *                 score: 85
 */
teacherRouter.get('/leaderboard/:quizId', verifyToken, requireRole('teacher'), getLeaderboard);
teacherRouter.get('/leaderboard', verifyToken, requireRole('teacher'), getLeaderboard);

/**
 * @swagger
 * /teacher/upload-and-generate:
 *   post:
 *     summary: Upload a file to generate quiz
 *     tags: [Teacher]
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
 *     responses:
 *       200:
 *         description: Quiz generated successfully
 */
teacherRouter.post('/upload-and-generate', uploadMiddleware, uploadAndGenerateQuiz);

/**
 * @swagger
 * /teacher/publish-quiz:
 *   post:
 *     summary: Publish a quiz
 *     tags: [Teacher]
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - quizId
 *             properties:
 *               quizId:
 *                 type: string
 *                 description: ID of the quiz to publish
 *             example:
 *               quizId: "64bbcc223344"
 *     responses:
 *       200:
 *         description: Quiz published successfully
 */
teacherRouter.post('/publish-quiz', verifyToken, requireRole('teacher'), publishQuiz);





