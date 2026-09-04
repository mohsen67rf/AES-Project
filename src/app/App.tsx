// src/app/App.tsx

import React, { useState, useEffect, useRef } from 'react';
import { BrowserRouter, Routes, Route, Navigate, useParams, useLocation } from 'react-router-dom';
import { ThemeProvider } from '../shared/context/ThemeContext';
import { LanguageProvider } from '../shared/context/LanguageContext';
import { InfoTooltipProvider } from '../shared/components/InfoTooltip';
import { DashboardPage } from '../modules/dashboard/presentation/pages/DashboardPage';
import { ManagementDashboardPage } from '../modules/dashboard/presentation/pages/ManagementDashboardPage';
import { BlockManagementPage } from '../modules/mine/presentation/pages/BlockManagement';
import { MinePage } from '../modules/mine/presentation/pages/MinePage';
import { BlockDetailPage } from '../modules/mine/presentation/pages/BlockDetailPage';
import { PitsPage } from '../modules/mine/presentation/pages/PitsPage';
import MineMapPage from '../modules/mine/presentation/pages/MineMapPage';
import { UserManagementPage } from '../modules/auth/presentation/pages/UserManagementPage';
import { MiningLifecyclePage } from '../modules/mine/presentation/pages/MiningLifecyclePage';
import { WarehousePage } from '../modules/warehouse/presentation/pages/WarehousePage';
import { EquipmentPage } from '../modules/equipment/presentation/pages/EquipmentPage';
import { UnitWorkspacePage } from '../modules/workspace/presentation/pages/UnitWorkspacePage';
import { 
  UserRepository, 
  MineRepository, 
  initializeRepositories 
} from '../core/infrastructure/repositories';
import { SYSTEM_ROLES } from '../modules/auth/domain/roles';
import { ActivityLogger } from '../core/services/ActivityLogger';
import { LogoFull } from '../shared/components/Logo/LogoFull';
import type { User } from '../core/domain/types/mine.types';
import { Sparkles } from 'lucide-react';

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
      '/workspace': 'میز کار تخصصی واحدها و کاربران',
      '/unit-workspace': 'میز کار تخصصی واحدها و کاربران',
      '/dashboard': 'داشبورد اصلی عملیات معدن و میز کار واحد',
      '/management-dashboard': 'داشبورد مدیریت کلان و KPIها',
      '/blocks-management': 'مدیریت و طرح‌های استخراج بلوک‌ها',
      '/mining-lifecycle': 'چرخه ساب‌بلوک‌ها و خطوط خردایش',
      '/subblocks-lifecycle': 'چرخه ساب‌بلوک‌ها و خطوط خردایش',
      '/mine': 'بررسی جامع سایت معدن',
      '/mine/map': 'نقشه سه‌بعدی و توپوگرافی معدن',
      '/users': 'مدیریت پرسنل و دسترسی‌ها',
      '/personnel': 'مدیریت پرسنل و دسترسی‌ها',
      '/warehouse': 'انبار مواد ناریه و لجستیک سوخت معدن',
      '/equipment': 'مدیریت، رصد و جانمایی ماشین‌آلات معدنی',
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
  const [allSeedUsers, setAllSeedUsers] = useState<User[]>([]);

  // ============================================
  // مقداردهی اولیه
  // ============================================
  
  useEffect(() => {
    initializeRepositories();
    const users = UserRepository.getAll();
    setAllSeedUsers(users);
    
    let activeUser: User | null = null;
    const savedUser = localStorage.getItem('aes_session');
    if (savedUser) {
      try {
        activeUser = JSON.parse(savedUser);
      } catch {
        localStorage.removeItem('aes_session');
      }
    }

    if (!activeUser) {
      activeUser = users[1] || users[0] || {
        id: 'usr-02',
        code: 'ENG-201',
        fullName: 'دکتر علیرضا کاظمی',
        email: 'kazemi@aes-mining.ir',
        role: 'MiningEngineer',
        department: 'استخراج و فنی',
        isActive: true,
        phone: '09121110002',
        avatar: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=150&auto=format&fit=crop&q=80',
        createdAt: new Date().toISOString(),
      };
      localStorage.setItem('aes_session', JSON.stringify(activeUser));
    }
    setUser(activeUser);
  }, []);

  // ============================================
  // هندلر ورود مستقیم با نقش
  // ============================================

  const handleQuickRoleLogin = (targetUser: User) => {
    localStorage.setItem('aes_session', JSON.stringify(targetUser));
    setUser(targetUser);
    ActivityLogger.logLogin(targetUser);
  };

  // ============================================
  // هندلر ورود با فرم
  // ============================================

  const handleLogin = (e?: React.FormEvent) => {
    if (e) e.preventDefault();
    setLoading(true);
    setError('');

    try {
      const users = UserRepository.getAll();
      let foundUser = code ? users.find(u => u.code.toLowerCase() === code.trim().toLowerCase() || u.email.toLowerCase() === code.trim().toLowerCase()) : users[0];

      if (!foundUser) {
        foundUser = users[0];
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
      <div className="relative flex min-h-screen items-center justify-center bg-[#02040a] p-4 md:p-8 overflow-y-auto" dir="rtl">
        <GradientBackground />

        <div 
          onMouseEnter={() => setIsHovering(true)}
          onMouseLeave={() => setIsHovering(false)}
          className="relative z-10 overflow-hidden rounded-3xl p-6 md:p-8 shadow-2xl w-full max-w-2xl transition-all duration-700 ease-out my-8"
          style={{
            background: isHovering 
              ? 'rgba(10, 22, 40, 0.85)' 
              : 'rgba(10, 22, 40, 0.75)',
            backdropFilter: 'blur(24px)',
            WebkitBackdropFilter: 'blur(24px)',
            border: isHovering 
              ? '1px solid rgba(0, 212, 255, 0.5)' 
              : '1px solid rgba(170, 204, 221, 0.15)',
            boxShadow: isHovering 
              ? '0 0 60px rgba(0, 212, 255, 0.25), 0 0 120px rgba(0, 212, 255, 0.08)' 
              : '0 0 30px rgba(0, 212, 255, 0.05)',
          }}
        >
          <div className="text-center">
            <div className="mb-4 flex justify-center">
              <LogoFull variant="auth" size={42} />
            </div>

            <h2 className="text-lg md:text-xl font-black text-white">
              سامانه هوشمند و یکپارچه مهندسی و مدیریت معدن AES
            </h2>

            {/* Quick 1-Click Role Logins Grid */}
            <div className="mt-6 text-right">
              <div className="flex items-center justify-between mb-2.5">
                <span className="text-xs font-bold text-indigo-300 flex items-center gap-1.5">
                  <Sparkles className="w-4 h-4 text-indigo-400" />
                  <span>ورود سریع با نقش‌های سازمانی ۹ گانه:</span>
                </span>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-3 gap-2.5">
                {allSeedUsers.map((u, idx) => {
                  const roleDef = SYSTEM_ROLES.find(r => r.id.toLowerCase() === u.role.toLowerCase()) || SYSTEM_ROLES[0];
                  return (
                    <button
                      key={`seed-user-${u.id}-${u.code || idx}`}
                      onClick={() => handleQuickRoleLogin(u)}
                      className="p-3 rounded-2xl border border-slate-700/70 bg-slate-900/60 hover:bg-indigo-950/40 hover:border-indigo-500/70 text-right transition-all group flex flex-col justify-between gap-2 shadow-sm"
                    >
                      <div className="flex items-center justify-between">
                        <div className={`w-7 h-7 rounded-lg flex items-center justify-center text-xs font-bold border ${roleDef.badgeColor}`}>
                          <roleDef.icon className="w-3.5 h-3.5" />
                        </div>
                        <span className="text-[10px] font-mono text-slate-400 group-hover:text-indigo-300">{u.code}</span>
                      </div>

                      <div>
                        <h4 className="text-xs font-black text-white group-hover:text-indigo-300 leading-tight">
                          {u.fullName}
                        </h4>
                        <p className="text-[10px] text-indigo-400 font-bold mt-0.5">
                          {roleDef.nameFa}
                        </p>
                        <p className="text-[9px] text-slate-400 truncate mt-0.5">
                          {roleDef.department}
                        </p>
                      </div>
                    </button>
                  );
                })}
              </div>
            </div>

            {/* Divider */}
            <div className="relative my-6 text-center">
              <div className="absolute inset-0 flex items-center"><div className="w-full border-t border-slate-800" /></div>
              <span className="relative px-3 bg-[#0A1628] text-[11px] text-slate-400 font-bold">یا ورود با نام کاربری و رمز عبور</span>
            </div>

            {error && (
              <div className="mb-4 bg-red-500/10 border border-red-500/30 rounded-xl p-3 text-right">
                <p className="text-xs text-red-400">{error}</p>
              </div>
            )}

            <form onSubmit={handleLogin} className="space-y-3.5 text-right text-xs">
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div>
                  <label className="block font-bold text-slate-300 mb-1">کد یا ایمیل پرسنلی</label>
                  <input
                    type="text"
                    value={code}
                    onChange={(e) => setCode(e.target.value)}
                    placeholder="ENG-201 یا ایمیل"
                    className="w-full px-3.5 py-2.5 bg-slate-900/80 border border-slate-700/60 rounded-xl text-white placeholder-slate-500 focus:outline-none focus:ring-2 focus:ring-indigo-500 font-mono"
                  />
                </div>

                <div>
                  <label className="block font-bold text-slate-300 mb-1">رمز عبور</label>
                  <input
                    type="password"
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    placeholder="اختیاری جهت ورود آزمایشی"
                    className="w-full px-3.5 py-2.5 bg-slate-900/80 border border-slate-700/60 rounded-xl text-white placeholder-slate-500 focus:outline-none focus:ring-2 focus:ring-indigo-500 font-mono"
                  />
                </div>
              </div>

              <button
                type="submit"
                disabled={loading}
                className="w-full py-2.5 bg-gradient-to-r from-indigo-600 via-purple-600 to-indigo-700 hover:from-indigo-500 hover:to-purple-500 text-white font-black rounded-xl transition-all duration-300 shadow-lg shadow-indigo-600/30 active:scale-95 disabled:opacity-50 cursor-pointer"
              >
                {loading ? 'در حال ورود...' : 'ورود مستقیم به سامانه'}
              </button>
            </form>

            <p className="text-[10px] text-slate-500 mt-5">© ۱۴۰۵ - سامانه یکپارچه مهندسی و مدیریت چرخه معدن AES Mining</p>
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
        <InfoTooltipProvider defaultDelayMs={2000}>
          <BrowserRouter>
            <NavigationAuditTracker currentUser={user} />
            <Routes>
              <Route path="/" element={<Navigate to="/dashboard" replace />} />
              <Route path="/workspace" element={<UnitWorkspacePage />} />
              <Route path="/unit-workspace" element={<UnitWorkspacePage />} />
              <Route path="/dashboard" element={<DashboardPage user={user} onLogout={handleLogout} />} />
              <Route path="/management-dashboard" element={<ManagementDashboardPage />} />
              <Route path="/blocks-management" element={<BlockManagementPage />} />
              <Route path="/warehouse" element={<WarehousePage />} />
              <Route path="/equipment" element={<EquipmentPage />} />
              <Route path="/mining-lifecycle" element={<MiningLifecyclePage />} />
              <Route path="/subblocks-lifecycle" element={<MiningLifecyclePage />} />
              <Route path="/users" element={<UserManagementPage />} />
              <Route path="/personnel" element={<UserManagementPage />} />
              <Route path="/mine" element={<MinePage mineId={defaultMineId} />} />
              <Route path="/mine/map" element={<MineMapPage />} />
              <Route path="/mine/:mineId/pits" element={<PitsPage />} />
              <Route path="/block/:blockId" element={<BlockDetailPageWrapper />} />
              <Route path="*" element={<Navigate to="/dashboard" replace />} />
            </Routes>
          </BrowserRouter>
        </InfoTooltipProvider>
      </LanguageProvider>
    </ThemeProvider>
  );
}

export default App;
