import { GetAllChatsResponse } from "@/app/api/chats/route";
import { chats } from "@/lib/db/schema";
import { Chat } from "@/utils/types";
import { useInfiniteQuery } from "@tanstack/react-query";
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
