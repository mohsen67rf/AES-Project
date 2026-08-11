// src/modules/mine/presentation/pages/BlocksPage.tsx

import { useState, useEffect, useMemo, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import { 
  CubeIcon, 
  MagnifyingGlassIcon, 
  DocumentPlusIcon, 
  PlusIcon,
  ArrowPathIcon,
  TrashIcon,
  PencilIcon,
  EyeIcon,
  CloudArrowUpIcon,
  XMarkIcon,
  DocumentIcon,
  InformationCircleIcon
} from '@heroicons/react/24/outline';
import { useTheme } from '../../../../shared/context/ThemeContext';
import { 
  BlockRepository, 
  SubBlockRepository
} from '../../../../core/infrastructure/repositories';
import { AddSubBlockForm } from '../components/AddSubBlockForm';
import { AssayForm } from '../components/AssayForm';
import { PageHeader } from '../components/PageHeader/PageHeader';
import { Table } from '../../../../shared/components/Table/Table';
import type { Block } from '../../../../core/domain/types/mine.types';

// ============================================
// لیست شبکه‌های حفاری
// ============================================

const DRILLING_PATTERNS = [
  { value: '2.5x3', label: '۲.۵ × ۳ متر' },
  { value: '3x4', label: '۳ × ۴ متر' },
  { value: '4x5', label: '۴ × ۵ متر' },
  { value: '5x6', label: '۵ × ۶ متر' },
  { value: '6x8', label: '۶ × ۸ متر' },
];

// ============================================
// تابع پردازش GeoJSON
// ============================================

interface ParsedGeoJSON {
  boundaries: { x: number; y: number; z?: number }[];
  drillingPoints: { x: number; y: number; z?: number; name?: string }[];
  layers: string[];
  featureCount: number;
}

function parseGeoJSONFile(file: File): Promise<ParsedGeoJSON> {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    
    reader.onload = (e) => {
      try {
        const content = e.target?.result as string;
        const data = JSON.parse(content);
        
        const boundaries: { x: number; y: number; z?: number }[] = [];
        const drillingPoints: { x: number; y: number; z?: number; name?: string }[] = [];
        const layers: string[] = [];
        
        console.log('📊 پردازش فایل GeoJSON...');
        console.log('📋 تعداد کل features:', data.features?.length || 0);
        
        if (data.type === 'FeatureCollection' && data.features) {
          data.features.forEach((feature: any, index: number) => {
            const layer = feature.properties?.layer || feature.properties?.Layer || 'default';
            if (!layers.includes(layer)) layers.push(layer);
            
            const geomType = feature.geometry?.type;
            const coords = feature.geometry?.coordinates;
            
            if (!coords) {
              console.warn(`⚠️ Feature ${index} بدون مختصات`);
              return;
            }
            
            console.log(`📌 Feature ${index}: type=${geomType}, layer=${layer}`);
            
            if (geomType === 'Polygon') {
              if (coords[0] && Array.isArray(coords[0])) {
                coords[0].forEach((point: number[]) => {
                  if (point && point.length >= 2) {
                    boundaries.push({ 
                      x: point[0], 
                      y: point[1],
                      z: point[2] || 0
                    });
                  }
                });
                console.log(`  ✅ Polygon با ${coords[0].length} نقطه`);
              }
            }
            
            if (geomType === 'Point') {
              if (coords && coords.length >= 2) {
                drillingPoints.push({ 
                  x: coords[0], 
                  y: coords[1],
                  z: coords[2] || 0,
                  name: feature.properties?.name || feature.properties?.Name || `چال ${drillingPoints.length + 1}`
                });
                console.log(`  ✅ Point در (${coords[0]}, ${coords[1]})`);
              }
            }
            
            if (geomType === 'MultiPoint') {
              if (Array.isArray(coords)) {
                coords.forEach((point: number[]) => {
                  if (point && point.length >= 2) {
                    drillingPoints.push({ 
                      x: point[0], 
                      y: point[1],
                      z: point[2] || 0,
                      name: feature.properties?.name || feature.properties?.Name || `چال ${drillingPoints.length + 1}`
                    });
                  }
                });
                console.log(`  ✅ MultiPoint با ${coords.length} نقطه`);
              }
            }
            
            if (geomType === 'LineString') {
              if (Array.isArray(coords)) {
                coords.forEach((point: number[]) => {
                  if (point && point.length >= 2) {
                    boundaries.push({ 
                      x: point[0], 
                      y: point[1],
                      z: point[2] || 0
                    });
                  }
                });
                console.log(`  ✅ LineString با ${coords.length} نقطه`);
              }
            }
          });
        }
        
        console.log('📊 نتیجه پردازش:');
        console.log(`  - نقاط حفاری: ${drillingPoints.length}`);
        console.log(`  - نقاط مرزی: ${boundaries.length}`);
        console.log(`  - لایه‌ها: ${layers.join(', ')}`);
        
        resolve({
          boundaries,
          drillingPoints,
          layers,
          featureCount: data.features?.length || 0
        });
        
      } catch (error) {
        console.error('❌ خطا در پردازش GeoJSON:', error);
        reject(new Error('فرمت فایل GeoJSON نامعتبر است'));
      }
    };
    
    reader.onerror = () => reject(new Error('خطا در خواندن فایل'));
    reader.readAsText(file);
  });
}

// ============================================
// مودال افزودن/ویرایش بلوک
// ============================================

interface BlockFormModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSuccess: () => void;
  editingBlock?: Block | null;
  mineId?: string;
}

interface UploadedFileType {
  name: string;
  size: number;
  type: string;
  points: { x: number; y: number; z?: number; name?: string }[];
  boundaries: { x: number; y: number; z?: number }[];
  layers?: string[];
  featureCount?: number;
}

function BlockFormModal({ isOpen, onClose, onSuccess, editingBlock }: BlockFormModalProps) {
  const { isDark } = useTheme();
  const [loading, setLoading] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);
  
  const [formData, setFormData] = useState({
    targetLevel: '',
    blockNumber: '',
    totalHoles: '',
    holeDiameter: '',
    avgDesignDepth: '',
    pattern: '',
  });

  const [uploadedFile, setUploadedFile] = useState<UploadedFileType | null>(null);
  const [isParsing, setIsParsing] = useState(false);
  const [fileError, setFileError] = useState<string | null>(null);

  useEffect(() => {
    if (editingBlock) {
      setFormData({
        targetLevel: String(editingBlock.targetLevel),
        blockNumber: String(editingBlock.blockNumber),
        totalHoles: String(editingBlock.drillingParams?.totalHoles || ''),
        holeDiameter: String(editingBlock.drillingParams?.holeDiameter || ''),
        avgDesignDepth: String(editingBlock.drillingParams?.avgDesignDepth || ''),
        pattern: editingBlock.drillingParams?.pattern || '',
      });
      
      if (editingBlock.geometry?.drillingPoints?.length) {
        const points = editingBlock.geometry.drillingPoints.map(p => ({ x: p[0], y: p[1] }));
        const boundaries = editingBlock.geometry.coordinates[0]?.map(p => ({ x: p[0], y: p[1] })) || [];
        setUploadedFile({
          name: 'نقاط حفاری موجود',
          size: 0,
          type: 'existing',
          points,
          boundaries,
          layers: ['existing'],
          featureCount: points.length,
        });
      }
    } else {
      setFormData({
        targetLevel: '',
        blockNumber: '',
        totalHoles: '',
        holeDiameter: '',
        avgDesignDepth: '',
        pattern: '',
      });
      setUploadedFile(null);
      setFileError(null);
    }
  }, [editingBlock]);

  const generateBlockCode = (level: string, number: string) => {
    if (!level || !number) return '';
    return `${level} B ${number}`;
  };

  const handleFileUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    setFileError(null);
    setIsParsing(true);

    try {
      const fileExt = '.' + file.name.split('.').pop()?.toLowerCase();
      
      if (fileExt === '.geojson' || fileExt === '.json') {
        const result = await parseGeoJSONFile(file);
        
        setUploadedFile({
          name: file.name,
          size: file.size,
          type: file.type,
          points: result.drillingPoints,
          boundaries: result.boundaries,
          layers: result.layers,
          featureCount: result.featureCount,
        });

        setFormData(prev => ({
          ...prev,
          totalHoles: String(result.drillingPoints.length),
        }));

        alert(`✅ فایل با موفقیت پردازش شد!\n\n📍 ${result.drillingPoints.length} نقطه حفاری\n📐 ${result.boundaries.length} نقطه مرزی\n🗺️ ${result.layers.length} لایه`);
        
      } else if (fileExt === '.dxf' || fileExt === '.dwg') {
        const samplePoints = [
          { x: 54.300, y: 31.500, name: 'چال 1' },
          { x: 54.320, y: 31.520, name: 'چال 2' },
          { x: 54.340, y: 31.480, name: 'چال 3' },
          { x: 54.360, y: 31.540, name: 'چال 4' },
          { x: 54.380, y: 31.460, name: 'چال 5' },
        ];
        
        const sampleBoundaries = [
          { x: 54.28, y: 31.42 },
          { x: 54.42, y: 31.42 },
          { x: 54.42, y: 31.58 },
          { x: 54.28, y: 31.58 },
          { x: 54.28, y: 31.42 },
        ];
        
        setUploadedFile({
          name: file.name,
          size: file.size,
          type: file.type,
          points: samplePoints,
          boundaries: sampleBoundaries,
          layers: ['DXF Imported'],
          featureCount: samplePoints.length + sampleBoundaries.length,
        });

        setFormData(prev => ({
          ...prev,
          totalHoles: String(samplePoints.length),
        }));
        
        alert('⚠️ فایل DXF با داده‌های نمونه پردازش شد.\nبرای پردازش واقعی، فایل را به GeoJSON تبدیل کنید.');
        
      } else {
        setFileError('فرمت فایل پشتیبانی نمی‌شود. فرمت‌های مجاز: GeoJSON, JSON, DXF, DWG');
      }

    } catch (error) {
      setFileError(error instanceof Error ? error.message : 'خطا در پردازش فایل');
    } finally {
      setIsParsing(false);
    }
  };

  const handleRemoveFile = () => {
    setUploadedFile(null);
    setFileError(null);
    if (fileInputRef.current) {
      fileInputRef.current.value = '';
    }
  };

  const handleSubmit = () => {
    if (!formData.targetLevel.trim() || !formData.blockNumber.trim()) {
      alert('تراز هدف و شماره بلوک الزامی است');
      return;
    }

    const level = parseInt(formData.targetLevel);
    const number = parseInt(formData.blockNumber);
    
    if (isNaN(level) || isNaN(number)) {
      alert('تراز هدف و شماره بلوک باید عدد باشند');
      return;
    }

    setLoading(true);

    try {
      const drillingPoints = uploadedFile?.points?.map(p => [p.x, p.y]) || [];
      const boundariesData = uploadedFile?.boundaries || [];
      const coordinates = boundariesData.length > 0 
        ? [boundariesData.map(p => [p.x, p.y])]
        : [];

      const blockData: Block = {
        id: editingBlock?.id || crypto.randomUUID(),
        code: generateBlockCode(formData.targetLevel, formData.blockNumber),
        name: generateBlockCode(formData.targetLevel, formData.blockNumber),
        targetLevel: level,
        blockNumber: number,
        drillingParams: {
          totalHoles: parseInt(formData.totalHoles) || drillingPoints.length || 0,
          holeDiameter: parseInt(formData.holeDiameter) || 0,
          avgDesignDepth: parseFloat(formData.avgDesignDepth) || 0,
          pattern: formData.pattern || '',
        },
        geometry: {
          type: 'Polygon',
          coordinates: coordinates,
          drillingPoints: drillingPoints,
        },
        status: 'DEFINED',
        statusHistory: [],
        createdBy: '1',
        createdAt: editingBlock?.createdAt || new Date().toISOString(),
        updatedAt: new Date().toISOString(),
      };

      BlockRepository.save(blockData);
      onSuccess();
      onClose();
      
    } catch (error) {
      alert('خطا در ذخیره بلوک');
    } finally {
      setLoading(false);
    }
  };

  const formatFileSize = (bytes: number) => {
    if (bytes < 1024) return bytes + ' B';
    if (bytes < 1024 * 1024) return (bytes / 1024).toFixed(1) + ' KB';
    return (bytes / (1024 * 1024)).toFixed(1) + ' MB';
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm">
      <div className={`border rounded-2xl p-6 w-full max-w-2xl shadow-2xl max-h-[90vh] overflow-y-auto ${
        isDark ? 'bg-[#0A1628] border-[#AACCDD]/20' : 'bg-white border-gray-200'
      }`}>
        <div className="flex items-center justify-between mb-4">
          <h3 className={`text-xl font-bold ${isDark ? 'text-white' : 'text-gray-800'}`}>
            {editingBlock ? 'ویرایش بلوک' : 'افزودن بلوک جدید'}
          </h3>
          <button
            onClick={onClose}
            className={`p-2 rounded-lg transition-colors ${
              isDark ? 'hover:bg-white/5 text-[#8A9DB0] hover:text-white' : 'hover:bg-gray-100 text-gray-500 hover:text-gray-800'
            }`}
          >
            <span className="text-2xl">×</span>
          </button>
        </div>

        <div className="space-y-4">
          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className={`block text-sm mb-1 ${isDark ? 'text-[#8A9DB0]' : 'text-gray-500'}`}>
                تراز هدف *
              </label>
              <input
                type="number"
                value={formData.targetLevel}
                onChange={(e) => setFormData({ ...formData, targetLevel: e.target.value })}
                placeholder="مثال: 1040"
                className={`w-full px-4 py-2 rounded-xl border text-sm focus:outline-none ${
                  isDark
                    ? 'bg-white/5 border-[#AACCDD]/10 text-white placeholder-[#4A6A8A] focus:border-[#AACCDD]/30'
                    : 'bg-gray-100 border-gray-200 text-gray-800 placeholder-gray-400 focus:border-[#1A2A3A]/30'
                }`}
              />
            </div>
            <div>
              <label className={`block text-sm mb-1 ${isDark ? 'text-[#8A9DB0]' : 'text-gray-500'}`}>
                شماره بلوک *
              </label>
              <input
                type="number"
                value={formData.blockNumber}
                onChange={(e) => setFormData({ ...formData, blockNumber: e.target.value })}
                placeholder="مثال: 60"
                className={`w-full px-4 py-2 rounded-xl border text-sm focus:outline-none ${
                  isDark
                    ? 'bg-white/5 border-[#AACCDD]/10 text-white placeholder-[#4A6A8A] focus:border-[#AACCDD]/30'
                    : 'bg-gray-100 border-gray-200 text-gray-800 placeholder-gray-400 focus:border-[#1A2A3A]/30'
                }`}
              />
            </div>
          </div>

          <div className={`p-3 rounded-lg text-center ${isDark ? 'bg-[#13203A]/40' : 'bg-gray-100'}`}>
            <p className={`text-xs ${isDark ? 'text-[#8A9DB0]' : 'text-gray-500'}`}>
              کد بلوک: <span className={`font-mono font-bold ${isDark ? 'text-[#AACCDD]' : 'text-[#1A2A3A]'}`}>
                {generateBlockCode(formData.targetLevel, formData.blockNumber) || '___ B ___'}
              </span>
            </p>
          </div>

          <div className="border-t border-[#AACCDD]/10 pt-4">
            <h4 className={`text-sm font-semibold mb-3 ${isDark ? 'text-white' : 'text-gray-800'}`}>
              آپلود فایل نقشه (GeoJSON / DXF / DWG)
            </h4>
            
            <div
              className={`border-2 border-dashed rounded-xl p-6 text-center transition-colors cursor-pointer ${
                uploadedFile 
                  ? isDark ? 'border-green-500/50 bg-green-500/5' : 'border-green-400/50 bg-green-50'
                  : isDark ? 'border-[#AACCDD]/20 hover:border-[#AACCDD]/40' : 'border-gray-300 hover:border-gray-400'
              }`}
              onClick={() => fileInputRef.current?.click()}
            >
              <input
                ref={fileInputRef}
                type="file"
                accept=".geojson,.json,.dxf,.dwg"
                onChange={handleFileUpload}
                className="hidden"
              />
              
              {isParsing ? (
                <div className="flex items-center justify-center gap-3">
                  <div className="animate-spin rounded-full h-6 w-6 border-2 border-[#AACCDD] border-t-transparent"></div>
                  <span className={`text-sm ${isDark ? 'text-[#8A9DB0]' : 'text-gray-500'}`}>
                    در حال خواندن فایل...
                  </span>
                </div>
              ) : uploadedFile ? (
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    <DocumentIcon className={`w-8 h-8 ${isDark ? 'text-green-400' : 'text-green-600'}`} />
                    <div className="text-right">
                      <p className={`text-sm font-medium ${isDark ? 'text-white' : 'text-gray-800'}`}>
                        {uploadedFile.name}
                      </p>
                      <p className={`text-xs ${isDark ? 'text-[#4A6A8A]' : 'text-gray-400'}`}>
                        {uploadedFile.size > 0 ? formatFileSize(uploadedFile.size) : 'نقاط موجود'} • {uploadedFile.points.length} نقطه حفاری
                      </p>
                    </div>
                  </div>
                  <button
                    onClick={(e) => {
                      e.stopPropagation();
                      handleRemoveFile();
                    }}
                    className={`p-1 rounded-lg transition-colors ${
                      isDark ? 'hover:bg-red-500/20 text-red-400' : 'hover:bg-red-100 text-red-500'
                    }`}
                  >
                    <XMarkIcon className="w-5 h-5" />
                  </button>
                </div>
              ) : (
                <div className="flex flex-col items-center gap-2">
                  <CloudArrowUpIcon className={`w-10 h-10 ${isDark ? 'text-[#4A6A8A]' : 'text-gray-400'}`} />
                  <div>
                    <p className={`text-sm font-medium ${isDark ? 'text-[#8A9DB0]' : 'text-gray-600'}`}>
                      برای آپلود فایل کلیک کنید
                    </p>
                    <p className={`text-xs ${isDark ? 'text-[#4A6A8A]' : 'text-gray-400'}`}>
                      فرمت‌های پشتیبانی شده: GeoJSON, DXF, DWG
                    </p>
                  </div>
                </div>
              )}
            </div>

            {fileError && (
              <div className={`mt-2 p-2 rounded-lg text-xs flex items-center gap-2 ${
                isDark ? 'bg-red-500/10 text-red-400' : 'bg-red-50 text-red-500'
              }`}>
                <InformationCircleIcon className="w-4 h-4" />
                <span>{fileError}</span>
              </div>
            )}

            {uploadedFile && (
              <div className={`mt-2 p-3 rounded-lg text-xs ${isDark ? 'bg-[#13203A]/40' : 'bg-gray-100'}`}>
                <div className="grid grid-cols-2 gap-2">
                  <div>
                    <span className={isDark ? 'text-[#4A6A8A]' : 'text-gray-400'}>نقاط حفاری:</span>
                    <span className={`mr-2 font-medium ${isDark ? 'text-[#AACCDD]' : 'text-[#1A2A3A]'}`}>
                      {uploadedFile.points.length}
                    </span>
                  </div>
                  <div>
                    <span className={isDark ? 'text-[#4A6A8A]' : 'text-gray-400'}>نقاط مرزی:</span>
                    <span className={`mr-2 font-medium ${isDark ? 'text-[#AACCDD]' : 'text-[#1A2A3A]'}`}>
                      {uploadedFile.boundaries.length}
                    </span>
                  </div>
                  {uploadedFile.layers && (
                    <div className="col-span-2">
                      <span className={isDark ? 'text-[#4A6A8A]' : 'text-gray-400'}>لایه‌ها:</span>
                      <span className={`mr-2 font-medium ${isDark ? 'text-[#AACCDD]' : 'text-[#1A2A3A]'}`}>
                        {uploadedFile.layers.join('، ')}
                      </span>
                    </div>
                  )}
                  {uploadedFile.featureCount && (
                    <div className="col-span-2">
                      <span className={isDark ? 'text-[#4A6A8A]' : 'text-gray-400'}>تعداد ویژگی‌ها:</span>
                      <span className={`mr-2 font-medium ${isDark ? 'text-[#AACCDD]' : 'text-[#1A2A3A]'}`}>
                        {uploadedFile.featureCount}
                      </span>
                    </div>
                  )}
                </div>
              </div>
            )}
          </div>

          <div className="border-t border-[#AACCDD]/10 pt-4">
            <h4 className={`text-sm font-semibold mb-3 ${isDark ? 'text-white' : 'text-gray-800'}`}>
              پارامترهای حفاری
            </h4>
            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className={`block text-xs mb-1 ${isDark ? 'text-[#8A9DB0]' : 'text-gray-500'}`}>
                  تعداد چال‌ها
                </label>
                <input
                  type="number"
                  value={formData.totalHoles}
                  onChange={(e) => setFormData({ ...formData, totalHoles: e.target.value })}
                  placeholder="مثال: 36"
                  className={`w-full px-3 py-1.5 rounded-lg border text-sm focus:outline-none ${
                    isDark
                      ? 'bg-white/5 border-[#AACCDD]/10 text-white placeholder-[#4A6A8A] focus:border-[#AACCDD]/30'
                      : 'bg-gray-100 border-gray-200 text-gray-800 placeholder-gray-400 focus:border-[#1A2A3A]/30'
                  }`}
                />
              </div>
              <div>
                <label className={`block text-xs mb-1 ${isDark ? 'text-[#8A9DB0]' : 'text-gray-500'}`}>
                  قطر حفاری (mm)
                </label>
                <input
                  type="number"
                  value={formData.holeDiameter}
                  onChange={(e) => setFormData({ ...formData, holeDiameter: e.target.value })}
                  placeholder="مثال: 76"
                  className={`w-full px-3 py-1.5 rounded-lg border text-sm focus:outline-none ${
                    isDark
                      ? 'bg-white/5 border-[#AACCDD]/10 text-white placeholder-[#4A6A8A] focus:border-[#AACCDD]/30'
                      : 'bg-gray-100 border-gray-200 text-gray-800 placeholder-gray-400 focus:border-[#1A2A3A]/30'
                  }`}
                />
              </div>
              <div>
                <label className={`block text-xs mb-1 ${isDark ? 'text-[#8A9DB0]' : 'text-gray-500'}`}>
                  میانگین عمق (m)
                </label>
                <input
                  type="number"
                  value={formData.avgDesignDepth}
                  onChange={(e) => setFormData({ ...formData, avgDesignDepth: e.target.value })}
                  placeholder="مثال: 12.5"
                  step="0.1"
                  className={`w-full px-3 py-1.5 rounded-lg border text-sm focus:outline-none ${
                    isDark
                      ? 'bg-white/5 border-[#AACCDD]/10 text-white placeholder-[#4A6A8A] focus:border-[#AACCDD]/30'
                      : 'bg-gray-100 border-gray-200 text-gray-800 placeholder-gray-400 focus:border-[#1A2A3A]/30'
                  }`}
                />
              </div>
              <div>
                <label className={`block text-xs mb-1 ${isDark ? 'text-[#8A9DB0]' : 'text-gray-500'}`}>
                  شبکه حفاری *
                </label>
                <select
                  value={formData.pattern}
                  onChange={(e) => setFormData({ ...formData, pattern: e.target.value })}
                  className={`w-full px-3 py-1.5 rounded-lg border text-sm focus:outline-none ${
                    isDark
                      ? 'bg-white/5 border-[#AACCDD]/10 text-white focus:border-[#AACCDD]/30'
                      : 'bg-gray-100 border-gray-200 text-gray-800 focus:border-[#1A2A3A]/30'
                  }`}
                >
                  <option value="">انتخاب شبکه...</option>
                  {DRILLING_PATTERNS.map((pattern) => (
                    <option key={pattern.value} value={pattern.value}>
                      {pattern.label}
                    </option>
                  ))}
                </select>
              </div>
            </div>
          </div>

          <button
            onClick={handleSubmit}
            disabled={loading}
            className={`w-full py-2.5 rounded-xl font-semibold transition-colors disabled:opacity-50 ${
              isDark
                ? 'bg-[#AACCDD] text-[#1A2A3A] hover:bg-[#8A9DB0]'
                : 'bg-[#1A2A3A] text-white hover:bg-[#2A3A4A]'
            }`}
          >
            {loading ? 'در حال ذخیره...' : (editingBlock ? 'ویرایش بلوک' : 'افزودن بلوک')}
          </button>
        </div>
      </div>
    </div>
  );
}

// ============================================
// ✅ صفحه اصلی مدیریت بلوک‌ها (با export درست)
// ============================================

export function BlocksPage() {
  const navigate = useNavigate();
  const { isDark } = useTheme();
  const [blocks, setBlocks] = useState<Block[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');
  const [showAddForm, setShowAddForm] = useState(false);
  const [editingBlock, setEditingBlock] = useState<Block | null>(null);

  const loadData = () => {
    setLoading(true);
    const data = BlockRepository.getAll();
    setBlocks(data);
    setLoading(false);
  };

  useEffect(() => {
    loadData();
  }, []);

  const filteredBlocks = useMemo(() => {
    return blocks.filter(b =>
      b.code.toLowerCase().includes(searchQuery.toLowerCase()) ||
      String(b.targetLevel).includes(searchQuery)
    );
  }, [blocks, searchQuery]);

  const getSubBlockCount = (blockId: string) => {
    return SubBlockRepository.findBy('blockId', blockId).length;
  };

  const handleDeleteBlock = (blockId: string) => {
    if (window.confirm('آیا از حذف این بلوک اطمینان دارید؟')) {
      BlockRepository.delete(blockId);
      loadData();
    }
  };

  const columns = [
    {
      key: 'code',
      header: 'کد بلوک',
      render: (item: Block) => (
        <div>
          <p className="text-white font-mono font-bold">{item.code}</p>
          <p className="text-[#8A9DB0] text-xs">{item.name}</p>
        </div>
      ),
    },
    {
      key: 'targetLevel',
      header: 'تراز هدف',
      render: (item: Block) => (
        <span className="text-white">{item.targetLevel}</span>
      ),
    },
    {
      key: 'blockNumber',
      header: 'شماره',
      render: (item: Block) => (
        <span className="text-white">{item.blockNumber}</span>
      ),
    },
    {
      key: 'drillingParams',
      header: 'پارامترهای حفاری',
      render: (item: Block) => (
        <div className="text-xs">
          <p className="text-[#8A9DB0]">چال‌ها: {item.drillingParams?.totalHoles || 0}</p>
          <p className="text-[#8A9DB0]">عمق: {item.drillingParams?.avgDesignDepth || 0}m</p>
          {item.drillingParams?.pattern && (
            <p className="text-[#AACCDD]">شبکه: {item.drillingParams.pattern}</p>
          )}
        </div>
      ),
    },
    {
      key: 'subBlocks',
      header: 'SubBlock',
      render: (item: Block) => (
        <span className="px-3 py-1 rounded-full text-xs font-medium bg-[#AACCDD]/10 text-[#AACCDD]">
          {getSubBlockCount(item.id)}
        </span>
      ),
    },
    {
      key: 'status',
      header: 'وضعیت',
      render: (item: Block) => (
        <span className={`px-3 py-1 rounded-full text-xs font-medium ${
          item.status === 'APPROVED' ? 'bg-green-500/20 text-green-400 border border-green-500/20' :
          item.status === 'DRILLING' ? 'bg-yellow-500/20 text-yellow-400 border border-yellow-500/20' :
          item.status === 'DRILLED' ? 'bg-blue-500/20 text-blue-400 border border-blue-500/20' :
          'bg-gray-500/20 text-gray-400 border border-gray-500/20'
        }`}>
          {item.status}
        </span>
      ),
    },
    {
      key: 'actions',
      header: 'عملیات',
      render: (item: Block) => (
        <div className="flex items-center gap-2">
          <button
            onClick={() => navigate(`/block/${item.id}`)}
            className="p-1.5 rounded-lg hover:bg-blue-500/20 text-blue-400 transition-colors"
            title="مشاهده جزئیات"
          >
            <EyeIcon className="w-4 h-4" />
          </button>
          <button
            onClick={() => {
              setEditingBlock(item);
              setShowAddForm(true);
            }}
            className="p-1.5 rounded-lg hover:bg-yellow-500/20 text-yellow-400 transition-colors"
            title="ویرایش"
          >
            <PencilIcon className="w-4 h-4" />
          </button>
          <button
            onClick={() => handleDeleteBlock(item.id)}
            className="p-1.5 rounded-lg hover:bg-red-500/20 text-red-400 transition-colors"
            title="حذف"
          >
            <TrashIcon className="w-4 h-4" />
          </button>
        </div>
      ),
    },
  ];

  return (
    <div className={`${isDark ? 'bg-[#0A1628]' : 'bg-gray-50'} min-h-screen p-6 transition-colors duration-300`}>
      <div className="space-y-6 max-w-7xl mx-auto">
        
        <PageHeader
          title="مدیریت بلوک‌ها"
          subtitle={`${blocks.length} بلوک تعریف شده`}
          onRefresh={loadData}
          actions={
            <button
              onClick={() => {
                setEditingBlock(null);
                setShowAddForm(true);
              }}
              className="px-4 py-2 bg-[#AACCDD] text-[#1A2A3A] rounded-xl hover:bg-[#8A9DB0] transition-colors flex items-center gap-2"
            >
              <DocumentPlusIcon className="w-4 h-4" />
              افزودن بلوک
            </button>
          }
        />

        <div className="relative">
          <MagnifyingGlassIcon className={`absolute right-3 top-1/2 -translate-y-1/2 w-5 h-5 ${isDark ? 'text-[#4A6A8A]' : 'text-gray-400'}`} />
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="جستجوی بلوک..."
            className={`w-full pr-12 pl-4 py-3 rounded-xl border transition-all ${
              isDark 
                ? 'bg-[#0A1628] border-[#AACCDD]/10 text-white placeholder-[#4A6A8A] focus:border-[#AACCDD]/30' 
                : 'bg-gray-100 border-gray-200 text-gray-800 placeholder-gray-400 focus:border-[#1A2A3A]/30'
            } focus:outline-none`}
          />
        </div>

        <Table
          data={filteredBlocks}
          columns={columns}
          isLoading={loading}
          emptyMessage="هیچ بلوکی تعریف نشده است"
        />

        <div className={`text-sm text-left ${isDark ? 'text-[#4A6A8A]' : 'text-gray-400'}`}>
          نمایش {filteredBlocks.length} از {blocks.length} بلوک
        </div>
      </div>

      <BlockFormModal
        isOpen={showAddForm}
        onClose={() => {
          setShowAddForm(false);
          setEditingBlock(null);
        }}
        onSuccess={loadData}
        editingBlock={editingBlock}
      />
    </div>
  );
}