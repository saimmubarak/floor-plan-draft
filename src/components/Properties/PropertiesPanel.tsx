import { useFloorPlanStore } from '@/store/floorPlanStore';
import { Card } from '@/components/ui/card';
import { Label } from '@/components/ui/label';
import { Input } from '@/components/ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { getShapeBounds } from '@/utils/shapeHelpers';

export const PropertiesPanel = () => {
  const { shapes, selectedShapeIds, updateShape } = useFloorPlanStore();

  const selectedShape = selectedShapeIds.length === 1 
    ? shapes.find(s => s.id === selectedShapeIds[0]) 
    : null;

  if (!selectedShape) {
    return (
      <Card className="p-6">
        <div className="text-center text-muted-foreground">
          <p>Select a shape to edit its properties</p>
        </div>
      </Card>
    );
  }

  const bounds = getShapeBounds(selectedShape);

  return (
    <Card className="p-6">
      <div className="space-y-6">
        <div>
          <h3 className="text-lg font-semibold mb-4">Properties</h3>
        </div>

        {/* Dimensions */}
        <div className="space-y-3">
          <h4 className="text-sm font-medium text-muted-foreground">Dimensions</h4>
          
          <div className="space-y-2">
            <Label htmlFor="width">Width (ft)</Label>
            <Input
              id="width"
              type="number"
              value={bounds.width.toFixed(2)}
              readOnly
              className="bg-muted"
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="height">Height (ft)</Label>
            <Input
              id="height"
              type="number"
              value={bounds.height.toFixed(2)}
              readOnly
              className="bg-muted"
            />
          </div>

          <div className="text-xs text-muted-foreground">
            Area: {(bounds.width * bounds.height).toFixed(2)} sq ft
          </div>
        </div>

        {/* Stroke */}
        <div className="space-y-3">
          <h4 className="text-sm font-medium text-muted-foreground">Stroke</h4>
          
          <div className="space-y-2">
            <Label htmlFor="stroke-width">Width (mm)</Label>
            <Input
              id="stroke-width"
              type="number"
              value={selectedShape.stroke_mm}
              onChange={(e) => updateShape(selectedShape.id, { stroke_mm: Number(e.target.value) })}
              step={0.05}
              min={0.1}
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="stroke-color">Color</Label>
            <Input
              id="stroke-color"
              type="color"
              value={selectedShape.stroke_color}
              onChange={(e) => updateShape(selectedShape.id, { stroke_color: e.target.value })}
            />
          </div>
        </div>

        {/* Layer */}
        <div className="space-y-2">
          <Label htmlFor="layer">Layer</Label>
          <Select
            value={selectedShape.layer}
            onValueChange={(value: any) => updateShape(selectedShape.id, { layer: value })}
          >
            <SelectTrigger id="layer">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="boundary">Boundary</SelectItem>
              <SelectItem value="building">Building</SelectItem>
              <SelectItem value="paths">Paths</SelectItem>
              <SelectItem value="symbols">Symbols</SelectItem>
            </SelectContent>
          </Select>
        </div>

        {/* Metadata */}
        <div className="space-y-2">
          <Label htmlFor="label">Label</Label>
          <Input
            id="label"
            type="text"
            value={selectedShape.metadata.label || ''}
            onChange={(e) => updateShape(selectedShape.id, {
              metadata: { ...selectedShape.metadata, label: e.target.value }
            })}
            placeholder="Add a label..."
          />
        </div>
      </div>
    </Card>
  );
};
