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
		<form onSubmit={handleSubmit(onSubmit)} className="max-w-sm">
			<label
				htmlFor="email"
				className="block text-sm font-medium leading-6 text-gray-950"
			>
				Add friend by email
			</label>
			<div className="mt-2 flex gap-4">
				<input
					{...register("email")}
					type="text"
					className="block w-full rounded-md border-0 py-1.5 text-gray-950 shadow-sm ring-1 ring-inset ring-gray-300 placeholder:text-gray-400 focus:ring-inset focus:ring-indigo-600s sm:text-sm leading-6"
					placeholder="you@example.com"
				/>
				<Button>Add</Button>
			</div>
			<p className="mt-1 text-sm text-red-600">{errors.email?.message}</p>
			{showSuccessState && (
				<p className="mt-1 text-sm text-green-600">
					Friend added successfully!
				</p>
			)}
		</form>
	);
};

export default AddFriendButton;
