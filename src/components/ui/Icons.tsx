import { LucideProps, UserPlus, MessagesSquare } from "lucide-react";

export const Icons = {
	Logo: (props: LucideProps) => <MessagesSquare {...props} />,
	UserPlus,
};

export type Icon = keyof typeof Icons;
