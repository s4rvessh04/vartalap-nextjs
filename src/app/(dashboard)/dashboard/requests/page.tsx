import FriendRequests from "@/components/ui/FriendRequests";
import { fetchRedis } from "@/helpers/redis";
import { authOptions } from "@/lib/auth";
import { getServerSession } from "next-auth";
import { notFound } from "next/navigation";
import React, { FC } from "react";
import { Users } from "lucide-react";

const page: FC = async () => {
	const session = await getServerSession(authOptions);
	if (!session) notFound();

	// ids of people who sent the friend request for current user
	const incomingSenderIds = (await fetchRedis(
		"smembers",
		`user:${session.user.id}:incoming_friend_requests`
	)) as string[];

	const incomingFriendRequests = await Promise.all(
		incomingSenderIds.map(async (senderId) => {
			const sender = (await fetchRedis(
				"get",
				`user:${senderId}`
			)) as string;
			const senderParsed = JSON.parse(sender) as User;
			return { senderId, senderEmail: senderParsed.email };
		})
	);

	return (
		<main className="pt-8 animate-fade-in">
			<div className="flex items-center gap-3 mb-8">
				<div className="flex items-center justify-center w-10 h-10 rounded-xl bg-neutral-900 text-white">
					<Users className="h-5 w-5" />
				</div>
				<h1 className="font-bold text-3xl text-neutral-900">
					Friend Requests
				</h1>
			</div>
			<div className="bg-white rounded-2xl border border-neutral-200/80 p-6">
				<div className="flex flex-col gap-4">
					<FriendRequests
						incomingFriendRequests={incomingFriendRequests}
						sessionId={session.user.id}
					/>
				</div>
			</div>
		</main>
	);
};

export default page;
