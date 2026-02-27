"use client";

import React from "react";
import TextareaAutosize from "react-textarea-autosize";
import { Button } from "./Button";
import axios from "axios";
import { toast } from "react-hot-toast";
import { Send } from "lucide-react";

type Props = {
	chatPartner: User;
	chatId: string;
};

const ChatInput: React.FC<Props> = ({ chatPartner, chatId }) => {
	const textareaRef = React.useRef<HTMLTextAreaElement | null>(null);
	const [isLoading, setIsLoading] = React.useState<boolean>(false);
	const [input, setInput] = React.useState<string>("");

	const sendMessage = async () => {
		if (!input) return;

		setIsLoading(true);

		try {
			await axios.post("/api/message/send", {
				text: input,
				chatId,
			});
			setInput("");
			textareaRef.current?.focus();
		} catch (error) {
			toast.error("Failed to send message");
		} finally {
			setIsLoading(false);
		}
	};

	return (
		<div className="border-t border-neutral-200/80 px-4 py-3 bg-white rounded-b-2xl">
			<div className="relative flex items-end gap-2">
				<div className="relative flex-1 overflow-hidden rounded-2xl bg-neutral-100 focus-within:bg-white focus-within:ring-2 focus-within:ring-neutral-900 transition-all duration-200">
					<TextareaAutosize
						ref={textareaRef}
						onKeyDown={(e) => {
							if (e.key === "Enter" && !e.shiftKey) {
								e.preventDefault();
								sendMessage();
							}
						}}
						rows={1}
						value={input}
						onChange={(e) => setInput(e.target.value)}
						placeholder={`Message ${chatPartner.name}...`}
						className="block w-full resize-none border-0 bg-transparent text-neutral-900 placeholder:text-neutral-400 focus:ring-0 py-3 px-4 text-sm leading-6"
					/>
				</div>
				<Button
					isLoading={isLoading}
					onClick={sendMessage}
					type="submit"
					className="rounded-xl h-11 w-11 p-0 flex-shrink-0"
				>
					{isLoading ? null : <Send className="h-4 w-4" />}
				</Button>
			</div>
		</div>
	);
};

export default ChatInput;
