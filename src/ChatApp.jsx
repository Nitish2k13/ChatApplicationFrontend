import React, { useEffect, useState, useRef } from 'react';
import { Client } from '@stomp/stompjs';
import SockJS from 'sockjs-client';
import axios from 'axios';

const BACKEND_URL = 'http://localhost:8080';
const SOCKET_URL = BACKEND_URL + '/chat-websocket';

export default function ChatApp() {
  const [username, setUsername] = useState(() => localStorage.getItem('chatUsername') || '');
  const [entered, setEntered] = useState(() => !!localStorage.getItem('chatUsername'));
  const [activeTab, setActiveTab] = useState('friends');
  const [message, setMessage] = useState('');
  const [messages, setMessages] = useState([]);
  const [file, setFile] = useState(null);
  const clientRef = useRef(null);
  const messageEndRef = useRef(null);

  // AI chat state
  const [aiInput, setAiInput] = useState('');
  const [aiResponse, setAiResponse] = useState('');
  const [aiLoading, setAiLoading] = useState(false);

  useEffect(() => {
    if (entered && activeTab === 'friends' && !clientRef.current) {
      const socket = new SockJS(SOCKET_URL);
      const client = new Client({
        webSocketFactory: () => socket,
        debug: () => {}, // mute logs
        onConnect: () => {
          client.subscribe('/topic/public', message => {
            const received = JSON.parse(message.body);
            setMessages(prev => [...prev, received]);
          });
          client.publish({
            destination: '/app/chat.newUser',
            body: JSON.stringify({ sender: username, type: 'JOIN' }),
          });
        },
      });
      client.activate();
      clientRef.current = client;
    }
  }, [entered, activeTab, username]);

  useEffect(() => {
    messageEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages]);

  const handleEnter = () => {
    if (username.trim()) {
      localStorage.setItem('chatUsername', username.trim());
      setEntered(true);
    }
  };

  const sendMessage = () => {
    if (message.trim()) {
      const msg = { sender: username, content: message, type: 'CHAT' };
      clientRef.current.publish({ destination: '/app/chat.send', body: JSON.stringify(msg) });
      setMessage('');
    }
  };

  const handleUpload = async () => {
    if (!file) return;
    const formData = new FormData();
    formData.append('file', file);
    formData.append('sender', username);
    try {
      await axios.post(`${BACKEND_URL}/chat/upload`, formData);
      setFile(null);
    } catch (err) {
      console.error('Upload failed', err);
    }
  };

  const pinMessage = async (id, pinned) => {
    try {
      await axios.post(`${BACKEND_URL}/chat/pin/${id}?pinned=${!pinned}`);
      setMessages(prev => prev.map(m => (m.id === id ? { ...m, pinned: !pinned } : m)));
    } catch (err) {
      console.error('Pin failed', err);
    }
  };

  const speakText = text => {
    if (!text) return;
    const utterance = new SpeechSynthesisUtterance(text);
    utterance.lang = 'en-US';
    speechSynthesis.cancel();
    speechSynthesis.speak(utterance);
  };

  const sendAiMessage = async () => {
    if (!aiInput.trim()) return;
    setAiLoading(true);
    try {
      const res = await fetch('https://openrouter.ai/api/v1/chat/completions', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: 'Bearer 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',
        },
        body: JSON.stringify({
          model: 'google/gemma-3n-e4b-it:free',
          messages: [{ role: 'user', content: aiInput.trim() }],
        }),
      });
      const data = await res.json();
      const response = data.choices?.[0]?.message?.content || 'No response received.';
      setAiResponse(response);
    } catch {
      setAiResponse('Error contacting AI API.');
    }
    setAiLoading(false);
    setAiInput('');
  };

  if (!entered) {
    return (
      <div className="flex flex-col items-center justify-center h-screen bg-blue-50">
        <h1 className="text-3xl mb-4 font-bold">Enter your name to chat</h1>
        <input
          type="text"
          className="border rounded p-2 mb-2 w-64"
          value={username}
          onChange={e => setUsername(e.target.value)}
          placeholder="Your name"
          onKeyDown={e => e.key === 'Enter' && handleEnter()}
        />
        <button className="bg-blue-600 text-white px-4 py-2 rounded" onClick={handleEnter} disabled={!username.trim()}>
          Enter
        </button>
      </div>
    );
  }

  return (
    <div className="h-screen flex flex-col bg-gray-100">
      <div className="bg-blue-600 text-white p-4 text-center font-bold text-xl">Welcome, {username}</div>

      <div className="flex justify-center mt-2 space-x-4">
        <button
          className={`px-4 py-2 rounded ${activeTab === 'friends' ? 'bg-blue-500 text-white' : 'bg-white border'}`}
          onClick={() => setActiveTab('friends')}
        >
          Chat with Friends
        </button>
        <button
          className={`px-4 py-2 rounded ${activeTab === 'ai' ? 'bg-blue-500 text-white' : 'bg-white border'}`}
          onClick={() => setActiveTab('ai')}
        >
          Chat with AI
        </button>
      </div>

      {activeTab === 'friends' ? (
        <div className="flex flex-col flex-1 overflow-hidden px-4 py-2">
          <div className="flex-1 overflow-y-auto space-y-4 mb-4">
            {messages.map(msg => {
              const isMe = msg.sender === username;
              const isFile = !!msg.fileUrl;
              return (
                <div
                  key={msg.id || msg.content + msg.timestamp}
                  className={`flex ${isMe ? 'justify-end' : 'justify-start'}`}
                >
                  <div
                    className={`max-w-[70%] px-4 py-3 rounded-lg relative
                      ${isMe ? 'bg-blue-500 text-white rounded-br-none' : 'bg-gray-200 text-gray-900 rounded-bl-none'}
                    `}
                  >
                    {/* Sender name only for others */}
                    {!isMe && <div className="text-xs font-semibold mb-1">{msg.sender}</div>}

                    {isFile ? (
                      <a
                        className={`underline ${isMe ? 'text-blue-200' : 'text-blue-600'}`}
                        href={msg.fileUrl}
                        target="_blank"
                        rel="noopener noreferrer"
                      >
                        {msg.content || 'File'}
                      </a>
                    ) : (
                      <span>{msg.content}</span>
                    )}

                    {/* Buttons: speaker and pin */}
                    <div className="absolute top-1/2 -right-10 transform -translate-y-1/2 flex flex-col space-y-1">
                      <button
                        onClick={() => speakText(msg.content)}
                        title="Speak message"
                        className={`text-lg hover:text-yellow-400 focus:outline-none ${isMe ? 'text-white' : 'text-gray-700'}`}
                      >
                        🔊
                      </button>
                      <button
                        onClick={() => pinMessage(msg.id, msg.pinned)}
                        title={msg.pinned ? 'Unpin message' : 'Pin message'}
                        className={`text-lg hover:text-yellow-400 focus:outline-none ${isMe ? 'text-white' : 'text-gray-700'}`}
                      >
                        {msg.pinned ? '📌' : '📍'}
                      </button>
                    </div>
                  </div>
                </div>
              );
            })}
            <div ref={messageEndRef} />
          </div>

          <div className="mt-auto flex space-x-2">
            <input
              type="text"
              className="flex-1 border rounded px-3 py-2"
              placeholder="Type a message..."
              value={message}
              onChange={e => setMessage(e.target.value)}
              onKeyDown={e => e.key === 'Enter' && sendMessage()}
            />
            <button className="bg-blue-600 text-white px-4 rounded" onClick={sendMessage}>
              Send
            </button>
          </div>

          <div className="mt-2 flex items-center space-x-2">
            <input type="file" onChange={e => setFile(e.target.files[0])} />
            <button className="bg-green-600 text-white px-3 py-1 rounded" onClick={handleUpload} disabled={!file}>
              Upload
            </button>
          </div>
        </div>
      ) : (
        <div className="flex flex-col flex-1 p-4 max-w-2xl mx-auto bg-white rounded shadow">
          <h2 className="text-2xl font-semibold mb-4 text-center">Chat with AI</h2>
          <textarea
            className="w-full border rounded p-2 mb-2 resize-none"
            rows={4}
            value={aiInput}
            onChange={e => setAiInput(e.target.value)}
            placeholder="Ask something..."
            onKeyDown={e => e.key === 'Enter' && sendAiMessage()}
            disabled={aiLoading}
          />
          <div className="flex space-x-2 mb-4 justify-center">
            <button
              className={`px-4 py-2 rounded bg-blue-600 text-white ${aiLoading ? 'opacity-50 cursor-not-allowed' : ''}`}
              onClick={sendAiMessage}
              disabled={aiLoading}
            >
              Send
            </button>
            <button
              className="px-4 py-2 rounded bg-gray-200"
              onClick={() => speakText(aiResponse)}
              disabled={!aiResponse}
              title="Speak AI response"
            >
              🔊 Speak
            </button>
          </div>
          <div className="whitespace-pre-wrap border rounded p-3 min-h-[100px]">{aiResponse}</div>
        </div>
      )}
    </div>
  );
}
