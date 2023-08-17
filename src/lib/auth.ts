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
			const dbUserResult = (await fetchRedis(
				"get",
				`user:${token.id}`
			)) as string | null;

			if (!dbUserResult) {
				token.id = user!.id;
				return token;
			}

			const dbUser = JSON.parse(dbUserResult) as User;

			return {
				id: dbUser.id,
				name: dbUser.name,
				email: dbUser.email,
				picture: dbUser.image,
			};
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
		redirect() {
			return "/dashboard";
		},
	},
};
