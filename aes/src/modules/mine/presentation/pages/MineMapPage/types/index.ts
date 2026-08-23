// src/modules/mine/presentation/pages/MineMapPage/types/index.ts

import { BaseMapType } from '../../../components/Map';

export interface MapPageState {
  geoData: any;
  loading: boolean;
  activeTool: string;
  selectedPitId: string | null;
  backgroundColor: string;
  baseMapType: BaseMapType;
  baseMapOpacity: number;
  featureCounts: {
    points: number;
    lines: number;
    polygons: number;
    measurements: number;
  };
}

export interface MapPageActions {
  setGeoData: (data: any) => void;
  setLoading: (loading: boolean) => void;
  setActiveTool: (tool: string) => void;
  setSelectedPitId: (pitId: string | null) => void;
  setBackgroundColor: (color: string) => void;
  setBaseMapType: (type: BaseMapType) => void;
  setBaseMapOpacity: (opacity: number) => void;
  updateFeatureCounts: (type: string, count: number) => void;
}