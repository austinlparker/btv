import type { LoaderFunctionArgs } from "@remix-run/cloudflare";
import { json, redirect } from "@remix-run/cloudflare";
import { createOAuthClient } from "~/utils/oauth.server";
import { getSession, commitSession } from "~/utils/session.server";

export async function loader({ request, context }: LoaderFunctionArgs) {
  const url = new URL(request.url);
  const oauthClient = createOAuthClient(context.env);

  try {
    const { session } = await oauthClient.callback({
      code: url.searchParams.get("code") || "",
      state: url.searchParams.get("state") || "",
    });

    const cookieSession = await getSession();
    cookieSession.set("did", session.did);

    return redirect("/", {
      headers: {
        "Set-Cookie": await commitSession(cookieSession),
      },
    });
  } catch (error) {
    console.error("Callback error:", error);
    return json({ error: "Authentication failed" }, { status: 401 });
  }
}
