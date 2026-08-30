// src/shared/components/InfoTooltip/InfoTooltipProvider.tsx

import React, { createContext, useContext, useState, useEffect, useRef, useCallback } from 'react';
import { createPortal } from 'react-dom';
import { InfoTooltipCard } from './InfoTooltipCard';
import { useTheme } from '../../context/ThemeContext';
import type { InfoTooltipMetadata } from './types';

interface InfoTooltipContextType {
  showTooltip: (metadata: InfoTooltipMetadata, targetElement: HTMLElement, delayMs?: number) => void;
  hideTooltip: () => void;
}

const InfoTooltipContext = createContext<InfoTooltipContextType | null>(null);

export const useGlobalInfoTooltip = () => {
  const context = useContext(InfoTooltipContext);
  if (!context) {
    throw new Error('useGlobalInfoTooltip must be used within an InfoTooltipProvider');
  }
  return context;
};

interface InfoTooltipProviderProps {
  children: React.ReactNode;
  /** Global default delay in ms (defaults to 2000ms as requested) */
  defaultDelayMs?: number;
}

export const InfoTooltipProvider: React.FC<InfoTooltipProviderProps> = ({
  children,
  defaultDelayMs = 2000
}) => {
  const { isDark } = useTheme();
  const [activeMetadata, setActiveMetadata] = useState<InfoTooltipMetadata | null>(null);
  const [coords, setCoords] = useState<{ x: number; y: number }>({ x: 0, y: 0 });
  const [isOpen, setIsOpen] = useState(false);

  const hoverTimerRef = useRef<NodeJS.Timeout | null>(null);
  const leaveTimerRef = useRef<NodeJS.Timeout | null>(null);
  const currentTargetRef = useRef<HTMLElement | null>(null);

  const calculatePosition = useCallback((targetRect: DOMRect) => {
    const tooltipWidth = 288; // 18rem = 288px
    const tooltipHeight = 250;
    const gap = 10;

    const viewportWidth = window.innerWidth;
    const viewportHeight = window.innerHeight;

    // Prefer displaying beneath target centered
    let x = targetRect.left + targetRect.width / 2 - tooltipWidth / 2;
    let y = targetRect.bottom + gap;

    // Flip to top if overflowing bottom and space above exists
    if (y + tooltipHeight > viewportHeight && targetRect.top > tooltipHeight + gap) {
      y = targetRect.top - tooltipHeight - gap;
    }

    // Keep within horizontal bounds
    x = Math.max(16, Math.min(x, viewportWidth - tooltipWidth - 16));
    y = Math.max(16, Math.min(y, viewportHeight - tooltipHeight - 16));

    return { x, y };
  }, []);

  const parseElementMetadata = useCallback((element: HTMLElement): InfoTooltipMetadata | null => {
    // 1. Check data-hover-info or data-info-tooltip JSON or string
    const hoverInfoAttr = element.getAttribute('data-hover-info') || element.getAttribute('data-info-tooltip');
    if (hoverInfoAttr) {
      try {
        const parsed = JSON.parse(hoverInfoAttr);
        if (typeof parsed === 'object' && parsed !== null) {
          return parsed as InfoTooltipMetadata;
        }
      } catch (err) {
        // Not a JSON, treat as title/caption
        return {
          title: hoverInfoAttr,
          code: element.getAttribute('data-hover-code') || undefined,
          status: element.getAttribute('data-hover-status') || undefined,
          location: element.getAttribute('data-hover-location') || undefined
        };
      }
    }

    // 2. Check individual attributes: data-hover-title, data-hover-code, data-hover-status, etc.
    const title = element.getAttribute('data-hover-title');
    const code = element.getAttribute('data-hover-code');
    const status = element.getAttribute('data-hover-status');
    const location = element.getAttribute('data-hover-location');
    const benchLevel = element.getAttribute('data-hover-bench');
    const operator = element.getAttribute('data-hover-operator');
    const category = element.getAttribute('data-hover-category');
    const statsAttr = element.getAttribute('data-hover-stats');
    const detailsAttr = element.getAttribute('data-hover-details');

    if (title || code || status || location) {
      let stats = undefined;
      let details = undefined;

      if (statsAttr) {
        try {
          stats = JSON.parse(statsAttr);
        } catch {
          // ignore
        }
      }

      if (detailsAttr) {
        try {
          details = JSON.parse(detailsAttr);
        } catch {
          // ignore
        }
      }

      return {
        title: title || undefined,
        code: code || undefined,
        status: status || undefined,
        location: location || undefined,
        benchLevel: benchLevel || undefined,
        operator: operator || undefined,
        category: category || undefined,
        stats,
        details
      };
    }

    return null;
  }, []);

  // Programmatic API
  const showTooltip = useCallback((metadata: InfoTooltipMetadata, targetElement: HTMLElement, delayMs = defaultDelayMs) => {
    if (hoverTimerRef.current) clearTimeout(hoverTimerRef.current);
    if (leaveTimerRef.current) clearTimeout(leaveTimerRef.current);

    currentTargetRef.current = targetElement;

    hoverTimerRef.current = setTimeout(() => {
      const rect = targetElement.getBoundingClientRect();
      const pos = calculatePosition(rect);
      setActiveMetadata(metadata);
      setCoords(pos);
      setIsOpen(true);
    }, delayMs);
  }, [defaultDelayMs, calculatePosition]);

  const hideTooltip = useCallback(() => {
    if (hoverTimerRef.current) {
      clearTimeout(hoverTimerRef.current);
      hoverTimerRef.current = null;
    }
    setIsOpen(false);
    setActiveMetadata(null);
    currentTargetRef.current = null;
  }, []);

  // Global event delegation for any element with data-hover-info in DOM
  useEffect(() => {
    const handleMouseOver = (e: MouseEvent) => {
      const target = e.target as HTMLElement | null;
      if (!target) return;

      // Find closest element with hover-info attributes
      const matchEl = target.closest<HTMLElement>(
        '[data-hover-info], [data-info-tooltip], [data-hover-title], [data-hover-code]'
      );

      if (!matchEl) return;

      // If hovering over the same active element, ignore
      if (currentTargetRef.current === matchEl) {
        if (leaveTimerRef.current) {
          clearTimeout(leaveTimerRef.current);
          leaveTimerRef.current = null;
        }
        return;
      }

      const metadata = parseElementMetadata(matchEl);
      if (!metadata) return;

      if (hoverTimerRef.current) clearTimeout(hoverTimerRef.current);
      if (leaveTimerRef.current) clearTimeout(leaveTimerRef.current);

      currentTargetRef.current = matchEl;

      // Read custom delay if specified on attribute data-hover-delay
      const customDelayAttr = matchEl.getAttribute('data-hover-delay');
      const delay = customDelayAttr ? parseInt(customDelayAttr, 10) : defaultDelayMs;

      hoverTimerRef.current = setTimeout(() => {
        if (currentTargetRef.current === matchEl) {
          const rect = matchEl.getBoundingClientRect();
          const pos = calculatePosition(rect);
          setActiveMetadata(metadata);
          setCoords(pos);
          setIsOpen(true);
        }
      }, delay);
    };

    const handleMouseOut = (e: MouseEvent) => {
      const target = e.target as HTMLElement | null;
      if (!target) return;

      const matchEl = target.closest<HTMLElement>(
        '[data-hover-info], [data-info-tooltip], [data-hover-title], [data-hover-code]'
      );

      if (matchEl && currentTargetRef.current === matchEl) {
        if (hoverTimerRef.current) {
          clearTimeout(hoverTimerRef.current);
          hoverTimerRef.current = null;
        }

        // 250ms grace period so user can move mouse onto tooltip
        leaveTimerRef.current = setTimeout(() => {
          setIsOpen(false);
          setActiveMetadata(null);
          currentTargetRef.current = null;
        }, 250);
      }
    };

    const handleGlobalClick = () => {
      hideTooltip();
    };

    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape') {
        hideTooltip();
      }
    };

    document.addEventListener('mouseover', handleMouseOver);
    document.addEventListener('mouseout', handleMouseOut);
    document.addEventListener('click', handleGlobalClick);
    document.addEventListener('keydown', handleKeyDown);

    return () => {
      document.removeEventListener('mouseover', handleMouseOver);
      document.removeEventListener('mouseout', handleMouseOut);
      document.removeEventListener('click', handleGlobalClick);
      document.removeEventListener('keydown', handleKeyDown);
      if (hoverTimerRef.current) clearTimeout(hoverTimerRef.current);
      if (leaveTimerRef.current) clearTimeout(leaveTimerRef.current);
    };
  }, [defaultDelayMs, parseElementMetadata, calculatePosition, hideTooltip]);

  const handleCardMouseEnter = () => {
    if (leaveTimerRef.current) {
      clearTimeout(leaveTimerRef.current);
      leaveTimerRef.current = null;
    }
  };

  const handleCardMouseLeave = () => {
    hideTooltip();
  };

  return (
    <InfoTooltipContext.Provider value={{ showTooltip, hideTooltip }}>
      {children}

      {isOpen && activeMetadata && typeof document !== 'undefined' && createPortal(
        <div
          style={{
            position: 'fixed',
            left: `${coords.x}px`,
            top: `${coords.y}px`,
            zIndex: 999999
          }}
          className="animate-in fade-in zoom-in-95 duration-200"
        >
          <InfoTooltipCard
            metadata={activeMetadata}
            isDark={isDark}
            onClose={hideTooltip}
            onMouseEnter={handleCardMouseEnter}
            onMouseLeave={handleCardMouseLeave}
          />
        </div>,
        document.body
      )}
    </InfoTooltipContext.Provider>
  );
};
