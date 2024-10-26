import { useEffect, useState, useRef } from "react";
import type PartySocket from "partysocket";

type Message = {
  message: string;
  did: string;
  timestamp: number;
};

export default function ChatWindow({
  did,
  socket,
}: {
  did: string;
  socket: PartySocket | null;
}) {
  const [messages, setMessages] = useState<Message[]>([]);
  const [input, setInput] = useState("");
  const messagesEndRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (!socket) return;

    socket.addEventListener("message", (event) => {
      const data = JSON.parse(event.data);
      if (data.type === "chat") {
        setMessages((prev) => [
          ...prev,
          {
            message: data.message,
            did: data.did,
            timestamp: Date.now(),
          },
        ]);
      }
    });
  }, [socket]);

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages]);

  const sendMessage = (e: React.FormEvent) => {
    e.preventDefault();
    if (!input.trim() || !socket) return;

    socket.send(
      JSON.stringify({
        type: "chat",
        message: input,
        did,
      })
    );
    setInput("");
  };

  return (
    <div className="absolute left-0 top-0 h-full w-96 p-4 flex flex-col">
      {/* Messages */}
      <div className="flex-1 overflow-y-auto space-y-4">
        {messages.map((msg, i) => (
          <div
            key={i}
            className="bg-white/80 backdrop-blur-sm rounded-2xl p-4 shadow-lg transform hover:scale-105 transition-transform duration-200 max-w-[80%] ml-4"
            style={{
              clipPath:
                "polygon(0% 0%, 100% 0%, 100% 75%, 75% 75%, 75% 100%, 50% 75%, 0% 75%)",
            }}
          >
            <p className="text-sm text-gray-800">{msg.message}</p>
            <p className="text-xs text-gray-500 mt-2">
              {new Date(msg.timestamp).toLocaleTimeString()}
            </p>
          </div>
        ))}
        <div ref={messagesEndRef} />
      </div>

      {/* Input */}
      <form onSubmit={sendMessage} className="mt-4">
        <input
          type="text"
          value={input}
          onChange={(e) => setInput(e.target.value)}
          className="w-full bg-white/80 backdrop-blur-sm rounded-full px-4 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
          placeholder="Type a message..."
        />
      </form>
    </div>
  );
}
