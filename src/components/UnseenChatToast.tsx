import { chatHrefContructor, cn } from "@/lib/utils";
import Image from "next/image";
import React from "react";
import { toast, type Toast } from "react-hot-toast";

type Props = {
	t: Toast;
	sessionId: string;
	senderId: string;
	senderImg: string;
	senderName: string;
	senderMessage: string;
};

const UnseenChatToast = (props: Props) => {
	return (
		<div
			className={cn(
				"max-w-md w-full bg-white shadow-lg rounded-lg pointer-events-auto flex ring-1 ring-black ring-opacity-5",
				{
					"animate-enter": props.t.visible,
					"animate-leave": !props.t.visible,
				}
			)}
		>
			<a
				href={`/dashboard/chat/${chatHrefContructor(
					props.sessionId,
					props.senderId
				)}`}
				onClick={() => toast.dismiss(props.t.id)}
				className="flex-1 w-0 p-4"
			>
				<div className="flex items-start">
					<div className="flex-shrink-0 pt-0.5">
						<div className="relative h-10 w-10">
							<Image
								fill
								referrerPolicy="no-referrer"
								className="rounded-full"
								src={props.senderImg}
								alt={`${props.senderName} profile picture`}
							/>
						</div>
					</div>
					<div className="ml-3 flex-1">
						<p className="text-sm font-medium text-gray-900">
							{props.senderName}
						</p>
						<p className="mt-1 text-sm text-gray-500">
							{props.senderMessage}
						</p>
					</div>
				</div>
			</a>
			<div className="flex border-l border-gray-200">
				<button
					onClick={() => toast.dismiss(props.t.id)}
					className="w-full border border-transparent rounded-r-lg p-4 flex items-center justify-center text-indigo-600 hover:text-indigo-500 focus:outline-none focus:ring-2 focus:ring-indigo-500"
				>
					Close
				</button>
			</div>
		</div>
	);
};

export default UnseenChatToast;
