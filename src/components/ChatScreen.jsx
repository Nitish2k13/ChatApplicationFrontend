import React, { useEffect, useRef } from 'react';
import { Volume2, Pin, PinOff } from 'lucide-react';

export default function ChatScreen({
  username,
  messages,
  message,
  setMessage,
  sendMessage,
  file,
  setFile,
  handleUpload,
  uploadProgress,
  replyTo,
  setReplyTo,
  pinMessage,
  speakText,
}) {
  const messageEndRef = useRef(null);
  const handleTranslate = async (message) => {
    const userLanguage = localStorage.getItem('preferredLanguage') || 'en';

    try {
      const res = await fetch('http://localhost:8080/api/translate', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          text: message,
          targetLang: userLanguage,
        }),
      });

      const translated = await res.text();
      alert(`Translated: ${translated}`);
      // Or: update a state like setTranslatedMessage(translated)
    } catch (error) {
      console.error('Translation failed:', error);
    }
  };

  useEffect(() => {
    messageEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages]);

  return (
    <div className="flex flex-col flex-1 overflow-hidden px-4 py-2">
      <div className="flex-1 overflow-y-auto space-y-4 mb-4">
        {messages?.map((msg) => {
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
                {!isMe && <div className="text-xs font-semibold mb-1">{msg.sender}</div>}

                {msg.replyTo && (
                  <div className="text-xs italic text-gray-400 mb-1 border-l-2 pl-2 border-blue-300">
                    Reply to {msg.replyTo.sender}: "{msg.replyTo.content}"
                  </div>
                )}

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
                 <span
  onContextMenu={(e) => {
    e.preventDefault();
    const shouldTranslate = window.confirm('Translate this message?');
    if (!shouldTranslate) return;
    handleTranslate(msg.content);
  }}
>
  {msg.content}
</span>


                )}

                <div className="absolute top-1/2 -right-12 transform -translate-y-1/2 flex flex-col space-y-2">
                  <button
                    onClick={() => speakText(msg.content)}
                    title="Speak message"
                    className={`p-2 rounded-full border transition hover:bg-yellow-400 hover:text-white 
                      ${isMe ? 'text-white border-white' : 'text-gray-700 border-gray-400'}`}
                  >
                    <Volume2 size={18} />
                  </button>

                  <button
                    onClick={() => pinMessage(msg.id, msg.pinned)}
                    title={msg.pinned ? 'Unpin message' : 'Pin message'}
                    className={`p-2 rounded-full border transition hover:bg-yellow-400 hover:text-white 
                      ${isMe ? 'text-white border-white' : 'text-gray-700 border-gray-400'}`}
                  >
                    {msg.pinned ? <PinOff size={18} /> : <Pin size={18} />}
                  </button>

                  <button
                    onClick={() => setReplyTo(msg)}
                    title="Reply to this message"
                    className={`text-sm hover:text-blue-500 focus:outline-none ${isMe ? 'text-white' : 'text-gray-700'}`}
                  >
                    <img
                      src="https://cdn-icons-png.flaticon.com/512/1933/1933011.png"
                      alt="Reply icon"
                      className="inline-block w-5 h-5"
                    />
                  </button>
                </div>
              </div>
            </div>
          );
        })}
        <div ref={messageEndRef} />
      </div>

      {replyTo && (
        <div className="mb-2 p-2 border-l-4 border-blue-400 bg-blue-50 rounded flex justify-between items-center">
          <div>
            <div className="text-xs text-gray-500">Replying to {replyTo.sender}:</div>
            <div className="text-sm font-medium truncate">{replyTo.content}</div>
          </div>
          <button
            className="text-xs text-red-500 ml-4"
            onClick={() => setReplyTo(null)}
          >
            ✕ Cancel
          </button>
        </div>
      )}

      <div className="mt-auto flex space-x-2">
        <input
          type="text"
          className="flex-1 border rounded px-3 py-2"
          placeholder="Type a message..."
          value={message}
          onChange={(e) => setMessage(e.target.value)}
          onKeyDown={(e) => e.key === 'Enter' && sendMessage()}
        />
        <button className="bg-blue-600 text-white px-4 rounded" onClick={sendMessage}>
          Send
        </button>
      </div>

      <div className="mt-2 flex items-center space-x-2">
        <input type="file" onChange={(e) => setFile(e.target.files[0])} />
        <button
          className="bg-green-600 text-white px-3 py-1 rounded"
          onClick={handleUpload}
          disabled={!file}
        >
          Upload
        </button>
        {uploadProgress > 0 && (
          <div className="w-full bg-gray-200 rounded h-2 mt-2">
            <div
              className="bg-blue-600 h-2 rounded"
              style={{ width: `${uploadProgress}%` }}
            ></div>
          </div>
        )}
      </div>
    </div>
  );
}
