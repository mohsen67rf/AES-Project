// src/modules/mine/presentation/pages/MineMapPage/index.tsx

import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useTheme } from '../../../../../shared/context/ThemeContext';
import { Map, BaseMapType } from '../../components/Map';
import { MapStats } from '../../components/Map/components/MapStats';
import { useHaulRoutes } from '../../components/Map/hooks/useHaulRoutes';
import { useMapData } from './hooks/useMapData';
import { useDrawingTools } from './hooks/useDrawingTools';
import { MapHeader, MapStatusOverlay, MapModals } from './components';
import { XMarkIcon, CheckIcon, PaintBrushIcon } from '@heroicons/react/24/outline';
import { MineRepository } from '../../../../../core/infrastructure/repositories';
import { CursorArrowRippleIcon, PencilIcon } from '@heroicons/react/24/outline';

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

  const colorPalette = {
    main: ['#0a1628', '#1a1a2e', '#16213e', '#0f3460', '#1b1b2f', '#2d2d2d', '#1e1e1e', '#000000'],
    gray: ['#111111', '#222222', '#333333', '#444444', '#555555', '#666666', '#777777', '#888888'],
    dark: ['#1a0a0a', '#0a1a0a', '#0a0a1a', '#1a0a1a', '#1a1a0a', '#0a1a1a', '#2d1a0a', '#0a2d1a', '#1a0a2d', '#2d0a1a'],
    soft: ['#2c3e50', '#34495e', '#2c3e6b', '#3d3d5c', '#4a3d5c', '#5c3d4a'],
  };

  const allColors = [...colorPalette.main, ...colorPalette.gray, ...colorPalette.dark, ...colorPalette.soft];

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

            <div className="px-6 py-4 space-y-4 overflow-y-auto flex-1">
              <div>
                <label className={`text-xs block mb-2 ${isDark ? 'text-[#8A9DB0]' : 'text-gray-500'}`}>🎨 رنگ پس‌زمینه</label>
                <div className="flex items-center gap-3 mb-3">
                  <input type="color" value={selectedColor} onChange={handleCustomColorChange} className="w-12 h-12 rounded-xl cursor-pointer border-2 border-[#AACCDD]/20 p-0.5 bg-transparent" />
                  <div className="flex-1">
                    <input type="text" value={hexInput} onChange={handleHexChange} placeholder="#000000" className={`w-full px-3 py-2 rounded-lg border text-sm font-mono focus:outline-none ${
                      isDark ? 'bg-white/5 border-[#AACCDD]/10 text-white placeholder-[#4A6A8A] focus:border-[#AACCDD]/30' : 'bg-gray-100 border-gray-200 text-gray-800 placeholder-gray-400 focus:border-[#1A2A3A]/30'
                    }`} />
                  </div>
                  <div className="w-12 h-12 rounded-xl border-2 border-[#AACCDD]/20 flex-shrink-0" style={{ backgroundColor: selectedColor }} />
                </div>

                <div className="space-y-3">
                  <div>
                    <p className={`text-[9px] ${isDark ? 'text-[#4A6A8A]' : 'text-gray-400'}`}>🌑 رنگ‌های اصلی</p>
                    <div className="flex flex-wrap gap-1.5 mt-1">
                      {colorPalette.main.map((color) => (
                        <button
                          key={color}
                          onClick={() => handleColorSelect(color)}
                          className={`w-7 h-7 rounded-full border-2 transition-all ${
                            selectedColor === color ? 'border-[#C9A227] scale-110 shadow-lg' : 'border-transparent hover:scale-105'
                          }`}
                          style={{ backgroundColor: color }}
                        />
                      ))}
                    </div>
                  </div>
                  <div>
                    <p className={`text-[9px] ${isDark ? 'text-[#4A6A8A]' : 'text-gray-400'}`}>🌫️ رنگ‌های طوسی</p>
                    <div className="flex flex-wrap gap-1.5 mt-1">
                      {colorPalette.gray.map((color) => (
                        <button
                          key={color}
                          onClick={() => handleColorSelect(color)}
                          className={`w-7 h-7 rounded-full border-2 transition-all ${
                            selectedColor === color ? 'border-[#C9A227] scale-110 shadow-lg' : 'border-transparent hover:scale-105'
                          }`}
                          style={{ backgroundColor: color }}
                        />
                      ))}
                    </div>
                  </div>
                  <div>
                    <p className={`text-[9px] ${isDark ? 'text-[#4A6A8A]' : 'text-gray-400'}`}>🌈 رنگ‌های تیره</p>
                    <div className="flex flex-wrap gap-1.5 mt-1">
                      {colorPalette.dark.map((color) => (
                        <button
                          key={color}
                          onClick={() => handleColorSelect(color)}
                          className={`w-7 h-7 rounded-full border-2 transition-all ${
                            selectedColor === color ? 'border-[#C9A227] scale-110 shadow-lg' : 'border-transparent hover:scale-105'
                          }`}
                          style={{ backgroundColor: color }}
                        />
                      ))}
                    </div>
                  </div>
                  <div>
                    <p className={`text-[9px] ${isDark ? 'text-[#4A6A8A]' : 'text-gray-400'}`}>🌸 رنگ‌های ملایم</p>
                    <div className="flex flex-wrap gap-1.5 mt-1">
                      {colorPalette.soft.map((color) => (
                        <button
                          key={color}
                          onClick={() => handleColorSelect(color)}
                          className={`w-7 h-7 rounded-full border-2 transition-all ${
                            selectedColor === color ? 'border-[#C9A227] scale-110 shadow-lg' : 'border-transparent hover:scale-105'
                          }`}
                          style={{ backgroundColor: color }}
                        />
                      ))}
                    </div>
                  </div>
                </div>
              </div>

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

              {tempBaseMapType !== 'none' && (
                <div className={`p-4 rounded-xl ${isDark ? 'bg-white/5' : 'bg-gray-50'}`}>
                  <div className="flex items-center justify-between">
                    <label className={`text-xs ${isDark ? 'text-[#8A9DB0]' : 'text-gray-500'}`}>🔆 شفافیت</label>
                    <span className={`text-xs font-mono ${isDark ? 'text-[#AACCDD]' : 'text-[#1A2A3A]'}`}>{Math.round(tempOpacity * 100)}%</span>
                  </div>
                  <input type="range" min="0" max="100" value={tempOpacity * 100} onChange={(e) => setTempOpacity(parseInt(e.target.value) / 100)} className="w-full h-1.5 rounded-lg appearance-none cursor-pointer bg-[#AACCDD]/20 mt-2" />
                </div>
              )}

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

            <div className={`px-6 py-4 border-t flex gap-3 flex-shrink-0 ${
              isDark ? 'border-[#AACCDD]/10' : 'border-gray-100'
            }`}>
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
// کامپوننت اصلی MineMapPage
// ============================================

function MineMapPage() {
  const navigate = useNavigate();
  const { isDark } = useTheme();

  // ============================================
  // دریافت اولین معدن از دیتابیس
  // ============================================

  const [mineId, setMineId] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    console.log('🚀 MineMapPage: شروع بارگذاری...');
    try {
      const mines = MineRepository.getAll();
      console.log('📋 لیست معادن:', mines);
      
      if (mines.length > 0) {
        console.log('✅ اولین معدن انتخاب شد:', mines[0].id);
        setMineId(mines[0].id);
      } else {
        console.warn('⚠️ هیچ معدن‌ای وجود ندارد!');
        navigate('/mine');
      }
    } catch (error) {
      console.error('❌ خطا در دریافت معدن:', error);
      navigate('/mine');
    } finally {
      setIsLoading(false);
    }
  }, [navigate]);

  // ============================================
  // State‌ها
  // ============================================

  const [activeTool, setActiveTool] = useState('none');
  const [selectedPitId, setSelectedPitId] = useState<string | null>(null);
  const [mapInstance, setMapInstance] = useState<any>(null);
  const [showSettings, setShowSettings] = useState(false);
  const [showPitUploader, setShowPitUploader] = useState(false);
  const [uploadingPitId, setUploadingPitId] = useState<string | null>(null);
  const [showDrawing, setShowDrawing] = useState(false);
  const [showMeasure, setShowMeasure] = useState(false);
  const [showEdit, setShowEdit] = useState(false);
  const [showHaulRoute, setShowHaulRoute] = useState(false);
  const [drawingType, setDrawingType] = useState<'point' | 'line' | 'polygon'>('point');
  const [selectedFeature, setSelectedFeature] = useState<any>(null);
  const [selectedFeatureId, setSelectedFeatureId] = useState<string | null>(null);
  const [haulRouteDistance, setHaulRouteDistance] = useState(0);
  const [haulRoutePoints, setHaulRoutePoints] = useState(0);

  // تنظیمات نقشه
  const [backgroundColor, setBackgroundColor] = useState('#0a1628');
  const [baseMapType, setBaseMapType] = useState<BaseMapType>('osm');
  const [baseMapOpacity, setBaseMapOpacity] = useState(0.8);

  // ============================================
  // هوک‌ها
  // ============================================

  const {
    mine,
    pits,
    geoData,
    setGeoData,
    loading,
    setLoading,
    loadMapData,
    loadMineAndPits,
    uploadPitMap,
    clearDefaultData,
  } = useMapData(mineId || undefined);

  // ============================================
  // ✅ وقتی selectedPitId تغییر میکنه، نقشه رو بارگذاری کن
  // ============================================

  useEffect(() => {
    if (mineId) {
      console.log(`📥 بارگذاری نقشه برای selectedPitId: ${selectedPitId}`);
      loadMapData(selectedPitId);
    }
  }, [mineId, selectedPitId]);

  // ============================================
  // ✅ useEffect برای لاگ گرفتن از geoData
  // ============================================

  useEffect(() => {
    console.log('📊 geoData در MineMapPage:');
    console.log('  - وجود دارد؟', !!geoData);
    console.log('  - تعداد ویژگی‌ها:', geoData?.features?.length || 0);
  }, [geoData]);

  const {
    featureCounts,
    handleDrawComplete,
    handleMeasureComplete,
    handleFeatureUpdate,
    handleFeatureDelete,
    handleFeatureSelect,
  } = useDrawingTools(mineId || undefined, geoData, setGeoData, setSelectedFeature, setShowEdit);

  const {
    isDrawing,
    tempPoints,
    startDrawing,
    stopDrawing,
    addPoint,
    confirmRoute,
    showRouteForSubBlock,
    hideAllRoutes,
    calculateDistance,
  } = useHaulRoutes(mapInstance);

  // ============================================
  // ✅ مقداردهی اولیه
  // ============================================

  useEffect(() => {
    const initMap = async () => {
      console.log('🚀 شروع بارگذاری نقشه...');
      console.log('📋 mineId:', mineId);
      
      await clearDefaultData();
      
      if (mineId) {
        console.log('📥 بارگذاری معدن و پیت‌ها...');
        loadMineAndPits();
      } else {
        console.warn('⚠️ mineId وجود ندارد!');
      }
    };
    
    initMap();
  }, [mineId]);

  // ============================================
  // هندلرها
  // ============================================

  const handleToolChange = (tool: string) => {
    if (activeTool === 'haulRoute' && isDrawing) {
      stopDrawing();
      setShowHaulRoute(false);
    }
    if (tool === 'haulRoute') {
      startDrawing();
    }
    setActiveTool(tool);
  };

  const handleDrawingConfirm = (tool: string, settings: any) => {
    setActiveTool(tool);
    setShowDrawing(false);
  };

  const handleMeasureConfirm = (tool: string) => {
    setActiveTool(tool);
    setShowMeasure(false);
  };

  const handleConfirmHaulRoute = (subBlockId: string, destination: string) => {
    confirmRoute(subBlockId, destination);
    setShowHaulRoute(false);
    setActiveTool('none');
  };

  const handlePitUpload = async (data: any) => {
    if (uploadingPitId) {
      const pitName = pits.find((p: any) => p.id === uploadingPitId)?.name || '';
      console.log(`📤 آپلود نقشه برای پیت: ${pitName} (${uploadingPitId})`);
      
      const result = await uploadPitMap(data, uploadingPitId, pitName);
      
      if (result) {
        console.log('✅ نقشه پیت با موفقیت بارگذاری شد');
        setSelectedPitId(uploadingPitId);
        await loadMapData(uploadingPitId);
      } else {
        console.error('❌ خطا در بارگذاری نقشه پیت');
      }
    }
    setShowPitUploader(false);
    setUploadingPitId(null);
  };

  // ============================================
  // ✅ هندلر انتخاب (Select)
  // ============================================

  const handleToggleSelect = () => {
    if (activeTool === 'select') {
      setActiveTool('none');
      setSelectedFeatureId(null);
      setSelectedFeature(null);
    } else {
      if (activeTool === 'haulRoute') {
        stopDrawing();
        setShowHaulRoute(false);
      }
      setActiveTool('select');
    }
  };

  // ============================================
  // ✅ هندلر ویرایش (Edit)
  // ============================================

  const handleToggleEdit = () => {
    if (activeTool === 'edit') {
      setActiveTool('none');
      setSelectedFeatureId(null);
      setSelectedFeature(null);
      setShowEdit(false);
    } else {
      if (selectedFeatureId) {
        setActiveTool('edit');
        setShowEdit(true);
      } else {
        alert('لطفاً ابتدا یک ترسیم را با دکمه "انتخاب" انتخاب کنید');
      }
    }
  };

  // ============================================
  // ✅ هندلر انتخاب ویژگی از نقشه
  // ============================================

  const handleFeatureSelectFromMap = (featureId: string) => {
    console.log('🖱️ ویژگی انتخاب شد:', featureId);
    setSelectedFeatureId(featureId);
    
    if (geoData?.features) {
      const found = geoData.features.find((f: any) => f.properties?.id === featureId);
      if (found) {
        setSelectedFeature(found);
      }
    }
  };

  // ============================================
  // رندر
  // ============================================

  if (isLoading || !mineId) {
    return <div className="flex items-center justify-center h-screen text-[#8A9DB0]">در حال بارگذاری...</div>;
  }

  const settingsModal = (
    <MapSettingsModal
      isOpen={showSettings}
      onClose={() => setShowSettings(false)}
      backgroundColor={backgroundColor}
      onBackgroundChange={setBackgroundColor}
      baseMapType={baseMapType}
      onBaseMapTypeChange={setBaseMapType}
      baseMapOpacity={baseMapOpacity}
      onBaseMapOpacityChange={setBaseMapOpacity}
    />
  );

  return (
    <div className={`${isDark ? 'bg-[#0A1628]' : 'bg-gray-50'} h-screen flex flex-col`}>
      {/* ===== هدر با دکمه‌های انتخاب و ویرایش ===== */}
      <MapHeader
        mineName={mine?.name || ''}
        pits={pits}
        selectedPitId={selectedPitId}
        onPitSelect={setSelectedPitId}
        onUploadPitMap={(pitId: string) => {
          console.log('📤 آپلود نقشه برای پیت:', pitId);
          setUploadingPitId(pitId);
          setShowPitUploader(true);
        }}
        onRefresh={() => {
          console.log('🔄 رفرش...');
          loadMapData(selectedPitId);
        }}
        onShowSettings={() => setShowSettings(true)}
        onBack={() => navigate('/mine')}
        activeTool={activeTool}
        isDrawing={isDrawing}
        onToolChange={handleToolChange}
        isDark={isDark}
        onShowDrawingModal={(type) => {
          setDrawingType(type);
          setShowDrawing(true);
        }}
        onShowMeasureModal={() => setShowMeasure(true)}
        onToggleEdit={handleToggleEdit}
        onToggleSelect={handleToggleSelect}
        selectedFeatureId={selectedFeatureId}
      />

      {/* ===== نقشه ===== */}
      <div className="flex-1 p-2 relative z-0">
        {geoData && geoData.features && geoData.features.length > 0 ? (
          <Map
            key={selectedPitId || 'mine-map'}
            geoData={geoData}
            height="100%"
            backgroundColor={backgroundColor}
            activeTool={activeTool === 'edit' ? 'select' : activeTool}
            onDrawComplete={handleDrawComplete}
            onMeasureComplete={handleMeasureComplete}
            onFeatureSelect={activeTool === 'select' || activeTool === 'edit' ? handleFeatureSelectFromMap : undefined}
            baseMapType={baseMapType}
            baseMapOpacity={baseMapOpacity}
            onMapReady={setMapInstance}
            selectedFeatureId={selectedFeatureId}
          />
        ) : (
          <div className="w-full h-full rounded-xl border border-[#AACCDD]/20 flex items-center justify-center bg-[#0A1628]/50">
            <div className="text-center">
              <div className="text-6xl mb-4">🗺️</div>
              <h3 className={`text-lg font-bold ${isDark ? 'text-white' : 'text-gray-800'}`}>
                هیچ نقشه‌ای بارگذاری نشده است
              </h3>
              <p className={`text-sm ${isDark ? 'text-[#8A9DB0]' : 'text-gray-500'} mt-2 max-w-md`}>
                برای بارگذاری نقشه، از منوی انتخاب پیت استفاده کنید
              </p>
            </div>
          </div>
        )}

        <MapStats {...featureCounts} />

        <MapStatusOverlay
          activeTool={activeTool}
          isDrawing={isDrawing}
          tempPoints={tempPoints}
          distance={haulRouteDistance}
          selectedPitId={selectedPitId}
          hasGeoData={!!geoData}
          isDark={isDark}
        />
      </div>

      {/* ===== مودال‌ها ===== */}
      <MapModals
        showSettings={showSettings}
        onCloseSettings={() => setShowSettings(false)}
        backgroundColor={backgroundColor}
        onBackgroundChange={setBackgroundColor}
        baseMapType={baseMapType}
        onBaseMapTypeChange={setBaseMapType}
        baseMapOpacity={baseMapOpacity}
        onBaseMapOpacityChange={setBaseMapOpacity}
        settingsModal={settingsModal}
        showPitUploader={showPitUploader}
        uploadingPitId={uploadingPitId}
        pits={pits}
        onPitUpload={handlePitUpload}
        onClosePitUploader={() => {
          setShowPitUploader(false);
          setUploadingPitId(null);
        }}
        showDrawing={showDrawing}
        onCloseDrawing={() => setShowDrawing(false)}
        onDrawingConfirm={handleDrawingConfirm}
        drawingType={drawingType}
        showMeasure={showMeasure}
        onCloseMeasure={() => setShowMeasure(false)}
        onMeasureConfirm={handleMeasureConfirm}
        showEdit={showEdit}
        onCloseEdit={() => {
          setShowEdit(false);
          setSelectedFeature(null);
          setSelectedFeatureId(null);
          setActiveTool('none');
        }}
        selectedFeature={selectedFeature}
        onUpdate={(updates: any) => {
          if (selectedFeature?.properties?.id) {
            handleFeatureUpdate(selectedFeature.properties.id, updates);
          }
        }}
        onDelete={() => {
          if (selectedFeature?.properties?.id) {
            handleFeatureDelete(selectedFeature.properties.id);
          }
          setShowEdit(false);
          setSelectedFeature(null);
          setSelectedFeatureId(null);
          setActiveTool('none');
        }}
        showHaulRoute={showHaulRoute}
        onCloseHaulRoute={() => {
          setShowHaulRoute(false);
          stopDrawing();
          setActiveTool('none');
        }}
        onHaulRouteConfirm={handleConfirmHaulRoute}
        haulRouteDistance={haulRouteDistance}
        haulRoutePoints={haulRoutePoints}
      />
    </div>
  );
}

export default MineMapPage;