import type { Point, Shape, PlotDimensions } from '@/types/floorplan';
import { distance } from './scaling';

/**
 * Generate a unique shape ID
 */
export function generateShapeId(): string {
  return `shape_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
}

/**
 * Create a rectangle shape from dimensions
 */
export function createRectangle(
  center: Point,
  dimensions: PlotDimensions,
  strokeMm: number,
  strokeColor: string,
  layer: 'boundary' | 'building',
  metadata?: Record<string, any>
): Shape {
  const halfWidth = dimensions.width / 2;
  const halfHeight = dimensions.height / 2;
  
  return {
    id: generateShapeId(),
    type: 'rectangle',
    layer,
    stroke_mm: strokeMm,
    stroke_color: strokeColor,
    fill: null,
    vertices_ft: [
      { x: center.x - halfWidth, y: center.y - halfHeight }, // top-left
      { x: center.x + halfWidth, y: center.y - halfHeight }, // top-right
      { x: center.x + halfWidth, y: center.y + halfHeight }, // bottom-right
      { x: center.x - halfWidth, y: center.y + halfHeight }, // bottom-left
    ],
    metadata: {
      createdBy: 'wizard',
      ...metadata,
    },
  };
}

/**
 * Create an L-shaped building skeleton
 */
export function createLShape(
  center: Point,
  width: number,
  height: number,
  cutWidth: number,
  cutHeight: number,
  mirror: boolean = false
): Point[] {
  const hw = width / 2;
  const hh = height / 2;
  
  if (mirror) {
    // Mirror L shape
    return [
      { x: center.x - hw, y: center.y - hh },
      { x: center.x + hw, y: center.y - hh },
      { x: center.x + hw, y: center.y - hh + cutHeight },
      { x: center.x - hw + cutWidth, y: center.y - hh + cutHeight },
      { x: center.x - hw + cutWidth, y: center.y + hh },
      { x: center.x - hw, y: center.y + hh },
    ];
  } else {
    // Regular L shape
    return [
      { x: center.x - hw, y: center.y - hh },
      { x: center.x + hw, y: center.y - hh },
      { x: center.x + hw, y: center.y + hh },
      { x: center.x + hw - cutWidth, y: center.y + hh },
      { x: center.x + hw - cutWidth, y: center.y - hh + cutHeight },
      { x: center.x - hw, y: center.y - hh + cutHeight },
    ];
  }
}

/**
 * Create a U-shaped building skeleton
 */
export function createUShape(
  center: Point,
  width: number,
  height: number,
  innerWidth: number,
  innerHeight: number
): Point[] {
  const hw = width / 2;
  const hh = height / 2;
  const hiw = innerWidth / 2;
  const hih = innerHeight / 2;
  
  return [
    { x: center.x - hw, y: center.y - hh },
    { x: center.x + hw, y: center.y - hh },
    { x: center.x + hw, y: center.y + hh },
    { x: center.x + hiw, y: center.y + hh },
    { x: center.x + hiw, y: center.y - hh + innerHeight },
    { x: center.x - hiw, y: center.y - hh + innerHeight },
    { x: center.x - hiw, y: center.y + hh },
    { x: center.x - hw, y: center.y + hh },
  ];
}

/**
 * Calculate the bounds of a shape
 */
export function getShapeBounds(shape: Shape): {
  minX: number;
  minY: number;
  maxX: number;
  maxY: number;
  width: number;
  height: number;
  center: Point;
} {
  const xs = shape.vertices_ft.map(v => v.x);
  const ys = shape.vertices_ft.map(v => v.y);
  
  const minX = Math.min(...xs);
  const maxX = Math.max(...xs);
  const minY = Math.min(...ys);
  const maxY = Math.max(...ys);
  
  return {
    minX,
    minY,
    maxX,
    maxY,
    width: maxX - minX,
    height: maxY - minY,
    center: {
      x: (minX + maxX) / 2,
      y: (minY + maxY) / 2,
    },
  };
}

/**
 * Calculate edge lengths of a shape
 */
export function getEdgeLengths(vertices: Point[]): number[] {
  const lengths: number[] = [];
  for (let i = 0; i < vertices.length; i++) {
    const next = (i + 1) % vertices.length;
    lengths.push(distance(vertices[i], vertices[next]));
  }
  return lengths;
}

/**
 * Get midpoint of an edge
 */
export function getEdgeMidpoint(p1: Point, p2: Point): Point {
  return {
    x: (p1.x + p2.x) / 2,
    y: (p1.y + p2.y) / 2,
  };
}

/**
 * Translate all vertices by a delta
 */
export function translateVertices(vertices: Point[], delta: Point): Point[] {
  return vertices.map(v => ({
    x: v.x + delta.x,
    y: v.y + delta.y,
  }));
}

/**
 * Format feet value for display (2 decimal places)
 */
export function formatFeet(feet: number): string {
  return feet.toFixed(2);
}
