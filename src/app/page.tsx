import { db } from "@/lib/db";
import Image from "next/image";

export default async function Home() {
	await db.set("message", "Hello World");

	return <div>This is a messaging app.</div>;
}
