import ChatInput from "@/components/ui/ChatInput";
import Messages from "@/components/ui/Messages";
import { fetchRedis } from "@/helpers/redis";
import { authOptions } from "@/lib/auth";
import { db } from "@/lib/db";
import { messageArraySchema } from "@/lib/validations/message";
import { getServerSession } from "next-auth";
import Image from "next/image";
import { notFound } from "next/navigation";
import React, { FC } from "react";

type Props = {
	params: {
		chatId: string;
	};
};

async function getChatMessages(chatId: string) {
	try {
		const results: string[] = await fetchRedis(
			"zrange",
			`chat:${chatId}:messages`,
			0,
			-1
		);

		const dbMessages = results.map((message) => JSON.parse(message) as Message);
		const reversedDbMessages = dbMessages.reverse();
		const messages = messageArraySchema.parse(reversedDbMessages) as Message[];
		return messages;
	} catch (error) {
		notFound();
	}
}

const page: FC<Props> = async ({ params }: Props) => {
	const { chatId } = params;
	const session = await getServerSession(authOptions);

	if (!session) notFound();

	const { user } = session;

	const [userId1, userId2] = chatId.split("--");

	if (userId1 !== user.id && userId2 !== user.id) notFound();

	const chatPartnerId = userId1 === user.id ? userId2 : userId1;
	const chatPartnerRaw = (await fetchRedis(
		"get",
		`user:${chatPartnerId}`
	)) as string;
	const chatPartner = JSON.parse(chatPartnerRaw) as User;
	const initialMessages = await getChatMessages(chatId);

	return (
		<div className="flex-1 justify-between flex flex-col h-full max-h-[calc(100vh-6rem)]">
			<div className="flex sm:items-center justify-between py-4 px-4 sm:px-6 border-b border-neutral-200/80 bg-white rounded-t-2xl">
				<div className="relative flex items-center space-x-4">
					<div className="relative">
						<div className="relative w-10 sm:w-12 h-10 sm:h-12 rounded-full overflow-hidden ring-2 ring-neutral-100">
							<Image
								fill
								referrerPolicy="no-referrer"
								src={chatPartner.image}
								alt={`${chatPartner.name} profile picture`}
								className="rounded-full object-cover"
							/>
						</div>
						<span className="absolute bottom-0 right-0 w-3 h-3 bg-emerald-500 border-2 border-white rounded-full" />
					</div>
					<div className="flex flex-col leading-tight">
						<div className="text-base sm:text-lg flex items-center">
							<span className="text-neutral-900 font-semibold">
								{chatPartner.name}
							</span>
						</div>
						<span className="text-xs text-neutral-400">{chatPartner.email}</span>
					</div>
				</div>
			</div>
			<Messages
				initialMessages={initialMessages}
				sessionId={session.user.id}
				chatId={chatId}
				chatPartner={chatPartner}
				sessionImg={session.user.image}
			/>
			<ChatInput chatPartner={chatPartner} chatId={chatId} />
		</div>
	);
};

export default page;
