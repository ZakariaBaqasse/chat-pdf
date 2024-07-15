"use client";
import React from "react";
import { useChat } from "ai/react";
import { Input } from "../ui/input";
import { Button } from "../ui/button";
import { Send } from "lucide-react";
import MessageList from "../MessageList";
import { useMessages } from "@/hooks";

type Props = {
  chatId: number;
};

const PAGE_SIZE = 25;

const ChatComponent = ({ chatId }: Props) => {
  const { messagesList, status } = useMessages(PAGE_SIZE, chatId);
  const { input, handleInputChange, handleSubmit, messages } = useChat({
    api: "/api/chat",
    body: {
      chatId,
    },
    initialMessages: messagesList,
  });
  return (
    <div className="relative max-h-screen overflow-y-auto">
      <div className="sticky top-0 inset-x-0 p-2 bg-white h-fit">
        <h3 className="text-xl font-bold text-center">Chat</h3>
      </div>
      <MessageList messages={messages} />
      <form
        onSubmit={handleSubmit}
        className="sticky bottom-0 inset-x-0 px-2 py-4 bg-white w-full flex justify-between items-center gap-2"
      >
        <Input
          value={input}
          onChange={handleInputChange}
          placeholder="Ask your pdf a question..."
        />
        <Button className="bg-gray-800 text-gray-200 hover:bg-gray-200 hover:text-gray-800 transition-all duration-100">
          <Send className="h-4 w-4" />
          Send
        </Button>
      </form>
    </div>
  );
};

export default ChatComponent;
