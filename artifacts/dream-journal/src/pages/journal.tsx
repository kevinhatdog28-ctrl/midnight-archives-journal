import React from "react";
import { Link } from "wouter";
import { format } from "date-fns";
import { useListDreams } from "@workspace/api-client-react";
import { EmotionDisplay } from "@/components/emotion-display";
import { QualitiesDisplay } from "@/components/qualities-display";
import { BrandLogo } from "@/components/brand-logo";
import { Card, CardContent, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";
import { Plus } from "lucide-react";
import { motion } from "framer-motion";
import { haptic } from "@/lib/haptics";

export default function JournalPage() {
  const { data: dreams, isLoading } = useListDreams();

  if (isLoading) {
    return (
      <div className="space-y-6">
        <div className="flex items-center justify-between mb-8">
          <Skeleton className="h-10 w-48 bg-muted/50" />
          <Skeleton className="h-10 w-32 bg-muted/50" />
        </div>
        {[1, 2, 3].map((i) => (
          <Skeleton key={i} className="h-64 w-full rounded-xl bg-card border-border/50" />
        ))}
      </div>
    );
  }

  const sortedDreams = dreams ? [...dreams].sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime()) : [];

  return (
    <motion.div initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.35, ease: [0.22,1,0.36,1] }} className="space-y-8">
      <header className="flex flex-col sm:flex-row sm:items-end justify-between gap-4">
        <div className="flex items-start gap-3">
          <BrandLogo size="md" className="mt-0.5 sm:hidden" />
          <div>
            <h1 className="text-3xl md:text-4xl font-serif">Midnight Archives</h1>
          <p className="text-muted-foreground mt-2 font-light">Your nightly journeys, captured.</p>
          </div>
        </div>
        <Link 
          href="/new" 
          onClick={() => haptic('tap')}
          className="inline-flex items-center justify-center gap-2 bg-primary hover:bg-primary/90 text-primary-foreground px-6 py-2.5 rounded-full font-medium transition-all dream-glow"
        >
          <Plus className="w-4 h-4" />
          <span>Record Dream</span>
        </Link>
      </header>

      {sortedDreams.length === 0 ? (
        <div className="flex flex-col items-center justify-center py-20 text-center space-y-6 border border-dashed border-border/50 rounded-2xl bg-card/30 backdrop-blur-sm">
          <div className="w-20 h-20 rounded-full bg-primary/10 flex items-center justify-center dream-glow text-primary">
            <BrandLogo size="lg" />
          </div>
          <div className="max-w-md space-y-2">
            <h3 className="text-xl font-serif">The pages are empty</h3>
            <p className="text-muted-foreground">You haven't recorded any dreams yet. Tonight, before you sleep, set an intention to remember.</p>
          </div>
          <Link 
            href="/new" 
            onClick={() => haptic('tap')}
            className="text-primary hover:text-primary/80 font-medium tracking-wide border-b border-primary/30 pb-0.5"
          >
            Write your first entry
          </Link>
        </div>
      ) : (
        <div className="grid grid-cols-1 gap-6">
          {sortedDreams.map((dream, index) => (
            <motion.div
              key={dream.id}
              initial={{ opacity: 0, y: 24 }} 
              animate={{ opacity: 1, y: 0 }} 
              transition={{ duration: 0.4, delay: index * 0.07 }}
              whileHover={{ y: -3, scale: 1.005 }}
            >
              <Link onClick={() => haptic('tap')} href={`/dreams/${dream.id}`}>
                <Card className="group cursor-pointer border-border/40 bg-card/60 backdrop-blur-md hover:bg-card/80 transition-all duration-500 overflow-hidden dream-card-hover">
                  <div className="absolute top-0 left-0 w-1 h-full bg-gradient-to-b from-primary/50 to-accent/50 opacity-0 group-hover:opacity-100 transition-opacity" />
                  <CardHeader className="pb-3">
                    <div className="flex justify-between items-start mb-2">
                      <span className="text-xs font-mono text-muted-foreground tracking-widest uppercase">
                        {format(new Date(dream.date), 'MMM dd, yyyy')}
                      </span>
                      {dream.lucidity >= 7 && (
                        <span className="text-[10px] uppercase tracking-widest bg-primary/20 text-primary px-2 py-0.5 rounded-full border border-primary/20">Lucid</span>
                      )}
                    </div>
                    <CardTitle className="text-2xl font-serif tracking-wide group-hover:text-primary transition-colors">
                      {dream.title}
                    </CardTitle>
                  </CardHeader>
                  <CardContent className="pb-4">
                    <p className="text-muted-foreground line-clamp-2 leading-relaxed font-light">
                      {dream.description}
                    </p>
                    
                    <div className="mt-6 pt-4 border-t border-border/30">
                      <EmotionDisplay emotions={dream.emotions} />
                    </div>
                  </CardContent>
                  <CardFooter className="bg-muted/10 pt-4 pb-4">
                    <QualitiesDisplay 
                      lucidity={dream.lucidity} 
                      clarity={dream.clarity} 
                      nightmareFactor={dream.nightmareFactor} 
                    />
                  </CardFooter>
                </Card>
              </Link>
            </motion.div>
          ))}
        </div>
      )}
    </motion.div>
  );
}
