// src/shared/components/AuditLog.tsx

import { useState, useEffect } from 'react';
import { ClockIcon, ChevronDownIcon, ChevronUpIcon } from '@heroicons/react/24/outline';

export interface AuditLogEntry {
  id: string;
  entityType: 'BLOCK' | 'SUB_BLOCK' | 'SAMPLE' | 'LAB_RESULT' | 'DESTINATION_DECISION';
  entityId: string;
  entityCode: string;
  action: 'CREATED' | 'UPDATED' | 'STATUS_CHANGED' | 'APPROVED' | 'REJECTED' | 'SUBMITTED' | 'EDITED';
  oldValue?: any;
  newValue?: any;
  changedFields?: string[];
  changedBy: string;
  changedByName: string;
  changedAt: string;
  description: string;
  version: number;
}

const AUDIT_LOG_KEY = 'aes_audit_log';

function getAuditLog(): AuditLogEntry[] {
  try {
    const data = localStorage.getItem(AUDIT_LOG_KEY);
    return data ? JSON.parse(data) : [];
  } catch {
    return [];
  }
}

function getAuditLogForEntity(entityId: string): AuditLogEntry[] {
  const log = getAuditLog();
  return log
    .filter(entry => entry.entityId === entityId)
    .sort((a, b) => new Date(b.changedAt).getTime() - new Date(a.changedAt).getTime());
}

interface AuditLogProps {
  entityId: string;
  entityType: 'BLOCK' | 'SUB_BLOCK';
}

export function AuditLog({ entityId }: AuditLogProps) {
  const [logs, setLogs] = useState<AuditLogEntry[]>([]);
  const [show, setShow] = useState(false);
  const [expanded, setExpanded] = useState<string | null>(null);

  useEffect(() => {
    if (show) {
      setLogs(getAuditLogForEntity(entityId));
    }
  }, [show, entityId]);

  const toggleExpand = (id: string) => {
    setExpanded(expanded === id ? null : id);
  };

  const renderChanges = (log: AuditLogEntry) => {
    if (!log.oldValue || !log.newValue) return null;
    
    const changedKeys = Object.keys(log.newValue).filter(
      key => JSON.stringify(log.oldValue?.[key]) !== JSON.stringify(log.newValue[key])
    );

    if (changedKeys.length === 0) return null;

    return (
      <div className="mt-2 space-y-1 text-sm">
        {changedKeys.map((key) => (
          <div key={key} className="flex items-center gap-2 text-xs">
            <span className="text-[#8A9DB0]">{key}:</span>
            <span className="text-red-400 line-through">{log.oldValue?.[key]}</span>
            <span className="text-[#4A6A8A]">→</span>
            <span className="text-green-400">{log.newValue[key]}</span>
          </div>
        ))}
      </div>
    );
  };

  return (
    <div className="relative inline-block">
      <button
        onClick={() => setShow(!show)}
        className="p-1.5 rounded-lg hover:bg-white/5 transition-colors text-[#4A6A8A] hover:text-white"
        title="تاریخچه تغییرات"
      >
        <ClockIcon className="w-4 h-4" />
      </button>

      {show && (
        <div className="absolute left-0 mt-2 w-80 max-h-80 overflow-y-auto bg-[#0A1628] border border-[#AACCDD]/20 rounded-xl shadow-2xl z-50 p-3">
          <h4 className="text-white font-semibold text-sm mb-2 flex items-center justify-between">
            <span>تاریخچه تغییرات</span>
            <span className="text-[#4A6A8A] text-xs">{logs.length} تغییر</span>
          </h4>

          {logs.length === 0 ? (
            <p className="text-[#4A6A8A] text-sm">تغییری ثبت نشده است.</p>
          ) : (
            <div className="space-y-2">
              {logs.map((log) => (
                <div key={log.id} className="border-b border-[#AACCDD]/10 pb-2 last:border-0">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2">
                      <span className="text-[#AACCDD] text-[10px] font-mono">
                        {new Date(log.changedAt).toLocaleString('fa-IR')}
                      </span>
                      <span className={`px-1.5 py-0.5 rounded text-[9px] ${
                        log.action === 'CREATED' ? 'bg-green-500/20 text-green-300' :
                        log.action === 'EDITED' ? 'bg-yellow-500/20 text-yellow-300' :
                        log.action === 'APPROVED' ? 'bg-blue-500/20 text-blue-300' :
                        'bg-gray-500/20 text-gray-300'
                      }`}>
                        {log.action === 'CREATED' ? 'ایجاد' :
                         log.action === 'EDITED' ? 'ویرایش' :
                         log.action === 'APPROVED' ? 'تأیید' : 'به‌روز'}
                      </span>
                    </div>
                    <button
                      onClick={() => toggleExpand(log.id)}
                      className="text-[#4A6A8A] hover:text-[#AACCDD] transition-colors"
                    >
                      {expanded === log.id ? (
                        <ChevronUpIcon className="w-3 h-3" />
                      ) : (
                        <ChevronDownIcon className="w-3 h-3" />
                      )}
                    </button>
                  </div>

                  <p className="text-[#8A9DB0] text-xs mt-1">{log.description}</p>
                  <p className="text-[#4A6A8A] text-[10px] mt-0.5">
                    توسط: {log.changedByName} | نسخه: {log.version}
                  </p>

                  {expanded === log.id && renderChanges(log)}
                </div>
              ))}
            </div>
          )}
        </div>
      )}
    </div>
  );
}