import { clsx, type ClassValue } from "clsx"
import { twMerge } from "tailwind-merge"

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs))
}

export function formatDateString(dateString: string): string {
  const options: Intl.DateTimeFormatOptions = {
    year: "numeric",
    month: "short",  // e.g., Jan, Feb, Mar
    day: "numeric",
  };

  const date = new Date(dateString);
  const formattedDate = date.toLocaleDateString("en-US", options);

  const time = date.toLocaleTimeString("en-US", {
    hour: "numeric",
    minute: "2-digit",
  });

  return `${formattedDate} at ${time}`; // Example: Apr 19, 2025 at 9:30 PM
}

export const multiFormatDateString = (timestamp: string = ""): string => {
  const date = new Date(timestamp);
  const now = new Date();

  const diffMs = now.getTime() - date.getTime();
  const diffSec = diffMs / 1000;
  const diffMin = diffSec / 60;
  const diffHr = diffMin / 60;
  const diffDay = diffHr / 24;

  const dayCount = Math.floor(diffDay);
  const hrCount = Math.floor(diffHr);
  const minCount = Math.floor(diffMin);

  if (dayCount >= 30) return formatDateString(timestamp);     // → "Apr 19, 2025 at 9:30 PM"
  if (dayCount === 1) return "1 day ago";
  if (dayCount > 1) return `${dayCount} days ago`;
  if (hrCount >= 1) return `${hrCount} hours ago`;
  if (minCount >= 1) return `${minCount} minutes ago`;

  return "Just now";
};

export const checkIsLiked = (likeList: string[], userId: string) => {
  return likeList.includes(userId);
};