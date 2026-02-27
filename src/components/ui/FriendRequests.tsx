"use client";

import { pusherClient } from "@/lib/pusher";
import { toPusherKey } from "@/lib/utils";
import axios from "axios";
import { X } from "lucide-react";
import { Check, UserPlus } from "lucide-react";
import { useRouter } from "next/navigation";
import React, { FC, useEffect } from "react";

type Props = {
	incomingFriendRequests: IncomingFriendRequest[];
	sessionId: string;
};

const FriendRequests: FC<Props> = ({ incomingFriendRequests, sessionId }) => {
	const router = useRouter();

	const [friendRequests, setFriendRequests] = React.useState<
		IncomingFriendRequest[]
	>(incomingFriendRequests);

	useEffect(() => {
		pusherClient.subscribe(
			toPusherKey(`user:${sessionId}:incoming_friend_requests`)
		);

		const friendRequestHandler = ({
			senderId,
			senderEmail,
		}: IncomingFriendRequest) => {
			setFriendRequests((prev) => [...prev, { senderId, senderEmail }]);
		};

		pusherClient.bind("incoming_friend_requests", friendRequestHandler);

		return () => {
			pusherClient.unsubscribe(
				toPusherKey(`user:${sessionId}:incoming_friend_requests`)
			);
			pusherClient.unbind(
				"incoming_friend_requests",
				friendRequestHandler
			);
		};
	}, [sessionId]);

	const acceptFriend = async (senderId: string) => {
		await axios.post("/api/friends/accept", { id: senderId });

		setFriendRequests((prev) =>
			prev.filter((request) => request.senderId !== senderId)
		);
		router.refresh();
	};

	const denyFriend = async (senderId: string) => {
		await axios.post("/api/friends/deny", { id: senderId });

		setFriendRequests((prev) =>
			prev.filter((request) => request.senderId !== senderId)
		);
		router.refresh();
	};

	return (
		<>
			{friendRequests.length === 0 ? (
				<div className="flex flex-col items-center justify-center py-12 text-center">
					<div className="w-14 h-14 rounded-2xl bg-neutral-100 flex items-center justify-center mb-3">
						<UserPlus className="h-7 w-7 text-neutral-300" />
					</div>
					<p className="text-sm text-neutral-400 font-medium">
						No pending requests
					</p>
					<p className="text-xs text-neutral-300 mt-1">
						When someone sends you a request, it will show up here
					</p>
				</div>
			) : (
				friendRequests.map((request) => (
					<div
						key={request.senderId}
						className="flex items-center gap-4 p-3 rounded-xl bg-neutral-50 animate-fade-in"
					>
						<div className="w-10 h-10 rounded-full bg-neutral-200 flex items-center justify-center flex-shrink-0">
							<UserPlus className="h-5 w-5 text-neutral-500" />
						</div>
						<p className="font-medium text-sm text-neutral-900 flex-1 truncate">
							{request.senderEmail}
						</p>
						<div className="flex gap-2 flex-shrink-0">
							<button
								onClick={() => acceptFriend(request.senderId)}
								aria-label="accept friend"
								className="w-9 h-9 bg-neutral-900 hover:bg-neutral-700 grid place-items-center rounded-xl transition-all duration-200 hover:shadow-md"
							>
								<Check className="text-white w-4 h-4" />
							</button>
							<button
								onClick={() => denyFriend(request.senderId)}
								aria-label="deny friend"
								className="w-9 h-9 bg-neutral-200 hover:bg-neutral-300 grid place-items-center rounded-xl transition-all duration-200"
							>
								<X className="text-neutral-600 w-4 h-4" />
							</button>
						</div>
					</div>
				))
			)}
		</>
	);
};

export default FriendRequests;
