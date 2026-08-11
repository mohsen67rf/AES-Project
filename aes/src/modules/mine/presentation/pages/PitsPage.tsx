// src/modules/mine/presentation/pages/PitsPage.tsx

import { useState, useEffect, useMemo } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { 
  PlusIcon, 
  MagnifyingGlassIcon, 
  TrashIcon,
  PencilIcon,
  MapPinIcon,
  ArrowPathIcon
} from '@heroicons/react/24/outline';
import { useTheme } from '../../../../shared/context/ThemeContext';
import { PitRepository, MineRepository } from '../../../../core/infrastructure/repositories';
import { PageHeader } from '../components/PageHeader/PageHeader';
import { Table } from '../../../../shared/components/Table/Table';
import type { Pit, Mine } from '../../../../core/domain/types/mine.types';

// ============================================
// کامپوننت مدیریت پیت‌ها
// ============================================

export function PitsPage() {
  const { mineId } = useParams<{ mineId: string }>();
  const navigate = useNavigate();
  const { isDark } = useTheme();
  
  const [mine, setMine] = useState<Mine | null>(null);
  const [pits, setPits] = useState<Pit[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');
  const [showAddModal, setShowAddModal] = useState(false);
  const [editingPit, setEditingPit] = useState<Pit | null>(null);
  
  // ===== فرم افزودن/ویرایش =====
  const [formData, setFormData] = useState({
    name: '',
    code: '',
    status: 'فعال' as 'فعال' | 'غیرفعال',
  });

  // ===== بارگذاری داده =====
  const loadData = () => {
    setLoading(true);
    if (mineId) {
      const mineData = MineRepository.getById(mineId);
      setMine(mineData);
      if (mineData) {
        const pitsData = PitRepository.findBy('mineId', mineData.id);
        setPits(pitsData);
      }
    }
    setLoading(false);
  };

  useEffect(() => {
    loadData();
  }, [mineId]);

  // ===== فیلتر =====
  const filteredPits = useMemo(() => {
    if (!searchQuery.trim()) return pits;
    const q = searchQuery.trim().toLowerCase();
    return pits.filter(p => 
      p.name.toLowerCase().includes(q) || 
      p.code.toLowerCase().includes(q)
    );
  }, [pits, searchQuery]);

  // ===== عملیات CRUD =====
  const handleAddPit = () => {
    if (!mine) return;
    if (!formData.name.trim() || !formData.code.trim()) {
      alert('نام و کد پیت الزامی است');
      return;
    }

    const newPit: Pit = {
      id: crypto.randomUUID(),
      mineId: mine.id,
      name: formData.name.trim(),
      code: formData.code.trim(),
      status: formData.status,
      createdAt: new Date().toISOString(),
    };

    PitRepository.save(newPit);
    setShowAddModal(false);
    setFormData({ name: '', code: '', status: 'فعال' });
    loadData();
  };

  const handleEditPit = (pit: Pit) => {
    setEditingPit(pit);
    setFormData({
      name: pit.name,
      code: pit.code,
      status: pit.status,
    });
    setShowAddModal(true);
  };

  const handleUpdatePit = () => {
    if (!editingPit) return;
    if (!formData.name.trim() || !formData.code.trim()) {
      alert('نام و کد پیت الزامی است');
      return;
    }

    const updatedPit: Pit = {
      ...editingPit,
      name: formData.name.trim(),
      code: formData.code.trim(),
      status: formData.status,
    };

    PitRepository.save(updatedPit);
    setShowAddModal(false);
    setEditingPit(null);
    setFormData({ name: '', code: '', status: 'فعال' });
    loadData();
  };

  const handleDeletePit = (pitId: string) => {
    if (window.confirm('آیا از حذف این پیت اطمینان دارید؟')) {
      PitRepository.delete(pitId);
      loadData();
    }
  };

  // ===== ستون‌های جدول =====
  const columns = [
    {
      key: 'name',
      header: 'نام پیت',
      render: (item: Pit) => (
        <div className="flex items-center gap-3">
          <div className="w-8 h-8 rounded-lg bg-[#AACCDD]/10 flex items-center justify-center">
            <MapPinIcon className="w-4 h-4 text-[#AACCDD]" />
          </div>
          <div>
            <p className="text-white font-medium">{item.name}</p>
            <p className="text-[#8A9DB0] text-xs">{item.code}</p>
          </div>
        </div>
      ),
    },
    {
      key: 'status',
      header: 'وضعیت',
      render: (item: Pit) => (
        <span className={`px-3 py-1 rounded-full text-xs font-medium ${
          item.status === 'فعال' 
            ? 'bg-green-500/20 text-green-400 border border-green-500/20'
            : 'bg-red-500/20 text-red-400 border border-red-500/20'
        }`}>
          {item.status}
        </span>
      ),
    },
    {
      key: 'createdAt',
      header: 'تاریخ ایجاد',
      render: (item: Pit) => (
        <span className="text-[#8A9DB0] text-sm">
          {new Date(item.createdAt).toLocaleDateString('fa-IR')}
        </span>
      ),
    },
    {
      key: 'actions',
      header: 'عملیات',
      render: (item: Pit) => (
        <div className="flex items-center gap-2">
          <button
            onClick={() => handleEditPit(item)}
            className="p-1.5 rounded-lg hover:bg-blue-500/20 text-blue-400 transition-colors"
          >
            <PencilIcon className="w-4 h-4" />
          </button>
          <button
            onClick={() => handleDeletePit(item.id)}
            className="p-1.5 rounded-lg hover:bg-red-500/20 text-red-400 transition-colors"
          >
            <TrashIcon className="w-4 h-4" />
          </button>
        </div>
      ),
    },
  ];

  // ===== وضعیت بارگذاری =====
  if (loading) {
    return (
      <div className="flex items-center justify-center h-64 text-[#8A9DB0]">
        در حال بارگذاری...
      </div>
    );
  }

  if (!mine) {
    return (
      <div className="flex items-center justify-center h-64 text-red-400">
        معدن مورد نظر یافت نشد!
      </div>
    );
  }

  // ===== رندر =====
  return (
    <div className={`${isDark ? 'bg-[#0A1628]' : 'bg-gray-50'} min-h-screen p-6 transition-colors duration-300`}>
      <div className="space-y-6 max-w-7xl mx-auto">
        
        {/* هدر */}
        <PageHeader
          title={`مدیریت پیت‌های ${mine.name}`}
          subtitle={`${mine.code} | ${pits.length} پیت`}
          onBack={() => navigate('/mine')}
          onRefresh={loadData}
          actions={
            <button
              onClick={() => {
                setEditingPit(null);
                setFormData({ name: '', code: '', status: 'فعال' });
                setShowAddModal(true);
              }}
              className="px-4 py-2 bg-[#AACCDD] text-[#1A2A3A] rounded-xl hover:bg-[#8A9DB0] transition-colors flex items-center gap-2"
            >
              <PlusIcon className="w-4 h-4" />
              افزودن پیت
            </button>
          }
        />

        {/* جستجو */}
        <div className="relative">
          <MagnifyingGlassIcon className="absolute right-3 top-1/2 -translate-y-1/2 w-5 h-5 text-[#4A6A8A]" />
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="جستجوی پیت..."
            className="w-full pr-12 pl-4 py-3 rounded-xl border bg-white/5 border-[#AACCDD]/10 text-white placeholder-[#4A6A8A] focus:border-[#AACCDD]/30 focus:outline-none"
          />
        </div>

        {/* جدول پیت‌ها */}
        <Table
          data={filteredPits}
          columns={columns}
          isLoading={loading}
          emptyMessage="هیچ پیتی برای این معدن تعریف نشده است"
        />

        {/* تعداد نتایج */}
        <div className="text-sm text-[#4A6A8A] text-left">
          نمایش {filteredPits.length} از {pits.length} پیت
        </div>
      </div>

      {/* مودال افزودن/ویرایش پیت */}
      {showAddModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm">
          <div className="bg-[#13203A] border border-[#AACCDD]/20 rounded-2xl p-6 w-full max-w-md shadow-2xl">
            <div className="flex items-center justify-between mb-4">
              <h4 className="text-white font-semibold">
                {editingPit ? 'ویرایش پیت' : 'افزودن پیت جدید'}
              </h4>
              <button
                onClick={() => {
                  setShowAddModal(false);
                  setEditingPit(null);
                  setFormData({ name: '', code: '', status: 'فعال' });
                }}
                className="text-[#8A9DB0] hover:text-white transition-colors"
              >
                <span className="text-2xl">×</span>
              </button>
            </div>

            <div className="space-y-4">
              <div>
                <label className="block text-[#8A9DB0] text-sm mb-1">نام پیت *</label>
                <input
                  type="text"
                  value={formData.name}
                  onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                  placeholder="مثال: پیت شمالی"
                  className="w-full px-4 py-2 bg-[#0A1628] border border-[#AACCDD]/10 rounded-xl text-white placeholder-[#4A6A8A] focus:outline-none focus:border-[#AACCDD]/30"
                />
              </div>

              <div>
                <label className="block text-[#8A9DB0] text-sm mb-1">کد پیت *</label>
                <input
                  type="text"
                  value={formData.code}
                  onChange={(e) => setFormData({ ...formData, code: e.target.value })}
                  placeholder="مثال: PT-002"
                  className="w-full px-4 py-2 bg-[#0A1628] border border-[#AACCDD]/10 rounded-xl text-white placeholder-[#4A6A8A] focus:outline-none focus:border-[#AACCDD]/30"
                />
              </div>

              <div>
                <label className="block text-[#8A9DB0] text-sm mb-1">وضعیت</label>
                <select
                  value={formData.status}
                  onChange={(e) => setFormData({ ...formData, status: e.target.value as 'فعال' | 'غیرفعال' })}
                  className="w-full px-4 py-2 bg-[#0A1628] border border-[#AACCDD]/10 rounded-xl text-white focus:outline-none focus:border-[#AACCDD]/30"
                >
                  <option value="فعال">فعال</option>
                  <option value="غیرفعال">غیرفعال</option>
                </select>
              </div>

              <button
                onClick={editingPit ? handleUpdatePit : handleAddPit}
                className="w-full py-2.5 bg-[#AACCDD] text-[#1A2A3A] font-semibold rounded-xl hover:bg-[#8A9DB0] transition-colors"
              >
                {editingPit ? 'ویرایش پیت' : 'افزودن پیت'}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}