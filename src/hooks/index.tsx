import { GetAllChatsResponse } from "@/app/api/chats/route";
import { GetAllMessagesResponse } from "@/app/api/messages/[chatId]/route";
import { chats, messages } from "@/lib/db/schema";
import { Chat, ChatMessage } from "@/utils/types";
import { useInfiniteQuery, useQuery } from "@tanstack/react-query";
import { Message } from "ai";
import axios from "axios";
import { InferSelectModel } from "drizzle-orm";

export function useChats(limit: number) {
  const fetchChats = async ({ pageParam = 1 }: { pageParam: number }) => {
    const response = await axios.get<GetAllChatsResponse>(
      `/api/chats?limit=${limit}&page=${pageParam}`
    );
    return response.data;
  };

  const {
    data,
    error,
    fetchNextPage,
    hasNextPage,
    isFetching,
    isFetchingNextPage,
    status,
  } = useInfiniteQuery<GetAllChatsResponse>({
    queryKey: ["chats"],
    queryFn: ({ pageParam = 1 }) =>
      fetchChats({ pageParam: pageParam as number }),
    initialPageParam: 1,
    getNextPageParam: (lastPage, pages) => {
      if (lastPage.hasNext) {
        return pages.length + 1;
      }
      return undefined;
    },
    refetchOnWindowFocus: false,
  });

  const chatsList: InferSelectModel<typeof chats>[] = data
    ? ([] as Chat[]).concat(
        data.pages.flatMap((item) => {
          return item.chats;
        })
      )
    : [];

  return {
    chatsList,
    fetchNextPage,
    hasNextPage,
    isFetching,
    isFetchingNextPage,
    status,
    error,
  };
}

export function useMessages(limit: number, chatId: number) {
  const fetchMessages = async ({ pageParam = 1 }: { pageParam: number }) => {
    const response = await axios.get<GetAllMessagesResponse>(
      `/api/messages/${chatId}`
    );
    return response.data;
  };

  const { data, error, status } = useQuery<GetAllMessagesResponse>({
    queryKey: ["messages"],
    queryFn: ({ pageParam = 1 }) =>
      fetchMessages({ pageParam: pageParam as number }),
    refetchOnWindowFocus: false,
  });

  const messagesList: Message[] = data
    ? ([] as Message[]).concat(data.messages)
    : [];

  return {
    messagesList,
    status,
    error,
  };
}
