// src/shared/components/LogoIcon.tsx

interface LogoIconProps {
  size?: number;
  className?: string;
}

export function LogoIcon({ size = 48, className = '' }: LogoIconProps) {
  return (
    <svg
      width={size}
      height={size}
      viewBox="0 0 48 48"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
      className={className}
    >
      <defs>
        {/* رویه‌ی بالا - طلایی روشن */}
        <linearGradient id="topFace" x1="0" y1="0" x2="1" y2="1">
          <stop offset="0%" stopColor="#E8C84A" />
          <stop offset="100%" stopColor="#C9A227" />
        </linearGradient>
        
        {/* رویه‌ی چپ - طلایی متوسط */}
        <linearGradient id="leftFace" x1="0" y1="0" x2="1" y2="1">
          <stop offset="0%" stopColor="#B8941F" />
          <stop offset="100%" stopColor="#A07A15" />
        </linearGradient>
        
        {/* رویه‌ی راست - طلایی تیره */}
        <linearGradient id="rightFace" x1="0" y1="0" x2="1" y2="1">
          <stop offset="0%" stopColor="#8B690F" />
          <stop offset="100%" stopColor="#6B4F0A" />
        </linearGradient>

        {/* فیلتر سایه */}
        <filter id="shadow" x="-20%" y="-20%" width="140%" height="140%">
          <feDropShadow dx="2" dy="4" stdDeviation="4" floodColor="#6B4F0A" floodOpacity="0.3" />
        </filter>
      </defs>

      {/* سایه */}
      <g filter="url(#shadow)">
        {/* رویه‌ی بالا */}
        <polygon
          points="24,6 42,15 24,24 6,15"
          fill="url(#topFace)"
          stroke="rgba(255,255,255,0.2)"
          strokeWidth="0.5"
        />
        
        {/* رویه‌ی چپ */}
        <polygon
          points="6,15 24,24 24,42 6,33"
          fill="url(#leftFace)"
          stroke="rgba(255,255,255,0.1)"
          strokeWidth="0.5"
        />
        
        {/* رویه‌ی راست */}
        <polygon
          points="24,24 42,15 42,33 24,42"
          fill="url(#rightFace)"
          stroke="rgba(255,255,255,0.1)"
          strokeWidth="0.5"
        />
      </g>

      {/* خطوط برجسته */}
      <g opacity="0.3">
        <line x1="24" y1="6" x2="24" y2="24" stroke="white" strokeWidth="0.5" />
        <line x1="6" y1="15" x2="24" y2="24" stroke="white" strokeWidth="0.5" />
        <line x1="42" y1="15" x2="24" y2="24" stroke="white" strokeWidth="0.5" />
      </g>

      {/* هایلایت */}
      <ellipse
        cx="20"
        cy="12"
        rx="6"
        ry="3"
        fill="white"
        opacity="0.15"
        transform="rotate(-30, 20, 12)"
      />
    </svg>
  );
}