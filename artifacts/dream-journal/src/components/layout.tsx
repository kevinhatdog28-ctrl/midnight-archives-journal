import React from "react";
import { Link, useLocation } from "wouter";
import { MoonStar, Book, BarChart3, Plus, Sparkles } from "lucide-react";

export function Layout({ children }: { children: React.ReactNode }) {
  const [location] = useLocation();

  const navItems = [
    { href: "/", label: "Journal", icon: Book },
    { href: "/new", label: "New Entry", icon: Plus },
    { href: "/stats", label: "Insights", icon: BarChart3 },
  ];

  return (
    <div className="flex h-[100dvh] w-full bg-background overflow-hidden selection:bg-primary/30">
      {/* Desktop Sidebar */}
      <aside className="hidden md:flex flex-col w-64 border-r border-border/50 bg-sidebar/50 backdrop-blur-xl">
        <div className="p-6 flex items-center gap-3 text-primary">
          <MoonStar className="w-6 h-6" />
          <span className="font-serif text-xl tracking-wider text-foreground">Somnia</span>
        </div>
        
        <nav className="flex-1 px-4 space-y-2 mt-4">
          {navItems.map((item) => {
            const isActive = location === item.href;
            return (
              <Link key={item.href} href={item.href} className={`flex items-center gap-3 px-4 py-3 rounded-lg transition-all duration-300 ${isActive ? 'bg-primary/10 text-primary dream-glow' : 'text-muted-foreground hover:bg-muted/50 hover:text-foreground'}`}>
                <item.icon className="w-5 h-5" />
                <span className="font-medium tracking-wide">{item.label}</span>
                {isActive && <Sparkles className="w-3 h-3 ml-auto opacity-50" />}
              </Link>
            );
          })}
        </nav>
      </aside>

      {/* Main Content */}
      <main className="flex-1 flex flex-col h-[100dvh] overflow-y-auto relative">
        {/* Glow ambient effects */}
        <div className="fixed top-[-20%] left-[-10%] w-[50%] h-[50%] rounded-full bg-primary/5 blur-[120px] pointer-events-none" />
        <div className="fixed bottom-[-20%] right-[-10%] w-[50%] h-[50%] rounded-full bg-accent/5 blur-[120px] pointer-events-none" />
        
        <div className="flex-1 container max-w-4xl mx-auto p-6 md:p-10 z-10 relative pb-24 md:pb-10">
          {children}
        </div>
      </main>

      {/* Mobile Bottom Nav */}
      <nav className="md:hidden fixed bottom-0 left-0 right-0 border-t border-border/50 bg-background/80 backdrop-blur-xl p-2 z-50">
        <div className="flex items-center justify-around">
          {navItems.map((item) => {
            const isActive = location === item.href;
            return (
              <Link key={item.href} href={item.href} className={`flex flex-col items-center p-2 rounded-lg transition-colors ${isActive ? 'text-primary' : 'text-muted-foreground'}`}>
                <div className={`p-1 rounded-full ${isActive ? 'bg-primary/10 dream-glow' : ''}`}>
                  <item.icon className="w-6 h-6" />
                </div>
                <span className="text-[10px] mt-1 font-medium">{item.label}</span>
              </Link>
            );
          })}
        </div>
      </nav>
    </div>
  );
}
