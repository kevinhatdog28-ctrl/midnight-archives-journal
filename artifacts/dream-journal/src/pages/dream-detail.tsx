import React, { useState, useEffect } from "react";
import { useRoute, useLocation, Link } from "wouter";
import { format } from "date-fns";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import * as z from "zod";
import { 
  useGetDream, 
  useDeleteDream, 
  useUpdateDream,
  getListDreamsQueryKey, 
  getGetDreamQueryKey, 
  getGetDreamStatsQueryKey 
} from "@workspace/api-client-react";
import { useQueryClient } from "@tanstack/react-query";

import { EmotionDisplay } from "@/components/emotion-display";
import { QualitiesDisplay } from "@/components/qualities-display";
import { EmotionInput } from "@/components/emotion-input";
import { Button } from "@/components/ui/button";
import { Skeleton } from "@/components/ui/skeleton";
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Slider } from "@/components/ui/slider";
import { useToast } from "@/hooks/use-toast";
import { 
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from "@/components/ui/alert-dialog";
import { ArrowLeft, Calendar, Trash2, Edit3, X, Check } from "lucide-react";

const dreamSchema = z.object({
  title: z.string().min(1, "A title is required").max(100),
  date: z.string(),
  description: z.string().min(1, "A description is required"),
  emotions: z.object({
    angry: z.number().min(0).max(10),
    sad: z.number().min(0).max(10),
    disgust: z.number().min(0).max(10),
    happy: z.number().min(0).max(10),
    peaceful: z.number().min(0).max(10),
    neutral: z.number().min(0).max(10),
  }),
  lucidity: z.number().min(0).max(10),
  clarity: z.number().min(0).max(10),
  nightmareFactor: z.number().min(0).max(10),
});

type DreamFormValues = z.infer<typeof dreamSchema>;

export default function DreamDetailPage() {
  const [, params] = useRoute("/dreams/:id");
  const id = parseInt(params?.id || "0");
  const [, setLocation] = useLocation();
  const { toast } = useToast();
  const queryClient = useQueryClient();
  const [isEditing, setIsEditing] = useState(false);
  
  const { data: dream, isLoading, error } = useGetDream(id, { 
    query: { enabled: !!id, queryKey: getGetDreamQueryKey(id) } 
  });
  
  const deleteDream = useDeleteDream();
  const updateDream = useUpdateDream();

  const form = useForm<DreamFormValues>({
    resolver: zodResolver(dreamSchema),
    defaultValues: {
      title: "",
      date: format(new Date(), "yyyy-MM-dd"),
      description: "",
      emotions: { angry: 0, sad: 0, disgust: 0, happy: 0, peaceful: 0, neutral: 0 },
      lucidity: 0,
      clarity: 5,
      nightmareFactor: 0,
    },
  });

  useEffect(() => {
    if (dream && !isEditing) {
      form.reset({
        title: dream.title,
        date: dream.date,
        description: dream.description,
        emotions: dream.emotions,
        lucidity: dream.lucidity,
        clarity: dream.clarity,
        nightmareFactor: dream.nightmareFactor,
      });
    }
  }, [dream, isEditing, form]);

  if (isLoading) {
    return (
      <div className="max-w-3xl mx-auto space-y-8">
        <Skeleton className="h-6 w-32 bg-muted/50" />
        <Skeleton className="h-16 w-3/4 bg-muted/50" />
        <Skeleton className="h-64 w-full bg-card/50 rounded-2xl" />
      </div>
    );
  }

  if (error || !dream) {
    return (
      <div className="max-w-3xl mx-auto text-center py-20">
        <h2 className="text-2xl font-serif mb-4">Dream Not Found</h2>
        <p className="text-muted-foreground mb-8">This memory may have faded completely.</p>
        <Link href="/">
          <Button variant="outline">Return to Journal</Button>
        </Link>
      </div>
    );
  }

  const handleDelete = () => {
    deleteDream.mutate({ id }, {
      onSuccess: () => {
        queryClient.invalidateQueries({ queryKey: getListDreamsQueryKey() });
        queryClient.invalidateQueries({ queryKey: getGetDreamStatsQueryKey() });
        toast({
          title: "Entry Deleted",
          description: "The memory has been wiped.",
        });
        setLocation("/");
      },
      onError: () => {
        toast({
          variant: "destructive",
          title: "Failed to delete",
          description: "An error occurred while deleting.",
        });
      }
    });
  };

  const onSubmitUpdate = (data: DreamFormValues) => {
    updateDream.mutate({ id, data }, {
      onSuccess: (updatedData) => {
        queryClient.invalidateQueries({ queryKey: getListDreamsQueryKey() });
        queryClient.invalidateQueries({ queryKey: getGetDreamStatsQueryKey() });
        queryClient.setQueryData(getGetDreamQueryKey(id), updatedData);
        toast({
          title: "Dream Updated",
          description: "Your memory has been refined.",
        });
        setIsEditing(false);
      },
      onError: () => {
        toast({
          variant: "destructive",
          title: "Failed to update",
          description: "The changes slipped away. Please try again.",
        });
      }
    });
  };

  return (
    <div className="max-w-3xl mx-auto space-y-8 animate-in fade-in duration-700">
      <nav className="flex justify-between items-center">
        <Link href="/" className="inline-flex items-center text-sm text-muted-foreground hover:text-primary transition-colors">
          <ArrowLeft className="w-4 h-4 mr-2" />
          Back to Journal
        </Link>

        <div className="flex items-center gap-2">
          {!isEditing ? (
            <>
              <Button variant="ghost" size="sm" onClick={() => setIsEditing(true)} className="text-muted-foreground hover:text-foreground">
                <Edit3 className="w-4 h-4 mr-2" />
                Edit
              </Button>

              <AlertDialog>
                <AlertDialogTrigger asChild>
                  <Button variant="ghost" size="sm" className="text-destructive/70 hover:text-destructive hover:bg-destructive/10 border border-transparent hover:border-destructive/20 transition-all">
                    <Trash2 className="w-4 h-4 mr-2" />
                    Delete
                  </Button>
                </AlertDialogTrigger>
                <AlertDialogContent className="bg-card/95 backdrop-blur-xl border-border/50 shadow-2xl">
                  <AlertDialogHeader>
                    <AlertDialogTitle className="font-serif text-2xl">Forget this dream?</AlertDialogTitle>
                    <AlertDialogDescription className="text-base text-muted-foreground">
                      This memory will be permanently removed from your archives. This action cannot be undone.
                    </AlertDialogDescription>
                  </AlertDialogHeader>
                  <AlertDialogFooter className="mt-6">
                    <AlertDialogCancel className="bg-transparent border-border/50 hover:bg-muted/50">Keep it</AlertDialogCancel>
                    <AlertDialogAction 
                      onClick={handleDelete}
                      className="bg-destructive hover:bg-destructive/90 text-destructive-foreground shadow-[0_0_15px_rgba(239,68,68,0.3)]"
                    >
                      Let it fade
                    </AlertDialogAction>
                  </AlertDialogFooter>
                </AlertDialogContent>
              </AlertDialog>
            </>
          ) : (
            <Button variant="ghost" size="sm" onClick={() => setIsEditing(false)} className="text-muted-foreground">
              <X className="w-4 h-4 mr-2" />
              Cancel Edit
            </Button>
          )}
        </div>
      </nav>

      {!isEditing ? (
        <article className="space-y-10 animate-in fade-in">
          <header className="space-y-4">
            <div className="flex items-center gap-3 text-primary/80 font-mono text-sm tracking-widest uppercase">
              <Calendar className="w-4 h-4" />
              <time dateTime={dream.date}>{format(new Date(dream.date), 'EEEE, MMMM do, yyyy')}</time>
            </div>
            
            <h1 className="text-4xl md:text-5xl lg:text-6xl font-serif text-foreground leading-tight tracking-wide">
              {dream.title}
            </h1>
          </header>

          <div className="prose prose-invert max-w-none prose-p:leading-relaxed prose-p:text-lg prose-p:font-light prose-p:text-foreground/90">
            {dream.description.split('\n').map((paragraph, i) => (
              <p key={i}>{paragraph}</p>
            ))}
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-8 pt-10 border-t border-border/30">
            <div className="space-y-4">
              <h3 className="text-sm font-mono tracking-widest text-muted-foreground uppercase">Emotional State</h3>
              <div className="bg-card/30 rounded-2xl p-6 border border-border/40 shadow-inner">
                <EmotionDisplay emotions={dream.emotions} className="gap-3" />
              </div>
            </div>

            <div className="space-y-4">
              <h3 className="text-sm font-mono tracking-widest text-muted-foreground uppercase">Dream Qualities</h3>
              <div className="bg-card/30 rounded-2xl p-6 border border-border/40 shadow-inner">
                <QualitiesDisplay 
                  lucidity={dream.lucidity} 
                  clarity={dream.clarity} 
                  nightmareFactor={dream.nightmareFactor} 
                />
              </div>
            </div>
          </div>
        </article>
      ) : (
        <div className="bg-card/40 border border-border/50 rounded-2xl p-6 md:p-8 backdrop-blur-sm shadow-xl animate-in fade-in">
          <Form {...form}>
            <form onSubmit={form.handleSubmit(onSubmitUpdate)} className="space-y-10">
              <div className="space-y-6">
                <div className="flex items-center gap-4">
                  <div className="w-12 h-px bg-primary/30" />
                  <h2 className="text-sm font-mono tracking-widest text-primary uppercase">Refine Memory</h2>
                  <div className="flex-1 h-px bg-border/50" />
                </div>
                
                <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
                  <FormField
                    control={form.control}
                    name="date"
                    render={({ field }) => (
                      <FormItem className="md:col-span-1">
                        <FormLabel className="text-muted-foreground">Date</FormLabel>
                        <FormControl>
                          <Input type="date" {...field} className="bg-background/50 border-border/50 focus:border-primary/50" />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                  <FormField
                    control={form.control}
                    name="title"
                    render={({ field }) => (
                      <FormItem className="md:col-span-3">
                        <FormLabel className="text-muted-foreground">Title</FormLabel>
                        <FormControl>
                          <Input {...field} className="bg-background/50 border-border/50 focus:border-primary/50 text-lg py-6" />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                </div>

                <FormField
                  control={form.control}
                  name="description"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel className="text-muted-foreground">What happened?</FormLabel>
                      <FormControl>
                        <Textarea 
                          className="min-h-[200px] resize-y bg-background/50 border-border/50 focus:border-primary/50 text-base leading-relaxed p-4"
                          {...field} 
                        />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
              </div>

              <div className="space-y-6">
                <div className="flex items-center gap-4">
                  <div className="w-12 h-px bg-primary/30" />
                  <h2 className="text-sm font-mono tracking-widest text-primary uppercase">Emotional Texture</h2>
                  <div className="flex-1 h-px bg-border/50" />
                </div>
                
                <FormField
                  control={form.control}
                  name="emotions"
                  render={({ field }) => (
                    <FormItem>
                      <FormControl>
                        <EmotionInput emotions={field.value} onChange={field.onChange} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
              </div>

              <div className="space-y-8">
                <div className="flex items-center gap-4">
                  <div className="w-12 h-px bg-primary/30" />
                  <h2 className="text-sm font-mono tracking-widest text-primary uppercase">Dream Qualities</h2>
                  <div className="flex-1 h-px bg-border/50" />
                </div>
                
                <div className="grid grid-cols-1 md:grid-cols-3 gap-8 md:gap-12">
                  <FormField
                    control={form.control}
                    name="lucidity"
                    render={({ field }) => (
                      <FormItem>
                        <div className="flex justify-between mb-4">
                          <FormLabel className="text-purple-400">Lucidity</FormLabel>
                          <span className="text-xs text-muted-foreground">{field.value}/10</span>
                        </div>
                        <FormControl>
                          <Slider 
                            min={0} max={10} step={1} 
                            value={[field.value]} 
                            onValueChange={(vals) => field.onChange(vals[0])}
                            className="[&_[role=slider]]:border-purple-500 [&_[role=slider]]:shadow-[0_0_10px_rgba(168,85,247,0.5)]"
                          />
                        </FormControl>
                      </FormItem>
                    )}
                  />

                  <FormField
                    control={form.control}
                    name="clarity"
                    render={({ field }) => (
                      <FormItem>
                        <div className="flex justify-between mb-4">
                          <FormLabel className="text-blue-400">Clarity</FormLabel>
                          <span className="text-xs text-muted-foreground">{field.value}/10</span>
                        </div>
                        <FormControl>
                          <Slider 
                            min={0} max={10} step={1} 
                            value={[field.value]} 
                            onValueChange={(vals) => field.onChange(vals[0])}
                            className="[&_[role=slider]]:border-blue-400 [&_[role=slider]]:shadow-[0_0_10px_rgba(96,165,250,0.5)]"
                          />
                        </FormControl>
                      </FormItem>
                    )}
                  />

                  <FormField
                    control={form.control}
                    name="nightmareFactor"
                    render={({ field }) => (
                      <FormItem>
                        <div className="flex justify-between mb-4">
                          <FormLabel className="text-red-400">Nightmare</FormLabel>
                          <span className="text-xs text-muted-foreground">{field.value}/10</span>
                        </div>
                        <FormControl>
                          <Slider 
                            min={0} max={10} step={1} 
                            value={[field.value]} 
                            onValueChange={(vals) => field.onChange(vals[0])}
                            className="[&_[role=slider]]:border-red-500 [&_[role=slider]]:shadow-[0_0_10px_rgba(239,68,68,0.5)]"
                          />
                        </FormControl>
                      </FormItem>
                    )}
                  />
                </div>
              </div>

              <div className="pt-6 border-t border-border/50 flex justify-end">
                <Button 
                  type="submit" 
                  disabled={updateDream.isPending}
                  className="w-full md:w-auto px-8 py-6 text-lg rounded-xl dream-glow"
                >
                  <Check className="w-5 h-5 mr-2" />
                  {updateDream.isPending ? "Saving..." : "Save Changes"}
                </Button>
              </div>
            </form>
          </Form>
        </div>
      )}
    </div>
  );
}
