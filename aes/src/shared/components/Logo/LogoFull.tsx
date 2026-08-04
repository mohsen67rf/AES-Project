// src/shared/components/Logo/LogoFull.tsx

export function LogoFull({ 
  size = 48, 
  className = '',
  variant = 'dark'
}: { 
  size?: number; 
  className?: string;
  variant?: 'light' | 'dark';
}) {
  return (
    <div className={`flex items-center gap-3 ${className}`}>
      {/* خود لوگو رو بعداً اضافه می‌کنیم، فعلاً یه جایگزین ساده */}
      <div 
        style={{ width: size, height: size }}
        className="bg-brand-primary rounded-xl flex items-center justify-center text-white font-bold text-2xl"
      >
        AES
      </div>
      
      <div className="flex flex-col">
        <span className={`font-bold text-xl tracking-tight ${variant === 'dark' ? 'text-gray-800' : 'text-white'}`}>
          AES
        </span>
        <div className={`text-[7px] tracking-[0.2em] font-medium ${variant === 'dark' ? 'text-gray-400' : 'text-gray-300'}`}>
          MINING MANAGEMENT SYSTEM
        </div>
      </div>
    </div>
  );
}