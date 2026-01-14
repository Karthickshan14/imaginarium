import React, { useRef, useState, useEffect } from 'react';
import { Pencil, Eraser, Trash2, Highlighter } from 'lucide-react';
import { UploadedImage } from '../types';

interface DrawingCanvasProps {
  onImageChange: (image: UploadedImage | null) => void;
  onMaskingUsed?: (used: boolean) => void;
  disabled?: boolean;
  initialImage?: string | null;
}

export const DrawingCanvas: React.FC<DrawingCanvasProps> = ({ onImageChange, onMaskingUsed, disabled, initialImage }) => {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const [isDrawing, setIsDrawing] = useState(false);
  const [tool, setTool] = useState<'pencil' | 'eraser' | 'mask'>('pencil');
  
  // Initialize and handle image loading
  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    // Default setup
    ctx.lineCap = 'round';
    ctx.lineJoin = 'round';

    const loadImage = async () => {
        if (initialImage) {
            const img = new Image();
            img.crossOrigin = "anonymous";
            img.onload = () => {
                ctx.clearRect(0, 0, canvas.width, canvas.height);
                ctx.drawImage(img, 0, 0, canvas.width, canvas.height);
                exportImage();
            };
            img.src = initialImage;
        } else {
            ctx.fillStyle = '#FFFFFF';
            ctx.fillRect(0, 0, canvas.width, canvas.height);
            onImageChange(null);
        }
    };

    loadImage();

  }, [initialImage]);

  const getCoordinates = (e: React.PointerEvent) => {
    if (!canvasRef.current) return { x: 0, y: 0 };
    const rect = canvasRef.current.getBoundingClientRect();
    const scaleX = canvasRef.current.width / rect.width;
    const scaleY = canvasRef.current.height / rect.height;
    return {
      x: (e.clientX - rect.left) * scaleX,
      y: (e.clientY - rect.top) * scaleY
    };
  };

  const startDrawing = (e: React.PointerEvent) => {
    if (disabled) return;
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    const { x, y } = getCoordinates(e);
    
    ctx.beginPath();
    ctx.moveTo(x, y);
    
    if (tool === 'pencil') {
        ctx.globalCompositeOperation = 'source-over';
        ctx.strokeStyle = '#0f172a'; // Slate 900
        ctx.lineWidth = 3;
        ctx.globalAlpha = 1.0;
    } else if (tool === 'mask') {
        ctx.globalCompositeOperation = 'source-over';
        ctx.strokeStyle = '#ec4899'; // Pink 500
        ctx.lineWidth = 25;
        ctx.globalAlpha = 0.4;
        if (onMaskingUsed) onMaskingUsed(true);
    } else {
        ctx.globalCompositeOperation = 'source-over';
        ctx.strokeStyle = '#FFFFFF';
        ctx.lineWidth = 30;
        ctx.globalAlpha = 1.0;
    }

    setIsDrawing(true);
    canvas.setPointerCapture(e.pointerId);
  };

  const draw = (e: React.PointerEvent) => {
    if (!isDrawing || disabled) return;
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    const { x, y } = getCoordinates(e);
    ctx.lineTo(x, y);
    ctx.stroke();
  };

  const stopDrawing = (e: React.PointerEvent) => {
    if (!isDrawing) return;
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    ctx.closePath();
    setIsDrawing(false);
    canvas.releasePointerCapture(e.pointerId);
    
    // Reset context state
    ctx.globalAlpha = 1.0;
    
    exportImage();
  };

  const clearCanvas = () => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    ctx.fillStyle = '#FFFFFF';
    ctx.fillRect(0, 0, canvas.width, canvas.height);
    if (onMaskingUsed) onMaskingUsed(false);
    onImageChange(null);
  };

  const exportImage = () => {
      const canvas = canvasRef.current;
      if (!canvas) return;

      const dataUrl = canvas.toDataURL('image/png');
      const match = dataUrl.match(/^data:(.+);base64,(.+)$/);
      
      if (match) {
        onImageChange({
          mimeType: match[1],
          data: match[2],
          previewUrl: dataUrl
        });
      }
  };

  return (
    <div className="w-full border border-slate-200 rounded-2xl overflow-hidden bg-white shadow-sm">
      {/* Canvas Area */}
      <div className="relative w-full aspect-[4/3] cursor-crosshair">
          <canvas
              ref={canvasRef}
              width={800}
              height={600}
              className="w-full h-full touch-none bg-white object-contain"
              onPointerDown={startDrawing}
              onPointerMove={draw}
              onPointerUp={stopDrawing}
              onPointerLeave={stopDrawing}
          />
      </div>

       {/* Minimal Toolbar */}
      <div className="flex items-center justify-center gap-4 py-3 border-t border-slate-100 bg-slate-50/50">
          <button
              type="button"
              onClick={() => setTool('pencil')}
              className={`p-2 rounded-lg transition-all ${tool === 'pencil' ? 'bg-white shadow text-slate-900' : 'text-slate-400 hover:text-slate-600'}`}
              title="Pencil"
              disabled={disabled}
          >
              <Pencil size={18} />
          </button>
          <button
              type="button"
              onClick={() => setTool('mask')}
              className={`p-2 rounded-lg transition-all ${tool === 'mask' ? 'bg-white shadow text-pink-500' : 'text-slate-400 hover:text-pink-400'}`}
              title="Highlight area to modify"
              disabled={disabled}
          >
              <Highlighter size={18} />
          </button>
          <button
              type="button"
              onClick={() => setTool('eraser')}
              className={`p-2 rounded-lg transition-all ${tool === 'eraser' ? 'bg-white shadow text-slate-900' : 'text-slate-400 hover:text-slate-600'}`}
              title="Eraser"
              disabled={disabled}
          >
              <Eraser size={18} />
          </button>
          <div className="w-px h-4 bg-slate-200 mx-2"></div>
          <button
              type="button"
              onClick={clearCanvas}
              className="p-2 rounded-lg text-slate-400 hover:text-red-500 transition-colors"
              title="Clear All"
              disabled={disabled}
          >
              <Trash2 size={18} />
          </button>
      </div>
    </div>
  );
};
