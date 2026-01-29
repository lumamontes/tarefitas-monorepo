/**
 * Auth client — stub for SignInForm until auth is wired
 */

export const authClient = {
  signIn: {
    social: async (_opts: { provider: string; callbackURL?: string }) => {
      // Stub: replace with real auth (e.g. better-auth, Firebase) when available
      console.warn("authClient.signIn.social is a stub; wire up your auth provider.");
    },
  },
};
