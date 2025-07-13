import React, { useEffect, useState } from 'react';
import TeacherLayout from '../../components/TeacherLayout';
import { Trophy, Download, Filter } from 'lucide-react';
import axios from '../../api/axios';
import * as XLSX from 'xlsx'

const TeacherLeaderboard = () => {
  const [selectedBatch, setSelectedBatch] = useState('');
  const [selectedQuiz, setSelectedQuiz] = useState('');
  const [leaderboardData, setLeaderboardData] = useState([]);
  const [batches, setBatches] = useState([]);
  const [quizzes, setQuizzes] = useState([]);

  useEffect(() => {
    const fetchLeaderboard = async () => {
      try {
        const params = {};
        if (selectedBatch) params.batchId = selectedBatch;
        if (selectedQuiz) params.quizId = selectedQuiz;

        const res = await axios.get('/teacher/leaderboard', { params });
        setLeaderboardData(res.data.leaderboard || []);
        setBatches(res.data.batchOptions || []);
        setQuizzes(res.data.quizOptions || []);
      } catch (err) {
        console.error('Error fetching leaderboard:', err);
      }
    };

    fetchLeaderboard();
  }, [selectedBatch, selectedQuiz]);

  const getRankColor = (rank) => {
    switch (rank) {
      case 1: return 'text-yellow-600';
      case 2: return 'text-gray-600';
      case 3: return 'text-orange-600';
      default: return 'text-gray-400';
    }
  };

  const getRankIcon = (rank) => {
    if (rank <= 3) {
      return <Trophy className={`h-5 w-5 ${getRankColor(rank)}`} />;
    }
    return <span className="text-gray-400 font-bold">{rank}</span>;
  };

const exportData = () => {
  if (!leaderboardData.length) {
    alert('No data to export.');
    return;
  }

  // Prepare data for Excel
  const excelData = leaderboardData.map((student) => ({
    Rank: student.rank,
    'Student Name': student.name,
    Email: student.email,
    'Score (%)': student.score,
    'Submitted At': new Date(student.submittedAt).toLocaleString()
  }));

  // Create worksheet and workbook
  const worksheet = XLSX.utils.json_to_sheet(excelData);
  const workbook = XLSX.utils.book_new();
  XLSX.utils.book_append_sheet(workbook, worksheet, 'Leaderboard');

  // Export to Excel
  XLSX.writeFile(workbook, 'leaderboard.xlsx');
};


  return (
    <TeacherLayout>
      <div className="p-8">
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-gray-900 mb-2">Leaderboard & Analytics</h1>
          <p className="text-gray-600">View student performance and quiz analytics</p>
        </div>

        {/* Filters */}
        <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6 mb-8">
          <div className="flex items-center space-x-4 mb-6">
            <Filter className="h-5 w-5 text-gray-600" />
            <h2 className="text-lg font-semibold text-gray-900">Filters</h2>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">Select Batch</label>
              <select
                value={selectedBatch}
                onChange={(e) => setSelectedBatch(e.target.value)}
                className="w-full p-3 border border-gray-300 rounded-lg"
              >
                <option value="">All Batches</option>
                {batches.map((batch) => (
                  <option key={batch._id} value={batch._id}>{batch.name}</option>
                ))}
              </select>
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">Select Quiz</label>
              <select
                value={selectedQuiz}
                onChange={(e) => setSelectedQuiz(e.target.value)}
                className="w-full p-3 border border-gray-300 rounded-lg"
              >
                <option value="">All Quizzes</option>
                {quizzes.map((quiz) => (
                  <option key={quiz.id} value={quiz.id}>{quiz.title}</option>
                ))}
              </select>
            </div>
            <div className="flex items-end">
              <button
                onClick={exportData}
                className="w-full bg-green-600 text-white px-4 py-3 rounded-lg hover:bg-green-700 flex items-center justify-center space-x-2"
              >
                <Download className="h-5 w-5" />
                <span>Export Data</span>
              </button>
            </div>
          </div>
        </div>

        {/* Leaderboard Table */}
        <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
          <h2 className="text-xl font-semibold text-gray-900 mb-6">Student Leaderboard</h2>

          {leaderboardData.length === 0 ? (
            <p className="text-gray-500 text-center">No leaderboard data available.</p>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead>
                  <tr className="border-b border-gray-200">
                    <th className="text-left py-3 px-4 font-medium text-gray-700">Rank</th>
                    <th className="text-left py-3 px-4 font-medium text-gray-700">Student Name</th>
                    <th className="text-left py-3 px-4 font-medium text-gray-700">Email</th>
                    <th className="text-left py-3 px-4 font-medium text-gray-700">Score</th>
                    <th className="text-left py-3 px-4 font-medium text-gray-700">Submitted At</th>
                  </tr>
                </thead>
                <tbody>
                  {leaderboardData.map((student) => (
                    <tr
                      key={student.rank}
                      className={`border-b border-gray-100 hover:bg-gray-50 ${
                        student.rank <= 3 ? 'bg-gradient-to-r from-yellow-50 to-orange-50' : ''
                      }`}
                    >
                      <td className="py-3 px-4">
                        <div className="flex items-center space-x-2">
                          {getRankIcon(student.rank)}
                          <span className="font-medium">{student.rank}</span>
                        </div>
                      </td>
                      <td className="py-3 px-4 font-medium text-gray-900">{student.name}</td>
                      <td className="py-3 px-4 text-gray-600">{student.email}</td>
                      <td className="py-3 px-4">
                        <span className={`px-3 py-1 rounded-full text-sm font-medium ${
                          student.score >= 90
                            ? 'bg-green-100 text-green-800'
                            : student.score >= 80
                            ? 'bg-blue-100 text-blue-800'
                            : 'bg-yellow-100 text-yellow-800'
                        }`}>
                          {student.score}%
                        </span>
                      </td>
                      <td className="py-3 px-4 text-gray-600">
                        {new Date(student.submittedAt).toLocaleString()}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>
      </div>
    </TeacherLayout>
  );
};

export default TeacherLeaderboard;
