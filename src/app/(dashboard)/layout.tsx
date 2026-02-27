import Link from "next/link";
import { Icons } from "@/components/ui/Icons";
import { authOptions } from "@/lib/auth";
import { getServerSession } from "next-auth";
import { notFound } from "next/navigation";
import { ReactNode } from "react";
import Image from "next/image";
import SignOutButton from "@/components/ui/SignOutButton";
import FriendRequestsSidebarOptions from "@/components/ui/FriendRequestsSidebarOptions";
import { fetchRedis } from "@/helpers/redis";
import { getFriendsByUserId } from "@/helpers/get-friends-by-user-id";
import SidebarChatList from "@/components/ui/SidebarChatList";
import MobileChatLayout from "@/components/MobileChatLayout";
import { SidebarOption } from "@/types/typings";

interface LayoutProps {
	children: ReactNode;
}

const sidebarOptions: SidebarOption[] = [
	{
		id: 1,
		name: "Add Friend",
		href: "/dashboard/add",
		Icon: "UserPlus",
	},
];

const Layout = async ({ children }: LayoutProps) => {
	const session = await getServerSession(authOptions);
	if (!session) notFound();

	const friends = await getFriendsByUserId(session.user.id);

	const unseenRequestCount = (
		(await fetchRedis(
			"smembers",
			`user:${session.user.id}:incoming_friend_requests`
		)) as User[]
	).length;

	return (
		<div className="w-full flex h-screen bg-neutral-50">
			<div className="md:hidden">
				<MobileChatLayout
					unseenRequestCount={unseenRequestCount}
					session={session}
					friends={friends}
					sidebarOptions={sidebarOptions}
				/>
			</div>
			<div className="hidden md:flex h-full w-full max-w-xs grow flex-col gap-y-5 overflow-y-auto border-r border-neutral-200/80 bg-white px-6">
				<Link
					href="/dashboard"
					className="flex h-16 shrink-0 items-center gap-3 group"
				>
					<div className="flex items-center justify-center w-9 h-9 rounded-xl bg-neutral-900 text-white group-hover:scale-105 transition-transform">
						<Icons.Logo className="h-5 w-5" />
					</div>
					<span className="text-lg font-bold tracking-tight text-neutral-900">
						Vartalap
					</span>
				</Link>

				<div className="h-px bg-neutral-100 -mx-6" />

				{friends.length > 0 && (
					<div className="text-[11px] font-semibold leading-6 text-neutral-400 uppercase tracking-widest">
						Your Chats
					</div>
				)}
				<nav className="flex flex-1 flex-col">
					<ul role="list" className="flex flex-1 flex-col gap-y-7">
						<li>
							<SidebarChatList
								sessionId={session.user.id}
								friends={friends}
							/>
						</li>
						<li>
							<div className="text-[11px] font-semibold leading-6 text-neutral-400 uppercase tracking-widest">
								Overview
							</div>
							<ul role="list" className="-mx-2 mt-2 space-y-1">
								{sidebarOptions.map((option) => {
									const Icon = Icons[option.Icon];
									return (
										<li key={option.id}>
											<Link
												href={option.href}
												className="text-neutral-500 hover:text-neutral-900 hover:bg-neutral-100 group flex gap-3 rounded-xl p-2.5 text-sm leading-6 font-medium transition-all duration-200"
											>
												<span className="text-neutral-400 border-neutral-200 group-hover:border-neutral-900 group-hover:text-neutral-900 flex h-7 w-7 shrink-0 items-center justify-center rounded-lg border text-[0.625rem] font-medium bg-white transition-all duration-200">
													<Icon className="h-4 w-4" />
												</span>
												<span className="truncate">
													{option.name}
												</span>
											</Link>
										</li>
									);
								})}
								<li>
									<FriendRequestsSidebarOptions
										initialUnseenRequestCount={
											unseenRequestCount
										}
										sessionId={session.user.id}
									/>
								</li>
							</ul>
						</li>
						<li className="-mx-6 mt-auto">
							<div className="h-px bg-neutral-100" />
							<div className="flex items-center gap-x-4 px-6 py-4 text-sm font-semibold leading-6 text-neutral-900">
								<div className="relative h-9 w-9 rounded-full overflow-hidden ring-2 ring-neutral-100">
									<Image
										fill
										referrerPolicy="no-referrer"
										className="rounded-full object-cover"
										src={session.user.image || ""}
										alt="Your profile picture"
									/>
								</div>

								<span className="sr-only">Your profile</span>
								<div className="flex flex-col flex-1 min-w-0">
									<span className="truncate" aria-hidden="true">
										{session.user.name}
									</span>
									<span
										className="text-xs text-neutral-400 truncate"
										aria-hidden="true"
									>
										{session.user.email}
									</span>
								</div>
								<SignOutButton className="h-full aspect-square" />
							</div>
						</li>
					</ul>
				</nav>
			</div>
			<aside className="max-h-screen container py-16 md:py-12 w-full overflow-y-auto">
				{children}
			</aside>
		</div>
	);
};

export default Layout;
