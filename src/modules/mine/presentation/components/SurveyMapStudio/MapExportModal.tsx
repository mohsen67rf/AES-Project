// src/modules/mine/presentation/components/SurveyMapStudio/MapExportModal.tsx

import React, { useState } from 'react';
import type { SurveyMap } from '../../../../../core/domain/types/survey-map.types';
import { 
  XMarkIcon, 
  ArrowDownTrayIcon, 
  DocumentTextIcon, 
  PrinterIcon,
  CheckIcon,
  CodeBracketIcon
} from '@heroicons/react/24/outline';

interface MapExportModalProps {
  map: SurveyMap;
  onClose: () => void;
}

export function MapExportModal({ map, onClose }: MapExportModalProps) {
  const [exportType, setExportType] = useState<'GEOJSON' | 'DXF_JSON' | 'CSV_POINTS'>('GEOJSON');
  const [copied, setCopied] = useState<boolean>(false);

  // تولید محتوای GeoJSON استاندارد
  const geoJsonData = {
    type: 'FeatureCollection',
    metadata: {
      mapCode: map.code,
      title: map.title,
      benchLevel: map.benchLevel,
      coordinateSystem: map.coordinateSystem,
      version: map.version,
      surveyDate: map.surveyDate,
      exportedAt: new Date().toISOString()
    },
    features: (map.features || []).map(f => ({
      type: 'Feature',
      id: f.id,
      geometry: {
        type: f.type === 'POLYGON' ? 'Polygon' : f.type === 'POLYLINE' ? 'LineString' : 'Point',
        coordinates: f.type === 'POLYGON' ? [f.coordinates] : f.type === 'POLYLINE' ? f.coordinates : f.coordinates[0] || [0, 0]
      },
      properties: {
        name: f.name,
        category: f.category,
        elevation: f.elevation,
        ...f.properties
      }
    }))
  };

  const jsonString = JSON.stringify(geoJsonData, null, 2);

  const handleDownload = () => {
    const blob = new Blob([jsonString], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `${map.code}_${map.version.replace(' ', '_')}.geojson`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
  };

  const handleCopy = () => {
    navigator.clipboard.writeText(jsonString);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-md animate-fade-in" dir="rtl">
      <div className="w-full max-w-2xl bg-slate-900 border border-slate-700 rounded-3xl p-6 text-right shadow-2xl space-y-5 text-white max-h-[90vh] overflow-y-auto">
        {/* هدر */}
        <div className="flex items-center justify-between border-b border-slate-800 pb-4">
          <div className="flex items-center gap-3">
            <span className="p-2.5 rounded-2xl bg-emerald-500/20 text-emerald-400 border border-emerald-500/30">
              <ArrowDownTrayIcon className="w-6 h-6" />
            </span>
            <div>
              <h3 className="font-bold text-lg text-white">صدور خروجی و اشتراک‌گذاری نقشه معدن</h3>
              <p className="text-xs text-slate-400">{map.title} ({map.version})</p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-2 rounded-xl bg-slate-800 text-slate-400 hover:text-white"
          >
            <XMarkIcon className="w-5 h-5" />
          </button>
        </div>

        {/* گزینه‌های فرمت خروجی */}
        <div className="grid grid-cols-3 gap-3 text-xs">
          <button
            onClick={() => setExportType('GEOJSON')}
            className={`p-3 rounded-2xl border transition-all text-center space-y-1 ${
              exportType === 'GEOJSON'
                ? 'bg-emerald-500/20 border-emerald-500 text-white font-bold shadow-lg shadow-emerald-500/20'
                : 'bg-slate-950/60 border-slate-800 text-slate-400 hover:text-white'
            }`}
          >
            <CodeBracketIcon className="w-5 h-5 mx-auto text-emerald-400" />
            <div>فرمت GeoJSON</div>
            <div className="text-[10px] text-slate-500">استاندارد GIS و QGIS</div>
          </button>

          <button
            onClick={() => setExportType('DXF_JSON')}
            className={`p-3 rounded-2xl border transition-all text-center space-y-1 ${
              exportType === 'DXF_JSON'
                ? 'bg-cyan-500/20 border-cyan-500 text-white font-bold shadow-lg shadow-cyan-500/20'
                : 'bg-slate-950/60 border-slate-800 text-slate-400 hover:text-white'
            }`}
          >
            <DocumentTextIcon className="w-5 h-5 mx-auto text-cyan-400" />
            <div>فرمت CAD / DXF</div>
            <div className="text-[10px] text-slate-500">AutoCAD & Civil3D</div>
          </button>

          <button
            onClick={() => setExportType('CSV_POINTS')}
            className={`p-3 rounded-2xl border transition-all text-center space-y-1 ${
              exportType === 'CSV_POINTS'
                ? 'bg-purple-500/20 border-purple-500 text-white font-bold shadow-lg shadow-purple-500/20'
                : 'bg-slate-950/60 border-slate-800 text-slate-400 hover:text-white'
            }`}
          >
            <PrinterIcon className="w-5 h-5 mx-auto text-purple-400" />
            <div>گزارش نقاط و مختصات (XYZ)</div>
            <div className="text-[10px] text-slate-500">خروجی اکسل / توتال‌استیشن</div>
          </button>
        </div>

        {/* پیش‌نمایش کد / داده خروجی */}
        <div className="space-y-2">
          <div className="flex items-center justify-between text-xs text-slate-400">
            <span>پیش‌نمایش داده‌های هندسی ({map.features?.length || 0} المان):</span>
            <button
              onClick={handleCopy}
              className="text-cyan-400 hover:text-cyan-300 flex items-center gap-1 font-bold"
            >
              {copied ? <CheckIcon className="w-4 h-4 text-emerald-400" /> : null}
              <span>{copied ? 'کپی شد!' : 'کپی متن'}</span>
            </button>
          </div>

          <pre className="p-4 rounded-2xl bg-slate-950 border border-slate-800 text-[11px] font-mono text-cyan-300 max-h-48 overflow-y-auto ltr text-left">
            {jsonString}
          </pre>
        </div>

        {/* دکمه‌های اقدام */}
        <div className="flex items-center justify-end gap-3 pt-3 border-t border-slate-800">
          <button
            type="button"
            onClick={onClose}
            className="px-4 py-2 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-300 font-bold"
          >
            بستن
          </button>
          <button
            type="button"
            onClick={handleDownload}
            className="px-5 py-2 rounded-xl bg-emerald-500 hover:bg-emerald-400 text-slate-950 font-black shadow-lg shadow-emerald-500/20 flex items-center gap-2"
          >
            <ArrowDownTrayIcon className="w-4 h-4" />
            <span>دانلود فایل خروجی (.geojson)</span>
          </button>
        </div>
      </div>
    </div>
  );
}
