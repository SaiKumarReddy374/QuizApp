import User from '../models/User.js';
import Quiz from '../models/Quiz.js';
import Result from '../models/Result.js';
import Batch from '../models/Batch.js';

import client from '../redisClient.js';

export const getStudentQuizById = async (req, res) => {
  try {
    const quizId = req.params.quizId;

    const quiz = await Quiz.findById(quizId).select('title duration questions');

    if (!quiz) {
      return res.status(404).json({ error: 'Quiz not found' });
    }

    // Hide correct answers from students
    const safeQuestions = quiz.questions.map(q => ({
      question: q.question,
      options: q.options
    }));

    res.json({
      _id: quiz._id,
      title: quiz.title,
      duration: quiz.duration || 30, // in minutes
      questions: safeQuestions
    });

  } catch (err) {
    console.error('Error fetching quiz for student:', err.message);
    res.status(500).json({ error: 'Internal server error' });
  }
};


export const submitQuiz = async (req, res) => {
  const { quizId, timeSpent, answers } = req.body;
  const studentId = req.user.userId;

  if (!quizId || !Array.isArray(answers)) {
    return res.status(400).json({ error: 'Invalid input data' });
  }

  try {
    const existingResult = await Result.findOne({ quiz: quizId, student: studentId });
    if (existingResult) {
      return res.status(400).json({ error: 'Quiz already submitted' });
    }

    // Fetch quiz to verify answers
    const quiz = await Quiz.findById(quizId);
    if (!quiz || !quiz.questions) {
      return res.status(404).json({ error: 'Quiz not found or has no questions' });
    }

    let correct = 0;
    answers.forEach(({ questionIndex, selectedOption }) => {
      if (
        quiz.questions[questionIndex] &&
        quiz.questions[questionIndex]?.correctAnswer === selectedOption
      ) {
        correct += 1;
      }
    });

    const score = Math.round((correct / quiz.questions.length) * 100);

    const result = await Result.create({
      quiz: quizId,
      student: studentId,
      score,
      correctAnswers: correct,
      timeSpent,
      answers,
    });

    // Update quiz average score
    const allResults = await Result.find({ quiz: quizId });
    const newAvg = Math.round(
      allResults.reduce((sum, r) => sum + r.score, 0) / allResults.length
    );
    quiz.avgScore = newAvg;
    await quiz.save();

     // Invalidate Redis cache for this student's results
    const cacheKey = `studentResults:${studentId}`;
    await client.del(cacheKey);

    // Invalidate the cached active quizzes for this student
    const QuizecacheKey = `activeQuizzes:${studentId}`;
    await client.del(QuizecacheKey);
    console.log(`Redis cache invalidated for student ${studentId}`);

    const teacherId = quiz.createdBy._id;
    await client.del(`leaderboard:${teacherId}:*`);
    console.log(`Redis cache for leaderboard invalidated after quiz submission`);

    res.status(201).json({ message: 'Quiz submitted successfully', result });

  } catch (error) {
    console.error('Quiz submission failed:', error.message);
    res.status(500).json({ error: 'Quiz submission failed' });
  }
};


// GET all results for a student with Redis caching
export const getAllResultsForStudent = async (req, res) => {
  try {
    const studentId = req.user.userId;
    const cacheKey = `studentResults:${studentId}`;

    console.time('getAllResultsForStudent');

    // Check Redis cache
    const cachedResults = await client.get(cacheKey);
    if (cachedResults) {
      console.timeEnd('getAllResultsForStudent');
      console.log('Fetching student results from Redis cache');
      return res.json(JSON.parse(cachedResults));
    }

    // Fetch from DB if not cached
    const results = await Result.find({ student: studentId })
      .populate('quiz', 'title')
      .sort({ completedAt: -1 });

    const formatted = results
      .filter(result => result.quiz !== null)
      .map(result => ({
        quizId: result.quiz._id,
        quizTitle: result.quiz.title,
        score: result.score,
        correctAnswers: result.correctAnswers,
        completedAt: result.completedAt,
        timeSpent: result.timeSpent,
      }));

    // Cache results for 10 minutes
    await client.setEx(cacheKey, 600, JSON.stringify(formatted));

    console.timeEnd('getAllResultsForStudent'); 
    console.log('Fetching student results from MongoDB');
    res.json(formatted);
  } catch (err) {
    console.error('Error fetching student results:', err.message);
    res.status(500).json({ error: 'Failed to fetch results' });
  }
};

// controllers/studentController.js


export const getStudentResult = async (req, res) => {
  try {
    console.time('getStudentResult');

    const { quizId } = req.params;
    const studentId = req.user.userId;

    // Create a unique Redis key for this quiz + student
    const cacheKey = `studentResult:${studentId}:${quizId}`;

    // Check Redis cache
    const cachedResult = await client.get(cacheKey);
    if (cachedResult) {
      console.timeEnd('getStudentResult');
      console.log('Served from Redis cache');
      return res.json(JSON.parse(cachedResult));
    }

    // Fetch from DB
    const result = await Result.findOne({ quiz: quizId, student: studentId });
    if (!result) return res.status(404).json({ error: 'Result not found' });

    const quiz = await Quiz.findById(quizId);
    if (!quiz) return res.status(404).json({ error: 'Quiz not found' });

    const responseData = {
      quizTitle: quiz.title,
      score: result.score,
      correctAnswers: result.correctAnswers,
      totalQuestions: quiz.questions.length,
      completedAt: result.completedAt,
      timeSpent: result.timeSpent,
      questions: quiz.questions.map((q, index) => {
        const answer = result.answers.find(a => a.questionIndex === index);
        const userAnswer = answer?.selectedOption ?? -1;

        return {
          id: index + 1,
          question: q.question,
          options: q.options,
          correctAnswer: q.correctAnswer, // index
          userAnswer,
          isCorrect: userAnswer === q.correctAnswer,
          explanation: q.explanation || ''
        };
      })
    };

    //  Store in Redis for 1 hour
    await client.setEx(cacheKey, 3600, JSON.stringify(responseData));

    console.timeEnd('getStudentResult');
    console.log('Served from MongoDB');

    res.json(responseData);
  } catch (error) {
    console.error('Fetch result error:', error.message);
    res.status(500).json({ error: 'Failed to fetch result' });
  }
};



// GET /api/student/profile
export const getStudentProfile = async (req, res) => {
  try {
    const student = await User.findById(req.userId)
      .populate('batches', 'name') // Only bring batch name
      .select('-password'); // hide password

    if (!student || student.role !== 'student') {
      return res.status(404).json({ message: 'Student not found' });
    }

    res.json(student);
  } catch (err) {
    console.error('Error fetching student profile:', err.message);
    res.status(500).json({ message: 'Failed to load student profile' });
  }
};

// GET /api/student/quizzes

export const getStudentQuizzes = async (req, res) => {
  try {
    const student = await User.findById(req.user.id);

    if (!student || !student.batch) {
      return res.status(404).json({ message: 'Student batch not found' });
    }

    const now = new Date();

    const quizzes = await Quiz.find({ batch: student.batch }).lean();

    // You may need to check Result collection if quiz doesn't store student submission
    const results = await Result.find({ student: student._id }).select('quiz').lean();
    const completedQuizIds = new Set(results.map(r => r.quiz.toString()));

    const enriched = quizzes.map((quiz) => {
      const deadline = new Date(quiz.deadline);
      let status = 'available';

      if (completedQuizIds.has(quiz._id.toString())) {
        status = 'completed';
      } else if (deadline < now) {
        status = 'overdue';
      }

      return {
        ...quiz,
        status,
        deadline,
      };
    });

    //  Custom sort:
    const statusPriority = { 'available': 0, 'overdue': 1, 'completed': 2 };

    const sorted = enriched.sort((a, b) => {
      const statusCompare = statusPriority[a.status] - statusPriority[b.status];
      if (statusCompare !== 0) return statusCompare;
      return new Date(a.deadline) - new Date(b.deadline); // earlier deadlines first
    });

    res.json(sorted);
  } catch (error) {
    console.error('Error in getStudentQuizzes:', error);
    res.status(500).json({ message: 'Server error' });
  }
};




// GET /api/student/batches → list all batches
export const getAllBatches = async (req, res) => {
  try {
    console.time('getAllBatches'); // Start timer

    // Check cache first
    const cachedBatches = await client.get('allBatches');
    if (cachedBatches) {
      console.timeEnd('getAllBatches'); // End timer
      console.log('Served from Redis cache');
      return res.json(JSON.parse(cachedBatches));
    }

    // Fetch from database if not cached
    const batches = await Batch.find()
      .populate('teacher', 'name email')
      .sort({ createdAt: -1 });

    // Cache the result for 60 seconds
    await client.setEx('allBatches', 3600, JSON.stringify(batches));

    console.timeEnd('getAllBatches'); // End timer
    console.log('Served from MongoDB');

    res.json(batches);
  } catch (err) {
    res.status(500).json({ message: 'Failed to fetch batches', error: err.message });
  }
};

// POST /api/student/join-batch

export const joinBatch = async (req, res) => {
  try {
    const { batchId } = req.body;

    console.log('Received join batch request');
    console.log('Batch ID:', batchId);
    console.log('User ID from token (req.userId):', req.userId);

    // Find batch
    const batch = await Batch.findById(batchId);
    if (!batch) {
      console.log('Batch not found');
      return res.status(404).json({ message: 'Invalid batch ID' });
    }

    // Find the student and check role
    const student = await User.findOne({ _id: req.userId, role: 'student' });
    if (!student) {
      console.log('Student not found in DB or is not a student');
      return res.status(404).json({ message: 'Student not found' });
    }

    // Check if already joined
    if (batch.students.includes(student._id)) {
      console.log('Student already in batch');
      return res.status(400).json({ message: 'You have already joined this batch' });
    }

    // Add student to batch
    batch.students.push(student._id);
    await batch.save();

    //  Add batch to student's list of batches
    student.batches.push(batch._id);
    await student.save();

    //  await client.del(`activeQuizzes:${batchId}`);
    // console.log(`Redis cache for activeQuizzes:${batchId} invalidated after student joined`);
    

    console.log(`Student ${student.name} added to batch ${batch.name}`);
    res.json({ message: 'Successfully joined the batch', batch: batch.name });

  } catch (err) {
    console.error('Error in joinBatch:', err.message);
    res.status(500).json({ message: 'Error joining batch', error: err.message });
  }
};

export const getQuizzesByBatch = async (req, res) => {
  try {
    const { batchId } = req.params;

    const student = await User.findById(req.user.userId); // ✅ fix: use req.user.userId
    if (!student) return res.status(404).json({ message: 'Student not found' });

    const isInBatch = student.batches.some(b => b.toString() === batchId);
    if (!isInBatch) {
      return res.status(403).json({ message: 'You are not a member of this batch' });
    }

    const quizzes = await Quiz.find({ batch: batchId }).sort({ deadline: 1 });
    const now = new Date();

    const quizzesWithStatus = await Promise.all(
      quizzes.map(async (quiz) => {
        //  Check if the student already submitted this quiz
        const result = await Result.findOne({
          quiz: quiz._id,
          student: req.user.userId,
        });

        let status = 'available';
        if (result) {
          status = 'completed';
        } else if (quiz.deadline && new Date(quiz.deadline) < now) {
          status = 'overdue';
        }

        return {
          _id: quiz._id,
          title: quiz.title,
          duration: quiz.duration,
          deadline: quiz.deadline,
          questions: quiz.questions,
          status,
          score: result?.score ?? null,
        };
      })
    );

    res.json(quizzesWithStatus);
  } catch (err) {
    console.error('Error fetching quizzes:', err);
    res.status(500).json({ message: 'Failed to fetch quizzes', error: err.message });
  }
};



export const getStudentStats = async (req, res) => {
  try {
    const studentId = req.user.userId;

    const results = await Result.find({ student: studentId });

    let avgScore = 0;
    if (results.length > 0) {
      const total = results.reduce((sum, r) => sum + r.score, 0);
      avgScore = Math.round(total / results.length);
    }

    res.json({ averageScore: avgScore });
  } catch (err) {
    console.error('Error fetching stats:', err.message);
    res.status(500).json({ error: 'Failed to fetch stats' });
  }
};


export const getStudentQuizCounts = async (req, res) => {
  try {
    const studentId = req.user.userId;

    // 1. Get student's batches
    const student = await User.findById(studentId).populate('batches');
    if (!student) return res.status(404).json({ error: 'Student not found' });

    let totalQuizzes = 0;
    let activeQuizzes = 0;

    // 2. Get all quiz results for student
    const results = await Result.find({ student: studentId });
    const completedQuizIds = new Set(results.map(r => r.quiz.toString()));

    // 3. Loop through each batch and its quizzes
    for (const batch of student.batches) {
      const quizzes = await Quiz.find({ batch: batch._id });

      for (const quiz of quizzes) {
        totalQuizzes++;

        const isCompleted = completedQuizIds.has(quiz._id.toString());
        const isDeadlineValid = new Date(quiz.deadline) > new Date();

        if (!isCompleted && isDeadlineValid) {
          activeQuizzes++;
        }
      }
    }

    return res.json({ totalQuizzes, activeQuizzes });

  } catch (err) {
    console.error('Error fetching quiz counts:', err.message);
    res.status(500).json({ error: 'Failed to fetch quiz data' });
  }
};


export const leaveBatch = async (req, res) => {
  try {
    const studentId = req.user.userId;
    const batchId = req.params.batchId;

    const batch = await Batch.findById(batchId);
    if (!batch) {
      return res.status(404).json({ message: 'Batch not found' });
    }

    const student = await User.findById(studentId);
    if (!student) {
      return res.status(404).json({ message: 'Student not found' });
    }

    // Remove student from batch
    batch.students = batch.students.filter(id => id.toString() !== studentId);
    await batch.save();

    // Remove batch from student
    student.batches = student.batches.filter(id => id.toString() !== batchId);
    await student.save();

    // await client.del(`activeQuizzes:${batchId}:${studentId}`);
    // console.log(`Redis cache for activeQuizzes:${batchId}:${studentId} invalidated after student left`);

    res.json({ message: 'Successfully left the batch' });

  } catch (error) {
    console.error('Error in leaveBatch:', error);
    res.status(500).json({ message: 'Failed to leave the batch' });
  }
};



export const getActiveQuizzesForStudent = async (req, res) => {
  try {
    const studentId = req.user.userId;

    const student = await User.findById(studentId).populate('batches');
    if (!student || !student.batches || student.batches.length === 0) {
      return res.status(404).json({ message: 'No batches found' });
    }

    const batchIds = student.batches.map(batch => batch._id);
    const now = new Date();

    // Get all upcoming quizzes
    const activeQuizzes = await Quiz.find({
      batch: { $in: batchIds },
      deadline: { $gte: now }
    }).lean();

    // Get completed quiz IDs
    const completedResults = await Result.find({ student: studentId }).select('quiz');
    const completedQuizIds = completedResults.map(r => r.quiz.toString());

    const filteredQuizzes = activeQuizzes
      .filter(quiz => !completedQuizIds.includes(quiz._id.toString()))
      .sort((a, b) => new Date(a.deadline) - new Date(b.deadline));


    res.json(filteredQuizzes);

  } catch (err) {
    console.error('Error in getActiveQuizzesForStudent:', err.message);
    res.status(500).json({ error: 'Failed to fetch active quizzes' });
  }
};
