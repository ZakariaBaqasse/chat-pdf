import PDFViewer from "@/components/PDFViewer";
import Sidebar from "@/components/Sidebar";

import { auth } from "@clerk/nextjs";
import { FileText } from "lucide-react";
import { redirect } from "next/navigation";
import React from "react";

type Props = {
  params: {
    chatId?: string[];
  };
};

const ChatPage = async ({ params: { chatId } }: Props) => {
  const { userId } = await auth();
  if (!userId) {
    return redirect("/sign-in");
  }

  if (chatId?.length! > 1) {
    return redirect("/chat");
  }

  return (
    <div className="grid grid-cols-6 max-h-screen overflow-y-scroll">
      <div className=" col-span-1 max-h-screen">
        <Sidebar currentChatId={Number(chatId?.[0])} />
      </div>
      {chatId && chatId.length === 1 && !isNaN(Number(chatId[0])) ? (
        <div className="col-span-3">
          <PDFViewer chatId={chatId[0]} />
        </div>
      ) : (
        <div className="col-span-5 h-screen flex flex-col justify-center items-center">
          <FileText className="h-8 w-8" />
          <h3>Please select a document to get started</h3>
        </div>
      )}
    </div>
  );
};

export default ChatPage;
