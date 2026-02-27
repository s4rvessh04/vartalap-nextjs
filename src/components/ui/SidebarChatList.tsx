"use client";

import { pusherClient } from "@/lib/pusher";
import { chatHrefContructor, toPusherKey } from "@/lib/utils";
import { usePathname, useRouter } from "next/navigation";
import { FC, useEffect, useState } from "react";
import { toast } from "react-hot-toast";
import UnseenChatToast from "../UnseenChatToast";
import Image from "next/image";

type Props = {
	friends: User[];
	sessionId: string;
};

interface ExtendedMessage extends Message {
	senderImg: string;
	senderName: string;
}

const SidebarChatList: FC<Props> = ({ friends, sessionId }) => {
	const router = useRouter();
	const pathname = usePathname();

	const [unseenMessages, setUnseenMessages] = useState<Message[]>([]);
	const [activeChats, setActiveChats] = useState<User[]>(friends);

	useEffect(() => {
		pusherClient.subscribe(toPusherKey(`user:${sessionId}:chats`));
		pusherClient.subscribe(toPusherKey(`user:${sessionId}:friends`));

		const newFriendHandler = (newFriend: User) => {
			setActiveChats((prev) => [...prev, newFriend]);
		};

		const chatHandler = (message: ExtendedMessage) => {
			const shouldNotify =
				pathname !==
				`/dashboard/chat/${chatHrefContructor(sessionId, message.senderId)}`;

			if (!shouldNotify) return;

			toast.custom((t) => (
				<UnseenChatToast
					t={t}
					sessionId={sessionId}
					senderId={message.senderId}
					senderImg={message.senderImg}
					senderMessage={message.text}
					senderName={message.senderName}
				/>
			));
			setUnseenMessages((prev) => [...prev, message]);
		};

		pusherClient.bind("new_message", chatHandler);
		pusherClient.bind("new_friend", newFriendHandler);

		return () => {
			pusherClient.unsubscribe(toPusherKey(`user:${sessionId}:chats`));
			pusherClient.unsubscribe(toPusherKey(`user:${sessionId}:friends`));

			pusherClient.unbind("new_message", chatHandler);
			pusherClient.unbind("new_friend", newFriendHandler);
		};
	}, [pathname, sessionId, router]);

	useEffect(() => {
		if (pathname?.includes("chat")) {
			setUnseenMessages((prev) => {
				return prev.filter((message) => !pathname.includes(message.senderId));
			});
		}
	}, [pathname]);

	const isActive = (friendId: string) => {
		return pathname?.includes(chatHrefContructor(sessionId, friendId));
	};

	return (
		<ul role="list" className="max-h-[25rem] overflow-y-auto -mx-2 space-y-1">
			{activeChats.sort().map((friend) => {
				const unseenMessageCount = unseenMessages.filter(
					(message) => message.senderId === friend.id
				).length;
				const active = isActive(friend.id);

				return (
					<li key={friend.id}>
						<a
							href={`/dashboard/chat/${chatHrefContructor(
								sessionId,
								friend.id
							)}`}
							className={`group flex items-center gap-x-3 rounded-xl p-2.5 text-sm leading-6 font-medium transition-all duration-200 ${active
									? "bg-neutral-900 text-white"
									: "text-neutral-600 hover:text-neutral-900 hover:bg-neutral-100"
								}`}
						>
							<div className="relative h-8 w-8 rounded-full overflow-hidden flex-shrink-0">
								<Image
									fill
									referrerPolicy="no-referrer"
									className="rounded-full object-cover"
									src={friend.image}
									alt={`${friend.name}`}
								/>
							</div>
							<span className="truncate flex-1">{friend.name}</span>
							{unseenMessageCount > 0 && (
								<div className={`font-medium text-xs w-5 h-5 rounded-full flex justify-center items-center flex-shrink-0 ${active
										? "bg-white text-neutral-900"
										: "bg-neutral-900 text-white"
									}`}>
									{unseenMessageCount}
								</div>
							)}
						</a>
					</li>
				);
			})}
		</ul>
	);
};

export default SidebarChatList;
