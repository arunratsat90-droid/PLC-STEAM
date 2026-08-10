import React, { useState, useEffect } from 'react';
import { SchoolReport, SchoolEvaluation } from '../types';
import { getGroupColor } from '../utils/colors';
import {
  X,
  ExternalLink,
  FileText,
  Sparkles,
  CheckCircle2,
  AlertCircle,
  Maximize2,
  Eye,
  Calendar,
  Building2,
  ChevronLeft,
  ChevronRight,
  Download,
  Copy,
  Check,
} from 'lucide-react';

interface DetailModalProps {
  report: SchoolReport | null;
  schoolEvaluation?: SchoolEvaluation | null;
  onClose: () => void;
  onOpenLightbox: (imageUrl: string, title: string) => void;
  onOpenSteamEvaluation?: (report: SchoolReport) => void;
  onNavigate?: (direction: 'prev' | 'next') => void;
  hasPrev?: boolean;
  hasNext?: boolean;
}

export const DetailModal: React.FC<DetailModalProps> = ({
  report,
  schoolEvaluation,
  onClose,
  onOpenLightbox,
  onOpenSteamEvaluation,
  onNavigate,
  hasPrev,
  hasNext,
}) => {
  const [activeTab, setActiveTab] = useState<'plc' | 'steam' | 'all'>('plc');
  const [viewMode, setViewMode] = useState<'image' | 'iframe'>('image');
  const [imgLoading, setImgLoading] = useState<Record<string, boolean>>({
    plc: true,
    steam: true,
  });
  const [imgError, setImgError] = useState<Record<string, boolean>>({
    plc: false,
    steam: false,
  });
  const [copiedLink, setCopiedLink] = useState<string | null>(null);

  // Default active tab based on available reports
  useEffect(() => {
    if (report) {
      if (report.hasPlc) {
        setActiveTab('plc');
      } else if (report.hasSteam) {
        setActiveTab('steam');
      } else {
        setActiveTab('all');
      }
      setImgLoading({ plc: true, steam: true });
      setImgError({ plc: false, steam: false });
    }
  }, [report]);

  // Handle ESC key to close
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape') onClose();
      if (e.key === 'ArrowLeft' && onNavigate && hasPrev) onNavigate('prev');
      if (e.key === 'ArrowRight' && onNavigate && hasNext) onNavigate('next');
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [onClose, onNavigate, hasPrev, hasNext]);

  if (!report) return null;

  const groupColor = getGroupColor(report.schoolGroup);

  const copyToClipboard = (url: string, key: string) => {
    navigator.clipboard.writeText(url);
    setCopiedLink(key);
    setTimeout(() => setCopiedLink(null), 2000);
  };

  return (
    <div className="fixed inset-0 z-50 overflow-y-auto bg-slate-900/60 backdrop-blur-xs flex items-center justify-center p-3 sm:p-4 md:p-6 animate-fadeIn">
      
      {/* Modal Container */}
      <div className="bg-white rounded-3xl shadow-2xl border border-slate-200 w-full max-w-4xl max-h-[92vh] flex flex-col overflow-hidden relative">
        
        {/* Top Navigation & Close Header */}
        <div className="bg-slate-900 text-white p-5 sm:p-6 flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-slate-800">
          
          <div className="flex items-start space-x-3">
            <div className={`p-2.5 rounded-xl ${groupColor.bg} ${groupColor.text} flex-shrink-0 mt-0.5`}>
              <Building2 className="w-6 h-6" />
            </div>
            <div>
              <div className="flex items-center space-x-2 flex-wrap gap-y-1">
                <span className={`px-2.5 py-0.5 text-xs font-semibold rounded-md border ${groupColor.bg} ${groupColor.text} ${groupColor.border}`}>
                  กลุ่ม{report.schoolGroup}
                </span>
                <span className="text-xs text-slate-400 flex items-center gap-1">
                  <Calendar className="w-3.5 h-3.5 text-slate-400" />
                  {report.formattedDate}
                </span>
              </div>
              <h2 className="text-xl sm:text-2xl font-bold text-white mt-1 leading-tight">
                {report.schoolName}
              </h2>
            </div>
          </div>

          <div className="flex items-center space-x-2 self-end sm:self-auto">
            {/* Prev / Next navigation inside modal */}
            {onNavigate && (
              <div className="flex items-center bg-slate-800 rounded-lg p-0.5 border border-slate-700 mr-2">
                <button
                  onClick={() => onNavigate('prev')}
                  disabled={!hasPrev}
                  className="p-1.5 text-slate-300 hover:text-white disabled:opacity-30 rounded-md transition-colors"
                  title="โรงเรียนก่อนหน้า (ลูกศรซ้าย)"
                >
                  <ChevronLeft className="w-5 h-5" />
                </button>
                <button
                  onClick={() => onNavigate('next')}
                  disabled={!hasNext}
                  className="p-1.5 text-slate-300 hover:text-white disabled:opacity-30 rounded-md transition-colors"
                  title="โรงเรียนถัดไป (ลูกศรขวา)"
                >
                  <ChevronRight className="w-5 h-5" />
                </button>
              </div>
            )}

            <button
              onClick={onClose}
              className="p-2 text-slate-400 hover:text-white bg-slate-800 hover:bg-slate-700 rounded-xl transition-colors border border-slate-700"
              title="ปิดหน้าต่าง (Esc)"
            >
              <X className="w-5 h-5" />
            </button>
          </div>

        </div>

        {/* Tab Navigation Controls */}
        <div className="bg-slate-50 border-b border-slate-200 px-6 py-2.5 flex flex-wrap items-center justify-between gap-3">
          
          <div className="flex space-x-1.5 overflow-x-auto py-1">
            <button
              onClick={() => setActiveTab('plc')}
              className={`px-4 py-2 rounded-xl text-xs sm:text-sm font-semibold transition-all flex items-center space-x-2 ${
                activeTab === 'plc'
                  ? 'bg-blue-600 text-white shadow-xs'
                  : 'bg-white text-slate-600 hover:bg-slate-100 border border-slate-200'
              }`}
            >
              <FileText className="w-4 h-4" />
              <span>รายงานผล PLC</span>
              {report.hasPlc ? (
                <span className="w-2 h-2 rounded-full bg-emerald-400"></span>
              ) : (
                <span className="w-2 h-2 rounded-full bg-slate-300"></span>
              )}
            </button>

            <button
              onClick={() => setActiveTab('steam')}
              className={`px-4 py-2 rounded-xl text-xs sm:text-sm font-semibold transition-all flex items-center space-x-2 ${
                activeTab === 'steam'
                  ? 'bg-amber-600 text-white shadow-xs'
                  : 'bg-white text-slate-600 hover:bg-slate-100 border border-slate-200'
              }`}
            >
              <Sparkles className="w-4 h-4" />
              <span>รายงาน STEAM Education</span>
              {report.hasSteam ? (
                <span className="w-2 h-2 rounded-full bg-emerald-400"></span>
              ) : (
                <span className="w-2 h-2 rounded-full bg-slate-300"></span>
              )}
            </button>

            <button
              onClick={() => setActiveTab('all')}
              className={`px-4 py-2 rounded-xl text-xs sm:text-sm font-semibold transition-all flex items-center space-x-2 ${
                activeTab === 'all'
                  ? 'bg-slate-800 text-white shadow-xs'
                  : 'bg-white text-slate-600 hover:bg-slate-100 border border-slate-200'
              }`}
            >
              <Eye className="w-4 h-4" />
              <span>แสดงทั้งหมด 2 เอกสาร</span>
            </button>
          </div>

          {/* View Mode Toggle (Image Preview vs Embedded Iframe Viewer) */}
          {(activeTab === 'plc' || activeTab === 'steam') && (
            <div className="flex items-center bg-slate-200/80 p-1 rounded-xl text-xs font-medium">
              <button
                onClick={() => setViewMode('image')}
                className={`px-3 py-1.5 rounded-lg transition-all ${
                  viewMode === 'image'
                    ? 'bg-white text-slate-900 shadow-2xs font-semibold'
                    : 'text-slate-600 hover:text-slate-900'
                }`}
              >
                ภาพตัวอย่าง
              </button>
              <button
                onClick={() => setViewMode('iframe')}
                className={`px-3 py-1.5 rounded-lg transition-all ${
                  viewMode === 'iframe'
                    ? 'bg-white text-slate-900 shadow-2xs font-semibold'
                    : 'text-slate-600 hover:text-slate-900'
                }`}
              >
                ดู PDF/เอกสารฉบับเต็ม
              </button>
            </div>
          )}

        </div>

        {/* Modal Scrollable Body */}
        <div className="p-6 overflow-y-auto flex-1 bg-slate-50/50">
          
          {/* TAB 1: PLC REPORT DETAIL */}
          {(activeTab === 'plc' || activeTab === 'all') && (
            <div className="mb-8 bg-white p-6 rounded-2xl border border-slate-200 shadow-2xs">
              <div className="flex flex-col sm:flex-row sm:items-center justify-between pb-4 border-b border-slate-100 gap-3">
                <div className="flex items-center space-x-2.5">
                  <div className="p-2 bg-blue-100 text-blue-700 rounded-lg">
                    <FileText className="w-5 h-5" />
                  </div>
                  <div>
                    <h3 className="text-base font-bold text-slate-900">
                      แบบรายงานผลการสร้างชุมชนแห่งการเรียนรู้ทางวิชาชีพ (PLC)
                    </h3>
                    <p className="text-xs text-slate-500">
                      เอกสารสรุปผลการจัดกิจกรรม PLC รายโรงเรียน
                    </p>
                  </div>
                </div>

                {report.plcViewUrl && (
                  <div className="flex items-center space-x-2">
                    <button
                      onClick={() => copyToClipboard(report.plcViewUrl!, 'plc')}
                      className="p-2 text-slate-500 hover:text-slate-700 bg-slate-100 hover:bg-slate-200 rounded-lg transition-colors text-xs flex items-center gap-1 font-medium"
                      title="คัดลอกลิงก์ไฟล์"
                    >
                      {copiedLink === 'plc' ? <Check className="w-4 h-4 text-emerald-600" /> : <Copy className="w-4 h-4" />}
                      <span className="hidden sm:inline">{copiedLink === 'plc' ? 'คัดลอกแล้ว' : 'คัดลอกลิงก์'}</span>
                    </button>

                    <a
                      href={report.plcViewUrl}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="px-3.5 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-lg text-xs font-semibold inline-flex items-center space-x-1.5 shadow-2xs transition-colors"
                    >
                      <span>เปิดใน Google Drive</span>
                      <ExternalLink className="w-3.5 h-3.5" />
                    </a>
                  </div>
                )}
              </div>

              {/* PLC Content Display */}
              <div className="mt-4">
                {report.hasPlc && report.plcThumbnailUrl ? (
                  <div>
                    {viewMode === 'image' || activeTab === 'all' ? (
                      /* High-Res Thumbnail Image View */
                      <div className="relative group bg-slate-900 rounded-xl overflow-hidden border border-slate-200 shadow-inner flex flex-col items-center justify-center min-h-[320px]">
                        {imgLoading.plc && (
                          <div className="absolute inset-0 bg-slate-100 flex flex-col items-center justify-center text-slate-400 z-10 animate-pulse">
                            <FileText className="w-10 h-10 mb-2 text-slate-300" />
                            <span className="text-xs">กำลังโหลดภาพตัวอย่าง...</span>
                          </div>
                        )}

                        <img
                          src={report.plcThumbnailUrl}
                          alt={`รายงาน PLC ${report.schoolName}`}
                          onLoad={() => setImgLoading((prev) => ({ ...prev, plc: false }))}
                          onError={(e) => {
                            setImgLoading((prev) => ({ ...prev, plc: false }));
                            setImgError((prev) => ({ ...prev, plc: true }));
                            // Fallback to proxy url if google direct thumbnail fails
                            (e.target as HTMLImageElement).src = `/api/drive-proxy?fileId=${report.plcFileId}`;
                          }}
                          className={`max-h-[520px] w-auto object-contain transition-transform duration-300 group-hover:scale-[1.01] ${
                            imgLoading.plc ? 'opacity-0' : 'opacity-100'
                          }`}
                        />

                        {/* Hover Overlay Button to Open Lightbox */}
                        <div className="absolute inset-0 bg-slate-900/40 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center space-x-3 pointer-events-none group-hover:pointer-events-auto">
                          <button
                            onClick={() =>
                              onOpenLightbox(
                                report.plcThumbnailUrl!,
                                `รายงาน PLC - ${report.schoolName}`
                              )
                            }
                            className="px-4 py-2.5 bg-white text-slate-900 rounded-xl text-xs font-bold shadow-lg flex items-center space-x-2 hover:bg-slate-100 transition-transform transform active:scale-95"
                          >
                            <Maximize2 className="w-4 h-4 text-indigo-600" />
                            <span>ขยายดูภาพเต็มหน้าจอ</span>
                          </button>
                        </div>
                      </div>
                    ) : (
                      /* Embedded Iframe Document Viewer */
                      <div className="w-full h-[520px] bg-slate-100 rounded-xl overflow-hidden border border-slate-200 shadow-inner relative">
                        <iframe
                          src={report.plcPreviewUrl!}
                          className="w-full h-full border-none"
                          title={`PDF Preview PLC ${report.schoolName}`}
                        />
                      </div>
                    )}
                  </div>
                ) : (
                  <div className="p-8 text-center bg-slate-50 rounded-xl border border-dashed border-slate-200">
                    <AlertCircle className="w-8 h-8 text-slate-400 mx-auto mb-2" />
                    <p className="text-sm font-medium text-slate-600">
                      โรงเรียนนี้ยังไม่ได้แนบลิงก์รายงานผล PLC
                    </p>
                  </div>
                )}
              </div>
            </div>
          )}

          {/* TAB 2: STEAM REPORT DETAIL */}
          {(activeTab === 'steam' || activeTab === 'all') && (
            <div className="mb-6 bg-white p-6 rounded-2xl border border-slate-200 shadow-2xs">
              <div className="flex flex-col lg:flex-row lg:items-center justify-between pb-4 border-b border-slate-100 gap-3">
                <div className="flex items-start space-x-2.5">
                  <div className="p-2 bg-amber-100 text-amber-800 rounded-lg shrink-0 mt-0.5">
                    <Sparkles className="w-5 h-5" />
                  </div>
                  <div>
                    <div className="flex items-center space-x-2 flex-wrap gap-y-1">
                      <h3 className="text-base font-bold text-slate-900">
                        แบบรายงานการจัดการเรียนรู้เชิงรุกตามแนวทางสะตีมศึกษา (STEAM)
                      </h3>
                      {schoolEvaluation && (
                        <span className="px-2.5 py-0.5 rounded-full text-xs font-bold bg-amber-100 text-amber-900 border border-amber-300">
                          คะแนน: {schoolEvaluation.totalScore}/24 (ระดับ{schoolEvaluation.qualityLevel})
                        </span>
                      )}
                    </div>
                    <p className="text-xs text-slate-500">
                      เอกสารสรุปผลการจัดการเรียนรู้เชิงรุกสะตีมศึกษา รายโรงเรียน
                    </p>
                  </div>
                </div>

                {report.steamViewUrl && (
                  <div className="flex items-center space-x-2 flex-wrap gap-y-2 shrink-0">
                    {onOpenSteamEvaluation && (
                      <button
                        onClick={() => onOpenSteamEvaluation(report)}
                        className="px-3.5 py-2 bg-amber-500 hover:bg-amber-600 text-slate-950 font-bold rounded-lg text-xs inline-flex items-center space-x-1.5 shadow-2xs transition-colors"
                      >
                        <Sparkles className="w-3.5 h-3.5" />
                        <span>{schoolEvaluation ? 'แก้ไขคะแนน' : 'ประเมิน 24 คะแนน'}</span>
                      </button>
                    )}

                    <button
                      onClick={() => copyToClipboard(report.steamViewUrl!, 'steam')}
                      className="p-2 text-slate-500 hover:text-slate-700 bg-slate-100 hover:bg-slate-200 rounded-lg transition-colors text-xs flex items-center gap-1 font-medium"
                      title="คัดลอกลิงก์ไฟล์"
                    >
                      {copiedLink === 'steam' ? <Check className="w-4 h-4 text-emerald-600" /> : <Copy className="w-4 h-4" />}
                      <span className="hidden sm:inline">{copiedLink === 'steam' ? 'คัดลอกแล้ว' : 'คัดลอกลิงก์'}</span>
                    </button>

                    <a
                      href={report.steamViewUrl}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="px-3.5 py-2 bg-amber-600 hover:bg-amber-700 text-white rounded-lg text-xs font-semibold inline-flex items-center space-x-1.5 shadow-2xs transition-colors"
                    >
                      <span>เปิดใน Google Drive</span>
                      <ExternalLink className="w-3.5 h-3.5" />
                    </a>
                  </div>
                )}
              </div>

              {/* School Evaluation Result Inline Bar if Evaluated */}
              {schoolEvaluation && (
                <div className="mt-3 p-3 bg-amber-50/80 border border-amber-200 rounded-xl flex items-center justify-between text-xs gap-3">
                  <div className="flex items-center space-x-3 flex-wrap gap-y-1">
                    <span className="font-bold text-amber-900">
                      คะแนนระบบ: <span className="text-indigo-800 font-extrabold">{schoolEvaluation.aiTotalScore || 20}/24</span>
                    </span>
                    <span className="text-amber-300">|</span>
                    <span className="font-bold text-amber-900">
                      คะแนนผู้รับผิดชอบ: <span className="text-emerald-800 font-extrabold">{schoolEvaluation.totalScore}/24</span> ({schoolEvaluation.qualityLevel})
                    </span>
                    {schoolEvaluation.evaluatorName && (
                      <>
                        <span className="text-amber-300">|</span>
                        <span className="text-slate-600">
                          โดย: {schoolEvaluation.evaluatorName}
                        </span>
                      </>
                    )}
                    {schoolEvaluation.evaluatorNotes && (
                      <span className="text-slate-600 italic block w-full sm:w-auto">
                        "{schoolEvaluation.evaluatorNotes}"
                      </span>
                    )}
                  </div>
                </div>
              )}

              {/* STEAM Content Display */}
              <div className="mt-4">
                {report.hasSteam && report.steamThumbnailUrl ? (
                  <div>
                    {viewMode === 'image' || activeTab === 'all' ? (
                      /* High-Res Thumbnail Image View */
                      <div className="relative group bg-slate-900 rounded-xl overflow-hidden border border-slate-200 shadow-inner flex flex-col items-center justify-center min-h-[320px]">
                        {imgLoading.steam && (
                          <div className="absolute inset-0 bg-slate-100 flex flex-col items-center justify-center text-slate-400 z-10 animate-pulse">
                            <Sparkles className="w-10 h-10 mb-2 text-amber-300" />
                            <span className="text-xs">กำลังโหลดภาพตัวอย่าง...</span>
                          </div>
                        )}

                        <img
                          src={report.steamThumbnailUrl}
                          alt={`รายงาน STEAM ${report.schoolName}`}
                          onLoad={() => setImgLoading((prev) => ({ ...prev, steam: false }))}
                          onError={(e) => {
                            setImgLoading((prev) => ({ ...prev, steam: false }));
                            setImgError((prev) => ({ ...prev, steam: true }));
                            (e.target as HTMLImageElement).src = `/api/drive-proxy?fileId=${report.steamFileId}`;
                          }}
                          className={`max-h-[520px] w-auto object-contain transition-transform duration-300 group-hover:scale-[1.01] ${
                            imgLoading.steam ? 'opacity-0' : 'opacity-100'
                          }`}
                        />

                        {/* Hover Overlay Button to Open Lightbox */}
                        <div className="absolute inset-0 bg-slate-900/40 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center space-x-3 pointer-events-none group-hover:pointer-events-auto">
                          <button
                            onClick={() =>
                              onOpenLightbox(
                                report.steamThumbnailUrl!,
                                `รายงาน STEAM - ${report.schoolName}`
                              )
                            }
                            className="px-4 py-2.5 bg-white text-slate-900 rounded-xl text-xs font-bold shadow-lg flex items-center space-x-2 hover:bg-slate-100 transition-transform transform active:scale-95"
                          >
                            <Maximize2 className="w-4 h-4 text-amber-600" />
                            <span>ขยายดูภาพเต็มหน้าจอ</span>
                          </button>
                        </div>
                      </div>
                    ) : (
                      /* Embedded Iframe Document Viewer */
                      <div className="w-full h-[520px] bg-slate-100 rounded-xl overflow-hidden border border-slate-200 shadow-inner relative">
                        <iframe
                          src={report.steamPreviewUrl!}
                          className="w-full h-full border-none"
                          title={`PDF Preview STEAM ${report.schoolName}`}
                        />
                      </div>
                    )}
                  </div>
                ) : (
                  <div className="p-8 text-center bg-slate-50 rounded-xl border border-dashed border-slate-200">
                    <AlertCircle className="w-8 h-8 text-slate-400 mx-auto mb-2" />
                    <p className="text-sm font-medium text-slate-600">
                      โรงเรียนนี้ยังไม่ได้แนบลิงก์รายงานผล STEAM Education
                    </p>
                  </div>
                )}
              </div>
            </div>
          )}

        </div>

        {/* Modal Footer */}
        <div className="bg-white border-t border-slate-200 px-6 py-4 flex items-center justify-between text-xs text-slate-500">
          <div className="flex items-center space-x-2">
            <CheckCircle2 className="w-4 h-4 text-emerald-500" />
            <span>สถานะ: {report.completionStatus === 'complete' ? 'ส่งครบทั้ง 2 รายงาน' : 'ส่งรายงานบางส่วน'}</span>
          </div>

          <button
            onClick={onClose}
            className="px-4 py-2 bg-slate-100 hover:bg-slate-200 text-slate-700 font-semibold rounded-xl transition-colors"
          >
            ปิดหน้าต่าง
          </button>
        </div>

      </div>

    </div>
  );
};
