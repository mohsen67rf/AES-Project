// src/modules/mine/presentation/components/Map/controls/ZoomControls.tsx

import { PlusIcon, MinusIcon, ArrowsPointingOutIcon } from '@heroicons/react/24/outline';

interface ZoomControlsProps {
  map: any;
  className?: string;
}

export function ZoomControls({ map, className = '' }: ZoomControlsProps) {
  const handleZoomIn = () => {
    if (map) map.zoomIn();
  };

  const handleZoomOut = () => {
    if (map) map.zoomOut();
  };

  const handleZoomToFit = () => {
    if (!map) return;
    map.setView([31.5, 54.3], 10);
  };

  return (
    <div className={`flex flex-col gap-1 ${className}`}>
      <button
        onClick={handleZoomIn}
        className="p-2 rounded-lg bg-[#0A1628]/90 backdrop-blur border border-[#AACCDD]/20 text-[#AACCDD] hover:bg-[#1A2A3A] transition-colors"
        title="بزرگنمایی داخل"
      >
        <PlusIcon className="w-4 h-4" />
      </button>
      <button
        onClick={handleZoomOut}
        className="p-2 rounded-lg bg-[#0A1628]/90 backdrop-blur border border-[#AACCDD]/20 text-[#AACCDD] hover:bg-[#1A2A3A] transition-colors"
        title="بزرگنمایی خارج"
      >
        <MinusIcon className="w-4 h-4" />
      </button>
      <button
        onClick={handleZoomToFit}
        className="p-2 rounded-lg bg-[#0A1628]/90 backdrop-blur border border-[#AACCDD]/20 text-[#AACCDD] hover:bg-[#1A2A3A] transition-colors"
        title="نمایش کامل"
      >
        <ArrowsPointingOutIcon className="w-4 h-4" />
      </button>
    </div>
  );
}