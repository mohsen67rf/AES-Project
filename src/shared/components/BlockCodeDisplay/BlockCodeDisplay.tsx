// src/shared/components/BlockCodeDisplay/BlockCodeDisplay.tsx
import React from 'react';
import { formatBlockCode } from './formatBlockCode';

export interface BlockCodeDisplayProps {
  code: string | undefined | null;
  prefix?: string;
  className?: string;
  wrapperClassName?: string;
}

/**
 * کامپوننت نمایش استاندارد نام و کد بلوک
 * این کامپوننت با استفاده از dir="ltr" و unicodeBidi="isolate" تضمین می‌کند که
 * حتی در محیط‌های راست‌به‌چپ (RTL) فارسی، نام بلوک همیشه به صورت چپ‌به‌راست (مثلاً 1040 B 33) نمایش داده شود.
 */
export function BlockCodeDisplay({
  code,
  prefix,
  className = '',
  wrapperClassName = '',
}: BlockCodeDisplayProps) {
  const formatted = formatBlockCode(code);

  return (
    <span className={`inline-flex items-center gap-1.5 ${wrapperClassName}`}>
      {prefix && <span>{prefix}</span>}
      <bdi
        dir="ltr"
        className={`font-mono inline-block select-all ${className}`}
        style={{ direction: 'ltr', unicodeBidi: 'isolate', textAlign: 'left' }}
      >
        {formatted}
      </bdi>
    </span>
  );
}

export default BlockCodeDisplay;

