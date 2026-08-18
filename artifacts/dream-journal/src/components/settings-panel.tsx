import React from 'react';
import { useLocation } from 'wouter';
import {
  Sheet,
  SheetContent,
  SheetDescription,
  SheetHeader,
  SheetTitle,
  SheetTrigger,
} from "@/components/ui/sheet";
import { Button } from "@/components/ui/button";
import { Switch } from "@/components/ui/switch";
import { Settings, Moon, Sun, Vibrate, ZapOff, Archive, ChevronRight, Check, FolderOpen } from "lucide-react";
import { useTheme } from "@/components/theme-provider";
import { useSettings } from "@/contexts/settings-context";
import { haptic } from "@/lib/haptics";
import { COLOR_THEMES } from "@/lib/color-themes";
import { useToast } from "@/hooks/use-toast";

type SettingsPanelProps = { isMobile?: boolean };

export default function SettingsPanel({ isMobile }: SettingsPanelProps) {
  const { theme, setTheme } = useTheme();
  const {
    hapticEnabled,
    setHapticEnabled,
    animationsEnabled,
    setAnimationsEnabled,
    colorTheme,
    setColorTheme,
    storageSupported,
    storageFolderName,
    chooseStorageFolder,
  } = useSettings();
  const [, setLocation] = useLocation();
  const [open, setOpen] = React.useState(false);
  const [isChoosingFolder, setIsChoosingFolder] = React.useState(false);
  const { toast } = useToast();

  const hasVibrate = typeof navigator !== 'undefined' && 'vibrate' in navigator;

  function goToArchived() {
    haptic('tap');
    setOpen(false);
    // Let the sheet close before navigating for a smoother feel
    setTimeout(() => setLocation('/archived'), 150);
  }

  async function handleChooseFolder() {
    haptic('tap');
    setIsChoosingFolder(true);
    try {
      const folderName = await chooseStorageFolder();
      if (folderName) {
        toast({
          title: "Storage folder connected",
          description: `New and edited dreams will be backed up to ${folderName}.`,
        });
      }
    } catch {
      toast({
        variant: "destructive",
        title: "Folder access unavailable",
        description: "Your journal is still saved normally. Try choosing the folder again.",
      });
    } finally {
      setIsChoosingFolder(false);
    }
  }

  return (
    <Sheet open={open} onOpenChange={setOpen}>
      <SheetTrigger asChild>
        {isMobile ? (
          <button
            className="flex flex-col items-center p-2 rounded-lg transition-colors text-muted-foreground hover:text-foreground"
            onClick={() => haptic('tap')}
          >
            <div className="p-1 rounded-full">
              <Settings className="w-6 h-6" />
            </div>
            <span className="text-[10px] mt-1 font-medium">Settings</span>
          </button>
        ) : (
          <Button
            variant="ghost"
            size="icon"
            className="text-muted-foreground hover:text-foreground"
            onClick={() => haptic('tap')}
          >
            <Settings className="w-5 h-5" />
          </Button>
        )}
      </SheetTrigger>

      <SheetContent
        className="bg-card/95 backdrop-blur-xl border-l border-border/60 flex flex-col w-80"
        style={{ paddingTop: 'max(1.5rem, env(safe-area-inset-top))' }}
      >
        <SheetHeader className="mb-6">
          <SheetTitle className="font-serif text-2xl tracking-wide">Settings</SheetTitle>
          <SheetDescription className="font-light">
            Adjust your experience in the dream space.
          </SheetDescription>
        </SheetHeader>

        <div className="flex-1 space-y-8 overflow-y-auto">
          {/* Appearance */}
          <div className="space-y-4">
            <h3 className="text-xs font-mono tracking-widest text-primary uppercase">Appearance</h3>
            <div className="grid grid-cols-2 gap-3">
              <Button
                variant={theme === 'light' ? 'default' : 'outline'}
                className={`justify-start gap-2 ${theme === 'light' ? 'dream-glow' : 'border-border/60'}`}
                onClick={() => { haptic('tap'); setTheme('light'); }}
              >
                <Sun className="w-4 h-4" />
                Light
              </Button>
              <Button
                variant={theme === 'dark' ? 'default' : 'outline'}
                className={`justify-start gap-2 ${theme === 'dark' ? 'dream-glow' : 'border-border/60'}`}
                onClick={() => { haptic('tap'); setTheme('dark'); }}
              >
                <Moon className="w-4 h-4" />
                Dark
              </Button>
            </div>

            <div className="space-y-3 pt-2">
              <div>
                <p className="text-sm font-medium text-foreground">Color palette</p>
                <p className="text-xs text-muted-foreground mt-1">
                  A little atmosphere for every page.
                </p>
              </div>
              <div className="grid grid-cols-2 gap-2">
                {COLOR_THEMES.map((palette) => {
                  const isSelected = colorTheme === palette.value;
                  return (
                    <button
                      key={palette.value}
                      type="button"
                      aria-pressed={isSelected}
                      title={palette.description}
                      onClick={() => {
                        haptic('tap');
                        setColorTheme(palette.value);
                      }}
                      className={`relative text-left rounded-xl border p-2.5 transition-all duration-200 ${
                        isSelected
                          ? 'border-primary bg-primary/10 ring-1 ring-primary/40'
                          : 'border-border/60 bg-muted/20 hover:bg-muted/40 hover:border-border'
                      }`}
                    >
                      <div className="flex items-center gap-1.5 mb-2">
                        {palette.swatches.map((swatch) => (
                          <span
                            key={swatch}
                            className="h-4 w-4 rounded-full border border-black/10 dark:border-white/15"
                            style={{ backgroundColor: swatch }}
                          />
                        ))}
                      </div>
                      <p className="text-[11px] leading-tight font-medium text-foreground pr-4">
                        {palette.label}
                      </p>
                      {isSelected && (
                        <Check className="absolute right-2.5 bottom-2.5 w-3.5 h-3.5 text-primary" />
                      )}
                    </button>
                  );
                })}
              </div>
            </div>
          </div>

          {/* Haptic Feedback */}
          <div className="space-y-4">
            <h3 className="text-xs font-mono tracking-widest text-primary uppercase">Haptic Feedback</h3>
            <div className="flex items-center justify-between">
              <div className="space-y-0.5">
                <div className="flex items-center gap-2 text-foreground font-medium">
                  <Vibrate className="w-4 h-4" />
                  <span>Vibration</span>
                </div>
                <p className="text-xs text-muted-foreground">Vibration on interactions</p>
                {!hasVibrate && (
                  <p className="text-[10px] text-destructive mt-1">Not supported on this device</p>
                )}
              </div>
              <Switch
                checked={hapticEnabled}
                onCheckedChange={(v) => { haptic('tap'); setHapticEnabled(v); }}
                disabled={!hasVibrate}
              />
            </div>
          </div>

          {/* Low Power */}
          <div className="space-y-4">
            <h3 className="text-xs font-mono tracking-widest text-primary uppercase">Local Backups</h3>
            {storageSupported ? (
              <div className="space-y-3">
                <div className="flex items-start gap-3">
                  <div className="w-8 h-8 rounded-lg bg-primary/10 flex items-center justify-center shrink-0">
                    <FolderOpen className="w-4 h-4 text-primary" />
                  </div>
                  <div className="space-y-1">
                    <p className="text-sm font-medium text-foreground">
                      {storageFolderName ? `Saving to ${storageFolderName}` : "Choose a storage folder"}
                    </p>
                    <p className="text-xs text-muted-foreground">
                      Keep a JSON backup of every new or edited dream in a folder you control.
                    </p>
                  </div>
                </div>
                <Button
                  variant="outline"
                  className="w-full justify-center gap-2 border-border/60"
                  onClick={handleChooseFolder}
                  disabled={isChoosingFolder}
                >
                  <FolderOpen className="w-4 h-4" />
                  {isChoosingFolder ? "Waiting for permission…" : storageFolderName ? "Change folder" : "Allow folder access"}
                </Button>
              </div>
            ) : (
              <p className="text-xs leading-relaxed text-muted-foreground">
                Folder backups are not supported by this browser. Your dreams will continue to save securely in the journal.
              </p>
            )}
          </div>

          {/* Low Power */}
          <div className="space-y-4">
            <h3 className="text-xs font-mono tracking-widest text-primary uppercase">Performance</h3>
            <div className="flex items-center justify-between">
              <div className="space-y-0.5">
                <div className="flex items-center gap-2 text-foreground font-medium">
                  <ZapOff className="w-4 h-4" />
                  <span>Reduce Motion</span>
                </div>
                <p className="text-xs text-muted-foreground">Disables ambient animations</p>
              </div>
              <Switch
                checked={!animationsEnabled}
                onCheckedChange={(v) => { haptic('tap'); setAnimationsEnabled(!v); }}
              />
            </div>
          </div>

          {/* Divider */}
          <div className="h-px bg-border/50" />

          {/* Archived Dreams */}
          <div className="space-y-3">
            <h3 className="text-xs font-mono tracking-widest text-primary uppercase">Library</h3>
            <button
              onClick={goToArchived}
              className="w-full flex items-center justify-between px-4 py-3 rounded-xl border border-border/60 bg-muted/20 hover:bg-muted/40 hover:border-border active:scale-[0.98] transition-all duration-150 group"
            >
              <div className="flex items-center gap-3">
                <div className="w-8 h-8 rounded-lg bg-amber-500/10 flex items-center justify-center">
                  <Archive className="w-4 h-4 text-amber-600 dark:text-amber-400" />
                </div>
                <div className="text-left">
                  <p className="text-sm font-medium text-foreground">Archived Dreams</p>
                  <p className="text-[11px] text-muted-foreground">View, edit, and restore</p>
                </div>
              </div>
              <ChevronRight className="w-4 h-4 text-muted-foreground group-hover:text-foreground transition-colors" />
            </button>
          </div>
        </div>
      </SheetContent>
    </Sheet>
  );
}
