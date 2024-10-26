import type { ActionFunctionArgs } from "@remix-run/cloudflare";
import { json, redirect } from "@remix-run/cloudflare";
import { createOAuthClient } from "~/utils/oauth.server";

export async function action({ request, context }: ActionFunctionArgs) {
  const formData = await request.formData();
  const handle = formData.get("handle");

  if (typeof handle !== "string") {
    return json({ error: "Handle is required" }, { status: 400 });
  }

  const oauthClient = createOAuthClient(context.env);

  try {
    const url = await oauthClient.authorize(handle, {
      scope: "atproto transition:generic",
    });
    return redirect(url.toString());
  } catch (error) {
    console.error("Login error:", error);
    return json({ error: "Failed to initiate login" }, { status: 500 });
  }
}
