// controllers/aiController.js

import axios from 'axios';
import dotenv from 'dotenv';


// ✅ Load environment variables
dotenv.config();

export const askAI = async (req, res) => {
  const { question } = req.body;

  const GOOGLE_API_KEY = process.env.GOOGLE_API_KEY;

  if (!GOOGLE_API_KEY) {
    console.error("❌ GOOGLE_API_KEY is missing from environment");
    return res.status(500).json({ error: "Google API key not found" });
  }

  try {
    // ✅ FIX: Updated the model name to a current, valid one.
    const url = `https://generativelanguage.googleapis.com/v1beta/models/gemini-1.5-flash-latest:generateContent?key=${GOOGLE_API_KEY}`;

    const response = await axios.post(
      url,
      {
        // The payload structure is correct for Google's API
        contents: [{
          parts: [{
            text: question
          }]
        }]
      },
      {
        headers: {
          'Content-Type': 'application/json'
        }
      }
    );

    // The response structure is also different
    const candidates = response.data?.candidates;
const answer = candidates?.[0]?.content?.parts?.[0]?.text?.trim();

if (!answer) {
  return res.json({ answer: "Sorry, I couldn't generate a response. Please try again." });
}

res.json({ answer });
console.log(answer);

  } catch (error) {
    console.error("Google AI API error:", error.response?.data || error.message);
    res.status(500).json({ error: 'Failed to fetch AI response' });
  }
};




