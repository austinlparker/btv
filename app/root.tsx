import {
  useLoaderData,
  ScrollRestoration,
  Scripts,
  Links,
  Meta,
  Outlet,
} from "@remix-run/react";
import { getSession } from "~/utils/session.server";
import LoginButton from "~/components/LoginButton";
import MultiplayerContextProvider from "./providers/multiplayer";
import type { LoaderFunctionArgs } from "@remix-run/cloudflare";
import LogoutButton from "./components/LogoutButton";
import "./tailwind.css";

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

export default function App() {
  const { isAuthenticated } = useLoaderData<typeof loader>();

  return (
    <html lang="en">
      <head>
        <meta charSet="utf-8" />
        <meta name="viewport" content="width=device-width, initial-scale=1" />
        <Meta />
        <Links />
      </head>
      <body>
        <MultiplayerContextProvider>
          <div className="min-h-screen">
            {!isAuthenticated ? (
              <div className="flex h-screen items-center justify-center">
                <LoginButton />
              </div>
            ) : (
              <>
                <nav className="p-4 border-b">
                  <LogoutButton />
                </nav>
                <Outlet />
              </>
            )}
          </div>
          <ScrollRestoration />
          <Scripts />
        </MultiplayerContextProvider>
      </body>
    </html>
  );
}
