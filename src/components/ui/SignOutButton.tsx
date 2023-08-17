"use client";

import { ButtonHTMLAttributes, useState } from "react";
import { FC } from "react";
import { Button } from "./Button";
import { signOut } from "next-auth/react";
import { toast } from "react-hot-toast";
import { Loader2, LogOut } from "lucide-react";

interface SignOutButtonProps extends ButtonHTMLAttributes<HTMLButtonElement> {}

const SignOutButton: FC<SignOutButtonProps> = ({ ...props }) => {
	const [isSigningOut, setIsSigningOut] = useState<boolean>(false);

	return (
		<Button
			{...props}
			intent="ghost"
			onClick={async () => {
				setIsSigningOut(true);

				try {
					await signOut();
				} catch (error) {
					toast.error("Error: There was a problem signing you out.");
				} finally {
					setIsSigningOut(false);
				}
			}}
		>
			{isSigningOut ? (
				<Loader2 className="aniamte-spin h-4 w-4" />
			) : (
				<LogOut className="h-4 w-4" />
			)}
		</Button>
	);
};

export default SignOutButton;
