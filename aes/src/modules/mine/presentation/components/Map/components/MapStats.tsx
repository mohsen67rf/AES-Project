// src/modules/mine/presentation/components/Map/components/MapStats.tsx

interface MapStatsProps {
  points: number;
  lines: number;
  polygons: number;
  measurements: number;
}

export function MapStats({ points, lines, polygons, measurements }: MapStatsProps) {
  return (
    <div className="absolute bottom-20 left-4 z-20 flex gap-3 text-[10px] text-[#8A9DB0] bg-[#0A1628]/80 backdrop-blur px-3 py-1.5 rounded-lg border border-[#AACCDD]/20">
      <span>📍 {points}</span>
      <span>📏 {lines}</span>
      <span>🔷 {polygons}</span>
      <span>📐 {measurements}</span>
    </div>
  );
}