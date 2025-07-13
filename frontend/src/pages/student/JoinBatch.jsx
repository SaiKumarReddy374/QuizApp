import React, { useEffect, useState } from 'react';
import axios from '../../api/axios';
import StudentLayout from '../../components/StudentLayout';

const JoinBatch = () => {
  const [batches, setBatches] = useState([]);
  const [selectedBatch, setSelectedBatch] = useState('');
  const [message, setMessage] = useState('');
  const [error, setError] = useState('');
  const [joinedBatches, setJoinedBatches] = useState([]);

  const fetchBatches = async () => {
    try {
      const res = await axios.get('/student/batches');
      setBatches(res.data);
    } catch (err) {
      console.error('Failed to fetch batches');
      setError('Could not load batches. Please try again later.');
    }
  };

  const fetchProfile = async () => {
    try {
      const res = await axios.get('/student/profile');
      setJoinedBatches(res.data.batches || []);
    } catch (err) {
      console.error('Failed to fetch joined batches');
      setError('Could not load your joined batches.');
    }
  };

  useEffect(() => {
    fetchBatches();
    fetchProfile();
  }, []);

  const handleJoin = async () => {
    try {
      setMessage('');
      setError('');
      const res = await axios.post('/student/join-batch', { batchId: selectedBatch });
      setMessage(res.data.message || 'Successfully joined the batch');
      fetchProfile(); // Refresh joined batches
    } catch (err) {
      setMessage('');
      setError(err.response?.data?.message || 'Failed to join batch');
    }
  };

  const handleLeave = async (batchId) => {
    try {
      setMessage('');
      setError('');
      const res = await axios.delete(`/student/leave-batch/${batchId}`);
      setMessage(res.data.message || 'Left the batch successfully');
      fetchProfile(); // Refresh joined batches
    } catch (err) {
      setError(err.response?.data?.message+"58" || 'Failed to leave the batch');
    }
  };

  return (
    <StudentLayout>
      <div className="p-6 max-w-2xl mx-auto">
        <h2 className="text-2xl font-bold mb-4 text-gray-800">Join a Batch</h2>

        {error && <p className="mb-4 text-red-600">{error}</p>}
        {message && <p className="mb-4 text-green-600">{message}</p>}

        {/* Join Batch Select */}
        <div className="mb-6">
          <select
            className="border border-gray-300 p-2 w-full mb-4 rounded"
            value={selectedBatch}
            onChange={(e) => setSelectedBatch(e.target.value)}
          >
            <option value="">Select a Batch</option>
            {batches.map((batch) => (
              <option key={batch._id} value={batch._id}>
                {batch.name}
              </option>
            ))}
          </select>

          <button
            className={`px-4 py-2 rounded w-full ${
              selectedBatch
                ? 'bg-blue-600 hover:bg-blue-700 text-white'
                : 'bg-gray-300 text-gray-500 cursor-not-allowed'
            }`}
            onClick={handleJoin}
            disabled={!selectedBatch}
          >
            Join
          </button>
        </div>

        

        {/* Joined Batches */}
        <div>
          <h3 className="text-lg font-semibold text-gray-700 mb-2">Your Batches</h3>
          {joinedBatches.length === 0 ? (
            <p className="text-gray-500">You haven't joined any batches yet.</p>
          ) : (
            <ul className="space-y-2">
              {joinedBatches.map((batch) => (
                <li
                  key={batch._id}
                  className="flex justify-between items-center border p-3 rounded bg-white"
                >
                  <span className="font-medium text-gray-800">{batch.name}</span>
                  <button
                    onClick={() => handleLeave(batch._id)}
                    className="text-red-600 hover:underline text-sm"
                  >
                    Leave
                  </button>
                </li>
              ))}
            </ul>
          )}
        </div>
      </div>
    </StudentLayout>
  );
};

export default JoinBatch;
