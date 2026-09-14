// src/shared/components/BlockCodeDisplay/BlockCodeDisplay.tsx
import React from 'react';

/**
 * فرمت‌بندی استاندارد نام و کد بلوک‌ها در کل سامانه به صورت چپ به راست (LTR)
 * مثال استاندارد: 1040 B 33 یا 1040 B 33 – SA
 */
export function formatBlockCode(rawCode: string | undefined | null): string {
  if (!rawCode) return '';
  const trimmed = rawCode.trim();

  // اگر ساب‌بلوک همراه آن باشد مانند "1040 B 33 – SA" یا "1040-B-32-SA" یا "1040 B 32 - SA"
  const subBlockMatch = trimmed.match(/^(.*?)(?:\s*[-–—]\s*(S[A-Z]))$/i);
  if (subBlockMatch) {
    const mainBlock = formatBlockCode(subBlockMatch[1]);
    const subPart = subBlockMatch[2].toUpperCase();
    return `${mainBlock} – ${subPart}`;
  }

  // الگوی استاندارد تراز + خط‌تیره یا فاصله + حرف لاتین + خط‌تیره یا فاصله + شماره: مانند "1040-B-12", "1040 B 33", "1040-B33", "1040B33"
  const fullMatch = trimmed.match(/^(\d{3,4})[\s\-_]*([A-Za-z])[\s\-_]*(\d{1,3})$/);
  if (fullMatch) {
    const bench = fullMatch[1];
    const letter = fullMatch[2].toUpperCase();
    const number = fullMatch[3];
    return `${bench} ${letter} ${number}`;
  }

  // اگر الگوی تراز با کلمه BLOCK باشد: "BLOCK-1040-33" یا "BLOCK-1040-B33"
  const blockPrefixMatch = trimmed.match(/^BLOCK[\s\-_]*(\d{3,4})[\s\-_]*([A-Za-z])?[\s\-_]*(\d{1,3})$/i);
  if (blockPrefixMatch) {
    const bench = blockPrefixMatch[1];
    const letter = (blockPrefixMatch[2] || 'B').toUpperCase();
    const number = blockPrefixMatch[3];
    return `${bench} ${letter} ${number}`;
  }

  // اگر فقط حرف و شماره باشد: مانند "B-33", "B33"
  const shortMatch = trimmed.match(/^([A-Za-z])[\s\-_]*(\d{1,3})$/);
  if (shortMatch) {
    const letter = shortMatch[1].toUpperCase();
    const number = shortMatch[2];
    return `1040 ${letter} ${number}`;
  }

  // اگر فاصله‌های چندگانه دارد نرمال‌سازی شود
  return trimmed.replace(/\s+/g, ' ');
}

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
