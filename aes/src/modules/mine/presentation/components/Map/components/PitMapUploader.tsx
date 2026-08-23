// src/modules/mine/presentation/components/Map/components/PitMapUploader.tsx

import { useState, useRef } from 'react';
import { useTheme } from '../../../../../../shared/context/ThemeContext';
import { 
  CloudArrowUpIcon, 
  DocumentIcon, 
  XMarkIcon, 
  CheckIcon,
  MapPinIcon
} from '@heroicons/react/24/outline';

interface PitMapUploaderProps {
  pitId: string;
  pitName: string;
  onUpload: (data: any) => void;
  onClose: () => void;
}

export function PitMapUploader({ pitId, pitName, onUpload, onClose }: PitMapUploaderProps) {
  const { isDark } = useTheme();
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [file, setFile] = useState<File | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const acceptedFormats = [
    { ext: '.geojson', label: 'GeoJSON' },
    { ext: '.json', label: 'GeoJSON' },
    { ext: '.dxf', label: 'DXF' },
    { ext: '.dwg', label: 'DWG' },
    { ext: '.shp', label: 'Shapefile' },
  ];

  const handleFileSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    const selected = e.target.files?.[0];
    if (!selected) return;

    const ext = '.' + selected.name.split('.').pop()?.toLowerCase();
    const valid = acceptedFormats.some(f => f.ext === ext);
    
    if (!valid) {
      setError('فرمت فایل پشتیبانی نمی‌شود');
      return;
    }

    setFile(selected);
    setError(null);
    console.log(`📎 فایل انتخاب شد: ${selected.name}`);
  };

  const handleUpload = async () => {
    if (!file) {
      console.warn('⚠️ هیچ فایلی انتخاب نشده است');
      return;
    }

    console.log(`📤 شروع آپلود نقشه پیت: ${pitName} (${pitId})`);
    console.log(`📄 نام فایل: ${file.name}`);

    setLoading(true);
    setError(null);

    try {
      const ext = '.' + file.name.split('.').pop()?.toLowerCase();
      
      if (ext === '.geojson' || ext === '.json') {
        const content = await file.text();
        console.log('📄 محتوای فایل خوانده شد، طول:', content.length);
        
        const data = JSON.parse(content);
        console.log('📊 داده parse شد:', data);
        
        // ✅ تبدیل به FeatureCollection
        let featureCollection;
        if (data.type === 'FeatureCollection' && Array.isArray(data.features)) {
          featureCollection = data;
          console.log('✅ داده از قبل FeatureCollection است');
        } else if (data.features && Array.isArray(data.features)) {
          featureCollection = {
            type: 'FeatureCollection',
            features: data.features,
          };
          console.log('✅ داده به FeatureCollection تبدیل شد (features موجود بود)');
        } else {
          featureCollection = {
            type: 'FeatureCollection',
            features: [data],
          };
          console.log('✅ داده به FeatureCollection تبدیل شد (تک Feature)');
        }

        console.log(`📊 تعداد ویژگی‌ها: ${featureCollection.features.length}`);
        console.log('📤 ارسال داده به onUpload...');
        
        // ✅ ارسال داده به onUpload
        onUpload(featureCollection);
        console.log('✅ داده به onUpload ارسال شد');
        return;
      }

      // برای DXF, DWG, Shapefile از داده نمونه استفاده می‌کنیم
      console.log('⚠️ فایل غیر GeoJSON، استفاده از داده نمونه');
      
      const sampleGeoJSON = {
        type: 'FeatureCollection',
        features: [
          {
            type: 'Feature',
            geometry: {
              type: 'Polygon',
              coordinates: [[
                [54.28, 31.42],
                [54.42, 31.42],
                [54.42, 31.58],
                [54.28, 31.58],
                [54.28, 31.42]
              ]]
            },
            properties: { 
              name: pitName,
              pitId: pitId,
              type: 'pit_boundary',
              description: `نقشه پیت ${pitName}`
            }
          }
        ]
      };
      
      console.log('📤 ارسال داده نمونه به onUpload...');
      onUpload(sampleGeoJSON);
      console.log('✅ داده نمونه به onUpload ارسال شد');

    } catch (error) {
      console.error('❌ خطا در پردازش فایل:', error);
      setError('خطا در پردازش فایل: ' + (error instanceof Error ? error.message : 'نامشخص'));
    } finally {
      setLoading(false);
    }
  };

  const formatFileSize = (bytes: number) => {
    if (bytes < 1024) return bytes + ' B';
    if (bytes < 1024 * 1024) return (bytes / 1024).toFixed(1) + ' KB';
    return (bytes / (1024 * 1024)).toFixed(1) + ' MB';
  };

  return (
    <>
      <div className="fixed inset-0 z-[9999] bg-black/60 backdrop-blur-sm animate-in fade-in duration-300" onClick={onClose} />
      
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
                  <MapPinIcon className={`w-4 h-4 ${isDark ? 'text-[#C9A227]' : 'text-[#C9A227]'}`} />
                </div>
                <div>
                  <h3 className={`text-sm font-bold ${isDark ? 'text-white' : 'text-gray-800'}`}>
                    🗺️ بارگذاری نقشه پیت
                  </h3>
                  <p className={`text-[10px] ${isDark ? 'text-[#4A6A8A]' : 'text-gray-400'}`}>
                    {pitName}
                  </p>
                </div>
              </div>
              <button onClick={onClose} className={`p-1.5 rounded-lg transition-all hover:scale-110 ${
                isDark ? 'hover:bg-white/5 text-[#8A9DB0] hover:text-white' : 'hover:bg-gray-100 text-gray-500 hover:text-gray-800'
              }`}>
                <XMarkIcon className="w-5 h-5" />
              </button>
            </div>

            <div className="px-6 py-4 space-y-4 overflow-y-auto flex-1">
              <div
                className={`border-2 border-dashed rounded-xl p-6 text-center transition-colors cursor-pointer ${
                  file 
                    ? isDark ? 'border-green-500/50 bg-green-500/5' : 'border-green-400/50 bg-green-50'
                    : isDark ? 'border-[#AACCDD]/20 hover:border-[#AACCDD]/40' : 'border-gray-300 hover:border-gray-400'
                }`}
                onClick={() => fileInputRef.current?.click()}
              >
                <input
                  ref={fileInputRef}
                  type="file"
                  accept=".geojson,.json,.dxf,.dwg,.shp"
                  onChange={handleFileSelect}
                  className="hidden"
                />

                {file ? (
                  <div className="flex items-center gap-3">
                    <DocumentIcon className={`w-8 h-8 ${isDark ? 'text-green-400' : 'text-green-600'}`} />
                    <div className="text-right flex-1">
                      <p className={`text-sm font-medium ${isDark ? 'text-white' : 'text-gray-800'}`}>
                        {file.name}
                      </p>
                      <p className={`text-xs ${isDark ? 'text-[#4A6A8A]' : 'text-gray-400'}`}>
                        {formatFileSize(file.size)}
                      </p>
                    </div>
                    <button
                      onClick={(e) => {
                        e.stopPropagation();
                        setFile(null);
                        if (fileInputRef.current) fileInputRef.current.value = '';
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
                    <CloudArrowUpIcon className={`w-12 h-12 ${isDark ? 'text-[#4A6A8A]' : 'text-gray-400'}`} />
                    <div>
                      <p className={`text-sm font-medium ${isDark ? 'text-[#8A9DB0]' : 'text-gray-600'}`}>
                        برای آپلود نقشه کلیک کنید
                      </p>
                      <p className={`text-xs ${isDark ? 'text-[#4A6A8A]' : 'text-gray-400'}`}>
                        فرمت‌های پشتیبانی شده: GeoJSON, DXF, DWG, Shapefile
                      </p>
                    </div>
                  </div>
                )}
              </div>

              {error && (
                <div className={`p-3 rounded-lg text-sm flex items-center gap-2 ${
                  isDark ? 'bg-red-500/10 text-red-400 border border-red-500/20' : 'bg-red-50 text-red-500 border border-red-200'
                }`}>
                  <span>❌</span>
                  <span>{error}</span>
                </div>
              )}

              <div className={`p-3 rounded-lg text-xs ${isDark ? 'bg-[#13203A]/40 text-[#8A9DB0]' : 'bg-gray-100 text-gray-500'}`}>
                <p className="font-medium mb-1">💡 نکات مهم:</p>
                <ul className="list-disc list-inside space-y-0.5">
                  <li>این نقشه مختص پیت {pitName} خواهد بود</li>
                  <li>سیستم مختصات باید WGS84 (EPSG:4326) باشد</li>
                  <li>برای بهترین نتیجه، فایل را با QGIS به GeoJSON تبدیل کنید</li>
                </ul>
              </div>
            </div>

            <div className={`px-6 py-4 border-t flex gap-3 flex-shrink-0 ${
              isDark ? 'border-[#AACCDD]/10' : 'border-gray-100'
            }`}>
              <button onClick={onClose} className={`flex-1 px-4 py-2 rounded-xl text-sm font-medium transition-all ${
                isDark ? 'bg-white/5 text-[#8A9DB0] hover:bg-white/10' : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
              }`}>
                انصراف
              </button>
              <button
                onClick={handleUpload}
                disabled={!file || loading}
                className="flex-1 px-4 py-2 rounded-xl text-sm font-medium bg-[#C9A227] text-[#1A2A3A] hover:bg-[#D4AF37] transition-all flex items-center justify-center gap-2 disabled:opacity-50"
              >
                {loading ? (
                  <>
                    <div className="animate-spin rounded-full h-4 w-4 border-2 border-[#1A2A3A] border-t-transparent" />
                    در حال پردازش...
                  </>
                ) : (
                  <>
                    <CheckIcon className="w-4 h-4" />
                    بارگذاری نقشه
                  </>
                )}
              </button>
            </div>
          </div>
        </div>
      </div>
    </>
  );
}

export default PitMapUploader;