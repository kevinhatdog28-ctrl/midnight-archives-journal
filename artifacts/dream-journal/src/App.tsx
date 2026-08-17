import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { Toaster } from '@/components/ui/toaster';
import { TooltipProvider } from '@/components/ui/tooltip';
import NotFound from '@/pages/not-found';
import { Route, Switch, Router as WouterRouter, useLocation } from 'wouter';
import { ThemeProvider } from '@/components/theme-provider';
import { Layout } from '@/components/layout';
import { SettingsProvider, useSettings } from '@/contexts/settings-context';
import { AnimatePresence, MotionConfig, motion } from 'framer-motion';

import JournalPage from '@/pages/journal';
import NewEntryPage from '@/pages/new-entry';
import CalendarPage from '@/pages/calendar';
import DreamDetailPage from '@/pages/dream-detail';
import StatsPage from '@/pages/stats';
import ArchivedPage from '@/pages/archived';

const queryClient = new QueryClient();

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
          <Switch>
            <Route path="/" component={JournalPage} />
            <Route path="/calendar" component={CalendarPage} />
            <Route path="/new" component={NewEntryPage} />
            <Route path="/stats" component={StatsPage} />
            <Route path="/archived" component={ArchivedPage} />
            <Route path="/dreams/:id" component={DreamDetailPage} />
            <Route component={NotFound} />
          </Switch>
        </motion.div>
      </AnimatePresence>
    </Layout>
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
