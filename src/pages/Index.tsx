import { WizardStepper } from '@/components/Wizard/WizardStepper';
import { PlotStep } from '@/components/Wizard/PlotStep';
import { HouseStep } from '@/components/Wizard/HouseStep';
import { DetailsStep } from '@/components/Wizard/DetailsStep';
import { ExportStep } from '@/components/Wizard/ExportStep';
import { MainToolbar } from '@/components/Toolbar/MainToolbar';
import { PropertiesPanel } from '@/components/Properties/PropertiesPanel';
import { useFloorPlanStore } from '@/store/floorPlanStore';
import * as React from 'react';

const FloorPlanCanvas = React.lazy(() => import('@/components/Canvas/FloorPlanCanvas').then(m => ({ default: m.FloorPlanCanvas })));

const Index = () => {
  const { currentStep } = useFloorPlanStore();

  const renderStep = () => {
    switch (currentStep) {
      case 'plot':
        return <PlotStep />;
      case 'house':
        return <HouseStep />;
      case 'details':
        return <DetailsStep />;
      case 'export':
        return <ExportStep />;
      default:
        return <PlotStep />;
    }
  };

  return (
    <div className="min-h-screen bg-background">
      {/* Header */}
      <header className="border-b border-border bg-card/50 backdrop-blur supports-[backdrop-filter]:bg-card/50">
        <div className="container mx-auto px-4 py-4">
          <h1 className="text-2xl font-bold text-primary">Floor Plan Wizard</h1>
          <p className="text-sm text-muted-foreground">Professional A2 floor plan creator with precise scaling</p>
        </div>
      </header>

      {/* Wizard Stepper */}
      <div className="border-b border-border bg-card">
        <div className="container mx-auto px-4">
          <WizardStepper />
        </div>
      </div>

      {/* Main Content */}
      <main className="container mx-auto px-4 py-6">
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
          {/* Left Panel - Wizard Steps */}
          <div className="lg:col-span-3 space-y-4">
            <div className="sticky top-6">
              {renderStep()}
            </div>
          </div>

          {/* Center - Canvas */}
          <div className="lg:col-span-6 space-y-4">
            <MainToolbar />
            <div className="aspect-[3/2]">
              <FloorPlanCanvas />
            </div>
          </div>

          {/* Right Panel - Properties */}
          <div className="lg:col-span-3 space-y-4">
            <div className="sticky top-6">
              <PropertiesPanel />
            </div>
          </div>
        </div>
      </main>

      {/* Footer */}
      <footer className="border-t border-border mt-12 py-6">
        <div className="container mx-auto px-4 text-center text-sm text-muted-foreground">
          <p>Plot Scale: 3.1:1 | World Units: feet | Export: A2 (420mm × 594mm)</p>
        </div>
      </footer>
    </div>
  );
};

export default Index;
