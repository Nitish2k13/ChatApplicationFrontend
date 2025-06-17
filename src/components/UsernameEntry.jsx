import React from 'react';
import LanguageSelector from './LanguageSelector';

export default function UsernameEntry({ username, setUsername, handleEnter }) {
  const handleLanguageSelect = (lang) => {
    localStorage.setItem('preferredLanguage', lang);
  };

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
      <LanguageSelector onSelect={handleLanguageSelect} />
      <button
        className="bg-blue-600 text-white px-4 py-2 rounded"
        onClick={handleEnter}
        disabled={!username.trim()}
      >
        Enter
      </button>
    </div>
  );
  
}
