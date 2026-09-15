// src/shared/components/BlockCodeDisplay/formatBlockCode.ts

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
