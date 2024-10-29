import { useEffect, useState, useRef } from "react";
import type PartySocket from "partysocket";
import { createLogger } from "~/utils/logger";

const log = createLogger("ChatWindow");

type Message = {
  message: string;
  did: string;
  timestamp: number;
  profile?: {
    handle: string;
    displayName?: string;
  };
};

type TypingUser = {
  did: string;
  timestamp: number;
};

type Profile = {
  handle: string;
  displayName?: string;
};

interface ChatWindowProps {
  did: string;
  handle: string;
  displayName?: string;
  socket: PartySocket | null;
  connected: number;
}

export default function ChatWindow({
  did,
  handle,
  displayName,
  socket,
  connected,
}: ChatWindowProps) {
  const [messages, setMessages] = useState<Message[]>([]);
  const [input, setInput] = useState("");
  const [typingUsers, setTypingUsers] = useState<TypingUser[]>([]);
  const [profiles, setProfiles] = useState<Map<string, Profile>>(new Map());
  const messagesEndRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    log.debug("Profiles map updated", {
      profiles: Object.fromEntries(profiles),
      size: profiles.size,
    });
  }, [profiles]);

  useEffect(() => {
    if (did && handle) {
      log.debug("Setting current user profile", { did, handle, displayName });
      setProfiles((prev) => {
        const newProfiles = new Map(prev);
        newProfiles.set(did, { handle, displayName });
        return newProfiles;
      });
    }
  }, [did, handle, displayName]);

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages]);

  const getDisplayName = (userDid: string, messageProfile?: Profile) => {
    log.debug("Getting display name", {
      userDid,
      messageProfile,
      hasStoredProfile: profiles.has(userDid),
      storedProfile: profiles.get(userDid),
    });

    if (messageProfile?.displayName || messageProfile?.handle) {
      log.debug("Using message profile", { messageProfile });
      return messageProfile.displayName || messageProfile.handle;
    }

    const storedProfile = profiles.get(userDid);
    if (storedProfile?.displayName || storedProfile?.handle) {
      log.debug("Using stored profile", { storedProfile });
      return storedProfile.displayName || storedProfile.handle;
    }

    log.debug("No profile found for user, using fallback", { userDid });
    return userDid.split(":")[1].substring(0, 8);
  };

  useEffect(() => {
    if (!socket) return;

    const handleMessage = (event: MessageEvent) => {
      try {
        const data = JSON.parse(event.data);
        log.debug("Received websocket message", { data });

        if (data.type === "chat") {
          if (data.profile) {
            log.debug("Storing profile from message", {
              did: data.did,
              profile: data.profile,
              currentProfiles: Object.fromEntries(profiles),
            });

            setProfiles((prev) => {
              const newProfiles = new Map(prev);
              newProfiles.set(data.did, data.profile);
              return newProfiles;
            });
          }

          setMessages((prev) => {
            const newMessage = {
              message: data.message,
              did: data.did,
              timestamp: data.timestamp || Date.now(),
              profile: data.profile,
            };
            log.debug("Adding new message", {
              message: newMessage,
              hasProfile: Boolean(data.profile),
            });
            return [...prev, newMessage];
          });
        } else if (data.type === "typing") {
          handleTypingEvent(data.did);
        }
      } catch (error) {
        log.error("Error handling message", { error });
      }
    };

    socket.addEventListener("message", handleMessage);
    return () => socket.removeEventListener("message", handleMessage);
  }, [socket]);

  const handleTypingEvent = (userDid: string) => {
    setTypingUsers((prev) => {
      const now = Date.now();
      const filtered = prev.filter(
        (user) => now - user.timestamp < 3000 && user.did !== userDid
      );
      return [...filtered, { did: userDid, timestamp: now }];
    });
  };

  useEffect(() => {
    const interval = setInterval(() => {
      setTypingUsers((prev) =>
        prev.filter((user) => Date.now() - user.timestamp < 3000)
      );
    }, 1000);
    return () => clearInterval(interval);
  }, []);

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setInput(e.target.value);
    if (socket) {
      socket.send(JSON.stringify({ type: "typing", did }));
    }
  };

  const sendMessage = (e: React.FormEvent) => {
    e.preventDefault();
    if (!input.trim() || !socket) return;

    const message = {
      type: "chat",
      message: input.trim(),
      did,
      profile: {
        handle,
        displayName,
      },
      timestamp: Date.now(),
    };

    log.debug("Sending message", { message });
    socket.send(JSON.stringify(message));
    setInput("");
  };

  return (
    <div className="flex flex-col h-full bg-black/30 backdrop-blur-md rounded-lg overflow-hidden">
      <div className="flex-1 overflow-y-auto p-4 space-y-3 scrollbar-thin scrollbar-thumb-white/20 scrollbar-track-transparent">
        {messages.map((msg, i) => (
          <div
            key={i}
            className={`flex flex-col ${
              msg.did === did ? "items-end" : "items-start"
            }`}
          >
            <div
              className={`max-w-[80%] rounded-2xl px-4 py-2 ${
                msg.did === did
                  ? "bg-blue-500 text-white rounded-br-sm"
                  : "bg-gray-700 text-white rounded-bl-sm"
              }`}
            >
              <p className="break-words">{msg.message}</p>
            </div>
            <div className="flex gap-2 text-xs text-gray-400 mt-1">
              <span>{getDisplayName(msg.did, msg.profile)}</span>
              <span>•</span>
              <span>{new Date(msg.timestamp).toLocaleTimeString()}</span>
            </div>
          </div>
        ))}
        <div ref={messagesEndRef} />
      </div>
      {typingUsers.length > 0 &&
        typingUsers.some((user) => user.did !== did) && (
          <div className="px-4 py-2 text-sm text-gray-400 italic">
            {typingUsers
              .filter((user) => user.did !== did)
              .map((user) => getDisplayName(user.did))
              .join(", ")}{" "}
            {typingUsers.length === 1 ? "is" : "are"} typing...
          </div>
        )}
      <form onSubmit={sendMessage} className="p-4 border-t border-white/10">
        <input
          type="text"
          value={input}
          onChange={handleInputChange}
          className="w-full bg-white/10 text-white rounded-full px-6 py-3 focus:outline-none focus:ring-2 focus:ring-blue-500 placeholder-gray-400"
          placeholder="Type a message..."
        />
      </form>
      <p className="px-4 pb-2 text-sm text-gray-400">
        {connected} users online.
      </p>
    </div>
  );
}
