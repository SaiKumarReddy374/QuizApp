import React, { useEffect, useState } from 'react';
import StudentLayout from '../../components/StudentLayout';
import axios from '../../api/axios';
import { Link } from 'react-router-dom';
import { Clock, BookOpen } from 'lucide-react';

const ActiveQuizzes = () => {
  const [quizzes, setQuizzes] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchActiveQuizzes = async () => {
      try {
        const res = await axios.get('/student/active-quizzes');
        setQuizzes(res.data || []);
      } catch (err) {
        console.error('Failed to fetch active quizzes:', err);
      } finally {
        setLoading(false);
      }
    };
    fetchActiveQuizzes();
  }, []);

  return (
    <StudentLayout>
      <div className="max-w-5xl mx-auto px-4 py-8">
        <h1 className="text-2xl font-bold mb-6">Active Quizzes</h1>

        {loading ? (
          <p className="text-gray-500">Loading...</p>
        ) : quizzes.length === 0 ? (
          <p className="text-gray-500">No active quizzes available right now.</p>
        ) : (
          <div className="space-y-4">
            {quizzes.map(quiz => (
              <div key={quiz._id} className="bg-white border p-4 rounded-lg shadow-sm">
                <div className="flex justify-between items-center mb-2">
                  <h2 className="font-semibold text-lg">{quiz.title}</h2>
                  <span className="text-sm text-gray-500">
                    Due: {new Date(quiz.deadline).toLocaleString()}
                  </span>
                </div>
                <div className="text-sm text-gray-600 flex gap-4">
                  <span className="flex items-center gap-1"><BookOpen className="w-4 h-4" /> {quiz.questions?.length || 0} Questions</span>
                  <span className="flex items-center gap-1"><Clock className="w-4 h-4" /> {quiz.duration} mins</span>
                </div>
                <div className="mt-4 text-right">
                  <Link
                    to={`/student/quiz/${quiz._id}`}
                    className="bg-blue-600 text-white px-4 py-2 rounded hover:bg-blue-700 transition"
                  >
                    Start Quiz
                  </Link>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </StudentLayout>
  );
};

export default ActiveQuizzes;
