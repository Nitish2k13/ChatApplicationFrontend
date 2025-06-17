import React, { useState, useRef, useEffect  } from 'react';
import ChatScreen from './ChatScreen';
import AIChat from './AIChat';
import UsernameEntry from './UsernameEntry';
import useChatWebSocket from '../hooks/useChatWebSocket';



export default function ChatApp() {
  const [username, setUsername] = useState(() => localStorage.getItem('chatUsername') || '');
  const [entered, setEntered] = useState(() => !!localStorage.getItem('chatUsername'));
  const [activeTab, setActiveTab] = useState('friends');

  // ✅ These were missing before
  const [file, setFile] = useState(null);
  const [uploadProgress, setUploadProgress] = useState(0);
  const [replyTo, setReplyTo] = useState(null);
  const messageEndRef = useRef(null);
  const [messages, setMessages] = useState([]);
const [message, setMessage] = useState('');
const { sendMessage: sendWsMessage } = useChatWebSocket(username, setMessages);
const [chatHistory, setChatHistory] = useState([]);
const [newMessage, setNewMessage] = useState('');

const sendToAI = async () => {
  if (!newMessage.trim()) return;

  // Simulate API call to AI (replace with real API call)
  const aiResponse = `Echo: ${newMessage}`;

  const newChat = {
    user: newMessage,
    ai: aiResponse
  };

  setChatHistory(prev => [...prev, newChat]);
  setNewMessage('');
};



  // Inside ChatApp.jsx

// Update this useEffect
useEffect(() => {
  const storedMessages = JSON.parse(localStorage.getItem('chatMessages') || '[]');
  setMessages(storedMessages);
}, []);

useEffect(() => {
  localStorage.setItem('chatMessages', JSON.stringify(messages));
}, [messages]);

// Listen for changes in other tabs
useEffect(() => {
  const handleStorage = (event) => {
    if (event.key === 'chatMessages') {
      const newMessages = JSON.parse(event.newValue || '[]');
      setMessages(newMessages);
    }
  };
  window.addEventListener('storage', handleStorage);
  return () => window.removeEventListener('storage', handleStorage);
}, []);


  const handleEnter = () => {
    if (username.trim()) {
      localStorage.setItem('chatUsername', username.trim());
      setEntered(true);
    }
  };

  const sendMessage = () => {
    if (!message.trim()) return;

    const newMessage = {
      id: Date.now(),
      content: message,
      sender: username,
      timestamp: new Date().toISOString(),
      replyTo: replyTo ? { sender: replyTo.sender, content: replyTo.content } : null,
    };

    sendWsMessage({
  sender: username,
  content: message,
  timestamp: Date.now(),
  type: "CHAT", // required
  replyTo: replyTo ? { sender: replyTo.sender, content: replyTo.content } : null,
});

    setMessage('');
    setReplyTo(null);
  };

const handleUpload = async () => {
  if (!file || !username) return;

  const formData = new FormData();
  formData.append("file", file);
  formData.append("sender", username);

  try {
    const response = await fetch("http://localhost:8080/chat/upload", {
      method: "POST",
      body: formData,
    });

    if (!response.ok) throw new Error("Upload failed");

    // Don't send the message manually — it will arrive via WebSocket
    // const savedMessage = await response.json();

    setFile(null);
    setUploadProgress(100);
    setTimeout(() => setUploadProgress(0), 1000);
  } catch (error) {
    console.error("Upload error:", error);
    alert("File upload failed.");
  }
};



  const speakText = (text) => {
    const utterance = new SpeechSynthesisUtterance(text);
    speechSynthesis.speak(utterance);
  };

  const pinMessage = (id, pinned) => {
    setMessages(prev =>
      prev.map(msg =>
        msg.id === id ? { ...msg, pinned: !pinned } : msg
      )
    );
  };

  if (!entered) {
    return <UsernameEntry username={username} setUsername={setUsername} handleEnter={handleEnter} />;
  }

  return (
    <div className="h-screen flex flex-col bg-gray-100">
      <div className="bg-blue-600 text-white p-4 flex justify-between items-center">
        <span className="font-bold text-xl">Welcome, {username}</span>
        <button
          className="bg-red-500 hover:bg-red-600 text-white px-3 py-1 rounded ml-4"
          onClick={() => {
            localStorage.removeItem('chatUsername');
            setUsername('');
            setEntered(false);
          }}
        >
          Logout
        </button>
      </div>

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
        <ChatScreen
          username={username}
          messages={messages}
          setMessages={setMessages}
          message={message}
          setMessage={setMessage}
          sendMessage={sendMessage}
          file={file}
          setFile={setFile}
          handleUpload={handleUpload}
          uploadProgress={uploadProgress}
          replyTo={replyTo}
          setReplyTo={setReplyTo}
          pinMessage={pinMessage}
          speakText={speakText}
          messageEndRef={messageEndRef}
        />
      ) : (
        <AIChat
  username={username}
  chatHistory={chatHistory}
  speakText={speakText}
  newMessage={newMessage}
  setNewMessage={setNewMessage}
  sendToAI={sendToAI}
/>

      )}
    </div>
  );
}
