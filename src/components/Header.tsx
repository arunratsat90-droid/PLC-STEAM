import React from 'react';
import { RefreshCw, FileSpreadsheet, Settings, ExternalLink, CheckCircle2, Building2 } from 'lucide-react';

interface HeaderProps {
  sheetUrl: string;
  lastFetched: string | null;
  isLoading: boolean;
  onRefresh: () => void;
  onOpenSettings: () => void;
  totalSubmissions: number;
}

export const Header: React.FC<HeaderProps> = ({
  sheetUrl,
  lastFetched,
  isLoading,
  onRefresh,
  onOpenSettings,
  totalSubmissions,
}) => {
  const formatLastUpdated = (isoString: string | null) => {
    if (!isoString) return 'ยังไม่ได้โหลดข้อมูล';
    try {
      const date = new Date(isoString);
      return date.toLocaleTimeString('th-TH', { hour: '2-digit', minute: '2-digit', second: '2-digit' }) + ' น.';
    } catch {
      return isoString;
    }
  };

  return (
    <header className="bg-white border-b border-slate-200 shadow-xs sticky top-0 z-20">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4">
        <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
          
          {/* Title & Branding */}
          <div className="flex items-start sm:items-center space-x-3.5">
            <div className="p-3 bg-indigo-600 text-white rounded-xl shadow-md shadow-indigo-100 flex-shrink-0">
              <Building2 className="w-6 h-6 sm:w-7 sm:h-7" />
            </div>
            <div>
              <div className="flex items-center space-x-2 flex-wrap">
                <h1 className="text-xl sm:text-2xl font-bold text-slate-900 tracking-tight">
                  Dashboard รายงานผล PLC & STEAM Education
                </h1>
                <span className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full text-xs font-semibold bg-emerald-50 text-emerald-700 border border-emerald-200">
                  <CheckCircle2 className="w-3.5 h-3.5" />
                  เชื่อมต่อ Google Sheet แล้ว ({totalSubmissions} รายการ)
                </span>
              </div>
              <p className="text-xs sm:text-sm text-slate-500 mt-0.5">
                ติดตามการส่งแบบรายงาน PLC และการจัดการเรียนรู้เชิงรุก (สะตีมศึกษา) รายโรงเรียน
              </p>
            </div>
          </div>

          {/* Actions & Status */}
          <div className="flex items-center space-x-2.5 self-end md:self-center flex-wrap gap-y-2">
            
            {/* Last updated badge */}
            {lastFetched && (
              <span className="text-xs text-slate-500 hidden lg:inline-block bg-slate-100 px-3 py-1.5 rounded-lg border border-slate-200">
                อัปเดตล่าสุด: <span className="font-semibold text-slate-700">{formatLastUpdated(lastFetched)}</span>
              </span>
            )}

            {/* Google Sheets Direct Link */}
            <a
              href={sheetUrl}
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex items-center space-x-1.5 px-3 py-2 text-xs sm:text-sm font-medium text-emerald-700 bg-emerald-50 hover:bg-emerald-100 border border-emerald-200 rounded-lg transition-colors"
              title="เปิดไฟล์ Google Sheet ในแท็บใหม่"
            >
              <FileSpreadsheet className="w-4 h-4 text-emerald-600" />
              <span className="hidden sm:inline">Google Sheet</span>
              <ExternalLink className="w-3.5 h-3.5 opacity-70" />
            </a>

            {/* Refresh Button */}
            <button
              onClick={onRefresh}
              disabled={isLoading}
              className={`inline-flex items-center space-x-1.5 px-3.5 py-2 text-xs sm:text-sm font-medium text-slate-700 bg-slate-100 hover:bg-slate-200 active:bg-slate-300 border border-slate-200 rounded-lg transition-all ${
                isLoading ? 'opacity-70 cursor-not-allowed' : ''
              }`}
            >
              <RefreshCw className={`w-4 h-4 text-slate-600 ${isLoading ? 'animate-spin' : ''}`} />
              <span>{isLoading ? 'กำลังโหลด...' : 'รีเฟรชข้อมูล'}</span>
            </button>

            {/* Settings Modal Button */}
            <button
              onClick={onOpenSettings}
              className="p-2 text-slate-600 hover:text-slate-900 bg-slate-100 hover:bg-slate-200 border border-slate-200 rounded-lg transition-colors"
              title="ตั้งค่าลิงก์ Google Sheet"
            >
              <Settings className="w-4 h-4" />
            </button>

          </div>

        </div>
      </div>
    </header>
  );
};
