// src/modules/equipment/presentation/pages/EquipmentPage.tsx

import React, { useState, useEffect, useMemo } from 'react';
import { useTheme } from '../../../../shared/context/ThemeContext';
import { useLanguage } from '../../../../shared/context/LanguageContext';
import { Sidebar } from '../../../../shared/components/Sidebar/Sidebar';
import { AppHeader } from '../../../../shared/components/Header/AppHeader';
import { EquipmentService, MINE_MAP_ZONES, EquipmentPlacementAuditLog } from '../../services/EquipmentService';
import { 
  EquipmentItem, 
  EquipmentCategory, 
  EquipmentStatus 
} from '../../domain/types/equipment.types';
import { EquipmentMapCanvas } from '../components/EquipmentMapCanvas';
import { EquipmentPropertiesSidebar, ALL_EQUIPMENT_CATEGORIES } from '../components/EquipmentPropertiesSidebar';
import { EquipmentFormModal } from '../components/EquipmentFormModal';
import { EquipmentVectorIcon } from '../components/EquipmentVectorIcons';
import { 
  TruckIcon, 
  ClockIcon, 
  FireIcon, 
  BoltIcon, 
  SparklesIcon, 
  ArrowPathIcon,
  MapPinIcon,
  CheckBadgeIcon,
  CursorArrowRaysIcon,
  ClipboardDocumentListIcon,
  XMarkIcon,
  PlusIcon,
  FunnelIcon,
  TableCellsIcon,
  MapIcon,
  ArrowsPointingOutIcon
} from '@heroicons/react/24/outline';

export const EquipmentPage: React.FC = () => {
  const { isDark } = useTheme();
  const { language } = useLanguage();
  const isRtl = language === 'fa';

  const [sidebarOpen, setSidebarOpen] = useState(true);

  // سایدبار مشخصات و مدیریت تجهیزات (Properties Sidebar)
  const [propertiesSidebarOpen, setPropertiesSidebarOpen] = useState(true);

  // داده‌های ناوگان
  const [items, setItems] = useState<EquipmentItem[]>(() => EquipmentService.getEquipmentList());

  // فیلتر چندگانه دسته‌بندی‌ها (Multi-Select Categories)
  const [selectedCategories, setSelectedCategories] = useState<EquipmentCategory[]>([]);
  const [statusFilter, setStatusFilter] = useState<EquipmentStatus | 'ALL'>('ALL');
  const [searchQuery, setSearchQuery] = useState('');

  // دستگاه انتخاب شده
  const [selectedEquipmentId, setSelectedEquipmentId] = useState<string | null>(null);

  // مودال افزودن / ویرایش ماشین‌آلات (CRUD)
  const [formModalOpen, setFormModalOpen] = useState(false);
  const [itemToEdit, setItemToEdit] = useState<EquipmentItem | null>(null);

  // حالت جانمایی و جابجایی ناوگان روی نقشه
  const [isPlacementMode, setIsPlacementMode] = useState(false);
  const [activePlacementItemId, setActivePlacementItemId] = useState<string | null>(null);

  // مودال لاگ‌های جابجایی
  const [auditModalOpen, setAuditModalOpen] = useState(false);
  const [auditLogs, setAuditLogs] = useState<EquipmentPlacementAuditLog[]>([]);

  // پیام بازخورد (Toast)
  const [toastMessage, setToastMessage] = useState<string | null>(null);

  const showToast = (msg: string) => {
    setToastMessage(msg);
    setTimeout(() => setToastMessage(null), 3500);
  };

  // بارگذاری مجدد داده‌ها
  const reloadData = () => {
    const fresh = EquipmentService.getEquipmentList();
    setItems(fresh);
  };

  // شاخص‌های کلیدی ناوگان
  const summary = useMemo(() => {
    return EquipmentService.getFleetSummary();
  }, [items]);

  // ماشین انتخاب شده بر اساس شناسه
  const selectedItem = useMemo(() => {
    return items.find(e => e.id === selectedEquipmentId) || null;
  }, [items, selectedEquipmentId]);

  // مدیریت فیلترهای چندگانه
  const handleToggleCategory = (cat: EquipmentCategory) => {
    setSelectedCategories(prev => 
      prev.includes(cat) ? prev.filter(c => c !== cat) : [...prev, cat]
    );
  };

  const handleSelectAllCategories = () => {
    setSelectedCategories(ALL_EQUIPMENT_CATEGORIES.map(c => c.id));
  };

  const handleClearCategories = () => {
    setSelectedCategories([]);
  };

  // به‌روزرسانی مکان دستگاه روی نقشه
  const handleUpdatePosition = (
    id: string, 
    x: number, 
    y: number, 
    benchLevel?: number, 
    zoneNameFa?: string
  ) => {
    const updated = EquipmentService.updatePosition(id, { x, y, benchLevel, zoneNameFa }, 'کاربر دیسپاچینگ');
    if (updated) {
      reloadData();
      showToast(`موقعیت دستگاه ${updated.code} در تراز ${updated.position.benchLevel}m با موفقیت ثبت شد.`);
      setActivePlacementItemId(null);
    }
  };

  // تغییر وضعیت سریع
  const handleStatusChange = (id: string, newStatus: EquipmentStatus) => {
    const updated = EquipmentService.updateStatus(id, newStatus);
    if (updated) {
      reloadData();
      showToast(`وضعیت دستگاه ${updated.code} به «${newStatus}» تغییر یافت.`);
    }
  };

  // شروع جانمایی یک دستگاه
  const handleStartPlacement = (item: EquipmentItem) => {
    setIsPlacementMode(true);
    setActivePlacementItemId(item.id);
    setSelectedEquipmentId(item.id);
    showToast(`دستگاه ${item.code} آماده جانمایی است. روی نقشه در محل مورد نظر کلیک یا درگ کنید.`);
  };

  // باز کردن فرم افزودن دستگاه جدید
  const handleOpenAddModal = () => {
    setItemToEdit(null);
    setFormModalOpen(true);
  };

  // باز کردن فرم ویرایش دستگاه
  const handleOpenEditModal = (item: EquipmentItem) => {
    setItemToEdit(item);
    setFormModalOpen(true);
  };

  // ذخیره فرم (افزودن یا ویرایش)
  const handleSaveEquipment = (data: Partial<EquipmentItem> & { code: string; nameFa: string; category: EquipmentCategory }) => {
    if (itemToEdit) {
      // ویرایش
      const updated = EquipmentService.updateEquipmentItem(itemToEdit.id, data);
      if (updated) {
        reloadData();
        showToast(`مشخصات دستگاه ${updated.code} با موفقیت ویرایش شد.`);
      }
    } else {
      // افزودن جدید
      const created = EquipmentService.addEquipmentItem(data);
      reloadData();
      setSelectedEquipmentId(created.id);
      showToast(`ماشین‌آلات ${created.code} (${created.nameFa}) با موفقیت به ناوگان افزوده شد.`);
    }
  };

  // حذف دستگاه از ناوگان
  const handleDeleteEquipment = (item: EquipmentItem) => {
    if (window.confirm(`آیا از حذف دستگاه ${item.code} (${item.nameFa}) از سامانه اطمینان دارید؟`)) {
      const success = EquipmentService.deleteEquipmentItem(item.id);
      if (success) {
        if (selectedEquipmentId === item.id) {
          setSelectedEquipmentId(null);
        }
        reloadData();
        showToast(`دستگاه ${item.code} با موفقیت از ناوگان حذف شد.`);
      }
    }
  };

  // بازنشانی چیدمان
  const handleResetPositions = () => {
    if (window.confirm('آیا از بازنشانی کلیه جانمایی‌های ناوگان روی نقشه به حالت پیش‌فرض اطمینان دارید؟')) {
      const reset = EquipmentService.resetPositionsToDefault();
      setItems(reset);
      showToast('کلیه جانمایی‌ها به حالت پیش‌فرض بازنشانی شدند.');
    }
  };

  // نمایش سوابق جابجایی
  const handleOpenAuditModal = () => {
    setAuditLogs(EquipmentService.getPlacementAuditLogs());
    setAuditModalOpen(true);
  };

  return (
    <div className={`min-h-screen flex ${isDark ? 'bg-[#060A14] text-slate-100' : 'bg-slate-50 text-slate-800'}`}>
      <Sidebar isOpen={sidebarOpen} onClose={() => setSidebarOpen(false)} />

      <div className="flex-1 flex flex-col min-w-0 overflow-y-auto max-h-screen">
        <AppHeader 
          onToggleSidebar={() => setSidebarOpen(!sidebarOpen)} 
          onSearch={(q) => setSearchQuery(q)}
        />

        <main className="p-3 sm:p-5 flex-1 flex flex-col max-w-[1920px] w-full mx-auto space-y-4">
          {/* نوار بالایی: عنوان ماژول، دکمه‌های اکشن افزودن و سوابق */}
          <div className="flex flex-col md:flex-row md:items-center justify-between gap-3">
            <div className="flex items-center gap-3">
              <div className="p-2.5 rounded-2xl bg-cyan-500/20 text-cyan-400 border border-cyan-500/30 flex items-center justify-center shadow-md">
                <TruckIcon className="w-6 h-6" />
              </div>
              <div>
                <h1 className="text-lg sm:text-xl font-black text-slate-100 flex items-center gap-2">
                  <span>جانمایی و مدیریت ناوگان ماشین‌آلات معدنی</span>
                  <span className="text-[11px] px-2.5 py-0.5 rounded-full font-bold bg-cyan-500/15 text-cyan-300 border border-cyan-500/30">
                    GIS دیسپاچینگ
                  </span>
                </h1>
                <p className="text-xs text-slate-400 mt-0.5">
                  جانمایی دقیق روی نقشه مصوب معدن، رهگیری کارکرد روزانه، فیلتر چندگانه و مدیریت مشخصات ناوگان
                </p>
              </div>
            </div>

            {/* دکمه‌های اکشن بالا */}
            <div className="flex flex-wrap items-center gap-2">
              <button
                onClick={handleOpenAddModal}
                className="py-2 px-3.5 rounded-xl bg-cyan-500 hover:bg-cyan-400 text-slate-950 font-black text-xs flex items-center gap-1.5 shadow-lg transition-all"
              >
                <PlusIcon className="w-4 h-4" />
                <span>افزودن ماشین‌آلات</span>
              </button>

              <button
                onClick={handleOpenAuditModal}
                className={`py-2 px-3 rounded-xl border text-xs font-bold flex items-center gap-1.5 transition-colors ${
                  isDark ? 'bg-[#0E172A] border-slate-700 text-slate-300 hover:text-white' : 'bg-white border-slate-300 text-slate-700'
                }`}
                title="مشاهده سوابق و ممیزی جابجایی‌ها"
              >
                <ClipboardDocumentListIcon className="w-4 h-4 text-cyan-400" />
                <span className="hidden sm:inline">سوابق جانمایی</span>
              </button>

              <button
                onClick={handleResetPositions}
                className={`p-2 rounded-xl border transition-colors ${
                  isDark ? 'bg-[#0E172A] border-slate-700 text-slate-400 hover:text-white' : 'bg-white border-slate-300 text-slate-600'
                }`}
                title="بازنشانی تمام جانمایی‌ها به حالت پیش‌فرض"
              >
                <ArrowPathIcon className="w-4 h-4" />
              </button>
            </div>
          </div>

          {/* فیلتر سریع چندگانه دسته‌بندی‌ها بالای صفحه */}
          <div className={`p-2 rounded-2xl border flex items-center justify-between gap-2 overflow-x-auto ${
            isDark ? 'bg-[#0B1323] border-slate-800' : 'bg-white border-slate-200'
          }`}>
            <div className="flex items-center gap-1.5 flex-nowrap">
              <span className="text-[11px] font-bold text-slate-400 px-2 flex items-center gap-1">
                <FunnelIcon className="w-3.5 h-3.5 text-cyan-400" />
                <span>نوع:</span>
              </span>

              <button
                onClick={handleClearCategories}
                className={`text-[11px] font-bold px-2.5 py-1 rounded-xl border transition-all ${
                  selectedCategories.length === 0
                    ? 'bg-cyan-500 text-slate-950 border-cyan-400 shadow-sm font-black'
                    : isDark ? 'bg-slate-900 border-slate-800 text-slate-400 hover:text-slate-200' : 'bg-slate-100 border-slate-200 text-slate-600'
                }`}
              >
                همه ({items.length})
              </button>

              {ALL_EQUIPMENT_CATEGORIES.map(cat => {
                const isSelected = selectedCategories.includes(cat.id);
                const count = items.filter(e => e.category === cat.id).length;
                return (
                  <button
                    key={cat.id}
                    onClick={() => handleToggleCategory(cat.id)}
                    className={`text-[11px] font-bold px-2.5 py-1 rounded-xl border transition-all flex items-center gap-1.5 whitespace-nowrap ${
                      isSelected
                        ? 'bg-cyan-500/25 border-cyan-400 text-cyan-300 shadow-sm font-black'
                        : isDark ? 'bg-slate-900/80 border-slate-800 text-slate-400 hover:text-slate-200' : 'bg-slate-100 border-slate-200 text-slate-600'
                    }`}
                  >
                    <EquipmentVectorIcon category={cat.id} size={15} />
                    <span>{cat.labelFa}</span>
                    <span className="text-[10px] opacity-75 font-mono">({count})</span>
                  </button>
                );
              })}
            </div>

            {selectedCategories.length > 0 && (
              <button
                onClick={handleClearCategories}
                className="text-[11px] text-cyan-400 hover:underline px-2 whitespace-nowrap font-bold"
              >
                پاکسازی فیلتر ({selectedCategories.length})
              </button>
            )}
          </div>

          {/* بدنه اصلی: نقشه تمام‌صفحه و سایدبار مشخصات در سمت راست با چیدمان دینامیک جهت بیشترین فضای دید نقشه */}
          <div className="flex-1 relative flex flex-row min-h-[650px] overflow-hidden rounded-2xl border border-slate-800 bg-[#0B1323]">
            {/* بوم نقشه واقعی معدن (Real GIS / Mine Map Canvas) - اشغال ۱۰۰٪ فضا */}
            <div className="flex-1 flex flex-col min-w-0 h-full w-full">
              <EquipmentMapCanvas 
                items={items}
                selectedCategories={selectedCategories}
                statusFilter={statusFilter}
                searchQuery={searchQuery}
                isPlacementMode={isPlacementMode}
                activePlacementItemId={activePlacementItemId}
                onUpdatePosition={handleUpdatePosition}
                onSelectEquipment={(item) => {
                  setSelectedEquipmentId(item.id);
                  setPropertiesSidebarOpen(true);
                }}
                selectedEquipmentId={selectedEquipmentId}
                isDark={isDark}
                onTogglePlacementMode={() => {
                  setIsPlacementMode(!isPlacementMode);
                  if (isPlacementMode) {
                    setActivePlacementItemId(null);
                  }
                }}
                onStatusChange={handleStatusChange}
                onEditEquipment={handleOpenEditModal}
              />
            </div>

            {/* سایدبار مدیریت و مشخصات ماشین‌آلات در سمت راست نقشه */}
            <div className="h-full z-20 flex-shrink-0">
              <EquipmentPropertiesSidebar 
                isOpen={propertiesSidebarOpen}
                onToggleOpen={() => setPropertiesSidebarOpen(!propertiesSidebarOpen)}
                selectedItem={selectedItem}
                items={items}
                isDark={isDark}
                selectedCategories={selectedCategories}
                onToggleCategory={handleToggleCategory}
                onSelectAllCategories={handleSelectAllCategories}
                onClearCategories={handleClearCategories}
                statusFilter={statusFilter}
                onSelectStatusFilter={setStatusFilter}
                searchQuery={searchQuery}
                onSearchChange={setSearchQuery}
                onSelectEquipment={(item) => setSelectedEquipmentId(item.id)}
                onStartPlacement={handleStartPlacement}
                onEditEquipment={handleOpenEditModal}
                onDeleteEquipment={handleDeleteEquipment}
                onAddNewEquipment={handleOpenAddModal}
                onStatusChange={handleStatusChange}
                isPlacementMode={isPlacementMode}
                activePlacementItemId={activePlacementItemId}
                fleetSummary={summary}
              />
            </div>
          </div>
        </main>
      </div>

      {/* مودال فرم افزودن / ویرایش ماشین‌آلات (CRUD) */}
      <EquipmentFormModal
        isOpen={formModalOpen}
        itemToEdit={itemToEdit}
        onClose={() => setFormModalOpen(false)}
        onSave={handleSaveEquipment}
        isDark={isDark}
      />

      {/* مودال لاگ‌های جابجایی و ممیزی */}
      {auditModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/75 backdrop-blur-sm">
          <div className={`w-full max-w-2xl rounded-3xl border shadow-2xl overflow-hidden flex flex-col max-h-[85vh] ${
            isDark ? 'bg-[#0B1323] border-[#1E293B] text-slate-100' : 'bg-white border-slate-200 text-slate-900'
          }`}>
            <div className="p-4 border-b border-slate-800 flex items-center justify-between bg-[#080E1B]">
              <div className="flex items-center gap-2">
                <ClipboardDocumentListIcon className="w-5 h-5 text-cyan-400" />
                <h3 className="text-sm font-black">سوابق ممیزی و جانمایی ماشین‌آلات روی نقشه</h3>
              </div>
              <button onClick={() => setAuditModalOpen(false)} className="p-1 rounded-lg hover:bg-slate-800 text-slate-400 hover:text-white">
                <XMarkIcon className="w-5 h-5" />
              </button>
            </div>

            <div className="p-4 overflow-y-auto space-y-2 flex-1">
              {auditLogs.length > 0 ? (
                auditLogs.map((log, idx) => (
                  <div key={idx} className={`p-3 rounded-2xl border flex items-center justify-between text-xs ${
                    isDark ? 'bg-[#0E172A] border-slate-800' : 'bg-slate-50 border-slate-200'
                  }`}>
                    <div>
                      <div className="flex items-center gap-2 font-bold">
                        <span className="text-cyan-400 font-mono font-black">{log.equipmentCode}</span>
                        <span>{log.equipmentName}</span>
                      </div>
                      <p className="text-[11px] text-slate-400 mt-0.5">
                        مکان: {log.zoneName} (تراز {log.benchLevel}m) • مختصات: {log.coordinates}
                      </p>
                    </div>
                    <div className="text-left text-[10px] text-slate-500">
                      <span className="block font-mono">{log.timestamp}</span>
                      <span className="text-slate-400">{log.updatedBy}</span>
                    </div>
                  </div>
                ))
              ) : (
                <p className="text-center py-8 text-xs text-slate-500">هنوز سابقه جابجایی ثبت نشده است.</p>
              )}
            </div>
          </div>
        </div>
      )}

      {/* پیام بازخورد (Toast) */}
      {toastMessage && (
        <div className="fixed bottom-6 left-6 z-50 px-4 py-3 rounded-2xl bg-cyan-500 text-slate-950 font-bold text-xs shadow-2xl flex items-center gap-2 border border-cyan-300 animate-in slide-in-from-bottom-5">
          <CheckBadgeIcon className="w-5 h-5" />
          <span>{toastMessage}</span>
        </div>
      )}
    </div>
  );
};
