// src/app/App.tsx

import { useState, useEffect, useRef } from 'react';
import { BrowserRouter, Routes, Route, Navigate, useParams } from 'react-router-dom';
import { ThemeProvider } from '../shared/context/ThemeContext';
import { LanguageProvider } from '../shared/context/LanguageContext';
import { DashboardPage } from '../modules/dashboard/presentation/pages/DashboardPage';
import { ManagementDashboardPage } from '../modules/dashboard/presentation/pages/ManagementDashboardPage';
import { BlockManagementPage } from '../modules/mine/presentation/pages/BlockManagement';
import { MinePage } from '../modules/mine/presentation/pages/Minepage';
import { BlockDetailPage } from '../modules/mine/presentation/pages/BlockDetailPage';
import { PitsPage } from '../modules/mine/presentation/pages/PitsPage';
import   MineMapPage  from '../modules/mine/presentation/pages/MineMapPage';
import { 
  UserRepository, 
  MineRepository, 
  initializeRepositories 
} from '../core/infrastructure/repositories';
import type { User } from '../core/domain/types/mine.types';

// ============================================
// کامپوننت گرادیانت پس‌زمینه
// ============================================

function GradientBackground() {
  const canvasRef = useRef<HTMLCanvasElement>(null);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    let width = window.innerWidth;
    let height = window.innerHeight;

    const resize = () => {
      width = window.innerWidth;
      height = window.innerHeight;
      canvas.width = width;
      canvas.height = height;
    };

    window.addEventListener('resize', resize);
    resize();

    const gradient = ctx.createLinearGradient(0, 0, 0, height);
    gradient.addColorStop(0, '#0a1628');
    gradient.addColorStop(0.5, '#060e1a');
    gradient.addColorStop(1, '#02040a');
    ctx.fillStyle = gradient;
    ctx.fillRect(0, 0, width, height);

    return () => {
      window.removeEventListener('resize', resize);
    };
  }, []);

  return (
    <canvas
      ref={canvasRef}
      className="fixed inset-0"
      style={{ zIndex: 0, width: '100%', height: '100%' }}
    />
  );
}

// ============================================
// کامپوننت Wrapper برای BlockDetailPage
// ============================================

function BlockDetailPageWrapper() {
  const { blockId } = useParams<{ blockId: string }>();
  
  if (!blockId) {
    return <Navigate to="/blocks-management" replace />;
  }
  
  return <BlockDetailPage blockId={blockId} />;
}

// ============================================
// کامپوننت اصلی
// ============================================

function App() {
  const [user, setUser] = useState<User | null>(null);
  const [code, setCode] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [isHovering, setIsHovering] = useState(false);

  // ============================================
  // مقداردهی اولیه
  // ============================================
  
  useEffect(() => {
    initializeRepositories();
    
    const savedUser = localStorage.getItem('aes_session');
    if (savedUser) {
      try {
        setUser(JSON.parse(savedUser));
      } catch {
        localStorage.removeItem('aes_session');
      }
    }
  }, []);

  // ============================================
  // هندلر ورود
  // ============================================

  const handleLogin = (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError('');

    try {
      const foundUser = UserRepository.findOne('code', code);

      if (!foundUser) {
        setError('کد کاربری یا رمز عبور اشتباه است');
        setLoading(false);
        return;
      }

      if (!foundUser.isActive) {
        setError('حساب کاربری شما غیرفعال شده است');
        setLoading(false);
        return;
      }

      if (foundUser.password !== password) {
        setError('کد کاربری یا رمز عبور اشتباه است');
        setLoading(false);
        return;
      }

      localStorage.setItem('aes_session', JSON.stringify(foundUser));
      setUser(foundUser);
    } catch (err) {
      setError('خطا در ارتباط با دیتابیس');
    } finally {
      setLoading(false);
    }
  };

  // ============================================
  // هندلر خروج
  // ============================================

  const handleLogout = () => {
    localStorage.removeItem('aes_session');
    setUser(null);
    setCode('');
    setPassword('');
  };

  // ============================================
  // دریافت معدن پیش‌فرض
  // ============================================

  const mines = MineRepository.getAll();
  const defaultMineId = mines.length > 0 ? mines[0].id : '';

  // ============================================
  // صفحه ورود
  // ============================================

  if (!user) {
    return (
      <div className="relative flex min-h-screen items-center justify-center bg-[#02040a] p-4 overflow-hidden">
        <GradientBackground />

        <div 
          onMouseEnter={() => setIsHovering(true)}
          onMouseLeave={() => setIsHovering(false)}
          className="relative z-10 overflow-hidden rounded-3xl p-8 shadow-2xl w-full max-w-md transition-all duration-700 ease-out"
          style={{
            background: isHovering 
              ? 'rgba(10, 22, 40, 0.7)' 
              : 'rgba(10, 22, 40, 0.5)',
            backdropFilter: 'blur(24px)',
            WebkitBackdropFilter: 'blur(24px)',
            border: isHovering 
              ? '1px solid rgba(0, 212, 255, 0.5)' 
              : '1px solid rgba(170, 204, 221, 0.08)',
            boxShadow: isHovering 
              ? '0 0 60px rgba(0, 212, 255, 0.25), 0 0 120px rgba(0, 212, 255, 0.08), inset 0 0 60px rgba(0, 212, 255, 0.05)' 
              : '0 0 30px rgba(0, 212, 255, 0.05), 0 0 60px rgba(0, 212, 255, 0.02)',
            transition: 'all 0.7s cubic-bezier(0.2, 0.8, 0.4, 1)',
          }}
        >
          <div 
            className="absolute -inset-[2px] rounded-3xl transition-opacity duration-700"
            style={{
              opacity: isHovering ? 1 : 0,
              background: 'linear-gradient(135deg, rgba(0, 212, 255, 0.4), rgba(170, 204, 221, 0.1), rgba(0, 212, 255, 0.4))',
              filter: 'blur(8px)',
            }}
          />

          <div className="relative z-10 text-center">
            <div className="mb-6">
              <img 
                src="/logo.png" 
                alt="AES" 
                className="mx-auto"
                style={{ width: '320px', height: 'auto', display: 'block' }}
              />
            </div>

            <h1 className="text-2xl font-bold text-white">به AES خوش آمدی</h1>
            <p className="text-[#8A9DB0] text-sm mt-2">سامانه‌ی دستیار مهندس معدن</p>

            {error && (
              <div className="mt-4 bg-red-500/10 border border-red-500/30 rounded-xl p-3">
                <p className="text-sm text-red-400">{error}</p>
              </div>
            )}

            <form onSubmit={handleLogin} className="mt-6 space-y-4 text-right">
              <div>
                <label className="block text-sm font-medium text-[#8A9DB0] mb-1">کد کاربری</label>
                <input
                  type="text"
                  value={code}
                  onChange={(e) => setCode(e.target.value)}
                  required
                  placeholder="مثال: AES-1001"
                  className="w-full px-4 py-2 bg-white/5 border border-white/10 rounded-xl text-white placeholder-[#4A6A8A] focus:outline-none focus:ring-2 focus:ring-[#00D4FF]/50 focus:border-[#00D4FF]/50"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-[#8A9DB0] mb-1">رمز عبور</label>
                <input
                  type="password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  required
                  placeholder="••••••••"
                  className="w-full px-4 py-2 bg-white/5 border border-white/10 rounded-xl text-white placeholder-[#4A6A8A] focus:outline-none focus:ring-2 focus:ring-[#00D4FF]/50 focus:border-[#00D4FF]/50"
                />
              </div>

              <button
                type="submit"
                disabled={loading}
                className="w-full py-2.5 bg-gradient-to-r from-[#00D4FF] to-[#0099CC] text-white font-semibold rounded-xl transition-all duration-300 hover:shadow-lg hover:shadow-[#00D4FF]/30 disabled:opacity-50"
              >
                {loading ? 'در حال ورود...' : 'ورود به سامانه'}
              </button>
            </form>

            <p className="text-xs text-[#4A6A8A] mt-6">© ۱۴۰۴ - سامانه جامع مدیریت معادن</p>
          </div>
        </div>
      </div>
    );
  }

  // ============================================
  // کاربر وارد شده: مسیریابی
  // ============================================

  return (
    <ThemeProvider>
      <LanguageProvider>
        <BrowserRouter>
          <Routes>
            <Route path="/" element={<Navigate to="/dashboard" replace />} />
            <Route path="/dashboard" element={<DashboardPage user={user} onLogout={handleLogout} />} />
            <Route path="/management-dashboard" element={<ManagementDashboardPage />} />
            <Route path="/blocks-management" element={<BlockManagementPage />} />
            <Route path="/mine" element={<MinePage mineId={defaultMineId} />} />
            <Route path="/mine/map" element={<MineMapPage />} />  // ✅ مسیر جدید
            <Route path="/mine/:mineId/pits" element={<PitsPage />} />
            <Route path="/block/:blockId" element={<BlockDetailPageWrapper />} />
            <Route path="*" element={<Navigate to="/dashboard" replace />} />
            <Route path="/blocks/new" element={<div>صفحه افزودن بلوک</div>} />
          </Routes>
        </BrowserRouter>
      </LanguageProvider>
    </ThemeProvider>
  );
}

export default App;