import React from 'react';
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import LandingPage from './pages/LandingPage';
import Login from './pages/auth/Login';
import Register from './pages/auth/Register';
import TeacherDashboard from './pages/teacher/Dashboard';
import StudentDashboard from './pages/student/Dashboard';
import TeacherUpload from './pages/teacher/Upload';
import TeacherManualCreate from './pages/teacher/ManualCreate';
import TeacherLeaderboard from './pages/teacher/Leaderboard';
import StudentQuiz from './pages/student/Quiz';
import StudentResult from './pages/student/Result';
import StudentAskAI from './pages/student/AskAI';
import CreateBatch from './pages/teacher/CreateBatch';
import TeacherQuizzes from './pages/teacher/TeacherQuizzes';
import JoinBatch from './pages/student/JoinBatch';
import StudentMyResults from './pages/student/StudentMyResult';
import ActiveQuizzes from './pages/student/ActiveQuizzes';

function App() {
  return (
    <Router>
      <div className="min-h-screen bg-gray-50">
        <Routes>
          <Route path="/" element={<LandingPage />} />
          <Route path="/login" element={<Login />} />
          <Route path="/register" element={<Register />} />
          <Route path="/teacher/dashboard" element={<TeacherDashboard />} />
          <Route path="/teacher/upload" element={<TeacherUpload />} />
          <Route path="/teacher/manual-create" element={<TeacherManualCreate />} />
          <Route path="/teacher/leaderboard" element={<TeacherLeaderboard />} />
          <Route path="/student/dashboard" element={<StudentDashboard />} />
          <Route path="/student/quiz/:quizId" element={<StudentQuiz />} />
          <Route path="/student/result/:quizId" element={<StudentResult />} />
          <Route path="/student/ask-ai" element={<StudentAskAI />} />
          <Route path="/teacher/batches/create" element={<CreateBatch />} />
          <Route path="/teacher/quizzes" element={<TeacherQuizzes />} />
          <Route path="/student/join-batch" element={<JoinBatch />} />
          <Route path="/student/my-results" element={<StudentMyResults />} />
          <Route path="/student/active-quizzes" element={<ActiveQuizzes/>} />

        </Routes>
      </div>
    </Router>
  );
}

export default App;