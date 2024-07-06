import { db } from "@/lib/db";
import { chats } from "@/lib/db/schema";
import { eq } from "drizzle-orm";
import React from "react";

type Props = {
  chatId: string;
};

const PDFViewer = async ({ chatId }: Props) => {
  const currentChat = await db
    .select()
    .from(chats)
    .where(eq(chats.id, Number(chatId)));
  return (
    <iframe
      src={`https://docs.google.com/gview?url=${currentChat[0].pdfUrl}&embedded=true`}
      className="w-full h-full"
    ></iframe>
  );
};

export default PDFViewer;
