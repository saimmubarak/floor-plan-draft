/**
 * Scaling and coordinate conversion utilities for the Floor Plan Wizard
 * 
 * Core constants and formulas:
 * - World units: feet (ft)
 * - Stroke units: millimeters (mm)
 * - Plot scale: 3.1:1 (PLOT_SCALE = 3.1)
 * - Formula: pixels_per_foot = DPI / PLOT_SCALE
 * - A2 physical: 420mm × 594mm
 * - Stroke conversion: px = (stroke_mm / 25.4) * DPI
 */

export const PLOT_SCALE = 3.1;
export const MM_PER_INCH = 25.4;
export const A2_WIDTH_MM = 420;
export const A2_HEIGHT_MM = 594;

/**
 * Calculate pixels per foot for a given DPI
 * @param DPI - Dots per inch
 * @returns Number of pixels per foot
 */
export function pixelsPerFoot(DPI: number): number {
  return DPI / PLOT_SCALE;
}

/**
 * Calculate A2 dimensions in pixels for a given DPI
 * @param DPI - Dots per inch
 * @returns Width and height in pixels
 */
export function getA2Dimensions(DPI: number): { width: number; height: number } {
  const widthInches = A2_WIDTH_MM / MM_PER_INCH;
  const heightInches = A2_HEIGHT_MM / MM_PER_INCH;
  
  return {
    width: Math.round(widthInches * DPI),
    height: Math.round(heightInches * DPI),
  };
}

/**
 * Convert stroke width from millimeters to pixels
 * @param strokeMm - Stroke width in millimeters
 * @param DPI - Dots per inch
 * @returns Stroke width in pixels
 */
export function strokeMmToPx(strokeMm: number, DPI: number): number {
  return (strokeMm / MM_PER_INCH) * DPI;
}

/**
 * Convert world coordinates (feet) to export image coordinates (pixels)
 * This is the authoritative conversion for PNG/metadata export
 * 
 * @param point_ft - Point in world coordinates (feet)
 * @param DPI - Export DPI
 * @param exportOrigin - Origin point in export image (pixels)
 * @returns Point in export image coordinates (pixels)
 */
export function worldToExport(
  point_ft: { x: number; y: number },
  DPI: number,
  exportOrigin: { x: number; y: number }
): { x_px: number; y_px: number } {
  const ppf = pixelsPerFoot(DPI);
  return {
    x_px: exportOrigin.x + point_ft.x * ppf,
    y_px: exportOrigin.y + point_ft.y * ppf,
  };
}

/**
 * Convert export image coordinates (pixels) to world coordinates (feet)
 * Inverse of worldToExport
 * 
 * @param point_px - Point in export image coordinates (pixels)
 * @param DPI - Export DPI
 * @param exportOrigin - Origin point in export image (pixels)
 * @returns Point in world coordinates (feet)
 */
export function exportToWorld(
  point_px: { x: number; y: number },
  DPI: number,
  exportOrigin: { x: number; y: number }
): { x: number; y: number } {
  const ppf = pixelsPerFoot(DPI);
  return {
    x: (point_px.x - exportOrigin.x) / ppf,
    y: (point_px.y - exportOrigin.y) / ppf,
  };
}

/**
 * Convert world coordinates (feet) to canvas display coordinates (pixels)
 * Used for the editing view with pan/zoom
 * 
 * @param point_ft - Point in world coordinates (feet)
 * @param viewTransform - View transformation (scale, translateX, translateY)
 * @param editingDPI - DPI used for editing canvas (default 96)
 * @returns Point in canvas display coordinates (pixels)
 */
export function worldToCanvas(
  point_ft: { x: number; y: number },
  viewTransform: { scale: number; translateX: number; translateY: number },
  editingDPI = 96
): { x: number; y: number } {
  const ppf = pixelsPerFoot(editingDPI);
  const x_px_world = point_ft.x * ppf;
  const y_px_world = point_ft.y * ppf;
  return {
    x: x_px_world * viewTransform.scale + viewTransform.translateX,
    y: y_px_world * viewTransform.scale + viewTransform.translateY,
  };
}

/**
 * Convert canvas display coordinates (pixels) to world coordinates (feet)
 * Inverse of worldToCanvas
 * 
 * @param point_px - Point in canvas display coordinates (pixels)
 * @param viewTransform - View transformation (scale, translateX, translateY)
 * @param editingDPI - DPI used for editing canvas (default 96)
 * @returns Point in world coordinates (feet)
 */
export function canvasToWorld(
  point_px: { x: number; y: number },
  viewTransform: { scale: number; translateX: number; translateY: number },
  editingDPI = 96
): { x: number; y: number } {
  const ppf = pixelsPerFoot(editingDPI);
  const x_px_world = (point_px.x - viewTransform.translateX) / viewTransform.scale;
  const y_px_world = (point_px.y - viewTransform.translateY) / viewTransform.scale;
  return {
    x: x_px_world / ppf,
    y: y_px_world / ppf,
  };
}

/**
 * Calculate distance between two points in feet
 */
export function distance(p1: { x: number; y: number }, p2: { x: number; y: number }): number {
  const dx = p2.x - p1.x;
  const dy = p2.y - p1.y;
  return Math.sqrt(dx * dx + dy * dy);
}

/**
 * Snap a value to grid with given spacing and threshold
 */
export function snapToGrid(value: number, gridSpacing: number, threshold: number): number {
  const nearestGrid = Math.round(value / gridSpacing) * gridSpacing;
  if (Math.abs(value - nearestGrid) <= threshold) {
    return nearestGrid;
  }
  return value;
}

/**
 * Snap a point to grid
 */
export function snapPointToGrid(
  point: { x: number; y: number },
  gridSpacing: number,
  threshold: number
): { x: number; y: number; snapped: boolean } {
  const snappedX = snapToGrid(point.x, gridSpacing, threshold);
  const snappedY = snapToGrid(point.y, gridSpacing, threshold);
  const wasSnapped = snappedX !== point.x || snappedY !== point.y;
  
  return {
    x: snappedX,
    y: snappedY,
    snapped: wasSnapped,
  };
}
