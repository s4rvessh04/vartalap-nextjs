import React, { FC } from "react";

import AddFriendButton from "@/components/ui/AddFriendButton";
import { UserPlus } from "lucide-react";

const page: FC = () => {
	return (
		<main className="pt-8 animate-fade-in">
			<div className="flex items-center gap-3 mb-8">
				<div className="flex items-center justify-center w-10 h-10 rounded-xl bg-neutral-900 text-white">
					<UserPlus className="h-5 w-5" />
				</div>
				<h1 className="font-bold text-3xl text-neutral-900">
					Add a friend
				</h1>
			</div>
			<div className="bg-white rounded-2xl border border-neutral-200/80 p-6">
				<AddFriendButton />
			</div>
		</main>
	);
};

export default page;
