import { useState, useRef, useEffect, useCallback } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { 
  Circle, Minus, Eraser, RotateCcw, Eye, EyeOff, 
  MousePointer, ArrowUpRight, ChevronDown, Triangle, Compass,
  ZoomIn, ZoomOut, Move, Hand
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Lightbox } from "./Lightbox";

const COLORS = [
  { name: "Rot", value: "#ef4444" },
  { name: "Blau", value: "#3b82f6" },
  { name: "Grün", value: "#22c55e" },
  { name: "Gelb", value: "#eab308" },
];

const TOOLS = [
  { id: "select", name: "Bewegen – Elemente verschieben", icon: MousePointer },
  { id: "pan", name: "Bild – Bildausschnitt verschieben", icon: Hand },
  { id: "circle", name: "Kreis zeichnen", icon: Circle },
  { id: "line", name: "Linie zeichnen", icon: Minus },
  { id: "arrow", name: "Pfeil zeichnen", icon: ArrowUpRight },
  { id: "angle", name: "Winkel zur Horizontalen messen", icon: Triangle },
  { id: "freeAngle", name: "Freier Winkel (2 Linien)", icon: Compass },
];

export function DrawingCanvas({ 
  imageSrc, 
  imageAlt,
  solutionMarkers = [],
  tasks = ["Markiere die Technikmerkmale auf dem Bild"],
  title = "Zeichne wesentliche Merkmale ins Bild!"
}) {
  const canvasRef = useRef(null);
  const containerRef = useRef(null);
  const [isDrawing, setIsDrawing] = useState(false);
  const [tool, setTool] = useState("circle");
  const [color, setColor] = useState(COLORS[0].value);
  const [drawings, setDrawings] = useState([]);
  const [currentDrawing, setCurrentDrawing] = useState(null);
  const [selectedTask, setSelectedTask] = useState(0);
  const [isTaskMenuOpen, setIsTaskMenuOpen] = useState(false);
  const [showSolution, setShowSolution] = useState(false);
  const [showLightbox, setShowLightbox] = useState(false);
  const [canvasSize, setCanvasSize] = useState({ width: 0, height: 0 });
  
  // Free angle tool state
  const [freeAngleFirstLine, setFreeAngleFirstLine] = useState(null);

  // Zoom & Pan state
  const [zoom, setZoom] = useState(1);
  const [pan, setPan] = useState({ x: 0, y: 0 });
  const [isPanning, setIsPanning] = useState(false);
  const panStartRef = useRef({ x: 0, y: 0 });
  const lastPanRef = useRef({ x: 0, y: 0 });

  // Select & Move state
  const [selectedIndex, setSelectedIndex] = useState(null);
  const [isDragging, setIsDragging] = useState(false);
  const dragStartRef = useRef({ x: 0, y: 0 });

  // Pinch zoom state
  const lastPinchDistRef = useRef(null);
  const lastPinchCenterRef = useRef(null);

  // Initialize canvas size
  useEffect(() => {
    const updateSize = () => {
      if (containerRef.current) {
        const rect = containerRef.current.getBoundingClientRect();
        setCanvasSize({ width: rect.width, height: rect.height });
      }
    };
    updateSize();
    window.addEventListener("resize", updateSize);
    return () => window.removeEventListener("resize", updateSize);
  }, [imageSrc]);

  // Convert screen coordinates to canvas coordinates (accounting for zoom/pan)
  const screenToCanvas = useCallback((screenX, screenY) => {
    const canvas = canvasRef.current;
    if (!canvas) return { x: 0, y: 0 };
    const rect = canvas.getBoundingClientRect();
    const scaleX = canvas.width / rect.width;
    const scaleY = canvas.height / rect.height;
    const sx = (screenX - rect.left) * scaleX;
    const sy = (screenY - rect.top) * scaleY;
    return {
      x: (sx - pan.x) / zoom,
      y: (sy - pan.y) / zoom
    };
  }, [zoom, pan]);

  // Hit-test: find which drawing is under the given canvas point
  const hitTest = useCallback((cx, cy) => {
    for (let i = drawings.length - 1; i >= 0; i--) {
      const d = drawings[i];
      const threshold = 12 / zoom;

      if (d.type === "circle") {
        const radius = Math.sqrt((d.x2 - d.x) ** 2 + (d.y2 - d.y) ** 2);
        const dist = Math.sqrt((cx - d.x) ** 2 + (cy - d.y) ** 2);
        if (Math.abs(dist - radius) < threshold || dist < radius) return i;
      } else if (d.type === "line" || d.type === "arrow" || d.type === "angle") {
        if (pointToSegmentDist(cx, cy, d.x, d.y, d.x2, d.y2) < threshold) return i;
      } else if (d.type === "freeAngle") {
        if (pointToSegmentDist(cx, cy, d.x, d.y, d.x2, d.y2) < threshold) return i;
        if (d.x3 !== undefined && pointToSegmentDist(cx, cy, d.x2, d.y2, d.x3, d.y3) < threshold) return i;
      }
    }
    return null;
  }, [drawings, zoom]);

  // Point-to-line-segment distance
  function pointToSegmentDist(px, py, x1, y1, x2, y2) {
    const dx = x2 - x1, dy = y2 - y1;
    const lenSq = dx * dx + dy * dy;
    if (lenSq === 0) return Math.sqrt((px - x1) ** 2 + (py - y1) ** 2);
    let t = ((px - x1) * dx + (py - y1) * dy) / lenSq;
    t = Math.max(0, Math.min(1, t));
    const projX = x1 + t * dx, projY = y1 + t * dy;
    return Math.sqrt((px - projX) ** 2 + (py - projY) ** 2);
  }

  // Move a drawing by delta
  const moveDrawing = useCallback((index, deltaX, deltaY) => {
    setDrawings(prev => prev.map((d, i) => {
      if (i !== index) return d;
      const moved = { ...d, x: d.x + deltaX, y: d.y + deltaY, x2: d.x2 + deltaX, y2: d.y2 + deltaY };
      if (d.x3 !== undefined) { moved.x3 = d.x3 + deltaX; moved.y3 = d.y3 + deltaY; }
      return moved;
    }));
  }, []);

  // ==================== DRAWING ====================
  const drawShape = useCallback((ctx, shape) => {
    ctx.strokeStyle = shape.isSolution ? "#22c55e" : shape.color;
    ctx.fillStyle = shape.isSolution ? "rgba(34, 197, 94, 0.1)" : `${shape.color}20`;
    ctx.lineWidth = (shape.isSolution ? 4 : 3) / zoom;
    ctx.setLineDash(shape.isSolution ? [5 / zoom, 5 / zoom] : []);

    const isSelected = shape._selected;
    if (isSelected) {
      ctx.shadowColor = "#ffffff";
      ctx.shadowBlur = 8 / zoom;
    }

    if (shape.type === "circle") {
      const radius = Math.sqrt((shape.x2 - shape.x) ** 2 + (shape.y2 - shape.y) ** 2);
      ctx.beginPath();
      ctx.arc(shape.x, shape.y, radius, 0, 2 * Math.PI);
      ctx.fill();
      ctx.stroke();
    } else if (shape.type === "line") {
      ctx.beginPath();
      ctx.moveTo(shape.x, shape.y);
      ctx.lineTo(shape.x2, shape.y2);
      ctx.stroke();
    } else if (shape.type === "arrow") {
      ctx.beginPath();
      ctx.moveTo(shape.x, shape.y);
      ctx.lineTo(shape.x2, shape.y2);
      ctx.stroke();
      const angle = Math.atan2(shape.y2 - shape.y, shape.x2 - shape.x);
      const headLength = 15 / zoom;
      ctx.beginPath();
      ctx.moveTo(shape.x2, shape.y2);
      ctx.lineTo(shape.x2 - headLength * Math.cos(angle - Math.PI / 6), shape.y2 - headLength * Math.sin(angle - Math.PI / 6));
      ctx.moveTo(shape.x2, shape.y2);
      ctx.lineTo(shape.x2 - headLength * Math.cos(angle + Math.PI / 6), shape.y2 - headLength * Math.sin(angle + Math.PI / 6));
      ctx.stroke();
    } else if (shape.type === "angle") {
      ctx.beginPath();
      ctx.moveTo(shape.x, shape.y);
      ctx.lineTo(shape.x2, shape.y2);
      ctx.stroke();

      const dx = shape.x2 - shape.x, dy = shape.y2 - shape.y;
      let angleDeg = (Math.atan2(dy, dx) * 180) / Math.PI;
      if (angleDeg > 90) angleDeg -= 180;
      if (angleDeg < -90) angleDeg += 180;

      const lineLength = Math.sqrt(dx * dx + dy * dy);
      const midX = (shape.x + shape.x2) / 2, midY = (shape.y + shape.y2) / 2;

      ctx.save();
      ctx.setLineDash([4 / zoom, 4 / zoom]);
      ctx.strokeStyle = "#666666";
      ctx.lineWidth = 1 / zoom;
      ctx.beginPath();
      ctx.moveTo(midX - lineLength / 2, midY);
      ctx.lineTo(midX + lineLength / 2, midY);
      ctx.stroke();
      ctx.restore();

      const labelText = `${Math.abs(angleDeg).toFixed(1)}°`;
      ctx.save();
      const fontSize = 16 / zoom;
      ctx.font = `bold ${fontSize}px sans-serif`;
      const textWidth = ctx.measureText(labelText).width;
      ctx.fillStyle = "rgba(0, 0, 0, 0.8)";
      ctx.fillRect(midX + 15 / zoom - 6 / zoom, midY - 10 / zoom - 18 / zoom, textWidth + 12 / zoom, 26 / zoom);
      ctx.fillStyle = shape.isSolution ? "#22c55e" : shape.color;
      ctx.fillText(labelText, midX + 15 / zoom, midY - 10 / zoom);
      ctx.restore();

      ctx.save();
      ctx.fillStyle = shape.isSolution ? "#22c55e" : shape.color;
      ctx.beginPath(); ctx.arc(shape.x, shape.y, 4 / zoom, 0, 2 * Math.PI); ctx.fill();
      ctx.beginPath(); ctx.arc(shape.x2, shape.y2, 4 / zoom, 0, 2 * Math.PI); ctx.fill();
      ctx.restore();
    } else if (shape.type === "freeAngle") {
      ctx.beginPath();
      ctx.moveTo(shape.x, shape.y);
      ctx.lineTo(shape.x2, shape.y2);
      ctx.stroke();

      if (shape.x3 !== undefined && shape.y3 !== undefined) {
        ctx.beginPath();
        ctx.moveTo(shape.x2, shape.y2);
        ctx.lineTo(shape.x3, shape.y3);
        ctx.stroke();

        const v1x = shape.x - shape.x2, v1y = shape.y - shape.y2;
        const v2x = shape.x3 - shape.x2, v2y = shape.y3 - shape.y2;
        const dot = v1x * v2x + v1y * v2y;
        const mag1 = Math.sqrt(v1x ** 2 + v1y ** 2), mag2 = Math.sqrt(v2x ** 2 + v2y ** 2);

        if (mag1 > 0 && mag2 > 0) {
          const angleDeg = (Math.acos(Math.max(-1, Math.min(1, dot / (mag1 * mag2)))) * 180) / Math.PI;
          const labelText = `${angleDeg.toFixed(1)}°`;
          ctx.save();
          const fontSize = 16 / zoom;
          ctx.font = `bold ${fontSize}px sans-serif`;
          const textWidth = ctx.measureText(labelText).width;
          ctx.fillStyle = "rgba(0, 0, 0, 0.8)";
          ctx.fillRect(shape.x2 + 15 / zoom - 6 / zoom, shape.y2 - 10 / zoom - 18 / zoom, textWidth + 12 / zoom, 26 / zoom);
          ctx.fillStyle = shape.isSolution ? "#22c55e" : shape.color;
          ctx.fillText(labelText, shape.x2 + 15 / zoom, shape.y2 - 10 / zoom);
          ctx.restore();
        }

        ctx.save();
        ctx.fillStyle = shape.isSolution ? "#22c55e" : shape.color;
        [{ px: shape.x, py: shape.y }, { px: shape.x2, py: shape.y2 }, { px: shape.x3, py: shape.y3 }].forEach(p => {
          ctx.beginPath(); ctx.arc(p.px, p.py, 4 / zoom, 0, 2 * Math.PI); ctx.fill();
        });
        ctx.restore();
      } else {
        ctx.save();
        ctx.font = `${12 / zoom}px sans-serif`;
        ctx.fillStyle = shape.color;
        ctx.fillText("2. Linie ziehen...", shape.x2 + 10 / zoom, shape.y2 + 20 / zoom);
        ctx.restore();
        ctx.save();
        ctx.fillStyle = shape.isSolution ? "#22c55e" : shape.color;
        ctx.beginPath(); ctx.arc(shape.x, shape.y, 4 / zoom, 0, 2 * Math.PI); ctx.fill();
        ctx.beginPath(); ctx.arc(shape.x2, shape.y2, 4 / zoom, 0, 2 * Math.PI); ctx.fill();
        ctx.restore();
      }
    }

    if (shape.isSolution && shape.label) {
      ctx.font = `${12 / zoom}px sans-serif`;
      ctx.fillStyle = "#22c55e";
      ctx.fillText(shape.label, shape.x + 5 / zoom, shape.y - 10 / zoom);
    }

    ctx.setLineDash([]);
    ctx.shadowColor = "transparent";
    ctx.shadowBlur = 0;
  }, [zoom]);

  // ==================== RENDER CANVAS ====================
  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext("2d");
    ctx.clearRect(0, 0, canvas.width, canvas.height);

    ctx.save();
    ctx.translate(pan.x, pan.y);
    ctx.scale(zoom, zoom);

    drawings.forEach((d, i) => drawShape(ctx, { ...d, _selected: i === selectedIndex }));
    if (currentDrawing) drawShape(ctx, currentDrawing);
    if (freeAngleFirstLine && !currentDrawing) drawShape(ctx, freeAngleFirstLine);
    if (showSolution && solutionMarkers.length > 0) {
      solutionMarkers.forEach(marker => drawShape(ctx, { ...marker, isSolution: true }));
    }

    ctx.restore();
  }, [drawings, currentDrawing, freeAngleFirstLine, showSolution, solutionMarkers, canvasSize, zoom, pan, selectedIndex, drawShape]);

  // ==================== ZOOM ====================
  const handleWheel = useCallback((e) => {
    e.preventDefault();
    const canvas = canvasRef.current;
    if (!canvas) return;
    const rect = canvas.getBoundingClientRect();
    const scaleX = canvas.width / rect.width;
    const scaleY = canvas.height / rect.height;
    const mouseX = (e.clientX - rect.left) * scaleX;
    const mouseY = (e.clientY - rect.top) * scaleY;

    const delta = e.ctrlKey ? -e.deltaY * 0.01 : -e.deltaY * 0.003;
    const newZoom = Math.min(5, Math.max(0.5, zoom + delta));
    const ratio = newZoom / zoom;

    setPan(prev => ({
      x: mouseX - ratio * (mouseX - prev.x),
      y: mouseY - ratio * (mouseY - prev.y)
    }));
    setZoom(newZoom);
  }, [zoom]);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    canvas.addEventListener("wheel", handleWheel, { passive: false });
    return () => canvas.removeEventListener("wheel", handleWheel);
  }, [handleWheel]);

  const zoomIn = () => {
    const cx = (canvasSize.width || 400) / 2;
    const cy = (canvasSize.height || 300) / 2;
    const newZoom = Math.min(5, zoom * 1.3);
    const ratio = newZoom / zoom;
    setPan(prev => ({ x: cx - ratio * (cx - prev.x), y: cy - ratio * (cy - prev.y) }));
    setZoom(newZoom);
  };

  const zoomOut = () => {
    const cx = (canvasSize.width || 400) / 2;
    const cy = (canvasSize.height || 300) / 2;
    const newZoom = Math.max(0.5, zoom / 1.3);
    const ratio = newZoom / zoom;
    setPan(prev => ({ x: cx - ratio * (cx - prev.x), y: cy - ratio * (cy - prev.y) }));
    setZoom(newZoom);
  };

  const resetZoom = () => { setZoom(1); setPan({ x: 0, y: 0 }); };

  // ==================== INTERACTION HANDLERS ====================
  const handleStart = (pos) => {
    const canvasPos = screenToCanvas(pos.clientX, pos.clientY);

    // Pan tool
    if (tool === "pan") {
      setIsPanning(true);
      panStartRef.current = { x: pos.clientX, y: pos.clientY };
      lastPanRef.current = { ...pan };
      return;
    }

    // Select tool
    if (tool === "select") {
      const hitIdx = hitTest(canvasPos.x, canvasPos.y);
      setSelectedIndex(hitIdx);
      if (hitIdx !== null) {
        setIsDragging(true);
        dragStartRef.current = canvasPos;
      }
      return;
    }

    // Free angle: second line
    if (tool === "freeAngle" && freeAngleFirstLine) {
      setIsDrawing(true);
      setCurrentDrawing({
        type: "freeAngle",
        x: freeAngleFirstLine.x, y: freeAngleFirstLine.y,
        x2: freeAngleFirstLine.x2, y2: freeAngleFirstLine.y2,
        x3: canvasPos.x, y3: canvasPos.y,
        color
      });
      return;
    }

    // Drawing tools
    setIsDrawing(true);
    setCurrentDrawing({
      type: tool,
      x: canvasPos.x, y: canvasPos.y,
      x2: canvasPos.x, y2: canvasPos.y,
      color
    });
  };

  const handleMove = (pos) => {
    // Panning
    if (isPanning) {
      const canvas = canvasRef.current;
      if (!canvas) return;
      const rect = canvas.getBoundingClientRect();
      const scaleX = canvas.width / rect.width;
      const scaleY = canvas.height / rect.height;
      setPan({
        x: lastPanRef.current.x + (pos.clientX - panStartRef.current.x) * scaleX,
        y: lastPanRef.current.y + (pos.clientY - panStartRef.current.y) * scaleY
      });
      return;
    }

    // Dragging selected element
    if (isDragging && selectedIndex !== null) {
      const canvasPos = screenToCanvas(pos.clientX, pos.clientY);
      const dx = canvasPos.x - dragStartRef.current.x;
      const dy = canvasPos.y - dragStartRef.current.y;
      moveDrawing(selectedIndex, dx, dy);
      dragStartRef.current = canvasPos;
      return;
    }

    // Drawing
    if (!isDrawing || !currentDrawing) return;
    const canvasPos = screenToCanvas(pos.clientX, pos.clientY);
    if (currentDrawing.type === "freeAngle" && currentDrawing.x3 !== undefined) {
      setCurrentDrawing({ ...currentDrawing, x3: canvasPos.x, y3: canvasPos.y });
    } else {
      setCurrentDrawing({ ...currentDrawing, x2: canvasPos.x, y2: canvasPos.y });
    }
  };

  const handleEnd = () => {
    if (isPanning) { setIsPanning(false); return; }
    if (isDragging) { setIsDragging(false); return; }

    if (currentDrawing) {
      const minSize = 5 / zoom;
      const dx = Math.abs(currentDrawing.x2 - currentDrawing.x);
      const dy = Math.abs(currentDrawing.y2 - currentDrawing.y);

      if (currentDrawing.type === "freeAngle") {
        if (currentDrawing.x3 === undefined) {
          if (dx > minSize || dy > minSize) setFreeAngleFirstLine(currentDrawing);
        } else {
          const dx3 = Math.abs(currentDrawing.x3 - currentDrawing.x2);
          const dy3 = Math.abs(currentDrawing.y3 - currentDrawing.y2);
          if (dx3 > minSize || dy3 > minSize) setDrawings(prev => [...prev, currentDrawing]);
          setFreeAngleFirstLine(null);
        }
      } else {
        if (dx > minSize || dy > minSize) setDrawings(prev => [...prev, currentDrawing]);
      }
    }
    setIsDrawing(false);
    setCurrentDrawing(null);
  };

  // Mouse events
  const handleMouseDown = (e) => handleStart({ clientX: e.clientX, clientY: e.clientY });
  const handleMouseMove = (e) => handleMove({ clientX: e.clientX, clientY: e.clientY });
  const handleMouseUp = () => handleEnd();

  // Touch events (single + pinch)
  const handleTouchStart = (e) => {
    e.preventDefault();
    if (e.touches.length === 2) {
      // Pinch start
      const d = Math.hypot(e.touches[0].clientX - e.touches[1].clientX, e.touches[0].clientY - e.touches[1].clientY);
      lastPinchDistRef.current = d;
      lastPinchCenterRef.current = {
        x: (e.touches[0].clientX + e.touches[1].clientX) / 2,
        y: (e.touches[0].clientY + e.touches[1].clientY) / 2
      };
      return;
    }
    handleStart({ clientX: e.touches[0].clientX, clientY: e.touches[0].clientY });
  };

  const handleTouchMove = (e) => {
    e.preventDefault();
    if (e.touches.length === 2 && lastPinchDistRef.current !== null) {
      // Pinch zoom
      const d = Math.hypot(e.touches[0].clientX - e.touches[1].clientX, e.touches[0].clientY - e.touches[1].clientY);
      const center = {
        x: (e.touches[0].clientX + e.touches[1].clientX) / 2,
        y: (e.touches[0].clientY + e.touches[1].clientY) / 2
      };
      const canvas = canvasRef.current;
      if (!canvas) return;
      const rect = canvas.getBoundingClientRect();
      const scaleX = canvas.width / rect.width;
      const scaleY = canvas.height / rect.height;
      const cx = (center.x - rect.left) * scaleX;
      const cy = (center.y - rect.top) * scaleY;

      const scale = d / lastPinchDistRef.current;
      const newZoom = Math.min(5, Math.max(0.5, zoom * scale));
      const ratio = newZoom / zoom;

      setPan(prev => ({
        x: cx - ratio * (cx - prev.x),
        y: cy - ratio * (cy - prev.y)
      }));
      setZoom(newZoom);
      lastPinchDistRef.current = d;
      lastPinchCenterRef.current = center;
      return;
    }
    if (e.touches.length === 1) {
      handleMove({ clientX: e.touches[0].clientX, clientY: e.touches[0].clientY });
    }
  };

  const handleTouchEnd = (e) => {
    e.preventDefault();
    if (lastPinchDistRef.current !== null && e.touches.length < 2) {
      lastPinchDistRef.current = null;
      lastPinchCenterRef.current = null;
      return;
    }
    handleEnd();
  };

  const clearAll = () => {
    setDrawings([]);
    setCurrentDrawing(null);
    setFreeAngleFirstLine(null);
    setSelectedIndex(null);
  };

  const undoLast = () => {
    setDrawings(prev => prev.slice(0, -1));
    setSelectedIndex(null);
  };

  const deleteSelected = () => {
    if (selectedIndex !== null) {
      setDrawings(prev => prev.filter((_, i) => i !== selectedIndex));
      setSelectedIndex(null);
    }
  };

  const getCursorStyle = () => {
    if (tool === "pan") return isPanning ? "grabbing" : "grab";
    if (tool === "select") return isDragging ? "grabbing" : "default";
    return "crosshair";
  };

  return (
    <div className="space-y-3">
      <h2 className="font-oswald text-lg font-semibold tracking-wide text-white">{title}</h2>

      <div className="flex gap-3">
        {/* Canvas container */}
        <div 
          ref={containerRef}
          className="relative rounded-lg overflow-hidden border-2 border-zinc-700 flex-1"
          style={{ touchAction: "none", cursor: getCursorStyle() }}
        >
          {imageSrc ? (
            <img 
              src={imageSrc} 
              alt={imageAlt}
              className="w-full h-auto"
              draggable={false}
              style={{
                transformOrigin: "0 0",
                transform: `translate(${pan.x}px, ${pan.y}px) scale(${zoom})`
              }}
              onLoad={() => {
                if (containerRef.current) {
                  const rect = containerRef.current.getBoundingClientRect();
                  setCanvasSize({ width: rect.width, height: rect.height });
                }
              }}
            />
          ) : (
            <div className="aspect-[4/3] bg-zinc-800 flex items-center justify-center">
              <span className="text-zinc-500 text-sm">Bild wird geladen...</span>
            </div>
          )}

          <canvas
            ref={canvasRef}
            width={canvasSize.width || 400}
            height={canvasSize.height || 300}
            className="absolute inset-0 w-full h-full"
            onMouseDown={handleMouseDown}
            onMouseMove={handleMouseMove}
            onMouseUp={handleMouseUp}
            onMouseLeave={handleMouseUp}
            onTouchStart={handleTouchStart}
            onTouchMove={handleTouchMove}
            onTouchEnd={handleTouchEnd}
          />

          {/* Zoom indicator */}
          {zoom !== 1 && (
            <div className="absolute top-2 left-2 bg-black/70 text-white text-xs px-2 py-1 rounded-md pointer-events-none">
              {Math.round(zoom * 100)}%
            </div>
          )}

          {/* Selected element info */}
          {selectedIndex !== null && tool === "select" && (
            <div className="absolute bottom-2 left-2 bg-black/70 text-white text-xs px-2 py-1 rounded-md flex items-center gap-2">
              <span>Element ausgewählt</span>
              <button
                onClick={deleteSelected}
                className="bg-red-600 hover:bg-red-700 px-2 py-0.5 rounded text-white"
                data-testid="delete-selected-btn"
              >
                Löschen
              </button>
            </div>
          )}
        </div>

        {/* Vertical Toolbar */}
        <div className="flex flex-col gap-2 bg-zinc-800/50 border border-zinc-700 rounded-lg p-2">
          {/* Tools */}
          <div className="flex flex-col items-center gap-1 pb-2 border-b border-zinc-600">
            {TOOLS.map((t) => (
              <button
                key={t.id}
                onClick={() => { setTool(t.id); setSelectedIndex(null); }}
                className={`p-2 rounded-lg transition-colors ${
                  tool === t.id ? "bg-blue-600 text-white" : "bg-zinc-700 text-zinc-300 hover:bg-zinc-600"
                }`}
                title={t.name}
                data-testid={`tool-${t.id}`}
              >
                <t.icon className="w-4 h-4" />
              </button>
            ))}
          </div>

          {/* Colors */}
          <div className="flex flex-col items-center gap-1 pb-2 border-b border-zinc-600">
            {COLORS.map((c) => (
              <button
                key={c.value}
                onClick={() => setColor(c.value)}
                className={`w-6 h-6 rounded-full border-2 transition-transform ${
                  color === c.value ? "border-white scale-110" : "border-zinc-500 hover:scale-105"
                }`}
                style={{ backgroundColor: c.value }}
                title={c.name}
              />
            ))}
          </div>

          {/* Zoom controls */}
          <div className="flex flex-col items-center gap-1 pb-2 border-b border-zinc-600">
            <button onClick={zoomIn} className="p-2 rounded-lg bg-zinc-700 text-zinc-300 hover:bg-zinc-600" title="Bild vergrößern" data-testid="zoom-in-btn">
              <ZoomIn className="w-4 h-4" />
            </button>
            <button onClick={zoomOut} className="p-2 rounded-lg bg-zinc-700 text-zinc-300 hover:bg-zinc-600" title="Bild verkleinern" data-testid="zoom-out-btn">
              <ZoomOut className="w-4 h-4" />
            </button>
            {zoom !== 1 && (
              <button onClick={resetZoom} className="p-1 rounded text-[10px] text-zinc-400 hover:text-white" title="Zoom zurücksetzen">
                1:1
              </button>
            )}
          </div>

          {/* Actions */}
          <div className="flex flex-col items-center gap-1 pb-2 border-b border-zinc-600">
            <button
              onClick={undoLast}
              disabled={drawings.length === 0}
              className="p-2 rounded-lg bg-zinc-700 text-zinc-300 hover:bg-zinc-600 disabled:opacity-50 disabled:cursor-not-allowed"
              title="Letztes Element entfernen"
            >
              <Eraser className="w-4 h-4" />
            </button>
            <button
              onClick={clearAll}
              disabled={drawings.length === 0}
              className="p-2 rounded-lg bg-zinc-700 text-zinc-300 hover:bg-zinc-600 disabled:opacity-50 disabled:cursor-not-allowed"
              title="Alles löschen"
            >
              <RotateCcw className="w-4 h-4" />
            </button>
          </div>

          {/* Solution toggle */}
          {solutionMarkers.length > 0 && (
            <button
              onClick={() => setShowSolution(!showSolution)}
              className={`p-2 rounded-lg transition-colors ${
                showSolution ? "bg-green-600 text-white" : "bg-zinc-700 text-zinc-300 hover:bg-zinc-600"
              }`}
              title={showSolution ? "Lösung ausblenden" : "Lösung zeigen"}
            >
              {showSolution ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
            </button>
          )}
        </div>
      </div>

      {/* Task dropdown */}
      <div className="relative">
        <button
          onClick={() => setIsTaskMenuOpen(!isTaskMenuOpen)}
          className="w-full flex items-center justify-between bg-blue-500/10 border border-blue-500/30 rounded-lg p-3 hover:bg-blue-500/20 transition-colors"
        >
          <span className="text-blue-300 text-sm font-medium">{tasks[selectedTask]}</span>
          <ChevronDown className={`w-5 h-5 text-blue-400 transition-transform ${isTaskMenuOpen ? "rotate-180" : ""}`} />
        </button>
        <AnimatePresence>
          {isTaskMenuOpen && (
            <motion.div
              initial={{ opacity: 0, y: -10 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -10 }}
              className="absolute bottom-full left-0 right-0 mb-1 bg-zinc-800 border border-zinc-600 rounded-lg overflow-hidden z-20 shadow-xl"
            >
              {tasks.map((task, index) => (
                <button
                  key={index}
                  onClick={() => { setSelectedTask(index); setIsTaskMenuOpen(false); }}
                  className={`w-full text-left px-4 py-3 text-sm transition-colors ${
                    selectedTask === index ? "bg-blue-600 text-white" : "text-zinc-300 hover:bg-zinc-700"
                  }`}
                >
                  {task}
                </button>
              ))}
            </motion.div>
          )}
        </AnimatePresence>
      </div>

      {/* Status bar */}
      <div className="flex items-center justify-between text-xs text-zinc-500">
        <span>{drawings.length} Markierung(en){zoom !== 1 ? ` • Zoom: ${Math.round(zoom * 100)}%` : ""}</span>
        <div className="flex items-center gap-3">
          {tool === "select" && <span className="text-amber-400">Klicken zum Auswählen, Ziehen zum Verschieben</span>}
          {tool === "pan" && <span className="text-amber-400">Ziehen zum Verschieben des Bildausschnitts</span>}
          {showSolution && <span className="text-green-400">Musterlösung wird angezeigt (gestrichelt)</span>}
        </div>
      </div>
    </div>
  );
}
