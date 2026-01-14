import React, { useState, useRef } from 'react';
import { Upload, X, Image as ImageIcon, PenTool } from 'lucide-react';
import { UploadedImage } from '../types';

interface ImageUploaderProps {
  onImageSelect: (image: UploadedImage | null) => void;
  onEdit?: (image: UploadedImage) => void;
  disabled?: boolean;
}

export const ImageUploader: React.FC<ImageUploaderProps> = ({ onImageSelect, onEdit, disabled }) => {
  const [preview, setPreview] = useState<string | null>(null);
  const [isDragging, setIsDragging] = useState(false);
  const [currentImage, setCurrentImage] = useState<UploadedImage | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const processFile = (file: File) => {
    if (!file.type.startsWith('image/')) return;
    
    const reader = new FileReader();
    reader.onloadend = () => {
      const result = reader.result as string;
      setPreview(result);
      
      const match = result.match(/^data:(.+);base64,(.+)$/);
      if (match) {
        const img = {
          mimeType: match[1],
          data: match[2],
          previewUrl: result
        };
        setCurrentImage(img);
        onImageSelect(img);
      }
    };
    reader.readAsDataURL(file);
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(false);
    if (disabled) return;
    
    if (e.dataTransfer.files && e.dataTransfer.files[0]) {
      processFile(e.dataTransfer.files[0]);
    }
  };

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      processFile(e.target.files[0]);
    }
  };

  const clearImage = (e: React.MouseEvent) => {
    e.stopPropagation();
    setPreview(null);
    setCurrentImage(null);
    onImageSelect(null);
    if (fileInputRef.current) {
      fileInputRef.current.value = '';
    }
  };

  return (
    <div className="w-full">
      <input
        type="file"
        ref={fileInputRef}
        onChange={handleChange}
        accept="image/*"
        className="hidden"
        disabled={disabled}
      />
      
      {!preview ? (
        <div
          onClick={() => !disabled && fileInputRef.current?.click()}
          onDragOver={(e) => { e.preventDefault(); setIsDragging(true); }}
          onDragLeave={() => setIsDragging(false)}
          onDrop={handleDrop}
          className={`
            aspect-[4/3] rounded-2xl border border-dashed transition-all duration-200 cursor-pointer
            flex flex-col items-center justify-center text-center
            ${isDragging ? 'bg-slate-50 border-slate-400' : 'bg-white border-slate-200 hover:border-slate-300 hover:bg-slate-50'}
            ${disabled ? 'opacity-50 cursor-not-allowed' : ''}
          `}
        >
          <div className="p-3 bg-slate-100 rounded-full mb-3 text-slate-500">
            <Upload size={20} />
          </div>
          <p className="text-sm font-medium text-slate-900">
            Click to upload or drag and drop
          </p>
          <p className="text-xs text-slate-400 mt-1">
            JPG, PNG
          </p>
        </div>
      ) : (
        <div className="relative rounded-2xl overflow-hidden group shadow-sm">
             <img 
                src={preview} 
                alt="Reference" 
                className="w-full h-auto object-cover" 
            />
             {/* Overlay Controls */}
             <div className="absolute inset-0 bg-slate-900/40 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center gap-3 backdrop-blur-sm">
                {onEdit && currentImage && (
                    <button
                        onClick={(e) => { e.stopPropagation(); onEdit(currentImage); }}
                        className="flex items-center gap-2 bg-white text-slate-900 px-4 py-2 rounded-full text-xs font-medium hover:bg-slate-100 transition-colors shadow-sm"
                    >
                        <PenTool size={14} /> Draw
                    </button>
                )}
                 <button
                    onClick={clearImage}
                    className="flex items-center gap-2 bg-white/20 backdrop-blur text-white px-4 py-2 rounded-full text-xs font-medium hover:bg-white/30 transition-colors"
                >
                    <X size={14} /> Remove
                </button>
             </div>
        </div>
      )}
    </div>
  );
};
