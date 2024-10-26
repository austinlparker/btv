import type * as Party from "partykit/server";

type State = {
  total: number;
};

type PlaybackMessage = {
  type: "playback";
  state: "play" | "pause" | "skip";
};

type ChatMessage = {
  type: "chat";
  message: string;
  did: string;
};

type ConnectionsMessage = {
  type: "connections";
  count: number;
};

export default class FeedParty implements Party.Server {
  // eslint-disable-next-line no-useless-constructor
  constructor(public room: Party.Room) {}

  state: State = {
    total: 0,
  };

  static options = {
    hibernate: true,
  };

  async onConnect(connection: Party.Connection): Promise<void> {
    console.log(connection.id, "connected");
    this.state.total++;
    this.room.broadcast(JSON.stringify(this.state));
  }

  async onClose(connection: Party.Connection): Promise<void> {
    console.log(connection.id, "disconnected");
    this.state.total--;
    this.room.broadcast(JSON.stringify(this.state));
  }

  async onError(connection: Party.Connection, error: Error): Promise<void> {
    console.error(error);
    await this.onClose(connection);
  }

  async onMessage(
    message: string | ArrayBuffer | ArrayBufferView,
    sender: Party.Connection
  ): Promise<void> {
    const data = JSON.parse(message.toString());
    console.log(data);
    switch (data.type) {
      case "playback": {
        this.room.broadcast(message as string);
        break;
      }
      case "chat": {
        this.room.broadcast(message as string, [sender.id]);
        break;
      }
    }
  }
}

FeedParty satisfies Party.Worker;
