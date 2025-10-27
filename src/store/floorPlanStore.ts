import { create } from 'zustand';
import { immer } from 'zustand/middleware/immer';
import type { 
  Shape, 
  ViewTransform, 
  WizardStep, 
  ToolType,
  GridSettings,
  SnapSettings,
  TransformMode
} from '@/types/floorplan';

interface FloorPlanState {
  // Canvas state
  shapes: Shape[];
  selectedShapeIds: string[];
  viewTransform: ViewTransform;
  
  // Wizard state
  currentStep: WizardStep;
  
  // Tool state
  activeTool: ToolType;
  transformMode: TransformMode;
  
  // Settings
  gridSettings: GridSettings;
  snapSettings: SnapSettings;
  
  // History
  history: Shape[][];
  historyIndex: number;
  
  // UI state
  isPanMode: boolean;
  showGrid: boolean;
  
  // Actions
  addShape: (shape: Shape) => void;
  updateShape: (id: string, updates: Partial<Shape>) => void;
  deleteShape: (id: string) => void;
  selectShape: (id: string, multiSelect?: boolean) => void;
  clearSelection: () => void;
  
  setViewTransform: (transform: Partial<ViewTransform>) => void;
  setCurrentStep: (step: WizardStep) => void;
  setActiveTool: (tool: ToolType) => void;
  setTransformMode: (mode: TransformMode) => void;
  
  toggleGrid: () => void;
  toggleSnap: () => void;
  togglePanMode: () => void;
  
  updateGridSettings: (settings: Partial<GridSettings>) => void;
  updateSnapSettings: (settings: Partial<SnapSettings>) => void;
  
  undo: () => void;
  redo: () => void;
  saveToHistory: () => void;
  
  reset: () => void;
}

const initialState = {
  shapes: [],
  selectedShapeIds: [],
  viewTransform: {
    scale: 1,
    translateX: 0,
    translateY: 0,
  },
  currentStep: 'plot' as WizardStep,
  activeTool: 'select' as ToolType,
  transformMode: null as TransformMode,
  gridSettings: {
    enabled: true,
    spacing: 1, // 1 foot
    majorSpacing: 10, // 10 feet
  },
  snapSettings: {
    enabled: true,
    mode: 'grid' as const,
    threshold: 0.5, // 0.5 feet
  },
  history: [] as Shape[][],
  historyIndex: -1,
  isPanMode: false,
  showGrid: true,
};

export const useFloorPlanStore = create<FloorPlanState>()(
  immer((set) => ({
    ...initialState,

    addShape: (shape) =>
      set((state) => {
        state.shapes.push(shape);
        state.saveToHistory();
      }),

    updateShape: (id, updates) =>
      set((state) => {
        const index = state.shapes.findIndex((s) => s.id === id);
        if (index !== -1) {
          state.shapes[index] = { ...state.shapes[index], ...updates };
        }
      }),

    deleteShape: (id) =>
      set((state) => {
        state.shapes = state.shapes.filter((s) => s.id !== id);
        state.selectedShapeIds = state.selectedShapeIds.filter((sid) => sid !== id);
        state.saveToHistory();
      }),

    selectShape: (id, multiSelect = false) =>
      set((state) => {
        if (multiSelect) {
          if (state.selectedShapeIds.includes(id)) {
            state.selectedShapeIds = state.selectedShapeIds.filter((sid) => sid !== id);
          } else {
            state.selectedShapeIds.push(id);
          }
        } else {
          state.selectedShapeIds = [id];
        }
      }),

    clearSelection: () =>
      set((state) => {
        state.selectedShapeIds = [];
      }),

    setViewTransform: (transform) =>
      set((state) => {
        state.viewTransform = { ...state.viewTransform, ...transform };
      }),

    setCurrentStep: (step) =>
      set((state) => {
        state.currentStep = step;
      }),

    setActiveTool: (tool) =>
      set((state) => {
        state.activeTool = tool;
        if (tool !== 'select') {
          state.selectedShapeIds = [];
        }
      }),

    setTransformMode: (mode) =>
      set((state) => {
        state.transformMode = mode;
      }),

    toggleGrid: () =>
      set((state) => {
        state.showGrid = !state.showGrid;
      }),

    toggleSnap: () =>
      set((state) => {
        state.snapSettings.enabled = !state.snapSettings.enabled;
      }),

    togglePanMode: () =>
      set((state) => {
        state.isPanMode = !state.isPanMode;
      }),

    updateGridSettings: (settings) =>
      set((state) => {
        state.gridSettings = { ...state.gridSettings, ...settings };
      }),

    updateSnapSettings: (settings) =>
      set((state) => {
        state.snapSettings = { ...state.snapSettings, ...settings };
      }),

    undo: () =>
      set((state) => {
        if (state.historyIndex > 0) {
          state.historyIndex--;
          state.shapes = JSON.parse(JSON.stringify(state.history[state.historyIndex]));
        }
      }),

    redo: () =>
      set((state) => {
        if (state.historyIndex < state.history.length - 1) {
          state.historyIndex++;
          state.shapes = JSON.parse(JSON.stringify(state.history[state.historyIndex]));
        }
      }),

    saveToHistory: () =>
      set((state) => {
        const newHistory = state.history.slice(0, state.historyIndex + 1);
        newHistory.push(JSON.parse(JSON.stringify(state.shapes)));
        state.history = newHistory;
        state.historyIndex = newHistory.length - 1;
      }),

    reset: () => set(initialState),
  }))
);
