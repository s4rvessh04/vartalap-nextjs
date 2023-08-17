import { fetchRedis } from "@/helpers/redis";
import { authOptions } from "@/lib/auth";
import { db } from "@/lib/db";
import { pusherServer } from "@/lib/pusher";
import { toPusherKey } from "@/lib/utils";
import { addFriendValidator } from "@/lib/validations/add-friend";
import { getServerSession } from "next-auth";
import { z } from "zod";

export async function POST(req: Request, res: Response) {
	try {
		const body = await req.json();
		const { email: emailToAdd } = addFriendValidator.parse(body.email);
		const idToAdd = (await fetchRedis(
			"get",
			`user:email:${emailToAdd}`
		)) as string;
		const session = await getServerSession(authOptions);

		if (!idToAdd) {
			return new Response("User not found", { status: 404 });
		}

		if (!session) {
			return new Response("Unauthorized", { status: 401 });
		}

		if (session.user.id === idToAdd) {
			return new Response("You can't add yourself", { status: 400 });
		}

		// Check if the user is already added in friend requests
		const isAlreadyAdded = (await fetchRedis(
			"sismember",
			`user:${idToAdd}:incoming_friend_requests`,
			session.user.id
		)) as boolean;

		if (isAlreadyAdded) {
			return new Response("User already added", { status: 400 });
		}

		// Check if the user is already in the friends list
		const isAlreadyFriends = (await fetchRedis(
			"sismember",
			`user:${session.user.id}:friends`,
			idToAdd
		)) as boolean;

		if (isAlreadyFriends) {
			return new Response("User is already your friend", { status: 400 });
		}

		pusherServer.trigger(
			toPusherKey(`user:${idToAdd}:incoming_friend_requests`),
			"incoming_friend_requests",
			{
				senderId: session.user.id,
				senderEmail: session.user.email,
			}
		);

		// Add the user if all checks passed
		await db.sadd(
			`user:${idToAdd}:incoming_friend_requests`,
			session.user.id
		);
		return new Response("Friend request sent", { status: 200 });
	} catch (error) {
		if (error instanceof z.ZodError) {
			return new Response("Invalid request payload", { status: 422 });
		}

		return new Response("Invalid request", { status: 400 });
	}
}
