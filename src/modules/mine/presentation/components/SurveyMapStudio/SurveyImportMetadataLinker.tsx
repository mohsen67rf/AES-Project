// src/modules/mine/presentation/components/SurveyMapStudio/SurveyImportMetadataLinker.tsx

import React, { useState, useMemo, useEffect } from 'react';
import type { 
  SurveyMap, 
  MapFeature, 
  MapLayer, 
  MapCategory, 
  MapFormat,
  FeatureCategory
} from '../../../../../core/domain/types/survey-map.types';
import type { 
  StakeholderRole, 
  SubBlock 
} from '../../../../../core/domain/types/mine.types';
import { 
  SurveyMapRepository,
  PitRepository,
  BlockRepository,
  SubBlockRepository,
  MonthlyBandRepository,
  StockpileRepository,
  AuditLogRepository
} from '../../../../../core/infrastructure/repositories';
import { SurveyMapService } from '../../../services/SurveyMapService';
import { formatBlockCode, BlockCodeDisplay } from '../../../../../shared/components/BlockCodeDisplay';

import {
  DocumentArrowUpIcon,
  ArrowUpTrayIcon,
  SparklesIcon,
  CheckCircleIcon,
  ArrowRightIcon,
  ArrowLeftIcon,
  CircleStackIcon,
  MapPinIcon,
  EyeIcon,
  CubeIcon,
  CheckBadgeIcon,
  TagIcon,
  XMarkIcon
} from '@heroicons/react/24/outline';

interface SurveyImportMetadataLinkerProps {
  activeRole: StakeholderRole;
  userName: string;
  onMapImported?: (map: SurveyMap) => void;
  onClose?: () => void;
  isStandalonePage?: boolean;
}

// تایپ داده‌های اتصال متادیتا به لایه/المان
interface LayerMetadataMapping {
  layerName: string;
  category: FeatureCategory;
  targetEntity: 'SUB_BLOCK' | 'BLOCK' | 'BLAST_PATTERN' | 'CREST_TOE' | 'HAUL_ROAD' | 'BENCHMARK' | 'GENERAL';
  blockId?: string;
  blockCode?: string;
  autoCreateSubBlocks: boolean;
  defaultRockType: string;
  defaultOreType: string;
  defaultFeGrade: number;
  defaultFeO: number;
  defaultSiO2: number;
  defaultDensity: number;
  defaultDestination: string;
  color: string;
  detectedCount: number;
}

export const SurveyImportMetadataLinker: React.FC<SurveyImportMetadataLinkerProps> = ({
  activeRole,
  userName,
  onMapImported,
  onClose,
  isStandalonePage = false
}) => {
  // مراحل ویزارد
  const [currentStep, setCurrentStep] = useState<1 | 2 | 3 | 4>(1);

  // داده‌های منبع از دیتابیس
  const [pits, setPits] = useState(PitRepository.getAll());
  const [blocks, setBlocks] = useState(BlockRepository.getAll());
  const [monthlyBands, setMonthlyBands] = useState(MonthlyBandRepository.getAll());
  const [stockpiles, setStockpiles] = useState(StockpileRepository.getAll());

  // مرحله ۱: ورودی فایل
  const [inputMode, setInputMode] = useState<'FILE_UPLOAD' | 'PRESET_PACKAGE'>('PRESET_PACKAGE');
  const [fileFormat, setFileFormat] = useState<MapFormat>('GEOJSON');
  const [fileName, setFileName] = useState<string>('');
  const [rawFileContent, setRawFileContent] = useState<string>('');
  const [mapTitle, setMapTitle] = useState<string>('نقشه مهندسی تراز ۱۰۴۰ و تفکیک ساب‌بلوک‌ها (B-32)');
  const [mapCategory, setMapCategory] = useState<MapCategory>('BENCH_PLAN');
  const [coordinateSystem, setCoordinateSystem] = useState<string>('UTM Zone 39N (WGS84)');
  const [benchLevel, setBenchLevel] = useState<number>(1040);
  const [benchHeight, setBenchHeight] = useState<number>(15); // ارتفاع پله به متر

  // متادیتای تجهیزات و نقشه‌بردار
  const [surveyorUnit, setSurveyorUnit] = useState<string>('واحد نقشه‌برداری و فتوگرامتری نظارت مهندسی');
  const [surveyorEngineer, setSurveyorEngineer] = useState<string>(userName);
  const [surveyEquipment, setSurveyEquipment] = useState<string>('پهپاد فتوگرامتری DJI Matrice 300 RTK + گیرنده چندفرکانسه لایکا GS18');
  const [calibrationCode, setCalibrationCode] = useState<string>('CAL-1403/09-GEO-884');
  const [surveyDate, setSurveyDate] = useState<string>(new Date().toISOString().split('T')[0]);

  // مرحله ۲: المان‌ها و لایه‌های استخراج شده
  const [parsedFeatures, setParsedFeatures] = useState<MapFeature[]>([]);
  const [parsedLayers, setParsedLayers] = useState<MapLayer[]>([]);
  const [previewZoom, setPreviewZoom] = useState<number>(1);
  const [selectedPreviewFeatureId, setSelectedPreviewFeatureId] = useState<string | null>(null);

  // مرحله ۳: اتصال متادیتاها
  const [selectedPitId, setSelectedPitId] = useState<string>(pits[0]?.id || 'pit-001');
  const [selectedBandId, setSelectedBandId] = useState<string>(monthlyBands[0]?.id || 'band-1405-03-01');
  const [selectedBlockId, setSelectedBlockId] = useState<string>(blocks[0]?.id || 'block-1040-b32');
  const [layerMappings, setLayerMappings] = useState<Record<string, LayerMetadataMapping>>({});
  
  // تنظیمات اتصال ساب‌بلوک‌ها
  const [autoSyncSubBlocksToDb, setAutoSyncSubBlocksToDb] = useState<boolean>(true);
  const [autoSyncDrillHolesToDb, setAutoSyncDrillHolesToDb] = useState<boolean>(true);
  const [revisionVersion, setRevisionVersion] = useState<string>('Rev 1.0');
  const [approvalStatus, setApprovalStatus] = useState<'DRAFT' | 'PENDING_REVIEW' | 'APPROVED_OFFICIAL'>('APPROVED_OFFICIAL');

  // وضعیت ثبت و نتیجه
  const [isProcessing, setIsProcessing] = useState<boolean>(false);
  const [importSuccessResult, setImportSuccessResult] = useState<{
    map: SurveyMap;
    subBlocksCreated: number;
    pointsLinked: number;
  } | null>(null);

  // پکیج‌های پیش‌فرض نقشه‌برداری معدن
  const PRESET_SURVEY_PACKAGES = [
    {
      id: 'pkg-1040-subblocks',
      title: 'پلان تفکیک ساب‌بلوک‌های تراز ۱۰۴۰ بلوک B-32 (SA, SB, SC, SD)',
      category: 'BENCH_PLAN' as MapCategory,
      format: 'GEOJSON' as MapFormat,
      benchLevel: 1040,
      pitId: 'pit-001',
      description: 'حاوی ۴ ساب‌بلوک استخراجی با مرزهای دقیق پلی‌گون، خطوط پله Crest و Toe، و شبکه چال‌های گمانه',
      rawGeoJson: JSON.stringify({
        type: "FeatureCollection",
        features: [
          {
            type: "Feature",
            properties: { 
              layer: "SUB_BLOCKS", 
              code: "1040 B 32 – SA", 
              subBlockId: "sb-1040-32-sa",
              rockType: "مگنتیت خالص متراکم", 
              oreType: "کانسنگ پرعیار DSO",
              feGrade: 62.4, 
              feoGrade: 22.1, 
              sio2Grade: 3.9, 
              density: 3.15,
              destination: "CRUSHER_LINE_1",
              status: "APPROVED" 
            },
            geometry: {
              type: "Polygon",
              coordinates: [[[54.310, 31.520], [54.335, 31.520], [54.335, 31.545], [54.310, 31.545], [54.310, 31.520]]]
            }
          },
          {
            type: "Feature",
            properties: { 
              layer: "SUB_BLOCKS", 
              code: "1040 B 32 – SB", 
              subBlockId: "sb-1040-32-sb",
              rockType: "مگنتیت - هماتیت متراکم", 
              oreType: "کانسنگ پرعیار دپوسازی",
              feGrade: 58.8, 
              feoGrade: 19.4, 
              sio2Grade: 5.2, 
              density: 3.05,
              destination: "STK-HIGH-01",
              status: "APPROVED" 
            },
            geometry: {
              type: "Polygon",
              coordinates: [[[54.335, 31.520], [54.360, 31.520], [54.360, 31.545], [54.335, 31.545], [54.335, 31.520]]]
            }
          },
          {
            type: "Feature",
            properties: { 
              layer: "SUB_BLOCKS", 
              code: "1040 B 32 – SC", 
              subBlockId: "sb-1040-32-sc",
              rockType: "مگنتیت سیلیکاته", 
              oreType: "کانسنگ متوسط‌عیار",
              feGrade: 51.6, 
              feoGrade: 15.8, 
              sio2Grade: 8.9, 
              density: 2.85,
              destination: "STK-MED-01",
              status: "APPROVED" 
            },
            geometry: {
              type: "Polygon",
              coordinates: [[[54.310, 31.545], [54.335, 31.545], [54.335, 31.570], [54.310, 31.570], [54.310, 31.545]]]
            }
          },
          {
            type: "Feature",
            properties: { 
              layer: "SUB_BLOCKS", 
              code: "1040 B 32 – SD", 
              subBlockId: "sb-1040-32-sd",
              rockType: "اسکارن و باطله سنگی", 
              oreType: "باطله سنگی",
              feGrade: 18.2, 
              feoGrade: 4.1, 
              sio2Grade: 24.5, 
              density: 2.65,
              destination: "DUMP-WASTE-01",
              status: "APPROVED" 
            },
            geometry: {
              type: "Polygon",
              coordinates: [[[54.335, 31.545], [54.360, 31.545], [54.360, 31.570], [54.335, 31.570], [54.335, 31.545]]]
            }
          },
          // خط پله بالای Crest
          {
            type: "Feature",
            properties: { layer: "BENCH_CREST", name: "خط لبه بالای پله تراز ۱۰۴۰ (Crest)" },
            geometry: {
              type: "LineString",
              coordinates: [[54.300, 31.510], [54.370, 31.510], [54.370, 31.580], [54.300, 31.580]]
            }
          },
          // خط پای پله Toe
          {
            type: "Feature",
            properties: { layer: "BENCH_TOE", name: "خط پای پله تراز ۱۰۲۵ (Toe)" },
            geometry: {
              type: "LineString",
              coordinates: [[54.295, 31.505], [54.375, 31.505], [54.375, 31.585], [54.295, 31.585]]
            }
          },
          // ایستگاه بنچ‌مارک
          {
            type: "Feature",
            properties: { layer: "BENCHMARKS", name: "ایستگاه ژئودزی و بنچ‌مارک BM-104", elevation: 1040.12 },
            geometry: {
              type: "Point",
              coordinates: [54.305, 31.515]
            }
          }
        ]
      })
    },
    {
      id: 'pkg-dxf-holes',
      title: 'نقشه خروجی اتوکد DXF الگوی ۴۸ چال انفجاری تراز ۱۰۴۰',
      category: 'BLAST_PATTERN' as MapCategory,
      format: 'DXF_JSON' as MapFormat,
      benchLevel: 1040,
      pitId: 'pit-001',
      description: 'حاوی شبکه منظم چال‌های انفجاری با قطر ۷۶mm، بار سنگ ۳.۰m و فاصله ۳.۵m به همراه خط مرز انفجار',
      rawGeoJson: JSON.stringify({
        type: "FeatureCollection",
        features: [
          {
            type: "Feature",
            properties: { layer: "BLAST_BOUNDARY", name: "محدوده آتشباری بلوک ۳۲", volumeM3: 45000 },
            geometry: {
              type: "Polygon",
              coordinates: [[[54.315, 31.525], [54.355, 31.525], [54.355, 31.565], [54.315, 31.565], [54.315, 31.525]]]
            }
          },
          ...Array.from({ length: 24 }).map((_, i) => ({
            type: "Feature",
            properties: {
              layer: "BLAST_HOLES",
              name: `چال انفجاری #${i + 1}`,
              holeDiameterMm: 76,
              depthM: 12.5,
              subDrillingM: 1.0,
              burdenM: 3.0,
              spacingM: 3.5
            },
            geometry: {
              type: "Point",
              coordinates: [
                54.320 + (i % 6) * 0.006,
                54.530 + Math.floor(i / 6) * 0.008
              ]
            }
          }))
        ]
      })
    },
    {
      id: 'pkg-haul-roads',
      title: 'نقشه شبکه راه‌های باربری، رمپ‌ها و دپوهای سنگ‌آهن',
      category: 'HAUL_ROAD_NETWORK' as MapCategory,
      format: 'GEOJSON' as MapFormat,
      benchLevel: 1040,
      pitId: 'pit-001',
      description: 'مسیرهای رمپ با شیب ۸٪، مسیر دسترسی به سنگ‌شکن اولیه و موقعیت دپوهای STK-HIGH و STK-MED',
      rawGeoJson: JSON.stringify({
        type: "FeatureCollection",
        features: [
          {
            type: "Feature",
            properties: { layer: "HAUL_ROADS", name: "رمپ اصلی باربری شیب ۸٪ - پیت مرکزی", widthM: 25 },
            geometry: {
              type: "LineString",
              coordinates: [[54.290, 31.500], [54.320, 31.530], [54.350, 31.560], [54.380, 31.600]]
            }
          },
          {
            type: "Feature",
            properties: { layer: "STOCKPILES", name: "محدوده دپوی سنگ‌آهن پرعیار STK-HIGH-01", destination: "STK-HIGH-01" },
            geometry: {
              type: "Polygon",
              coordinates: [[[54.370, 31.500], [54.390, 31.500], [54.390, 31.520], [54.370, 31.520], [54.370, 31.500]]]
            }
          },
          {
            type: "Feature",
            properties: { layer: "STOCKPILES", name: "محدوده ورودی سنگ‌شکن فکی ۱", destination: "CRUSHER_LINE_1" },
            geometry: {
              type: "Polygon",
              coordinates: [[[54.270, 31.480], [54.290, 31.480], [54.290, 31.500], [54.270, 31.500], [54.270, 31.480]]]
            }
          }
        ]
      })
    }
  ];

  // لود اولیه پکیج پیش‌فرض اول در شروع
  useEffect(() => {
    if (PRESET_SURVEY_PACKAGES.length > 0 && !rawFileContent) {
      loadPackage(PRESET_SURVEY_PACKAGES[0]);
    }
  }, []);

  // بارگذاری یک پکیج پیش‌فرض
  const loadPackage = (pkg: typeof PRESET_SURVEY_PACKAGES[0]) => {
    setMapTitle(pkg.title);
    setMapCategory(pkg.category);
    setFileFormat(pkg.format);
    setBenchLevel(pkg.benchLevel);
    setRawFileContent(pkg.rawGeoJson);
    setFileName(`${pkg.id}.${pkg.format === 'DXF_JSON' ? 'dxf' : 'geojson'}`);
    parseContent(pkg.rawGeoJson, pkg.format, pkg.title, pkg.benchLevel);
  };

  // آپلود فایل محلی
  const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    setFileName(file.name);
    const cleanName = file.name.replace(/\.[^/.]+$/, "");
    setMapTitle(`نقشه ورودی: ${cleanName}`);

    // تشخیص فرمت
    let detectedFormat: MapFormat = 'GEOJSON';
    if (file.name.endsWith('.dxf')) detectedFormat = 'DXF_JSON';
    else if (file.name.endsWith('.kml')) detectedFormat = 'KML';
    else if (file.name.endsWith('.csv')) detectedFormat = 'CSV_POINTS';
    setFileFormat(detectedFormat);

    const reader = new FileReader();
    reader.onload = (evt) => {
      const content = evt.target?.result as string;
      setRawFileContent(content);
      parseContent(content, detectedFormat, `نقشه ورودی: ${cleanName}`, benchLevel);
    };
    reader.readAsText(file);
  };

  // پارس محتوا و تبدیل به Feature و Layer
  const parseContent = (content: string, format: MapFormat, title: string, level: number) => {
    try {
      let features: MapFeature[] = [];
      const layerSet = new Map<string, { count: number; category: FeatureCategory; color: string }>();

      if (format === 'GEOJSON' || content.trim().startsWith('{')) {
        const geoData = JSON.parse(content);
        const rawFeatures = geoData.features || (geoData.type === 'Feature' ? [geoData] : []);

        const extractedFeatures: MapFeature[] = [];

        rawFeatures.forEach((f: any, idx: number) => {
          const geom = f.geometry || (f.type ? f : {});
          const props = f.properties || {};
          const gType = geom.type || 'Polygon';

          const addFeature = (coords: number[][], type: MapFeature['type'], subIdx: number = 0) => {
            if (!coords || coords.length === 0) return;

            let category: FeatureCategory = 'SUB_BLOCK';
            const rawLayerName = props.layer || props.Layer || (type === 'POLYGON' ? 'SUB_BLOCKS' : type === 'POLYLINE' ? 'BENCH_LINES' : 'POINTS');
            const upperLayer = String(rawLayerName).toUpperCase();

            if (type === 'POLYGON') {
              category = upperLayer.includes('BLAST') ? 'BLAST_BOUNDARY' : 
                         upperLayer.includes('STOCKPILE') ? 'STOCKPILE_BOUNDARY' : 'SUB_BLOCK';
            } else if (type === 'POLYLINE') {
              category = upperLayer.includes('CREST') ? 'BENCH_CREST' : 
                         upperLayer.includes('TOE') ? 'BENCH_TOE' : 'HAUL_ROAD';
            } else if (type === 'POINT') {
              category = upperLayer.includes('HOLE') ? 'BLAST_HOLE' : 'SURVEY_BENCHMARK';
            }

            // ثبت لایه
            if (!layerSet.has(rawLayerName)) {
              let color = '#00D4FF';
              if (category === 'SUB_BLOCK') color = '#10B981';
              else if (category === 'BLAST_HOLE' || category === 'BLAST_BOUNDARY') color = '#F59E0B';
              else if (category === 'BENCH_CREST' || category === 'BENCH_TOE') color = '#A78BFA';
              else if (category === 'HAUL_ROAD') color = '#3B82F6';
              else if (category === 'SURVEY_BENCHMARK') color = '#EC4899';
              else if (category === 'STOCKPILE_BOUNDARY') color = '#14B8A6';
              
              layerSet.set(rawLayerName, { count: 0, category, color });
            }
            layerSet.get(rawLayerName)!.count += 1;

            const lInfo = layerSet.get(rawLayerName)!;
            const strokeColor = props.strokeColor || props.stroke || lInfo.color;
            const fillColor = props.fillColor || props.fill || `${lInfo.color}25`;

            extractedFeatures.push({
              id: `feat-${idx + 1}-${subIdx}-${Date.now()}`,
              mapId: '',
              layerId: `layer-${rawLayerName}`,
              name: props.name || props.code || props.id || `عنصر ${idx + 1}${subIdx > 0 ? `-${subIdx + 1}` : ''}`,
              type,
              category,
              coordinates: coords,
              elevation: Number(props.elevation || props.z || level),
              properties: {
                code: props.code || props.name,
                subBlockId: props.subBlockId,
                rockType: props.rockType || 'مگنتیت متراکم',
                oreType: props.oreType || 'کانسنگ اصلی',
                feGrade: Number(props.feGrade || props.fe || (category === 'SUB_BLOCK' ? 58.5 : 0)),
                feoGrade: Number(props.feoGrade || 18.5),
                sio2Grade: Number(props.sio2Grade || 5.2),
                density: Number(props.density || 3.0),
                destination: props.destination || 'CRUSHER_LINE_1',
                status: props.status || 'APPROVED',
                holeDiameterMm: props.holeDiameterMm,
                depthM: props.depthM,
                burdenM: props.burdenM,
                spacingM: props.spacingM,
                areaM2: type === 'POLYGON' ? 2500 : undefined,
                volumeM3: type === 'POLYGON' ? (2500 * benchHeight) : undefined,
                tonnage: type === 'POLYGON' ? (2500 * benchHeight * (props.density || 3.0)) : undefined
              },
              style: {
                strokeColor,
                fillColor,
                strokeWidth: 1.2,
                fillOpacity: type === 'POLYGON' ? 0.18 : 1,
                pointRadius: 3.5
              },
              createdBy: userName,
              createdRole: activeRole,
              createdAt: new Date().toISOString()
            });
          };

          if (gType === 'Polygon') {
            const ring = (geom.coordinates as number[][][])?.[0] || [];
            const coords = ring.map((pt: any) => [Number(pt[0]), Number(pt[1])]);
            addFeature(coords, 'POLYGON');
          } else if (gType === 'MultiPolygon') {
            const polygons = (geom.coordinates as number[][][][]) || [];
            polygons.forEach((poly, pIdx) => {
              const ring = poly[0] || [];
              const coords = ring.map((pt: any) => [Number(pt[0]), Number(pt[1])]);
              addFeature(coords, 'POLYGON', pIdx);
            });
          } else if (gType === 'LineString') {
            const line = (geom.coordinates as number[][]) || [];
            const coords = line.map((pt: any) => [Number(pt[0]), Number(pt[1])]);
            addFeature(coords, 'POLYLINE');
          } else if (gType === 'MultiLineString') {
            const lines = (geom.coordinates as number[][][]) || [];
            lines.forEach((line, lIdx) => {
              const coords = line.map((pt: any) => [Number(pt[0]), Number(pt[1])]);
              addFeature(coords, 'POLYLINE', lIdx);
            });
          } else if (gType === 'Point') {
            const pt = geom.coordinates || [0, 0];
            const coords = [[Number(pt[0]), Number(pt[1])]];
            addFeature(coords, 'POINT');
          } else if (gType === 'MultiPoint') {
            const points = (geom.coordinates as number[][]) || [];
            points.forEach((pt, ptIdx) => {
              const coords = [[Number(pt[0]), Number(pt[1])]];
              addFeature(coords, 'POINT', ptIdx);
            });
          }
        });

        features = extractedFeatures;
      } else if (format === 'CSV_POINTS' || content.includes(',')) {
        // پارس فایل CSV نقاط حفاری و نمونه‌ها
        const lines = content.split('\n').filter(l => l.trim().length > 0);
        const headers = lines[0].split(',').map(h => h.trim().toLowerCase());
        
        features = lines.slice(1).map((line, idx) => {
          const parts = line.split(',').map(p => p.trim());
          const x = Number(parts[1] || parts[0]);
          const y = Number(parts[2] || parts[1]);
          const z = Number(parts[3] || level);
          const fe = Number(parts[4] || 56.0);
          
          const rawLayerName = 'CSV_SAMPLE_POINTS';
          if (!layerSet.has(rawLayerName)) {
            layerSet.set(rawLayerName, { count: 0, category: 'BLAST_HOLE', color: '#F59E0B' });
          }
          layerSet.get(rawLayerName)!.count += 1;

          return {
            id: `feat-csv-${idx + 1}`,
            mapId: '',
            layerId: `layer-${rawLayerName}`,
            name: parts[0] || `نقطه #${idx + 1}`,
            type: 'POINT',
            category: 'BLAST_HOLE',
            coordinates: [[x, y]],
            elevation: z,
            properties: {
              code: parts[0],
              feGrade: fe,
              depthM: 12.5,
              holeDiameterMm: 76
            },
            style: {
              strokeColor: '#F59E0B',
              fillColor: '#F59E0B',
              strokeWidth: 2,
              pointRadius: 5
            },
            createdBy: userName,
            createdRole: activeRole,
            createdAt: new Date().toISOString()
          };
        });
      }

      // تولید لایه‌ها و نگاشت متادیتاها
      const layers: MapLayer[] = [];
      const initialMappings: Record<string, LayerMetadataMapping> = {};

      layerSet.forEach((val, key) => {
        layers.push({
          id: `layer-${key}`,
          mapId: '',
          name: key === 'SUB_BLOCKS' ? 'ساب‌بلوک‌های استخراجی پله' : 
                key === 'BENCH_CREST' ? 'خطوط بالای پله (Crest)' :
                key === 'BENCH_TOE' ? 'خطوط پای پله (Toe)' :
                key === 'BLAST_HOLES' ? 'شبکه چال‌های حفاری و انفجار' :
                key === 'HAUL_ROADS' ? 'شبکه رمپ‌ها و جاده‌های حمل' :
                key === 'STOCKPILES' ? 'محدوده دپوها و سنگ‌شکن' : key,
          category: val.category,
          color: val.color,
          isVisible: true,
          isLocked: false,
          opacity: 0.85,
          featureCount: val.count
        });

        // تنظیم پیش‌فرض نگاشت متادیتا
        initialMappings[key] = {
          layerName: key,
          category: val.category,
          targetEntity: val.category === 'SUB_BLOCK' ? 'SUB_BLOCK' : 
                        val.category === 'BLAST_HOLE' ? 'BLAST_PATTERN' :
                        val.category === 'BENCH_CREST' || val.category === 'BENCH_TOE' ? 'CREST_TOE' :
                        val.category === 'HAUL_ROAD' ? 'HAUL_ROAD' : 'GENERAL',
          blockId: blocks[0]?.id || 'block-1040-b32',
          blockCode: blocks[0]?.code || '1040 B 32',
          autoCreateSubBlocks: val.category === 'SUB_BLOCK',
          defaultRockType: 'مگنتیت خالص متراکم',
          defaultOreType: 'کانسنگ مگنتیتی اصلی',
          defaultFeGrade: 58.5,
          defaultFeO: 19.0,
          defaultSiO2: 5.5,
          defaultDensity: 3.10,
          defaultDestination: 'CRUSHER_LINE_1',
          color: val.color,
          detectedCount: val.count
        };
      });

      setParsedFeatures(features);
      setParsedLayers(layers);
      setLayerMappings(initialMappings);

    } catch (err) {
      console.error('Error parsing survey file:', err);
    }
  };

  // محاسبه حدود مختصات برای بوم پیش‌نمایش برداری
  const bounds = useMemo(() => {
    if (parsedFeatures.length === 0) {
      return { minX: 54.30, maxX: 54.38, minY: 31.50, maxY: 31.58 };
    }
    let minX = Infinity, maxX = -Infinity, minY = Infinity, maxY = -Infinity;
    parsedFeatures.forEach(f => {
      f.coordinates?.forEach(([x, y]) => {
        if (x < minX) minX = x;
        if (x > maxX) maxX = x;
        if (y < minY) minY = y;
        if (y > maxY) maxY = y;
      });
    });
    const padX = (maxX - minX) * 0.1 || 0.01;
    const padY = (maxY - minY) * 0.1 || 0.01;
    return {
      minX: minX - padX,
      maxX: maxX + padX,
      minY: minY - padY,
      maxY: maxY + padY
    };
  }, [parsedFeatures]);

  // تبدیل مختصات به مختصات صفحه SVG با مقیاس ایزوتروپیک بدون کشیدگی
  const projectToSvg = (x: number, y: number, width: number, height: number) => {
    const pad = 40;
    const availW = Math.max(10, width - 2 * pad);
    const availH = Math.max(10, height - 2 * pad);
    const dx = Math.max(1, bounds.maxX - bounds.minX);
    const dy = Math.max(1, bounds.maxY - bounds.minY);
    const scale = Math.min(availW / dx, availH / dy);
    const drawnW = dx * scale;
    const drawnH = dy * scale;
    const offX = pad + (availW - drawnW) / 2;
    const offY = pad + (availH - drawnH) / 2;

    return {
      svgX: offX + (x - bounds.minX) * scale,
      svgY: offY + (bounds.maxY - y) * scale // معکوس جهت Y در نقشه
    };
  };

  // محاسبات آمار کل متادیتاهای متصل شده
  const metadataSummary = useMemo(() => {
    const subBlockFeatures = parsedFeatures.filter(f => f.category === 'SUB_BLOCK');
    const blastHoleFeatures = parsedFeatures.filter(f => f.category === 'BLAST_HOLE');
    const crestToeFeatures = parsedFeatures.filter(f => f.category === 'BENCH_CREST' || f.category === 'BENCH_TOE');
    
    let totalEstTonnage = 0;
    let weightedFeSum = 0;

    subBlockFeatures.forEach(sb => {
      const area = sb.properties.areaM2 || 2500;
      const density = sb.properties.density || 3.0;
      const tonnage = area * benchHeight * density;
      const fe = sb.properties.feGrade || 58.5;
      totalEstTonnage += tonnage;
      weightedFeSum += tonnage * fe;
    });

    const avgFe = totalEstTonnage > 0 ? (weightedFeSum / totalEstTonnage).toFixed(1) : '58.5';

    return {
      subBlocksCount: subBlockFeatures.length,
      blastHolesCount: blastHoleFeatures.length,
      crestToeCount: crestToeFeatures.length,
      totalFeatures: parsedFeatures.length,
      totalEstTonnage: Math.round(totalEstTonnage),
      avgFe
    };
  }, [parsedFeatures, benchHeight]);

  // ثبت و اعمال در دیتابیس سامانه
  const handleCommitToDatabase = () => {
    setIsProcessing(true);

    try {
      // ۱. ساخت و ذخیره رکورد نقشه در SurveyMapRepository
      const mapId = `map-${Date.now()}`;
      const newMap: SurveyMap = {
        id: mapId,
        code: `MAP-${benchLevel}-${Date.now().toString().slice(-4)}`,
        title: mapTitle,
        description: `نقشه وارد شده توسط ${surveyorUnit} (${surveyorEngineer}) با تجهیز ${surveyEquipment} - کد کالیبراسیون: ${calibrationCode}`,
        category: mapCategory,
        format: fileFormat,
        surveyDate: surveyDate,
        surveyorUnit,
        surveyorName: surveyorEngineer,
        benchLevel,
        pitId: selectedPitId,
        coordinateSystem,
        bounds,
        version: revisionVersion,
        status: approvalStatus,
        layers: parsedLayers.map(l => ({ ...l, mapId })),
        features: parsedFeatures.map(f => ({ ...f, mapId })),
        approvedBy: approvalStatus === 'APPROVED_OFFICIAL' ? userName : undefined,
        approvedDate: approvalStatus === 'APPROVED_OFFICIAL' ? new Date().toISOString() : undefined,
        revisionHistory: [
          {
            id: `rev-${Date.now()}`,
            revision: revisionVersion,
            action: 'IMPORT',
            description: `ورود نقشه مهندسی و اتصال هوشمند به متادیتاهای پیت ${selectedPitId} و تراز ${benchLevel}m توسط ${userName} (${activeRole})`,
            performedBy: userName,
            performedRole: activeRole,
            timestamp: new Date().toISOString()
          }
        ],
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString()
      };

      SurveyMapRepository.save(newMap);
      // واحد نقشه‌برداری مرجع اصلی بارگذاری نقشه در سامانه است:
      // انتشار بلادرنگ به عنوان آخرین نقشه رسمی و مرجع فعال کل سامانه
      SurveyMapService.setActiveMasterMap(newMap.id, activeRole, userName);

      // ۲. در صورت انتخاب، ایجاد یا به‌روزرسانی ساب‌بلوک‌ها در SubBlockRepository
      let subBlocksCreatedCount = 0;
      if (autoSyncSubBlocksToDb) {
        const subBlockFeatures = parsedFeatures.filter(f => f.category === 'SUB_BLOCK');
        const existingSubBlocks = SubBlockRepository.getAll();

        subBlockFeatures.forEach((feat, idx) => {
          const subCode = feat.properties.code || `${blocks[0]?.code || '1040 B 32'} – S${String.fromCharCode(65 + idx)}`;
          const existing = existingSubBlocks.find(sb => sb.code === subCode || sb.id === feat.properties.subBlockId);
          
          const area = feat.properties.areaM2 || 2500;
          const density = feat.properties.density || 3.1;
          const tonnage = area * benchHeight * density;
          const fe = feat.properties.feGrade || 58.5;
          const feo = feat.properties.feoGrade || 19.0;
          const sio2 = feat.properties.sio2Grade || 5.2;

          const newSubBlock: SubBlock = {
            id: feat.properties.subBlockId || `sb-${benchLevel}-${idx + 1}-${Date.now().toString().slice(-4)}`,
            blockId: selectedBlockId,
            code: subCode,
            sequence: idx + 1,
            benchLevel,
            status: 'DESTINATION_APPROVED',
            tonnage,
            estimatedTonnage: tonnage,
            materialClass: fe >= 60 ? 'سنگ‌آهن مگنتیت پرعیار ممتاز (High-Grade DSO)' : fe >= 50 ? 'سنگ‌آهن متوسط‌عیار' : 'باطله سنگی',
            rockType: feat.properties.rockType || 'مگنتیت خالص متراکم',
            oreType: feat.properties.oreType || 'کانسنگ مگنتیتی',
            gradeCategory: fe >= 60 ? 'HIGH' : fe >= 50 ? 'MEDIUM' : 'WASTE',
            destination: (feat.properties.destination || 'CRUSHER_LINE_1') as any,
            destinationReason: `تخصیص بر اساس عیار وارد شده از نقشه مهندسی: Fe: ${fe}%`,
            destinationApprovedBy: `${userName} (${activeRole})`,
            destinationApprovedAt: new Date().toISOString(),
            labResults: {
              fe,
              feo,
              sio2,
              al2o3: 1.5,
              p: 0.05,
              s: 0.08,
              cao: 1.8,
              mgo: 1.1,
              moisture: 2.5,
              density,
              assay: fe,
              labName: 'آزمایشگاه کنترل عیار و ژئولوژی مجتمع',
              batchNumber: `GEO-${Date.now().toString().slice(-4)}`,
              analyzedAt: new Date().toISOString(),
              isVerified: true
            },
            statusHistory: [
              {
                status: 'DEFINED',
                changedAt: new Date().toISOString(),
                changedBy: userName,
                note: `ایجاد و اتصال ساب‌بلوک از نقشه مهندسی ${mapTitle}`
              }
            ],
            createdBy: userName,
            createdAt: new Date().toISOString(),
            updatedAt: new Date().toISOString()
          };

          SubBlockRepository.save(newSubBlock);
          subBlocksCreatedCount++;
        });
      }

      // ۳. ثبت لاگ ممیزی
      AuditLogRepository.save({
        id: `audit-${Date.now()}`,
        action: 'MAP_SURVEY_IMPORTED',
        category: 'SURVEY_GIS',
        description: `نقشه مهندسی "${mapTitle}" با ${parsedFeatures.length} المان و اتصال به پیت ${selectedPitId} با موفقیت در دیتابیس ثبت گردید.`,
        performedBy: userName,
        performedRole: activeRole,
        timestamp: new Date().toISOString(),
        metadata: {
          mapId: newMap.id,
          subBlocksCount: subBlocksCreatedCount,
          benchLevel
        }
      } as any);

      setImportSuccessResult({
        map: newMap,
        subBlocksCreated: subBlocksCreatedCount,
        pointsLinked: parsedFeatures.filter(f => f.category === 'BLAST_HOLE').length
      });

      if (onMapImported) {
        onMapImported(newMap);
      }

    } catch (err) {
      console.error('Error committing map to DB:', err);
    } finally {
      setIsProcessing(false);
    }
  };

  return (
    <div className={`flex flex-col h-full ${isStandalonePage ? 'p-4 sm:p-6 max-w-7xl mx-auto' : 'p-6 bg-slate-900 border border-slate-700 rounded-3xl text-white shadow-2xl space-y-6'}`} dir="rtl">
      
      {/* هدر کامپوننت */}
      <div className="flex items-center justify-between border-b border-slate-800 pb-4">
        <div className="flex items-center gap-3">
          <span className="p-3 rounded-2xl bg-cyan-500/20 text-cyan-400 border border-cyan-500/30">
            <DocumentArrowUpIcon className="w-7 h-7" />
          </span>
          <div>
            <h2 className="text-xl font-black text-white flex items-center gap-2">
              <span>سامانه واردسازی نقشه‌های مهندسی و اتصال هوشمند به متادیتا</span>
              <span className="text-xs px-2.5 py-0.5 rounded-full font-bold bg-cyan-500/20 text-cyan-400 border border-cyan-500/30">
                AutoCAD DXF • GeoJSON • CSV Points
              </span>
            </h2>
            <p className="text-xs text-slate-400">
              تبدیل فایل‌های برداشت زمینی و فتوگرامتری پهپاد به المان‌های برداری و اتصال مستقیم به پیت، تراز، بلوک‌ها، ساب‌بلوک‌ها و دپوها
            </p>
          </div>
        </div>

        {onClose && (
          <button
            onClick={onClose}
            className="p-2 rounded-xl bg-slate-800 text-slate-400 hover:text-white hover:bg-slate-700 transition-colors"
          >
            <XMarkIcon className="w-6 h-6" />
          </button>
        )}
      </div>

      {/* نوار مراحل (Stepper) */}
      <div className="grid grid-cols-4 gap-2 bg-slate-950/80 p-1.5 rounded-2xl border border-slate-800 text-xs">
        <button
          onClick={() => setCurrentStep(1)}
          className={`flex items-center justify-center gap-2 py-2.5 px-3 rounded-xl font-bold transition-all ${
            currentStep === 1 
              ? 'bg-cyan-500 text-slate-950 shadow-md shadow-cyan-500/20' 
              : 'text-slate-400 hover:text-white'
          }`}
        >
          <span className="w-5 h-5 rounded-full bg-slate-900/30 flex items-center justify-center text-[11px] font-black">۱</span>
          <span>انتخاب فایل و پکیج</span>
        </button>

        <button
          onClick={() => setCurrentStep(2)}
          className={`flex items-center justify-center gap-2 py-2.5 px-3 rounded-xl font-bold transition-all ${
            currentStep === 2 
              ? 'bg-cyan-500 text-slate-950 shadow-md shadow-cyan-500/20' 
              : 'text-slate-400 hover:text-white'
          }`}
        >
          <span className="w-5 h-5 rounded-full bg-slate-900/30 flex items-center justify-center text-[11px] font-black">۲</span>
          <span>پیش‌نمایش هندسه و لایه‌ها</span>
        </button>

        <button
          onClick={() => setCurrentStep(3)}
          className={`flex items-center justify-center gap-2 py-2.5 px-3 rounded-xl font-bold transition-all ${
            currentStep === 3 
              ? 'bg-cyan-500 text-slate-950 shadow-md shadow-cyan-500/20' 
              : 'text-slate-400 hover:text-white'
          }`}
        >
          <span className="w-5 h-5 rounded-full bg-slate-900/30 flex items-center justify-center text-[11px] font-black">۳</span>
          <span>اتصال به دیتابیس و متادیتا</span>
        </button>

        <button
          onClick={() => setCurrentStep(4)}
          className={`flex items-center justify-center gap-2 py-2.5 px-3 rounded-xl font-bold transition-all ${
            currentStep === 4 
              ? 'bg-cyan-500 text-slate-950 shadow-md shadow-cyan-500/20' 
              : 'text-slate-400 hover:text-white'
          }`}
        >
          <span className="w-5 h-5 rounded-full bg-slate-900/30 flex items-center justify-center text-[11px] font-black">۴</span>
          <span>اعتبارسنجی و ثبت رسمی</span>
        </button>
      </div>

      {/* محتوای مراحل مختلف */}
      <div className="flex-1 overflow-y-auto min-h-[420px]">
        
        {/* ===================== مرحله ۱: بارگذاری فایل / انتخاب پکیج ===================== */}
        {currentStep === 1 && (
          <div className="space-y-6">
            {/* انتخاب نحوه ورود */}
            <div className="flex p-1 bg-slate-950 rounded-2xl border border-slate-800 text-xs">
              <button
                onClick={() => setInputMode('PRESET_PACKAGE')}
                className={`flex-1 py-2.5 rounded-xl font-bold transition-all flex items-center justify-center gap-2 ${
                  inputMode === 'PRESET_PACKAGE'
                    ? 'bg-cyan-500 text-slate-950 shadow-md'
                    : 'text-slate-400 hover:text-white'
                }`}
              >
                <SparklesIcon className="w-4 h-4" />
                <span>بسته‌های آماده و تست‌شده نقشه‌برداری معدن (۱-کلیک)</span>
              </button>
              <button
                onClick={() => setInputMode('FILE_UPLOAD')}
                className={`flex-1 py-2.5 rounded-xl font-bold transition-all flex items-center justify-center gap-2 ${
                  inputMode === 'FILE_UPLOAD'
                    ? 'bg-cyan-500 text-slate-950 shadow-md'
                    : 'text-slate-400 hover:text-white'
                }`}
              >
                <ArrowUpTrayIcon className="w-4 h-4" />
                <span>بارگذاری فایل اختصاصی (AutoCAD DXF / GeoJSON / CSV / KML)</span>
              </button>
            </div>

            {inputMode === 'PRESET_PACKAGE' ? (
              <div className="space-y-4">
                <p className="text-xs text-slate-400">
                  جهت راه‌اندازی سریع یا تست انطباق نقشه‌ها با مدل‌های دیتابیس، می‌توانید یکی از بسته‌های مهندسی استاندارد زیر را انتخاب کنید:
                </p>
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                  {PRESET_SURVEY_PACKAGES.map((pkg) => (
                    <div
                      key={pkg.id}
                      onClick={() => loadPackage(pkg)}
                      className={`p-4 rounded-2xl border cursor-pointer transition-all space-y-3 relative group ${
                        mapTitle === pkg.title
                          ? 'bg-cyan-950/40 border-cyan-400 ring-2 ring-cyan-500/20'
                          : 'bg-slate-950/60 border-slate-800 hover:border-cyan-500/40 hover:bg-slate-950'
                      }`}
                    >
                      <div className="flex items-center justify-between">
                        <span className="text-[11px] font-mono px-2 py-0.5 rounded-lg bg-cyan-500/20 text-cyan-400 font-bold">
                          تراز {pkg.benchLevel}m
                        </span>
                        <span className="text-[10px] px-2 py-0.5 rounded-lg bg-purple-500/20 text-purple-300 font-bold">
                          {pkg.format}
                        </span>
                      </div>
                      <h4 className="font-black text-sm text-white group-hover:text-cyan-300 transition-colors">
                        {pkg.title}
                      </h4>
                      <p className="text-xs text-slate-400 line-clamp-2 leading-relaxed">
                        {pkg.description}
                      </p>
                      <div className="pt-2 border-t border-slate-800/80 flex items-center justify-between text-xs">
                        <span className="text-slate-500">پیت مرکزی معدن</span>
                        <span className="font-bold text-cyan-400 flex items-center gap-1">
                          انتخاب و بارگذاری ↵
                        </span>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            ) : (
              <div className="space-y-4">
                {/* باکس درگ اند دراپ */}
                <div className="p-8 rounded-3xl bg-slate-950 border-2 border-dashed border-slate-700 hover:border-cyan-400 transition-colors text-center space-y-3 relative cursor-pointer group">
                  <input
                    type="file"
                    accept=".geojson,.json,.dxf,.kml,.csv,.txt"
                    onChange={handleFileUpload}
                    className="absolute inset-0 opacity-0 cursor-pointer w-full h-full"
                  />
                  <div className="w-14 h-14 mx-auto rounded-2xl bg-cyan-500/10 text-cyan-400 flex items-center justify-center group-hover:scale-110 transition-transform">
                    <ArrowUpTrayIcon className="w-8 h-8" />
                  </div>
                  <div>
                    <h4 className="font-black text-sm text-white">
                      {fileName ? fileName : 'فایل نقشه‌برداری را به اینجا بکشید یا برای انتخاب فایل کلیک کنید'}
                    </h4>
                    <p className="text-xs text-slate-400 mt-1">
                      پشتیبانی کامل از فایل‌های AutoCAD (.dxf)، ژئودزی GeoJSON (.geojson)، نقاط نمونه‌برداری (.csv) و مسیرها (.kml)
                    </p>
                  </div>
                </div>
              </div>
            )}

            {/* مشخصات اصلی نقشه و نقشه‌برداری */}
            <div className="p-5 rounded-2xl bg-slate-950/70 border border-slate-800 space-y-4">
              <h4 className="font-bold text-xs text-cyan-400 flex items-center gap-2">
                <TagIcon className="w-4 h-4" />
                <span>مشخصات فنی نقشه و مرجع مکانی</span>
              </h4>

              <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-4 text-xs">
                <div>
                  <label className="block text-slate-300 mb-1 font-semibold">عنوان نقشه:</label>
                  <input
                    type="text"
                    value={mapTitle}
                    onChange={(e) => setMapTitle(e.target.value)}
                    className="w-full px-3 py-2 rounded-xl bg-slate-900 border border-slate-700 text-white focus:border-cyan-400"
                  />
                </div>

                <div>
                  <label className="block text-slate-300 mb-1 font-semibold">دسته‌بندی نقشه:</label>
                  <select
                    value={mapCategory}
                    onChange={(e) => setMapCategory(e.target.value as MapCategory)}
                    className="w-full px-3 py-2 rounded-xl bg-slate-900 border border-slate-700 text-white"
                  >
                    <option value="BENCH_PLAN">پلان و تراز استخراجی پله</option>
                    <option value="TOPOGRAPHY">نقشه توپوگرافی و منحنی میزان</option>
                    <option value="BLAST_PATTERN">نقشه الگوی چال‌پاشی و آتشباری</option>
                    <option value="ORTHOMOSAIC_DRONE">تصویر ارتوفتوی هوایی پهپاد</option>
                    <option value="GEOLOGY_BLOCK_MODEL">مدل بلوکی و زون‌بندی زمین‌شناسی</option>
                    <option value="HAUL_ROAD_NETWORK">شبکه راه‌ها، رمپ‌ها و دپوها</option>
                  </select>
                </div>

                <div>
                  <label className="block text-slate-300 mb-1 font-semibold">تراز پله طراحی (Bench Level):</label>
                  <input
                    type="number"
                    value={benchLevel}
                    onChange={(e) => setBenchLevel(Number(e.target.value))}
                    className="w-full px-3 py-2 rounded-xl bg-slate-900 border border-slate-700 text-white font-mono"
                  />
                </div>

                <div>
                  <label className="block text-slate-300 mb-1 font-semibold">ارتفاع پله استخراجی (متر):</label>
                  <input
                    type="number"
                    value={benchHeight}
                    onChange={(e) => setBenchHeight(Number(e.target.value))}
                    className="w-full px-3 py-2 rounded-xl bg-slate-900 border border-slate-700 text-white font-mono"
                  />
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 text-xs pt-2">
                <div>
                  <label className="block text-slate-300 mb-1 font-semibold">سیستم تصویر و مختصات:</label>
                  <select
                    value={coordinateSystem}
                    onChange={(e) => setCoordinateSystem(e.target.value)}
                    className="w-full px-3 py-2 rounded-xl bg-slate-900 border border-slate-700 text-white"
                  >
                    <option value="UTM Zone 39N (WGS84)">UTM Zone 39N (WGS84) - مرکز و شرق ایران</option>
                    <option value="UTM Zone 40N (WGS84)">UTM Zone 40N (WGS84) - شرق ایران</option>
                    <option value="Local Mining Grid">شبکه محلی مهندسی معدن (Local Mine Grid)</option>
                  </select>
                </div>

                <div>
                  <label className="block text-slate-300 mb-1 font-semibold">واحد نقشه‌برداری / مهندسی مشاور:</label>
                  <input
                    type="text"
                    value={surveyorUnit}
                    onChange={(e) => setSurveyorUnit(e.target.value)}
                    className="w-full px-3 py-2 rounded-xl bg-slate-900 border border-slate-700 text-white"
                  />
                </div>

                <div>
                  <label className="block text-slate-300 mb-1 font-semibold">مهندس نقشه‌بردار مسئول:</label>
                  <input
                    type="text"
                    value={surveyorEngineer}
                    onChange={(e) => setSurveyorEngineer(e.target.value)}
                    className="w-full px-3 py-2 rounded-xl bg-slate-900 border border-slate-700 text-white"
                  />
                </div>
              </div>
            </div>
          </div>
        )}

        {/* ===================== مرحله ۲: پیش‌نمایش برداری هندسه و لایه‌ها ===================== */}
        {currentStep === 2 && (
          <div className="space-y-5">
            <div className="flex items-center justify-between">
              <div>
                <h3 className="font-bold text-sm text-white flex items-center gap-2">
                  <EyeIcon className="w-5 h-5 text-cyan-400" />
                  <span>پیش‌نمایش تعاملی هندسه و المان‌های استخراج شده</span>
                </h3>
                <p className="text-xs text-slate-400">
                  تعداد {parsedFeatures.length} المان برداری در قالب {parsedLayers.length} لایه مهندسی شناسایی شد.
                </p>
              </div>

              <div className="flex items-center gap-2 text-xs">
                <span className="text-slate-400">بزرگنمایی:</span>
                <button
                  onClick={() => setPreviewZoom(prev => Math.max(0.5, prev - 0.2))}
                  className="px-2.5 py-1 rounded-lg bg-slate-800 text-white hover:bg-slate-700 font-mono"
                >
                  -
                </button>
                <span className="font-mono text-cyan-400 font-bold">{Math.round(previewZoom * 100)}%</span>
                <button
                  onClick={() => setPreviewZoom(prev => Math.min(2.5, prev + 0.2))}
                  className="px-2.5 py-1 rounded-lg bg-slate-800 text-white hover:bg-slate-700 font-mono"
                >
                  +
                </button>
              </div>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
              {/* بوم پیش‌نمایش وکتور بر مبنای SVG */}
              <div className="lg:col-span-2 bg-slate-950 rounded-2xl border border-slate-800 p-4 relative min-h-[360px] flex items-center justify-center overflow-hidden">
                <svg 
                  className="w-full h-80 rounded-xl bg-[#070F1E] border border-slate-800/80 cursor-crosshair"
                  viewBox="0 0 600 320"
                >
                  {/* شبکه شطرنجی پس‌زمینه */}
                  <defs>
                    <pattern id="grid-pattern" width="40" height="40" patternUnits="userSpaceOnUse">
                      <path d="M 40 0 L 0 0 0 40" fill="none" stroke="#1E293B" strokeWidth="0.8" strokeDasharray="2,2" />
                    </pattern>
                  </defs>
                  <rect width="600" height="320" fill="url(#grid-pattern)" />

                  {/* ترسیم تمام فیچرهای استخراج شده */}
                  {parsedFeatures.map((feature) => {
                    const isSelected = selectedPreviewFeatureId === feature.id;

                    if (feature.type === 'POLYGON') {
                      const pts = feature.coordinates.map(([x, y]) => {
                        const { svgX, svgY } = projectToSvg(x, y, 600, 320);
                        return `${svgX},${svgY}`;
                      }).join(' ');

                      const firstPt = projectToSvg(feature.coordinates[0][0], feature.coordinates[0][1], 600, 320);

                      return (
                        <g 
                          key={feature.id} 
                          onClick={() => setSelectedPreviewFeatureId(feature.id)}
                          className="cursor-pointer group"
                        >
                          <polygon
                            points={pts}
                            fill={feature.style.fillColor || `${feature.style.strokeColor}22`}
                            fillOpacity={isSelected ? 0.4 : 0.18}
                            stroke={isSelected ? '#00D4FF' : (feature.style.strokeColor || '#10B981')}
                            strokeWidth={isSelected ? 2 : 1.2}
                            vectorEffect="non-scaling-stroke"
                            className="transition-all hover:fill-opacity-40"
                          />
                          {(parsedFeatures.length <= 15 || isSelected) && (
                            <text
                              x={firstPt.svgX + 4}
                              y={firstPt.svgY - 4}
                              fill="#FFFFFF"
                              fontSize="9"
                              fontWeight="600"
                              className="pointer-events-none drop-shadow select-none"
                            >
                              {feature.name}
                            </text>
                          )}
                        </g>
                      );
                    }

                    if (feature.type === 'POLYLINE') {
                      const pts = feature.coordinates.map(([x, y]) => {
                        const { svgX, svgY } = projectToSvg(x, y, 600, 320);
                        return `${svgX},${svgY}`;
                      }).join(' ');

                      return (
                        <polyline
                          key={feature.id}
                          points={pts}
                          fill="none"
                          stroke={isSelected ? '#00D4FF' : (feature.style.strokeColor || '#38BDF8')}
                          strokeWidth={isSelected ? 2.5 : 1.2}
                          vectorEffect="non-scaling-stroke"
                          strokeDasharray={feature.category === 'BENCH_TOE' ? '4,4' : undefined}
                          onClick={() => setSelectedPreviewFeatureId(feature.id)}
                          className="cursor-pointer hover:stroke-white transition-colors"
                        />
                      );
                    }

                    if (feature.type === 'POINT') {
                      const [x, y] = feature.coordinates[0] || [0, 0];
                      const { svgX, svgY } = projectToSvg(x, y, 600, 320);

                      return (
                        <g 
                          key={feature.id} 
                          onClick={() => setSelectedPreviewFeatureId(feature.id)}
                          className="cursor-pointer"
                        >
                          <circle
                            cx={svgX}
                            cy={svgY}
                            r={isSelected ? 5 : 3}
                            fill={feature.style.fillColor || feature.style.strokeColor || '#F59E0B'}
                            stroke="#0F172A"
                            strokeWidth="1"
                            vectorEffect="non-scaling-stroke"
                          />
                        </g>
                      );
                    }

                    return null;
                  })}
                </svg>

                {/* مختصات مبنا */}
                <div className="absolute bottom-6 right-6 text-[10px] font-mono px-2 py-1 rounded bg-slate-900/90 text-cyan-400 border border-slate-700">
                  X: {bounds.minX.toFixed(3)} → {bounds.maxX.toFixed(3)} | Y: {bounds.minY.toFixed(3)} → {bounds.maxY.toFixed(3)}
                </div>
              </div>

              {/* لیست لایه‌ها و خلاصه هندسی */}
              <div className="space-y-3">
                <h4 className="font-bold text-xs text-slate-300">لایه‌های شناسایی شده:</h4>
                <div className="space-y-2 max-h-[300px] overflow-y-auto">
                  {parsedLayers.map((layer) => (
                    <div
                      key={layer.id}
                      className="p-3 rounded-xl bg-slate-950 border border-slate-800 flex items-center justify-between text-xs"
                    >
                      <div className="flex items-center gap-2">
                        <span 
                          className="w-3.5 h-3.5 rounded-md flex-shrink-0"
                          style={{ backgroundColor: layer.color }}
                        />
                        <span className="font-semibold text-white">{layer.name}</span>
                      </div>
                      <span className="px-2 py-0.5 rounded-md bg-slate-900 text-slate-400 font-mono text-[11px]">
                        {layer.featureCount} المان
                      </span>
                    </div>
                  ))}
                </div>

                {selectedPreviewFeatureId && (
                  <div className="p-3 rounded-xl bg-cyan-950/40 border border-cyan-500/30 text-xs space-y-1.5 animate-fade-in">
                    <div className="font-bold text-cyan-300">
                      مشخصات المان انتخاب شده:
                    </div>
                    {(() => {
                      const feat = parsedFeatures.find(f => f.id === selectedPreviewFeatureId);
                      if (!feat) return null;
                      return (
                        <div className="text-[11px] text-slate-300 space-y-1">
                          <div><strong>نام:</strong> {feat.name}</div>
                          <div><strong>دسته‌بندی:</strong> {feat.category}</div>
                          {feat.properties.feGrade && <div><strong>عیار آهن:</strong> {feat.properties.feGrade}%</div>}
                          {feat.properties.rockType && <div><strong>نوع سنگ:</strong> {feat.properties.rockType}</div>}
                          {feat.properties.destination && <div><strong>مقصد پیش‌فرض:</strong> {feat.properties.destination}</div>}
                        </div>
                      );
                    })()}
                  </div>
                )}
              </div>
            </div>
          </div>
        )}

        {/* ===================== مرحله ۳: اتصال به دیتابیس و متادیتا ===================== */}
        {currentStep === 3 && (
          <div className="space-y-6">
            <div>
              <h3 className="font-bold text-sm text-white flex items-center gap-2">
                <CircleStackIcon className="w-5 h-5 text-cyan-400" />
                <span>اتصال المان‌های نقشه به موجودیت‌های دیتابیس معدن</span>
              </h3>
              <p className="text-xs text-slate-400">
                مشخص کنید لایه‌ها و چندضلعی‌های وارد شده به کدام پیت، باند استخراجی، بلوک و دپوهای ذخیره متصل شوند.
              </p>
            </div>

            {/* بخش ۱: اتصال پیت، تراز و باند ماهانه */}
            <div className="p-5 rounded-2xl bg-slate-950/80 border border-slate-800 space-y-4">
              <h4 className="font-bold text-xs text-cyan-400 flex items-center gap-2">
                <MapPinIcon className="w-4 h-4" />
                <span>۱. انتخاب پیت و باند طراحی ماهانه مصوب</span>
              </h4>

              <div className="grid grid-cols-1 md:grid-cols-3 gap-4 text-xs">
                <div>
                  <label className="block text-slate-300 mb-1 font-semibold">پیت معدنی هدف:</label>
                  <select
                    value={selectedPitId}
                    onChange={(e) => setSelectedPitId(e.target.value)}
                    className="w-full px-3 py-2 rounded-xl bg-slate-900 border border-slate-700 text-white"
                  >
                    {pits.map(p => (
                      <option key={p.id} value={p.id}>{p.name} ({p.code})</option>
                    ))}
                    <option value="pit-001">پیت مرکزی معدن سنگ‌آهن (Pit-01)</option>
                    <option value="pit-002">پیت شرقی مگنتیت (Pit-02)</option>
                  </select>
                </div>

                <div>
                  <label className="block text-slate-300 mb-1 font-semibold">باند طراحی ماهانه نظارت:</label>
                  <select
                    value={selectedBandId}
                    onChange={(e) => setSelectedBandId(e.target.value)}
                    className="w-full px-3 py-2 rounded-xl bg-slate-900 border border-slate-700 text-white"
                  >
                    {monthlyBands.map(b => (
                      <option key={b.id} value={b.id}>{b.code} - {b.title}</option>
                    ))}
                  </select>
                </div>

                <div>
                  <label className="block text-slate-300 mb-1 font-semibold">بلوک مادر (Block):</label>
                  <select
                    value={selectedBlockId}
                    onChange={(e) => setSelectedBlockId(e.target.value)}
                    className="w-full px-3 py-2 rounded-xl bg-slate-900 border border-slate-700 text-white font-mono"
                  >
                    {blocks.map(b => (
                      <option key={b.id} value={b.id} dir="ltr">
                        {formatBlockCode(b.code)} — {b.name}
                      </option>
                    ))}
                  </select>
                </div>
              </div>
            </div>

            {/* بخش ۲: نگاشت لایه‌ها به ساب‌بلوک‌ها و دپوها */}
            <div className="p-5 rounded-2xl bg-slate-950/80 border border-slate-800 space-y-4">
              <h4 className="font-bold text-xs text-cyan-400 flex items-center gap-2">
                <CubeIcon className="w-4 h-4" />
                <span>۲. تنظیمات متادیتای ساب‌بلوک‌ها و ویژگی‌های زمین‌شناسی</span>
              </h4>

              <div className="space-y-4">
                {Object.keys(layerMappings).map((layerKey) => {
                  const mapInfo = layerMappings[layerKey];
                  return (
                    <div
                      key={layerKey}
                      className="p-4 rounded-2xl bg-slate-900/90 border border-slate-800 space-y-3"
                    >
                      <div className="flex items-center justify-between">
                        <div className="flex items-center gap-2 text-xs font-bold text-white">
                          <span 
                            className="w-3 h-3 rounded-full"
                            style={{ backgroundColor: mapInfo.color }}
                          />
                          <span>لایه: {layerKey} ({mapInfo.detectedCount} المان)</span>
                        </div>
                        <span className="text-[11px] px-2.5 py-0.5 rounded-lg bg-slate-800 text-cyan-400 font-mono">
                          نوع: {mapInfo.category}
                        </span>
                      </div>

                      {mapInfo.category === 'SUB_BLOCK' && (
                        <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 text-xs pt-1">
                          <div>
                            <label className="block text-slate-400 mb-1">نوع کانسنگ:</label>
                            <input
                              type="text"
                              value={mapInfo.defaultRockType}
                              onChange={(e) => {
                                const val = e.target.value;
                                setLayerMappings(prev => ({
                                  ...prev,
                                  [layerKey]: { ...prev[layerKey], defaultRockType: val }
                                }));
                              }}
                              className="w-full px-2.5 py-1.5 rounded-lg bg-slate-950 border border-slate-700 text-white"
                            />
                          </div>

                          <div>
                            <label className="block text-slate-400 mb-1">عیار آهن Fe (%):</label>
                            <input
                              type="number"
                              step="0.1"
                              value={mapInfo.defaultFeGrade}
                              onChange={(e) => {
                                const val = Number(e.target.value);
                                setLayerMappings(prev => ({
                                  ...prev,
                                  [layerKey]: { ...prev[layerKey], defaultFeGrade: val }
                                }));
                              }}
                              className="w-full px-2.5 py-1.5 rounded-lg bg-slate-950 border border-slate-700 text-white font-mono"
                            />
                          </div>

                          <div>
                            <label className="block text-slate-400 mb-1">چگالی متوسط (t/m³):</label>
                            <input
                              type="number"
                              step="0.05"
                              value={mapInfo.defaultDensity}
                              onChange={(e) => {
                                const val = Number(e.target.value);
                                setLayerMappings(prev => ({
                                  ...prev,
                                  [layerKey]: { ...prev[layerKey], defaultDensity: val }
                                }));
                              }}
                              className="w-full px-2.5 py-1.5 rounded-lg bg-slate-950 border border-slate-700 text-white font-mono"
                            />
                          </div>

                          <div>
                            <label className="block text-slate-400 mb-1">مقصد تخلیه و دپو:</label>
                            <select
                              value={mapInfo.defaultDestination}
                              onChange={(e) => {
                                const val = e.target.value;
                                setLayerMappings(prev => ({
                                  ...prev,
                                  [layerKey]: { ...prev[layerKey], defaultDestination: val }
                                }));
                              }}
                              className="w-full px-2.5 py-1.5 rounded-lg bg-slate-950 border border-slate-700 text-white"
                            >
                              <option value="CRUSHER_LINE_1">خط ۱ سنگ‌شکن فکی اولیه (DSO)</option>
                              {stockpiles.map(stk => (
                                <option key={stk.id} value={stk.code}>{stk.name}</option>
                              ))}
                              <option value="DUMP-WASTE-01">دامپ باطله سنگی شمالی</option>
                            </select>
                          </div>
                        </div>
                      )}
                    </div>
                  );
                })}
              </div>
            </div>

            {/* گزینه‌های همگام‌سازی مستقیم */}
            <div className="p-4 rounded-2xl bg-cyan-950/20 border border-cyan-500/30 space-y-2">
              <label className="flex items-center gap-3 cursor-pointer text-xs">
                <input
                  type="checkbox"
                  checked={autoSyncSubBlocksToDb}
                  onChange={(e) => setAutoSyncSubBlocksToDb(e.target.checked)}
                  className="w-4 h-4 rounded text-cyan-500 focus:ring-cyan-400"
                />
                <span className="font-bold text-white">
                  ایجاد و همگام‌سازی خودکار ساب‌بلوک‌های استخراجی (SA, SB, SC, SD) در جدول دیتابیس ساب‌بلوک‌ها (`SubBlockRepository`)
                </span>
              </label>
              <p className="text-[11px] text-slate-400 mr-7">
                با فعال بودن این گزینه، علاوه بر ترسیم نقشه، رکوردهای رسمی ۴ ساب‌بلوک با عیار، تناژ و مقصد تعیین‌شده ساخته خواهند شد.
              </p>
            </div>
          </div>
        )}

        {/* ===================== مرحله ۴: اعتبارسنجی و ثبت رسمی ===================== */}
        {currentStep === 4 && (
          <div className="space-y-6">
            {!importSuccessResult ? (
              <>
                <div>
                  <h3 className="font-bold text-sm text-white flex items-center gap-2">
                    <CheckBadgeIcon className="w-5 h-5 text-cyan-400" />
                    <span>مرحله نهایی: اعتبارسنجی پارامترها و ابلاغ نقشه رسمی</span>
                  </h3>
                  <p className="text-xs text-slate-400">
                    خلاصه مشخصات فنی و اتصالات متادیتا را بازبینی نموده و در صورت تایید دکمه ثبت نهایی را کلیک کنید.
                  </p>
                </div>

                {/* کارت‌های خلاصه آماری */}
                <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
                  <div className="p-4 rounded-2xl bg-slate-950 border border-slate-800 space-y-1">
                    <span className="text-[11px] text-slate-400">ساب‌بلوک‌های تفکیک‌شده</span>
                    <div className="text-xl font-black text-emerald-400 font-mono">
                      {metadataSummary.subBlocksCount} عدد
                    </div>
                  </div>

                  <div className="p-4 rounded-2xl bg-slate-950 border border-slate-800 space-y-1">
                    <span className="text-[11px] text-slate-400">تناژ تخمینی کل پله</span>
                    <div className="text-xl font-black text-cyan-400 font-mono">
                      {metadataSummary.totalEstTonnage.toLocaleString()} تن
                    </div>
                  </div>

                  <div className="p-4 rounded-2xl bg-slate-950 border border-slate-800 space-y-1">
                    <span className="text-[11px] text-slate-400">میانگین عیار آهن (%Fe)</span>
                    <div className="text-xl font-black text-amber-400 font-mono">
                      {metadataSummary.avgFe}%
                    </div>
                  </div>

                  <div className="p-4 rounded-2xl bg-slate-950 border border-slate-800 space-y-1">
                    <span className="text-[11px] text-slate-400">نقاط و چال‌های متصل</span>
                    <div className="text-xl font-black text-purple-400 font-mono">
                      {metadataSummary.blastHolesCount} نقطه
                    </div>
                  </div>
                </div>

                {/* جدول خلاصه اتصالات */}
                <div className="p-4 rounded-2xl bg-slate-950 border border-slate-800 space-y-3">
                  <h4 className="font-bold text-xs text-slate-300">جدول نهایی اتصال متادیتا به موجودیت‌های سامانه:</h4>
                  
                  <div className="overflow-x-auto">
                    <table className="w-full text-right text-xs">
                      <thead>
                        <tr className="border-b border-slate-800 text-slate-400">
                          <th className="py-2">عنوان لایه / المان</th>
                          <th className="py-2">نوع موجودیت</th>
                          <th className="py-2">عیار آهن Fe</th>
                          <th className="py-2">مقصد تخلیه</th>
                          <th className="py-2">وضعیت اعتبارسنجی</th>
                        </tr>
                      </thead>
                      <tbody className="divide-y divide-slate-800/60 text-slate-200">
                        {parsedFeatures.slice(0, 5).map((f, i) => (
                          <tr key={f.id} className="hover:bg-slate-900/40">
                            <td className="py-2 font-bold text-white flex items-center gap-2">
                              <span 
                                className="w-2.5 h-2.5 rounded-full"
                                style={{ backgroundColor: f.style.strokeColor }}
                              />
                              <span>{f.name}</span>
                            </td>
                            <td className="py-2 font-mono text-[11px]">{f.category}</td>
                            <td className="py-2 font-mono text-cyan-400">{f.properties.feGrade ? `${f.properties.feGrade}%` : '-'}</td>
                            <td className="py-2">{f.properties.destination || 'پلان پله'}</td>
                            <td className="py-2 text-emerald-400 flex items-center gap-1 font-bold">
                              <CheckCircleIcon className="w-4 h-4" />
                              <span>منطبق با مدل</span>
                            </td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                </div>

                {/* تنظیمات نسخه و امضای نظارت */}
                <div className="p-4 rounded-2xl bg-slate-950 border border-slate-800 grid grid-cols-1 sm:grid-cols-2 gap-4 text-xs">
                  <div>
                    <label className="block text-slate-300 mb-1 font-semibold">شناسه نسخه بازنگری نقشه:</label>
                    <input
                      type="text"
                      value={revisionVersion}
                      onChange={(e) => setRevisionVersion(e.target.value)}
                      className="w-full px-3 py-2 rounded-xl bg-slate-900 border border-slate-700 text-white font-mono"
                    />
                  </div>

                  <div>
                    <label className="block text-slate-300 mb-1 font-semibold">وضعیت تصویب نقشه:</label>
                    <select
                      value={approvalStatus}
                      onChange={(e) => setApprovalStatus(e.target.value as any)}
                      className="w-full px-3 py-2 rounded-xl bg-slate-900 border border-slate-700 text-white"
                    >
                      <option value="APPROVED_OFFICIAL">مصوب و ابلاغ‌شده رسمی (Approved Official)</option>
                      <option value="PENDING_REVIEW">در انتظار بررسی دفتر فنی نظارت</option>
                      <option value="DRAFT">پیش‌نویس اولیه (Draft)</option>
                    </select>
                  </div>
                </div>
              </>
            ) : (
              /* نتیجه موفقیت‌آمیز ثبت */
              <div className="p-8 rounded-3xl bg-emerald-950/30 border border-emerald-500/40 text-center space-y-4 animate-fade-in">
                <div className="w-16 h-16 mx-auto rounded-3xl bg-emerald-500/20 text-emerald-400 flex items-center justify-center border border-emerald-500/30">
                  <CheckCircleIcon className="w-10 h-10" />
                </div>

                <div className="space-y-1">
                  <h3 className="text-lg font-black text-white">
                    نقشه مهندسی و کلیه متادیتاها با موفقیت در دیتابیس ثبت شدند!
                  </h3>
                  <p className="text-xs text-slate-300">
                    شناسه نقشه: <span className="font-mono text-cyan-400 font-bold">{importSuccessResult.map.code}</span> • نسخه: <span className="font-mono text-amber-400 font-bold">{importSuccessResult.map.version}</span>
                  </p>
                </div>

                <div className="inline-flex items-center gap-6 px-6 py-3 rounded-2xl bg-slate-950 border border-slate-800 text-xs">
                  <div>
                    <span className="text-slate-400">تعداد ساب‌بلوک‌های ذخیره‌شده:</span>
                    <span className="font-bold text-emerald-400 mr-2 font-mono">{importSuccessResult.subBlocksCreated} عدد</span>
                  </div>
                  <div className="w-px h-4 bg-slate-800" />
                  <div>
                    <span className="text-slate-400">تراز استخراجی پله:</span>
                    <span className="font-bold text-cyan-400 mr-2 font-mono">{importSuccessResult.map.benchLevel}m</span>
                  </div>
                </div>

                <div className="pt-4 flex items-center justify-center gap-3">
                  {onClose && (
                    <button
                      onClick={onClose}
                      className="px-6 py-2.5 rounded-xl bg-cyan-500 hover:bg-cyan-400 text-slate-950 font-black shadow-lg shadow-cyan-500/20 flex items-center gap-2 text-xs"
                    >
                      <CheckCircleIcon className="w-4 h-4" />
                      <span>مشاهده در استودیو نقشه</span>
                    </button>
                  )}
                </div>
              </div>
            )}
          </div>
        )}
      </div>

      {/* دکمه‌های ناوبری مراحل پایین */}
      {!importSuccessResult && (
        <div className="flex items-center justify-between border-t border-slate-800 pt-4">
          <button
            onClick={() => setCurrentStep(prev => Math.max(1, prev - 1) as any)}
            disabled={currentStep === 1}
            className={`px-4 py-2 rounded-xl text-xs font-bold flex items-center gap-2 ${
              currentStep === 1 
                ? 'opacity-40 cursor-not-allowed text-slate-600' 
                : 'bg-slate-800 text-slate-300 hover:text-white'
            }`}
          >
            <ArrowRightIcon className="w-4 h-4" />
            <span>مرحله قبل</span>
          </button>

          <div className="flex items-center gap-3">
            {onClose && (
              <button
                onClick={onClose}
                className="px-4 py-2 rounded-xl bg-slate-800 text-slate-300 hover:text-white text-xs"
              >
                انصراف
              </button>
            )}

            {currentStep < 4 ? (
              <button
                onClick={() => setCurrentStep(prev => Math.min(4, prev + 1) as any)}
                className="px-5 py-2.5 rounded-xl bg-cyan-500 hover:bg-cyan-400 text-slate-950 font-black shadow-lg shadow-cyan-500/20 flex items-center gap-2 text-xs"
              >
                <span>مرحله بعد</span>
                <ArrowLeftIcon className="w-4 h-4" />
              </button>
            ) : (
              <button
                onClick={handleCommitToDatabase}
                disabled={isProcessing}
                className="px-6 py-2.5 rounded-xl bg-emerald-500 hover:bg-emerald-400 text-slate-950 font-black shadow-lg shadow-emerald-500/20 flex items-center gap-2 text-xs"
              >
                <CheckCircleIcon className="w-4 h-4" />
                <span>{isProcessing ? 'در حال ثبت در دیتابیس...' : 'ثبت و اتصال نهایی به دیتابیس'}</span>
              </button>
            )}
          </div>
        </div>
      )}
    </div>
  );
};
