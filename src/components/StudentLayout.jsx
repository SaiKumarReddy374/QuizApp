import React, { useEffect } from 'react';
import { Link, useLocation, useNavigate } from 'react-router-dom';
import {
  LayoutDashboard,
  MessageCircle,
  Trophy,
  LogOut,
  Brain,
  Users,
  Rocket
} from 'lucide-react';
import { useAuth } from '../context/AuthContext';

const StudentLayout = ({ children }) => {
  const location = useLocation();
  const navigate = useNavigate();
  const { token, checkAuth, logout } = useAuth();

  useEffect(() => {
    if (typeof checkAuth === 'function') {
      checkAuth();
    }
  }, []);

  useEffect(() => {
    if (token === null) {
      navigate('/login');
    }
  }, [token]);

  const navigation = [
    { name: 'Dashboard', href: '/student/dashboard', icon: LayoutDashboard },
    { name: 'Batches', href: '/student/join-batch', icon: Users },
    { name: 'My Results', href: '/student/my-results', icon: Trophy },
    { name: 'Active Quizzes', href: '/student/active-quizzes', icon: Rocket },
    { name: 'Ask AI', href: '/student/ask-ai', icon: MessageCircle },
  ];

  const isActive = (path) => location.pathname === path;

  const handleLogout = async () => {
    await logout();
    navigate('/login');
  };

  return (
    <div className="min-h-screen flex bg-gray-50">
      {/* Sidebar */}
      <aside className="w-64 bg-white shadow-md border-r border-gray-200 flex flex-col justify-between">
        <div>
          <div className="p-6">
            <div className="flex items-center space-x-2">
              <Brain className="h-8 w-8 text-teal-600" />
              <span className="text-xl font-bold text-gray-900">QuizAI</span>
            </div>
            <p className="text-sm text-gray-600 mt-1">Student Dashboard</p>
          </div>

          <nav className="mt-6 space-y-1">
            {navigation.map((item) => {
              const Icon = item.icon;
              return (
                <Link
                  key={item.name}
                  to={item.href}
                  className={`flex items-center px-6 py-3 text-sm font-medium transition-colors ${
                    isActive(item.href)
                      ? 'bg-teal-50 text-teal-700 border-r-2 border-teal-700'
                      : 'text-gray-700 hover:text-teal-700 hover:bg-gray-50'
                  }`}
                >
                  <Icon className="h-5 w-5 mr-3" />
                  {item.name}
                </Link>
              );
            })}
          </nav>
        </div>

        <div className="p-6">
          <button
            onClick={handleLogout}
            className="flex items-center text-gray-700 hover:text-red-600 transition-colors"
          >
            <LogOut className="h-5 w-5 mr-3" />
            <span className="text-sm font-medium">Logout</span>
          </button>
        </div>
      </aside>

      {/* Main Content */}
      <main className="flex-1 overflow-y-auto p-6">{children}</main>
    </div>
  );
};

export default StudentLayout;
