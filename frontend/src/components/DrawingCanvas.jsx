import { useState, useRef, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { 
  Circle, Minus, Eraser, RotateCcw, Eye, EyeOff, 
  MousePointer, Pencil
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
  { id: "circle", name: "Kreis", icon: Circle },
  { id: "line", name: "Linie", icon: Minus },
  { id: "arrow", name: "Pfeil", icon: Pencil },
];

export function DrawingCanvas({ 
  imageSrc, 
  imageAlt,
  solutionMarkers = [], // Array of {type, x, y, x2, y2, color, label}
  task = "Markiere die Technikmerkmale auf dem Bild"
}) {
  const canvasRef = useRef(null);
  const containerRef = useRef(null);
  const [isDrawing, setIsDrawing] = useState(false);
  const [tool, setTool] = useState("circle");
  const [color, setColor] = useState(COLORS[0].value);
  const [drawings, setDrawings] = useState([]);
  const [currentDrawing, setCurrentDrawing] = useState(null);
  const [showSolution, setShowSolution] = useState(false);
  const [showLightbox, setShowLightbox] = useState(false);
  const [canvasSize, setCanvasSize] = useState({ width: 0, height: 0 });

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

  // Draw on canvas
  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    const ctx = canvas.getContext("2d");
    ctx.clearRect(0, 0, canvas.width, canvas.height);

    // Draw all saved drawings
    drawings.forEach(drawing => drawShape(ctx, drawing));

    // Draw current drawing in progress
    if (currentDrawing) {
      drawShape(ctx, currentDrawing);
    }

    // Draw solution if enabled
    if (showSolution && solutionMarkers.length > 0) {
      solutionMarkers.forEach(marker => {
        drawShape(ctx, { ...marker, isSolution: true });
      });
    }
  }, [drawings, currentDrawing, showSolution, solutionMarkers, canvasSize]);

  const drawShape = (ctx, shape) => {
    ctx.strokeStyle = shape.isSolution ? "#22c55e" : shape.color;
    ctx.fillStyle = shape.isSolution ? "rgba(34, 197, 94, 0.1)" : `${shape.color}20`;
    ctx.lineWidth = shape.isSolution ? 3 : 2;
    ctx.setLineDash(shape.isSolution ? [5, 5] : []);

    if (shape.type === "circle") {
      const radius = Math.sqrt(
        Math.pow(shape.x2 - shape.x, 2) + Math.pow(shape.y2 - shape.y, 2)
      );
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
      // Draw line
      ctx.beginPath();
      ctx.moveTo(shape.x, shape.y);
      ctx.lineTo(shape.x2, shape.y2);
      ctx.stroke();

      // Draw arrowhead
      const angle = Math.atan2(shape.y2 - shape.y, shape.x2 - shape.x);
      const headLength = 15;
      ctx.beginPath();
      ctx.moveTo(shape.x2, shape.y2);
      ctx.lineTo(
        shape.x2 - headLength * Math.cos(angle - Math.PI / 6),
        shape.y2 - headLength * Math.sin(angle - Math.PI / 6)
      );
      ctx.moveTo(shape.x2, shape.y2);
      ctx.lineTo(
        shape.x2 - headLength * Math.cos(angle + Math.PI / 6),
        shape.y2 - headLength * Math.sin(angle + Math.PI / 6)
      );
      ctx.stroke();
    }

    // Draw label for solution
    if (shape.isSolution && shape.label) {
      ctx.font = "12px sans-serif";
      ctx.fillStyle = "#22c55e";
      ctx.fillText(shape.label, shape.x + 5, shape.y - 10);
    }

    ctx.setLineDash([]);
  };

  const getMousePos = (e) => {
    const canvas = canvasRef.current;
    const rect = canvas.getBoundingClientRect();
    const scaleX = canvas.width / rect.width;
    const scaleY = canvas.height / rect.height;
    
    return {
      x: (e.clientX - rect.left) * scaleX,
      y: (e.clientY - rect.top) * scaleY
    };
  };

  const getTouchPos = (e) => {
    const canvas = canvasRef.current;
    const rect = canvas.getBoundingClientRect();
    const scaleX = canvas.width / rect.width;
    const scaleY = canvas.height / rect.height;
    const touch = e.touches[0];
    
    return {
      x: (touch.clientX - rect.left) * scaleX,
      y: (touch.clientY - rect.top) * scaleY
    };
  };

  const handleStart = (pos) => {
    setIsDrawing(true);
    setCurrentDrawing({
      type: tool,
      x: pos.x,
      y: pos.y,
      x2: pos.x,
      y2: pos.y,
      color: color
    });
  };

  const handleMove = (pos) => {
    if (!isDrawing || !currentDrawing) return;
    setCurrentDrawing({
      ...currentDrawing,
      x2: pos.x,
      y2: pos.y
    });
  };

  const handleEnd = () => {
    if (currentDrawing) {
      // Only save if shape has some size
      const minSize = 5;
      const dx = Math.abs(currentDrawing.x2 - currentDrawing.x);
      const dy = Math.abs(currentDrawing.y2 - currentDrawing.y);
      if (dx > minSize || dy > minSize) {
        setDrawings([...drawings, currentDrawing]);
      }
    }
    setIsDrawing(false);
    setCurrentDrawing(null);
  };

  // Mouse events
  const handleMouseDown = (e) => handleStart(getMousePos(e));
  const handleMouseMove = (e) => handleMove(getMousePos(e));
  const handleMouseUp = () => handleEnd();

  // Touch events
  const handleTouchStart = (e) => {
    e.preventDefault();
    handleStart(getTouchPos(e));
  };
  const handleTouchMove = (e) => {
    e.preventDefault();
    handleMove(getTouchPos(e));
  };
  const handleTouchEnd = (e) => {
    e.preventDefault();
    handleEnd();
  };

  const clearAll = () => {
    setDrawings([]);
    setCurrentDrawing(null);
  };

  const undoLast = () => {
    setDrawings(drawings.slice(0, -1));
  };

  return (
    <div className="space-y-3">
      {/* Task description */}
      <div className="bg-blue-500/10 border border-blue-500/30 rounded-lg p-3">
        <p className="text-blue-300 text-sm font-medium">{task}</p>
      </div>

      {/* Toolbar */}
      <div className="flex flex-wrap items-center gap-2 bg-zinc-800/50 border border-zinc-700 rounded-lg p-2">
        {/* Tools */}
        <div className="flex items-center gap-1 border-r border-zinc-600 pr-2">
          {TOOLS.map((t) => (
            <button
              key={t.id}
              onClick={() => setTool(t.id)}
              className={`p-2 rounded-lg transition-colors ${
                tool === t.id 
                  ? "bg-blue-600 text-white" 
                  : "bg-zinc-700 text-zinc-300 hover:bg-zinc-600"
              }`}
              title={t.name}
            >
              <t.icon className="w-4 h-4" />
            </button>
          ))}
        </div>

        {/* Colors */}
        <div className="flex items-center gap-1 border-r border-zinc-600 pr-2">
          {COLORS.map((c) => (
            <button
              key={c.value}
              onClick={() => setColor(c.value)}
              className={`w-6 h-6 rounded-full border-2 transition-transform ${
                color === c.value 
                  ? "border-white scale-110" 
                  : "border-zinc-500 hover:scale-105"
              }`}
              style={{ backgroundColor: c.value }}
              title={c.name}
            />
          ))}
        </div>

        {/* Actions */}
        <div className="flex items-center gap-1">
          <button
            onClick={undoLast}
            disabled={drawings.length === 0}
            className="p-2 rounded-lg bg-zinc-700 text-zinc-300 hover:bg-zinc-600 disabled:opacity-50 disabled:cursor-not-allowed"
            title="Letzte Zeichnung entfernen"
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
          <div className="flex items-center gap-1 ml-auto">
            <button
              onClick={() => setShowSolution(!showSolution)}
              className={`flex items-center gap-2 px-3 py-2 rounded-lg transition-colors ${
                showSolution 
                  ? "bg-green-600 text-white" 
                  : "bg-zinc-700 text-zinc-300 hover:bg-zinc-600"
              }`}
            >
              {showSolution ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
              <span className="text-xs font-medium">
                {showSolution ? "Lösung ausblenden" : "Lösung zeigen"}
              </span>
            </button>
          </div>
        )}
      </div>

      {/* Canvas container */}
      <div 
        ref={containerRef}
        className="relative rounded-lg overflow-hidden border-2 border-zinc-700 cursor-crosshair"
        style={{ touchAction: "none" }}
      >
        {/* Background image */}
        {imageSrc ? (
          <img 
            src={imageSrc} 
            alt={imageAlt}
            className="w-full h-auto"
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

        {/* Drawing canvas overlay */}
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
      </div>

      {/* Drawing count */}
      <div className="flex items-center justify-between text-xs text-zinc-500">
        <span>{drawings.length} Markierung(en)</span>
        {showSolution && (
          <span className="text-green-400">Musterlösung wird angezeigt (gestrichelt)</span>
        )}
      </div>
    </div>
  );
}
