import { Pencil, Minus, Eraser, Hand } from 'lucide-react';
import { useFloorPlanStore } from '@/store/floorPlanStore';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { cn } from '@/lib/utils';
import type { ToolType } from '@/types/floorplan';

const DETAIL_TOOLS: { id: ToolType; label: string; icon: any; description: string }[] = [
  { id: 'line', label: 'Line', icon: Minus, description: 'Draw walls and paths' },
  { id: 'freehand', label: 'Freehand', icon: Pencil, description: 'Draw custom shapes' },
  { id: 'eraser', label: 'Eraser', icon: Eraser, description: 'Remove elements' },
  { id: 'pan', label: 'Pan', icon: Hand, description: 'Move the canvas' },
];

export const DetailsStep = () => {
  const { activeTool, setActiveTool, setCurrentStep } = useFloorPlanStore();

  return (
    <div className="max-w-4xl mx-auto space-y-6">
      <div className="text-center space-y-2">
        <h2 className="text-3xl font-bold text-foreground">Add walls, paths, and details</h2>
        <p className="text-muted-foreground">Use the tools below to refine your floor plan</p>
      </div>

      {/* Drawing Tools */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        {DETAIL_TOOLS.map((tool) => {
          const Icon = tool.icon;
          const isActive = activeTool === tool.id;
          
          return (
            <Card
              key={tool.id}
              className={cn(
                "p-6 cursor-pointer transition-all hover:shadow-lg",
                isActive ? "border-accent bg-accent/10" : "hover:border-accent/50"
              )}
              onClick={() => setActiveTool(tool.id)}
            >
              <div className="flex flex-col items-center space-y-3">
                <div
                  className={cn(
                    "p-4 rounded-full transition-colors",
                    isActive ? "bg-accent text-accent-foreground" : "bg-muted"
                  )}
                >
                  <Icon className="w-6 h-6" />
                </div>
                <h3 className="text-base font-semibold text-center">{tool.label}</h3>
                <p className="text-xs text-muted-foreground text-center">{tool.description}</p>
              </div>
            </Card>
          );
        })}
      </div>

      {/* Instructions */}
      <Card className="p-6 bg-muted/50">
        <div className="space-y-3">
          <h3 className="font-semibold">Drawing Tips</h3>
          <ul className="space-y-2 text-sm text-muted-foreground">
            <li>• Use the <strong>Line tool</strong> to draw straight walls and boundaries</li>
            <li>• Use <strong>Freehand</strong> for curved paths and custom details</li>
            <li>• Press <strong>Space</strong> to toggle Pan mode temporarily</li>
            <li>• Hold <strong>Shift</strong> to constrain lines to horizontal/vertical</li>
            <li>• Click existing shapes to select and edit them</li>
          </ul>
        </div>
      </Card>

      {/* Navigation */}
      <div className="flex justify-between pt-4">
        <Button variant="outline" onClick={() => setCurrentStep('house')}>
          Previous: House Shape
        </Button>
        <Button onClick={() => setCurrentStep('export')}>
          Next: Export/Save
        </Button>
      </div>
    </div>
  );
};
