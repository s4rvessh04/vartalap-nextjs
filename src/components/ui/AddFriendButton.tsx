"use client";

import React from "react";
import axios, { AxiosError } from "axios";
import { useForm } from "react-hook-form";
import { z } from "zod";
import { zodResolver } from "@hookform/resolvers/zod";

import { Button } from "@/components/ui/Button";
import { addFriendValidator } from "@/lib/validations/add-friend";

type FormData = z.infer<typeof addFriendValidator>;

const AddFriendButton = () => {
	const [showSuccessState, setShowSuccessState] =
		React.useState<boolean>(false);
	const {
		register,
		handleSubmit,
		setError,
		formState: { errors },
	} = useForm<FormData>({
		resolver: zodResolver(addFriendValidator),
	});
	const addFriend = async (email: string) => {
		try {
			const validatedEmail = addFriendValidator.parse({ email });
			await axios.post("/api/friends/add", { email: validatedEmail });
			setShowSuccessState(true);
		} catch (err) {
			if (err instanceof z.ZodError) {
				console.log(err);
				setError("email", { message: err.message });
				return;
			}
			if (err instanceof AxiosError) {
				setError("email", { message: err.response?.data });
				return;
			}
			setError("email", { message: "Something went wrong" });
		}
	};

	const onSubmit = (data: FormData) => {
		addFriend(data.email);
	};

	return (
		<form onSubmit={handleSubmit(onSubmit)} className="max-w-md">
			<label
				htmlFor="email"
				className="block text-sm font-medium leading-6 text-neutral-900"
			>
				Add friend by email
			</label>
			<div className="mt-3 flex gap-3">
				<input
					{...register("email")}
					type="text"
					className="block w-full rounded-xl border-0 py-2.5 px-4 text-neutral-900 bg-neutral-50 shadow-sm ring-1 ring-inset ring-neutral-200 placeholder:text-neutral-400 focus:ring-2 focus:ring-inset focus:ring-neutral-900 focus:bg-white sm:text-sm leading-6 transition-all duration-200"
					placeholder="you@example.com"
				/>
				<Button className="rounded-xl px-6">Add</Button>
			</div>
			{errors.email?.message && (
				<p className="mt-2 text-sm text-red-500 font-medium">{errors.email.message}</p>
			)}
			{showSuccessState && (
				<p className="mt-2 text-sm text-neutral-600 font-medium">
					✓ Friend request sent!
				</p>
			)}
		</form>
	);
};

export default AddFriendButton;
