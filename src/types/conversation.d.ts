import { User } from "./user";
import { Message } from "./message";

export interface Conversation {
    id: number;
    participants: User[];
    messages: Message[];
    createdAt: Date;
}