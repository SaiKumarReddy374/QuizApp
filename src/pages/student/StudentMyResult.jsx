import React, { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import StudentLayout from '../../components/StudentLayout';
import axios from '../../api/axios';

const StudentMyResults = () => {
  const [results, setResults] = useState([]);

  useEffect(() => {
    const fetchResults = async () => {
      try {
        const res = await axios.get('/student/my-results');
        setResults(res.data);
      } catch (err) {
        console.error("Failed to fetch results:", err);
      }
    };
    fetchResults();
  }, []);

  return (
    <StudentLayout>
      <div className="p-8 max-w-4xl mx-auto">
        <h1 className="text-3xl font-bold text-gray-900 mb-6">My Quiz Results</h1>

        {results.length === 0 ? (
          <p className="text-gray-500">No quizzes submitted yet.</p>
        ) : (
          <div className="space-y-4">
            {results.map((res, i) => (
              <div key={i} className="border rounded-xl p-5 bg-white shadow-sm">
                <div className="flex justify-between items-center">
                  <div>
                    <h2 className="text-xl font-semibold text-gray-800">{res.quizTitle}</h2>
                    <p className="text-gray-600 text-sm">Score: {res.score}% | Correct: {res.correctAnswers}</p>
                    <p className="text-gray-600 text-sm">Completed: {new Date(res.completedAt).toLocaleString()}</p>
                  </div>
                  <Link
                    to={`/student/result/${res.quizId}`}
                    className="bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700"
                  >
                    View Details
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

export default StudentMyResults;
