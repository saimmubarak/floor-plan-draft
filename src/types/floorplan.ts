/**
 * Type definitions for the Floor Plan Wizard
 */

export type ShapeType = 'rectangle' | 'polygon' | 'polyline' | 'freehand' | 'line';
export type LayerType = 'boundary' | 'building' | 'paths' | 'symbols';
export type ToolType = 'select' | 'rectangle' | 'polygon' | 'line' | 'freehand' | 'measure' | 'eraser' | 'pan';

export interface Point {
  x: number;
  y: number;
}

export interface Shape {
  id: string;
  type: ShapeType;
  layer: LayerType;
  stroke_mm: number;
  stroke_color: string;
  fill: string | null;
  vertices_ft: Point[];
  metadata: {
    createdBy?: string;
    label?: string;
    raw_position_ft?: Point;
    snapped_position_ft?: Point;
    [key: string]: any;
  };
}

export interface ViewTransform {
  scale: number;
  translateX: number;
  translateY: number;
}

export interface ExportMetadata {
  dpi: number;
  image_width_px: number;
  image_height_px: number;
  plot_scale: number;
  export_origin: Point;
  timestamp: string;
}

export interface ProjectData {
  shapes: Shape[];
  metadata: {
    created: string;
    modified: string;
    version: string;
  };
}

export type WizardStep = 'plot' | 'house' | 'details' | 'export';

export type PlotPreset = '1-kanal' | '10-marla' | '5-marla' | 'custom';
export type HouseTemplate = 'rectangular' | 'l-shaped' | 'mirror-l' | 'u-shaped' | 'custom';

export interface PlotDimensions {
  width: number;  // feet
  height: number; // feet
}

export interface GridSettings {
  enabled: boolean;
  spacing: number; // feet
  majorSpacing: number; // feet
}

export interface SnapSettings {
  enabled: boolean;
  mode: 'none' | 'grid' | 'geometry';
  threshold: number; // feet
}

export type HandleType = 
  | 'nw' | 'n' | 'ne' 
  | 'e' | 'se' | 's' 
  | 'sw' | 'w' | 'center'
  | 'rotate';

export interface TransformHandle {
  type: HandleType;
  position: Point; // world coordinates
}

export type TransformMode = 'scale-axis' | 'shear' | 'translate' | 'rotate' | null;
