import React from 'react';
import { 
  Sheet, 
  SheetContent, 
  SheetDescription, 
  SheetHeader, 
  SheetTitle, 
  SheetTrigger 
} from "@/components/ui/sheet";
import { Button } from "@/components/ui/button";
import { Switch } from "@/components/ui/switch";
import { Settings, Moon, Sun, Vibrate, ZapOff } from "lucide-react";
import { useTheme } from "@/components/theme-provider";
import { useSettings } from "@/contexts/settings-context";

type SettingsPanelProps = {
  isMobile?: boolean;
};

export default function SettingsPanel({ isMobile }: SettingsPanelProps) {
  const { theme, setTheme } = useTheme();
  const { hapticEnabled, setHapticEnabled, animationsEnabled, setAnimationsEnabled } = useSettings();
  
  const hasVibrate = typeof navigator !== 'undefined' && 'vibrate' in navigator;

  return (
    <Sheet>
      <SheetTrigger asChild>
        {isMobile ? (
          <button className="flex flex-col items-center p-2 rounded-lg transition-colors text-muted-foreground hover:text-foreground">
            <div className="p-1 rounded-full">
              <Settings className="w-6 h-6" />
            </div>
            <span className="text-[10px] mt-1 font-medium">Settings</span>
          </button>
        ) : (
          <Button variant="ghost" size="icon" className="text-muted-foreground hover:text-foreground">
            <Settings className="w-5 h-5" />
          </Button>
        )}
      </SheetTrigger>
      <SheetContent
        className="bg-card/95 backdrop-blur-xl border-l-border/50 flex flex-col"
        style={{ paddingTop: 'max(1.5rem, env(safe-area-inset-top))' }}
      >
        <SheetHeader className="mb-6">
          <SheetTitle className="font-serif text-2xl tracking-wide">Settings</SheetTitle>
          <SheetDescription className="font-light">
            Adjust your experience in the dream space.
          </SheetDescription>
        </SheetHeader>

        <div className="space-y-8">
          <div className="space-y-4">
            <h3 className="text-sm font-mono tracking-widest text-primary uppercase">Appearance</h3>
            <div className="grid grid-cols-2 gap-3">
              <Button 
                variant={theme === 'light' ? 'default' : 'outline'} 
                className={`justify-start gap-2 ${theme === 'light' ? 'dream-glow' : 'border-border/50'}`}
                onClick={() => setTheme('light')}
              >
                <Sun className="w-4 h-4" />
                Light
              </Button>
              <Button 
                variant={theme === 'dark' ? 'default' : 'outline'} 
                className={`justify-start gap-2 ${theme === 'dark' ? 'dream-glow' : 'border-border/50'}`}
                onClick={() => setTheme('dark')}
              >
                <Moon className="w-4 h-4" />
                Dark
              </Button>
            </div>
          </div>

          <div className="space-y-4">
            <h3 className="text-sm font-mono tracking-widest text-primary uppercase">Haptic Feedback</h3>
            <div className="flex items-center justify-between">
              <div className="space-y-0.5">
                <div className="flex items-center gap-2 text-foreground font-medium">
                  <Vibrate className="w-4 h-4" />
                  <span>Vibration</span>
                </div>
                <p className="text-xs text-muted-foreground">Vibration on interactions</p>
                {!hasVibrate && (
                  <p className="text-[10px] text-destructive mt-1">Not available on this device</p>
                )}
              </div>
              <Switch 
                checked={hapticEnabled} 
                onCheckedChange={setHapticEnabled}
                disabled={!hasVibrate}
              />
            </div>
          </div>

          <div className="space-y-4">
            <h3 className="text-sm font-mono tracking-widest text-primary uppercase">Low Power Mode</h3>
            <div className="flex items-center justify-between">
              <div className="space-y-0.5">
                <div className="flex items-center gap-2 text-foreground font-medium">
                  <ZapOff className="w-4 h-4" />
                  <span>Reduce Motion</span>
                </div>
                <p className="text-xs text-muted-foreground">Reduces motion and ambient effects</p>
              </div>
              <Switch 
                checked={!animationsEnabled} 
                onCheckedChange={(v) => setAnimationsEnabled(!v)} 
              />
            </div>
          </div>
        </div>
      </SheetContent>
    </Sheet>
  );
}
