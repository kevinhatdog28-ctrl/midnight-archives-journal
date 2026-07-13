import React from "react";
import { cn } from "@/lib/utils";
import { Slider } from "@/components/ui/slider";
import { Label } from "@/components/ui/label";
import { EmotionColors, EmotionNames } from "./emotion-display";

export function QualityGauge({ label, value, colorClass }: { label: string, value: number, colorClass: string }) {
  const percentage = (value / 10) * 100;
  
  return (
    <div className="flex flex-col gap-1.5 w-full">
      <div className="flex justify-between text-xs text-muted-foreground">
        <span>{label}</span>
        <span>{value}/10</span>
      </div>
      <div className="h-1.5 w-full bg-muted rounded-full overflow-hidden">
        <div 
          className={cn("h-full rounded-full transition-all duration-500", colorClass)}
          style={{ width: `${percentage}%` }}
        />
      </div>
    </div>
  );
}

export function QualitiesDisplay({ lucidity, clarity, nightmareFactor, className }: { lucidity: number, clarity: number, nightmareFactor: number, className?: string }) {
  return (
    <div className={cn("grid grid-cols-3 gap-4", className)}>
      <QualityGauge label="Lucidity" value={lucidity} colorClass="bg-purple-500 shadow-[0_0_8px_rgba(168,85,247,0.6)]" />
      <QualityGauge label="Clarity" value={clarity} colorClass="bg-blue-400 shadow-[0_0_8px_rgba(96,165,250,0.6)]" />
      <QualityGauge label="Nightmare" value={nightmareFactor} colorClass="bg-red-500 shadow-[0_0_8px_rgba(239,68,68,0.6)]" />
    </div>
  );
}
