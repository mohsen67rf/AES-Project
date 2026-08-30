// src/app/App.tsx

import { useState, useEffect, useRef } from 'react';
import { BrowserRouter, Routes, Route, Navigate, useParams, useLocation } from 'react-router-dom';
import { ThemeProvider } from '../shared/context/ThemeContext';
import { LanguageProvider } from '../shared/context/LanguageContext';
import { DashboardPage } from '../modules/dashboard/presentation/pages/DashboardPage';
import { ManagementDashboardPage } from '../modules/dashboard/presentation/pages/ManagementDashboardPage';
import { BlockManagementPage } from '../modules/mine/presentation/pages/BlockManagement';
import { MinePage } from '../modules/mine/presentation/pages/MinePage';
import { BlockDetailPage } from '../modules/mine/presentation/pages/BlockDetailPage';
import { PitsPage } from '../modules/mine/presentation/pages/PitsPage';
import MineMapPage from '../modules/mine/presentation/pages/MineMapPage';
import { UserManagementPage } from '../modules/auth/presentation/pages/UserManagementPage';
import { MiningLifecyclePage } from '../modules/mine/presentation/pages/MiningLifecyclePage';
import { 
  UserRepository, 
  MineRepository, 
  initializeRepositories 
} from '../core/infrastructure/repositories';
import { ActivityLogger } from '../core/services/ActivityLogger';
import { LogoFull } from '../shared/components/Logo/LogoFull';
import type { User } from '../core/domain/types/mine.types';

// ============================================
// کامپوننت ردگیری خودکار پیمایش معدن و صفحات
// ============================================

function NavigationAuditTracker({ currentUser }: { currentUser: User | null }) {
  const location = useLocation();
  const prevPathRef = useRef<string>('');

  useEffect(() => {
    const currentPath = location.pathname;
    if (prevPathRef.current === currentPath) return;
    prevPathRef.current = currentPath;

    const pageTitles: Record<string, string> = {
      '/dashboard': 'داشبورد اصلی عملیات معدن',
      '/management-dashboard': 'داشبورد مدیریت کلان و KPIها',
      '/blocks-management': 'مدیریت و طرح‌های استخراج بلوک‌ها',
      '/mining-lifecycle': 'چرخه ساب‌بلوک‌ها و خطوط خردایش',
      '/subblocks-lifecycle': 'چرخه ساب‌بلوک‌ها و خطوط خردایش',
      '/mine': 'بررسی جامع سایت معدن',
      '/mine/map': 'نقشه سه‌بعدی و توپوگرافی معدن',
      '/users': 'مدیریت پرسنل و دسترسی‌ها',
      '/personnel': 'مدیریت پرسنل و دسترسی‌ها',
    };

    let title = pageTitles[currentPath];
    if (!title) {
      if (currentPath.startsWith('/block/')) {
        const id = currentPath.split('/')[2];
        title = `جزئیات بلوک معدنی (${id})`;
      } else if (currentPath.includes('/pits')) {
        title = 'پیت‌ها و جبهه‌کارهای معدن';
      } else {
        title = `صفحه ${currentPath}`;
      }
    }

    ActivityLogger.logNavigation(currentPath, title, currentUser);
  }, [location.pathname, currentUser]);

  return null;
}

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
    
    let activeUser: User | null = null;
    const savedUser = localStorage.getItem('aes_session');
    if (savedUser) {
      try {
        activeUser = JSON.parse(savedUser);
      } catch {
        localStorage.removeItem('aes_session');
      }
    }

    // ورود خودکار با کاربر پیش‌فرض مدیر سیستم جهت دسترسی آسان
    if (!activeUser) {
      const users = UserRepository.getAll();
      activeUser = users[0] || {
        id: '1',
        code: 'AES-1001',
        fullName: 'مدیر سیستم',
        email: 'admin@aes.com',
        password: 'admin',
        role: 'Manager',
        isActive: true,
        createdAt: new Date().toISOString(),
      };
      localStorage.setItem('aes_session', JSON.stringify(activeUser));
    }
    setUser(activeUser);
  }, []);

  // ============================================
  // هندلر ورود
  // ============================================

  const handleLogin = (e?: React.FormEvent) => {
    if (e) e.preventDefault();
    setLoading(true);
    setError('');

    try {
      const users = UserRepository.getAll();
      let foundUser = code ? users.find(u => u.code.toLowerCase() === code.trim().toLowerCase()) : users[0];

      if (!foundUser) {
        foundUser = users[0] || {
          id: '1',
          code: 'AES-1001',
          fullName: 'مدیر سیستم',
          email: 'admin@aes.com',
          password: 'admin',
          role: 'Manager',
          isActive: true,
          createdAt: new Date().toISOString(),
        };
      }

      localStorage.setItem('aes_session', JSON.stringify(foundUser));
      setUser(foundUser);
      ActivityLogger.logLogin(foundUser);
    } catch (err) {
      setError('خطا در ورود به سامانه');
    } finally {
      setLoading(false);
    }
  };

  // ============================================
  // هندلر خروج
  // ============================================

  const handleLogout = () => {
    if (user) {
      ActivityLogger.logLogout(user);
    }
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
            <div className="mb-6 flex justify-center">
              <LogoFull variant="auth" />
            </div>

            {error && (
              <div className="mt-4 bg-red-500/10 border border-red-500/30 rounded-xl p-3">
                <p className="text-sm text-red-400">{error}</p>
              </div>
            )}

            <form onSubmit={handleLogin} className="mt-6 space-y-4 text-right">
              <div>
                <label className="block text-xs font-bold text-slate-300 mb-1">کد کاربری</label>
                <input
                  type="text"
                  value={code}
                  onChange={(e) => setCode(e.target.value)}
                  placeholder="AES-1001 (پیش‌فرض: مدیر سیستم)"
                  className="w-full px-4 py-2.5 bg-slate-900/60 border border-slate-700/60 rounded-xl text-white placeholder-slate-500 focus:outline-none focus:ring-2 focus:ring-[#7C3AED]/60 text-xs"
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-300 mb-1">رمز عبور</label>
                <input
                  type="password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder="اختیاری جهت ورود آزمایشی"
                  className="w-full px-4 py-2.5 bg-slate-900/60 border border-slate-700/60 rounded-xl text-white placeholder-slate-500 focus:outline-none focus:ring-2 focus:ring-[#7C3AED]/60 text-xs"
                />
              </div>

              <button
                type="submit"
                disabled={loading}
                className="w-full py-3 bg-gradient-to-r from-[#6366F1] to-[#7C3AED] hover:from-[#4F46E5] hover:to-[#6D28D9] text-white font-bold rounded-xl transition-all duration-300 shadow-lg shadow-[#6366F1]/30 active:scale-95 disabled:opacity-50 cursor-pointer text-xs"
              >
                {loading ? 'در حال ورود...' : 'ورود مستقیم به سامانه مدیریت معدن'}
              </button>
            </form>

            <p className="text-[11px] text-slate-500 mt-6">© ۱۴۰۵ - AES Mining Management System</p>
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
          <NavigationAuditTracker currentUser={user} />
          <Routes>
            <Route path="/" element={<Navigate to="/dashboard" replace />} />
            <Route path="/dashboard" element={<DashboardPage user={user} onLogout={handleLogout} />} />
            <Route path="/management-dashboard" element={<ManagementDashboardPage />} />
            <Route path="/blocks-management" element={<BlockManagementPage />} />
            <Route path="/mining-lifecycle" element={<MiningLifecyclePage />} />
            <Route path="/subblocks-lifecycle" element={<MiningLifecyclePage />} />
            <Route path="/users" element={<UserManagementPage />} />
            <Route path="/personnel" element={<UserManagementPage />} />
            <Route path="/mine" element={<MinePage mineId={defaultMineId} />} />
            <Route path="/mine/map" element={<MineMapPage />} />
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