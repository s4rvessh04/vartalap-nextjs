"use client";

import { pusherClient } from "@/lib/pusher";
import { cn, toPusherKey } from "@/lib/utils";
import { format } from "date-fns";
import Image from "next/image";
import React, { useEffect } from "react";

type Props = {
	initialMessages: Message[];
	sessionId: string;
	chatId: string;
	sessionImg: string | null | undefined;
	chatPartner: User;
};

function Messages({
	initialMessages,
	sessionId,
	chatId,
	sessionImg,
	chatPartner,
}: Props) {
	const scrollDownRef = React.useRef<HTMLDivElement>(null);
	const [messages, setMessages] = React.useState<Message[]>(initialMessages);

	const formatTimestamp = (timestamp: number) => {
		return format(timestamp, "HH:mm");
	};

	useEffect(() => {
		pusherClient.subscribe(toPusherKey(`chat:${chatId}`));

		const messageHandler = (message: Message) => {
			setMessages((prev) => [message, ...prev]);
		};

		pusherClient.bind("incoming-message", messageHandler);

		return () => {
			pusherClient.unsubscribe(toPusherKey(`chat:${chatId}`));
			pusherClient.unbind("incoming-message", messageHandler);
		};
	}, [sessionId, chatId]);
	return (
		<div
			id="messages"
			className="flex h-full flex-1 flex-col-reverse gap-3 p-4 overflow-y-auto scrollbar-thumb-blue scrollbar-thumb-rounded scrollbar-track-blue-lighter scrollbar-w-2 scrollbar-touch bg-neutral-50/50"
		>
			<div ref={scrollDownRef} />
			{messages.map((message, index) => {
				const isCurrentUser = message.senderId === sessionId;
				const hasNextMessageFromSameUser =
					messages[index - 1]?.senderId === messages[index].senderId;
				return (
					<div
						key={`${message.id}-${message.timestamp}`}
						className="chat-message animate-fade-in"
					>
						<div
							className={cn(`flex items-end`, {
								"justify-end": isCurrentUser,
							})}
						>
							<div
								className={cn(
									"flex flex-col space-y-2 text-sm max-w-[70%] mx-2",
									{
										"order-1 items-end": isCurrentUser,
										"order-2 items-start": !isCurrentUser,
									}
								)}
							>
								<span
									className={cn(
										"px-4 py-2.5 inline-block shadow-sm",
										{
											"bg-neutral-900 text-white rounded-2xl rounded-br-md":
												isCurrentUser && !hasNextMessageFromSameUser,
											"bg-neutral-900 text-white rounded-2xl":
												isCurrentUser && hasNextMessageFromSameUser,
											"bg-white text-neutral-900 rounded-2xl rounded-bl-md border border-neutral-200/80":
												!isCurrentUser && !hasNextMessageFromSameUser,
											"bg-white text-neutral-900 rounded-2xl border border-neutral-200/80":
												!isCurrentUser && hasNextMessageFromSameUser,
										}
									)}
								>
									{message.text}{" "}
									<span
										className={cn("ml-2 text-[10px]", {
											"text-neutral-400": isCurrentUser,
											"text-neutral-300": !isCurrentUser,
										})}
									>
										{formatTimestamp(message.timestamp)}
									</span>
								</span>
							</div>
							<div
								className={cn("relative w-7 h-7", {
									"order-2": isCurrentUser,
									"order-1": !isCurrentUser,
									invisible: hasNextMessageFromSameUser,
								})}
							>
								<Image
									fill
									src={
										isCurrentUser
											? (sessionImg as string)
											: chatPartner.image
									}
									alt="Profile picture"
									referrerPolicy="no-referrer"
									className="rounded-full object-cover"
								/>
							</div>
						</div>
					</div>
				);
			})}
		</div>
	);
}

export default Messages;
