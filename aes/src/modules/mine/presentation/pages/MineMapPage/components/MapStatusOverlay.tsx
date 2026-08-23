// src/modules/mine/presentation/pages/MineMapPage/components/MapStatusOverlay.tsx

interface MapStatusOverlayProps {
  activeTool: string;
  isDrawing: boolean;
  tempPoints: any[];
  distance: number;
  selectedPitId: string | null;
  hasGeoData: boolean;
  isDark: boolean;
}

export function MapStatusOverlay({
  activeTool,
  isDrawing,
  tempPoints,
  distance,
  selectedPitId,
  hasGeoData,
  isDark,
}: MapStatusOverlayProps) {
  return (
    <>
      {activeTool === 'select' && (
        <div className="absolute top-4 left-1/2 -translate-x-1/2 z-10 pointer-events-none">
          <div className="bg-[#C9A227]/20 backdrop-blur border border-[#C9A227]/30 rounded-xl px-4 py-2 text-center">
            <span className="text-xs text-[#C9A227]">
              ✏️ روی ترسیم مورد نظر کلیک کنید تا ویرایش یا حذف شود
            </span>
          </div>
        </div>
      )}

      {activeTool === 'haulRoute' && isDrawing && (
        <div className="absolute top-4 left-1/2 -translate-x-1/2 z-10 pointer-events-none">
          <div className="bg-[#C9A227]/20 backdrop-blur border border-[#C9A227]/30 rounded-xl px-4 py-2 text-center">
            <span className="text-xs text-[#C9A227]">
              🚛 روی نقشه کلیک کنید تا مسیر حمل را رسم کنید (برای پایان، دوبار
              کلیک کنید)
            </span>
          </div>
        </div>
      )}

      {activeTool === 'haulRoute' && isDrawing && tempPoints.length > 0 && (
        <div className="absolute bottom-24 left-1/2 -translate-x-1/2 z-10 pointer-events-none">
          <div className="bg-[#0A1628]/80 backdrop-blur border border-[#C9A227]/30 rounded-xl px-4 py-2 text-center">
            <span className="text-xs text-[#8A9DB0]">
              📍 {tempPoints.length} نقطه •
              <span className="text-[#C9A227] ml-1">
                {distance > 0
                  ? `${distance.toFixed(0)} متر`
                  : 'در حال رسم...'}
              </span>
            </span>
          </div>
        </div>
      )}

      {selectedPitId && !hasGeoData && (
        <div className="absolute inset-0 flex items-center justify-center z-10 pointer-events-none">
          <div className="bg-[#0A1628]/80 backdrop-blur border border-[#C9A227]/30 rounded-2xl px-8 py-6 text-center max-w-md">
            <div className="text-4xl mb-3">🗺️</div>
            <h3
              className={`text-lg font-bold ${
                isDark ? 'text-white' : 'text-gray-800'
              }`}
            >
              هیچ نقشه‌ای برای این پیت وجود ندارد
            </h3>
            <p
              className={`text-sm ${isDark ? 'text-[#8A9DB0]' : 'text-gray-500'} mt-2`}
            >
              برای بارگذاری نقشه، روی دکمه{' '}
              <span className="text-[#C9A227]">"بارگذاری نقشه"</span> کلیک کنید
            </p>
          </div>
        </div>
      )}
    </>
  );
}

export default MapStatusOverlay;