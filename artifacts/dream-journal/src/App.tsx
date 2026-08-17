import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { Toaster } from '@/components/ui/toaster';
import { TooltipProvider } from '@/components/ui/tooltip';
import NotFound from '@/pages/not-found';
import { Route, Switch, Router as WouterRouter, useLocation } from 'wouter';
import { ThemeProvider } from '@/components/theme-provider';
import { Layout } from '@/components/layout';
import { SettingsProvider, useSettings } from '@/contexts/settings-context';
import { AnimatePresence, MotionConfig, motion } from 'framer-motion';
import { lazy, Suspense } from 'react';

const JournalPage = lazy(() => import('@/pages/journal'));
const NewEntryPage = lazy(() => import('@/pages/new-entry'));
const CalendarPage = lazy(() => import('@/pages/calendar'));
const DreamDetailPage = lazy(() => import('@/pages/dream-detail'));
const StatsPage = lazy(() => import('@/pages/stats'));
const ArchivedPage = lazy(() => import('@/pages/archived'));

const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      staleTime: 30_000,
      gcTime: 5 * 60_000,
      refetchOnWindowFocus: false,
      retry: 1,
    },
  },
});

// Shared easing curve for a snappy, native feel
const EASE = [0.22, 1, 0.36, 1] as const;

function Router() {
  const [location] = useLocation();
  return (
    <Layout>
      <AnimatePresence mode="wait" initial={false}>
        <motion.div
          key={location}
          exit={{ opacity: 0, y: -6, transition: { duration: 0.14, ease: EASE } }}
        >
          <Suspense fallback={<PageLoading />}>
            <Switch>
              <Route path="/" component={JournalPage} />
              <Route path="/calendar" component={CalendarPage} />
              <Route path="/new" component={NewEntryPage} />
              <Route path="/stats" component={StatsPage} />
              <Route path="/archived" component={ArchivedPage} />
              <Route path="/dreams/:id" component={DreamDetailPage} />
              <Route component={NotFound} />
            </Switch>
          </Suspense>
        </motion.div>
      </AnimatePresence>
    </Layout>
  );
}

function PageLoading() {
  return (
    <div className="flex min-h-[40vh] items-center justify-center text-primary" aria-label="Loading">
      <div className="h-8 w-8 rounded-full border-2 border-primary/20 border-t-primary animate-spin" />
    </div>
  );
}

function AnimationGate({ children }: { children: React.ReactNode }) {
  const { animationsEnabled } = useSettings();
  return (
    <MotionConfig
      reducedMotion={animationsEnabled ? 'never' : 'always'}
      transition={{ ease: EASE }}
    >
      {children}
    </MotionConfig>
  );
}

function App() {
  return (
    <ThemeProvider defaultTheme="dark" storageKey="dream-journal-theme">
      <QueryClientProvider client={queryClient}>
        <SettingsProvider>
          <TooltipProvider>
            <WouterRouter base={import.meta.env.BASE_URL.replace(/\/$/, '')}>
              <AnimationGate>
                <Router />
              </AnimationGate>
            </WouterRouter>
            <Toaster />
          </TooltipProvider>
        </SettingsProvider>
      </QueryClientProvider>
    </ThemeProvider>
  );
}

export default App;
