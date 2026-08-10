import React, { useState, useEffect, useMemo, useCallback } from 'react';
import { SchoolReport, DashboardSummary, FilterOptions, SchoolEvaluation } from './types';
import { Header } from './components/Header';
import { StatsCards } from './components/StatsCards';
import { ChartsSection } from './components/ChartsSection';
import { FilterBar } from './components/FilterBar';
import { ReportTable } from './components/ReportTable';
import { DetailModal } from './components/DetailModal';
import { LightboxModal } from './components/LightboxModal';
import { SettingsModal } from './components/SettingsModal';
import { SteamEvaluationModal } from './components/SteamEvaluationModal';
import { GoogleSheetSyncModal } from './components/GoogleSheetSyncModal';
import { SaveSuccessPopup } from './components/SaveSuccessPopup';
import { getStoredEvaluations, saveSchoolEvaluation, findSchoolEvaluation } from './utils/evaluationStorage';
import { Download, AlertCircle, RefreshCw, FileSpreadsheet, Share2 } from 'lucide-react';

const DEFAULT_SHEET_URL = 'https://docs.google.com/spreadsheets/d/15oVvMev4APIW-6xNdh2igbjRGHzS6HJ9SV0KQnEbYD0/edit?usp=sharing';

export default function App() {
  const [reports, setReports] = useState<SchoolReport[]>([]);
  const [summary, setSummary] = useState<DashboardSummary | null>(null);
  const [isLoading, setIsLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);
  const [sheetUrl, setSheetUrl] = useState<string>(DEFAULT_SHEET_URL);

  // Filter State
  const [filters, setFilters] = useState<FilterOptions>({
    searchQuery: '',
    selectedGroup: 'all',
    selectedStatus: 'all',
    sortBy: 'timestamp_desc',
  });

  // Persistent Evaluation State (Per-School)
  const [evaluations, setEvaluations] = useState<Record<string, SchoolEvaluation>>(() => getStoredEvaluations());

  // Modal States
  const [selectedReport, setSelectedReport] = useState<SchoolReport | null>(null);
  const [evaluatingReport, setEvaluatingReport] = useState<SchoolReport | null>(null);
  const [lightboxData, setLightboxData] = useState<{ url: string; title: string } | null>(null);
  const [isSettingsOpen, setIsSettingsOpen] = useState<boolean>(false);
  const [isSyncModalOpen, setIsSyncModalOpen] = useState<boolean>(false);
  const [saveSuccessPopupData, setSaveSuccessPopupData] = useState<SchoolEvaluation | null>(null);

  // Save school evaluation handler
  const handleSaveEvaluation = (evalData: SchoolEvaluation) => {
    const updated = saveSchoolEvaluation(evalData);
    setEvaluations(updated);
    setSaveSuccessPopupData(evalData);
  };

  // Fetch Data Function
  const fetchData = useCallback(async (customUrl?: string) => {
    setIsLoading(true);
    setError(null);
    try {
      const targetUrl = customUrl || sheetUrl;
      const response = await fetch(`/api/reports?sheetUrl=${encodeURIComponent(targetUrl)}`);
      const result = await response.json();

      if (result.success) {
        setReports(result.data.reports);
        setSummary(result.data.summary);
      } else {
        throw new Error(result.error || 'เกิดข้อผิดพลาดในการโหลดข้อมูล');
      }
    } catch (err: any) {
      console.error('Fetch error:', err);
      setError(err.message || 'ไม่สามารถเชื่อมต่อเครื่องแม่ข่ายได้ กรุณาลองใหม่อีกครั้ง');
    } finally {
      setIsLoading(false);
    }
  }, [sheetUrl]);

  useEffect(() => {
    fetchData();
  }, [fetchData]);

  // Extract list of all unique school groups
  const groupsList = useMemo(() => {
    const set = new Set<string>();
    reports.forEach((r) => {
      if (r.schoolGroup) set.add(r.schoolGroup);
    });
    return Array.from(set).sort((a, b) => a.localeCompare(b, 'th'));
  }, [reports]);

  // Filter and Sort Logic
  const filteredReports = useMemo(() => {
    return reports
      .filter((item) => {
        // Search Query
        if (filters.searchQuery.trim()) {
          const q = filters.searchQuery.trim().toLowerCase();
          const matchName = item.schoolName.toLowerCase().includes(q);
          const matchGroup = item.schoolGroup.toLowerCase().includes(q);
          if (!matchName && !matchGroup) return false;
        }

        // Group Filter
        if (filters.selectedGroup !== 'all' && item.schoolGroup !== filters.selectedGroup) {
          return false;
        }

        // Status Filter
        if (filters.selectedStatus === 'complete' && item.completionStatus !== 'complete') {
          return false;
        }
        if (filters.selectedStatus === 'plc_only' && !item.hasPlc) {
          return false;
        }
        if (filters.selectedStatus === 'steam_only' && !item.hasSteam) {
          return false;
        }

        return true;
      })
      .sort((a, b) => {
        if (filters.sortBy === 'school_asc') {
          return a.schoolName.localeCompare(b.schoolName, 'th');
        }
        if (filters.sortBy === 'school_desc') {
          return b.schoolName.localeCompare(a.schoolName, 'th');
        }
        if (filters.sortBy === 'group_asc') {
          return a.schoolGroup.localeCompare(b.schoolGroup, 'th');
        }
        if (filters.sortBy === 'timestamp_asc') {
          return a.id.localeCompare(b.id, undefined, { numeric: true });
        }
        // Default timestamp_desc
        return b.id.localeCompare(a.id, undefined, { numeric: true });
      });
  }, [reports, filters]);

  // Handle Filter Update
  const handleFilterChange = (updated: Partial<FilterOptions>) => {
    setFilters((prev) => ({ ...prev, ...updated }));
  };

  const handleResetFilters = () => {
    setFilters({
      searchQuery: '',
      selectedGroup: 'all',
      selectedStatus: 'all',
      sortBy: 'timestamp_desc',
    });
  };

  // Modal Prev/Next Navigation
  const currentModalIndex = useMemo(() => {
    if (!selectedReport) return -1;
    return filteredReports.findIndex((r) => r.id === selectedReport.id);
  }, [selectedReport, filteredReports]);

  const handleModalNavigate = (direction: 'prev' | 'next') => {
    if (currentModalIndex === -1) return;
    if (direction === 'prev' && currentModalIndex > 0) {
      setSelectedReport(filteredReports[currentModalIndex - 1]);
    } else if (direction === 'next' && currentModalIndex < filteredReports.length - 1) {
      setSelectedReport(filteredReports[currentModalIndex + 1]);
    }
  };

  // Export CSV Function
  const handleExportCSV = () => {
    if (filteredReports.length === 0) return;
    const headers = ['ลำดับ', 'ประทับเวลา', 'ชื่อโรงเรียน', 'กลุ่มโรงเรียน', 'สถานะรายงาน PLC', 'สถานะรายงาน STEAM', 'ลิงก์ PLC', 'ลิงก์ STEAM'];
    const csvRows = [headers.join(',')];

    filteredReports.forEach((item, index) => {
      const row = [
        index + 1,
        `"${item.timestamp.replace(/"/g, '""')}"`,
        `"${item.schoolName.replace(/"/g, '""')}"`,
        `"${item.schoolGroup.replace(/"/g, '""')}"`,
        item.hasPlc ? 'ส่งแล้ว' : 'ยังไม่ส่ง',
        item.hasSteam ? 'ส่งแล้ว' : 'ยังไม่ส่ง',
        `"${(item.plcUrl || '').replace(/"/g, '""')}"`,
        `"${(item.steamUrl || '').replace(/"/g, '""')}"`,
      ];
      csvRows.push(row.join(','));
    });

    const blob = new Blob(['\uFEFF' + csvRows.join('\n')], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.setAttribute('download', `รายงานผล_PLC_STEAM_${new Date().toISOString().slice(0, 10)}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  return (
    <div className="min-h-screen bg-slate-50 text-slate-800 flex flex-col font-['Prompt',sans-serif]">
      
      {/* Header */}
      <Header
        sheetUrl={sheetUrl}
        lastFetched={summary?.lastFetched || null}
        isLoading={isLoading}
        onRefresh={() => fetchData()}
        onOpenSettings={() => setIsSettingsOpen(true)}
        totalSubmissions={reports.length}
      />

      {/* Main Container */}
      <main className="flex-1 max-w-7xl w-full mx-auto px-4 sm:px-6 lg:px-8 py-6 sm:py-8">
        
        {/* Error Alert Banner */}
        {error && (
          <div className="mb-6 bg-red-50 border border-red-200 text-red-800 p-4 rounded-2xl flex items-center justify-between">
            <div className="flex items-center space-x-3">
              <AlertCircle className="w-5 h-5 text-red-600 flex-shrink-0" />
              <p className="text-sm font-medium">{error}</p>
            </div>
            <button
              onClick={() => fetchData()}
              className="px-3 py-1.5 bg-red-600 hover:bg-red-700 text-white rounded-lg text-xs font-semibold flex items-center gap-1 transition-colors"
            >
              <RefreshCw className="w-3.5 h-3.5" />
              <span>ลองใหม่</span>
            </button>
          </div>
        )}

        {/* Top Summary Cards */}
        <StatsCards
          summary={summary}
          activeStatus={filters.selectedStatus}
          onSelectStatusFilter={(st) => handleFilterChange({ selectedStatus: st })}
        />

        {/* Interactive Recharts Section */}
        <ChartsSection
          summary={summary}
          selectedGroup={filters.selectedGroup}
          onSelectGroup={(grp) => handleFilterChange({ selectedGroup: grp })}
        />

        {/* Filter and Search Bar */}
        <FilterBar
          filters={filters}
          groupsList={groupsList}
          totalCount={reports.length}
          filteredCount={filteredReports.length}
          onFilterChange={handleFilterChange}
          onResetFilters={handleResetFilters}
        />

        {/* Section Header with Export & Sync Buttons */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 mb-3 px-1">
          <h2 className="text-base font-bold text-slate-900 flex items-center gap-2">
            <FileSpreadsheet className="w-5 h-5 text-indigo-600" />
            <span>ตารางรายชื่อโรงเรียนและเอกสารแนบ</span>
            <span className="text-xs font-medium text-slate-500 bg-slate-200 px-2 py-0.5 rounded-full">
              {filteredReports.length} รายการ
            </span>
          </h2>

          <div className="flex items-center space-x-2">
            <button
              onClick={() => setIsSyncModalOpen(true)}
              className="inline-flex items-center space-x-1.5 px-3.5 py-1.5 text-xs font-bold text-emerald-800 bg-emerald-50 hover:bg-emerald-100 border border-emerald-300 rounded-xl shadow-2xs transition-all"
            >
              <Share2 className="w-4 h-4 text-emerald-600" />
              <span>ส่งออก/ซิงค์ 2 คอลัมน์ไป Google Sheets</span>
            </button>

            <button
              onClick={handleExportCSV}
              disabled={filteredReports.length === 0}
              className="inline-flex items-center space-x-1.5 px-3.5 py-1.5 text-xs font-semibold text-slate-700 bg-white hover:bg-slate-100 border border-slate-200 rounded-xl shadow-2xs transition-colors disabled:opacity-40"
            >
              <Download className="w-4 h-4 text-slate-500" />
              <span className="hidden sm:inline">ส่งออก CSV</span>
            </button>
          </div>
        </div>

        {/* Data Table */}
        <ReportTable
          reports={filteredReports}
          evaluations={evaluations}
          onSelectReport={(report) => setSelectedReport(report)}
          onOpenLightbox={(url, title) => setLightboxData({ url, title })}
          onOpenSteamEvaluation={(report) => setEvaluatingReport(report)}
        />

      </main>

      {/* Footer */}
      <footer className="bg-white border-t border-slate-200 py-6 text-center text-xs text-slate-500">
        <div className="max-w-7xl mx-auto px-4">
          <p>ระบบติดตามผลการดำเนินงาน PLC และ STEAM Education</p>
          <p className="text-[11px] text-slate-400 mt-1">
            เชื่อมโยงข้อมูลโดยตรงกับ Google Sheets &amp; Google Drive File Preview Engine
          </p>
        </div>
      </footer>

      {/* Popups & Modals */}

      {/* 1. Detail Popup Modal (Requested by user) */}
      <DetailModal
        report={selectedReport}
        schoolEvaluation={selectedReport ? findSchoolEvaluation(evaluations, selectedReport) : null}
        onClose={() => setSelectedReport(null)}
        onOpenLightbox={(url, title) => setLightboxData({ url, title })}
        onOpenSteamEvaluation={(report) => setEvaluatingReport(report)}
        onNavigate={handleModalNavigate}
        hasPrev={currentModalIndex > 0}
        hasNext={currentModalIndex !== -1 && currentModalIndex < filteredReports.length - 1}
      />

      {/* 2. STEAM Evaluation Rubric Modal */}
      <SteamEvaluationModal
        isOpen={!!evaluatingReport}
        report={evaluatingReport}
        savedEvaluation={evaluatingReport ? findSchoolEvaluation(evaluations, evaluatingReport) : null}
        onSaveEvaluation={handleSaveEvaluation}
        onClose={() => setEvaluatingReport(null)}
      />

      {/* 3. Lightbox Modal */}
      <LightboxModal
        imageUrl={lightboxData?.url || null}
        title={lightboxData?.title || null}
        onClose={() => setLightboxData(null)}
      />

      {/* 4. Settings Modal */}
      <SettingsModal
        isOpen={isSettingsOpen}
        currentSheetUrl={sheetUrl}
        onClose={() => setIsSettingsOpen(false)}
        onSaveSheetUrl={(newUrl) => {
          setSheetUrl(newUrl);
          fetchData(newUrl);
        }}
      />

      {/* 5. Google Sheet 2-Column Sync Modal */}
      <GoogleSheetSyncModal
        isOpen={isSyncModalOpen}
        reports={reports}
        evaluations={evaluations}
        sheetUrl={sheetUrl}
        onClose={() => setIsSyncModalOpen(false)}
      />

      {/* 6. Success Save Confirmation Popup */}
      <SaveSuccessPopup
        evaluation={saveSuccessPopupData}
        onClose={() => setSaveSuccessPopupData(null)}
      />

    </div>
  );
}
