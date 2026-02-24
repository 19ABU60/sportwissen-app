import { useState, useRef, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { 
  Circle, Minus, Eraser, RotateCcw, Eye, EyeOff, 
  MousePointer, Pencil, ChevronDown, Triangle, Compass
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
  { id: "angle", name: "Winkel zur Horizontalen", icon: Triangle },
  { id: "freeAngle", name: "Freier Winkel (2 Linien)", icon: Compass },
];

export function DrawingCanvas({ 
  imageSrc, 
  imageAlt,
  solutionMarkers = [], // Array of {type, x, y, x2, y2, color, label}
  tasks = ["Markiere die Technikmerkmale auf dem Bild"], // Array of tasks for dropdown
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
  
  // State for free angle tool (two-line angle)
  const [freeAngleFirstLine, setFreeAngleFirstLine] = useState(null);

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
    
    // Draw first line of freeAngle while waiting for second line
    if (freeAngleFirstLine && !currentDrawing) {
      drawShape(ctx, freeAngleFirstLine);
    }

    // Draw solution if enabled
    if (showSolution && solutionMarkers.length > 0) {
      solutionMarkers.forEach(marker => {
        drawShape(ctx, { ...marker, isSolution: true });
      });
    }
  }, [drawings, currentDrawing, freeAngleFirstLine, showSolution, solutionMarkers, canvasSize]);

  const drawShape = (ctx, shape) => {
    ctx.strokeStyle = shape.isSolution ? "#22c55e" : shape.color;
    ctx.fillStyle = shape.isSolution ? "rgba(34, 197, 94, 0.1)" : `${shape.color}20`;
    ctx.lineWidth = shape.isSolution ? 4 : 3;
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
    } else if (shape.type === "angle") {
      // Winkel zur Horizontalen - simplified without arc
      
      // Draw the user's line
      ctx.beginPath();
      ctx.moveTo(shape.x, shape.y);
      ctx.lineTo(shape.x2, shape.y2);
      ctx.stroke();

      // Calculate angle to horizontal
      const dx = shape.x2 - shape.x;
      const dy = shape.y2 - shape.y;
      const angleRad = Math.atan2(dy, dx);
      let angleDeg = (angleRad * 180) / Math.PI;
      
      // Normalize angle to be between -90 and 90 degrees
      if (angleDeg > 90) angleDeg = angleDeg - 180;
      if (angleDeg < -90) angleDeg = angleDeg + 180;
      
      const displayAngle = Math.abs(angleDeg).toFixed(1);
      
      // Draw horizontal reference line (dashed, subtle)
      const lineLength = Math.sqrt(dx * dx + dy * dy);
      const midX = (shape.x + shape.x2) / 2;
      const midY = (shape.y + shape.y2) / 2;
      
      ctx.save();
      ctx.setLineDash([4, 4]);
      ctx.strokeStyle = "#666666";
      ctx.lineWidth = 1;
      ctx.beginPath();
      ctx.moveTo(midX - lineLength / 2, midY);
      ctx.lineTo(midX + lineLength / 2, midY);
      ctx.stroke();
      ctx.restore();
      
      // Draw angle label with background
      const labelX = midX + 15;
      const labelY = midY - 10;
      const labelText = `${displayAngle}°`;
      
      ctx.save();
      ctx.font = "bold 16px sans-serif";
      const textWidth = ctx.measureText(labelText).width;
      
      // Background for better readability
      ctx.fillStyle = "rgba(0, 0, 0, 0.8)";
      ctx.fillRect(labelX - 6, labelY - 18, textWidth + 12, 26);
      
      // Text
      ctx.fillStyle = shape.isSolution ? "#22c55e" : shape.color;
      ctx.fillText(labelText, labelX, labelY);
      ctx.restore();
      
      // Draw small circles at endpoints
      ctx.save();
      ctx.fillStyle = shape.isSolution ? "#22c55e" : shape.color;
      ctx.beginPath();
      ctx.arc(shape.x, shape.y, 4, 0, 2 * Math.PI);
      ctx.fill();
      ctx.beginPath();
      ctx.arc(shape.x2, shape.y2, 4, 0, 2 * Math.PI);
      ctx.fill();
      ctx.restore();
      
    } else if (shape.type === "freeAngle") {
      // Freier Winkel - zwei Linien mit Winkelmessung
      
      // Draw first line
      ctx.beginPath();
      ctx.moveTo(shape.x, shape.y);
      ctx.lineTo(shape.x2, shape.y2);
      ctx.stroke();
      
      // Draw second line if exists
      if (shape.x3 !== undefined && shape.y3 !== undefined) {
        ctx.beginPath();
        ctx.moveTo(shape.x2, shape.y2); // Start from endpoint of first line (vertex)
        ctx.lineTo(shape.x3, shape.y3);
        ctx.stroke();
        
        // Calculate angle between the two lines
        // Vector 1: from vertex (x2,y2) to first point (x,y)
        const v1x = shape.x - shape.x2;
        const v1y = shape.y - shape.y2;
        // Vector 2: from vertex (x2,y2) to second point (x3,y3)
        const v2x = shape.x3 - shape.x2;
        const v2y = shape.y3 - shape.y2;
        
        // Calculate angle using dot product
        const dot = v1x * v2x + v1y * v2y;
        const mag1 = Math.sqrt(v1x * v1x + v1y * v1y);
        const mag2 = Math.sqrt(v2x * v2x + v2y * v2y);
        
        if (mag1 > 0 && mag2 > 0) {
          const cosAngle = Math.max(-1, Math.min(1, dot / (mag1 * mag2)));
          const angleDeg = (Math.acos(cosAngle) * 180) / Math.PI;
          const displayAngle = angleDeg.toFixed(1);
          
          // Draw angle label at vertex
          const labelX = shape.x2 + 15;
          const labelY = shape.y2 - 10;
          const labelText = `${displayAngle}°`;
          
          ctx.save();
          ctx.font = "bold 16px sans-serif";
          const textWidth = ctx.measureText(labelText).width;
          
          // Background
          ctx.fillStyle = "rgba(0, 0, 0, 0.8)";
          ctx.fillRect(labelX - 6, labelY - 18, textWidth + 12, 26);
          
          // Text
          ctx.fillStyle = shape.isSolution ? "#22c55e" : shape.color;
          ctx.fillText(labelText, labelX, labelY);
          ctx.restore();
        }
        
        // Draw circles at all three points
        ctx.save();
        ctx.fillStyle = shape.isSolution ? "#22c55e" : shape.color;
        [{ px: shape.x, py: shape.y }, { px: shape.x2, py: shape.y2 }, { px: shape.x3, py: shape.y3 }].forEach(p => {
          ctx.beginPath();
          ctx.arc(p.px, p.py, 4, 0, 2 * Math.PI);
          ctx.fill();
        });
        ctx.restore();
      } else {
        // Only first line drawn - show instruction
        ctx.save();
        ctx.font = "12px sans-serif";
        ctx.fillStyle = shape.color;
        ctx.fillText("2. Linie ziehen...", shape.x2 + 10, shape.y2 + 20);
        ctx.restore();
        
        // Draw circles at endpoints
        ctx.save();
        ctx.fillStyle = shape.isSolution ? "#22c55e" : shape.color;
        ctx.beginPath();
        ctx.arc(shape.x, shape.y, 4, 0, 2 * Math.PI);
        ctx.fill();
        ctx.beginPath();
        ctx.arc(shape.x2, shape.y2, 4, 0, 2 * Math.PI);
        ctx.fill();
        ctx.restore();
      }
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
    // For freeAngle tool: check if we're adding second line
    if (tool === "freeAngle" && freeAngleFirstLine) {
      // Start drawing second line from the vertex (endpoint of first line)
      setIsDrawing(true);
      setCurrentDrawing({
        type: "freeAngle",
        x: freeAngleFirstLine.x,
        y: freeAngleFirstLine.y,
        x2: freeAngleFirstLine.x2,
        y2: freeAngleFirstLine.y2,
        x3: pos.x,
        y3: pos.y,
        color: color
      });
      return;
    }
    
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
    
    // For freeAngle with second line being drawn
    if (currentDrawing.type === "freeAngle" && currentDrawing.x3 !== undefined) {
      setCurrentDrawing({
        ...currentDrawing,
        x3: pos.x,
        y3: pos.y
      });
      return;
    }
    
    setCurrentDrawing({
      ...currentDrawing,
      x2: pos.x,
      y2: pos.y
    });
  };

  const handleEnd = () => {
    if (currentDrawing) {
      const minSize = 5;
      const dx = Math.abs(currentDrawing.x2 - currentDrawing.x);
      const dy = Math.abs(currentDrawing.y2 - currentDrawing.y);
      
      // For freeAngle tool
      if (currentDrawing.type === "freeAngle") {
        // If this is the first line (no x3/y3 yet)
        if (currentDrawing.x3 === undefined) {
          if (dx > minSize || dy > minSize) {
            // Save first line and wait for second
            setFreeAngleFirstLine(currentDrawing);
          }
        } else {
          // This is the complete angle (both lines)
          const dx3 = Math.abs(currentDrawing.x3 - currentDrawing.x2);
          const dy3 = Math.abs(currentDrawing.y3 - currentDrawing.y2);
          if (dx3 > minSize || dy3 > minSize) {
            setDrawings([...drawings, currentDrawing]);
          }
          setFreeAngleFirstLine(null);
        }
      } else {
        // Normal tools
        if (dx > minSize || dy > minSize) {
          setDrawings([...drawings, currentDrawing]);
        }
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
    setFreeAngleFirstLine(null);
  };

  const undoLast = () => {
    setDrawings(drawings.slice(0, -1));
  };

  return (
    <div className="space-y-3">
      {/* Title */}
      <h2 className="font-oswald text-lg font-semibold tracking-wide text-white">
        {title}
      </h2>

      {/* Canvas with vertical toolbar on right */}
      <div className="flex gap-3">
        {/* Canvas container */}
        <div 
          ref={containerRef}
          className="relative rounded-lg overflow-hidden border-2 border-zinc-700 cursor-crosshair flex-1"
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

        {/* Vertical Toolbar on right */}
        <div className="flex flex-col gap-2 bg-zinc-800/50 border border-zinc-700 rounded-lg p-2">
          {/* Tools */}
          <div className="flex flex-col items-center gap-1 pb-2 border-b border-zinc-600">
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
          <div className="flex flex-col items-center gap-1 pb-2 border-b border-zinc-600">
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
          <div className="flex flex-col items-center gap-1 pb-2 border-b border-zinc-600">
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
            <button
              onClick={() => setShowSolution(!showSolution)}
              className={`p-2 rounded-lg transition-colors ${
                showSolution 
                  ? "bg-green-600 text-white" 
                  : "bg-zinc-700 text-zinc-300 hover:bg-zinc-600"
              }`}
              title={showSolution ? "Lösung ausblenden" : "Lösung zeigen"}
            >
              {showSolution ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
            </button>
          )}
        </div>
      </div>

      {/* Task dropdown - below image */}
      <div className="relative">
        <button
          onClick={() => setIsTaskMenuOpen(!isTaskMenuOpen)}
          className="w-full flex items-center justify-between bg-blue-500/10 border border-blue-500/30 rounded-lg p-3 hover:bg-blue-500/20 transition-colors"
        >
          <span className="text-blue-300 text-sm font-medium">
            {tasks[selectedTask]}
          </span>
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
                  onClick={() => {
                    setSelectedTask(index);
                    setIsTaskMenuOpen(false);
                  }}
                  className={`w-full text-left px-4 py-3 text-sm transition-colors ${
                    selectedTask === index 
                      ? "bg-blue-600 text-white" 
                      : "text-zinc-300 hover:bg-zinc-700"
                  }`}
                >
                  {task}
                </button>
              ))}
            </motion.div>
          )}
        </AnimatePresence>
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
