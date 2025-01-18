import type { Adapter, AdapterUser, AdapterSession } from "@auth/core/adapters";

import NodeCache from "node-cache";

export default function NodeCacheAdapter(
  dbAdapter: Adapter,
  options?: { ttl?: number },
): Adapter {
  const adapter = dbAdapter;
  const stdTTL = options?.ttl ?? 60 * 60; // 60min cache
  const cache = new NodeCache({ stdTTL, checkperiod: stdTTL + 2 });

  const getSessionAndUserCacheKey = (sessionToken: string) =>
    `nca:getSessionAndUser:${sessionToken}`;

  return {
    createUser: (data) => {
      return adapter.createUser!(data);
    },
    getUser: (id) => {
      return adapter.getUser!(id);
    },
    getUserByEmail: (email) => {
      return adapter.getUserByEmail!(email);
    },
    async getUserByAccount(provider_providerAccountId) {
      return adapter.getUserByAccount!(provider_providerAccountId);
    },
    updateUser: (data) => {
      return adapter.updateUser!(data);
    },
    deleteUser: (id) => {
      return adapter.deleteUser!(id);
    },
    linkAccount: (data) => {
      return adapter.linkAccount!(data);
    },
    unlinkAccount: (provider_providerAccountId) => {
      return adapter.unlinkAccount!(provider_providerAccountId);
    },
    async getSessionAndUser(sessionToken) {
      const cacheKey = getSessionAndUserCacheKey(sessionToken);
      const cached: { user: AdapterUser; session: AdapterSession } | undefined =
        cache.get(cacheKey);
      let userAndSession: {
        user: AdapterUser;
        session: AdapterSession;
      } | null = null;
      if (cached === undefined) {
        const toCache = await adapter.getSessionAndUser!(sessionToken);
        if (toCache) {
          cache.set(cacheKey, toCache);
        }
        userAndSession = toCache;
      } else {
        userAndSession = cached;
      }
      if (!userAndSession) return null;
      const { user, session } = userAndSession;
      return { user, session } as {
        user: AdapterUser;
        session: AdapterSession;
      };
    },
    createSession: (data) => {
      return adapter.createSession!(data);
    },
    updateSession: async (data) => {
      const cacheKey = getSessionAndUserCacheKey(data.sessionToken);
      const result = adapter.updateSession!(data);

      if (result instanceof Promise) {
        await result.then(() => {
          cache.del(cacheKey);
        });
      } else {
        cache.del(cacheKey);
      }

      return result;
    },
    deleteSession: (sessionToken) => {
      const cacheKey = getSessionAndUserCacheKey(sessionToken);
      const result = adapter.deleteSession!(sessionToken);

      if (result instanceof Promise) {
        void result.then(() => {
          cache.del(cacheKey);
        });
      } else {
        cache.del(cacheKey);
      }

      return result;
    },
    async createVerificationToken(data) {
      return adapter.createVerificationToken!(data);
    },
    async useVerificationToken(identifier_token) {
      return adapter.useVerificationToken!(identifier_token);
    },
    async getAccount(providerAccountId, provider) {
      return adapter.getAccount!(providerAccountId, provider);
    },
    async createAuthenticator(authenticator) {
      return adapter.createAuthenticator!(authenticator);
    },
    async getAuthenticator(credentialID) {
      return adapter.getAuthenticator!(credentialID);
    },
    async listAuthenticatorsByUserId(userId) {
      return adapter.listAuthenticatorsByUserId!(userId);
    },
    async updateAuthenticatorCounter(credentialID, counter) {
      return adapter.updateAuthenticatorCounter!(credentialID, counter);
    },
  };
}
