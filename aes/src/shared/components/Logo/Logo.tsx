// src/shared/components/Logo/Logo.tsx

export function Logo({ 
  variant = 'dark', 
  size = 'md', 
  showTagline = true,
  className = ''
}: { 
  variant?: 'light' | 'dark';
  size?: 'sm' | 'md' | 'lg' | 'xl';
  showTagline?: boolean;
  className?: string;
}) {
  const sizes = {
    sm: { width: 120, fontSize: 32, taglineSize: 10, gap: 4 },
    md: { width: 200, fontSize: 48, taglineSize: 14, gap: 6 },
    lg: { width: 320, fontSize: 72, taglineSize: 18, gap: 8 },
    xl: { width: 480, fontSize: 100, taglineSize: 24, gap: 10 },
  };

  const colors = {
    light: {
      primary: '#FFFFFF',
      secondary: '#AACCDD',
    },
    dark: {
      primary: '#1A2A3A',
      secondary: '#4A6A8A',
    },
  };

  const { width, fontSize, taglineSize, gap } = sizes[size];
  const { primary, secondary } = colors[variant];
  
  const height = showTagline ? fontSize + taglineSize + gap + 20 : fontSize + 20;

  return (
    <div className={`inline-block ${className}`} style={{ width: `${width}px` }}>
      <svg
        viewBox={`0 0 ${width} ${height}`}
        xmlns="http://www.w3.org/2000/svg"
        width={width}
        height={height}
      >
        <style>
          {`
            @import url('https://fonts.googleapis.com/css2?family=Inter:wght@700;800&display=swap');
            .logo-text { font-family: 'Inter', 'Segoe UI', sans-serif; }
          `}
        </style>

        {/* حروف AC */}
        <text
          x="0"
          y={fontSize}
          className="logo-text"
          fontWeight="800"
          fontSize={fontSize}
          fill={primary}
          letterSpacing="-3"
        >
          AC
        </text>

        {/* زیرنویس */}
        {showTagline && (
          <text
            x="0"
            y={fontSize + gap + taglineSize}
            className="logo-text"
            fontWeight="700"
            fontSize={taglineSize}
            fill={secondary}
            letterSpacing="4"
          >
            ASSISTANT ENGINEER SYSTEM
          </text>
        )}
      </svg>
    </div>
  );
}