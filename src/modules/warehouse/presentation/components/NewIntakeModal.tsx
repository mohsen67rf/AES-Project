// src/modules/warehouse/presentation/components/NewIntakeModal.tsx

import React, { useState } from 'react';
import { WarehouseItem } from '../../domain/types/warehouse.types';
import { 
  ArrowDownTrayIcon 
} from '@heroicons/react/24/outline';

interface NewIntakeModalProps {
  isOpen: boolean;
  onClose: () => void;
  items: WarehouseItem[];
  preselectedItemId?: string;
  isDark: boolean;
  onIntakeSubmit: (data: {
    itemId: string;
    quantity: number;
    contractorName: string;
    operatorName: string;
    authorizedBy: string;
    permitNumber?: string;
    batchNumber?: string;
    notes?: string;
  }) => void;
}

export const NewIntakeModal: React.FC<NewIntakeModalProps> = ({
  isOpen,
  onClose,
  items,
  preselectedItemId,
  isDark,
  onIntakeSubmit
}) => {
  const [selectedItemId, setSelectedItemId] = useState(preselectedItemId || items[0]?.id || '');
  const [quantity, setQuantity] = useState<number>(10000);
  const [contractorName, setContractorName] = useState('شرکت صنایع شیمیایی پارس نار');
  const [operatorName, setOperatorName] = useState('انباردار ناریه (مهندس بیات)');
  const [authorizedBy, setAuthorizedBy] = useState('مهندس حسینی (مدیر کارفرما) و حراست ناریه');
  const [permitNumber, setPermitNumber] = useState(() => `BARNAMEH-PARS-${Date.now().toString().slice(-4)}`);
  const [batchNumber, setBatchNumber] = useState(() => `BATCH-1405-${Date.now().toString().slice(-2)}`);
  const [notes, setNotes] = useState('تحویل محموله با اسکورت رسمی حراست و مجوز رسمی حمل مواد ناریه');
  const [isSubmitting, setIsSubmitting] = useState(false);

  if (!isOpen) return null;

  const currentItem = items.find(i => i.id === selectedItemId) || items[0];

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);
    try {
      onIntakeSubmit({
        itemId: selectedItemId,
        quantity: Number(quantity),
        contractorName,
        operatorName,
        authorizedBy,
        permitNumber,
        batchNumber,
        notes
      });
      onClose();
    } catch (err: unknown) {
      const errorMessage = err instanceof Error ? err.message : 'خطای نامشخص';
      alert('خطا در ثبت شارژ انبار: ' + errorMessage);
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm p-4">
      <div className={`w-full max-w-lg rounded-2xl border p-6 shadow-2xl transition-all ${
        isDark ? 'bg-slate-900 border-slate-800 text-slate-100' : 'bg-white border-slate-200 text-slate-800'
      }`}>
        <div className="flex items-center justify-between border-b pb-3 border-slate-200 dark:border-slate-800">
          <div className="flex items-center gap-2">
            <ArrowDownTrayIcon className="w-5 h-5 text-emerald-500" />
            <h3 className="text-sm font-bold">ورود محموله و شارژ انبار مواد ناریه / سوخت / قطعات</h3>
          </div>
          <button 
            onClick={onClose}
            className="text-slate-400 hover:text-slate-200 text-xs font-bold cursor-pointer"
          >
            ✕
          </button>
        </div>

        <form onSubmit={handleSubmit} className="mt-4 space-y-3.5 text-xs">
          <div>
            <label className="block font-semibold text-slate-700 dark:text-slate-300 mb-1">انتخاب کالا جهت شارژ:</label>
            <select
              value={selectedItemId}
              onChange={(e) => setSelectedItemId(e.target.value)}
              className="w-full px-3 py-2 bg-slate-50 dark:bg-slate-800 border border-slate-300 dark:border-slate-700 rounded-xl font-bold text-slate-800 dark:text-slate-200 focus:ring-2 focus:ring-emerald-500"
            >
              {items.map(item => (
                <option key={item.id} value={item.id}>
                  {item.nameFa} (موجودی فعلی: {item.currentStock.toLocaleString()} {item.unit})
                </option>
              ))}
            </select>
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block font-semibold text-slate-700 dark:text-slate-300 mb-1">مقدار وارده ({currentItem?.unit}):</label>
              <input
                type="number"
                min="1"
                required
                value={quantity}
                onChange={(e) => setQuantity(Number(e.target.value))}
                className="w-full px-3 py-2 bg-slate-50 dark:bg-slate-800 border border-slate-300 dark:border-slate-700 rounded-xl font-bold"
              />
            </div>
            <div>
              <label className="block font-semibold text-slate-700 dark:text-slate-300 mb-1">شماره پارت / بچ‌نامبر:</label>
              <input
                type="text"
                value={batchNumber}
                onChange={(e) => setBatchNumber(e.target.value)}
                className="w-full px-3 py-2 bg-slate-50 dark:bg-slate-800 border border-slate-300 dark:border-slate-700 rounded-xl font-mono text-[11px]"
              />
            </div>
          </div>

          <div>
            <label className="block font-semibold text-slate-700 dark:text-slate-300 mb-1">تأمین‌کننده / شرکت حمل ناریه:</label>
            <input
              type="text"
              required
              value={contractorName}
              onChange={(e) => setContractorName(e.target.value)}
              className="w-full px-3 py-2 bg-slate-50 dark:bg-slate-800 border border-slate-300 dark:border-slate-700 rounded-xl"
            />
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block font-semibold text-slate-700 dark:text-slate-300 mb-1">انباردار / تحویل‌گیرنده:</label>
              <input
                type="text"
                required
                value={operatorName}
                onChange={(e) => setOperatorName(e.target.value)}
                className="w-full px-3 py-2 bg-slate-50 dark:bg-slate-800 border border-slate-300 dark:border-slate-700 rounded-xl"
              />
            </div>
            <div>
              <label className="block font-semibold text-slate-700 dark:text-slate-300 mb-1">شماره بارنامه / مجوز حمل:</label>
              <input
                type="text"
                required
                value={permitNumber}
                onChange={(e) => setPermitNumber(e.target.value)}
                className="w-full px-3 py-2 bg-slate-50 dark:bg-slate-800 border border-slate-300 dark:border-slate-700 rounded-xl font-mono text-[11px]"
              />
            </div>
          </div>

          <div>
            <label className="block font-semibold text-slate-700 dark:text-slate-300 mb-1">مقام تأییدکننده و حراست:</label>
            <input
              type="text"
              required
              value={authorizedBy}
              onChange={(e) => setAuthorizedBy(e.target.value)}
              className="w-full px-3 py-2 bg-slate-50 dark:bg-slate-800 border border-slate-300 dark:border-slate-700 rounded-xl"
            />
          </div>

          <div>
            <label className="block font-semibold text-slate-700 dark:text-slate-300 mb-1">توضیحات و گزارش بازرسی محموله:</label>
            <textarea
              rows={2}
              value={notes}
              onChange={(e) => setNotes(e.target.value)}
              className="w-full px-3 py-2 bg-slate-50 dark:bg-slate-800 border border-slate-300 dark:border-slate-700 rounded-xl"
            />
          </div>

          <div className="mt-5 flex items-center justify-end gap-2.5 pt-3 border-t border-slate-200 dark:border-slate-800">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 rounded-xl border border-slate-300 dark:border-slate-700 text-xs font-semibold text-slate-600 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800 cursor-pointer"
            >
              انصراف
            </button>
            <button
              type="submit"
              disabled={isSubmitting}
              className="px-5 py-2 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-white text-xs font-bold shadow-md shadow-emerald-600/30 cursor-pointer transition-all active:scale-95 disabled:opacity-50"
            >
              {isSubmitting ? 'در حال ثبت...' : 'ثبت ورود و افزایش موجودی انبار'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};
