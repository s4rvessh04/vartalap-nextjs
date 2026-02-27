import { getFriendsByUserId } from "@/helpers/get-friends-by-user-id";
import { fetchRedis } from "@/helpers/redis";
import { authOptions } from "@/lib/auth";
import { chatHrefContructor } from "@/lib/utils";
import { ChevronRight, MessageCircle } from "lucide-react";
import { getServerSession } from "next-auth";
import Image from "next/image";
import Link from "next/link";
import { notFound } from "next/navigation";
import React, { FC } from "react";

const Page: FC = async () => {
	const session = await getServerSession(authOptions);
	if (!session) notFound();

	const friends = await getFriendsByUserId(session.user.id);
	const friendsWithLastMessage = (
		await Promise.all(
			friends.map(async (friend) => {
				const [rawLastMessage] = (await fetchRedis(
					"zrange",
					`chat:${chatHrefContructor(
						session.user.id,
						friend.id
					)}:messages`,
					-1,
					-1
				)) as string[];

				if (!rawLastMessage) return null;

				const lastMessage = JSON.parse(rawLastMessage) as Message;

				return {
					...friend,
					lastMessage,
				};
			})
		)
	).filter(Boolean) as (User & { lastMessage: Message })[];

	return (
		<div className="container py-12 animate-fade-in">
			<div className="flex items-center gap-3 mb-8">
				<div className="flex items-center justify-center w-10 h-10 rounded-xl bg-neutral-900 text-white">
					<MessageCircle className="h-5 w-5" />
				</div>
				<h1 className="font-bold text-3xl text-neutral-900">
					Recent Chats
				</h1>
			</div>
			{friendsWithLastMessage.length === 0 ? (
				<div className="flex flex-col items-center justify-center py-20 text-center">
					<div className="w-16 h-16 rounded-2xl bg-neutral-100 flex items-center justify-center mb-4">
						<MessageCircle className="h-8 w-8 text-neutral-300" />
					</div>
					<p className="text-sm text-neutral-400 font-medium">
						No conversations yet
					</p>
					<p className="text-xs text-neutral-300 mt-1">
						Add a friend to start chatting
					</p>
				</div>
			) : (
				<div className="space-y-3">
					{friendsWithLastMessage.map((friend) => (
						<Link
							key={friend.id}
							href={`/dashboard/chat/${chatHrefContructor(
								session.user.id,
								friend.id
							)}`}
							className="group relative flex items-center gap-4 bg-white border border-neutral-200/80 p-4 rounded-2xl hover:border-neutral-300 hover:shadow-sm transition-all duration-200"
						>
							<div className="relative flex-shrink-0">
								<div className="relative w-12 h-12 rounded-full overflow-hidden ring-2 ring-neutral-100">
									<Image
										referrerPolicy="no-referrer"
										className="rounded-full object-cover"
										src={friend.image}
										alt={`${friend.name} profile picture`}
										fill
									/>
								</div>
							</div>
							<div className="flex-1 min-w-0">
								<h4 className="text-sm font-semibold text-neutral-900 truncate">
									{friend.name}
								</h4>
								<p className="mt-0.5 text-sm text-neutral-400 truncate">
									{friend.lastMessage.senderId ===
										session.user.id ? (
										<span className="text-neutral-300">
											You:{" "}
										</span>
									) : null}
									{friend.lastMessage.text}
								</p>
							</div>
							<ChevronRight className="h-5 w-5 text-neutral-300 group-hover:text-neutral-500 transition-colors flex-shrink-0" />
						</Link>
					))}
				</div>
			)}
		</div>
	);
};

export default Page;
