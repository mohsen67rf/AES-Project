// src/shared/components/InfoTooltip/InfoTooltip.tsx

import React, { useState, useRef, useEffect, useCallback } from 'react';
import { createPortal } from 'react-dom';
import { InfoTooltipCard } from './InfoTooltipCard';
import { useTheme } from '../../context/ThemeContext';
import type { InfoTooltipProps, InfoTooltipMetadata } from './types';

export const InfoTooltip: React.FC<InfoTooltipProps> = ({
  metadata,
  delayMs = 2000,
  leaveDelayMs = 250,
  children,
  className = '',
  disabled = false,
  placement = 'auto',
  'data-hover-info': inlineData
}) => {
  const { isDark } = useTheme();
  const [isVisible, setIsVisible] = useState(false);
  const [coords, setCoords] = useState<{ x: number; y: number }>({ x: 0, y: 0 });

  const containerRef = useRef<HTMLDivElement>(null);
  const showTimerRef = useRef<NodeJS.Timeout | null>(null);
  const hideTimerRef = useRef<NodeJS.Timeout | null>(null);

  // Parse inline data if provided as string
  const resolvedMetadata: InfoTooltipMetadata | undefined = React.useMemo(() => {
    if (metadata) return metadata;
    if (!inlineData) return undefined;
    if (typeof inlineData === 'string') {
      try {
        return JSON.parse(inlineData);
      } catch (err) {
        return { title: inlineData };
      }
    }
    return inlineData;
  }, [metadata, inlineData]);

  const calculatePosition = useCallback((targetRect: DOMRect) => {
    const tooltipWidth = 288; // w-72 = 18rem = 288px
    const tooltipHeight = 260; // approximate height
    const gap = 12;

    const viewportWidth = window.innerWidth;
    const viewportHeight = window.innerHeight;

    let x = targetRect.left + targetRect.width / 2 - tooltipWidth / 2;
    let y = targetRect.bottom + gap;

    // Smart placement calculation
    if (placement === 'top' || (placement === 'auto' && y + tooltipHeight > viewportHeight && targetRect.top > tooltipHeight + gap)) {
      y = targetRect.top - tooltipHeight - gap;
    } else if (placement === 'left') {
      x = targetRect.left - tooltipWidth - gap;
      y = targetRect.top + targetRect.height / 2 - tooltipHeight / 2;
    } else if (placement === 'right') {
      x = targetRect.right + gap;
      y = targetRect.top + targetRect.height / 2 - tooltipHeight / 2;
    }

    // Viewport edge collision guards
    x = Math.max(12, Math.min(x, viewportWidth - tooltipWidth - 12));
    y = Math.max(12, Math.min(y, viewportHeight - tooltipHeight - 12));

    return { x, y };
  }, [placement]);

  const handleMouseEnter = useCallback((e: React.MouseEvent) => {
    if (disabled || !resolvedMetadata) return;

    if (hideTimerRef.current) {
      clearTimeout(hideTimerRef.current);
      hideTimerRef.current = null;
    }

    if (showTimerRef.current) {
      clearTimeout(showTimerRef.current);
    }

    const currentTarget = containerRef.current;
    if (!currentTarget) return;

    const rect = currentTarget.getBoundingClientRect();

    showTimerRef.current = setTimeout(() => {
      const pos = calculatePosition(rect);
      setCoords(pos);
      setIsVisible(true);
    }, delayMs);
  }, [disabled, resolvedMetadata, delayMs, calculatePosition]);

  const handleMouseLeave = useCallback(() => {
    if (showTimerRef.current) {
      clearTimeout(showTimerRef.current);
      showTimerRef.current = null;
    }

    hideTimerRef.current = setTimeout(() => {
      setIsVisible(false);
    }, leaveDelayMs);
  }, [leaveDelayMs]);

  const handleCardMouseEnter = useCallback(() => {
    if (hideTimerRef.current) {
      clearTimeout(hideTimerRef.current);
      hideTimerRef.current = null;
    }
  }, []);

  const handleCardMouseLeave = useCallback(() => {
    setIsVisible(false);
  }, []);

  const handleClose = useCallback(() => {
    if (showTimerRef.current) clearTimeout(showTimerRef.current);
    if (hideTimerRef.current) clearTimeout(hideTimerRef.current);
    setIsVisible(false);
  }, []);

  // Cleanup timers on unmount
  useEffect(() => {
    return () => {
      if (showTimerRef.current) clearTimeout(showTimerRef.current);
      if (hideTimerRef.current) clearTimeout(hideTimerRef.current);
    };
  }, []);

  // Listen for Escape key to close
  useEffect(() => {
    if (!isVisible) return;
    const onKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape') {
        handleClose();
      }
    };
    window.addEventListener('keydown', onKeyDown);
    return () => window.removeEventListener('keydown', onKeyDown);
  }, [isVisible, handleClose]);

  return (
    <>
      <div
        ref={containerRef}
        onMouseEnter={handleMouseEnter}
        onMouseLeave={handleMouseLeave}
        className={`inline-block ${className}`}
        data-hover-active={isVisible ? 'true' : undefined}
      >
        {children}
      </div>

      {isVisible && resolvedMetadata && typeof document !== 'undefined' && createPortal(
        <div
          style={{
            position: 'fixed',
            left: `${coords.x}px`,
            top: `${coords.y}px`,
            zIndex: 99999
          }}
          className="animate-in fade-in zoom-in-95 duration-200"
        >
          <InfoTooltipCard
            metadata={resolvedMetadata}
            isDark={isDark}
            onClose={handleClose}
            onMouseEnter={handleCardMouseEnter}
            onMouseLeave={handleCardMouseLeave}
          />
        </div>,
        document.body
      )}
    </>
  );
};
