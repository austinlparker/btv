import type * as Party from "partykit/server";

declare const DEVMODE: boolean;

export default class Server implements Party.Server {
  // constructor(public room : Party.Room) {}
  static async onFetch(request: Party.Request) {
    // when developing locally, we simply proxy all
    // non-party requests to the vite dev server
    if (DEVMODE) {
      const url = new URL(request.url);
      url.hostname = "localhost";
      url.port = "5173";
      return fetch(url.toString(), request as unknown as Request);
    }

    return new Response("Not found", { status: 404 });
  }
}

Server satisfies Party.Worker;
