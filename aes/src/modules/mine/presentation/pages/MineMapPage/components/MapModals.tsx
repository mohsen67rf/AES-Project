// src/modules/mine/presentation/pages/MineMapPage/components/MapModals.tsx

import { BaseMapType } from '../../../components/Map';
import { PitMapUploader } from '../../../components/Map/components/PitMapUploader';
import { DrawingModal } from '../../../components/Map/components/DrawingModal';
import { MeasureModal } from '../../../components/Map/components/MeasureModal';
import { EditModal } from '../../../components/Map/components/EditModal';
import { HaulRouteModal } from '../../../components/Map/components/HaulRouteModal';

interface MapModalsProps {
  // Settings Modal
  showSettings: boolean;
  onCloseSettings: () => void;
  backgroundColor: string;
  onBackgroundChange: (color: string) => void;
  baseMapType: BaseMapType;
  onBaseMapTypeChange: (type: BaseMapType) => void;
  baseMapOpacity: number;
  onBaseMapOpacityChange: (opacity: number) => void;
  settingsModal: React.ReactNode;

  // Pit Map Uploader
  showPitUploader: boolean;
  uploadingPitId: string | null;
  pits: any[];
  onPitUpload: (data: any) => void;
  onClosePitUploader: () => void;

  // Drawing
  showDrawing: boolean;
  onCloseDrawing: () => void;
  onDrawingConfirm: (tool: string, settings: any) => void;
  drawingType: 'point' | 'line' | 'polygon';

  // Measure
  showMeasure: boolean;
  onCloseMeasure: () => void;
  onMeasureConfirm: (tool: string) => void;

  // Edit
  showEdit: boolean;
  onCloseEdit: () => void;
  selectedFeature: any;
  onUpdate: (updates: any) => void;
  onDelete: () => void;

  // Haul Route
  showHaulRoute: boolean;
  onCloseHaulRoute: () => void;
  onHaulRouteConfirm: (subBlockId: string, destination: string) => void;
  haulRouteDistance: number;
  haulRoutePoints: number;
}

export function MapModals({
  showSettings,
  onCloseSettings,
  backgroundColor,
  onBackgroundChange,
  baseMapType,
  onBaseMapTypeChange,
  baseMapOpacity,
  onBaseMapOpacityChange,
  settingsModal,
  showPitUploader,
  uploadingPitId,
  pits,
  onPitUpload,
  onClosePitUploader,
  showDrawing,
  onCloseDrawing,
  onDrawingConfirm,
  drawingType,
  showMeasure,
  onCloseMeasure,
  onMeasureConfirm,
  showEdit,
  onCloseEdit,
  selectedFeature,
  onUpdate,
  onDelete,
  showHaulRoute,
  onCloseHaulRoute,
  onHaulRouteConfirm,
  haulRouteDistance,
  haulRoutePoints,
}: MapModalsProps) {
  return (
    <>
      {/* مودال تنظیمات نقشه */}
      {settingsModal}

      {/* مودال بارگذاری نقشه پیت */}
      {showPitUploader && uploadingPitId && (
        <PitMapUploader
          pitId={uploadingPitId}
          pitName={
            pits.find((p: any) => p.id === uploadingPitId)?.name || ''
          }
          onUpload={onPitUpload}
          onClose={onClosePitUploader}
        />
      )}

      {/* مودال رسم */}
      <DrawingModal
        isOpen={showDrawing}
        onClose={onCloseDrawing}
        onConfirm={onDrawingConfirm}
        toolType={drawingType}
      />

      {/* مودال اندازه‌گیری */}
      <MeasureModal
        isOpen={showMeasure}
        onClose={onCloseMeasure}
        onConfirm={onMeasureConfirm}
      />

      {/* مودال ویرایش */}
      <EditModal
        isOpen={showEdit}
        onClose={onCloseEdit}
        feature={selectedFeature}
        onUpdate={onUpdate}
        onDelete={onDelete}
      />

      {/* مودال تایید مسیر حمل */}
      <HaulRouteModal
        isOpen={showHaulRoute}
        onClose={onCloseHaulRoute}
        onConfirm={onHaulRouteConfirm}
        distance={haulRouteDistance}
        pointsCount={haulRoutePoints}
      />
    </>
  );
}

export default MapModals;