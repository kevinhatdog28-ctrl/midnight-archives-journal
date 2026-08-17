import React from "react";
import { Link } from "wouter";
import { format } from "date-fns";
import { motion } from "framer-motion";
import {
  useListArchivedDreams,
  useRestoreDream,
  getListDreamsQueryKey,
  getListArchivedDreamsQueryKey,
  getGetDreamStatsQueryKey,
} from "@workspace/api-client-react";
import { useQueryClient } from "@tanstack/react-query";
import { EmotionDisplay } from "@/components/emotion-display";
import { QualitiesDisplay } from "@/components/qualities-display";
import { Card, CardContent, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";
import { Button } from "@/components/ui/button";
import { ArrowLeft, Archive, RotateCcw } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import { haptic } from "@/lib/haptics";

export default function ArchivedPage() {
  const { data: dreams, isLoading } = useListArchivedDreams();
  const restoreDream = useRestoreDream();
  const queryClient = useQueryClient();
  const { toast } = useToast();

  function handleRestore(id: number) {
    haptic("success");
    restoreDream.mutate({ id }, {
      onSuccess: () => {
        queryClient.invalidateQueries({ queryKey: getListDreamsQueryKey() });
        queryClient.invalidateQueries({ queryKey: getListArchivedDreamsQueryKey() });
        queryClient.invalidateQueries({ queryKey: getGetDreamStatsQueryKey() });
        toast({ title: "Dream restored", description: "It's back in your journal." });
      },
      onError: () => {
        haptic("error");
        toast({ variant: "destructive", title: "Restore failed", description: "Please try again." });
      },
    });
  }

  return (
    <motion.div
      initial={{ opacity: 0, y: 12 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.35, ease: [0.22, 1, 0.36, 1] }}
      className="max-w-3xl mx-auto space-y-8"
    >
      <header className="flex flex-col gap-4">
        <Link
          href="/"
          onClick={() => haptic("tap")}
          className="inline-flex items-center text-sm text-muted-foreground hover:text-primary transition-colors w-fit"
        >
          <ArrowLeft className="w-4 h-4 mr-2" />
          Back to Journal
        </Link>
        <div className="flex items-end gap-4">
          <div>
            <h1 className="text-3xl font-serif">Archived Dreams</h1>
            <p className="text-muted-foreground mt-2 font-light">
              Dreams you've set aside — restore any time.
            </p>
          </div>
        </div>
      </header>

      {isLoading ? (
        <div className="space-y-4">
          {[1, 2, 3].map((i) => (
            <Skeleton key={i} className="h-48 w-full rounded-xl bg-card border-border/50" />
          ))}
        </div>
      ) : !dreams || dreams.length === 0 ? (
        <div className="flex flex-col items-center justify-center py-20 text-center space-y-6 border border-dashed border-border/50 rounded-2xl bg-card/30 backdrop-blur-sm">
          <div className="w-20 h-20 rounded-full bg-muted/40 flex items-center justify-center text-muted-foreground">
            <Archive className="w-10 h-10 opacity-50" />
          </div>
          <div className="max-w-md space-y-2">
            <h3 className="text-xl font-serif">Your archive is empty</h3>
            <p className="text-muted-foreground text-sm">
              Archived dreams will appear here. From any dream, tap Archive to move it out of your main journal.
            </p>
          </div>
        </div>
      ) : (
        <div className="grid grid-cols-1 gap-5">
          {dreams.map((dream, index) => (
            <motion.div
              key={dream.id}
              initial={{ opacity: 0, y: 16 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.35, delay: index * 0.06, ease: [0.22, 1, 0.36, 1] }}
            >
              <Card className="border-border/40 bg-card/50 backdrop-blur-md overflow-hidden opacity-80 hover:opacity-100 transition-opacity duration-300">
                {/* Archived tint strip */}
                <div className="h-0.5 w-full bg-gradient-to-r from-amber-500/40 to-amber-400/20" />

                <CardHeader className="pb-3">
                  <div className="flex justify-between items-start mb-2">
                    <span className="text-xs font-mono text-muted-foreground tracking-widest uppercase">
                      {format(new Date(dream.date), "MMM dd, yyyy")}
                    </span>
                    <span className="text-[10px] uppercase tracking-widest bg-amber-500/10 text-amber-600 dark:text-amber-400 px-2 py-0.5 rounded-full border border-amber-500/20">
                      Archived
                    </span>
                  </div>
                  <CardTitle className="text-xl font-serif tracking-wide">{dream.title}</CardTitle>
                </CardHeader>

                <CardContent className="pb-4 space-y-4">
                  <p className="text-muted-foreground line-clamp-2 leading-relaxed font-light text-sm">
                    {dream.description}
                  </p>
                  <EmotionDisplay emotions={dream.emotions} />
                </CardContent>

                <CardFooter className="bg-muted/10 pt-3 pb-3 flex items-center justify-between gap-3 flex-wrap">
                  <QualitiesDisplay
                    lucidity={dream.lucidity}
                    clarity={dream.clarity}
                    nightmareFactor={dream.nightmareFactor}
                  />
                  <div className="flex items-center gap-2 ml-auto">
                    <Button
                      variant="ghost"
                      size="sm"
                      asChild
                      onClick={() => haptic("tap")}
                      className="text-muted-foreground hover:text-foreground text-xs"
                    >
                      <Link href={`/dreams/${dream.id}`}>View / Edit</Link>
                    </Button>
                    <Button
                      size="sm"
                      variant="outline"
                      disabled={restoreDream.isPending}
                      onClick={() => handleRestore(dream.id)}
                      className="gap-1.5 text-xs border-amber-500/30 text-amber-600 dark:text-amber-400 hover:bg-amber-500/10"
                    >
                      <RotateCcw className="w-3 h-3" />
                      Restore
                    </Button>
                  </div>
                </CardFooter>
              </Card>
            </motion.div>
          ))}
        </div>
      )}
    </motion.div>
  );
}
