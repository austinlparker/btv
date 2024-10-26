import { useEffect, useState } from "react";
import { useParty } from "~/providers/multiplayer";
import ChatWindow from "~/components/ChatWindow";
import VideoControls from "~/components/VideoControls";
import { useLoaderData } from "@remix-run/react";
import { getSession } from "~/utils/session.server";
import type { LoaderFunctionArgs } from "@remix-run/cloudflare";
import type { ComponentType } from "react";

// Create a client-only wrapper component
function ClientOnly({ children }: { children: React.ReactNode }) {
  const [isClient, setIsClient] = useState(false);
  useEffect(() => setIsClient(true), []);
  return isClient ? <>{children}</> : null;
}

// Separate the player into its own component
function VideoPlayer({ playing }: { playing: boolean }) {
  const [ReactPlayer, setReactPlayer] = useState<ComponentType<any> | null>(
    null
  );

  useEffect(() => {
    import("react-player/lazy").then((mod) => {
      setReactPlayer(() => mod.default);
    });
  }, []);

  if (!ReactPlayer) {
    return (
      <div className="w-full h-full bg-black flex items-center justify-center">
        <div className="text-white text-xl">Loading...</div>
      </div>
    );
  }

  return (
    <ReactPlayer
      url="https://www.youtube.com/watch?v=O9mYwRlucZY"
      playing={playing}
      controls={false}
      width="100%"
      height="100%"
      style={{ objectFit: "cover" }}
      config={{
        youtube: {
          playerVars: {
            modestbranding: 1,
            playsinline: 1,
          },
        },
      }}
    />
  );
}

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
    <div className="relative h-screen w-screen overflow-hidden bg-black">
      {/* Video Background */}
      <div className="absolute inset-0">
        <ClientOnly>
          <VideoPlayer playing={isPlaying} />
        </ClientOnly>
      </div>

      {/* Overlay Container */}
      <div className="relative z-10 h-full w-full bg-gradient-to-t from-black/60 via-transparent to-black/40">
        {/* Top Bar */}
        <div className="absolute top-0 left-0 right-0 p-4 flex justify-between items-center">
          {/* Logo/Title */}
          <div className="text-white text-2xl font-bold">bTV</div>
          {/* Online Count */}
          <div className="bg-black/50 text-white px-4 py-2 rounded-full backdrop-blur-sm">
            {total} watching
          </div>
        </div>

        {/* Chat Window - Positioned on the left */}
        <div className="absolute left-0 top-16 bottom-24 w-96">
          <ChatWindow did={did} socket={socket} />
        </div>

        {/* Video Controls - Centered at bottom */}
        <div className="absolute bottom-8 left-1/2 -translate-x-1/2">
          <VideoControls isPlaying={isPlaying} onPlayback={handlePlayback} />
        </div>
      </div>
    </div>
  );
}
