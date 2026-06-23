import { clsx, type ClassValue } from "clsx";
import { twMerge } from "tailwind-merge";

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

export function scoreTone(score?: number | null) {
  if (score == null) return "muted";
  if (score >= 90) return "good";
  if (score >= 70) return "warn";
  return "bad";
}

export function formatStatus(status: string) {
  return status
    .toLowerCase()
    .split("_")
    .map((part) => part[0].toUpperCase() + part.slice(1))
    .join(" ");
}
