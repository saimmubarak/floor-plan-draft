import { Download, Save, FileJson } from 'lucide-react';
import { useFloorPlanStore } from '@/store/floorPlanStore';
import { getA2Dimensions, PLOT_SCALE } from '@/utils/scaling';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { useState } from 'react';
import { toast } from 'sonner';
import type { ExportMetadata } from '@/types/floorplan';

const DPI_OPTIONS = [96, 150, 300, 600];

export const ExportStep = () => {
  const { shapes, setCurrentStep } = useFloorPlanStore();
  const [selectedDPI, setSelectedDPI] = useState(300);

  const handleExportPNG = () => {
    const dimensions = getA2Dimensions(selectedDPI);
    
    const metadata: ExportMetadata = {
      dpi: selectedDPI,
      image_width_px: dimensions.width,
      image_height_px: dimensions.height,
      plot_scale: PLOT_SCALE,
      export_origin: { x: 0, y: 0 },
      timestamp: new Date().toISOString(),
    };

    // In a real implementation, this would render the canvas to PNG
    // For now, we'll show the export configuration
    console.log('Export PNG', { dimensions, metadata, shapes });
    toast.success(`Export configured for ${dimensions.width}×${dimensions.height}px @ ${selectedDPI} DPI`);
  };

  const handleExportMetadata = () => {
    const dimensions = getA2Dimensions(selectedDPI);
    
    const metadata: ExportMetadata = {
      dpi: selectedDPI,
      image_width_px: dimensions.width,
      image_height_px: dimensions.height,
      plot_scale: PLOT_SCALE,
      export_origin: { x: 0, y: 0 },
      timestamp: new Date().toISOString(),
    };

    const dataStr = JSON.stringify(metadata, null, 2);
    const dataBlob = new Blob([dataStr], { type: 'application/json' });
    const url = URL.createObjectURL(dataBlob);
    const link = document.createElement('a');
    link.href = url;
    link.download = `floorplan-metadata-${Date.now()}.json`;
    link.click();
    URL.revokeObjectURL(url);
    
    toast.success('Metadata JSON exported');
  };

  const handleSaveProject = () => {
    const projectData = {
      shapes,
      metadata: {
        created: new Date().toISOString(),
        modified: new Date().toISOString(),
        version: '1.0.0',
      },
    };

    const dataStr = JSON.stringify(projectData, null, 2);
    const dataBlob = new Blob([dataStr], { type: 'application/json' });
    const url = URL.createObjectURL(dataBlob);
    const link = document.createElement('a');
    link.href = url;
    link.download = `floorplan-project-${Date.now()}.json`;
    link.click();
    URL.revokeObjectURL(url);
    
    toast.success('Project saved');
  };

  const dimensions = getA2Dimensions(selectedDPI);

  return (
    <div className="max-w-4xl mx-auto space-y-6">
      <div className="text-center space-y-2">
        <h2 className="text-3xl font-bold text-foreground">Export and Save Your Floor Plan</h2>
        <p className="text-muted-foreground">Choose your export settings and download</p>
      </div>

      {/* Export Settings */}
      <Card className="p-6">
        <div className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="dpi">Export DPI</Label>
            <Select value={selectedDPI.toString()} onValueChange={(v) => setSelectedDPI(Number(v))}>
              <SelectTrigger id="dpi">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                {DPI_OPTIONS.map((dpi) => (
                  <SelectItem key={dpi} value={dpi.toString()}>
                    {dpi} DPI ({getA2Dimensions(dpi).width} × {getA2Dimensions(dpi).height} px)
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
            <p className="text-xs text-muted-foreground">
              Current: {dimensions.width} × {dimensions.height} pixels
            </p>
          </div>

          <div className="pt-4 space-y-3">
            <Button onClick={handleExportPNG} className="w-full" size="lg">
              <Download className="w-4 h-4 mr-2" />
              Export A2 PNG @ {selectedDPI} DPI
            </Button>
            
            <Button onClick={handleExportMetadata} variant="outline" className="w-full">
              <FileJson className="w-4 h-4 mr-2" />
              Export Metadata JSON
            </Button>
          </div>
        </div>
      </Card>

      {/* Save Project */}
      <Card className="p-6">
        <div className="space-y-4">
          <h3 className="text-lg font-semibold">Save Project</h3>
          <p className="text-sm text-muted-foreground">
            Save your work as a project file to continue editing later
          </p>
          <Button onClick={handleSaveProject} variant="secondary" className="w-full">
            <Save className="w-4 h-4 mr-2" />
            Save Project JSON
          </Button>
        </div>
      </Card>

      {/* Export Info */}
      <Card className="p-6 bg-muted/50">
        <div className="space-y-3">
          <h3 className="font-semibold">Export Details</h3>
          <ul className="space-y-2 text-sm text-muted-foreground">
            <li>• <strong>Plot Scale:</strong> {PLOT_SCALE}:1</li>
            <li>• <strong>A2 Physical Size:</strong> 420mm × 594mm</li>
            <li>• <strong>Export Origin:</strong> Top-left (0, 0)</li>
            <li>• <strong>Coordinate System:</strong> World units in feet</li>
            <li>• <strong>Metadata:</strong> Includes DPI, dimensions, and timestamp</li>
          </ul>
        </div>
      </Card>

      {/* Navigation */}
      <div className="flex justify-between pt-4">
        <Button variant="outline" onClick={() => setCurrentStep('details')}>
          Previous: Details
        </Button>
        <Button variant="outline" onClick={() => setCurrentStep('plot')}>
          Start New Plan
        </Button>
      </div>
    </div>
  );
};
