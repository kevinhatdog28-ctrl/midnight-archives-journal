import React from "react";
import { cn } from "@/lib/utils";

type BrandLogoProps = {
  size?: "sm" | "md" | "lg";
  showWordmark?: boolean;
  className?: string;
};

const sizeClasses = {
  sm: "h-8 w-8",
  md: "h-10 w-10",
  lg: "h-16 w-16",
} as const;

export function BrandLogo({
  size = "md",
  showWordmark = false,
  className,
}: BrandLogoProps) {
  return (
    <div className={cn("inline-flex items-center gap-3 text-primary", className)}>
      <svg
        viewBox="0 0 48 48"
        fill="none"
        aria-hidden={showWordmark}
        role={showWordmark ? undefined : "img"}
        aria-label={showWordmark ? undefined : "Midnight Archives logo"}
        className={cn(sizeClasses[size], "shrink-0")}
      >
        <rect x="2" y="2" width="44" height="44" rx="14" fill="currentColor" opacity="0.12" />
        <path
          d="M29.8 9.8a13.7 13.7 0 1 0 7.7 23.7A12 12 0 1 1 29.8 9.8Z"
          fill="currentColor"
          opacity="0.9"
        />
        <path
          d="M12 29.5h24v6.7a3 3 0 0 1-3 3H15a3 3 0 0 1-3-3v-6.7Z"
          fill="currentColor"
          opacity="0.3"
        />
        <path
          d="M10.5 27.7h27M14 24h20a2 2 0 0 1 2 2v1.7H12V26a2 2 0 0 1 2-2Z"
          stroke="currentColor"
          strokeWidth="1.8"
          strokeLinecap="round"
          strokeLinejoin="round"
        />
        <path
          d="M22 30.8h4"
          stroke="currentColor"
          strokeWidth="1.8"
          strokeLinecap="round"
        />
        <path
          d="m35.2 10.5.7 1.8 1.8.7-1.8.7-.7 1.8-.7-1.8-1.8-.7 1.8-.7.7-1.8Z"
          fill="hsl(var(--accent))"
        />
      </svg>
      {showWordmark && (
        <span className="font-serif text-xl leading-none tracking-wider text-foreground">
          Midnight Archives
        </span>
      )}
    </div>
  );
}