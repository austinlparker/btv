import type * as Party from "partykit/server";

type State = {
  total: number;
};

type ChatMessage = {
  type: "chat";
  message: string;
  did: string;
};

type PlaybackMessage = {
  type: "playback";
  state: "play" | "pause" | "skip";
};

type Message = ChatMessage | PlaybackMessage;

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
        case "chat":
          // Broadcast to everyone including sender
          this.room.broadcast(
            JSON.stringify({
              type: "chat",
              message: data.message,
              did: data.did,
              timestamp: Date.now(),
            })
          );
          break;

        case "playback":
          // Broadcast to everyone except sender
          this.room.broadcast(message, [sender.id]);
          break;
      }
    } catch (e) {
      console.error("Failed to parse message:", e);
    }
  }
}

FeedParty satisfies Party.Worker;
