import { clsx, type ClassValue } from "clsx";
import { twMerge } from "tailwind-merge";

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

export function timeAgo(date: Date | string): string {
  const now = new Date();
  const d = new Date(date);
  const seconds = Math.floor((now.getTime() - d.getTime()) / 1000);

  if (seconds < 60) return "just now";
  const minutes = Math.floor(seconds / 60);
  if (minutes < 60) return `${minutes}m ago`;
  const hours = Math.floor(minutes / 60);
  if (hours < 24) return `${hours}h ago`;
  const days = Math.floor(hours / 24);
  return `${days}d ago`;
}

export function hoursUntil(date: Date | string): number {
  const now = new Date();
  const d = new Date(date);
  return Math.max(0, Math.round((d.getTime() - now.getTime()) / (1000 * 60 * 60)));
}

export function expiryLabel(date: Date | string): string {
  const hours = hoursUntil(date);
  if (hours <= 0) return "Expired";
  if (hours < 24) return `${hours}h left`;
  const days = Math.floor(hours / 24);
  return `${days}d left`;
}

export function expiryColor(date: Date | string): string {
  const hours = hoursUntil(date);
  if (hours <= 24) return "text-red-600 bg-red-50";
  if (hours <= 48) return "text-orange-600 bg-orange-50";
  if (hours <= 72) return "text-yellow-600 bg-yellow-50";
  return "text-gray-500 bg-gray-50";
}
