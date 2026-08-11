// src/modules/mine/presentation/components/PageHeader/PageHeader.tsx

import { ReactNode } from 'react';
import { ArrowPathIcon, ChevronRightIcon } from '@heroicons/react/24/outline';
import { useTheme } from '../../../../../shared/context/ThemeContext';

interface PageHeaderProps {
  title: string;
  subtitle?: string;
  onBack?: () => void;
  onRefresh?: () => void;
  actions?: ReactNode;
}

export function PageHeader({ 
  title, 
  subtitle, 
  onBack, 
  onRefresh, 
  actions 
}: PageHeaderProps) {
  const { isDark } = useTheme();

  return (
    <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
      <div className="flex items-center gap-3">
        {onBack && (
          <button
            onClick={onBack}
            className={`p-2 rounded-xl transition-colors ${
              isDark 
                ? 'bg-[#AACCDD]/10 hover:bg-[#AACCDD]/20 text-[#AACCDD]' 
                : 'bg-gray-200 hover:bg-gray-300 text-gray-700'
            }`}
          >
            <ChevronRightIcon className="w-5 h-5" />
          </button>
        )}
        <div>
          <h2 className={`text-2xl font-bold ${isDark ? 'text-white' : 'text-gray-800'}`}>
            {title}
          </h2>
          {subtitle && (
            <p className={`text-sm ${isDark ? 'text-[#8A9DB0]' : 'text-gray-500'}`}>
              {subtitle}
            </p>
          )}
        </div>
      </div>
      <div className="flex items-center gap-3">
        {actions}
        {onRefresh && (
          <button
            onClick={onRefresh}
            className={`p-2 rounded-xl transition-colors ${
              isDark 
                ? 'bg-[#AACCDD]/10 hover:bg-[#AACCDD]/20 text-[#AACCDD]' 
                : 'bg-gray-200 hover:bg-gray-300 text-gray-700'
            }`}
          >
            <ArrowPathIcon className="w-5 h-5" />
          </button>
        )}
      </div>
    </div>
  );
}