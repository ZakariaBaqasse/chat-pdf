"use client";

import { useChats } from "@/hooks";
import { groupChats } from "@/utils/dateFilters";
import { Chat } from "@/utils/types";
import clsx from "clsx";
import Link from "next/link";
import { ReactNode, useMemo } from "react";
import { Button } from "../ui/button";
import { MessageCircle, PlusCircle } from "lucide-react";

type Props = {};

const PAGE_SIZE = 25;

export function LoadingDots({ size }: { size: string }) {
  return (
    <div className="flex space-x-2 justify-center items-center h-full dark:invert">
      <span className="sr-only">Loading...</span>
      <div className="h-2 w-2 bg-gray-200 rounded-full animate-bounce [animation-delay:-0.3s]"></div>
      <div className="h-2 w-2 bg-gray-200 rounded-full animate-bounce [animation-delay:-0.15s]"></div>
      <div className="h-2 w-2 bg-gray-200 rounded-full animate-bounce"></div>
    </div>
  );
}

const getPeriodLabel = (periodKey: string) => {
  if (periodKey === "today") {
    return "Today";
  } else if (periodKey === "yesterday") {
    return "Yesterday";
  } else if (periodKey === "lastWeek") {
    return "Last 7 Days";
  } else if (periodKey === "lastMonth") {
    return "Last 30 Days";
  } else {
    return periodKey;
  }
};

const Sidebar = ({ currentChatId }: { currentChatId: number }) => {
  let content: ReactNode;
  const {
    chatsList,
    error,
    fetchNextPage,
    hasNextPage,
    isFetching,
    isFetchingNextPage,
    status,
  } = useChats(PAGE_SIZE);

  const groupedChats = useMemo(() => groupChats(chatsList), [chatsList]);

  if (isFetching) {
    content = (
      <div className="h-full px-1 gap-1 flex justify-center items-center">
        <LoadingDots size="h-full w-full" />
      </div>
    );
  }

  if (!isFetching && !isFetchingNextPage && chatsList.length === 0) {
    content = (
      <div className="h-full px-1 gap-1 flex justify-center items-center">
        <span className="line-clamp-1 overflow-ellipsis w-full text-center text-base-content text-opacity-30 font-mono text-xs">
          No chats yet.
        </span>
      </div>
    );
  }
  if (chatsList.length > 0 && !isFetching) {
    content = (
      <>
        {Object.entries(groupedChats).map(([key, chats], index: number) => {
          return (
            <div key={`${key}-${chats.length}`}>
              {chats && chats.length > 0 && (
                <p key={key} className="mb-1 font-medium opacity-80">
                  {getPeriodLabel(key)}
                </p>
              )}
              <div key={index} className=" mb-4">
                {(chats as Chat[]).map((chat: Chat, i) => {
                  return (
                    <Link
                      className={clsx(
                        "p-4 hover:bg-gray-200 hover:text-gray-800 transition-all rounded-md cursor-pointer h-14 lg:h-8 flex justify-start items-center text-sm",
                        {
                          "bg-gray-200 text-gray-800":
                            chat.id === currentChatId,
                        }
                      )}
                      key={chat.id}
                      href={`/chat/${chat.id}`}
                    >
                      <MessageCircle className="mr-2" />
                      <span
                        className={clsx(
                          "line-clamp-1 overflow-ellipsis w-full"
                        )}
                      >
                        {chat.pdfName}
                      </span>
                    </Link>
                  );
                })}
              </div>
            </div>
          );
        })}
      </>
    );
  }
  return (
    <div className=" overflow-y-auto h-screen p-2 text-gray-200 bg-gray-800 gap-1">
      <Button className=" border-dashed border-2 border-gray-200 w-full">
        <PlusCircle className="mr-2 h-4 w-4" />
        <Link href="/">New Chat</Link>
      </Button>
      {content}
      {isFetchingNextPage && !isFetching && <LoadingDots size="w-full" />}
    </div>
  );
};

export default Sidebar;
