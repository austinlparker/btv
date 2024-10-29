import { useEffect, useState } from "react";
import { useParty } from "~/providers/multiplayer";
import ChatWindow from "~/components/ChatWindow";
import LogoutButton from "~/components/LogoutButton";
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
  type ReactPlayerProps = {
    url: string;
    playing: boolean;
    muted: boolean;
    controls: boolean;
    width: string;
    height: string;
    style?: React.CSSProperties;
    config?: {
      youtube?: {
        playerVars?: {
          modestbranding?: number;
          playsinline?: number;
        };
      };
    };
  };

  const [ReactPlayer, setReactPlayer] =
    useState<ComponentType<ReactPlayerProps> | null>(null);

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
      url="https://www.youtube.com/watch?v=rnXIjl_Rzy4"
      playing={true}
      muted={true}
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
  const handle = session.get("handle");
  const displayName = session.get("displayName");

  return {
    did,
    handle,
    displayName,
    isAuthenticated: Boolean(did),
  };
}

export default function Index() {
  const { socket } = useParty();
  const { did, handle, displayName } = useLoaderData<typeof loader>();
  const [total, setTotal] = useState(0);
  const [isPlaying, setIsPlaying] = useState(false);

  console.log("Index loader data:", { did, handle, displayName });

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

  return (
    <div className="relative h-screen w-screen overflow-hidden bg-black">
      <div className="absolute inset-0">
        <ClientOnly>
          <VideoPlayer playing={isPlaying} />
        </ClientOnly>
      </div>

      <div className="relative z-10 h-full w-full bg-gradient-to-t from-black/60 via-transparent to-black/40">
        <div className="absolute top-0 left-0 right-0 p-4 flex justify-between items-center">
          <div className="text-white text-2xl font-bold">bTV</div>
          <div className="bg-black/50 text-white px-4 py-2 rounded-full backdrop-blur-sm">
            {total} watching
          </div>
          <LogoutButton />
        </div>

        <div className="absolute left-8 bottom-24 w-96 h-[60vh]">
          <ChatWindow
            did={did}
            handle={handle}
            displayName={displayName}
            socket={socket}
            connected={total}
          />
        </div>
      </div>
    </div>
  );
}
