import React, { useState, useEffect } from 'react';
import TeacherLayout from '../../components/TeacherLayout';
import { Upload, FileText, Brain, Loader2, CheckCircle, AlertCircle } from 'lucide-react';
import axios from '../../api/axios';

const TeacherUpload = () => {
  const [file, setFile] = useState(null);
  const [batches, setBatches] = useState([]);
  const [selectedBatch, setSelectedBatch] = useState('');
  const [generatedQuiz, setGeneratedQuiz] = useState(null);
  const [isGenerating, setIsGenerating] = useState(false);
  const [error, setError] = useState('');
  const [dragActive, setDragActive] = useState(false);
  const [title, setTitle] = useState('');
  const [deadline, setDeadline] = useState('');
  const [duration, setDuration] = useState(30); // default 30 minutes

  useEffect(() => {
    const loadBatches = async () => {
      try {
        const res = await axios.get('/teacher/batches');
        setBatches(res.data || []);
      } catch {
        setError('Failed to load batches.');
      }
    };
    loadBatches();
  }, []);

  const handleDrag = (e) => {
    e.preventDefault(); e.stopPropagation();
    setDragActive(e.type === 'dragenter' || e.type === 'dragover');
  };

  const handleDrop = (e) => {
    e.preventDefault(); e.stopPropagation();
    setDragActive(false);
    if (e.dataTransfer.files?.[0]) {
      setFile(e.dataTransfer.files[0]);
    }
  };

  const handleFileChange = (e) => {
    if (e.target.files?.[0]) setFile(e.target.files[0]);
  };

  const generateQuiz = async () => {
    if (!file || !selectedBatch) return;
    setError('');
    setIsGenerating(true);
    const form = new FormData();
    form.append('file', file);
    form.append('batchId', selectedBatch);

    try {
      const res = await axios.post('/teacher/upload-and-generate', form, {
        headers: { 'Content-Type': 'multipart/form-data' }
      });
      setGeneratedQuiz(res.data.quiz);
    } catch (err) {
      console.error(err);
      setError('Failed to generate quiz.');
    } finally {
      setIsGenerating(false);
    }
  };

  const publishQuiz = async () => {
  try {
    await axios.post(
      '/teacher/publish-quiz',
      {
        batchId: selectedBatch,
        quiz: {
          title,
          deadline,
          duration,
          source: 'manual',
          questions: generatedQuiz.questions
        }
      },
      {
        withCredentials: true // ✅ include cookies (token) in request
      }
    );

    alert('Quiz published successfully!');
    setFile(null);
    setSelectedBatch('');
    setGeneratedQuiz(null);
    setTitle('');
    setDeadline('');
    setDuration(30);
  } catch (err) {
    console.error(err);
    alert('Publishing failed.');
  }
};


  return (
    <TeacherLayout>
      <div className="p-8">
        <h1 className="text-3xl font-bold mb-2">Create Quiz with AI</h1>
        <p className="text-gray-600 mb-6">Upload a PDF and let AI generate the quiz.</p>

        {error && (
          <div className="bg-red-100 text-red-700 p-3 rounded mb-4 flex items-center">
            <AlertCircle className="mr-2" /> {error}
          </div>
        )}

        {!generatedQuiz ? (
          <div className="space-y-6 max-w-2xl mx-auto">
            <div
              onDragEnter={handleDrag}
              onDragLeave={handleDrag}
              onDragOver={handleDrag}
              onDrop={handleDrop}
              className={`border-2 rounded-xl p-6 text-center ${dragActive ? 'border-blue-600 bg-blue-50' : 'border-gray-300'}`}
            >
              <Upload className="w-10 h-10 text-gray-400 mx-auto mb-3" />
              <p className="font-medium mb-1">Drag PDF here or click to upload</p>
              <input type="file" accept=".pdf" id="file-upload" hidden onChange={handleFileChange} />
              <label htmlFor="file-upload" className="inline-block mt-3 bg-blue-600 text-white px-6 py-2 rounded hover:bg-blue-700 cursor-pointer">
                Select File
              </label>
            </div>

            {file && (
              <div className="flex items-center bg-green-50 border border-green-200 rounded p-3">
                <FileText className="w-5 h-5 text-green-600 mr-3" />
                <div>
                  <p className="text-green-800 font-semibold">{file.name}</p>
                  <p className="text-green-600 text-sm">{(file.size / 1024 / 1024).toFixed(2)} MB</p>
                </div>
              </div>
            )}

            <div>
              <label className="block font-semibold mb-2">Select Batch</label>
              <select
                value={selectedBatch}
                onChange={(e) => setSelectedBatch(e.target.value)}
                className="w-full border rounded p-3"
              >
                <option value="">Choose a batch</option>
                {batches.map(b => (
                  <option key={b._id} value={b._id}>{b.name}</option>
                ))}
              </select>
            </div>

            <div>
              <label className="block font-semibold mb-2">Quiz Title</label>
              <input
                type="text"
                value={title}
                onChange={(e) => setTitle(e.target.value)}
                placeholder="Enter quiz title"
                className="w-full border rounded p-3"
              />
            </div>

            <div>
              <label className="block font-semibold mb-2">Deadline</label>
              <input
                type="datetime-local"
                value={deadline}
                onChange={(e) => setDeadline(e.target.value)}
                className="w-full border rounded p-3"
              />
            </div>

            <div>
              <label className="block font-semibold mb-2">Duration (minutes)</label>
              <input
                type="number"
                value={duration}
                onChange={(e) => setDuration(Number(e.target.value))}
                className="w-full border rounded p-3"
                min="1"
              />
            </div>

            <button
              onClick={generateQuiz}
              disabled={!file || !selectedBatch || isGenerating}
              className={`w-full py-3 rounded-lg font-medium flex justify-center items-center space-x-2 ${
                isGenerating ? 'bg-gray-400 cursor-not-allowed' : 'bg-blue-600 hover:bg-blue-700 text-white'
              }`}
            >
              {isGenerating
                ? (<><Loader2 className="w-5 h-5 animate-spin" /><span>Generating Quiz...</span></>)
                : (<><Brain className="w-5 h-5" /><span>Generate Quiz with AI</span></>)
              }
            </button>
          </div>
        ) : (
          <div className="max-w-4xl mx-auto space-y-6">
            <div className="flex justify-between items-center">
              <h2 className="text-xl font-bold">Quiz Preview</h2>
              <div className="flex items-center text-green-600">
                <CheckCircle className="w-5 h-5 mr-1" />
                <span>Generated</span>
              </div>
            </div>

            <div className="mb-6">
              <h3 className="text-lg font-semibold">Title: {title}</h3>
              {deadline && <p className="text-sm text-gray-600">Deadline: {new Date(deadline).toLocaleString()}</p>}
              <p className="text-sm text-gray-600">Duration: {duration} minutes</p>
            </div>

            {generatedQuiz.questions.map((q, index) => (
              <div key={index} className="border rounded p-4">
                <h4 className="font-semibold mb-2">Q{index + 1}: {q.question}</h4>
                <div className="grid grid-cols-2 gap-2">
                  {q.options.map((opt, i) => (
                    <div key={i} className={`p-2 rounded border ${
                      i === q.correct ? 'bg-green-50 border-green-300 text-green-800' : 'bg-gray-50 border-gray-200'
                    }`}>
                      <span>{String.fromCharCode(65 + i)}. {opt}</span>
                      {i === q.correct && <span className="ml-2 text-green-600">✓</span>}
                    </div>
                  ))}
                </div>
              </div>
            ))}

            <div className="flex gap-4">
              <button
                onClick={publishQuiz}
                className="flex-1 bg-green-600 hover:bg-green-700 text-white py-3 rounded font-semibold"
              >
                Publish Quiz
              </button>
              <button
                onClick={() => setGeneratedQuiz(null)}
                className="flex-1 bg-gray-500 hover:bg-gray-600 text-white py-3 rounded font-semibold"
              >
                Generate New
              </button>
            </div>
          </div>
        )}
      </div>
    </TeacherLayout>
  );
};

export default TeacherUpload;
