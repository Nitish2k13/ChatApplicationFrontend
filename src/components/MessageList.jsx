import React from 'react';
import { Volume2, Pin, PinOff } from 'lucide-react';

export default function MessageList({
  messages,
  username,
  speakText,
  pinMessage,
  setReplyTo,
  messageEndRef,
}) {
  return (
    <div className="flex-1 overflow-y-auto space-y-4 mb-4">
      {messages.map((msg) => {
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
              {!isMe && (
                <div className="text-xs font-semibold mb-1">{msg.sender}</div>
              )}

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
                <span>{msg.content}</span>
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
  );
}
