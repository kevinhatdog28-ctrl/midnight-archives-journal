import React from "react";
import { cn } from "@/lib/utils";

export const EmotionColors = {
  angry:   "bg-red-500/10    dark:bg-red-500/20    text-red-700    dark:text-red-400    border-red-500/40    dark:border-red-500/30",
  sad:     "bg-blue-500/10   dark:bg-blue-500/20   text-blue-700   dark:text-blue-400   border-blue-500/40   dark:border-blue-500/30",
  disgust: "bg-green-500/10  dark:bg-green-500/20  text-green-700  dark:text-green-400  border-green-500/40  dark:border-green-500/30",
  happy:   "bg-yellow-500/10 dark:bg-yellow-500/20 text-yellow-800 dark:text-yellow-400 border-yellow-500/40 dark:border-yellow-500/30",
  peaceful:"bg-indigo-500/10 dark:bg-indigo-500/20 text-indigo-700 dark:text-indigo-400 border-indigo-500/40 dark:border-indigo-500/30",
  neutral: "bg-gray-500/10   dark:bg-gray-500/20   text-gray-700   dark:text-gray-400   border-gray-500/40   dark:border-gray-500/30",
};

export const EmotionNames = {
  angry:   "Angry",
  sad:     "Sad",
  disgust: "Disgust",
  happy:   "Happy",
  peaceful:"Peaceful",
  neutral: "Neutral",
};

interface EmotionBadgeProps {
  emotion: keyof typeof EmotionColors;
  value: number; // 0–10
}

export function EmotionBadge({ emotion, value }: EmotionBadgeProps) {
  if (value === 0) return null;
  const intensity = value / 10;
  return (
    <div
      className={cn(
        "px-2.5 py-1 rounded-full text-xs font-medium border flex items-center gap-1.5",
        EmotionColors[emotion],
      )}
      style={{ opacity: 0.5 + intensity * 0.5 }}
    >
      <span>{EmotionNames[emotion]}</span>
      <span className="opacity-60 text-[10px]">{value}</span>
    </div>
  );
}

export function EmotionDisplay({
  emotions,
  className,
}: {
  emotions: {
    angry: number;
    sad: number;
    disgust: number;
    happy: number;
    peaceful: number;
    neutral: number;
  };
  className?: string;
}) {
  const activeEmotions = Object.entries(emotions)
    .filter(([, value]) => value > 0)
    .sort(([, a], [, b]) => b - a);

  if (activeEmotions.length === 0) return null;

  return (
    <div className={cn("flex flex-wrap gap-2", className)}>
      {activeEmotions.map(([key, value]) => (
        <EmotionBadge key={key} emotion={key as keyof typeof EmotionColors} value={value} />
      ))}
    </div>
  );
}
