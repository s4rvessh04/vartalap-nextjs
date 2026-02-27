import { NextAuthOptions } from "next-auth";
import GoogleProvider from "next-auth/providers/google";
import { UpstashRedisAdapter } from "@auth/upstash-redis-adapter";
import type { Adapter } from "next-auth/adapters";
import { db } from "./db";
import { fetchRedis } from "@/helpers/redis";

function getGoogleCredentials() {
	const googleClientId = process.env.GOOGLE_CLIENT_ID;
	const googleClientSecret = process.env.GOOGLE_CLIENT_SECRET;

	if (!googleClientId || !googleClientSecret) {
		throw new Error("Missing Google credentials");
	}

	return {
		clientId: googleClientId,
		clientSecret: googleClientSecret,
	};
}
export const authOptions: NextAuthOptions = {
	adapter: UpstashRedisAdapter(db) as Adapter,
	session: {
		strategy: "jwt",
	},
	pages: {
		signIn: "/login",
	},
	providers: [
		GoogleProvider({
			...getGoogleCredentials(),
		}),
	],
	callbacks: {
		async jwt({ token, user }) {
			// On initial sign-in, user object is provided by the provider
			// On subsequent calls (session validation), only token is available
			if (user) {
				token.id = user.id;
			}

			if (!token.id) {
				return token;
			}

			try {
				const dbUserResult = (await fetchRedis(
					"get",
					`user:${token.id}`
				)) as string | null;

				if (!dbUserResult) {
					return token;
				}

				const dbUser = JSON.parse(dbUserResult) as User;

				return {
					id: dbUser.id,
					name: dbUser.name,
					email: dbUser.email,
					picture: dbUser.image,
				};
			} catch (error) {
				// If Redis fails, return the token as-is to prevent auth loop
				console.error("Error fetching user from Redis:", error);
				return token;
			}
		},

		async session({ session, token }) {
			if (token) {
				session.user.id = token.id;
				session.user.name = token.name;
				session.user.email = token.email;
				session.user.image = token.picture;
			}

			return session;
		},
		redirect({ url, baseUrl }) {
			if (url.startsWith("/")) return `${baseUrl}${url}`;
			if (new URL(url).origin === baseUrl) return url;
			return `${baseUrl}/dashboard`;
		},
	},
};
