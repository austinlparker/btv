import type { LoaderFunctionArgs } from "@remix-run/cloudflare";
import { json, redirect } from "@remix-run/cloudflare";
import { createOAuthClient } from "~/utils/oauth.server";
import { getSession, commitSession } from "~/utils/session.server";
import { OAuthCallbackError } from "@atproto/oauth-client";
import { Agent } from "@atproto/api";

export async function loader({ request, context }: LoaderFunctionArgs) {
  const url = new URL(request.url);
  const code = url.searchParams.get("code");
  const state = url.searchParams.get("state");

  if (!code || !state) {
    return json({ error: "Missing required parameters" }, { status: 400 });
  }

  try {
    const oauthClient = createOAuthClient(context.env as Env);
    const result = await oauthClient.callback(url.searchParams);

    const agent = new Agent(result.session);

    const profile = await agent.getProfile({ actor: result.session.did });

    const session = await getSession();
    session.set("did", result.session.did);
    session.set("handle", profile.data.handle);
    session.set("displayName", profile.data.displayName);

    return redirect("/", {
      headers: {
        "Set-Cookie": await commitSession(session),
      },
    });
  } catch (error) {
    if (error instanceof OAuthCallbackError) {
      const errorCode = error.params?.get("error");
      if (["login_required", "consent_required"].includes(errorCode || "")) {
        return redirect("/");
      }
    }

    return json(
      {
        error: "Authentication failed",
        details: error instanceof Error ? error.message : "Unknown error",
      },
      { status: 401 }
    );
  }
}
