import React, { useMemo } from "react";
import { Link, useLocation } from "wouter";
import { MoonStar, Book, BarChart3, Plus, Sparkles, CalendarDays } from "lucide-react";
import SettingsPanel from "@/components/settings-panel";
import { haptic } from "@/lib/haptics";
import { motion } from "framer-motion";

export function Layout({ children }: { children: React.ReactNode }) {
  const [location] = useLocation();

  const navItems = [
    { href: "/",         label: "Journal",   icon: Book },
    { href: "/calendar", label: "Calendar",  icon: CalendarDays },
    { href: "/new",      label: "New Entry", icon: Plus },
    { href: "/stats",    label: "Insights",  icon: BarChart3 },
  ];

  // Particle sizes are memoized to avoid re-randomising on every render
  const particles = useMemo(() => (
    Array.from({ length: 8 }).map((_, i) => ({
      id: i,
      xStart:   Math.random() * 100,
      yStart:   Math.random() * 100,
      duration: 8 + Math.random() * 12,
      delay:    Math.random() * 5,
      size:     3 + Math.random() * 2,
    }))
  ), []);

  return (
    <div className="flex h-[100dvh] w-full bg-background overflow-hidden selection:bg-primary/30 relative">

      {/* ── Desktop Sidebar ──────────────────────────────────────── */}
      <aside className="hidden md:flex flex-col w-64 border-r border-border/60 bg-sidebar/60 backdrop-blur-xl z-20">
        <div className="p-6 flex items-center gap-3 text-primary">
          <MoonStar className="w-6 h-6" />
          <span className="font-serif text-xl tracking-wider text-foreground">Midnight Archives</span>
        </div>

        <nav className="flex-1 px-4 space-y-1 mt-4">
          {navItems.map((item) => {
            const isActive = location === item.href;
            return (
              <Link
                key={item.href}
                href={item.href}
                onClick={() => haptic("tap")}
                className={`relative flex items-center gap-3 px-4 py-3 rounded-lg transition-colors duration-150 ${
                  isActive
                    ? "text-primary"
                    : "text-muted-foreground hover:text-foreground"
                }`}
              >
                {isActive && (
                  <motion.div
                    layoutId="sidebar-active-pill"
                    className="absolute inset-0 bg-primary/10 rounded-lg dream-glow"
                    transition={{ type: "spring", stiffness: 380, damping: 36 }}
                  />
                )}
                <item.icon className="w-5 h-5 relative z-10" />
                <span className="font-medium tracking-wide relative z-10">{item.label}</span>
                {isActive && <Sparkles className="w-3 h-3 ml-auto opacity-50 relative z-10" />}
              </Link>
            );
          })}
        </nav>

        <div className="mt-auto p-4 flex justify-start">
          <SettingsPanel />
        </div>
      </aside>

      {/* ── Main Content ─────────────────────────────────────────── */}
      <main className="flex-1 flex flex-col h-[100dvh] overflow-y-auto relative z-10">
        {/* Ambient orbs */}
        <div
          className="fixed top-[-20%] left-[-10%] w-[50%] h-[50%] rounded-full bg-primary/5 blur-[120px] pointer-events-none"
          style={{ animation: "orb-breathe 8s ease-in-out infinite" }}
        />
        <div
          className="fixed bottom-[-20%] right-[-10%] w-[50%] h-[50%] rounded-full bg-accent/5 blur-[120px] pointer-events-none"
          style={{ animation: "orb-breathe 12s ease-in-out infinite 4s" }}
        />

        {/* Ambient particles */}
        <div className="fixed inset-0 pointer-events-none overflow-hidden">
          {particles.map((p) => (
            <motion.div
              key={p.id}
              className="absolute rounded-full bg-primary opacity-20"
              style={{
                width:  `${p.size}px`,
                height: `${p.size}px`,
                left:   `${p.xStart}%`,
                top:    `${p.yStart}%`,
              }}
              animate={{
                y: [0, -30, 0],
                x: [0, 15, -10, 0],
                opacity: [0.08, 0.24, 0.08],
              }}
              transition={{
                duration: p.duration,
                delay:    p.delay,
                repeat:   Infinity,
                ease:     "easeInOut",
              }}
            />
          ))}
        </div>

        <div className="flex-1 container max-w-4xl mx-auto p-6 md:p-10 z-10 relative pb-[calc(6rem+env(safe-area-inset-bottom))] md:pb-10">
          {children}
        </div>
      </main>

      {/* ── Mobile Bottom Nav ────────────────────────────────────── */}
      <nav className="md:hidden fixed bottom-0 left-0 right-0 border-t border-border/60 bg-background/85 backdrop-blur-xl pt-2 px-2 pb-[max(0.5rem,env(safe-area-inset-bottom))] z-50">
        <div className="flex items-center justify-around">
          {navItems.map((item) => {
            const isActive = location === item.href;
            return (
              <Link
                key={item.href}
                href={item.href}
                onClick={() => haptic("tap")}
                className={`relative flex flex-col items-center p-2 rounded-lg transition-colors duration-150 ${
                  isActive ? "text-primary" : "text-muted-foreground"
                }`}
              >
                <div className="relative p-1 rounded-full">
                  {isActive && (
                    <motion.div
                      layoutId="mobile-active-pill"
                      className="absolute inset-0 bg-primary/12 dark:bg-primary/10 rounded-full dream-glow"
                      transition={{ type: "spring", stiffness: 380, damping: 36 }}
                    />
                  )}
                  <item.icon className="w-6 h-6 relative z-10" />
                </div>
                <span className="text-[10px] mt-1 font-medium">{item.label}</span>
              </Link>
            );
          })}
          <SettingsPanel isMobile />
        </div>
      </nav>
    </div>
  );
}
