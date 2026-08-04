// src/app/App.tsx

import { useState, useEffect, useRef } from 'react';
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { DashboardPage } from '../modules/dashboard/presentation/pages/DashboardPage';
import { MinePage } from '../modules/mine/presentation/pages/MinePage';
import { BlocksPage } from '../modules/mine/presentation/pages/BlocksPage';
import { BlockDetailPage } from '../modules/mine/presentation/pages/BlockDetailPage';
import { ThemeProvider } from '../shared/context/ThemeContext';

// ============================================
// نوع‌های داده
// ============================================

interface User {
  id: string;
  code: string;
  fullName: string;
  email: string;
  password: string;
  role: string;
  isActive: boolean;
  createdAt: string;
}

// ============================================
// سرویس دیتابیس کاربران
// ============================================

const DB_KEY = 'aes_users';

function getUsers(): User[] {
  try {
    const data = localStorage.getItem(DB_KEY);
    return data ? JSON.parse(data) : [];
  } catch {
    return [];
  }
}

function saveUsers(users: User[]): void {
  localStorage.setItem(DB_KEY, JSON.stringify(users));
}

function findUserByCode(code: string): User | null {
  const users = getUsers();
  return users.find(u => u.code === code) || null;
}

// ============================================
// سرویس‌های معدن (داخل خود فایل)
// ============================================

const MINES_KEY = 'aes_mines';

function getMines(): any[] {
  try {
    const data = localStorage.getItem(MINES_KEY);
    return data ? JSON.parse(data) : [];
  } catch {
    return [];
  }
}

function initializeMineData(): void {
  const mines = getMines();
  if (mines.length === 0) {
    const newMine = {
      id: crypto.randomUUID(),
      name: 'معدن سنگ آهن مرکزی',
      code: 'MI-001',
      location: 'استان یزد، شهرستان بافق',
      status: 'فعال',
      createdAt: new Date().toISOString(),
    };
    localStorage.setItem(MINES_KEY, JSON.stringify([newMine]));
    console.log('✅ معدن پیش‌فرض ساخته شد');
  }
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
  // ساخت کاربر تستی
  // ============================================
  useEffect(() => {
    const users = getUsers();
    const testUserExists = users.some(u => u.code === 'AES-1001');
    
    if (!testUserExists) {
      users.push({
        id: '1',
        code: 'AES-1001',
        fullName: 'مدیر سیستم',
        email: 'admin@aes.com',
        password: '123456',
        role: 'Manager',
        isActive: true,
        createdAt: new Date().toISOString(),
      });
      saveUsers(users);
      console.log('✅ کاربر تستی با موفقیت ساخته شد');
    }
  }, []);

  // بررسی نشست کاربر
  useEffect(() => {
    const savedUser = localStorage.getItem('aes_session');
    if (savedUser) {
      try {
        setUser(JSON.parse(savedUser));
      } catch {
        localStorage.removeItem('aes_session');
      }
    }
  }, []);

  const handleLogin = (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError('');

    try {
      const foundUser = findUserByCode(code);

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
    } catch {
      setError('خطا در ارتباط با دیتابیس');
    } finally {
      setLoading(false);
    }
  };

  const handleLogout = () => {
    localStorage.removeItem('aes_session');
    setUser(null);
    setCode('');
    setPassword('');
  };

  // ============================================
  // مقداردهی اولیه داده‌ها
  // ============================================

  initializeMineData();
  const mines = getMines();
  const defaultMineId = mines.length > 0 ? mines[0].id : '';

  // ============================================
  // اگر کاربر وارد شده، مسیریابی رو نشون بده
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
              ? '1px solid rgba(56, 130, 246, 0.5)' 
              : '1px solid rgba(170, 204, 221, 0.08)',
            boxShadow: isHovering 
              ? '0 0 60px rgba(56, 130, 246, 0.25), 0 0 120px rgba(56, 130, 246, 0.08), inset 0 0 60px rgba(56, 130, 246, 0.05)' 
              : '0 0 30px rgba(56, 130, 246, 0.05), 0 0 60px rgba(56, 130, 246, 0.02)',
            transition: 'all 0.7s cubic-bezier(0.2, 0.8, 0.4, 1)',
          }}
        >
          <div 
            className="absolute -inset-[2px] rounded-3xl transition-opacity duration-700"
            style={{
              opacity: isHovering ? 1 : 0,
              background: 'linear-gradient(135deg, rgba(56, 130, 246, 0.4), rgba(170, 204, 221, 0.1), rgba(56, 130, 246, 0.4))',
              filter: 'blur(8px)',
            }}
          />

          <div 
            className="absolute top-4 right-4 w-1.5 h-1.5 rounded-full transition-all duration-700"
            style={{
              background: isHovering ? 'rgba(56, 130, 246, 0.9)' : 'rgba(56, 130, 246, 0.1)',
              boxShadow: isHovering ? '0 0 20px rgba(56, 130, 246, 0.8), 0 0 40px rgba(56, 130, 246, 0.4)' : 'none',
            }}
          />
          <div 
            className="absolute top-4 left-4 w-1.5 h-1.5 rounded-full transition-all duration-700"
            style={{
              background: isHovering ? 'rgba(56, 130, 246, 0.9)' : 'rgba(56, 130, 246, 0.1)',
              boxShadow: isHovering ? '0 0 20px rgba(56, 130, 246, 0.8), 0 0 40px rgba(56, 130, 246, 0.4)' : 'none',
            }}
          />
          <div 
            className="absolute bottom-4 right-4 w-1.5 h-1.5 rounded-full transition-all duration-700"
            style={{
              background: isHovering ? 'rgba(56, 130, 246, 0.9)' : 'rgba(56, 130, 246, 0.1)',
              boxShadow: isHovering ? '0 0 20px rgba(56, 130, 246, 0.8), 0 0 40px rgba(56, 130, 246, 0.4)' : 'none',
            }}
          />
          <div 
            className="absolute bottom-4 left-4 w-1.5 h-1.5 rounded-full transition-all duration-700"
            style={{
              background: isHovering ? 'rgba(56, 130, 246, 0.9)' : 'rgba(56, 130, 246, 0.1)',
              boxShadow: isHovering ? '0 0 20px rgba(56, 130, 246, 0.8), 0 0 40px rgba(56, 130, 246, 0.4)' : 'none',
            }}
          />

          <div className="relative z-10 text-center">
            <div className="mb-6">
              <img 
                src="/logo.png" 
                alt="ACSS" 
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
                  className="w-full px-4 py-2 bg-white/5 border border-white/10 rounded-xl text-white placeholder-[#4A6A8A] focus:outline-none focus:ring-2 focus:ring-[#3882F6]/50 focus:border-[#3882F6]/50"
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
                  className="w-full px-4 py-2 bg-white/5 border border-white/10 rounded-xl text-white placeholder-[#4A6A8A] focus:outline-none focus:ring-2 focus:ring-[#3882F6]/50 focus:border-[#3882F6]/50"
                />
              </div>

              <button
                type="submit"
                disabled={loading}
                className="w-full py-2.5 bg-gradient-to-r from-[#3882F6] to-[#2563EB] text-white font-semibold rounded-xl transition-all duration-300 disabled:opacity-50"
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
  // کاربر وارد شده: مسیریابی با ThemeProvider
  // ============================================

  return (
    <ThemeProvider>
      <BrowserRouter>
        <Routes>
          <Route path="/" element={<Navigate to="/dashboard" replace />} />
          <Route path="/dashboard" element={<DashboardPage user={user} onLogout={handleLogout} />} />
          <Route path="/mine" element={<MinePage mineId={defaultMineId} />} />
          <Route path="/blocks" element={<BlocksPage />} />
          <Route path="/block/:blockId" element={<BlockDetailPage />} />
          <Route path="*" element={<Navigate to="/dashboard" replace />} />
        </Routes>
      </BrowserRouter>
    </ThemeProvider>
  );
}

export default App;