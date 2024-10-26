import { useEffect, useState } from "react";
import ReactPlayer from "react-player";
import { useParty } from "~/providers/multiplayer";
import ChatWindow from "~/components/ChatWindow";
import VideoControls from "~/components/VideoControls";
import { useLoaderData } from "@remix-run/react";
import { getSession } from "~/utils/session.server";
import type { LoaderFunctionArgs } from "@remix-run/cloudflare";

export async function loader({ request }: LoaderFunctionArgs) {
  const session = await getSession(request.headers.get("Cookie"));
  const did = session.get("did");

  return { did };
}

export default function Index() {
  const { socket } = useParty();
  const { did } = useLoaderData<typeof loader>();
  const [total, setTotal] = useState(0);
  const [isPlaying, setIsPlaying] = useState(false);

  useEffect(() => {
    if (!socket) return;

    socket.addEventListener("message", (event) => {
      const data = JSON.parse(event.data);
      if (data.total !== undefined) {
        setTotal(data.total);
      }
      if (data.type === "playback") {
        setIsPlaying(data.state === "play");
      }
    });
  }, [socket]);

  const handlePlayback = (state: "play" | "pause" | "skip") => {
    socket?.send(
      JSON.stringify({
        type: "playback",
        state,
      })
    );
  };

  return (
    <div className="h-screen w-screen overflow-hidden">
      <div className="fixed inset-0 -z-10">
        <ReactPlayer
          url="https://www.youtube.com/watch?v=your-default-video"
          playing={isPlaying}
          controls={false}
          width="100%"
          height="100%"
          style={{ objectFit: "cover" }}
        />
      </div>

      <div className="relative h-full">
        <div className="absolute top-4 right-4 bg-black/50 text-white px-3 py-1 rounded-full">
          {total} online
        </div>
        <VideoControls isPlaying={isPlaying} onPlayback={handlePlayback} />
        <ChatWindow did={did} socket={socket} />
      </div>
    </div>
  );
}
