import { Chat, GroupedChats } from "./types";

// Function to check if a date is today
const isToday = (date: Date) => {
  const today = new Date();
  return (
    date.getDate() === today.getDate() &&
    date.getMonth() === today.getMonth() &&
    date.getFullYear() === today.getFullYear()
  );
};

// Function to check if a date is yesterday
const isYesterday = (date: Date) => {
  const yesterday = new Date(Date.now() - 86400000); // 86400000 is the number of milliseconds in a day
  return (
    date.getDate() === yesterday.getDate() &&
    date.getMonth() === yesterday.getMonth() &&
    date.getFullYear() === yesterday.getFullYear()
  );
};

// Function to check if a date is within the last 7 days
const isLastWeek = (date: Date) => {
  const lastWeek = new Date(Date.now() - 604800000); // 604800000 is the number of milliseconds in a week
  return date >= lastWeek;
};

// Function to check if a date is within the last 30 days
const isLastMonth = (date: Date) => {
  const lastMonth = new Date(Date.now() - 2592000000); // 2592000000 is the number of milliseconds in a month
  return date >= lastMonth;
};

const MONTHS: string[] = [
  "January",
  "February",
  "March",
  "April",
  "May",
  "June",
  "July",
  "August",
  "September",
  "October",
  "November",
  "December",
];

export const groupChats = (chats: Chat[]) => {
  const groupedChats: GroupedChats = {
    today: [] as Chat[],
    yesterday: [] as Chat[],
    lastWeek: [] as Chat[],
    lastMonth: [] as Chat[],
  };

  chats.forEach((chat) => {
    const chatDate = new Date(chat.createdAt);

    if (isToday(chatDate)) {
      groupedChats.today.push(chat);
    } else if (isYesterday(chatDate)) {
      groupedChats.yesterday.push(chat);
    } else if (isLastWeek(chatDate)) {
      groupedChats.lastWeek.push(chat);
    } else if (isLastMonth(chatDate)) {
      groupedChats.lastMonth.push(chat);
    } else {
      const monthYear = `${
        MONTHS[chatDate.getMonth()]
      }-${chatDate.getFullYear()}`;
      if (!groupedChats[monthYear]) {
        groupedChats[monthYear] = [];
      }
      groupedChats[monthYear].push(chat);
    }
  });

  return groupedChats;
};
