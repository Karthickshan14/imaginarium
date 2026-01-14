import React, { useEffect } from 'react';
import { X } from 'lucide-react';
import { GeneratedImage } from '../types';

interface ImageLightboxProps {
  image: GeneratedImage;
  onClose: () => void;
}

export const ImageLightbox: React.FC<ImageLightboxProps> = ({ image, onClose }) => {
  useEffect(() => {
    const handleEsc = (e: KeyboardEvent) => {
      if (e.key === 'Escape') onClose();
    };
    window.addEventListener('keydown', handleEsc);
    document.body.style.overflow = 'hidden';
    
    return () => {
      window.removeEventListener('keydown', handleEsc);
      document.body.style.overflow = 'unset';
    };
  }, [onClose]);

  return (
    <div 
      className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-white/95 backdrop-blur-sm animate-fadeIn"
      onClick={onClose}
    >
      <button 
        onClick={onClose}
        className="absolute top-6 right-6 p-2 rounded-full bg-slate-100 text-slate-500 hover:bg-slate-200 transition-colors z-50"
        title="Close"
      >
        <X size={24} />
      </button>

      <div 
        className="relative max-w-full max-h-full flex flex-col items-center justify-center pointer-events-none"
      >
        <div 
            className="pointer-events-auto shadow-2xl rounded-lg overflow-hidden"
            onClick={(e) => e.stopPropagation()}
        >
            <img 
            src={image.url} 
            alt={image.prompt} 
            className="max-w-full max-h-[85vh] object-contain"
            />
        </div>
        <p className="mt-6 text-slate-500 font-light text-sm text-center max-w-2xl px-4 pointer-events-auto">
            {image.prompt}
        </p>
      </div>
    </div>
  );
};
