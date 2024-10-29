import type * as Party from "partykit/server";

type State = {
  total: number;
};

type Profile = {
  handle: string;
  displayName?: string;
};

type ChatMessage = {
  type: "chat";
  message: string;
  did: string;
  profile?: Profile;
  timestamp?: number;
};

type PlaybackMessage = {
  type: "playback";
  state: "play" | "pause" | "skip";
};

type TypingMessage = {
  type: "typing";
  did: string;
};

type Message = ChatMessage | PlaybackMessage | TypingMessage;

export default class FeedParty implements Party.Server {
  constructor(readonly room: Party.Room) {}

  state: State = {
    total: 0,
  };

  onConnect(conn: Party.Connection) {
    console.log("Client connected:", conn.id);
    this.state.total++;
    this.room.broadcast(JSON.stringify(this.state));
  }

  onClose(conn: Party.Connection) {
    console.log("Client disconnected:", conn.id);
    this.state.total--;
    this.room.broadcast(JSON.stringify(this.state));
  }

  onMessage(message: string, sender: Party.Connection) {
    try {
      const data = JSON.parse(message) as Message;
      console.log("Received message:", data);

      switch (data.type) {
        case "chat": {
          const chatMessage = {
            type: "chat",
            message: data.message,
            did: data.did,
            profile: data.profile,
            timestamp: Date.now(),
          };
          this.room.broadcast(JSON.stringify(chatMessage));
          break;
        }

        case "playback":
          this.room.broadcast(message, [sender.id]);
          break;

        case "typing":
          this.room.broadcast(
            JSON.stringify({
              type: "typing",
              did: data.did,
            }),
            [sender.id]
          );
          break;
      }
    } catch (e) {
      console.error("Failed to parse message:", e);
    }
  }
}

FeedParty satisfies Party.Worker;
