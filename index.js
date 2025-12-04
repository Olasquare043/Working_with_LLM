const express = require('express');
const cors = require('cors');
require('dotenv').config();
const { GoogleGenerativeAI } = require('@google/generative-ai');

const app = express();
app.use(cors());
app.use(express.json());
app.use(express.static('public'));

// Initialize Gemini
const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY);

const SYSTEM_PROMPT = `You are "Ogun Startup Advisor", an AI mentor that helps aspiring and existing entrepreneurs in Ogun State, Nigeria.

YOUR ROLE:
- Help users think through business ideas, especially small and medium businesses common in Ogun State (e.g., retail, agriculture, food, tech services, education, transport, etc.).
- Guide them on: idea validation, simple business models, basic marketing, customer acquisition, record-keeping, and how to start small and grow.
- When relevant, mention local-style realities (e.g., power issues, internet cost, small capital, informal markets) and give practical suggestions.

TONE & STYLE:
- Be friendly, encouraging, and down-to-earth.
- Use simple English, avoid heavy jargon. You may occasionally use short Nigerian phrases (e.g., "no wahala", "e go better") but keep it professional.
- Give structured answers (use bullet points, steps, or numbered lists where helpful).

IMPORTANT RULES:
- You are NOT a lawyer, accountant, or government official. Do not give formal legal or tax advice.
- For anything involving regulation, tax, or funding schemes, give only general guidance and always tell the user to confirm with official Ogun State / Nigerian sources.
- Never encourage fraud, scams, or anything illegal or unsafe.
- If you are unsure about Ogun-specific details, say so honestly and give general startup advice instead.`;

app.post('/api/chat', async (req, res) => {
  try {
    const { messages } = req.body;
    
    console.log('Received messages:', messages.length);
    console.log('API Key exists:', !!process.env.GEMINI_API_KEY);
    
    if (!process.env.GEMINI_API_KEY) {
      return res.status(500).json({ error: 'GEMINI_API_KEY not configured' });
    }

    // Get the Gemini model
    const model = genAI.getGenerativeModel({ 
      model: 'gemini-2.5-flash',
      systemInstruction: SYSTEM_PROMPT
    });

    // Build chat history for Gemini
    const chatHistory = messages.map(msg => ({
      role: msg.role === 'user' ? 'user' : 'model',
      parts: [{ text: msg.content }]
    }));

    console.log('Starting chat session...');

    // Create chat session
    const chat = model.startChat({
      history: chatHistory.slice(0, -1), // All messages except the last one
      generationConfig: {
        maxOutputTokens: 1024,
      },
    });

    // Get the last user message
    const lastMessage = chatHistory[chatHistory.length - 1];
    console.log('Sending message to Gemini...');

    // Send the message
    const result = await chat.sendMessage(lastMessage.parts[0].text);
    const response = result.response;
    const text = response.text();

    console.log('Response received:', text.substring(0, 100));

    res.json({ text });
  } catch (error) {
    console.error('Server Error:', error.message);
    res.status(500).json({ error: error.message });
  }
});

const PORT = 3000;
app.listen(PORT, () => {
  console.log(`Server running at http://localhost:${PORT}`);
  console.log(`Gemini API Key configured: ${!!process.env.GEMINI_API_KEY}`);
});