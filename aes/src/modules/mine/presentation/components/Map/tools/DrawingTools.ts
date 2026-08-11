// src/modules/mine/presentation/components/Map/tools/DrawingTools.ts

import L from 'leaflet';

export function getDrawOptions(tool: string): any {
  const baseStyle = {
    shapeOptions: {
      color: '#C9A227',
      weight: 2,
      fillColor: '#C9A227',
      fillOpacity: 0.2,
    },
  };

  const tools: Record<string, any> = {
    'point': {
      marker: {
        icon: L.divIcon({
          className: 'custom-marker',
          html: '<div style="background:#C9A227;width:14px;height:14px;border-radius:50%;border:2px solid white;box-shadow:0 2px 4px rgba(0,0,0,0.3);"></div>',
          iconSize: [14, 14],
        }),
      },
    },
    'line': {
      polyline: baseStyle,
    },
    'polygon': {
      polygon: baseStyle,
      rectangle: baseStyle,
    },
    'measureDistance': {
      polyline: {
        shapeOptions: {
          color: '#FF6B6B',
          weight: 3,
          dashArray: '5, 5',
        },
        metric: true,
      },
    },
    'measureArea': {
      polygon: {
        shapeOptions: {
          color: '#4ECDC4',
          weight: 2,
          fillColor: '#4ECDC4',
          fillOpacity: 0.2,
        },
        metric: true,
      },
    },
  };

  return tools[tool] || null;
}

export function getToolLabel(tool: string): string {
  const labels: Record<string, string> = {
    'point': 'رسم نقطه',
    'line': 'رسم خط',
    'polygon': 'رسم محدوده',
    'measureDistance': 'اندازه‌گیری فاصله',
    'measureArea': 'اندازه‌گیری مساحت',
  };
  return labels[tool] || tool;
}