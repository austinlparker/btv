import type { ActionFunctionArgs } from "@remix-run/cloudflare";
import { json, redirect } from "@remix-run/cloudflare";
import { createOAuthClient } from "~/utils/oauth.server";

export async function action({ request, context }: ActionFunctionArgs) {
  const formData = await request.formData();
  const handle = formData.get("handle");

  if (typeof handle !== "string") {
    return json({ error: "Handle is required" }, { status: 400 });
  }

  const oauthClient = createOAuthClient(context.env as Env);

  try {
    const ac = new AbortController();
    request.signal.addEventListener("abort", () => ac.abort());

    const url = await oauthClient.authorize(handle, {
      scope: "atproto",
    });

    return redirect(url.toString());
  } catch (error) {
    console.error("Login error:", error);
    if (error instanceof Error) {
      console.error("Error details:", {
        message: error.message,
        stack: error.stack,
      });
    }
    return json(
      {
        error: "Failed to initiate login",
        details: error instanceof Error ? error.message : "Unknown error",
      },
      { status: 500 }
    );
  }
}

export async function loader() {
  return json({});
}
