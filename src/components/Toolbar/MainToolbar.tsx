import { MousePointer, Square, Pentagon, Minus, Pencil, Ruler, Eraser, Hand, Grid3x3, Magnet } from 'lucide-react';
import { useFloorPlanStore } from '@/store/floorPlanStore';
import { Button } from '@/components/ui/button';
import { Separator } from '@/components/ui/separator';
import { cn } from '@/lib/utils';
import type { ToolType } from '@/types/floorplan';

const TOOLS: { id: ToolType; icon: any; label: string; shortcut?: string }[] = [
  { id: 'select', icon: MousePointer, label: 'Select', shortcut: 'V' },
  { id: 'rectangle', icon: Square, label: 'Rectangle', shortcut: 'R' },
  { id: 'polygon', icon: Pentagon, label: 'Polygon', shortcut: 'P' },
  { id: 'line', icon: Minus, label: 'Line', shortcut: 'L' },
  { id: 'freehand', icon: Pencil, label: 'Freehand', shortcut: 'F' },
  { id: 'measure', icon: Ruler, label: 'Measure', shortcut: 'M' },
  { id: 'eraser', icon: Eraser, label: 'Eraser', shortcut: 'E' },
  { id: 'pan', icon: Hand, label: 'Pan', shortcut: 'Space' },
];

export const MainToolbar = () => {
  const { 
    activeTool, 
    setActiveTool, 
    toggleGrid, 
    toggleSnap, 
    showGrid,
    snapSettings,
    undo,
    redo 
  } = useFloorPlanStore();

  return (
    <div className="bg-card border border-border rounded-lg p-2 shadow-sm">
      <div className="flex items-center gap-1">
        {/* Drawing Tools */}
        {TOOLS.map((tool) => {
          const Icon = tool.icon;
          const isActive = activeTool === tool.id;
          
          return (
            <Button
              key={tool.id}
              variant={isActive ? "default" : "ghost"}
              size="icon"
              onClick={() => setActiveTool(tool.id)}
              title={`${tool.label}${tool.shortcut ? ` (${tool.shortcut})` : ''}`}
              className={cn(
                "relative",
                isActive && "bg-accent text-accent-foreground"
              )}
            >
              <Icon className="w-4 h-4" />
            </Button>
          );
        })}

        <Separator orientation="vertical" className="h-8 mx-1" />

        {/* Grid Toggle */}
        <Button
          variant={showGrid ? "default" : "ghost"}
          size="icon"
          onClick={toggleGrid}
          title="Toggle Grid (G)"
          className={cn(showGrid && "bg-accent text-accent-foreground")}
        >
          <Grid3x3 className="w-4 h-4" />
        </Button>

        {/* Snap Toggle */}
        <Button
          variant={snapSettings.enabled ? "default" : "ghost"}
          size="icon"
          onClick={toggleSnap}
          title="Toggle Snap (S)"
          className={cn(snapSettings.enabled && "bg-accent text-accent-foreground")}
        >
          <Magnet className="w-4 h-4" />
        </Button>

        <Separator orientation="vertical" className="h-8 mx-1" />

        {/* History */}
        <Button
          variant="ghost"
          size="sm"
          onClick={undo}
          title="Undo (Ctrl+Z)"
        >
          Undo
        </Button>
        <Button
          variant="ghost"
          size="sm"
          onClick={redo}
          title="Redo (Ctrl+Y)"
        >
          Redo
        </Button>
      </div>
    </div>
  );
};
