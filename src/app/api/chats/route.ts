import { db } from "@/lib/db";
import { chats } from "@/lib/db/schema";
import { auth } from "@clerk/nextjs";
import { InferSelectModel, count, desc, eq } from "drizzle-orm";
import { NextRequest, NextResponse } from "next/server";

export interface GetAllChatsResponse {
  success: boolean;
  message: string;
  chats: InferSelectModel<typeof chats>[];
  hasNext: boolean;
}

export async function GET(request: NextRequest, response: NextResponse) {
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

    const page = Number(request.nextUrl.searchParams.get("page") || 1);
    const limit = Number(request.nextUrl.searchParams.get("limit") || 25);
    if (isNaN(page) || isNaN(limit)) {
      return Response.json(
        { success: false, message: "Please provide a valid page and limit" },
        { status: 402 }
      );
    }
    const offset = (page - 1) * limit;
    const totalChats = await db.select({ count: count() }).from(chats);
    const chatsList = await db
      .select()
      .from(chats)
      .where(eq(chats.user_id, userId))
      .orderBy(desc(chats.createdAt))
      .offset(offset)
      .limit(limit);

    return Response.json(
      {
        success: true,
        message: `Found ${chatsList.length} chats`,
        chats: chatsList,
        hasNext: chatsList.length < totalChats[0].count,
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
