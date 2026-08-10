import React from 'react';
import { SchoolReport, SchoolEvaluation } from '../types';
import { getGroupColor } from '../utils/colors';
import { findSchoolEvaluation } from '../utils/evaluationStorage';
import { FileText, Image as ImageIcon, ExternalLink, CheckCircle2, AlertCircle, Eye, Sparkles, Award, Cpu, UserCheck, Edit3 } from 'lucide-react';

interface ReportTableProps {
  reports: SchoolReport[];
  evaluations?: Record<string, SchoolEvaluation>;
  onSelectReport: (report: SchoolReport) => void;
  onOpenLightbox: (imageUrl: string, title: string) => void;
  onOpenSteamEvaluation?: (report: SchoolReport) => void;
}

export const ReportTable: React.FC<ReportTableProps> = ({
  reports,
  evaluations = {},
  onSelectReport,
  onOpenLightbox,
  onOpenSteamEvaluation,
}) => {
  if (reports.length === 0) {
    return (
      <div className="bg-white rounded-2xl border border-slate-200/80 p-12 text-center my-6">
        <div className="w-16 h-16 bg-slate-100 text-slate-400 rounded-full flex items-center justify-center mx-auto mb-4">
          <FileText className="w-8 h-8" />
        </div>
        <h3 className="text-lg font-bold text-slate-800 mb-1">ไม่พบข้อมูลโรงเรียน</h3>
        <p className="text-sm text-slate-500 max-w-md mx-auto">
          ไม่พบรายการข้อมูลที่ตรงกับเงื่อนไขการกรองหรือคำค้นหาของคุณ ลองเปลี่ยนคำค้นหาหรือล้างตัวกรอง
        </p>
      </div>
    );
  }

  return (
    <div className="bg-white rounded-2xl border border-slate-200/80 shadow-xs overflow-hidden mb-8">
      <div className="overflow-x-auto">
        <table className="w-full text-left border-collapse">
          <thead>
            <tr className="bg-slate-50/80 border-b border-slate-200 text-[12px] font-semibold text-slate-700 uppercase tracking-wider">
              <th className="py-3.5 px-3 text-center w-10">#</th>
              <th className="py-3.5 px-3 min-w-[180px]">ชื่อโรงเรียน</th>
              <th className="py-3.5 px-3 min-w-[110px]">กลุ่มโรงเรียน</th>
              <th className="py-3.5 px-3 min-w-[120px]">รายงาน PLC</th>
              <th className="py-3.5 px-3 min-w-[120px]">รายงาน STEAM</th>
              <th className="py-3.5 px-3 min-w-[150px] bg-indigo-50/60 text-indigo-900 border-x border-indigo-100">
                <span className="flex items-center gap-1 font-bold">
                  <Cpu className="w-3.5 h-3.5 text-indigo-600" />
                  1. คะแนนเบื้องต้น (ระบบ)
                </span>
              </th>
              <th className="py-3.5 px-3 min-w-[170px] bg-amber-50/70 text-amber-950 border-r border-amber-200/60">
                <span className="flex items-center gap-1 font-bold">
                  <UserCheck className="w-3.5 h-3.5 text-amber-600" />
                  2. คะแนนจากผู้รับผิดชอบ
                </span>
              </th>
              <th className="py-3.5 px-3 min-w-[120px]">ประทับเวลา</th>
              <th className="py-3.5 px-3 text-center w-32">การกระทำ</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-100 text-sm">
            {reports.map((item, index) => {
              const groupColor = getGroupColor(item.schoolGroup);
              const schoolEval = findSchoolEvaluation(evaluations, item);

              return (
                <tr
                  key={item.id}
                  className="hover:bg-indigo-50/30 transition-colors group align-middle"
                >
                  {/* Row index */}
                  <td className="py-4 px-4 text-center font-medium text-slate-400 text-xs align-middle">
                    {index + 1}
                  </td>

                  {/* School Name (Primary Trigger) */}
                  <td className="py-4 px-4 align-middle">
                    <button
                      onClick={() => onSelectReport(item)}
                      className="text-left font-semibold text-slate-900 group-hover:text-indigo-600 transition-colors hover:underline flex items-start space-x-2"
                    >
                      <span className="line-clamp-2">{item.schoolName}</span>
                    </button>
                    {item.completionStatus === 'complete' && (
                      <span className="inline-flex items-center gap-1 text-[11px] font-medium text-emerald-600 mt-0.5">
                        <CheckCircle2 className="w-3 h-3" /> ส่งครบเรียบร้อย
                      </span>
                    )}
                  </td>

                  {/* School Group Badge */}
                  <td className="py-4 px-4 align-middle">
                    <span
                      className={`inline-flex items-center px-2.5 py-1 rounded-lg text-xs font-semibold border ${groupColor.bg} ${groupColor.text} ${groupColor.border}`}
                    >
                      กลุ่ม{item.schoolGroup}
                    </span>
                  </td>

                  {/* PLC Report Status & Thumbnail Preview */}
                  <td className="py-4 px-4 align-middle">
                    {item.hasPlc ? (
                      <div className="flex items-center space-x-2">
                        <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-md text-xs font-medium bg-blue-50 text-blue-700 border border-blue-200">
                          <CheckCircle2 className="w-3.5 h-3.5 text-blue-600" />
                          ส่งแล้ว
                        </span>

                        {item.plcThumbnailUrl && (
                          <button
                            onClick={() =>
                              onOpenLightbox(
                                item.plcThumbnailUrl!,
                                `รายงาน PLC - ${item.schoolName}`
                              )
                            }
                            className="p-1 text-slate-400 hover:text-blue-600 hover:bg-blue-50 rounded transition-colors"
                            title="ดูภาพตัวอย่างรายงาน PLC"
                          >
                            <ImageIcon className="w-4 h-4" />
                          </button>
                        )}
                      </div>
                    ) : (
                      <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-md text-xs font-medium bg-slate-100 text-slate-400">
                        <AlertCircle className="w-3.5 h-3.5" />
                        ยังไม่พบแนบไฟล์
                      </span>
                    )}
                  </td>

                  {/* STEAM Report Status & Thumbnail Preview */}
                  <td className="py-4 px-4 align-middle">
                    {item.hasSteam ? (
                      <div className="flex items-center space-x-2">
                        <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-md text-xs font-medium bg-amber-50 text-amber-800 border border-amber-200">
                          <Sparkles className="w-3.5 h-3.5 text-amber-600" />
                          ส่งแล้ว
                        </span>

                        {item.steamThumbnailUrl && (
                          <button
                            onClick={() =>
                              onOpenLightbox(
                                item.steamThumbnailUrl!,
                                `รายงาน STEAM Education - ${item.schoolName}`
                              )
                            }
                            className="p-1 text-slate-400 hover:text-amber-600 hover:bg-amber-50 rounded transition-colors"
                            title="ดูภาพตัวอย่างรายงาน STEAM"
                          >
                            <ImageIcon className="w-4 h-4" />
                          </button>
                        )}
                      </div>
                    ) : (
                      <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-md text-xs font-medium bg-slate-100 text-slate-400">
                        <AlertCircle className="w-3.5 h-3.5" />
                        ยังไม่พบแนบไฟล์
                      </span>
                    )}
                  </td>

                  {/* Column 1: AI Initial Evaluation Score */}
                  <td className="py-4 px-3 bg-indigo-50/20 border-x border-indigo-100/70 align-middle">
                    {item.hasSteam ? (
                      schoolEval ? (
                        <div className="flex flex-col">
                          <div className="flex items-center space-x-1.5">
                            <span className="px-2 py-0.5 rounded text-xs font-bold bg-indigo-100 text-indigo-900 border border-indigo-200">
                              {schoolEval.aiTotalScore || schoolEval.totalScore}/24
                            </span>
                            <span className="text-[11px] font-medium text-indigo-700">
                              ({schoolEval.aiQualityLevel || schoolEval.qualityLevel})
                            </span>
                          </div>
                          <span className="text-[10px] text-slate-400 mt-0.5 flex items-center gap-1">
                            <Cpu className="w-3 h-3 text-indigo-500" />
                            ระบบวิเคราะห์เบื้องต้น
                          </span>
                        </div>
                      ) : (
                        <span className="text-xs text-slate-400 font-medium">20/24 (ดีเยี่ยม)</span>
                      )
                    ) : (
                      <span className="text-xs text-slate-300 font-mono">-</span>
                    )}
                  </td>

                  {/* Column 2: Responsible Evaluator / User Score */}
                  <td className="py-4 px-3 bg-amber-50/30 border-r border-amber-200/50 align-middle">
                    {item.hasSteam ? (
                      <button
                        onClick={() => onOpenSteamEvaluation && onOpenSteamEvaluation(item)}
                        className="flex flex-col text-left group/btn w-full"
                        title="คลิกเพื่อประเมินหรือแก้ไขคะแนนผู้รับผิดชอบ"
                      >
                        {schoolEval ? (
                          <div className="space-y-1">
                            <div className="flex items-center space-x-1.5">
                              <span className={`px-2 py-0.5 rounded text-xs font-bold border ${
                                schoolEval.qualityLevel === 'ดีเยี่ยม'
                                  ? 'bg-emerald-100 text-emerald-900 border-emerald-300'
                                  : schoolEval.qualityLevel === 'ดี'
                                  ? 'bg-blue-100 text-blue-900 border-blue-300'
                                  : 'bg-amber-100 text-amber-900 border-amber-300'
                              }`}>
                                {schoolEval.totalScore}/24 ({schoolEval.qualityLevel})
                              </span>
                              <Edit3 className="w-3.5 h-3.5 text-amber-600 opacity-70 group-hover/btn:opacity-100" />
                            </div>

                            <div className="flex items-center justify-between text-[10px]">
                              <span className="text-slate-500 font-medium group-hover/btn:text-amber-700 truncate max-w-[120px]">
                                โดย: {schoolEval.evaluatorName || 'ผู้รับผิดชอบ'}
                              </span>
                              {schoolEval.isEvaluatedByUser ? (
                                <span className="px-1.5 py-0.2 rounded bg-emerald-100 text-emerald-800 text-[9px] font-bold">
                                  บันทึกแล้ว
                                </span>
                              ) : (
                                <span className="text-amber-700 font-semibold group-hover/btn:underline text-[10px]">
                                  + ให้คะแนน
                                </span>
                              )}
                            </div>
                          </div>
                        ) : (
                          <div className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-md text-xs font-bold bg-amber-500 text-slate-950 hover:bg-amber-400 transition-colors shadow-2xs">
                            <Sparkles className="w-3.5 h-3.5" />
                            <span>+ ให้คะแนนตนเอง</span>
                          </div>
                        )}
                      </button>
                    ) : (
                      <span className="text-xs text-slate-300 font-mono">-</span>
                    )}
                  </td>

                  {/* Timestamp */}
                  <td className="py-4 px-4 text-xs text-slate-500 whitespace-nowrap align-middle">
                    {item.formattedDate}
                  </td>

                  {/* Action Button */}
                  <td className="py-4 px-4 text-center align-middle">
                    <button
                      onClick={() => onSelectReport(item)}
                      className="inline-flex items-center space-x-1.5 px-3 py-1.5 bg-indigo-50 hover:bg-indigo-100 text-indigo-700 text-xs font-semibold rounded-lg border border-indigo-200/80 transition-all shadow-2xs group-hover:bg-indigo-600 group-hover:text-white group-hover:border-indigo-600"
                    >
                      <Eye className="w-3.5 h-3.5" />
                      <span>เปิดดูภาพ & รายละเอียด</span>
                    </button>
                  </td>

                </tr>
              );
            })}
          </tbody>
        </table>
      </div>
    </div>
  );
};
