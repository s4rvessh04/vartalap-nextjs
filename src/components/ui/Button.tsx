import React, { ButtonHTMLAttributes, FC } from "react";
import { VariantProps, cva } from "class-variance-authority";
import { Loader2 } from "lucide-react";
import { cn } from "@/lib/utils";

export const buttonVariants = cva(
	[
		"active:scale-95",
		"inline-flex",
		"items-center",
		"justify-center",
		"rounded-md",
		"text-sm",
		"font-medium",
		"transition-colors",
		"focus:outline-none",
		"focus:ring-2",
		"focus:ring-offset-2",
		"focus:ring-neutral-400",
		"disabled:opacity-50",
		"disables:pointer-events-none",
	],
	{
		variants: {
			intent: {
				default: [
					"bg-neutral-900",
					"text-white",
					"hover:bg-neutral-800",
				],
				ghost: [
					"bg-transparent",
					"text-neutral-600",
					"hover:bg-neutral-50",
				],
			},
			size: {
				default: ["h-10", "px-4", "py-2"],
				sm: ["h-8", "px-3", "py-1"],
				lg: ["h-12", "px-5", "py-3"],
			},
		},
		defaultVariants: {
			intent: "default",
			size: "default",
		},
	}
);

export interface ButtonProps
	extends ButtonHTMLAttributes<HTMLButtonElement>,
		VariantProps<typeof buttonVariants> {
	isLoading?: boolean;
}

export const Button: FC<ButtonProps> = ({
	className,
	children,
	intent,
	isLoading,
	size,
	...props
}) => {
	return (
		<button
			className={cn(buttonVariants({ intent, size, className }))}
			disabled={isLoading}
			{...props}
		>
			{isLoading ? (
				<Loader2 className="w-5 h-5 mr-2 animate-spin" />
			) : null}
			{children}
		</button>
	);
};
