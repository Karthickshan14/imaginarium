import React from 'react';
import { GeneratedImage } from '../types';
import { Download, Maximize2, PenLine, Trash2 } from 'lucide-react';

interface ImageCardProps {
  image: GeneratedImage;
  onEdit: (image: GeneratedImage) => void;
  onDelete: (id: string) => void;
  onView: (image: GeneratedImage) => void;
}

export const ImageCard: React.FC<ImageCardProps> = ({ image, onEdit, onDelete, onView }) => {
  const handleDownload = (e: React.MouseEvent) => {
    e.stopPropagation();
    const link = document.createElement('a');
    link.href = image.url;
    link.download = `imaginarium-${image.id}.png`;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  return (
    <div className="group break-inside-avoid mb-8">
      <div 
        className="relative rounded-lg overflow-hidden cursor-pointer bg-slate-100 mb-3 transition-transform duration-300 hover:-translate-y-1"
        onClick={() => onView(image)}
      >
        <img
            src={image.url}
            alt={image.prompt}
            className="w-full h-auto object-cover"
            loading="lazy"
        />
        <div className="absolute inset-0 bg-black/0 group-hover:bg-black/20 transition-all flex items-center justify-center opacity-0 group-hover:opacity-100 gap-2">
            <button
                onClick={(e) => { e.stopPropagation(); onEdit(image); }}
                className="p-2 bg-white/90 rounded-full text-slate-900 hover:bg-white transition-colors"
                title="Use as reference"
            >
                <PenLine size={16} />
            </button>
             <button
                onClick={(e) => { e.stopPropagation(); onView(image); }}
                className="p-2 bg-white/90 rounded-full text-slate-900 hover:bg-white transition-colors"
                title="View"
            >
                <Maximize2 size={16} />
            </button>
             <button
                onClick={handleDownload}
                className="p-2 bg-white/90 rounded-full text-slate-900 hover:bg-white transition-colors"
                title="Download"
            >
                <Download size={16} />
            </button>
        </div>
      </div>
      
      <div className="flex items-start justify-between gap-4">
        <p className="text-slate-600 text-xs leading-relaxed line-clamp-2">
          {image.prompt}
        </p>
        <button
            onClick={() => onDelete(image.id)}
            className="text-slate-300 hover:text-red-500 transition-colors"
            title="Delete"
        >
            <Trash2 size={14} />
        </button>
      </div>
    </div>
  );
};
