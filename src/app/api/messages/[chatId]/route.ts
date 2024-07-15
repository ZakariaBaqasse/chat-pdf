import { db } from "@/lib/db";
import { chats, messages } from "@/lib/db/schema";
import { auth } from "@clerk/nextjs";
import { Message } from "ai";
import { count, desc, eq } from "drizzle-orm";
import { NextRequest } from "next/server";

export interface GetAllMessagesResponse {
  success: boolean;
  message: string;
  messages: Message[];
}

export async function GET(
  request: NextRequest,
  { params }: { params: { chatId: string } }
) {
  try {
    const { userId } = await auth();
    if (!userId) {
      return Response.json(
        {
          success: false,
          message: "Unauthorized",
        },
        {
          status: 401,
        }
      );
    }

    if (isNaN(Number(params.chatId))) {
      return Response.json(
        {
          success: false,
          message: "Please provide a valid chat ID",
        },
        {
          status: 400,
        }
      );
    }

    const chat = await db
      .select()
      .from(chats)
      .where(eq(chats.id, Number(params.chatId)));
    if (chat.length !== 1) {
      return Response.json(
        {
          message: "Chat not found",
          success: false,
        },
        {
          status: 404,
        }
      );
    }

    const messagesList = await db
      .select()
      .from(messages)
      .where(eq(messages.chatId, Number(params.chatId)));

    return Response.json(
      {
        success: true,
        message: `Found ${messagesList.length} chats`,
        messages: messagesList,
      },
      { status: 200 }
    );
  } catch (error) {
    console.error("error in get chats: ", error);
    return Response.json(
      {
        success: false,
        message: "Internal server error",
      },
      { status: 500 }
    );
  }
}
