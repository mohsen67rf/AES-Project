// src/modules/mine/presentation/components/Map/components/EditModal.tsx

import { useState, useEffect } from 'react';
import { useTheme } from '../../../../../../shared/context/ThemeContext';
import { XMarkIcon, CheckIcon, TrashIcon, PencilIcon } from '@heroicons/react/24/outline';

interface EditModalProps {
  isOpen: boolean;
  onClose: () => void;
  feature: any;
  onUpdate: (updates: any) => void;
  onDelete: () => void;
}

export function EditModal({ isOpen, onClose, feature, onUpdate, onDelete }: EditModalProps) {
  const { isDark } = useTheme();
  const [color, setColor] = useState('#C9A227');
  const [weight, setWeight] = useState(3);
  const [fillOpacity, setFillOpacity] = useState(0.2);
  const [size, setSize] = useState(8);
  const [dashArray, setDashArray] = useState('');
  const [layerName, setLayerName] = useState('');

  useEffect(() => {
    if (feature) {
      const props = feature?.properties || {};
      setColor(props.color || '#C9A227');
      setWeight(props.weight || 3);
      setFillOpacity(props.fillOpacity || 0.2);
      setSize(props.size || 8);
      setDashArray(props.dashArray || '');
      setLayerName(props._layerName || props.layer || 'default');
    }
  }, [feature]);

  if (!isOpen || !feature) return null;

  const featureType = feature.geometry?.type || 'Point';
  const isPoint = featureType === 'Point';
  const isPolygon = featureType === 'Polygon' || featureType === 'MultiPolygon';
  const isLine = featureType === 'LineString' || featureType === 'MultiLineString';

  const dashOptions = [
    { value: '', label: 'ممتد' },
    { value: '5,5', label: 'نقطه‌چین' },
    { value: '10,5', label: 'خط‌چین' },
    { value: '15,5,5,5', label: 'نقطه-خط' },
  ];

  const handleUpdate = () => {
    const updates: any = {
      color,
      weight,
      dashArray,
    };

    if (isPoint) {
      updates.size = size;
    }

    if (isPolygon) {
      updates.fillColor = color;
      updates.fillOpacity = fillOpacity;
    }

    if (layerName && layerName !== 'default') {
      updates.layer = layerName;
    }

    onUpdate(updates);
    onClose();
  };

  return (
    <>
      <div className="fixed inset-0 z-[9999] bg-black/60 backdrop-blur-sm animate-in fade-in duration-300" onClick={onClose} />
      <div className="fixed inset-0 z-[10000] flex items-center justify-center p-4 pointer-events-none">
        <div className="pointer-events-auto w-full max-w-sm animate-in zoom-in-95 slide-in-from-bottom-10 duration-300">
          <div className={`relative rounded-2xl shadow-2xl overflow-hidden border ${isDark ? 'bg-[#0A1628] border-[#AACCDD]/20' : 'bg-white border-gray-200/50'}`}>
            <div className={`px-6 py-4 border-b flex items-center justify-between ${isDark ? 'border-[#AACCDD]/10' : 'border-gray-100'}`}>
              <div className="flex items-center gap-3">
                <div className={`w-8 h-8 rounded-xl flex items-center justify-center ${isDark ? 'bg-[#C9A227]/20' : 'bg-[#C9A227]/10'}`}>
                  <PencilIcon className={`w-4 h-4 ${isDark ? 'text-[#C9A227]' : 'text-[#C9A227]'}`} />
                </div>
                <div>
                  <h3 className={`text-sm font-bold ${isDark ? 'text-white' : 'text-gray-800'}`}>✏️ ویرایش ترسیم</h3>
                  <p className={`text-[10px] ${isDark ? 'text-[#4A6A8A]' : 'text-gray-400'}`}>
                    {isPoint ? 'نقطه' : isPolygon ? 'محدوده' : 'خط'}
                    {layerName && layerName !== 'default' && ` • لایه: ${layerName}`}
                  </p>
                </div>
              </div>
              <button onClick={onClose} className={`p-1.5 rounded-lg transition-all hover:scale-110 ${isDark ? 'hover:bg-white/5 text-[#8A9DB0] hover:text-white' : 'hover:bg-gray-100 text-gray-500 hover:text-gray-800'}`}>
                <XMarkIcon className="w-5 h-5" />
              </button>
            </div>

            <div className="p-6 space-y-4 max-h-[60vh] overflow-y-auto">
              {/* نام لایه */}
              <div>
                <label className={`block text-xs mb-2 ${isDark ? 'text-[#8A9DB0]' : 'text-gray-500'}`}>لایه</label>
                <input
                  type="text"
                  value={layerName}
                  onChange={(e) => setLayerName(e.target.value)}
                  className={`w-full px-3 py-2 rounded-lg border text-sm focus:outline-none ${isDark ? 'bg-[#0A1628] border-[#AACCDD]/10 text-white focus:border-[#00D4FF]/50' : 'bg-gray-100 border-gray-200 text-gray-800 focus:border-[#C9A227]/50'}`}
                />
              </div>

              {/* رنگ */}
              <div>
                <label className={`block text-xs mb-2 ${isDark ? 'text-[#8A9DB0]' : 'text-gray-500'}`}>رنگ</label>
                <div className="flex items-center gap-3">
                  <input type="color" value={color} onChange={(e) => setColor(e.target.value)} className="w-12 h-12 rounded-xl cursor-pointer border-2 border-[#AACCDD]/20 p-0.5 bg-transparent" />
                  <span className={`text-xs font-mono ${isDark ? 'text-[#8A9DB0]' : 'text-gray-500'}`}>{color}</span>
                </div>
              </div>

              {/* اندازه (فقط نقطه) */}
              {isPoint && (
                <div>
                  <label className={`block text-xs mb-2 ${isDark ? 'text-[#8A9DB0]' : 'text-gray-500'}`}>اندازه: {size}px</label>
                  <input type="range" min="4" max="24" value={size} onChange={(e) => setSize(parseInt(e.target.value))} className="w-full h-1.5 rounded-lg appearance-none cursor-pointer bg-[#AACCDD]/20" />
                </div>
              )}

              {/* ضخامت (خط و محدوده) */}
              {(isLine || isPolygon) && (
                <div>
                  <label className={`block text-xs mb-2 ${isDark ? 'text-[#8A9DB0]' : 'text-gray-500'}`}>ضخامت: {weight}px</label>
                  <input type="range" min="1" max="10" value={weight} onChange={(e) => setWeight(parseInt(e.target.value))} className="w-full h-1.5 rounded-lg appearance-none cursor-pointer bg-[#AACCDD]/20" />
                </div>
              )}

              {/* نوع خط (خط و محدوده) */}
              {(isLine || isPolygon) && (
                <div>
                  <label className={`block text-xs mb-2 ${isDark ? 'text-[#8A9DB0]' : 'text-gray-500'}`}>نوع خط</label>
                  <div className="flex flex-wrap gap-2">
                    {dashOptions.map((option) => (
                      <button
                        key={option.value}
                        onClick={() => setDashArray(option.value)}
                        className={`px-3 py-1.5 rounded-lg text-xs transition-all ${dashArray === option.value ? 'bg-[#C9A227] text-[#1A2A3A]' : isDark ? 'bg-white/5 text-[#8A9DB0] hover:bg-white/10' : 'bg-gray-100 text-gray-600 hover:bg-gray-200'}`}
                      >
                        <div className="flex items-center gap-2">
                          <div className="w-8 h-0.5" style={{ borderTop: `2px ${option.value ? 'dashed' : 'solid'} ${color}` }} />
                          <span>{option.label}</span>
                        </div>
                      </button>
                    ))}
                  </div>
                </div>
              )}

              {/* شفافیت پرکننده (فقط محدوده) */}
              {isPolygon && (
                <div>
                  <label className={`block text-xs mb-2 ${isDark ? 'text-[#8A9DB0]' : 'text-gray-500'}`}>شفافیت پرکننده: {Math.round(fillOpacity * 100)}%</label>
                  <input type="range" min="0" max="100" value={fillOpacity * 100} onChange={(e) => setFillOpacity(parseInt(e.target.value) / 100)} className="w-full h-1.5 rounded-lg appearance-none cursor-pointer bg-[#AACCDD]/20" />
                </div>
              )}

              {/* دکمه حذف */}
              <button
                onClick={() => {
                  if (window.confirm('آیا از حذف این ترسیم اطمینان دارید؟')) {
                    onDelete();
                    onClose();
                  }
                }}
                className="w-full py-2.5 bg-red-500/20 text-red-400 rounded-xl hover:bg-red-500/30 transition-colors flex items-center justify-center gap-2"
              >
                <TrashIcon className="w-4 h-4" /> حذف ترسیم
              </button>
            </div>

            <div className={`px-6 py-4 border-t flex gap-3 ${isDark ? 'border-[#AACCDD]/10' : 'border-gray-100'}`}>
              <button onClick={onClose} className={`flex-1 px-4 py-2 rounded-xl text-sm font-medium transition-all ${isDark ? 'bg-white/5 text-[#8A9DB0] hover:bg-white/10' : 'bg-gray-100 text-gray-600 hover:bg-gray-200'}`}>انصراف</button>
              <button onClick={handleUpdate} className="flex-1 px-4 py-2 rounded-xl text-sm font-medium bg-[#C9A227] text-[#1A2A3A] hover:bg-[#D4AF37] transition-all flex items-center justify-center gap-2">
                <CheckIcon className="w-4 h-4" /> اعمال تغییرات
              </button>
            </div>
          </div>
        </div>
      </div>
    </>
  );
}