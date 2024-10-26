import { NodeOAuthClient } from "@atproto/oauth-client-node";
import { createKVStores } from "./session.server";

export function createOAuthClient(env: Env) {
  const isDev = process.env.NODE_ENV !== "production";
  const baseUrl = isDev ? "http://127.0.0.1:5173" : "https://btv.watch";
  const enc = encodeURIComponent;

  return new NodeOAuthClient({
    clientMetadata: {
      client_id: !isDev
        ? `${baseUrl}/client-metadata.json`
        : `http://localhost?redirect_uri=${enc(
            `${baseUrl}/oauth/callback`
          )}&scope=${enc("atproto transition:generic")}`,
      client_name: "bTV",
      client_uri: baseUrl,
      redirect_uris: [`${baseUrl}/oauth/callback`],
      scope: "atproto",
      grant_types: ["authorization_code", "refresh_token"],
      response_types: ["code"],
      application_type: "web",
      token_endpoint_auth_method: "none",
      dpop_bound_access_tokens: true,
    },
    ...createKVStores(env),
  });
}
