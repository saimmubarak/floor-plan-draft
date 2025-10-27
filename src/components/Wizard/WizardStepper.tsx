import { Check } from 'lucide-react';
import { useFloorPlanStore } from '@/store/floorPlanStore';
import type { WizardStep } from '@/types/floorplan';
import { cn } from '@/lib/utils';

const steps: { id: WizardStep; label: string; number: number }[] = [
  { id: 'plot', label: 'Plot Size', number: 1 },
  { id: 'house', label: 'House Shape', number: 2 },
  { id: 'details', label: 'Details', number: 3 },
  { id: 'export', label: 'Export/Save', number: 4 },
];

export const WizardStepper = () => {
  const { currentStep, setCurrentStep } = useFloorPlanStore();
  
  const currentStepIndex = steps.findIndex(s => s.id === currentStep);

  return (
    <div className="w-full py-6">
      <div className="flex items-center justify-between max-w-4xl mx-auto">
        {steps.map((step, index) => {
          const isCompleted = index < currentStepIndex;
          const isCurrent = index === currentStepIndex;
          const isLast = index === steps.length - 1;

          return (
            <div key={step.id} className="flex items-center flex-1">
              <button
                onClick={() => setCurrentStep(step.id)}
                className={cn(
                  "flex flex-col items-center group transition-all",
                  isCurrent && "scale-110"
                )}
              >
                <div
                  className={cn(
                    "w-12 h-12 rounded-full flex items-center justify-center font-semibold transition-all",
                    "border-2",
                    isCompleted && "bg-accent border-accent text-accent-foreground",
                    isCurrent && "bg-primary border-primary text-primary-foreground shadow-lg",
                    !isCompleted && !isCurrent && "bg-muted border-muted-foreground/30 text-muted-foreground"
                  )}
                >
                  {isCompleted ? (
                    <Check className="w-6 h-6" />
                  ) : (
                    <span className="text-lg">{step.number}</span>
                  )}
                </div>
                <span
                  className={cn(
                    "mt-2 text-sm font-medium transition-colors",
                    isCurrent && "text-primary",
                    !isCurrent && "text-muted-foreground"
                  )}
                >
                  {step.label}
                </span>
              </button>

              {!isLast && (
                <div className="flex-1 h-0.5 mx-4 bg-border">
                  <div
                    className={cn(
                      "h-full transition-all duration-500",
                      isCompleted ? "bg-accent w-full" : "bg-transparent w-0"
                    )}
                  />
                </div>
              )}
            </div>
          );
        })}
      </div>
    </div>
  );
};
