import React, { useState } from 'react';
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  Tooltip,
  ResponsiveContainer,
  PieChart,
  Pie,
  Cell,
  Legend,
} from 'recharts';
import { GroupStat, DashboardSummary } from '../types';
import { getGroupColor } from '../utils/colors';
import { ChevronDown, ChevronUp, BarChart2, PieChartIcon } from 'lucide-react';

interface ChartsSectionProps {
  summary: DashboardSummary | null;
  selectedGroup: string;
  onSelectGroup: (group: string) => void;
}

export const ChartsSection: React.FC<ChartsSectionProps> = ({
  summary,
  selectedGroup,
  onSelectGroup,
}) => {
  const [isExpanded, setIsExpanded] = useState(true);

  if (!summary) return null;

  // Chart data for group stats
  const barChartData = summary.groupStats.map((item) => ({
    name: item.group,
    ส่งรายงานทั้งหมด: item.total,
    PLC: item.plcCount,
    STEAM: item.steamCount,
    ส่งครบ: item.bothCount,
    color: getGroupColor(item.group).hex,
  }));

  // Pie chart data for completion status
  const completeCount = summary.bothReportsCount;
  const plcOnlyCount = summary.totalPlcReports - summary.bothReportsCount;
  const steamOnlyCount = summary.totalSteamReports - summary.bothReportsCount;
  const incompleteCount = summary.totalSubmissions - (completeCount + plcOnlyCount + steamOnlyCount);

  const pieData = [
    { name: 'ส่งครบทั้ง 2 รายงาน', value: completeCount, color: '#10b981' },
    { name: 'ส่งเฉพาะ PLC', value: Math.max(0, plcOnlyCount), color: '#3b82f6' },
    { name: 'ส่งเฉพาะ STEAM', value: Math.max(0, steamOnlyCount), color: '#f59e0b' },
  ].filter((item) => item.value > 0);

  if (incompleteCount > 0) {
    pieData.push({ name: 'ยังส่งไม่ครบ', value: incompleteCount, color: '#ef4444' });
  }

  return (
    <div className="bg-white rounded-2xl border border-slate-200/80 shadow-xs mb-6 overflow-hidden transition-all duration-200">
      {/* Header toggle */}
      <div
        onClick={() => setIsExpanded(!isExpanded)}
        className="px-6 py-4 flex items-center justify-between cursor-pointer hover:bg-slate-50/80 transition-colors border-b border-slate-100"
      >
        <div className="flex items-center space-x-2.5">
          <div className="p-2 bg-indigo-50 text-indigo-600 rounded-lg">
            <BarChart2 className="w-5 h-5" />
          </div>
          <div>
            <h2 className="text-base font-semibold text-slate-800">
              แผนภูมิสรุปการส่งรายงานจำแนกตามกลุ่มโรงเรียน
            </h2>
            <p className="text-xs text-slate-500">
              คลิกที่แท่งกราฟเพื่อกรองโรงเรียนในกลุ่มนั้นๆ
            </p>
          </div>
        </div>

        <button
          className="p-1.5 text-slate-400 hover:text-slate-600 rounded-lg hover:bg-slate-100 transition-colors"
          title={isExpanded ? 'พับเก็บแผนภูมิ' : 'ขยายแผนภูมิ'}
        >
          {isExpanded ? <ChevronUp className="w-5 h-5" /> : <ChevronDown className="w-5 h-5" />}
        </button>
      </div>

      {/* Chart Body */}
      {isExpanded && (
        <div className="p-6 grid grid-cols-1 lg:grid-cols-3 gap-6 items-center">
          
          {/* Bar Chart - Group Distribution (Spans 2 columns on lg) */}
          <div className="lg:col-span-2 bg-slate-50/50 p-4 rounded-xl border border-slate-100">
            <div className="flex items-center justify-between mb-3 px-2">
              <span className="text-xs font-semibold text-slate-600 uppercase tracking-wider">
                จำนวนโรงเรียนที่ส่งข้อมูลรายกลุ่ม ({summary.groupStats.length} กลุ่ม)
              </span>
              {selectedGroup !== 'all' && (
                <button
                  onClick={() => onSelectGroup('all')}
                  className="text-xs font-medium text-indigo-600 hover:text-indigo-800 bg-indigo-50 px-2.5 py-1 rounded-md border border-indigo-100 transition-colors"
                >
                  ยกเลิกการกรองกลุ่ม "{selectedGroup}"
                </button>
              )}
            </div>

            <div className="h-64 sm:h-72 w-full">
              <ResponsiveContainer width="100%" height="100%">
                <BarChart
                  data={barChartData}
                  margin={{ top: 10, right: 10, left: -20, bottom: 25 }}
                  onClick={(state: any) => {
                    if (state && state.activePayload && state.activePayload.length > 0) {
                      const clickedGroup = state.activePayload[0].payload.name;
                      onSelectGroup(clickedGroup === selectedGroup ? 'all' : clickedGroup);
                    }
                  }}
                >
                  <XAxis
                    dataKey="name"
                    tick={{ fill: '#64748b', fontSize: 11 }}
                    interval={0}
                    angle={-25}
                    textAnchor="end"
                  />
                  <YAxis tick={{ fill: '#64748b', fontSize: 11 }} allowDecimals={false} />
                  <Tooltip
                    contentStyle={{
                      backgroundColor: '#ffffff',
                      borderRadius: '12px',
                      border: '1px solid #e2e8f0',
                      boxShadow: '0 4px 6px -1px rgba(0, 0, 0, 0.1)',
                      fontSize: '12px',
                    }}
                    formatter={(value: any, name: any) => [value, name]}
                    labelStyle={{ fontWeight: 'bold', color: '#1e293b' }}
                  />
                  <Bar
                    dataKey="ส่งรายงานทั้งหมด"
                    radius={[6, 6, 0, 0]}
                    cursor="pointer"
                  >
                    {barChartData.map((entry, index) => (
                      <Cell
                        key={`cell-${index}`}
                        fill={selectedGroup === entry.name ? '#312e81' : entry.color}
                        opacity={selectedGroup === 'all' || selectedGroup === entry.name ? 1 : 0.35}
                      />
                    ))}
                  </Bar>
                </BarChart>
              </ResponsiveContainer>
            </div>
          </div>

          {/* Pie Chart - Completion Breakdown */}
          <div className="bg-slate-50/50 p-4 rounded-xl border border-slate-100 flex flex-col justify-between h-full">
            <div className="flex items-center space-x-2 mb-2 px-2">
              <PieChartIcon className="w-4 h-4 text-slate-500" />
              <span className="text-xs font-semibold text-slate-600 uppercase tracking-wider">
                สัดส่วนสถานะการส่งรายงาน
              </span>
            </div>

            <div className="h-56 w-full relative">
              <ResponsiveContainer width="100%" height="100%">
                <PieChart>
                  <Pie
                    data={pieData}
                    cx="50%"
                    cy="50%"
                    innerRadius={50}
                    outerRadius={80}
                    paddingAngle={4}
                    dataKey="value"
                  >
                    {pieData.map((entry, index) => (
                      <Cell key={`pie-cell-${index}`} fill={entry.color} />
                    ))}
                  </Pie>
                  <Tooltip
                    contentStyle={{
                      backgroundColor: '#ffffff',
                      borderRadius: '10px',
                      border: '1px solid #e2e8f0',
                      fontSize: '12px',
                    }}
                    formatter={(val: any) => [`${val} โรงเรียน`, 'จำนวน']}
                  />
                  <Legend
                    verticalAlign="bottom"
                    height={36}
                    iconType="circle"
                    iconSize={8}
                    wrapperStyle={{ fontSize: '11px' }}
                  />
                </PieChart>
              </ResponsiveContainer>
              <div className="absolute inset-0 flex flex-col items-center justify-center pointer-events-none pb-6">
                <span className="text-xl font-bold text-slate-800">
                  {summary.totalSubmissions}
                </span>
                <span className="text-[10px] text-slate-400">รวมทั้งหมด</span>
              </div>
            </div>
          </div>

        </div>
      )}
    </div>
  );
};
