import { useEffect, useState } from 'react';
import { MainToolbar } from '@/components/Toolbar/MainToolbar';

export const CanvasHost = () => {
  const [CanvasComp, setCanvasComp] = useState<null | (() => JSX.Element)>(null);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    let mounted = true;
    (async () => {
      try {
        // Try to dynamically import the FloorPlanCanvas. If react-konva is incompatible,
        // this import will throw and we show a graceful fallback instead of a blank screen.
        const mod = await import('./FloorPlanCanvas');
        if (!mounted) return;
        const Comp = () => mod.FloorPlanCanvas({} as any);
        setCanvasComp(() => Comp);
      } catch (e: any) {
        console.error('[CanvasHost] Failed to load FloorPlanCanvas:', e);
        setError(
          'High-performance canvas failed to load. This is likely due to a cached react-konva bundle. Please hard-refresh the preview. In the meantime, the UI remains usable.'
        );
      }
    })();
    return () => {
      mounted = false;
    };
  }, []);

  if (error) {
    return (
      <div className="w-full h-full border border-border rounded-lg bg-card/50 flex flex-col items-center justify-center p-6 text-center">
        <MainToolbar />
        <div className="mt-6 text-sm text-muted-foreground max-w-lg">
          {error}
        </div>
      </div>
    );
  }

  if (!CanvasComp) {
    return (
      <div className="w-full h-full border border-border rounded-lg bg-card/50 animate-pulse" />
    );
  }

  return <CanvasComp />;
};
