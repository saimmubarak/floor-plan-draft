import { Square, LampFloor, Layers } from 'lucide-react';
import { useFloorPlanStore } from '@/store/floorPlanStore';
import { createRectangle, createLShape, createUShape, generateShapeId } from '@/utils/shapeHelpers';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import type { Shape } from '@/types/floorplan';

const HOUSE_TEMPLATES = [
  { id: 'rectangular', label: 'Rectangular', icon: Square },
  { id: 'l-shaped', label: 'L-shaped', icon: LampFloor },
  { id: 'mirror-l', label: 'Mirror L', icon: LampFloor },
  { id: 'u-shaped', label: 'U-shaped', icon: Layers },
];

export const HouseStep = () => {
  const { addShape, setCurrentStep, setActiveTool } = useFloorPlanStore();

  const createHouse = (templateId: string) => {
    let shape: Shape;
    const center = { x: 50, y: 50 };

    switch (templateId) {
      case 'rectangular':
        shape = createRectangle(
          center,
          { width: 30, height: 40 },
          0.25,
          '#B83A3A',
          'building',
          { label: 'Rectangular house' }
        );
        break;

      case 'l-shaped': {
        const vertices = createLShape(center, 40, 40, 15, 15, false);
        shape = {
          id: generateShapeId(),
          type: 'polygon',
          layer: 'building',
          stroke_mm: 0.25,
          stroke_color: '#B83A3A',
          fill: null,
          vertices_ft: vertices,
          metadata: { createdBy: 'wizard', label: 'L-shaped house' },
        };
        break;
      }

      case 'mirror-l': {
        const vertices = createLShape(center, 40, 40, 15, 15, true);
        shape = {
          id: generateShapeId(),
          type: 'polygon',
          layer: 'building',
          stroke_mm: 0.25,
          stroke_color: '#B83A3A',
          fill: null,
          vertices_ft: vertices,
          metadata: { createdBy: 'wizard', label: 'Mirror L house' },
        };
        break;
      }

      case 'u-shaped': {
        const vertices = createUShape(center, 50, 40, 20, 25);
        shape = {
          id: generateShapeId(),
          type: 'polygon',
          layer: 'building',
          stroke_mm: 0.25,
          stroke_color: '#B83A3A',
          fill: null,
          vertices_ft: vertices,
          metadata: { createdBy: 'wizard', label: 'U-shaped house' },
        };
        break;
      }

      default:
        return;
    }

    addShape(shape);
  };

  const handleCustomDraw = () => {
    setActiveTool('polygon');
  };

  return (
    <div className="max-w-4xl mx-auto space-y-6">
      <div className="text-center space-y-2">
        <h2 className="text-3xl font-bold text-foreground">Tell us about the shape of your house</h2>
        <p className="text-muted-foreground">Choose a template or draw your own custom shape</p>
      </div>

      {/* House Templates */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        {HOUSE_TEMPLATES.map((template) => {
          const Icon = template.icon;
          return (
            <Card
              key={template.id}
              className="p-6 cursor-pointer hover:border-building transition-all hover:shadow-lg group"
              onClick={() => createHouse(template.id)}
            >
              <div className="flex flex-col items-center space-y-3">
                <div className="p-4 rounded-full bg-building/10 group-hover:bg-building/20 transition-colors">
                  <Icon className="w-8 h-8 text-building" />
                </div>
                <h3 className="text-lg font-semibold text-center">{template.label}</h3>
              </div>
            </Card>
          );
        })}
      </div>

      {/* Custom Draw */}
      <Card className="p-6">
        <div className="space-y-4">
          <h3 className="text-lg font-semibold">Custom Shape</h3>
          <p className="text-sm text-muted-foreground">
            Draw your own house shape with complete freedom
          </p>
          <Button onClick={handleCustomDraw} variant="outline" className="w-full">
            Use Custom Draw
          </Button>
        </div>
      </Card>

      {/* Navigation */}
      <div className="flex justify-between pt-4">
        <Button variant="outline" onClick={() => setCurrentStep('plot')}>
          Previous: Plot Size
        </Button>
        <Button onClick={() => setCurrentStep('details')}>
          Next: Details
        </Button>
      </div>

      {/* Hint */}
      <div className="text-center">
        <p className="text-sm text-muted-foreground">
          💡 Tip: Drag handles to position and stretch. Use numeric fields in the properties panel for exact measurements
        </p>
      </div>
    </div>
  );
};
