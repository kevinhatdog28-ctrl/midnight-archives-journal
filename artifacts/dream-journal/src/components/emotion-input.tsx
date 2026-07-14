import React from "react";
import { cn } from "@/lib/utils";
import { EmotionColors, EmotionNames } from "./emotion-display";

interface EmotionInputProps {
  emotions: Record<string, number>;
  onChange: (emotions: Record<string, number>) => void;
}

export function EmotionInput({ emotions, onChange }: EmotionInputProps) {
  const updateEmotion = (key: string, value: number) => {
    onChange({ ...emotions, [key]: value });
  };

  return (
    <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
      {Object.keys(EmotionNames).map((key) => {
        const value = emotions[key as keyof typeof emotions] || 0;
        const isActive = value > 0;

        return (
          <div
            key={key}
            className={cn(
              "flex flex-col gap-3 p-3 rounded-xl border transition-all duration-200",
              isActive
                ? EmotionColors[key as keyof typeof EmotionColors]
                : "border-border/60 bg-muted/20 dark:border-border/50",
            )}
          >
            <div className="flex justify-between items-center">
              <span
                className={cn(
                  "text-sm font-medium",
                  !isActive && "text-muted-foreground",
                )}
              >
                {EmotionNames[key as keyof typeof EmotionNames]}
              </span>
              <span
                className={cn(
                  "text-xs tabular-nums",
                  isActive ? "opacity-70" : "text-muted-foreground",
                )}
              >
                {value}
              </span>
            </div>

            <input
              type="range"
              min="0"
              max="10"
              step="1"
              value={value}
              onChange={(e) => updateEmotion(key, parseInt(e.target.value))}
              className={cn(
                "w-full h-1.5 appearance-none rounded-full outline-none cursor-pointer",
                isActive ? "bg-black/15 dark:bg-white/20" : "bg-border",
              )}
              style={{ accentColor: "currentColor" }}
            />
          </div>
        );
      })}
    </div>
  );
}
