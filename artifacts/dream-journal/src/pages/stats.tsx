import React, { useEffect } from "react";
import { useGetDreamStats } from "@workspace/api-client-react";
import { EmotionColors, EmotionNames } from "@/components/emotion-display";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";
import { Flame, Star, BrainCircuit, Eye, Skull, ScrollText } from "lucide-react";
import { cn } from "@/lib/utils";
import { motion, useMotionValue, useTransform, animate } from "framer-motion";

function AnimatedNumber({ value, className }: { value: number, className?: string }) {
  const count = useMotionValue(0);
  const rounded = useTransform(count, (latest) => Math.round(latest));

  useEffect(() => {
    const controls = animate(count, value, { duration: 1.5, ease: "easeOut" });
    return controls.stop;
  }, [value, count]);

  return <motion.span className={className}>{rounded}</motion.span>;
}

export default function StatsPage() {
  const { data: stats, isLoading } = useGetDreamStats();

  if (isLoading) {
    return (
      <div className="space-y-8">
        <Skeleton className="h-10 w-48 bg-muted/50" />
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {[1, 2, 3, 4, 5, 6].map((i) => (
            <Skeleton key={i} className="h-32 w-full rounded-xl bg-card border-border/50" />
          ))}
        </div>
      </div>
    );
  }

  if (!stats) return null;

  return (
    <motion.div initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.35, ease: [0.22,1,0.36,1] }} className="space-y-10">
      <header>
        <h1 className="text-3xl md:text-4xl font-serif">Insights</h1>
        <p className="text-muted-foreground mt-2 font-light">Patterns emerging from the dark.</p>
      </header>

      {/* Streaks - The Achievements */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <div className="relative overflow-hidden rounded-2xl border border-orange-500/20 bg-gradient-to-br from-card to-orange-500/5 p-8 flex items-center gap-6">
          <div className="absolute top-0 right-0 w-32 h-32 bg-orange-500/10 rounded-full blur-[40px] -mr-10 -mt-10" />
          <div className="w-16 h-16 rounded-full bg-orange-500/20 flex items-center justify-center shadow-[0_0_20px_rgba(249,115,22,0.3)]">
            <Flame className="w-8 h-8 text-orange-400" />
          </div>
          <div>
            <p className="text-sm font-mono tracking-widest text-orange-700/80 dark:text-orange-400/80 uppercase mb-1">Current Streak</p>
            <div className="flex items-baseline gap-2">
              <AnimatedNumber value={stats.currentStreak} className="text-5xl font-serif text-orange-800 dark:text-orange-100" />
              <span className="text-orange-600/60 dark:text-orange-400/60 font-medium">days</span>
            </div>
          </div>
        </div>

        <div className="relative overflow-hidden rounded-2xl border border-yellow-500/20 bg-gradient-to-br from-card to-yellow-500/5 p-8 flex items-center gap-6">
          <div className="absolute bottom-0 right-0 w-32 h-32 bg-yellow-500/10 rounded-full blur-[40px] -mr-10 -mb-10" />
          <div className="w-16 h-16 rounded-full bg-yellow-500/20 flex items-center justify-center shadow-[0_0_20px_rgba(234,179,8,0.3)]">
            <Star className="w-8 h-8 text-yellow-400" />
          </div>
          <div>
            <p className="text-sm font-mono tracking-widest text-yellow-700/80 dark:text-yellow-400/80 uppercase mb-1">Longest Streak</p>
            <div className="flex items-baseline gap-2">
              <AnimatedNumber value={stats.longestStreak} className="text-5xl font-serif text-yellow-800 dark:text-yellow-100" />
              <span className="text-yellow-600/60 dark:text-yellow-400/60 font-medium">days</span>
            </div>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        {[
          { title: "Total Entries", value: stats.totalEntries.toString(), icon: <ScrollText className="w-5 h-5 text-emerald-400" />, desc: "Dreams recorded so far" },
          { title: "Avg. Entry Length", value: `${Math.round(stats.avgEntryLength)}`, suffix: " words", icon: <ScrollText className="w-5 h-5 text-cyan-400" />, desc: "" },
          { title: "Nightmare Freq.", value: `${Math.round(stats.nightmareFrequency * 100)}%`, icon: <Skull className="w-5 h-5 text-red-400" />, desc: "Of dreams are nightmares" }
        ].map((item, index) => (
          <motion.div key={item.title} initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.4, delay: index * 0.06 }}>
            <MetricCard title={item.title} value={item.value} suffix={item.suffix} description={item.desc} icon={item.icon} />
          </motion.div>
        ))}
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
        {/* Averages */}
        <Card className="bg-card/40 backdrop-blur-sm border-border/50 shadow-xl">
          <CardHeader>
            <CardTitle className="font-serif text-xl">Average Qualities</CardTitle>
          </CardHeader>
          <CardContent className="space-y-6">
            <AvgGauge label="Lucidity" value={stats.avgLucidity} color="bg-purple-500 shadow-[0_0_10px_rgba(168,85,247,0.5)]" icon={<BrainCircuit className="w-4 h-4 text-purple-400" />} />
            <AvgGauge label="Clarity" value={stats.avgClarity} color="bg-blue-400 shadow-[0_0_10px_rgba(96,165,250,0.5)]" icon={<Eye className="w-4 h-4 text-blue-400" />} />
            <AvgGauge label="Nightmare Factor" value={stats.avgNightmareFactor} color="bg-red-500 shadow-[0_0_10px_rgba(239,68,68,0.5)]" icon={<Skull className="w-4 h-4 text-red-400" />} />
          </CardContent>
        </Card>

        {/* Emotions Breakdown */}
        <Card className="bg-card/40 backdrop-blur-sm border-border/50 shadow-xl">
          <CardHeader>
            <CardTitle className="font-serif text-xl">Emotional Landscape</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-5">
              {Object.entries(stats.avgEmotions)
                .sort(([, a], [, b]) => b - a)
                .map(([key, value]) => {
                  if (value === 0 && stats.totalEntries > 0) return null;
                  const percentage = (value / 10) * 100;
                  
                  return (
                    <div key={key} className="space-y-2">
                      <div className="flex justify-between items-center text-sm">
                        <span className="font-medium">{EmotionNames[key as keyof typeof EmotionNames]}</span>
                        <span className="text-muted-foreground">{value.toFixed(1)}/10</span>
                      </div>
                      <div className="h-2 w-full bg-muted/50 rounded-full overflow-hidden">
                        <div 
                          className={cn("h-full rounded-full transition-all duration-1000", 
                            key === "angry" ? "bg-red-500" :
                            key === "sad" ? "bg-blue-500" :
                            key === "disgust" ? "bg-green-500" :
                            key === "happy" ? "bg-yellow-500" :
                            key === "peaceful" ? "bg-indigo-500" :
                            "bg-gray-400"
                          )}
                          style={{ width: `${Math.max(percentage, 2)}%` }}
                        />
                      </div>
                    </div>
                  );
                })}
            </div>
          </CardContent>
        </Card>
      </div>
    </motion.div>
  );
}

function MetricCard({ title, value, suffix = "", description = "", icon }: { title: string, value: string, suffix?: string, description?: string, icon: React.ReactNode }) {
  return (
    <Card className="bg-card/30 border-border/40 backdrop-blur-sm h-full">
      <CardContent className="p-6">
        <div className="flex items-center justify-between mb-4">
          <p className="text-sm font-mono tracking-widest text-muted-foreground uppercase">{title}</p>
          <div className="p-2 rounded-full bg-background/50 border border-border/50 shadow-inner">
            {icon}
          </div>
        </div>
        <div className="flex items-baseline gap-1">
          <h3 className="text-3xl font-serif">{value}</h3>
          {suffix && <span className="text-muted-foreground">{suffix}</span>}
        </div>
        {description && <p className="text-sm text-muted-foreground mt-2 font-light">{description}</p>}
      </CardContent>
    </Card>
  );
}

function AvgGauge({ label, value, color, icon }: { label: string, value: number, color: string, icon: React.ReactNode }) {
  const percentage = (value / 10) * 100;
  
  return (
    <div className="space-y-3">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2">
          {icon}
          <span className="text-sm font-medium tracking-wide">{label}</span>
        </div>
        <span className="font-mono text-sm text-muted-foreground">{value.toFixed(1)}/10</span>
      </div>
      <div className="h-3 w-full bg-background/50 rounded-full overflow-hidden border border-border/50 shadow-inner p-0.5">
        <motion.div 
          initial={{ width: '0%' }}
          animate={{ width: `${Math.max(percentage, 2)}%` }}
          transition={{ duration: 1, delay: 0.3, ease: 'easeOut' }}
          className={cn("h-full rounded-full transition-colors", color)}
        />
      </div>
    </div>
  );
}
