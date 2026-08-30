// src/modules/mine/presentation/components/SurveyMapStudio/MapImportModal.tsx

import React, { useState } from 'react';
import type { SurveyMap } from '../../../../../core/domain/types/survey-map.types';
import type { StakeholderRole } from '../../../../../core/domain/types/mine.types';
import { SurveyImportMetadataLinker } from './SurveyImportMetadataLinker';

interface MapImportModalProps {
  activeRole: StakeholderRole;
  userName: string;
  onClose: () => void;
  onMapImported: (map: SurveyMap) => void;
}

export function MapImportModal({
  activeRole,
  userName,
  onClose,
  onMapImported
}: MapImportModalProps) {
  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-6 bg-black/80 backdrop-blur-md animate-fade-in" dir="rtl">
      <div className="w-full max-w-4xl max-h-[95vh] overflow-y-auto rounded-3xl shadow-2xl">
        <SurveyImportMetadataLinker
          activeRole={activeRole}
          userName={userName}
          onMapImported={onMapImported}
          onClose={onClose}
          isStandalonePage={false}
        />
      </div>
    </div>
  );
}
