import React, { useState, useMemo } from "react";
import { useLocation } from "wouter";
import { 
  format, 
  startOfMonth, 
  endOfMonth, 
  eachDayOfInterval, 
  startOfWeek, 
  endOfWeek, 
  isSameMonth, 
  isSameDay, 
  addMonths, 
  subMonths
} from "date-fns";
import { ChevronLeft, ChevronRight, Sparkles, Moon } from "lucide-react";
import { useListDreams } from "@workspace/api-client-react";
import { Button } from "@/components/ui/button";
import { motion } from "framer-motion";
import { haptic } from "@/lib/haptics";

export default function CalendarPage() {
  const [, setLocation] = useLocation();
  const [currentDate, setCurrentDate] = useState(new Date());
  
  const { data: dreams } = useListDreams();

  const handlePreviousMonth = () => setCurrentDate(subMonths(currentDate, 1));
  const handleNextMonth = () => setCurrentDate(addMonths(currentDate, 1));

  // Build calendar days
  const days = useMemo(() => {
    const start = startOfWeek(startOfMonth(currentDate));
    const end = endOfWeek(endOfMonth(currentDate));
    return eachDayOfInterval({ start, end });
  }, [currentDate]);

  // Group dreams by date string (YYYY-MM-DD)
  const dreamsByDate = useMemo(() => {
    if (!dreams) return {};
    return dreams.reduce((acc, dream) => {
      const dateStr = dream.date; // assuming "YYYY-MM-DD"
      if (!acc[dateStr]) {
        acc[dateStr] = [];
      }
      acc[dateStr].push(dream);
      return acc;
    }, {} as Record<string, typeof dreams>);
  }, [dreams]);

  return (
    <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ duration: 0.5 }} className="max-w-5xl mx-auto space-y-8">
      <header className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h1 className="text-3xl font-serif text-primary-foreground">Lunar Calendar</h1>
          <p className="text-muted-foreground mt-2 font-light">Trace the patterns of your nocturnal wanderings.</p>
        </div>
        <div className="flex items-center gap-4 bg-card/40 p-2 rounded-2xl border border-border/50 backdrop-blur-sm">
          <Button variant="ghost" size="icon" onClick={() => { handlePreviousMonth(); haptic('tap'); }} className="rounded-xl hover:bg-primary/20 hover:text-primary transition-colors">
            <ChevronLeft className="w-5 h-5" />
          </Button>
          <span className="w-32 text-center font-serif text-lg tracking-wide">
            {format(currentDate, "MMMM yyyy")}
          </span>
          <Button variant="ghost" size="icon" onClick={() => { handleNextMonth(); haptic('tap'); }} className="rounded-xl hover:bg-primary/20 hover:text-primary transition-colors">
            <ChevronRight className="w-5 h-5" />
          </Button>
        </div>
      </header>

      <div className="bg-card/40 border border-border/50 rounded-2xl p-4 md:p-6 backdrop-blur-sm shadow-xl">
        <div className="grid grid-cols-7 mb-4">
          {['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'].map((day) => (
            <div key={day} className="text-center text-xs md:text-sm font-mono tracking-widest text-primary uppercase py-2">
              {day}
            </div>
          ))}
        </div>
        
        <div className="grid grid-cols-7 gap-2 md:gap-3">
          {days.map((day, index) => {
            const dateStr = format(day, "yyyy-MM-dd");
            const dayDreams = dreamsByDate[dateStr] || [];
            // Sort by id descending so most recent is first
            const sortedDreams = [...dayDreams].sort((a, b) => b.id - a.id);
            const mainDream = sortedDreams[0];
            const hasMultiple = sortedDreams.length > 1;
            
            const isCurrentMonth = isSameMonth(day, currentDate);
            const isToday = isSameDay(day, new Date());
            
            return (
              <motion.div
                initial={{ opacity: 0, scale: 0.92 }}
                animate={{ opacity: 1, scale: 1 }}
                transition={{ delay: index * 0.008, duration: 0.3 }}
                key={dateStr}
                onClick={() => {
                  haptic('tap');
                  if (mainDream) {
                    setLocation(`/dreams/${mainDream.id}`);
                  } else {
                    setLocation(`/new?date=${dateStr}`);
                  }
                }}
                className={`
                  relative group min-h-[90px] md:min-h-[120px] rounded-xl p-2 md:p-3 transition-all duration-300 cursor-pointer overflow-hidden flex flex-col
                  ${!isCurrentMonth ? 'opacity-30 hover:opacity-50' : 'opacity-100'}
                  ${isToday ? 'bg-primary/10 border border-primary/50 dream-glow' : 'bg-background/30 border border-border/30 hover:border-primary/40 hover:bg-background/50'}
                  ${mainDream ? 'hover:dream-glow' : ''}
                `}
              >
                <div className="flex justify-between items-start mb-1">
                  <span className={`font-mono text-sm md:text-base ${isToday ? 'text-primary font-bold' : 'text-muted-foreground group-hover:text-foreground transition-colors'}`}>
                    {format(day, "d")}
                  </span>
                  {hasMultiple && (
                    <span className="flex items-center justify-center w-4 h-4 md:w-5 md:h-5 bg-accent/20 text-accent text-[9px] md:text-[10px] rounded-full font-bold">
                      {sortedDreams.length}
                    </span>
                  )}
                </div>
                
                {mainDream && (
                  <div className="flex-1 flex flex-col justify-end mt-1">
                    <p className="text-[10px] md:text-xs font-medium text-foreground line-clamp-2 leading-tight mb-1.5 md:mb-2">
                      {mainDream.title}
                    </p>
                    <div className="flex gap-1.5 mt-auto">
                      {mainDream.lucidity > 5 && (
                        <div className="w-3.5 h-3.5 md:w-4 md:h-4 rounded-full bg-purple-500/20 flex items-center justify-center" title="Lucid">
                          <Sparkles className="w-2 h-2 md:w-2.5 md:h-2.5 text-purple-400" />
                        </div>
                      )}
                      {mainDream.nightmareFactor > 5 && (
                        <div className="w-3.5 h-3.5 md:w-4 md:h-4 rounded-full bg-red-500/20 flex items-center justify-center" title="Nightmare">
                          <Moon className="w-2 h-2 md:w-2.5 md:h-2.5 text-red-400" />
                        </div>
                      )}
                      {(mainDream.lucidity <= 5 && mainDream.nightmareFactor <= 5) && (
                        <div className="w-3.5 h-3.5 md:w-4 md:h-4 rounded-full bg-primary/20 flex items-center justify-center" title="Standard">
                          <Moon className="w-2 h-2 md:w-2.5 md:h-2.5 text-primary" />
                        </div>
                      )}
                    </div>
                  </div>
                )}
              </motion.div>
            );
          })}
        </div>
      </div>
    </motion.div>
  );
}
