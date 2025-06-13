import React from 'react';

export default function MessageInput({
  message,
  setMessage,
  sendMessage,
}) {
  return (
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
  );
}
