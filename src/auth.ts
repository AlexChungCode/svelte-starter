import { SvelteKitAuth, type Session, type SvelteKitAuthConfig, type User } from "@auth/sveltekit"
import Google from "@auth/sveltekit/providers/google"
import Resend from "@auth/sveltekit/providers/resend"
import {GOOGLE_CLIENT_ID, GOOGLE_CLIENT_SECRET, AUTH_SECRET, RESEND_API_KEY, RESEND_FROM} from "$env/static/private"
import { DrizzleAdapter } from "@auth/drizzle-adapter";
import { getDB } from "$lib/server";
import type { Provider } from "@auth/core/providers";

const providers: Provider[] = [
    Google({ clientId: GOOGLE_CLIENT_ID, clientSecret: GOOGLE_CLIENT_SECRET }),
    Resend({
      apiKey: RESEND_API_KEY,
      from: RESEND_FROM,
    }),
  ]
export const { handle, signIn, signOut } = SvelteKitAuth(async (event) => {
  const db = getDB(event.platform as App.Platform)
  const authOptions: SvelteKitAuthConfig = {
    adapter: DrizzleAdapter(db),
    providers: providers,
    pages: {
      signIn: "/signin",
      signOut: "/signout",
    },
    secret: AUTH_SECRET,
    trustHost: true,
    callbacks: {
      session: async ({ session, user }) => {
        if (session?.user) {
          session.user.id = user.id;
        }
        return session;
      }
    }
  };
  return authOptions;
})

export const providerMap = providers.map((provider) => {
    if (typeof provider === "function") {
      const providerData = provider()
      return { id: providerData.id, name: providerData.name }
    } else {
      return { id: provider.id, name: provider.name }
    }
  })