"use client";

import { pusherClient } from "@/lib/pusher";
import { toPusherKey } from "@/lib/utils";
import { User } from "lucide-react";
import Link from "next/link";
import React, { FC, useEffect } from "react";

interface FriendRequestsSidebarOptionsProps {
	sessionId: string;
	initialUnseenRequestCount: number;
}

const FriendRequestsSidebarOptions: FC<FriendRequestsSidebarOptionsProps> = ({
	sessionId,
	initialUnseenRequestCount,
}) => {
	const [unseenRequestCount, setUnseenRequestCount] = React.useState<number>(
		initialUnseenRequestCount
	);

	useEffect(() => {
		pusherClient.subscribe(
			toPusherKey(`user:${sessionId}:incoming_friend_requests`)
		);
		pusherClient.subscribe(toPusherKey(`user:${sessionId}:friends`));

		const friendRequestHandler = () => {
			setUnseenRequestCount((prev) => prev + 1);
		};

		const addedFriendHandler = () => {
			setUnseenRequestCount((prev) => prev - 1);
		};

		pusherClient.bind("incoming_friend_requests", friendRequestHandler);
		pusherClient.bind("new_friend", addedFriendHandler);

		return () => {
			pusherClient.unsubscribe(
				toPusherKey(`user:${sessionId}:incoming_friend_requests`)
			);
			pusherClient.unsubscribe(toPusherKey(`user:${sessionId}:friends`));
			pusherClient.unbind("incoming_friend_requests", friendRequestHandler);
			pusherClient.unbind("new_friend", addedFriendHandler);
		};
	}, [sessionId]);

	return (
		<Link
			href="/dashboard/requests"
			className="text-neutral-500 hover:text-neutral-900 hover:bg-neutral-100 group flex items-center gap-x-3 rounded-xl p-2.5 text-sm leading-6 font-medium transition-all duration-200"
		>
			<div className="text-neutral-400 border-neutral-200 group-hover:border-neutral-900 group-hover:text-neutral-900 flex h-7 w-7 shrink-0 items-center justify-center rounded-lg border text-[0.625rem] font-medium bg-white transition-all duration-200">
				<User className="h-4 w-4" />
			</div>
			<p className="truncate">Friend Requests</p>
			{unseenRequestCount > 0 && (
				<div className="rounded-full w-5 h-5 text-xs flex justify-center items-center text-white bg-neutral-900 font-medium">
					{unseenRequestCount}
				</div>
			)}
		</Link>
	);
};

export default FriendRequestsSidebarOptions;
