// src/modules/warehouse/presentation/pages/WarehousePage.tsx

import React, { useState } from 'react';
import { useTheme } from '../../../../shared/context/ThemeContext';
import { Sidebar } from '../../../../shared/components/Sidebar/Sidebar';
import { AppHeader } from '../../../../shared/components/Header/AppHeader';
import { WarehouseService } from '../../services/WarehouseService';
import { 
  WarehouseItem, 
  WarehouseTransaction, 
  FuelTank, 
  EquipmentRefuelingLog, 
  MagazineSafetyStatus,
  BlockBlastCalculationResult,
  BlockBlastCalculationInput
} from '../../domain/types/warehouse.types';

import { WarehouseOverviewTab } from '../components/WarehouseOverviewTab';
import { BlockExplosiveCalculatorTab } from '../components/BlockExplosiveCalculatorTab';
import { ExplosiveMagazineTab } from '../components/ExplosiveMagazineTab';
import { FuelAndFleetTab } from '../components/FuelAndFleetTab';
import { TransactionLedgerTab } from '../components/TransactionLedgerTab';
import { NewIntakeModal } from '../components/NewIntakeModal';
import { BlastProtocolModal } from '../components/BlastProtocolModal';

import { 
  Squares2X2Icon, 
  CalculatorIcon, 
  FireIcon, 
  TruckIcon, 
  ClipboardDocumentListIcon,
  PlusIcon,
  ArrowPathIcon
} from '@heroicons/react/24/outline';

type ActiveTab = 'overview' | 'calculator' | 'explosives' | 'fuel' | 'ledger';

export const WarehousePage: React.FC = () => {
  const { isDark } = useTheme();

  const [sidebarOpen, setSidebarOpen] = useState(true);
  const [activeTab, setActiveTab] = useState<ActiveTab>('overview');
  const [items, setItems] = useState<WarehouseItem[]>(() => WarehouseService.getItems());
  const [transactions, setTransactions] = useState<WarehouseTransaction[]>(() => WarehouseService.getTransactions());
  const [fuelTanks, setFuelTanks] = useState<FuelTank[]>(() => WarehouseService.getFuelTanks());
  const [refuelingLogs, setRefuelingLogs] = useState<EquipmentRefuelingLog[]>(() => WarehouseService.getRefuelingLogs());
  const [safetyStatus, setSafetyStatus] = useState<MagazineSafetyStatus[]>(() => WarehouseService.getSafetyStatus());

  // Modals state
  const [intakeModalOpen, setIntakeModalOpen] = useState(false);
  const [preselectedItemId, setPreselectedItemId] = useState<string | undefined>(undefined);
  
  const [protocolModalOpen, setProtocolModalOpen] = useState(false);
  const [selectedProtocolTx, setSelectedProtocolTx] = useState<WarehouseTransaction | null>(null);
  const [customProtocolData, setCustomProtocolData] = useState<{
    permitNumber: string;
    blockCode: string;
    dateStr: string;
    anfoKg: number;
    emulsionKg: number;
    boostersCount: number;
    detonatorsCount: number;
    surfaceCount: number;
    cordMeters: number;
    drillingMeters: number;
    holeCount: number;
    powderFactor: number;
    tonnage: number;
    contractor: string;
    supervision: string;
    client: string;
  } | null>(null);

  // بارگذاری داده‌های انبار
  const loadData = () => {
    setItems(WarehouseService.getItems());
    setTransactions(WarehouseService.getTransactions());
    setFuelTanks(WarehouseService.getFuelTanks());
    setRefuelingLogs(WarehouseService.getRefuelingLogs());
    setSafetyStatus(WarehouseService.getSafetyStatus());
  };

  // هندلر شارژ انبار
  const handleIntakeSubmit = (data: {
    itemId: string;
    quantity: number;
    contractorName: string;
    operatorName: string;
    authorizedBy: string;
    permitNumber?: string;
    batchNumber?: string;
    notes?: string;
  }) => {
    WarehouseService.addIntakeTransaction(data);
    loadData();
  };

  // هندلر ثبت سوخت‌گیری
  const handleSaveRefuelLog = (log: Omit<EquipmentRefuelingLog, 'id' | 'timestamp'>) => {
    WarehouseService.addRefuelingLog(log);
    loadData();
  };

  // هندلر ثبت موفقیت‌آمیز مصرف ناریه برای بلوک
  const handleDispatchSuccess = (
    permitNumber: string, 
    blockCode: string, 
    result: BlockBlastCalculationResult,
    input: BlockBlastCalculationInput
  ) => {
    loadData();
    setCustomProtocolData({
      permitNumber,
      blockCode,
      dateStr: new Date().toLocaleDateString('fa-IR'),
      anfoKg: result.totalAnfoKg,
      emulsionKg: result.totalEmulsionKg,
      boostersCount: result.totalBoostersCount,
      detonatorsCount: result.totalInHoleDetonatorsCount,
      surfaceCount: result.totalSurfaceConnectorsCount,
      cordMeters: result.totalDetonatingCordMeters,
      drillingMeters: result.totalDrillingMeters,
      holeCount: input.holeCount,
      powderFactor: result.calculatedPowderFactorKgTon,
      tonnage: result.totalTonnage,
      contractor: 'پیمانکار استخراج و آتشباری',
      supervision: 'دستگاه نظارت',
      client: 'مدیریت کارفرما'
    });
    setSelectedProtocolTx(null);
    setProtocolModalOpen(true);
  };

  const handleOpenIntakeForItem = (itemId: string) => {
    setPreselectedItemId(itemId);
    setIntakeModalOpen(true);
  };

  const handleViewProtocol = (tx: WarehouseTransaction) => {
    setSelectedProtocolTx(tx);
    setCustomProtocolData(null);
    setProtocolModalOpen(true);
  };

  return (
    <div className={`min-h-screen flex ${isDark ? 'bg-[#060913] text-slate-100' : 'bg-slate-50 text-slate-800'}`}>
      <Sidebar isOpen={sidebarOpen} onClose={() => setSidebarOpen(false)} />

      <div className="flex-1 flex flex-col min-w-0 overflow-y-auto max-h-screen">
        <AppHeader onToggleSidebar={() => setSidebarOpen(!sidebarOpen)} />

        <main className="p-4 sm:p-6 lg:p-8 space-y-6 max-w-7xl mx-auto w-full">
          {/* هدر صفحه و تب‌های راهبری */}
          <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
            <div>
              <div className="flex items-center gap-2">
                <span className="px-2.5 py-0.5 rounded-lg bg-amber-500/10 text-amber-500 font-bold text-xs">
                  ماژول لجستیک، انبار و مواد ناریه
                </span>
                <h1 className="text-xl sm:text-2xl font-black tracking-tight text-slate-900 dark:text-white">
                  مدیریت انبار مواد ناریه و لجستیک سوخت معدن
                </h1>
              </div>
              <p className="text-xs text-slate-500 dark:text-slate-400 mt-1">
                محاسبه آنلاین میزان مصرف ناریه بلوک‌ها، پایش لحظه‌ای موجودی زاغه‌ها، مخازن سوخت و ثبت حواله‌ها
              </p>
            </div>

            <div className="flex items-center gap-2">
              <button
                onClick={loadData}
                className="p-2.5 rounded-xl border border-slate-200 dark:border-slate-800 text-slate-500 hover:text-slate-700 dark:hover:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800 transition-all cursor-pointer"
                title="تازه‌سازی اطلاعات"
              >
                <ArrowPathIcon className="w-4 h-4" />
              </button>

              <button
                onClick={() => {
                  setPreselectedItemId(undefined);
                  setIntakeModalOpen(true);
                }}
                className="flex items-center gap-1.5 px-4 py-2.5 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-white text-xs font-bold transition-all shadow-md shadow-emerald-600/20 active:scale-95 cursor-pointer"
              >
                <PlusIcon className="w-4 h-4" />
                <span>شارژ انبار (ورود محموله)</span>
              </button>
            </div>
          </div>

          {/* تب‌های اصلی صفحه */}
          <div className="flex items-center gap-2 border-b border-slate-200 dark:border-slate-800 overflow-x-auto pb-px">
            <button
              onClick={() => setActiveTab('overview')}
              className={`flex items-center gap-2 px-4 py-3 text-xs font-bold border-b-2 transition-all cursor-pointer whitespace-nowrap ${
                activeTab === 'overview'
                  ? 'border-amber-500 text-amber-600 dark:text-amber-400'
                  : 'border-transparent text-slate-500 hover:text-slate-800 dark:hover:text-slate-300'
              }`}
            >
              <Squares2X2Icon className="w-4 h-4" />
              <span>داشبورد و شاخص‌های انبار</span>
            </button>

            <button
              onClick={() => setActiveTab('calculator')}
              className={`flex items-center gap-2 px-4 py-3 text-xs font-bold border-b-2 transition-all cursor-pointer whitespace-nowrap ${
                activeTab === 'calculator'
                  ? 'border-amber-500 text-amber-600 dark:text-amber-400'
                  : 'border-transparent text-slate-500 hover:text-slate-800 dark:hover:text-slate-300'
              }`}
            >
              <CalculatorIcon className="w-4 h-4" />
              <span>محاسبه مواد ناریه بلوک‌های معدنی</span>
              <span className="px-1.5 py-0.5 rounded-full bg-amber-500 text-white text-[9px] font-bold">
                هوشمند
              </span>
            </button>

            <button
              onClick={() => setActiveTab('explosives')}
              className={`flex items-center gap-2 px-4 py-3 text-xs font-bold border-b-2 transition-all cursor-pointer whitespace-nowrap ${
                activeTab === 'explosives'
                  ? 'border-amber-500 text-amber-600 dark:text-amber-400'
                  : 'border-transparent text-slate-500 hover:text-slate-800 dark:hover:text-slate-300'
              }`}
            >
              <FireIcon className="w-4 h-4" />
              <span>کارتابل زاغه‌ها و موجودی ناریه</span>
            </button>

            <button
              onClick={() => setActiveTab('fuel')}
              className={`flex items-center gap-2 px-4 py-3 text-xs font-bold border-b-2 transition-all cursor-pointer whitespace-nowrap ${
                activeTab === 'fuel'
                  ? 'border-amber-500 text-amber-600 dark:text-amber-400'
                  : 'border-transparent text-slate-500 hover:text-slate-800 dark:hover:text-slate-300'
              }`}
            >
              <TruckIcon className="w-4 h-4" />
              <span>مخازن سوخت و ناوگان معدن</span>
            </button>

            <button
              onClick={() => setActiveTab('ledger')}
              className={`flex items-center gap-2 px-4 py-3 text-xs font-bold border-b-2 transition-all cursor-pointer whitespace-nowrap ${
                activeTab === 'ledger'
                  ? 'border-amber-500 text-amber-600 dark:text-amber-400'
                  : 'border-transparent text-slate-500 hover:text-slate-800 dark:hover:text-slate-300'
              }`}
            >
              <ClipboardDocumentListIcon className="w-4 h-4" />
              <span>دفتر کل گردش و صورتجلسات ({transactions.length})</span>
            </button>
          </div>

          {/* محتوای تب فعال */}
          {activeTab === 'overview' && (
            <WarehouseOverviewTab
              items={items}
              transactions={transactions}
              fuelTanks={fuelTanks}
              safetyStatus={safetyStatus}
              isDark={isDark}
              onOpenIntakeModal={() => {
                setPreselectedItemId(undefined);
                setIntakeModalOpen(true);
              }}
              onGoToCalculator={() => setActiveTab('calculator')}
              onOpenRefuelModal={() => setActiveTab('fuel')}
            />
          )}

          {activeTab === 'calculator' && (
            <BlockExplosiveCalculatorTab
              items={items}
              isDark={isDark}
              onDispatchSuccess={handleDispatchSuccess}
            />
          )}

          {activeTab === 'explosives' && (
            <ExplosiveMagazineTab
              items={items}
              safetyStatus={safetyStatus}
              isDark={isDark}
              onOpenIntakeForItem={handleOpenIntakeForItem}
            />
          )}

          {activeTab === 'fuel' && (
            <FuelAndFleetTab
              fuelTanks={fuelTanks}
              refuelingLogs={refuelingLogs}
              isDark={isDark}
              onSaveRefuelLog={handleSaveRefuelLog}
            />
          )}

          {activeTab === 'ledger' && (
            <TransactionLedgerTab
              transactions={transactions}
              isDark={isDark}
              onViewProtocol={handleViewProtocol}
            />
          )}
        </main>
      </div>

      {/* مودال‌های سیستمی */}
      <NewIntakeModal
        isOpen={intakeModalOpen}
        onClose={() => setIntakeModalOpen(false)}
        items={items}
        preselectedItemId={preselectedItemId}
        isDark={isDark}
        onIntakeSubmit={handleIntakeSubmit}
      />

      <BlastProtocolModal
        isOpen={protocolModalOpen}
        onClose={() => setProtocolModalOpen(false)}
        transaction={selectedProtocolTx}
        customData={customProtocolData}
        isDark={isDark}
      />
    </div>
  );
};
