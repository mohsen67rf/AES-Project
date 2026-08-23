// src/shared/components/AlertBell/AlertBell.tsx

import { useState, useEffect } from 'react';
import { BellIcon, XMarkIcon, CheckIcon } from '@heroicons/react/24/outline';
import { useTheme } from '../../context/ThemeContext';
import AlertService from '../../../modules/alert/services/AlertService';
import { Alert, AlertSeverity } from '../../../core/domain/types/alert.types';
import { motion, AnimatePresence } from 'framer-motion';

export function AlertBell() {
  const { isDark } = useTheme();
  const [isOpen, setIsOpen] = useState<boolean>(false);
  const [alerts, setAlerts] = useState<Alert[]>([]);
  const [unreadCount, setUnreadCount] = useState<number>(0);

  useEffect(() => {
    loadAlerts();
    const interval = setInterval(() => {
      AlertService.checkAndGenerateAlerts();
      loadAlerts();
    }, 30000);
    return () => clearInterval(interval);
  }, []);

  const loadAlerts = (): void => {
    const allAlerts: Alert[] = AlertService.getAllAlerts();
    const sorted: Alert[] = allAlerts.sort((a: Alert, b: Alert) => 
      new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()
    );
    setAlerts(sorted.slice(0, 20));
    setUnreadCount(AlertService.getUnreadAlerts().length);
  };

  const handleMarkAsRead = (alertId: string): void => {
    AlertService.markAsRead(alertId);
    loadAlerts();
  };

  const handleMarkAllAsRead = (): void => {
    alerts.forEach((a: Alert) => {
      if (!a.readAt) AlertService.markAsRead(a.id);
    });
    loadAlerts();
  };

  const getSeverityColor = (severity: AlertSeverity): string => {
    switch (severity) {
      case 'CRITICAL': return 'text-red-500 bg-red-500/10 border-red-500/30';
      case 'WARNING': return 'text-yellow-500 bg-yellow-500/10 border-yellow-500/30';
      case 'SUCCESS': return 'text-green-500 bg-green-500/10 border-green-500/30';
      default: return 'text-blue-500 bg-blue-500/10 border-blue-500/30';
    }
  };

  const getSeverityIcon = (severity: AlertSeverity): string => {
    switch (severity) {
      case 'CRITICAL': return '🔴';
      case 'WARNING': return '🟡';
      case 'SUCCESS': return '🟢';
      default: return '🔵';
    }
  };

  return (
    <div className="relative">
      <button
        onClick={() => setIsOpen(!isOpen)}
        className="relative p-2 rounded-full hover:bg-white/10 transition-colors"
      >
        <BellIcon className={`w-5 h-5 ${isDark ? 'text-[#8A9DB0]' : 'text-[#4A6A8A]'}`} />
        {unreadCount > 0 && (
          <span className="absolute -top-0.5 -right-0.5 w-4 h-4 text-[9px] font-bold text-white bg-red-500 rounded-full flex items-center justify-center animate-pulse">
            {unreadCount > 9 ? '9+' : unreadCount}
          </span>
        )}
      </button>

      <AnimatePresence>
        {isOpen && (
          <>
            <div className="fixed inset-0 z-40" onClick={() => setIsOpen(false)} />
            <motion.div
              initial={{ opacity: 0, y: -10, scale: 0.95 }}
              animate={{ opacity: 1, y: 0, scale: 1 }}
              exit={{ opacity: 0, y: -10, scale: 0.95 }}
              className={`absolute left-0 mt-2 w-96 max-h-[500px] overflow-y-auto rounded-2xl shadow-2xl border z-50 ${
                isDark ? 'bg-[#13203A] border-[#AACCDD]/20' : 'bg-white border-gray-200'
              }`}
            >
              <div className={`sticky top-0 z-10 p-4 border-b flex items-center justify-between ${
                isDark ? 'border-[#AACCDD]/10 bg-[#13203A]' : 'border-gray-200 bg-white'
              }`}>
                <div>
                  <h3 className={`font-semibold ${isDark ? 'text-white' : 'text-gray-800'}`}>هشدارها</h3>
                  <p className={`text-xs ${isDark ? 'text-[#8A9DB0]' : 'text-gray-500'}`}>
                    {unreadCount} هشدار خوانده نشده
                  </p>
                </div>
                <div className="flex items-center gap-2">
                  {unreadCount > 0 && (
                    <button
                      onClick={handleMarkAllAsRead}
                      className={`px-2 py-1 rounded-lg text-xs transition-colors ${
                        isDark ? 'hover:bg-white/5 text-[#8A9DB0]' : 'hover:bg-gray-100 text-gray-500'
                      }`}
                    >
                      همه را خوانده
                    </button>
                  )}
                  <button
                    onClick={() => setIsOpen(false)}
                    className={`p-1 rounded-lg transition-colors ${
                      isDark ? 'hover:bg-white/5 text-[#8A9DB0]' : 'hover:bg-gray-100 text-gray-500'
                    }`}
                  >
                    <XMarkIcon className="w-4 h-4" />
                  </button>
                </div>
              </div>

              <div className="p-3 space-y-2">
                {alerts.length === 0 ? (
                  <div className="text-center py-8">
                    <div className="text-4xl mb-2">✅</div>
                    <p className={`text-sm ${isDark ? 'text-[#8A9DB0]' : 'text-gray-500'}`}>همه‌چیز خوب است!</p>
                    <p className={`text-xs ${isDark ? 'text-[#4A6A8A]' : 'text-gray-400'}`}>هیچ هشداری وجود ندارد</p>
                  </div>
                ) : (
                  alerts.map((alert: Alert) => (
                    <div
                      key={alert.id}
                      className={`p-3 rounded-xl border transition-all ${
                        alert.readAt 
                          ? isDark ? 'bg-[#0A1628]/50 border-[#AACCDD]/5 opacity-60' : 'bg-gray-50 border-gray-100 opacity-60'
                          : isDark ? 'bg-[#0A1628] border-[#AACCDD]/20' : 'bg-white border-gray-200 shadow-sm'
                      } ${getSeverityColor(alert.severity)}`}
                    >
                      <div className="flex items-start justify-between gap-3">
                        <div className="flex-1 min-w-0">
                          <div className="flex items-center gap-2">
                            <span>{getSeverityIcon(alert.severity)}</span>
                            <p className={`text-sm font-medium truncate ${isDark ? 'text-white' : 'text-gray-800'}`}>
                              {alert.title}
                            </p>
                          </div>
                          <p className={`text-xs mt-1 line-clamp-2 ${isDark ? 'text-[#8A9DB0]' : 'text-gray-500'}`}>
                            {alert.description}
                          </p>
                          <div className="flex items-center gap-2 mt-1.5">
                            <span className={`text-[9px] px-1.5 py-0.5 rounded ${
                              isDark ? 'bg-[#1A2A3A] text-[#8A9DB0]' : 'bg-gray-100 text-gray-500'
                            }`}>
                              {alert.entityCode}
                            </span>
                            <span className={`text-[9px] ${isDark ? 'text-[#4A6A8A]' : 'text-gray-400'}`}>
                              {new Date(alert.createdAt).toLocaleTimeString('fa-IR')}
                            </span>
                          </div>
                        </div>
                        <div className="flex flex-col items-end gap-1 flex-shrink-0">
                          {!alert.readAt && (
                            <button
                              onClick={() => handleMarkAsRead(alert.id)}
                              className={`p-1 rounded-lg transition-colors ${
                                isDark ? 'hover:bg-white/5 text-[#8A9DB0]' : 'hover:bg-gray-100 text-gray-500'
                              }`}
                              title="خوانده شد"
                            >
                              <CheckIcon className="w-3 h-3" />
                            </button>
                          )}
                          {alert.severity === 'CRITICAL' && (
                            <span className="text-[8px] font-bold text-red-400 animate-pulse">فوری</span>
                          )}
                        </div>
                      </div>
                    </div>
                  ))
                )}
              </div>

              {alerts.length > 0 && (
                <div className={`p-3 border-t text-center ${
                  isDark ? 'border-[#AACCDD]/10' : 'border-gray-200'
                }`}>
                  <button className={`text-xs ${isDark ? 'text-[#8A9DB0] hover:text-[#00D4FF]' : 'text-gray-500 hover:text-[#C9A227]'} transition-colors`}>
                    مشاهده همه هشدارها →
                  </button>
                </div>
              )}
            </motion.div>
          </>
        )}
      </AnimatePresence>
    </div>
  );
}

export default AlertBell;