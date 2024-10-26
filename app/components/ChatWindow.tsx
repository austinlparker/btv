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

    const handleMessage = (event: MessageEvent) => {
      console.log("Received websocket message:", event.data);
      try {
        const data = JSON.parse(event.data);
        if (data.type === "chat") {
          console.log("Adding chat message:", data);
          setMessages((prev) => [
            ...prev,
            {
              message: data.message,
              did: data.did,
              timestamp: data.timestamp || Date.now(),
            },
          ]);
        }
      } catch (error) {
        console.error("Error handling message:", error);
      }
    };

    socket.addEventListener("message", handleMessage);
    return () => socket.removeEventListener("message", handleMessage);
  }, [socket]);

  const sendMessage = (e: React.FormEvent) => {
    e.preventDefault();
    if (!input.trim() || !socket) return;

    const message = {
      type: "chat",
      message: input.trim(),
      did,
    };

    console.log("Sending message:", message);
    socket.send(JSON.stringify(message));
    setInput("");
  };

  // Add visual feedback for the current user's messages
  const isOwnMessage = (messageDid: string) => messageDid === did;

  return (
    <div className="h-full p-4 flex flex-col gap-4">
      {/* Messages */}
      <div className="flex-1 overflow-y-auto space-y-4 scrollbar-thin scrollbar-thumb-white/20 scrollbar-track-transparent">
        {messages.map((msg, i) => (
          <div
            key={i}
            className={`${
              isOwnMessage(msg.did) ? "ml-auto bg-blue-500/40" : "bg-black/40"
            } backdrop-blur-sm rounded-lg p-4 text-white max-w-[90%] transform transition-all duration-200 hover:scale-102`}
          >
            <p className="text-sm">{msg.message}</p>
            <div className="flex justify-between items-center mt-2 text-xs text-gray-400">
              <span>{msg.did.split(":")[1].substring(0, 8)}</span>
              <span>{new Date(msg.timestamp).toLocaleTimeString()}</span>
            </div>
          </div>
        ))}
        <div ref={messagesEndRef} />
      </div>

      {/* Input */}
      <form onSubmit={sendMessage} className="mt-auto">
        <input
          type="text"
          value={input}
          onChange={(e) => setInput(e.target.value)}
          className="w-full bg-black/40 backdrop-blur-sm text-white rounded-full px-6 py-3 focus:outline-none focus:ring-2 focus:ring-blue-500 placeholder-gray-400"
          placeholder="Type a message..."
        />
      </form>
    </div>
  );
}
