import { NodeOAuthClient } from "@atproto/oauth-client-node";
import { createKVStores } from "./session.server";

export function createOAuthClient(env: Env) {
  const { sessionStore, stateStore } = createKVStores(env);

  return new NodeOAuthClient({
    clientMetadata: {
      client_id: "https://btv.watch/client-metadata.json",
      client_name: "bTV",
      client_uri: "https://btv.watch",
      redirect_uris: ["https://btv.watch/oauth/callback"],
      grant_types: ["authorization_code", "refresh_token"],
      response_types: ["code"],
      application_type: "web",
      token_endpoint_auth_method: "none",
      dpop_bound_access_tokens: true,
    },
    sessionStore,
    stateStore,
  });
}
