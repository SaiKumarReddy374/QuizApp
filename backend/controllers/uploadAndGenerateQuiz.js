import multer from 'multer';
import Quiz from '../models/Quiz.js';

// Set up multer storage (optional, since we’re not saving the file)
const storage = multer.memoryStorage();
const upload = multer({ storage });

// Middleware to export and use in the router
export const uploadMiddleware = upload.single('file');

// Generate hardcoded quiz
export const uploadAndGenerateQuiz = async (req, res) => {
  const { batchId } = req.body;

  if (!batchId) {
    return res.status(400).json({ error: 'Batch ID is required' });
  }

  const hardcodedQuiz = {
    questions: [
      {
        question: 'What is the capital of India?',
        options: ['Mumbai', 'Delhi', 'Chennai', 'Kolkata'],
        correct: 1
      },
      {
        question: 'What is 2 * 6?',
        options: ['10', '11', '12', '14'],
        correct: 2
      },
      {
        question: 'Which language is used for web apps?',
        options: ['Python', 'Java', 'JavaScript', 'C++'],
        correct: 2
      }
    ]
  };

  return res.status(200).json({ quiz: hardcodedQuiz });
};

// Publish to DB
export const publishQuiz = async (req, res) => {

  console.log('BODY:', req.body);           // ✅ log incoming data
  console.log('REQ.USER:', req.user); 
  const { batchId, quiz } = req.body;

  if (!batchId || !quiz?.questions?.length) {
    return res.status(400).json({ error: 'Invalid quiz or batchId' });
  }

  try {
    const formattedQuestions = quiz.questions.map(q => ({
      question: q.question,
      options: q.options,
      correctAnswer: q.correct ?? 0  // default to 0 if undefined
    }));

    const newQuiz = new Quiz({
  title: quiz.title || 'Untitled Quiz',
  createdBy: req.user.userId, // ✅ teacher ID
  batch: batchId,
  source: 'ai',
  deadline: quiz.deadline || null,
  duration: quiz.duration || 30,
  questions: formattedQuestions
});
console.log(req.user?._id);

    await newQuiz.save();
    res.status(200).json({ message: 'Quiz published!' });
  } catch (err) {
    console.error(err.message);
    res.status(500).json({ error: 'Server error while saving quiz' });
  }
};

