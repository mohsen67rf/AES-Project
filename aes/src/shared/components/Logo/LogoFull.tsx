// src/shared/components/Logo/LogoFull.tsx

interface LogoFullProps {
  size?: number;
  className?: string;
  variant?: 'dark' | 'light' | 'dashboard';
}

export function LogoFull({ 
  size = 48, 
  className = '',
  variant = 'dark'
}: LogoFullProps) {
  const isDashboard = variant === 'dashboard';
  
  const getColors = () => {
    if (isDashboard) {
      return {
        bg: 'bg-gradient-to-br from-[#C9A227] to-[#A07A15]',
        text: 'text-white',
        subText: 'text-[#4A6A8A]',
        border: 'border-[#C9A227]/30',
      };
    }
    if (variant === 'light') {
      return {
        bg: 'bg-white/10 backdrop-blur border border-white/20',
        text: 'text-white',
        subText: 'text-gray-300',
        border: 'border-white/20',
      };
    }
    return {
      bg: 'bg-gradient-to-br from-[#1A2A3A] to-[#2A3A5A]',
      text: 'text-white',
      subText: 'text-gray-400',
      border: 'border-[#1A2A3A]/30',
    };
  };

  const colors = getColors();

  return (
    <div className={`flex items-center gap-3 ${className}`}>
      <div 
        style={{ width: size, height: size }}
        className={`relative rounded-xl flex items-center justify-center font-bold text-xl shadow-lg ${colors.bg} ${colors.border}`}
      >
        <div className="absolute inset-0 rounded-xl overflow-hidden">
          <div className="absolute -top-1/2 -left-1/2 w-full h-full bg-gradient-to-br from-[#E8C84A]/20 to-transparent rotate-45" />
        </div>
        <span className={`relative z-10 ${colors.text}`}>A</span>
      </div>
      
      <div className="flex flex-col">
        <span className={`font-bold text-xl tracking-tight ${isDashboard ? 'text-[#C9A227]' : colors.text}`}>
          AES
        </span>
        <div className={`text-[7px] tracking-[0.2em] font-medium ${colors.subText}`}>
          {isDashboard ? 'دستیار مهندس معدن' : 'MINING MANAGEMENT SYSTEM'}
        </div>
      </div>
    </div>
  );
}

export default LogoFull;