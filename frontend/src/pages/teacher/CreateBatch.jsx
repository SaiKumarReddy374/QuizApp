import React, { useState } from 'react';
import axios from '../../api/axios'; // Uses instance with withCredentials: true
import TeacherLayout from '../../components/TeacherLayout';

const CreateBatch = () => {
  const [batchName, setBatchName] = useState('');
  const [studentEmails, setStudentEmails] = useState('');
  const [message, setMessage] = useState('');
  const [error, setError] = useState('');

  const handleSubmit = async (e) => {
    e.preventDefault();
    setMessage('');
    setError('');

    try {
      // You can later fetch userIds by emails if needed
      const res = await axios.post('/teacher/batch/create', {
        name: batchName,
        students: [] // Modify to send actual student ObjectIds if available
      });

      setMessage(`Batch "${res.data.batch.name}" created successfully.`);
      setBatchName('');
      setStudentEmails('');
    } catch (err) {
      setError(err.response?.data?.error || 'Failed to create batch.');
    }
  };

  return (
    <TeacherLayout>
      <div className="max-w-xl mx-auto mt-10 p-6 bg-white shadow rounded-lg">
        <h2 className="text-2xl font-bold mb-4 text-gray-800">Create a New Batch</h2>
        <form onSubmit={handleSubmit}>
          <div className="mb-4">
            <label className="block font-medium text-gray-700 mb-1">Batch Name</label>
            <input
              type="text"
              value={batchName}
              onChange={(e) => setBatchName(e.target.value)}
              required
              className="w-full border border-gray-300 p-2 rounded-lg focus:outline-none focus:ring focus:ring-blue-300"
              placeholder="e.g., CS-A 2025"
            />
          </div>

          {/* You can later enable adding student emails for lookups */}
          {/* <div className="mb-4">
            <label className="block font-medium text-gray-700 mb-1">Student Emails (optional)</label>
            <textarea
              value={studentEmails}
              onChange={(e) => setStudentEmails(e.target.value)}
              className="w-full border border-gray-300 p-2 rounded-lg focus:outline-none focus:ring focus:ring-blue-300"
              placeholder="Comma-separated emails"
            />
          </div> */}

          <button
            type="submit"
            className="bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 transition"
          >
            Create Batch
          </button>

          {message && <p className="mt-4 text-green-600 font-medium">{message}</p>}
          {error && <p className="mt-4 text-red-600 font-medium">{error}</p>}
        </form>
      </div>
    </TeacherLayout>
  );
};

export default CreateBatch;
