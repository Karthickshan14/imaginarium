import React from 'react';
import { AspectRatio } from '../types';
import { Square, RectangleHorizontal, RectangleVertical, Monitor, Smartphone } from 'lucide-react';

interface AspectRatioSelectorProps {
  selectedRatio: AspectRatio;
  onSelect: (ratio: AspectRatio) => void;
  disabled?: boolean;
}

export const AspectRatioSelector: React.FC<AspectRatioSelectorProps> = ({ selectedRatio, onSelect, disabled }) => {
  const ratios = [
    { value: AspectRatio.Square, label: 'Square', icon: Square },
    { value: AspectRatio.Landscape, label: 'Landscape', icon: Monitor },
    { value: AspectRatio.Portrait, label: 'Portrait', icon: Smartphone },
    { value: AspectRatio.Wide, label: '4:3', icon: RectangleHorizontal },
    { value: AspectRatio.Tall, label: '3:4', icon: RectangleVertical },
  ];

  return (
    <div className="flex flex-wrap gap-2">
      {ratios.map((ratio) => {
        const Icon = ratio.icon;
        const isSelected = selectedRatio === ratio.value;
        return (
          <button
            key={ratio.value}
            onClick={() => onSelect(ratio.value)}
            disabled={disabled}
            className={`
              flex items-center gap-2 px-3 py-2 rounded-lg text-xs font-medium transition-all
              ${isSelected 
                ? 'bg-slate-900 text-white shadow-md' 
                : 'bg-white border border-slate-200 text-slate-600 hover:border-slate-300 hover:bg-slate-50'}
              ${disabled ? 'opacity-50 cursor-not-allowed' : 'cursor-pointer'}
            `}
          >
            <Icon size={14} />
            <span>{ratio.label}</span>
          </button>
        );
      })}
    </div>
  );
};
