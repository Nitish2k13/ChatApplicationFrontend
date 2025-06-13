export function ChatMessage({ message }) {
  const isUser = message.sender === "user";

  return (
    <div
      className={`p-2 rounded-xl max-w-xs break-words ${
        isUser
          ? "bg-blue-500 text-white self-end"
          : "bg-gray-200 text-black self-start"
      }`}
    >
      {message.text}
    </div>
  );
}
