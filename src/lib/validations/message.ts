import { z } from "zod";

export const messageSchema = z.object({
	id: z.string(),
	senderId: z.string(),
	text: z.string().min(1).max(255),
	timestamp: z.number(),
});

export const messageArraySchema = z.array(messageSchema);

export type Message = z.infer<typeof messageSchema>;
