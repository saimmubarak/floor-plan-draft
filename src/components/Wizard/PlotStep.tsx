import { Square } from 'lucide-react';
import { useFloorPlanStore } from '@/store/floorPlanStore';
import { createRectangle } from '@/utils/shapeHelpers';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { useState } from 'react';

const PLOT_PRESETS = [
  { id: '1-kanal', label: '1 Kanal', dimensions: { width: 50, height: 90 } },
  { id: '10-marla', label: '10 Marla', dimensions: { width: 35, height: 65 } },
  { id: '5-marla', label: '5 Marla', dimensions: { width: 25, height: 45 } },
];

export const PlotStep = () => {
  const { addShape, setCurrentStep, setActiveTool } = useFloorPlanStore();
  const [customWidth, setCustomWidth] = useState(50);
  const [customHeight, setCustomHeight] = useState(90);

  const createPlot = (width: number, height: number, label: string) => {
    const plot = createRectangle(
      { x: width / 2 + 20, y: height / 2 + 20 }, // Offset from origin
      { width, height },
      0.25,
      '#0A2B5A',
      'boundary',
      { label }
    );
    
    addShape(plot);
  };

  const handlePresetClick = (preset: typeof PLOT_PRESETS[0]) => {
    createPlot(preset.dimensions.width, preset.dimensions.height, preset.label);
  };

  const handleCustomCreate = () => {
    createPlot(customWidth, customHeight, 'Custom plot');
  };

  const handleCustomDraw = () => {
    setActiveTool('rectangle');
  };

  return (
    <div className="max-w-4xl mx-auto space-y-6">
      <div className="text-center space-y-2">
        <h2 className="text-3xl font-bold text-foreground">Guide us on how big your plot is</h2>
        <p className="text-muted-foreground">Choose a preset plot size or create your own</p>
      </div>

      {/* Preset Plots */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        {PLOT_PRESETS.map((preset) => (
          <Card
            key={preset.id}
            className="p-6 cursor-pointer hover:border-accent transition-all hover:shadow-lg group"
            onClick={() => handlePresetClick(preset)}
          >
            <div className="flex flex-col items-center space-y-3">
              <div className="p-4 rounded-full bg-primary/10 group-hover:bg-primary/20 transition-colors">
                <Square className="w-8 h-8 text-primary" />
              </div>
              <h3 className="text-xl font-semibold">{preset.label}</h3>
              <p className="text-sm text-muted-foreground">
                {preset.dimensions.width} ft × {preset.dimensions.height} ft
              </p>
              <p className="text-xs text-muted-foreground">
                {preset.dimensions.width * preset.dimensions.height} sq ft
              </p>
            </div>
          </Card>
        ))}
      </div>

      {/* Custom Plot */}
      <Card className="p-6">
        <div className="space-y-4">
          <h3 className="text-lg font-semibold">Custom Dimensions</h3>
          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="width">Width (feet)</Label>
              <Input
                id="width"
                type="number"
                value={customWidth}
                onChange={(e) => setCustomWidth(Number(e.target.value))}
                min={10}
                max={200}
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="height">Height (feet)</Label>
              <Input
                id="height"
                type="number"
                value={customHeight}
                onChange={(e) => setCustomHeight(Number(e.target.value))}
                min={10}
                max={200}
              />
            </div>
          </div>
          <div className="flex gap-3">
            <Button onClick={handleCustomCreate} className="flex-1">
              Create {customWidth} × {customHeight} ft Plot
            </Button>
            <Button onClick={handleCustomDraw} variant="outline" className="flex-1">
              Use Custom Draw
            </Button>
          </div>
        </div>
      </Card>

      {/* Navigation */}
      <div className="flex justify-between pt-4">
        <Button variant="outline" disabled>
          Previous
        </Button>
        <Button onClick={() => setCurrentStep('house')}>
          Next: House Shape
        </Button>
      </div>

      {/* Hint */}
      <div className="text-center">
        <p className="text-sm text-muted-foreground">
          💡 Tip: After creating a plot, drag the handles to resize or use the properties panel for exact dimensions
        </p>
      </div>
    </div>
  );
};
