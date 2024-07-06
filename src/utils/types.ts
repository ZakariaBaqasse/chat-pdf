import { chats } from "@/lib/db/schema";
import { InferSelectModel } from "drizzle-orm";

export type Chat = InferSelectModel<typeof chats>;

export type GroupedChats = {
  today: Chat[];
  yesterday: Chat[];
  lastWeek: Chat[];
  lastMonth: Chat[];
  [key: string]: Chat[];
};
