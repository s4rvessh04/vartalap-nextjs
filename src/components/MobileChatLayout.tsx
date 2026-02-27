"use client";

import { Transition, Dialog } from "@headlessui/react";
import { Menu, X } from "lucide-react";
import Image from "next/image";
import Link from "next/link";
import { FC, Fragment, useEffect, useState } from "react";
import { Session } from "next-auth";
import { usePathname } from "next/navigation";
import { Button, buttonVariants } from "./ui/Button";
import { Icons } from "./ui/Icons";
import SidebarChatList from "./ui/SidebarChatList";
import FriendRequestsSidebarOptions from "./ui/FriendRequestsSidebarOptions";
import SignOutButton from "./ui/SignOutButton";
import { SidebarOption } from "@/types/typings";

interface MobileChatLayoutProps {
	friends: User[];
	session: Session;
	sidebarOptions: SidebarOption[];
	unseenRequestCount: number;
}

const MobileChatLayout: FC<MobileChatLayoutProps> = ({
	friends,
	session,
	sidebarOptions,
	unseenRequestCount,
}) => {
	const [open, setOpen] = useState<boolean>(false);

	const pathname = usePathname();

	useEffect(() => {
		setOpen(false);
	}, [pathname]);

	return (
		<div className="fixed bg-white border-b border-neutral-200/80 top-0 inset-x-0 py-2 px-4 z-20">
			<div className="w-full flex justify-between items-center">
				<Link href="/dashboard" className="flex items-center gap-2">
					<div className="flex items-center justify-center w-8 h-8 rounded-lg bg-neutral-900 text-white">
						<Icons.Logo className="h-4 w-4" />
					</div>
					<span className="font-bold text-neutral-900">Vartalap</span>
				</Link>
				<Button onClick={() => setOpen(true)} intent="ghost" className="gap-2 rounded-xl">
					Menu <Menu className="h-5 w-5" />
				</Button>
			</div>
			<Transition.Root show={open} as={Fragment}>
				<Dialog as="div" className="relative z-40" onClose={setOpen}>
					<Transition.Child
						as={Fragment}
						enter="transition-opacity ease-linear duration-300"
						enterFrom="opacity-0"
						enterTo="opacity-100"
						leave="transition-opacity ease-linear duration-300"
						leaveFrom="opacity-100"
						leaveTo="opacity-0"
					>
						<div className="fixed inset-0 bg-black/30 backdrop-blur-sm" />
					</Transition.Child>

					<div className="fixed inset-0 overflow-hidden">
						<div className="absolute inset-0 overflow-hidden">
							<div className="pointer-events-none fixed inset-y-0 left-0 flex max-w-full pr-10">
								<Transition.Child
									as={Fragment}
									enter="transform transition ease-in-out duration-500 sm:duration-700"
									enterFrom="-translate-x-full"
									enterTo="translate-x-0"
									leave="transform transition ease-in-out duration-500 sm:duration-700"
									leaveFrom="translate-x-0"
									leaveTo="-translate-x-full"
								>
									<Dialog.Panel className="pointer-events-auto w-screen max-w-sm">
										<div className="flex h-full flex-col overflow-hidden bg-white py-6 shadow-2xl">
											<div className="px-4 sm:px-6">
												<div className="flex items-start justify-between">
													<Dialog.Title className="text-base font-semibold leading-6 text-neutral-900">
														Dashboard
													</Dialog.Title>
													<div className="ml-3 flex h-7 items-center">
														<button
															type="button"
															className="rounded-lg bg-neutral-100 p-1.5 text-neutral-500 hover:text-neutral-900 hover:bg-neutral-200 focus:outline-none transition-all duration-200"
															onClick={() => setOpen(false)}
														>
															<span className="sr-only">Close panel</span>
															<X className="h-5 w-5" aria-hidden="true" />
														</button>
													</div>
												</div>
											</div>

											<div className="h-px bg-neutral-100 mt-4" />

											<div className="relative mt-4 flex-1 px-4 sm:px-6">
												{friends.length > 0 ? (
													<div className="text-[11px] font-semibold leading-6 text-neutral-400 uppercase tracking-widest">
														Your chats
													</div>
												) : null}

												<nav className="flex flex-1 flex-col">
													<ul
														role="list"
														className="flex flex-1 flex-col gap-y-7"
													>
														<li>
															<SidebarChatList
																friends={friends}
																sessionId={session.user.id}
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
																		<li key={option.name}>
																			<Link
																				href={option.href}
																				className="text-neutral-500 hover:text-neutral-900 hover:bg-neutral-100 group flex gap-x-3 rounded-xl p-2.5 text-sm leading-6 font-medium transition-all duration-200"
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

														<li className="-ml-6 mt-auto">
															<div className="h-px bg-neutral-100" />
															<div className="flex flex-1 items-center gap-x-4 px-6 py-4 text-sm font-semibold leading-6 text-neutral-900">
																<div className="relative h-9 w-9 rounded-full overflow-hidden ring-2 ring-neutral-100 flex-shrink-0">
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
															</div>

															<SignOutButton className="h-full aspect-square" />
														</li>
													</ul>
												</nav>

											</div>
										</div>
									</Dialog.Panel>
								</Transition.Child>
							</div>
						</div>
					</div>
				</Dialog>
			</Transition.Root>
		</div>
	);
};

export default MobileChatLayout;
