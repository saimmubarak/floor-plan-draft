# Floor Plan Wizard - Technical Documentation

## Overview

A production-quality React TypeScript SPA for creating precise floor plans on A2 sheets with accurate scaling, transform handles, and export capabilities.

## Core Constants & Formulas

- **World units**: feet (ft)
- **Stroke units**: millimeters (mm)  
- **Plot scale**: 3.1:1 (canonical)
- **Formula**: `pixels_per_foot = DPI / 3.1`
- **A2 physical size**: 420mm × 594mm
- **Stroke conversion**: `px = (stroke_mm / 25.4) * DPI`

## Coordinate System

All geometry is stored in **world coordinates (feet)**. The system provides three coordinate spaces:

1. **World coordinates (feet)** - Storage format for all shapes
2. **Export coordinates (pixels)** - For PNG export at selected DPI
3. **Canvas coordinates (pixels)** - For editing view with pan/zoom

### Conversion Functions

All conversion utilities are in `src/utils/scaling.ts`:

```typescript
// Core conversion functions
pixelsPerFoot(DPI: number): number
worldToExport(point_ft, DPI, exportOrigin): { x_px, y_px }
exportToWorld(point_px, DPI, exportOrigin): { x, y }
worldToCanvas(point_ft, viewTransform, editingDPI): { x, y }
canvasToWorld(point_px, viewTransform, editingDPI): { x, y }
```

## Export Details

### Export at 300 DPI (recommended)
- **Image dimensions**: 4961px × 7016px
- **Pixels per foot**: ~96.77 px/ft
- **Default stroke (0.25mm)**: ~2.95 px

### Export Metadata JSON

Every export includes a metadata JSON file:

```json
{
  "dpi": 300,
  "image_width_px": 4961,
  "image_height_px": 7016,
  "plot_scale": 3.1,
  "export_origin": { "x": 0, "y": 0 },
  "timestamp": "2025-01-15T10:30:00.000Z"
}
```

**Export origin**: Top-left corner (0, 0) for all exports. This ensures consistent coordinate mapping for future CSV/YOLO integrations.

## Data Model

All shapes are stored with world coordinates in feet:

```typescript
{
  id: "shape_123",
  type: "rectangle" | "polygon" | "polyline" | "freehand" | "line",
  layer: "boundary" | "building" | "paths" | "symbols",
  stroke_mm: 0.25,
  stroke_color: "#0A2B5A",
  fill: null,
  vertices_ft: [
    { x: 0, y: 0 },
    { x: 50, y: 0 },
    { x: 50, y: 90 },
    { x: 0, y: 90 }
  ],
  metadata: {
    createdBy: "wizard",
    label: "1 kanal plot"
  }
}
```

## Transform System

The app implements three types of transforms:

### 1. Unidirectional Scaling (Midpoint Handles)
- Drag N/S handles → change height only
- Drag E/W handles → change width only
- Opposite edge remains fixed
- Adjacent vertices move together

### 2. Corner Shear
- Drag corner vertex to new position
- Opposite corner stays fixed
- One adjacent edge remains straight
- Other edge tilts (shear effect)

### 3. Translate
- Drag center or shape body
- All vertices move by same delta
- Preserves shape and size

### Modifiers
- **Shift**: Constrain aspect ratio during corner drag
- **Alt**: Symmetric scaling about center (midpoint drag)
- **Snap**: Snap to grid when within threshold (default 0.5 ft)

## Wizard Flow

### Step 1: Plot Size
Choose or create the plot boundary:
- 1 Kanal (50ft × 90ft)
- 10 Marla (35ft × 65ft)  
- 5 Marla (25ft × 45ft)
- Custom dimensions or freehand draw

**Style**: Dark blue (#0A2B5A), stroke 0.25mm

### Step 2: House Shape
Select building template:
- Rectangular
- L-shaped
- Mirror L
- U-shaped
- Custom draw

**Style**: Brick red (#B83A3A), stroke 0.25mm

### Step 3: Details
Add walls, paths, and other details using:
- Line tool
- Freehand tool
- Polygon tool
- Eraser

### Step 4: Export/Save
Export to PNG + metadata or save project JSON

## Grid & Snap

- **Grid spacing**: 1 ft (configurable)
- **Major grid**: Every 10 ft
- **Snap threshold**: 0.5 ft (default)
- **Snap modes**: None, Grid, Geometry

## Keyboard Shortcuts

- `V` - Select tool
- `R` - Rectangle tool
- `P` - Polygon tool
- `L` - Line tool
- `F` - Freehand tool
- `M` - Measure tool
- `E` - Eraser tool
- `Space` - Toggle pan mode
- `G` - Toggle grid
- `S` - Toggle snap
- `Ctrl/Cmd + Z` - Undo
- `Ctrl/Cmd + Y` - Redo
- `Shift` - Constrain aspect ratio
- `Alt` - Symmetric scaling

## Future CSV/YOLO Integration

The coordinate system and export metadata are designed to support future CSV symbol placement:

### Integration Points

1. **Export metadata** provides exact DPI, dimensions, and export origin
2. **Conversion utilities** in `scaling.ts` can map CSV pixel coordinates back to world feet
3. **Shape data model** supports a "symbols" layer for placed objects
4. All shapes store both raw and snapped positions when snap is used

### Example CSV Integration Flow

```typescript
// 1. Read exported PNG metadata
const metadata = JSON.parse(metadataJson);

// 2. YOLO detection returns pixel coordinates in export image
const detection = { x_px: 2480, y_px: 3508, class: "door" };

// 3. Convert to world coordinates
const worldPos = exportToWorld(
  { x: detection.x_px, y: detection.y_px },
  metadata.dpi,
  metadata.export_origin
);

// 4. Create symbol shape at world position
const symbol: Shape = {
  id: generateShapeId(),
  type: 'symbol',
  layer: 'symbols',
  vertices_ft: [worldPos],
  metadata: { 
    class: detection.class,
    confidence: detection.confidence 
  }
};
```

## Unit Tests

### Required Test Coverage

Unit tests should be added for:

1. **Scaling utilities** (`src/utils/scaling.ts`)
   - `pixelsPerFoot()` accuracy
   - `worldToExport()` / `exportToWorld()` roundtrip (< 1e-6 ft error)
   - `worldToCanvas()` / `canvasToWorld()` roundtrip (< 1e-6 ft error)
   - A2 dimension calculation at various DPIs
   - Stroke width conversion

2. **Transform behaviors**
   - Midpoint drag changes only one axis
   - Corner drag implements shear correctly
   - Center drag translates all vertices equally
   - Modifiers (Shift, Alt) work as specified

3. **Export functionality**
   - Export dimensions match expected values
   - Metadata JSON includes all required fields
   - Stroke widths calculated correctly for export DPI

### Example Test Setup (Jest)

```typescript
import {
  pixelsPerFoot,
  worldToExport,
  exportToWorld,
  PLOT_SCALE,
} from '../scaling';

describe('scaling utilities', () => {
  const EPSILON = 1e-6;

  it('should roundtrip world -> export -> world', () => {
    const original = { x: 50.5, y: 90.25 };
    const dpi = 300;
    const origin = { x: 100, y: 100 };
    
    const exported = worldToExport(original, dpi, origin);
    const roundtrip = exportToWorld(
      { x: exported.x_px, y: exported.y_px },
      dpi,
      origin
    );
    
    expect(roundtrip.x).toBeCloseTo(original.x, 6);
    expect(roundtrip.y).toBeCloseTo(original.y, 6);
  });
});
```

## Architecture

### State Management
- **Zustand** store (`src/store/floorPlanStore.ts`)
- Centralized state for shapes, tools, view transform
- History/undo system

### Canvas Rendering
- **react-konva** for 2D canvas with transforms
- **Konva.js** for high-DPI export via `stage.toDataURL({ pixelRatio })`

### Component Structure
```
src/
├── components/
│   ├── Canvas/
│   │   └── FloorPlanCanvas.tsx    # Main canvas with Konva
│   ├── Wizard/
│   │   ├── WizardStepper.tsx      # Progress indicator
│   │   ├── PlotStep.tsx           # Step 1: Plot creation
│   │   ├── HouseStep.tsx          # Step 2: House templates
│   │   ├── DetailsStep.tsx        # Step 3: Detail tools
│   │   └── ExportStep.tsx         # Step 4: Export/save
│   ├── Toolbar/
│   │   └── MainToolbar.tsx        # Drawing tools
│   └── Properties/
│       └── PropertiesPanel.tsx    # Selected shape properties
├── store/
│   └── floorPlanStore.ts          # Zustand state
├── types/
│   └── floorplan.ts               # TypeScript types
└── utils/
    ├── scaling.ts                 # Coordinate conversions
    └── shapeHelpers.ts            # Shape creation utilities
```

## Performance Considerations

### Large Images
- A2 @ 600 DPI = 9922px × 14032px (~139 megapixels)
- Canvas export uses `pixelRatio` for high-DPI rendering
- Consider progressive rendering for very high DPI

### Coordinate Precision
- All calculations use double precision (float64)
- Roundtrip error < 1e-6 feet (~0.0003mm at 300 DPI)
- Stroke widths stored in mm for precision

### Render Optimization
- Grid lines rendered only when visible
- Shape handles only for selected objects
- Pan/zoom uses CSS transforms where possible

## Known Limitations

1. **Pan/zoom on touch devices** - Basic implementation, could be enhanced
2. **Rotation handles** - Not yet implemented (transform system ready)
3. **Undo/redo** - Basic implementation, could track more granular changes
4. **PDF export** - Mentioned in spec but not implemented (PNG is primary)

## Development Notes

### Running the App
```bash
npm install
npm run dev
```

### Building
```bash
npm run build
```

The app will be available at `http://localhost:8080`

### Design System
All colors defined as HSL in `src/index.css`:
- **Primary**: Dark blue (#0A2B5A / hsl(215 76% 16%))
- **Building**: Brick red (#B83A3A / hsl(5 60% 48%))
- **Accent**: Teal (#16a3b6 / hsl(180 65% 45%))

## Support

For questions about coordinate system, export format, or CSV integration, refer to:
- `src/utils/scaling.ts` - Authoritative conversion functions
- Export metadata JSON - Contains all mapping information
- This README - Technical specifications and formulas
