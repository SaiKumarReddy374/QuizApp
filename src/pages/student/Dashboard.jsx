
import React, { useEffect, useState, useMemo } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { BookOpen, Clock, CheckCircle, Play, Users, Trophy, Award, Target, AlertCircle } from 'lucide-react';
import StudentLayout from '../../components/StudentLayout';
import axios from '../../api/axios';

const StudentDashboard = () => {
  const navigate = useNavigate();
  
  // State for student data, quizzes, and loading/error status
  const [student, setStudent] = useState(null);
  const [quizzesByBatch, setQuizzesByBatch] = useState({});
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    const fetchDashboardData = async () => {
      try {
        // Fetch student profile first to get their batch details
        const profileRes = await axios.get('/student/profile');
        const studentData = profileRes.data;
        setStudent(studentData);

        if (studentData && studentData.batches?.length > 0) {
          // Create an array of promises to fetch quizzes for all batches concurrently
          const quizPromises = studentData.batches.map(batch =>
            axios.get(`/student/batch/${batch._id}/quizzes`)
              .then(res => ({
                batchName: batch.name,
                quizzes: res.data || []
              }))
          );

          // Wait for all quiz requests to complete
          const quizzesResults = await Promise.all(quizPromises);

          // Transform the results into the desired { batchName: quizzes[] } structure
          const quizzesMap = quizzesResults.reduce((acc, result) => {
            acc[result.batchName] = result.quizzes;
            return acc;
          }, {});

          setQuizzesByBatch(quizzesMap);
        }
      } catch (err) {
        const errorMessage = err.response?.data?.message || 'Could not fetch dashboard data. Please try again.';
        console.error('Error loading dashboard:', errorMessage);
        setError(errorMessage);
        // Optional: Navigate to login on auth errors
        if (err.response?.status === 401 || err.response?.status === 403) {
            navigate('/login');
        }
      } finally {
        setLoading(false);
      }
    };

    fetchDashboardData();
  }, [navigate]);

  // Use useMemo to calculate statistics only when quizzesByBatch changes
  const stats = useMemo(() => {
    const allQuizzes = Object.values(quizzesByBatch).flat();
    
    const totalQuizzes = allQuizzes.length;
    const completedQuizzes = allQuizzes.filter(q => q.status === 'completed');
    const activeQuizzes = allQuizzes.filter(q => q.status === 'available').length;

    let averageScore = 0;
    if (completedQuizzes.length > 0) {
      const totalScore = completedQuizzes.reduce((sum, q) => sum + (q.score || 0), 0);
      averageScore = Math.round(totalScore / completedQuizzes.length);
    }

    return {
      totalQuizzes,
      completedCount: completedQuizzes.length,
      activeCount: activeQuizzes,
      averageScore: completedQuizzes.length > 0 ? averageScore : null,
    };
  }, [quizzesByBatch]);

  // Helper functions for styling quiz items based on status
  const getStatusStyle = (status) => {
    switch (status) {
      case 'available': return 'bg-teal-100 text-teal-800';
      case 'completed': return 'bg-blue-100 text-blue-800';
      case 'overdue': return 'bg-red-100 text-red-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  const getStatusIcon = (status) => {
    switch (status) {
      case 'available': return <Play className="w-4 h-4" />;
      case 'completed': return <CheckCircle className="w-4 h-4" />;
      case 'overdue': return <Clock className="w-4 h-4" />;
      default: return <Clock className="w-4 h-4" />;
    }
  };

  // Loading State UI
  if (loading) {
    return (
      <StudentLayout>
        <div className="flex items-center justify-center min-h-[70vh]">
          <div className="text-center">
            <div className="w-16 h-16 border-4 border-blue-200 border-t-blue-600 rounded-full animate-spin mx-auto mb-4"></div>
            <p className="text-slate-600 font-medium">Loading Dashboard...</p>
          </div>
        </div>
      </StudentLayout>
    );
  }

  // Error State UI
  if (error || !student) {
    return (
      <StudentLayout>
        <div className="flex items-center justify-center min-h-[70vh]">
          <div className="text-center p-8 bg-white rounded-2xl shadow-md">
            <div className="w-16 h-16 bg-red-100 rounded-full flex items-center justify-center mx-auto mb-4">
              <AlertCircle className="w-8 h-8 text-red-600" />
            </div>
            <h2 className="text-xl font-semibold text-slate-800 mb-2">Something Went Wrong</h2>
            <p className="text-slate-600">{error || 'Unable to load student data.'}</p>
          </div>
        </div>
      </StudentLayout>
    );
  }

  // Main Dashboard UI
  return (
    <StudentLayout>
      <div className="min-h-screen bg-gradient-to-br from-slate-50 via-blue-50 to-indigo-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
          
          {/* Welcome Header */}
          <h1 className="text-3xl font-bold mb-8 text-slate-800">
            Welcome, {student.name}! 🎓
          </h1>

          {/* 📊 Stats Cards */}
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6 mb-12">
            <StatCard icon={<Users />} color="blue" title="Batches Joined" value={student.batches.length} />
            <StatCard icon={<Trophy />} color="emerald" title="Average Score" value={stats.averageScore !== null ? `${stats.averageScore}%` : 'N/A'} />
            <StatCard icon={<Award />} color="purple" title="Completed Quizzes" value={stats.completedCount} />
            <StatCard icon={<Target />} color="amber" title="Active Quizzes" value={stats.activeCount} />
          </div>

          {/* 📝 Quizzes Section */}
          <div>
            {Object.keys(quizzesByBatch).length === 0 ? (
              <p className="text-center text-gray-500 py-10">You have no quizzes assigned yet.</p>
            ) : (
              Object.entries(quizzesByBatch).map(([batchName, quizzes]) => (
                <div key={batchName} className="mb-10">
                  <h2 className="text-2xl font-semibold text-slate-800 mb-4">
                    Quizzes for {batchName}
                  </h2>
                  {quizzes.length === 0 ? (
                    <p className="text-gray-500 bg-white p-4 rounded-lg shadow-sm">No quizzes found for this batch.</p>
                  ) : (
                    <div className="space-y-4">
                      {quizzes.map((quiz) => (
                        <QuizCard key={quiz._id} quiz={quiz} getStatusStyle={getStatusStyle} getStatusIcon={getStatusIcon} />
                      ))}
                    </div>
                  )}
                </div>
              ))
            )}
          </div>
        </div>
      </div>
    </StudentLayout>
  );
};

// Component for individual Stat Card
const StatCard = ({ icon, color, title, value }) => {
    const colors = {
        blue: { bg: 'bg-blue-100', text: 'text-blue-600' },
        emerald: { bg: 'bg-emerald-100', text: 'text-emerald-600' },
        purple: { bg: 'bg-purple-100', text: 'text-purple-600' },
        amber: { bg: 'bg-amber-100', text: 'text-amber-600' },
    };
    const selectedColor = colors[color] || colors.blue;

    return (
        <div className="bg-white rounded-2xl p-6 shadow-sm border hover:shadow-lg transition-shadow duration-300">
            <div className="flex justify-between items-start">
                <div>
                    <p className="text-sm text-slate-500 font-medium">{title}</p>
                    <p className={`text-3xl font-bold ${selectedColor.text}`}>{value}</p>
                </div>
                <div className={`w-10 h-10 ${selectedColor.bg} rounded-lg flex items-center justify-center`}>
                    {React.cloneElement(icon, { className: `w-5 h-5 ${selectedColor.text}` })}
                </div>
            </div>
        </div>
    );
};


// Component for individual Quiz Card
const QuizCard = ({ quiz, getStatusStyle, getStatusIcon }) => (
  <div className="bg-white border rounded-xl p-4 hover:shadow-xl transition-shadow duration-300">
    <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center mb-3">
      <div className="flex items-center gap-3 mb-2 sm:mb-0">
        <h3 className="font-semibold text-lg text-gray-800">{quiz.title}</h3>
        <span className={`flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-medium ${getStatusStyle(quiz.status)}`}>
          {getStatusIcon(quiz.status)}
          <span className="capitalize">{quiz.status}</span>
        </span>
      </div>
      {quiz.status === 'completed' && (
        <div className="text-left sm:text-right">
          <p className="text-xs text-gray-500">Your Score</p>
          <p className="text-lg font-bold text-green-600">{quiz.score}%</p>
        </div>
      )}
    </div>

    <div className="grid grid-cols-1 md:grid-cols-3 text-sm text-gray-600 gap-2 mb-4">
      <div className="flex items-center gap-2"><BookOpen className="w-4 h-4 text-gray-400" /><span>{quiz.questions?.length || 0} Questions</span></div>
      <div className="flex items-center gap-2"><Clock className="w-4 h-4 text-gray-400" /><span>{quiz.duration || 30} minutes</span></div>
      <div className="flex items-center gap-2"><Clock className="w-4 h-4 text-gray-400" /><span>Due: {new Date(quiz.deadline).toLocaleString()}</span></div>
    </div>

    <div className="flex justify-end mt-2">
      {quiz.status === 'available' ? (
        <Link to={`/student/quiz/${quiz._id}`} className="bg-teal-600 hover:bg-teal-700 text-white px-5 py-2 rounded-lg text-sm font-medium transition-colors">
          Start Quiz
        </Link>
      ) : quiz.status === 'completed' ? (
        <Link to={`/student/result/${quiz._id}`} className="bg-blue-600 hover:bg-blue-700 text-white px-5 py-2 rounded-lg text-sm font-medium transition-colors">
          View Result
        </Link>
      ) : (
        <button disabled className="bg-gray-400 text-white px-5 py-2 rounded-lg text-sm font-medium cursor-not-allowed">
          Overdue
        </button>
      )}
    </div>
  </div>
);

export default StudentDashboard;
