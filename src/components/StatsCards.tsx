import React from 'react';
import { Building2, FileCheck2, Sparkles, CheckCircle, ArrowUpRight, Award, UserCheck, Cpu } from 'lucide-react';
import { DashboardSummary, SchoolEvaluation } from '../types';

interface StatsCardsProps {
  summary: DashboardSummary | null;
  evaluations?: Record<string, SchoolEvaluation>;
  activeStatus: string;
  onSelectStatusFilter: (status: 'all' | 'complete' | 'plc_only' | 'steam_only') => void;
}

export const StatsCards: React.FC<StatsCardsProps> = ({
  summary,
  evaluations = {},
  activeStatus,
  onSelectStatusFilter,
}) => {
  if (!summary) return null;

  const completionPercent = summary.totalSubmissions > 0
    ? Math.round((summary.bothReportsCount / summary.totalSubmissions) * 100)
    : 0;

  // Calculate Evaluation Averages
  const evalList: SchoolEvaluation[] = Object.values(evaluations);
  const totalEvaluated = evalList.length;
  
  const totalAiScoreSum = evalList.reduce((acc: number, curr: SchoolEvaluation) => acc + (curr.aiTotalScore || curr.totalScore || 0), 0);
  const avgAiScore = totalEvaluated > 0 ? (totalAiScoreSum / totalEvaluated).toFixed(1) : '0.0';

  const userEvalList = evalList.filter((e: SchoolEvaluation) => e.isEvaluatedByUser);
  const totalUserEvaluated = userEvalList.length;
  const totalUserScoreSum = evalList.reduce((acc: number, curr: SchoolEvaluation) => acc + (curr.totalScore || curr.aiTotalScore || 0), 0);
  const avgUserScore = totalEvaluated > 0 ? (totalUserScoreSum / totalEvaluated).toFixed(1) : '0.0';

  const cards = [
    {
      id: 'all',
      title: 'จำนวนโรงเรียนที่ส่งข้อมูล',
      value: summary.totalSubmissions,
      unit: 'โรงเรียน',
      subtext: `จากทั้งหมด ${summary.groupStats.length} กลุ่มโรงเรียน`,
      icon: Building2,
      color: 'bg-indigo-500 text-white',
      cardBg: activeStatus === 'all' ? 'ring-2 ring-indigo-500 bg-indigo-50/40 border-indigo-200' : 'bg-white hover:border-indigo-200',
      statusValue: 'all' as const,
    },
    {
      id: 'complete',
      title: 'ส่งครบทั้ง 2 รายงาน',
      value: summary.bothReportsCount,
      unit: 'โรงเรียน',
      subtext: `คิดเป็น ${completionPercent}% ของการส่งข้อมูล`,
      icon: CheckCircle,
      color: 'bg-emerald-500 text-white',
      cardBg: activeStatus === 'complete' ? 'ring-2 ring-emerald-500 bg-emerald-50/40 border-emerald-200' : 'bg-white hover:border-emerald-200',
      statusValue: 'complete' as const,
    },
    {
      id: 'plc_only',
      title: 'ส่งรายงานผล PLC',
      value: summary.totalPlcReports,
      unit: 'ฉบับ',
      subtext: 'การชุมชนแห่งการเรียนรู้ทางวิชาชีพ',
      icon: FileCheck2,
      color: 'bg-blue-500 text-white',
      cardBg: activeStatus === 'plc_only' ? 'ring-2 ring-blue-500 bg-blue-50/40 border-blue-200' : 'bg-white hover:border-blue-200',
      statusValue: 'plc_only' as const,
    },
    {
      id: 'steam_only',
      title: 'ส่งรายงาน STEAM Education',
      value: summary.totalSteamReports,
      unit: 'ฉบับ',
      subtext: 'การจัดการเรียนรู้เชิงรุก สะตีมศึกษา',
      icon: Sparkles,
      color: 'bg-amber-500 text-white',
      cardBg: activeStatus === 'steam_only' ? 'ring-2 ring-amber-500 bg-amber-50/40 border-amber-200' : 'bg-white hover:border-amber-200',
      statusValue: 'steam_only' as const,
    },
  ];

  return (
    <div className="space-y-4 mb-6">
      {/* Primary Status Filter Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {cards.map((card) => {
          const Icon = card.icon;
          const isSelected = activeStatus === card.statusValue;

          return (
            <div
              key={card.id}
              onClick={() => onSelectStatusFilter(card.statusValue)}
              className={`p-5 rounded-2xl border border-slate-200/80 shadow-xs transition-all duration-200 cursor-pointer group relative overflow-hidden ${card.cardBg}`}
            >
              <div className="flex items-center justify-between">
                <span className="text-xs font-medium text-slate-500 uppercase tracking-wider">
                  {card.title}
                </span>
                <div className={`p-2.5 rounded-xl shadow-xs ${card.color}`}>
                  <Icon className="w-5 h-5" />
                </div>
              </div>

              <div className="mt-3 flex items-baseline justify-between">
                <div className="flex items-baseline space-x-1.5">
                  <span className="text-3xl font-bold tracking-tight text-slate-900">
                    {card.value}
                  </span>
                  <span className="text-sm font-medium text-slate-500">
                    {card.unit}
                  </span>
                </div>

                <div className="opacity-0 group-hover:opacity-100 transition-opacity text-slate-400 group-hover:text-slate-600">
                  <ArrowUpRight className="w-4 h-4" />
                </div>
              </div>

              <p className="mt-2 text-xs text-slate-500 flex items-center justify-between">
                <span>{card.subtext}</span>
                {isSelected && (
                  <span className="text-[10px] font-semibold uppercase tracking-wide text-indigo-600 bg-indigo-100 px-2 py-0.5 rounded-full">
                    กำลังกรอง
                  </span>
                )}
              </p>
            </div>
          );
        })}
      </div>

      {/* Evaluation Scores Summary Banner (Prominent Dual Scores) */}
      <div className="bg-gradient-to-r from-slate-900 via-indigo-950 to-slate-900 text-white rounded-2xl p-5 shadow-sm border border-slate-800">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div className="flex items-center space-x-3">
            <div className="p-3 bg-amber-500/20 text-amber-400 rounded-xl border border-amber-500/30">
              <Award className="w-6 h-6" />
            </div>
            <div>
              <h3 className="text-base font-bold text-white flex items-center gap-2">
                สรุปผลคะแนนการประเมินสะตีมศึกษา (STEAM 24 คะแนน)
                <span className="text-xs font-normal px-2 py-0.5 rounded-full bg-emerald-500/20 text-emerald-300 border border-emerald-500/30">
                  แบ่ง 2 คอลัมน์ชัดเจน
                </span>
              </h3>
              <p className="text-xs text-slate-300 mt-0.5">
                เปรียบเทียบคะแนนประเมินเบื้องต้นจากระบบ และคะแนนประเมินโดยผู้รับผิดชอบ/คณะกรรมการ
              </p>
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 shrink-0">
            {/* Column 1: AI Initial Average */}
            <div className="bg-slate-800/80 border border-slate-700/80 rounded-xl p-3 flex items-center space-x-3 min-w-[200px]">
              <div className="p-2 bg-indigo-500/20 text-indigo-400 rounded-lg">
                <Cpu className="w-4 h-4" />
              </div>
              <div>
                <span className="text-[11px] text-slate-400 block font-medium">1. คะแนนประเมินเบื้องต้น (ระบบ)</span>
                <div className="flex items-baseline space-x-1">
                  <span className="text-xl font-bold text-indigo-300">{avgAiScore}</span>
                  <span className="text-xs text-slate-400">/ 24 เฉลี่ย</span>
                </div>
              </div>
            </div>

            {/* Column 2: User / Committee Evaluator Average */}
            <div className="bg-slate-800/80 border border-amber-500/40 rounded-xl p-3 flex items-center space-x-3 min-w-[210px]">
              <div className="p-2 bg-amber-500/20 text-amber-400 rounded-lg">
                <UserCheck className="w-4 h-4" />
              </div>
              <div>
                <div className="flex items-center justify-between gap-1">
                  <span className="text-[11px] text-amber-300 font-semibold">2. คะแนนจากผู้รับผิดชอบ</span>
                  {totalUserEvaluated > 0 && (
                    <span className="text-[9px] px-1.5 py-0.2 rounded bg-amber-400 text-slate-950 font-bold">
                      {totalUserEvaluated} โรงเรียน
                    </span>
                  )}
                </div>
                <div className="flex items-baseline space-x-1">
                  <span className="text-xl font-bold text-amber-400">{avgUserScore}</span>
                  <span className="text-xs text-slate-400">/ 24 เฉลี่ย</span>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

