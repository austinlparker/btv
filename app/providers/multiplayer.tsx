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
  const socket = usePartySocket({
    party: "btv",
    room: "btv-main",
  });

  return (
    <MultiplayerContext.Provider value={{ socket: socket }}>
      {props.children}
    </MultiplayerContext.Provider>
  );
}