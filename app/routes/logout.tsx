import type { ActionFunctionArgs } from "@remix-run/cloudflare";
import { redirect } from "@remix-run/cloudflare";
import { getSession, destroySession } from "~/utils/session.server";
import { createOAuthClient } from "~/utils/oauth.server";

export async function action({ request, context }: ActionFunctionArgs) {
  const session = await getSession(request.headers.get("Cookie"));
  const did = session.get("did");

  if (did) {
    const oauthClient = createOAuthClient(context.env as Env);
    await oauthClient.revoke(did);
  }

  return redirect("/", {
    headers: {
      "Set-Cookie": await destroySession(session),
    },
  });
}
