import { createCookieSessionStorage } from "@remix-run/cloudflare";
import type { Session } from "@atproto/oauth-client-node";

export const { getSession, commitSession, destroySession } =
  createCookieSessionStorage({
    cookie: {
      name: "__session",
      secrets: [process.env.SESSION_SECRET!],
      sameSite: "lax",
      path: "/",
      maxAge: 60 * 60 * 24 * 30, // 30 days
      httpOnly: true,
      secure: process.env.NODE_ENV === "production",
    },
  });

export const createKVStores = (env: Env) => {
  const sessionStore = {
    async set(sub: string, session: Session) {
      await env.OAUTH_SESSIONS.put(sub, JSON.stringify(session), {
        expirationTtl: 60 * 60 * 24 * 30, // 30 days
      });
    },
    async get(sub: string) {
      const data = await env.OAUTH_SESSIONS.get(sub);
      if (!data) return undefined;
      return JSON.parse(data) as Session;
    },
    async del(sub: string) {
      await env.OAUTH_SESSIONS.delete(sub);
    },
  };

  const stateStore = {
    async set(key: string, state: any) {
      await env.OAUTH_STATES.put(key, JSON.stringify(state), {
        expirationTtl: 3600, // 1 hour
      });
    },
    async get(key: string) {
      const data = await env.OAUTH_STATES.get(key);
      if (!data) return undefined;
      return JSON.parse(data);
    },
    async del(key: string) {
      await env.OAUTH_STATES.delete(key);
    },
  };

  return { sessionStore, stateStore };
};
