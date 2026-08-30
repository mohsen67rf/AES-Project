// src/shared/components/InfoTooltip/types.ts

import { ReactNode } from 'react';

export type TooltipStatusVariant = 
  | 'active' 
  | 'standby' 
  | 'maintenance' 
  | 'operational' 
  | 'breakdown' 
  | 'success' 
  | 'warning' 
  | 'danger' 
  | 'error' 
  | 'info' 
  | 'neutral'
  | 'extracting'
  | 'completed'
  | 'planned';

export interface TooltipStatItem {
  label: string;
  value: string | number;
  unit?: string;
  color?: 'emerald' | 'amber' | 'cyan' | 'rose' | 'indigo' | 'purple' | 'slate';
}

export interface InfoTooltipMetadata {
  /** Title or main label (e.g., equipment name, block title, sensor name) */
  title?: string;
  /** Subtitle or secondary caption (e.g., brand/model, coordinate group) */
  subtitle?: string;
  /** Unique identifying code or serial (e.g., EX-101, BLK-204-B) */
  code?: string;
  /** Status string (e.g., ACTIVE, STANDBY, استخراج فعال, تعمیرات) */
  status?: string;
  /** Visual theme for the status badge */
  statusVariant?: TooltipStatusVariant;
  /** Location or Zone description (e.g., پله ۱۲۵۰ - جبهه‌کار شرقی) */
  location?: string;
  /** Elevation or bench level in meters */
  benchLevel?: string | number;
  /** Category or equipment type */
  category?: string;
  /** Operator, driver, or assigned supervisor name */
  operator?: string;
  /** Key metrics and daily statistics */
  stats?: TooltipStatItem[];
  /** Flexible key-value pairs for additional parameters */
  details?: Record<string, string | number | undefined | null>;
  /** Optional tags or badges */
  tags?: string[];
  /** Optional custom action button */
  action?: {
    label: string;
    onClick?: () => void;
  };
  /** Custom extra ReactNode content */
  customContent?: ReactNode;
}

export interface InfoTooltipProps {
  /** Dynamic metadata payload */
  metadata?: InfoTooltipMetadata;
  /** Delay before appearing in milliseconds (defaults to 2000ms as required) */
  delayMs?: number;
  /** Delay before disappearing after mouse leaves in milliseconds */
  leaveDelayMs?: number;
  /** Children element to wrap with hover listener */
  children?: ReactNode;
  /** Custom class name for wrapper element */
  className?: string;
  /** Disabled state */
  disabled?: boolean;
  /** Placement preference */
  placement?: 'auto' | 'top' | 'bottom' | 'left' | 'right';
  /** Extra inline data attributes support */
  'data-hover-info'?: string | InfoTooltipMetadata;
}
