import type { LoaderFunctionArgs } from "@remix-run/cloudflare";
import { json, redirect } from "@remix-run/cloudflare";
import { createOAuthClient } from "~/utils/oauth.server";
import { getSession, commitSession } from "~/utils/session.server";
import { OAuthCallbackError } from "@atproto/oauth-client";

export async function loader({ request, context }: LoaderFunctionArgs) {
  const url = new URL(request.url);
  const code = url.searchParams.get("code");
  const state = url.searchParams.get("state");

  console.log("Callback parameters:", { code, state });

  if (!code || !state) {
    return json({ error: "Missing required parameters" }, { status: 400 });
  }

  try {
    const oauthClient = createOAuthClient(context.env as Env);

    // Pass code and state directly
    const result = await oauthClient.callback(url.searchParams);

    console.log("Authentication successful:", result.session.did);

    const cookieSession = await getSession();
    cookieSession.set("did", result.session.did);

    return redirect("/", {
      headers: {
        "Set-Cookie": await commitSession(cookieSession),
      },
    });
  } catch (error) {
    console.error("Callback error:", error);
    if (error instanceof OAuthCallbackError) {
      const errorCode = error.params?.error;
      if (["login_required", "consent_required"].includes(errorCode || "")) {
        return redirect("/");
      }
    }

    return json(
      {
        error: "Authentication failed",
        details: error instanceof Error ? error.message : "Unknown error",
      },
      {
        status: 401,
      }
    );
  }
}
