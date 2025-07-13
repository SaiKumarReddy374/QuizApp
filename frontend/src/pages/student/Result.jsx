import React, { useEffect, useState } from 'react';
import { useParams, Link } from 'react-router-dom';
import StudentLayout from '../../components/StudentLayout';
import {
  Trophy,
  CheckCircle,
  XCircle,
  ArrowLeft,
  Share2,
} from 'lucide-react';
import axios from '../../api/axios';

const StudentResult = () => {
  const { quizId } = useParams();
  const [resultData, setResultData] = useState(null);

  useEffect(() => {
    const fetchResult = async () => {
      try {
        const res = await axios.get(`/student/result/${quizId}`);
        setResultData(res.data);
      } catch (err) {
        console.error('Failed to fetch result:', err);
      }
    };

    fetchResult();
  }, [quizId]);

  const getScoreColor = (score) => {
    if (score >= 90) return 'text-green-600';
    if (score >= 70) return 'text-blue-600';
    if (score >= 50) return 'text-yellow-600';
    return 'text-red-600';
  };

  const getScoreBgColor = (score) => {
    if (score >= 90) return 'bg-green-100';
    if (score >= 70) return 'bg-blue-100';
    if (score >= 50) return 'bg-yellow-100';
    return 'bg-red-100';
  };

  if (!resultData) return <div className="p-8">Loading result...</div>;

  return (
    <StudentLayout>
      <div className="p-8">
        <div className="max-w-4xl mx-auto">
          {/* Header */}
          <div className="flex items-center justify-between mb-8">
            <div>
              <h1 className="text-3xl font-bold text-gray-900 mb-2">
                Quiz Results
              </h1>
              <p className="text-gray-600">{resultData.quizTitle}</p>
            </div>
            <Link
              to="/student/dashboard"
              className="flex items-center space-x-2 text-teal-600 hover:text-teal-700 transition-colors"
            >
              <ArrowLeft className="h-5 w-5" />
              <span>Back to Dashboard</span>
            </Link>
          </div>

          {/* Score Card */}
          <div
            className={`${getScoreBgColor(
              resultData.score
            )} rounded-2xl p-8 mb-8 border-2 ${
              resultData.score >= 90
                ? 'border-green-200'
                : resultData.score >= 70
                ? 'border-blue-200'
                : resultData.score >= 50
                ? 'border-yellow-200'
                : 'border-red-200'
            }`}
          >
            <div className="text-center">
              <div className="flex justify-center mb-4">
                <Trophy
                  className={`h-16 w-16 ${getScoreColor(resultData.score)}`}
                />
              </div>
              <h2 className="text-4xl font-bold text-gray-900 mb-2">
                {resultData.score}%
              </h2>
              <p className="text-lg text-gray-700 mb-4">
                {resultData.correctAnswers} out of {resultData.totalQuestions}{' '}
                correct
              </p>
              <div className="grid grid-cols-2 gap-4 max-w-md mx-auto">
                <div className="text-center">
                  <p className="text-sm text-gray-600">Completed At</p>
                  <p className="font-medium text-gray-900">
                    {new Date(resultData.completedAt).toLocaleString()}
                  </p>
                </div>
                <div className="text-center">
                  <p className="text-sm text-gray-600">Time Spent</p>
                  <p className="font-medium text-gray-900">
                    {resultData.timeSpent}
                  </p>
                </div>
              </div>
            </div>
          </div>

          {/* Action Buttons */}
          <div className="flex justify-center space-x-4 mb-8">
            <button className="flex items-center space-x-2 bg-teal-600 text-white px-6 py-3 rounded-lg hover:bg-teal-700 transition-colors">
              <Share2 className="h-5 w-5" />
              <span>Share Result</span>
            </button>
            <Link
              to="/student/ask-ai"
              className="flex items-center space-x-2 bg-blue-600 text-white px-6 py-3 rounded-lg hover:bg-blue-700 transition-colors"
            >
              <span>Ask AI for Help</span>
            </Link>
          </div>

          {/* Question Breakdown */}
          <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
            <h3 className="text-xl font-semibold text-gray-900 mb-6">
              Question Breakdown
            </h3>

            <div className="space-y-6">
              {resultData.questions.map((question, index) => {
                const userAnswer = question.userAnswer;
                const correctAnswer = question.correctAnswer;
                const isCorrect = userAnswer === correctAnswer;

                return (
                  <div
                    key={index}
                    className="border border-gray-200 rounded-lg p-6"
                  >
                    <div className="flex items-start space-x-4">
                      <div className="flex-shrink-0">
                        {isCorrect ? (
                          <CheckCircle className="h-6 w-6 text-green-600" />
                        ) : (
                          <XCircle className="h-6 w-6 text-red-600" />
                        )}
                      </div>
                      <div className="flex-1">
                        <h4 className="font-medium text-gray-900 mb-3">
                          Question {index + 1}: {question.question}
                        </h4>

                        <div className="space-y-2 mb-4">
                          {question.options.map((option, optionIndex) => {
                            const isCorrectOpt =
                              optionIndex === correctAnswer;
                            const isUserOpt = optionIndex === userAnswer;
                            const isWrong =
                              isUserOpt && !isCorrectOpt;

                            let bgClass = 'bg-gray-50 border-gray-200';
                            if (isCorrectOpt) {
                              bgClass = 'bg-green-50 border-green-200';
                            } else if (isWrong) {
                              bgClass = 'bg-red-50 border-red-200';
                            }

                            return (
                              <div
                                key={optionIndex}
                                className={`p-3 rounded-lg border ${bgClass}`}
                              >
                                <div className="flex items-center space-x-2">
                                  <span className="font-medium">
                                    {String.fromCharCode(65 + optionIndex)}.
                                  </span>
                                  <span className="flex-1">{option}</span>

                                  {isCorrectOpt && (
                                    <span className="text-green-600 text-sm font-medium">
                                      ✓ Correct
                                    </span>
                                  )}
                                  {isWrong && (
                                    <span className="text-red-600 text-sm font-medium">
                                      ✗ Your Answer
                                    </span>
                                  )}
                                </div>
                              </div>
                            );
                          })}
                        </div>

                        <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
                          <p className="text-sm font-medium text-blue-900 mb-1">
                            Explanation:
                          </p>
                          <p className="text-sm text-blue-800">
                            {question.explanation}
                          </p>
                        </div>
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        </div>
      </div>
    </StudentLayout>
  );
};

export default StudentResult;
