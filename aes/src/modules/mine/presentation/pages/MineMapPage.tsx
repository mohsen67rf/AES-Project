// src/modules/mine/presentation/pages/MineMapPage.tsx

import { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { useTheme } from '../../../../shared/context/ThemeContext';
import { Map, BaseMapType } from '../components/Map';
import { MapUploader } from '../components/MapUploader/MapUploader';
import { MapToolbar } from '../components/Map/components/MapToolbar';
import { MapStats } from '../components/Map/components/MapStats';
import { 
  DocumentArrowUpIcon, 
  PaintBrushIcon, 
  XMarkIcon,
  CheckIcon
} from '@heroicons/react/24/outline';
import { mapDatabase } from '../../../../core/infrastructure/database/MapDatabaseService';

// ============================================
// مودال تنظیمات نقشه
// ============================================

function MapSettingsModal({ 
  isOpen,
  onClose,
  backgroundColor, 
  onBackgroundChange,
  baseMapType,
  onBaseMapTypeChange,
  baseMapOpacity,
  onBaseMapOpacityChange,
}: {
  isOpen: boolean;
  onClose: () => void;
  backgroundColor: string;
  onBackgroundChange: (color: string) => void;
  baseMapType: BaseMapType;
  onBaseMapTypeChange: (type: BaseMapType) => void;
  baseMapOpacity: number;
  onBaseMapOpacityChange: (opacity: number) => void;
}) {
  const { isDark } = useTheme();
  const [selectedColor, setSelectedColor] = useState(backgroundColor);
  const [tempBaseMapType, setTempBaseMapType] = useState<BaseMapType>(baseMapType);
  const [tempOpacity, setTempOpacity] = useState(baseMapOpacity);
  const [hexInput, setHexInput] = useState(backgroundColor);

  // پالت رنگ‌ها
  const colorPalette = {
    dark: ['#0a1628', '#1a1a2e', '#16213e', '#0f3460', '#1b1b2f', '#2d2d2d', '#1e1e1e', '#000000'],
    gray: ['#111111', '#222222', '#333333', '#444444', '#555555', '#666666', '#777777', '#888888'],
    darkColors: [
      '#1a0a0a', '#0a1a0a', '#0a0a1a', '#1a0a1a', '#1a1a0a', '#0a1a1a',
      '#2d1a0a', '#0a2d1a', '#1a0a2d', '#2d0a1a', '#1a2d0a', '#0a1a2d',
      '#4a1a0a', '#0a4a1a', '#1a0a4a', '#4a0a1a', '#1a4a0a', '#0a1a4a'
    ],
    soft: ['#2c3e50', '#34495e', '#2c3e6b', '#3d3d5c', '#4a3d5c', '#5c3d4a', '#3d5c4a', '#4a5c3d', '#5c4a3d', '#3d4a5c', '#4a3d5c', '#5c3d4a'],
  };

  const allColors = [...colorPalette.dark, ...colorPalette.gray, ...colorPalette.darkColors, ...colorPalette.soft];

  const handleColorSelect = (color: string) => {
    setSelectedColor(color);
    setHexInput(color);
  };

  const handleHexChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const value = e.target.value;
    setHexInput(value);
    if (/^#[0-9A-Fa-f]{6}$/.test(value)) {
      setSelectedColor(value);
    }
  };

  const handleCustomColorChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const color = e.target.value;
    setSelectedColor(color);
    setHexInput(color);
  };

  const handleApply = () => {
    onBackgroundChange(selectedColor);
    onBaseMapTypeChange(tempBaseMapType);
    onBaseMapOpacityChange(tempOpacity);
    onClose();
  };

  const handleClose = () => {
    setSelectedColor(backgroundColor);
    setHexInput(backgroundColor);
    setTempBaseMapType(baseMapType);
    setTempOpacity(baseMapOpacity);
    onClose();
  };

  if (!isOpen) return null;

  return (
    <>
      <div className="fixed inset-0 z-[9999] bg-black/60 backdrop-blur-sm animate-in fade-in duration-300" onClick={handleClose} />
      <div className="fixed inset-0 z-[10000] flex items-center justify-center p-4 pointer-events-none">
        <div className="pointer-events-auto w-full max-w-md animate-in zoom-in-95 slide-in-from-bottom-10 duration-300">
          <div className={`relative rounded-2xl shadow-2xl overflow-hidden border max-h-[90vh] flex flex-col ${
            isDark ? 'bg-[#0A1628] border-[#AACCDD]/20' : 'bg-white border-gray-200/50'
          }`}>
            
            {/* هدر */}
            <div className={`px-6 py-4 border-b flex items-center justify-between flex-shrink-0 ${
              isDark ? 'border-[#AACCDD]/10' : 'border-gray-100'
            }`}>
              <div className="flex items-center gap-3">
                <div className={`w-8 h-8 rounded-xl flex items-center justify-center ${
                  isDark ? 'bg-[#C9A227]/20' : 'bg-[#C9A227]/10'
                }`}>
                  <PaintBrushIcon className={`w-4 h-4 ${isDark ? 'text-[#C9A227]' : 'text-[#C9A227]'}`} />
                </div>
                <div>
                  <h3 className={`text-sm font-bold ${isDark ? 'text-white' : 'text-gray-800'}`}>🎨 تنظیمات نقشه</h3>
                  <p className={`text-[10px] ${isDark ? 'text-[#4A6A8A]' : 'text-gray-400'}`}>شخصی‌سازی کامل ظاهر نقشه</p>
                </div>
              </div>
              <button onClick={handleClose} className={`p-1.5 rounded-lg transition-all hover:scale-110 ${
                isDark ? 'hover:bg-white/5 text-[#8A9DB0] hover:text-white' : 'hover:bg-gray-100 text-gray-500 hover:text-gray-800'
              }`}>
                <XMarkIcon className="w-5 h-5" />
              </button>
            </div>

            {/* محتوا */}
            <div className="px-6 py-4 space-y-4 overflow-y-auto flex-1">
              
              {/* انتخاب رنگ */}
              <div>
                <label className={`text-xs block mb-2 ${isDark ? 'text-[#8A9DB0]' : 'text-gray-500'}`}>🎨 رنگ پس‌زمینه</label>
                <div className="flex items-center gap-3 mb-3">
                  <input type="color" value={selectedColor} onChange={handleCustomColorChange} className="w-12 h-12 rounded-xl cursor-pointer border-2 border-[#AACCDD]/20 p-0.5 bg-transparent" />
                  <div className="flex-1">
                    <input type="text" value={hexInput} onChange={handleHexChange} placeholder="#000000" className={`w-full px-3 py-2 rounded-lg border text-sm font-mono focus:outline-none ${
                      isDark ? 'bg-white/5 border-[#AACCDD]/10 text-white placeholder-[#4A6A8A] focus:border-[#AACCDD]/30' : 'bg-gray-100 border-gray-200 text-gray-800 placeholder-gray-400 focus:border-[#1A2A3A]/30'
                    }`} />
                    <p className={`text-[8px] mt-1 ${isDark ? 'text-[#4A6A8A]' : 'text-gray-400'}`}>کد HEX دقیق را وارد کنید</p>
                  </div>
                  <div className="w-12 h-12 rounded-xl border-2 border-[#AACCDD]/20 flex-shrink-0" style={{ backgroundColor: selectedColor }} />
                </div>

                <div className="space-y-2">
                  <p className={`text-[9px] ${isDark ? 'text-[#4A6A8A]' : 'text-gray-400'}`}>🌑 رنگ‌های تیره</p>
                  <div className="flex flex-wrap gap-1.5">
                    {colorPalette.dark.map((color) => (
                      <button key={color} onClick={() => handleColorSelect(color)} className={`w-7 h-7 rounded-full border-2 transition-all ${
                        selectedColor === color ? 'border-white scale-110 shadow-lg' : 'border-transparent hover:scale-105'
                      }`} style={{ backgroundColor: color }} />
                    ))}
                  </div>
                  <p className={`text-[9px] mt-2 ${isDark ? 'text-[#4A6A8A]' : 'text-gray-400'}`}>🌫️ رنگ‌های طوسی</p>
                  <div className="flex flex-wrap gap-1.5">
                    {colorPalette.gray.map((color) => (
                      <button key={color} onClick={() => handleColorSelect(color)} className={`w-7 h-7 rounded-full border-2 transition-all ${
                        selectedColor === color ? 'border-white scale-110 shadow-lg' : 'border-transparent hover:scale-105'
                      }`} style={{ backgroundColor: color }} />
                    ))}
                  </div>
                  <p className={`text-[9px] mt-2 ${isDark ? 'text-[#4A6A8A]' : 'text-gray-400'}`}>🌈 رنگ‌های تیره</p>
                  <div className="flex flex-wrap gap-1.5">
                    {colorPalette.darkColors.map((color) => (
                      <button key={color} onClick={() => handleColorSelect(color)} className={`w-7 h-7 rounded-full border-2 transition-all ${
                        selectedColor === color ? 'border-white scale-110 shadow-lg' : 'border-transparent hover:scale-105'
                      }`} style={{ backgroundColor: color }} />
                    ))}
                  </div>
                  <p className={`text-[9px] mt-2 ${isDark ? 'text-[#4A6A8A]' : 'text-gray-400'}`}>🌸 رنگ‌های ملایم</p>
                  <div className="flex flex-wrap gap-1.5">
                    {colorPalette.soft.map((color) => (
                      <button key={color} onClick={() => handleColorSelect(color)} className={`w-7 h-7 rounded-full border-2 transition-all ${
                        selectedColor === color ? 'border-white scale-110 shadow-lg' : 'border-transparent hover:scale-105'
                      }`} style={{ backgroundColor: color }} />
                    ))}
                  </div>
                </div>
              </div>

              {/* انتخاب نوع نقشه زمینه */}
              <div className={`p-4 rounded-xl ${isDark ? 'bg-white/5' : 'bg-gray-50'}`}>
                <label className={`text-xs block mb-2 ${isDark ? 'text-[#8A9DB0]' : 'text-gray-500'}`}>🗺️ نوع نقشه زمینه</label>
                <div className="grid grid-cols-4 gap-2">
                  {[
                    { id: 'none', label: 'خاموش', icon: '⬛' },
                    { id: 'osm', label: 'خیابانی', icon: '🗺️' },
                    { id: 'topo', label: 'توپوگرافی', icon: '⛰️' },
                    { id: 'satellite', label: 'ماهواره', icon: '🛰️' },
                  ].map((option) => (
                    <button
                      key={option.id}
                      onClick={() => setTempBaseMapType(option.id as BaseMapType)}
                      className={`p-2 rounded-lg text-center transition-all ${
                        tempBaseMapType === option.id
                          ? 'bg-[#C9A227] text-[#1A2A3A] scale-105'
                          : isDark ? 'bg-white/5 text-[#8A9DB0] hover:bg-white/10' : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
                      }`}
                    >
                      <div className="text-lg">{option.icon}</div>
                      <div className="text-[9px] mt-0.5">{option.label}</div>
                    </button>
                  ))}
                </div>
              </div>

              {/* شفافیت */}
              {tempBaseMapType !== 'none' && (
                <div className={`p-4 rounded-xl ${isDark ? 'bg-white/5' : 'bg-gray-50'}`}>
                  <div className="flex items-center justify-between">
                    <label className={`text-xs ${isDark ? 'text-[#8A9DB0]' : 'text-gray-500'}`}>🔆 شفافیت</label>
                    <span className={`text-xs font-mono ${isDark ? 'text-[#AACCDD]' : 'text-[#1A2A3A]'}`}>{Math.round(tempOpacity * 100)}%</span>
                  </div>
                  <input type="range" min="0" max="100" value={tempOpacity * 100} onChange={(e) => setTempOpacity(parseInt(e.target.value) / 100)} className="w-full h-1.5 rounded-lg appearance-none cursor-pointer bg-[#AACCDD]/20 mt-2" />
                </div>
              )}

              {/* پیش‌نمایش */}
              <div className={`p-4 rounded-xl ${isDark ? 'bg-white/5' : 'bg-gray-50'}`}>
                <label className={`text-xs block mb-2 ${isDark ? 'text-[#8A9DB0]' : 'text-gray-500'}`}>📐 پیش‌نمایش</label>
                <div className="flex items-center gap-3">
                  <div className="w-16 h-10 rounded-lg border border-[#AACCDD]/20" style={{ backgroundColor: selectedColor }} />
                  <div className="flex-1">
                    <div className="text-xs font-mono">{selectedColor}</div>
                    <div className="flex gap-1 mt-1">
                      {[0, 20, 40, 60, 80, 100].map((opacity) => (
                        <div key={opacity} className="flex-1 h-1.5 rounded-full" style={{ backgroundColor: selectedColor, opacity: opacity / 100 }} />
                      ))}
                    </div>
                  </div>
                </div>
              </div>
            </div>

            {/* فوتر */}
            <div className={`px-6 py-4 border-t flex gap-3 flex-shrink-0 ${isDark ? 'border-[#AACCDD]/10' : 'border-gray-100'}`}>
              <button onClick={handleClose} className={`flex-1 px-4 py-2 rounded-xl text-sm font-medium transition-all ${
                isDark ? 'bg-white/5 text-[#8A9DB0] hover:bg-white/10' : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
              }`}>انصراف</button>
              <button onClick={handleApply} className="flex-1 px-4 py-2 rounded-xl text-sm font-medium bg-[#C9A227] text-[#1A2A3A] hover:bg-[#D4AF37] transition-all flex items-center justify-center gap-2">
                <CheckIcon className="w-4 h-4" /> اعمال تنظیمات
              </button>
            </div>
          </div>
        </div>
      </div>
    </>
  );
}

// ============================================
// کامپوننت اصلی
// ============================================

function MineMapPage() {
  const { mineId } = useParams<{ mineId: string }>();
  const navigate = useNavigate();
  const { isDark } = useTheme();
  const [geoData, setGeoData] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [showUploader, setShowUploader] = useState(false);
  const [activeTool, setActiveTool] = useState('none');
  
  // تنظیمات نقشه
  const [backgroundColor, setBackgroundColor] = useState('#0a1628');
  const [baseMapType, setBaseMapType] = useState<BaseMapType>('osm');
  const [baseMapOpacity, setBaseMapOpacity] = useState(0.8);
  const [showSettingsModal, setShowSettingsModal] = useState(false);

  const [featureCounts, setFeatureCounts] = useState({
    points: 0,
    lines: 0,
    polygons: 0,
    measurements: 0,
  });

  // ============================================
  // بارگذاری از IndexedDB
  // ============================================

  useEffect(() => {
    const loadMap = async () => {
      if (!mineId) return;
      try {
        const data = await mapDatabase.getMap(mineId);
        if (data?.data) {
          console.log('✅ نقشه از دیتابیس Load شد');
          setGeoData(data.data);
        }
      } catch (error) {
        console.error('❌ خطا:', error);
      } finally {
        setLoading(false);
      }
    };
    loadMap();
  }, [mineId]);

  // ============================================
  // آپلود نقشه
  // ============================================

  const handleMapUpload = async (data: any) => {
    if (!mineId) return;
    try {
      const geoJsonData = {
        type: 'FeatureCollection' as const,
        features: data.features || [],
      };
      await mapDatabase.saveMap(mineId, geoJsonData);
      setGeoData(geoJsonData);
      console.log('✅ نقشه ذخیره شد');
    } catch (error) {
      console.error('❌ خطا:', error);
    }
    setShowUploader(false);
  };

  // ============================================
  // ذخیره ترسیم
  // ============================================

  const handleDrawComplete = async (featureData: any) => {
    if (!mineId) return;
    try {
      const currentData = await mapDatabase.getMap(mineId);
      const features = currentData?.data?.features || [];
      
      features.push({
        type: 'Feature',
        geometry: featureData.geometry,
        properties: {
          ...featureData.properties,
          id: crypto.randomUUID(),
          createdAt: new Date().toISOString(),
        },
      });

      const updatedData = {
        type: 'FeatureCollection' as const,
        features,
      };

      await mapDatabase.saveMap(mineId, updatedData);
      setGeoData(updatedData);
      
      const geomType = featureData.geometry.type;
      setFeatureCounts(prev => ({
        ...prev,
        [geomType === 'Point' ? 'points' : geomType === 'LineString' ? 'lines' : 'polygons']: 
          prev[geomType === 'Point' ? 'points' : geomType === 'LineString' ? 'lines' : 'polygons'] + 1
      }));
      
      console.log('✅ ترسیم ذخیره شد');
    } catch (error) {
      console.error('❌ خطا:', error);
    }
  };

  const handleMeasureComplete = (result: any) => {
    setFeatureCounts(prev => ({
      ...prev,
      measurements: prev.measurements + 1,
    }));
  };

  if (loading) {
    return <div className="flex items-center justify-center h-screen text-[#8A9DB0]">در حال بارگذاری...</div>;
  }

  return (
    <div className={`${isDark ? 'bg-[#0A1628]' : 'bg-gray-50'} h-screen flex flex-col`}>
      
      {/* هدر */}
      <div className="flex-shrink-0 px-4 py-3 border-b border-[#AACCDD]/10 flex items-center justify-between bg-[#0A1628]/95">
        <div>
          <h1 className="text-sm font-bold text-white">🗺️ نقشه معدن</h1>
          <p className="text-[10px] text-[#4A6A8A]">
            {geoData?.features?.length || 0} ویژگی
          </p>
        </div>
        <div className="flex items-center gap-2">
          <button
            onClick={() => setShowSettingsModal(true)}
            className={`px-3 py-1.5 rounded-lg text-xs flex items-center gap-1.5 transition-colors ${
              isDark ? 'bg-[#AACCDD]/10 text-[#AACCDD] hover:bg-[#AACCDD]/20' : 'bg-gray-200 text-gray-700 hover:bg-gray-300'
            }`}
          >
            <PaintBrushIcon className="w-3.5 h-3.5" />
            تنظیمات
          </button>
          <button
            onClick={() => setShowUploader(true)}
            className="px-3 py-1.5 rounded-lg text-xs bg-[#AACCDD]/10 text-[#AACCDD] hover:bg-[#AACCDD]/20 transition-colors flex items-center gap-1.5"
          >
            <DocumentArrowUpIcon className="w-3.5 h-3.5" />
            بارگذاری
          </button>
          <button
            onClick={() => navigate('/mine')}
            className="px-3 py-1.5 rounded-lg text-xs hover:bg-white/5 text-[#8A9DB0] hover:text-white transition-colors"
          >
            ← بازگشت
          </button>
        </div>
      </div>

      {/* نقشه */}
      <div className="flex-1 p-2 relative">
        <Map
          geoData={geoData}
          height="100%"
          backgroundColor={backgroundColor}
          activeTool={activeTool}
          onDrawComplete={handleDrawComplete}
          onMeasureComplete={handleMeasureComplete}
          baseMapType={baseMapType}
          baseMapOpacity={baseMapOpacity}
        />

        {/* نوار ابزار پایین */}
        <MapToolbar activeTool={activeTool} onToolChange={setActiveTool} />

        {/* آمار */}
        <MapStats 
          points={featureCounts.points}
          lines={featureCounts.lines}
          polygons={featureCounts.polygons}
          measurements={featureCounts.measurements}
        />
      </div>

      {/* مودال تنظیمات */}
      <MapSettingsModal
        isOpen={showSettingsModal}
        onClose={() => setShowSettingsModal(false)}
        backgroundColor={backgroundColor}
        onBackgroundChange={setBackgroundColor}
        baseMapType={baseMapType}
        onBaseMapTypeChange={setBaseMapType}
        baseMapOpacity={baseMapOpacity}
        onBaseMapOpacityChange={setBaseMapOpacity}
      />

      {showUploader && (
        <MapUploader onUpload={handleMapUpload} onClose={() => setShowUploader(false)} />
      )}
    </div>
  );
}

export { MineMapPage };
export default MineMapPage;