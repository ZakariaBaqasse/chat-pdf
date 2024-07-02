import { db } from "@/lib/db";
import { chats } from "@/lib/db/schema";
import { loadS3FileToPinecone } from "@/lib/pinecone";
import { getS3FileURL } from "@/lib/s3";
import { auth } from "@clerk/nextjs";

export async function POST(request: Request, response: Response) {
  const { userId } = auth();
  if (!userId) {
    return Response.json({ error: "unauthorized" }, { status: 401 });
  }
  try {
    const body = await request.json();
    const { fileName, fileKey } = body;
    await loadS3FileToPinecone(fileKey);
    const chatId = await db
      .insert(chats)
      .values({
        fileKey,
        pdfName: fileName,
        pdfUrl: getS3FileURL(fileKey),
        user_id: userId,
      })
      .returning({
        insertedId: chats.id,
      });
    return Response.json(
      {
        chatId: chatId[0].insertedId,
      },
      { status: 201 }
    );
  } catch (error) {
    console.error("error in /api/create-chat", error);
    return Response.json({ error: "Internal server error" }, { status: 500 });
  }
}
