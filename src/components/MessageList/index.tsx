import { cn } from "@/lib/utils";
import { Message } from "ai/react";
import clsx from "clsx";
import React from "react";

type Props = {
  messages: Message[];
};

const MessageList = ({ messages }: Props) => {
  if (!messages || messages.length === 0) {
    return <></>;
  }
  return (
    <div className="flex flex-col gap-2 px-4">
      {messages.map((message) => {
        return (
          <div
            key={message.id}
            className={clsx("flex", {
              "justify-end pl-10": message.role === "user",
              "justify-start pr-10": message.role === "assistant",
            })}
          >
            <div
              className={cn(
                "rounded-lg px-3 text-sm py-1 shadow-md ring-1 ring-gray-900/10",
                {
                  "bg-gray-800 text-gray-200": message.role === "user",
                  "bg-gray-200 text-gray-800": message.role === "assistant",
                }
              )}
            >
              <p>{message.content}</p>
            </div>
          </div>
        );
      })}
    </div>
  );
};

export default MessageList;
