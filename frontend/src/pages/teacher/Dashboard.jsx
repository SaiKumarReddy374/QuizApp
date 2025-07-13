import React, { useEffect, useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import TeacherLayout from '../../components/TeacherLayout';
import {
  BookOpen,
  Users,
  FileText,
  TrendingUp,
  BarChart3,
  Plus,
  Upload,
  Brain
} from 'lucide-react';
import axios from '../../api/axios';

const Dashboard = () => {
  const { token } = useAuth();
  const navigate = useNavigate();

  const [teacherName, setTeacherName] = useState('Teacher');
  const [stats, setStats] = useState([]);
  const [recentQuizzes, setRecentQuizzes] = useState([]);

  useEffect(() => {
    if (!token) {
      navigate('/login');
      return;
    }

    const fetchData = async () => {
      try {
        const profileRes = await axios.get('/teacher/profile'); // token sent via cookie
        const dashboardRes = await axios.get('/teacher/dashboard');

        const name = profileRes.data?.name || 'Teacher';
        const metrics = dashboardRes.data?.metrics || {
          totalQuizzes: 10,
          activeStudents: 0,
          avgScore: 50,
          totalBatches: 0
        };
        const quizzes = dashboardRes.data?.quizzes || [];

        setTeacherName(name);
        setRecentQuizzes(quizzes);
        setStats([
          { name: 'Total Quizzes', value: metrics.totalQuizzes, icon: BookOpen, color: 'bg-blue-500' },
          { name: 'Active Students', value: metrics.activeStudents, icon: Users, color: 'bg-green-500' },
          { name: 'Avg. Score', value: `${metrics.avgScore}%`, icon: TrendingUp, color: 'bg-purple-500' },
          { name: 'Total Batches', value: metrics.totalBatches, icon: FileText, color: 'bg-orange-500' },
        ]);
      } catch (err) {
        console.error('Failed to load dashboard data:', err);
        setTeacherName('Teacher');
        setStats([
          { name: 'Total Quizzes', value: 0, icon: BookOpen, color: 'bg-blue-500' },
          { name: 'Active Students', value: 0, icon: Users, color: 'bg-green-500' },
          { name: 'Avg. Score', value: '0%', icon: TrendingUp, color: 'bg-purple-500' },
          { name: 'Total Batches', value: 0, icon: FileText, color: 'bg-orange-500' },
        ]);
        setRecentQuizzes([]);
      }
    };

    fetchData();
  }, [token, navigate]);

  return (
    <TeacherLayout>
      <div className="p-8">
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-gray-900 mb-2">
            Welcome back, {teacherName}! 👋
          </h1>
          <p className="text-gray-600">Here's what's happening with your classes today.</p>
        </div>

        {/* Stats Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
          {stats.map((stat) => {
            const Icon = stat.icon;
            return (
              <div key={stat.name} className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm font-medium text-gray-600">{stat.name}</p>
                    <p className="text-2xl font-bold text-gray-900">{stat.value}</p>
                  </div>
                  <div className={`${stat.color} p-3 rounded-lg`}>
                    <Icon className="h-6 w-6 text-white" />
                  </div>
                </div>
              </div>
            );
          })}
        </div>

        {/* Quick Actions */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 mb-8">
          <Link
            to="/teacher/upload"
            className="group bg-gradient-to-br from-blue-500 to-blue-600 text-white p-6 rounded-xl shadow-lg hover:shadow-xl transition-all duration-300 hover:-translate-y-1"
          >
            <div className="flex items-center justify-between mb-4">
              <Brain className="h-8 w-8" />
              <div className="bg-white bg-opacity-20 p-2 rounded-lg">
                <Upload className="h-5 w-5" />
              </div>
            </div>
            <h3 className="text-xl font-bold mb-2">Create Quiz with AI</h3>
            <p className="text-blue-100 text-sm">
              Upload your materials and let AI generate comprehensive quizzes
            </p>
          </Link>

          <Link
            to="/teacher/manual-create"
            className="group bg-gradient-to-br from-teal-500 to-teal-600 text-white p-6 rounded-xl shadow-lg hover:shadow-xl transition-all duration-300 hover:-translate-y-1"
          >
            <div className="flex items-center justify-between mb-4">
              <BookOpen className="h-8 w-8" />
              <div className="bg-white bg-opacity-20 p-2 rounded-lg">
                <Plus className="h-5 w-5" />
              </div>
            </div>
            <h3 className="text-xl font-bold mb-2">Create Manual Quiz</h3>
            <p className="text-teal-100 text-sm">
              Build custom quizzes with your own questions and answers
            </p>
          </Link>

          <Link
            to="/teacher/leaderboard"
            className="group bg-gradient-to-br from-purple-500 to-purple-600 text-white p-6 rounded-xl shadow-lg hover:shadow-xl transition-all duration-300 hover:-translate-y-1"
          >
            <div className="flex items-center justify-between mb-4">
              <BarChart3 className="h-8 w-8" />
              <div className="bg-white bg-opacity-20 p-2 rounded-lg">
                <TrendingUp className="h-5 w-5" />
              </div>
            </div>
            <h3 className="text-xl font-bold mb-2">View Leaderboard</h3>
            <p className="text-purple-100 text-sm">
              Check student performance and analytics
            </p>
          </Link>
        </div>

        {/* Recent Quizzes */}
        <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
          <div className="flex items-center justify-between mb-6">
            <h2 className="text-xl font-bold text-gray-900">Recent Quizzes</h2>
            <Link
              to="/teacher/quizzes"
              className="text-blue-600 hover:text-blue-700 text-sm font-medium"
            >
              View All
            </Link>
          </div>

          <div className="overflow-x-auto">
            <table className="w-full">
              <thead>
                <tr className="border-b border-gray-200">
                  <th className="text-left py-3 px-4 font-medium text-gray-700">Quiz Title</th>
                  <th className="text-left py-3 px-4 font-medium text-gray-700">Batch</th>
                  <th className="text-left py-3 px-4 font-medium text-gray-700">Students</th>
                  <th className="text-left py-3 px-4 font-medium text-gray-700">Avg. Score</th>
                  <th className="text-left py-3 px-4 font-medium text-gray-700">Action</th>
                </tr>
              </thead>
              <tbody>
                {recentQuizzes.length === 0 ? (
                  <tr>
                    <td colSpan="5" className="text-center py-4 text-gray-500">
                      No quizzes found.
                    </td>
                  </tr>
                ) : (
                  recentQuizzes.map((quiz) => (
                    <tr key={quiz._id} className="border-b border-gray-100 hover:bg-gray-50">
                      <td className="py-3 px-4 font-medium text-gray-900">{quiz.title}</td>
                      <td className="py-3 px-4 text-gray-600">{quiz.batch}</td>
                      <td className="py-3 px-4 text-gray-600">{quiz.students}</td>
                      <td className="py-3 px-4">
                        <span className={`px-2 py-1 rounded-full text-xs font-medium ${
                          quiz.avgScore >= 80
                            ? 'bg-green-100 text-green-800'
                            : 'bg-yellow-100 text-yellow-800'
                        }`}>
                          {quiz.avgScore}%
                        </span>
                      </td>
                      <td className="py-3 px-4">
                        <button className="text-blue-600 hover:text-blue-800 text-sm font-medium">
                          View Details
                        </button>
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
        </div>
      </div>
    </TeacherLayout>
  );
};

export default Dashboard;
