import { createCookieSessionStorage } from "@remix-run/cloudflare";
import type {
  Session,
  NodeSavedSession,
  NodeSavedState,
} from "@atproto/oauth-client";

export const { getSession, commitSession, destroySession } =
  createCookieSessionStorage({
    cookie: {
      name: "__session",
      secrets: [process.env.SESSION_SECRET || "dev-secret"],
      sameSite: "lax",
      path: "/",
      maxAge: 60 * 60 * 24 * 30,
      httpOnly: true,
      secure: process.env.NODE_ENV === "production",
    },
  });

const createMemoryStore = <T>() => {
  const store = new Map<string, T>();
  return {
    get: async (key: string) => store.get(key),
    set: async (key: string, value: T) => {
      store.set(key, value);
    },
    del: async (key: string) => {
      store.delete(key);
    },
  };
};

const DEV_SESSION_STORE = createMemoryStore<NodeSavedSession>();
const DEV_STATE_STORE = createMemoryStore<NodeSavedState>();

export const createKVStores = (env: Env) => {
  const isDev = process.env.NODE_ENV !== "production";

  return {
    sessionStore: {
      async set(sub: string, session: NodeSavedSession) {
        if (isDev) {
          await DEV_SESSION_STORE.set(sub, session);
          return;
        }
        await env.OAUTH_SESSIONS.put(sub, JSON.stringify(session), {
          expirationTtl: 60 * 60 * 24 * 30,
        });
      },
      async get(sub: string) {
        if (isDev) {
          return DEV_SESSION_STORE.get(sub);
        }
        const data = await env.OAUTH_SESSIONS.get(sub);
        if (!data) return undefined;
        return JSON.parse(data) as NodeSavedSession;
      },
      async del(sub: string) {
        if (isDev) {
          await DEV_SESSION_STORE.del(sub);
          return;
        }
        await env.OAUTH_SESSIONS.delete(sub);
      },
    },
    stateStore: {
      async set(key: string, state: NodeSavedState) {
        if (isDev) {
          await DEV_STATE_STORE.set(key, state);
          return;
        }
        await env.OAUTH_STATES.put(key, JSON.stringify(state), {
          expirationTtl: 3600,
        });
      },
      async get(key: string) {
        if (isDev) {
          return DEV_STATE_STORE.get(key);
        }
        const data = await env.OAUTH_STATES.get(key);
        if (!data) return undefined;
        return JSON.parse(data) as NodeSavedState;
      },
      async del(key: string) {
        if (isDev) {
          await DEV_STATE_STORE.del(key);
          return;
        }
        await env.OAUTH_STATES.delete(key);
      },
    },
  };
};
