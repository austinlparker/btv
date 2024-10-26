import type { LoaderFunctionArgs } from "@remix-run/cloudflare";
import { json } from "@remix-run/cloudflare";

export async function loader({ request }: LoaderFunctionArgs) {
  const isDev = process.env.NODE_ENV !== "production";
  const baseUrl = isDev ? "http://127.0.0.1:5173" : "https://btv.watch";

  return json({
    client_id: `${baseUrl}/client-metadata.json`,
    client_name: "bTV",
    client_uri: baseUrl,
    redirect_uris: [`${baseUrl}/oauth/callback`],
    scope: "atproto",
    grant_types: ["authorization_code", "refresh_token"],
    response_types: ["code"],
    application_type: "web",
    token_endpoint_auth_method: "none",
    dpop_bound_access_tokens: true,
  });
}
