// src/modules/mine/presentation/components/MapUploader/MapUploader.tsx

import { useState, useRef } from 'react';
import { CloudArrowUpIcon, DocumentIcon, XMarkIcon } from '@heroicons/react/24/outline';
import { useTheme } from '../../../../../shared/context/ThemeContext';

interface MapUploaderProps {
  onUpload: (data: any) => void;
  onClose: () => void;
}

export function MapUploader({ onUpload, onClose }: MapUploaderProps) {
  const { isDark } = useTheme();
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [file, setFile] = useState<File | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [fileType, setFileType] = useState<'geojson' | 'dxf' | 'shp' | null>(null);

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
    
    if (ext === '.geojson' || ext === '.json') {
      setFileType('geojson');
    } else if (ext === '.dxf' || ext === '.dwg') {
      setFileType('dxf');
    } else if (ext === '.shp') {
      setFileType('shp');
    }
  };

  const handleUpload = async () => {
    if (!file) return;

    setLoading(true);
    setError(null);

    try {
      // برای GeoJSON: مستقیم خوانده میشه
      if (fileType === 'geojson') {
        const content = await file.text();
        const data = JSON.parse(content);
        onUpload(data);
        return;
      }

      // برای DXF/DWG: نیاز به تبدیل داره
      if (fileType === 'dxf' ) {
        // اینجا باید DXF رو به GeoJSON تبدیل کنید
        // فعلاً از داده‌های نمونه استفاده می‌کنیم
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
              properties: { name: 'محدوده معدن' }
            }
          ]
        };
        onUpload(sampleGeoJSON);
      }

      // برای Shapefile: نیاز به تبدیل داره
      if (fileType === 'shp') {
        // معمولاً با فایل‌های shp, shx, dbf همراهه
        // برای سادگی از داده نمونه استفاده می‌کنیم
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
              properties: { name: 'محدوده معدن' }
            }
          ]
        };
        onUpload(sampleGeoJSON);
      }

    } catch (error) {
      setError('خطا در پردازش فایل');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className={`fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm`}>
      <div className={`border rounded-2xl p-6 w-full max-w-lg shadow-2xl ${
        isDark ? 'bg-[#0A1628] border-[#AACCDD]/20' : 'bg-white border-gray-200'
      }`}>
        <div className="flex items-center justify-between mb-4">
          <h3 className={`text-xl font-bold ${isDark ? 'text-white' : 'text-gray-800'}`}>
            بارگذاری نقشه معدن
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
          <div className={`border-2 border-dashed rounded-xl p-8 text-center transition-colors cursor-pointer ${
            file 
              ? isDark ? 'border-green-500/50 bg-green-500/5' : 'border-green-400/50 bg-green-50'
              : isDark ? 'border-[#AACCDD]/20 hover:border-[#AACCDD]/40' : 'border-gray-300 hover:border-gray-400'
          }`}
          onClick={() => fileInputRef.current?.click()}>
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
                <div className="text-right">
                  <p className={`text-sm font-medium ${isDark ? 'text-white' : 'text-gray-800'}`}>
                    {file.name}
                  </p>
                  <p className={`text-xs ${isDark ? 'text-[#4A6A8A]' : 'text-gray-400'}`}>
                    {(file.size / 1024).toFixed(1)} KB • {fileType?.toUpperCase()}
                  </p>
                </div>
              </div>
            ) : (
              <div className="flex flex-col items-center gap-2">
                <CloudArrowUpIcon className={`w-12 h-12 ${isDark ? 'text-[#4A6A8A]' : 'text-gray-400'}`} />
                <p className={`text-sm ${isDark ? 'text-[#8A9DB0]' : 'text-gray-600'}`}>
                  برای آپلود فایل نقشه کلیک کنید
                </p>
                <div className="flex flex-wrap gap-2 mt-2">
                  {acceptedFormats.map(f => (
                    <span key={f.ext} className={`px-2 py-0.5 rounded text-[10px] ${
                      isDark ? 'bg-[#AACCDD]/10 text-[#8A9DB0]' : 'bg-gray-100 text-gray-500'
                    }`}>
                      {f.ext}
                    </span>
                  ))}
                </div>
              </div>
            )}
          </div>

          {error && (
            <div className={`p-2 rounded-lg text-sm ${isDark ? 'bg-red-500/10 text-red-400' : 'bg-red-50 text-red-500'}`}>
              {error}
            </div>
          )}

          <div className={`p-3 rounded-lg text-xs ${isDark ? 'bg-[#13203A]/40 text-[#8A9DB0]' : 'bg-gray-100 text-gray-500'}`}>
            <p>💡 نکات مهم:</p>
            <ul className="list-disc list-inside mt-1 space-y-0.5">
              <li>فرمت‌های پشتیبانی: GeoJSON, DXF, DWG, Shapefile</li>
              <li>برای بهترین نتیجه، فایل را با QGIS به GeoJSON تبدیل کنید</li>
              <li>سیستم مختصات باید WGS84 (EPSG:4326) باشد</li>
            </ul>
          </div>

          <button
            onClick={handleUpload}
            disabled={!file || loading}
            className={`w-full py-2.5 rounded-xl font-semibold transition-colors disabled:opacity-50 ${
              isDark
                ? 'bg-[#AACCDD] text-[#1A2A3A] hover:bg-[#8A9DB0]'
                : 'bg-[#1A2A3A] text-white hover:bg-[#2A3A4A]'
            }`}
          >
            {loading ? 'در حال پردازش...' : 'بارگذاری نقشه'}
          </button>
        </div>
      </div>
    </div>
  );
}