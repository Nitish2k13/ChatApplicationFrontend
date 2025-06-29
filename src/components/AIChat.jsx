import React, { useState } from 'react';
import { Volume2 } from 'lucide-react';

export default function AIChat({ username }) {
  const [newMessage, setNewMessage] = useState('');
  const [chatHistory, setChatHistory] = useState([]);
  
  const speakText = (text) => {
    const utterance = new SpeechSynthesisUtterance(text);
    speechSynthesis.cancel();
    speechSynthesis.speak(utterance);
  };

  const sendToAI = async () => {
    if (!newMessage.trim()) return;

    const userMessage = newMessage.trim();
    setChatHistory(prev => [...prev, { user: userMessage, ai: "..." }]);
    setNewMessage('');

    try {
      const res = await fetch('https://openrouter.ai/api/v1/chat/completions', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': 'Bearer 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',
        },
        body: JSON.stringify({
          model: 'google/gemma-3n-e4b-it:free',
          messages: [{ role: 'user', content: userMessage }],
        }),
      });

      const data = await res.json();
      const aiReply = data.choices?.[0]?.message?.content || 'No reply.';
      setChatHistory(prev => [
        ...prev.slice(0, -1),
        { user: userMessage, ai: aiReply }
      ]);
    } catch (err) {
      console.error(err);
      setChatHistory(prev => [
        ...prev.slice(0, -1),
        { user: userMessage, ai: 'Error contacting AI.' }
      ]);
    }
  };

  return (
    <div className="w-full p-4 border rounded-lg bg-white shadow-md">
      <h2 className="text-xl font-semibold mb-4">Ask AI Assistant</h2>

      <div className="max-h-60 overflow-y-auto space-y-3 mb-4">
        {chatHistory.map((chat, index) => (
          <div key={index} className="flex flex-col space-y-1">
            <div className="bg-gray-100 px-4 py-2 rounded-md text-sm text-gray-800">
              <strong>{username}:</strong> {chat.user}
            </div>
            <div className="bg-blue-100 px-4 py-2 rounded-md text-sm text-blue-900 relative">
              <strong>AI:</strong> {chat.ai}
              <button
                onClick={() => speakText(chat.ai)}
                title="Speak AI reply"
                className="absolute top-2 right-2 text-blue-600 hover:text-blue-800"
              >
                <Volume2 size={16} />
              </button>
            </div>
          </div>
        ))}
      </div>

      <div className="flex space-x-2 mt-2">
        <input
          type="text"
          className="flex-1 border rounded px-3 py-2"
          placeholder="Ask something..."
          value={newMessage}
          onChange={(e) => setNewMessage(e.target.value)}
          onKeyDown={(e) => e.key === 'Enter' && sendToAI()}
        />
        <button
          className="bg-blue-600 text-white px-4 py-2 rounded"
          onClick={sendToAI}
        >
          Ask
        </button>
      </div>
    </div>
  );
}
