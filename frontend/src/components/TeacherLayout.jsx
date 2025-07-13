import React from 'react';
import { Link, useLocation, useNavigate } from 'react-router-dom';
import {
  LayoutDashboard,
  Upload,
  BookOpen,
  Users,
  BarChart3,
  LogOut,
  Brain,
  FileText
} from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import { useEffect } from 'react';

const TeacherLayout = ({ children }) => {
  const location = useLocation();
  const navigate = useNavigate();
  const { token, logout, loading } = useAuth();

  // Redirect to login if not authenticated
  useEffect(() => {
    if (!loading && !token) {
      navigate('/login');
    }
  }, [token, loading, navigate]);

  const navigation = [
    { name: 'Dashboard', href: '/teacher/dashboard', icon: LayoutDashboard },
    { name: 'Upload Material', href: '/teacher/upload', icon: Upload },
    { name: 'Create Quiz', href: '/teacher/manual-create', icon: BookOpen },
    { name: 'My Quizzes', href: '/teacher/quizzes', icon: FileText },
    { name: 'Leaderboard', href: '/teacher/leaderboard', icon: BarChart3 },
    { name: 'Batches', href: '/teacher/batches/create', icon: Users },
  ];

  const isActive = (path) => location.pathname === path;

  const handleLogout = async () => {
    await logout();
    navigate('/login');
  };

  if (loading) {
    return <div className="p-8 text-gray-500">Checking authentication...</div>;
  }

  if (!token) return null;

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="flex">
        {/* Sidebar */}
        <div className="w-64 bg-white shadow-lg border-r border-gray-200">
          <div className="p-6">
            <div className="flex items-center space-x-2">
              <Brain className="h-8 w-8 text-blue-600" />
              <span className="text-xl font-bold text-gray-900">QuizAI</span>
            </div>
            <p className="text-sm text-gray-600 mt-1">Teacher Dashboard</p>
          </div>

          <nav className="mt-6">
            {navigation.map((item) => {
              const Icon = item.icon;
              return (
                <Link
                  key={item.name}
                  to={item.href}
                  className={`flex items-center px-6 py-3 text-sm font-medium transition-colors ${
                    isActive(item.href)
                      ? 'bg-blue-50 text-blue-700 border-r-2 border-blue-700'
                      : 'text-gray-700 hover:text-blue-700 hover:bg-gray-50'
                  }`}
                >
                  <Icon className="h-5 w-5 mr-3" />
                  {item.name}
                </Link>
              );
            })}
          </nav>

          <div className="absolute bottom-0 w-64 p-6">
            <button
              onClick={handleLogout}
              className="flex items-center text-gray-700 hover:text-red-600 transition-colors"
            >
              <LogOut className="h-5 w-5 mr-3" />
              <span className="text-sm font-medium">Logout</span>
            </button>
          </div>
        </div>

        {/* Main Content */}
        <div className="flex-1 overflow-auto">{children}</div>
      </div>
    </div>
  );
};

export default TeacherLayout;
