import Quiz from '../models/Quiz.js';
import Batch from '../models/Batch.js';
import Result from '../models/Result.js';
import User from '../models/User.js';

import client from '../redisClient.js';


export const getLeaderboard = async (req, res) => {
  try {
    const teacherId = req.user.userId;
    const { batchId, quizId } = req.query;

    // Generate a unique cache key for this leaderboard view
    const cacheKey = `leaderboard:${teacherId}:${batchId || 'all'}:${quizId || 'all'}`;

    // Check Redis first
    const cachedData = await client.get(cacheKey);
    if (cachedData) {
      console.log(`Serving leaderboard from cache: ${cacheKey}`);
      return res.json(JSON.parse(cachedData));
    }

    // Validate filter params
    if (batchId) {
      const batch = await Batch.findById(batchId);
      if (!batch) return res.status(404).json({ error: 'Batch not found' });
      if (!batch.teacher.equals(teacherId))
        return res.status(403).json({ error: 'Not authorized for this batch' });
    }

    let quizzesQuery = { createdBy: teacherId };
    if (quizId) quizzesQuery._id = quizId;
    if (batchId) quizzesQuery.batch = batchId;

    const quizzes = await Quiz.find(quizzesQuery).select('_id title');

    if (quizzes.length === 0) {
      const emptyResponse = { leaderboard: [], quizOptions: [], batchOptions: [] };
      await client.setEx(cacheKey, 300, JSON.stringify(emptyResponse)); // cache empty for 5 mins
      return res.json(emptyResponse);
    }

    const quizIds = quizzes.map(q => q._id);
    const results = await Result.find({ quiz: { $in: quizIds } })
      .populate('student', 'name email')
      .sort({ score: -1, completedAt: 1 });

    const leaderboard = results.map((r, idx) => ({
      rank: idx + 1,
      studentId: r.student._id,
      name: r.student.name,
      email: r.student.email,
      score: r.score,
      submittedAt: r.completedAt
    }));

    const responseData = {
      leaderboard,
      batchOptions: batchId ? [] : await Batch.find({ teacher: teacherId }).select('id name'),
      quizOptions: quizzes.map(q => ({ id: q._id, title: q.title }))
    };

    // Cache for 5 minutes
    await client.setEx(cacheKey, 300, JSON.stringify(responseData));
    console.log(`Leaderboard cached: ${cacheKey}`);

    res.json(responseData);
  } catch (err) {
    console.error('Error fetching leaderboard:', err);
    res.status(500).json({ error: 'Failed to fetch leaderboard' });
  }
};


export const getTeacherProfile = async (req, res) => {
  try {
    // Ensure token decoding middleware attached req.user
    if (!req.user || !req.user.userId) {
      return res.status(401).json({ error: 'Unauthorized: Missing user info from token' });
    }

    const user = await User.findById(req.user.userId).select('name email role');

    if (!user) {
      return res.status(404).json({ error: 'User not found' });
    }

    if (user.role !== 'teacher') {
      return res.status(403).json({ error: 'Forbidden: User is not a teacher' });
    }

    res.json({ name: user.name, email: user.email, role: user.role });
  } catch (err) {
    console.error('Profile fetch error:', err.message);
    res.status(500).json({ error: 'Failed to fetch profile' });
  }
};




export const getTeacherDashboard = async (req, res) => {
  try {
    const teacherId = req.user.userId;

    // Get all quizzes created by this teacher (with batch info)
    const quizzes = await Quiz.find({ createdBy: teacherId })
      .populate('batch', 'name students')
      .sort({ createdAt: -1 });

    const totalQuizzes = quizzes.length;

    // Extract batch IDs from quizzes
    const batchIds = quizzes.map(q => q.batch?._id).filter(Boolean);

    // Get batches with students to calculate active students
    const batches = await Batch.find({ _id: { $in: batchIds } });

    const allStudents = batches.flatMap(b => b.students || []);
    const uniqueStudentIds = [...new Set(allStudents.map(id => id.toString()))];
    const activeStudents = uniqueStudentIds.length;

    // Calculate average score from quizzes
    const totalScore = quizzes.reduce((sum, quiz) => sum + (quiz.avgScore || 0), 0);
    const avgScore = totalQuizzes > 0 ? Math.round(totalScore / totalQuizzes) : 0;

    // Total batches taught by this teacher
    const totalBatches = await Batch.countDocuments({ teacher: teacherId });

    // Recent 5 quizzes
    const recentQuizzes = quizzes.slice(0, 5).map(quiz => ({
      _id: quiz._id,
      title: quiz.title,
      batch: quiz.batch?.name || 'N/A',
      students: quiz.batch?.students?.length || 0,
      avgScore: quiz.avgScore || 0
    }));

    res.json({
      metrics: {
        totalQuizzes,
        activeStudents,
        avgScore,
        totalBatches
      },
      quizzes: recentQuizzes
    });

  } catch (err) {
    console.error('Dashboard fetch error:', err.message);
    res.status(500).json({ error: 'Failed to fetch dashboard data' });
  }
};





export const createQuiz = async (req, res) => {
  const { title, questions, source, batchId, deadline, duration } = req.body;

  try {
    // Convert correctAnswer (value) → index
    const formattedQuestions = questions.map((q) => {
      const correctIndex = q.options.indexOf(q.correctAnswer);

      if (correctIndex === -1) {
        throw new Error(`Correct answer "${q.correctAnswer}" not found in options for question "${q.question}"`);
      }

      return {
        question: q.question,
        options: q.options,
        correctAnswer: correctIndex,
        explanation: q.explanation || '',
      };
    });

    const quiz = await Quiz.create({
      title,
      questions: formattedQuestions,
      source,
      createdBy: req.user.userId,
      batch: batchId,
      deadline,
      duration,
    });

    // Invalidate teacher quiz cache
    const cacheKey = `teacherQuizzes:${req.user.userId}`;
    await client.del(cacheKey);
    console.log(`Redis cache cleared for ${cacheKey}`);
    // //Invalidate Redis cache for active quizzes of this batch
    // await client.del(`activeQuizzes:${batchId}`);
    // console.log(`Redis cache for activeQuizzes:${batchId} invalidated`);

    // Clear student caches for this batch
const batchQuizKeysPattern = `student:*:batch:${batchId}:quizzes`;
const keys = await client.keys(batchQuizKeysPattern);
if (keys.length > 0) {
  await client.del(keys);
  console.log(`Redis cache cleared for students in batch ${batchId}`);
}

    res.status(201).json(quiz);
  } catch (err) {
    console.error('Create quiz error:', err.message);
    res.status(500).json({ error: 'Quiz creation failed' });
  }
};



// ==================== CREATE BATCH ====================
export const createBatch = async (req, res) => {
  try {
    const { name, students = [] } = req.body;
    const teacherId = req.user.userId;

    const existingBatch = await Batch.findOne({ name });
    if (existingBatch) {
      return res.status(400).json({ error: 'Batch name already exists' });
    }

    const newBatch = await Batch.create({
      name,
      teacher: teacherId,
      students,
    });

    //Invalidate cached batches
    await client.del('allBatches');
    console.log('Redis cache for allBatches invalidated');

    res.status(201).json({ message: 'Batch created', batch: newBatch });
  } catch (error) {
    console.error('Batch creation error:', error.message);
    res.status(500).json({ error: 'Internal server error' });
  }
};

// ==================== LIST BATCHES (Optional) ====================
export const listTeacherBatches = async (req, res) => {
  try {
    const teacherId = req.user.userId;
    const batches = await Batch.find({ teacher: teacherId }).populate('students', 'name email');
    res.json(batches);
  } catch (err) {
    console.error('Fetch batches error:', err.message);
    res.status(500).json({ error: 'Failed to load batches' });
  }
};


// GET /api/teacher/quizzes
export const getTeacherQuizzes = async (req, res) => {
  try {
    console.time('getTeacherQuizzes'); // start timer
    const teacherId = req.user.userId;
    const cacheKey = `teacherQuizzes:${teacherId}`;

    // Check cache first
    const cachedQuizzes = await client.get(cacheKey);
    if (cachedQuizzes) {
      console.timeEnd('getTeacherQuizzes');
      console.log('Served from Redis cache');
      return res.json({ quizzes: JSON.parse(cachedQuizzes) });
    }

    //  Fetch from MongoDB if not cached
    const quizzes = await Quiz.find({ createdBy: teacherId })
      .populate('batch', 'name')
      .sort({ createdAt: -1 });

    //  Cache for 10 minutes
    await client.setEx(cacheKey, 600, JSON.stringify(quizzes));

    console.timeEnd('getTeacherQuizzes');
    console.log('Served from MongoDB');
    res.json({ quizzes });

  } catch (err) {
    console.error('Error fetching quizzes:', err);
    res.status(500).json({ error: 'Failed to load quizzes' });
  }
};



