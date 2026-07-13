import React from "react";
import { useLocation, useSearch } from "wouter";
import { zodResolver } from "@hookform/resolvers/zod";
import { useForm } from "react-hook-form";
import * as z from "zod";
import { format } from "date-fns";
import { useCreateDream, getListDreamsQueryKey, getGetDreamStatsQueryKey } from "@workspace/api-client-react";
import { useQueryClient } from "@tanstack/react-query";

import { Button } from "@/components/ui/button";
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { EmotionInput } from "@/components/emotion-input";
import { Slider } from "@/components/ui/slider";
import { useToast } from "@/hooks/use-toast";
import { ArrowLeft } from "lucide-react";
import { Link } from "wouter";

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

export default function NewEntryPage() {
  const [, setLocation] = useLocation();
  const searchString = useSearch();
  const { toast } = useToast();
  const queryClient = useQueryClient();
  const createDream = useCreateDream();

  const searchParams = new URLSearchParams(searchString);
  const dateParam = searchParams.get("date");
  const defaultDate = dateParam || format(new Date(), "yyyy-MM-dd");

  const form = useForm<DreamFormValues>({
    resolver: zodResolver(dreamSchema),
    defaultValues: {
      title: "",
      date: defaultDate,
      description: "",
      emotions: {
        angry: 0,
        sad: 0,
        disgust: 0,
        happy: 0,
        peaceful: 0,
        neutral: 0,
      },
      lucidity: 0,
      clarity: 5,
      nightmareFactor: 0,
    },
  });

  function onSubmit(data: DreamFormValues) {
    createDream.mutate({ data }, {
      onSuccess: (newDream) => {
        queryClient.invalidateQueries({ queryKey: getListDreamsQueryKey() });
        queryClient.invalidateQueries({ queryKey: getGetDreamStatsQueryKey() });
        toast({
          title: "Dream Recorded",
          description: "Your journey has been archived.",
        });
        setLocation(`/dreams/${newDream.id}`);
      },
      onError: () => {
        toast({
          variant: "destructive",
          title: "Failed to save",
          description: "The dream slipped away. Please try again.",
        });
      }
    });
  }

  return (
    <div className="max-w-3xl mx-auto space-y-8 animate-in fade-in slide-in-from-bottom-4 duration-700">
      <header className="flex flex-col gap-4">
        <Link href="/" className="inline-flex items-center text-sm text-muted-foreground hover:text-primary transition-colors w-fit">
          <ArrowLeft className="w-4 h-4 mr-2" />
          Back to Journal
        </Link>
        <div>
          <h1 className="text-3xl font-serif text-primary-foreground">Record a Dream</h1>
          <p className="text-muted-foreground mt-2 font-light">Capture the details before they fade.</p>
        </div>
      </header>

      <div className="bg-card/40 border border-border/50 rounded-2xl p-6 md:p-8 backdrop-blur-sm shadow-xl">
        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-10">
            
            {/* Basic Info */}
            <div className="space-y-6">
              <div className="flex items-center gap-4">
                <div className="w-12 h-px bg-primary/30" />
                <h2 className="text-sm font-mono tracking-widest text-primary uppercase">The Narrative</h2>
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
                        <Input placeholder="E.g., The Flooded Library" {...field} className="bg-background/50 border-border/50 focus:border-primary/50 text-lg py-6" />
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
                        placeholder="I was walking through..." 
                        className="min-h-[200px] resize-y bg-background/50 border-border/50 focus:border-primary/50 text-base leading-relaxed p-4"
                        {...field} 
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
            </div>

            {/* Emotions */}
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

            {/* Qualities */}
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
                      <p className="text-[10px] text-muted-foreground mt-2">0 = Unaware, 10 = Full Control</p>
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
                      <p className="text-[10px] text-muted-foreground mt-2">0 = Foggy, 10 = Crystal Clear</p>
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
                      <p className="text-[10px] text-muted-foreground mt-2">0 = Pleasant, 10 = Terrifying</p>
                    </FormItem>
                  )}
                />
              </div>
            </div>

            <div className="pt-6 border-t border-border/50 flex justify-end">
              <Button 
                type="submit" 
                disabled={createDream.isPending}
                className="w-full md:w-auto px-8 py-6 text-lg rounded-xl dream-glow"
              >
                {createDream.isPending ? "Archiving..." : "Archive Dream"}
              </Button>
            </div>
          </form>
        </Form>
      </div>
    </div>
  );
}
