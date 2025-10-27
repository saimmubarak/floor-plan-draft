import { useRef, useEffect, useState } from 'react';
import { Stage, Layer, Rect, Line, Circle, Text, Group } from 'react-konva';
import { useFloorPlanStore } from '@/store/floorPlanStore';
import { worldToCanvas, canvasToWorld, getA2Dimensions } from '@/utils/scaling';
import { getEdgeLengths, getEdgeMidpoint, formatFeet } from '@/utils/shapeHelpers';
import type { Point } from '@/types/floorplan';

const EDITING_DPI = 96;
const CANVAS_WIDTH = 1200;
const CANVAS_HEIGHT = 800;

export const FloorPlanCanvas = () => {
  const stageRef = useRef<any>(null);
  const [a2Dimensions, setA2Dimensions] = useState({ width: 0, height: 0 });
  
  const {
    shapes,
    selectedShapeIds,
    viewTransform,
    showGrid,
    gridSettings,
    activeTool,
    setViewTransform,
    selectShape,
    clearSelection,
  } = useFloorPlanStore();

  useEffect(() => {
    // Calculate A2 dimensions in canvas pixels
    const dims = getA2Dimensions(EDITING_DPI);
    setA2Dimensions(dims);
    
    // Center A2 in canvas
    const centerX = (CANVAS_WIDTH - dims.width * viewTransform.scale) / 2;
    const centerY = (CANVAS_HEIGHT - dims.height * viewTransform.scale) / 2;
    setViewTransform({ translateX: centerX, translateY: centerY });
  }, []);

  const handleWheel = (e: any) => {
    e.evt.preventDefault();
    const stage = stageRef.current;
    if (!stage) return;

    const oldScale = viewTransform.scale;
    const pointer = stage.getPointerPosition();

    const mousePointTo = {
      x: (pointer.x - viewTransform.translateX) / oldScale,
      y: (pointer.y - viewTransform.translateY) / oldScale,
    };

    const direction = e.evt.deltaY > 0 ? -1 : 1;
    const scaleBy = 1.1;
    const newScale = direction > 0 ? oldScale * scaleBy : oldScale / scaleBy;
    const clampedScale = Math.max(0.1, Math.min(5, newScale));

    const newPos = {
      x: pointer.x - mousePointTo.x * clampedScale,
      y: pointer.y - mousePointTo.y * clampedScale,
    };

    setViewTransform({
      scale: clampedScale,
      translateX: newPos.x,
      translateY: newPos.y,
    });
  };

  const handleStageClick = (e: any) => {
    if (e.target === e.target.getStage() || e.target.attrs.name === 'a2-sheet') {
      clearSelection();
    }
  };

  const renderGrid = () => {
    if (!showGrid || !gridSettings.enabled) return null;

    const lines = [];
    const a2WorldWidth = a2Dimensions.width / (EDITING_DPI / 3.1);
    const a2WorldHeight = a2Dimensions.height / (EDITING_DPI / 3.1);

    // Vertical lines
    for (let x = 0; x <= a2WorldWidth; x += gridSettings.spacing) {
      const isMajor = x % gridSettings.majorSpacing === 0;
      const canvasStart = worldToCanvas({ x, y: 0 }, viewTransform, EDITING_DPI);
      const canvasEnd = worldToCanvas({ x, y: a2WorldHeight }, viewTransform, EDITING_DPI);
      
      lines.push(
        <Line
          key={`v-${x}`}
          points={[canvasStart.x, canvasStart.y, canvasEnd.x, canvasEnd.y]}
          stroke={isMajor ? '#9ca3af' : '#e5e7eb'}
          strokeWidth={isMajor ? 1 : 0.5}
          listening={false}
        />
      );
    }

    // Horizontal lines
    for (let y = 0; y <= a2WorldHeight; y += gridSettings.spacing) {
      const isMajor = y % gridSettings.majorSpacing === 0;
      const canvasStart = worldToCanvas({ x: 0, y }, viewTransform, EDITING_DPI);
      const canvasEnd = worldToCanvas({ x: a2WorldWidth, y }, viewTransform, EDITING_DPI);
      
      lines.push(
        <Line
          key={`h-${y}`}
          points={[canvasStart.x, canvasStart.y, canvasEnd.x, canvasEnd.y]}
          stroke={isMajor ? '#9ca3af' : '#e5e7eb'}
          strokeWidth={isMajor ? 1 : 0.5}
          listening={false}
        />
      );
    }

    return lines;
  };

  const renderShape = (shape: any) => {
    const isSelected = selectedShapeIds.includes(shape.id);
    const canvasPoints = shape.vertices_ft.map((p: Point) => 
      worldToCanvas(p, viewTransform, EDITING_DPI)
    );
    const flatPoints = canvasPoints.flatMap((p: Point) => [p.x, p.y]);

    const strokeWidth = (shape.stroke_mm / 25.4) * EDITING_DPI * viewTransform.scale;

    return (
      <Group key={shape.id}>
        <Line
          points={flatPoints}
          closed={shape.type === 'rectangle' || shape.type === 'polygon'}
          stroke={shape.stroke_color}
          strokeWidth={strokeWidth}
          fill={shape.fill || undefined}
          onClick={() => selectShape(shape.id)}
          onTap={() => selectShape(shape.id)}
        />
        
        {isSelected && renderHandles(shape)}
        {renderLengthLabels(shape)}
      </Group>
    );
  };

  const renderHandles = (shape: any) => {
    const handles = [];
    
    // Corner and midpoint handles
    shape.vertices_ft.forEach((vertex: Point, idx: number) => {
      const canvasPos = worldToCanvas(vertex, viewTransform, EDITING_DPI);
      handles.push(
        <Circle
          key={`corner-${idx}`}
          x={canvasPos.x}
          y={canvasPos.y}
          radius={6}
          fill="#16a3b6"
          stroke="#ffffff"
          strokeWidth={2}
        />
      );

      // Midpoint handles
      const next = shape.vertices_ft[(idx + 1) % shape.vertices_ft.length];
      const midpoint = getEdgeMidpoint(vertex, next);
      const canvasMid = worldToCanvas(midpoint, viewTransform, EDITING_DPI);
      handles.push(
        <Rect
          key={`mid-${idx}`}
          x={canvasMid.x - 4}
          y={canvasMid.y - 4}
          width={8}
          height={8}
          fill="#16a3b6"
          stroke="#ffffff"
          strokeWidth={2}
        />
      );
    });

    return handles;
  };

  const renderLengthLabels = (shape: any) => {
    const lengths = getEdgeLengths(shape.vertices_ft);
    const labels = [];

    shape.vertices_ft.forEach((vertex: Point, idx: number) => {
      const next = shape.vertices_ft[(idx + 1) % shape.vertices_ft.length];
      const midpoint = getEdgeMidpoint(vertex, next);
      const canvasMid = worldToCanvas(midpoint, viewTransform, EDITING_DPI);
      const length = lengths[idx];

      labels.push(
        <Group key={`label-${idx}`}>
          <Text
            x={canvasMid.x}
            y={canvasMid.y}
            text={`${formatFeet(length)} ft`}
            fontSize={12}
            fill="#0A2B5A"
            padding={4}
            align="center"
            offsetX={30}
            offsetY={10}
          />
        </Group>
      );
    });

    return labels;
  };

  return (
    <div className="relative w-full h-full bg-canvas-bg rounded-lg border border-border overflow-hidden">
      <Stage
        ref={stageRef}
        width={CANVAS_WIDTH}
        height={CANVAS_HEIGHT}
        onWheel={handleWheel}
        onClick={handleStageClick}
        onTap={handleStageClick}
      >
        <Layer>
          {/* A2 Sheet */}
          <Rect
            name="a2-sheet"
            x={viewTransform.translateX}
            y={viewTransform.translateY}
            width={a2Dimensions.width * viewTransform.scale}
            height={a2Dimensions.height * viewTransform.scale}
            fill="#ffffff"
            shadowBlur={10}
            shadowOpacity={0.3}
          />
          
          {/* Grid */}
          {renderGrid()}
          
          {/* Shapes */}
          {shapes.map(renderShape)}
        </Layer>
      </Stage>

      {/* Zoom controls */}
      <div className="absolute bottom-4 right-4 flex flex-col gap-2">
        <button
          onClick={() => setViewTransform({ scale: Math.min(5, viewTransform.scale * 1.2) })}
          className="bg-card hover:bg-accent text-foreground px-3 py-2 rounded shadow"
        >
          +
        </button>
        <button
          onClick={() => setViewTransform({ scale: Math.max(0.1, viewTransform.scale / 1.2) })}
          className="bg-card hover:bg-accent text-foreground px-3 py-2 rounded shadow"
        >
          −
        </button>
      </div>
    </div>
  );
};
