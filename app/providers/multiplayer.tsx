import { createContext, useContext } from "react";
import PartySocket from "partysocket";
import usePartySocket from "partysocket/react";

interface MultiplayerContextType {
  socket: PartySocket | null;
}

export const MultiplayerContext = createContext<MultiplayerContextType>({
  socket: null,
});

export function useParty() {
  return useContext(MultiplayerContext);
}

export default function MultiplayerContextProvider(props: {
  children: React.ReactNode;
}) {
  const isDev = process.env.NODE_ENV !== "production";
  const host = isDev ? "127.0.0.1:1999" : "YOUR_PRODUCTION_PARTYKIT_HOST";

  const socket = usePartySocket({
    host,
    party: "btv",
    room: "btv-main",
  });

  return (
    <MultiplayerContext.Provider value={{ socket }}>
      {props.children}
    </MultiplayerContext.Provider>
  );
}
