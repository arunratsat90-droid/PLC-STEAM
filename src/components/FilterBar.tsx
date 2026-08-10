import React from 'react';
import { Search, Filter, X, ArrowUpDown } from 'lucide-react';
import { FilterOptions } from '../types';

interface FilterBarProps {
  filters: FilterOptions;
  groupsList: string[];
  totalCount: number;
  filteredCount: number;
  onFilterChange: (updated: Partial<FilterOptions>) => void;
  onResetFilters: () => void;
}

export const FilterBar: React.FC<FilterBarProps> = ({
  filters,
  groupsList,
  totalCount,
  filteredCount,
  onFilterChange,
  onResetFilters,
}) => {
  const hasActiveFilters =
    filters.searchQuery.trim() !== '' ||
    filters.selectedGroup !== 'all' ||
    filters.selectedStatus !== 'all';

  return (
    <div className="bg-white rounded-2xl border border-slate-200/80 shadow-xs p-4 sm:p-5 mb-6">
      
      {/* Top Filter Controls */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-12 gap-3 sm:gap-4 items-center">
        
        {/* Search School Name (4 cols) */}
        <div className="lg:col-span-4 relative">
          <label className="block text-xs font-medium text-slate-500 mb-1">
            ค้นหาชื่อโรงเรียน
          </label>
          <div className="relative">
            <Search className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
            <input
              type="text"
              value={filters.searchQuery}
              onChange={(e) => onFilterChange({ searchQuery: e.target.value })}
              placeholder="พิมพ์ชื่อโรงเรียน เช่น วัดตะโกรวม..."
              className="w-full pl-9 pr-9 py-2 bg-slate-50 border border-slate-200 rounded-xl text-sm text-slate-800 placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500 transition-all"
            />
            {filters.searchQuery && (
              <button
                onClick={() => onFilterChange({ searchQuery: '' })}
                className="absolute right-2.5 top-1/2 -translate-y-1/2 p-1 text-slate-400 hover:text-slate-600 rounded-full"
              >
                <X className="w-3.5 h-3.5" />
              </button>
            )}
          </div>
        </div>

        {/* School Group Filter (3 cols) */}
        <div className="lg:col-span-3">
          <label className="block text-xs font-medium text-slate-500 mb-1">
            กลุ่มโรงเรียน
          </label>
          <div className="relative">
            <select
              value={filters.selectedGroup}
              onChange={(e) => onFilterChange({ selectedGroup: e.target.value })}
              className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-sm text-slate-800 focus:outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500 appearance-none cursor-pointer pr-8"
            >
              <option value="all">ทุกกลุ่มโรงเรียน ({groupsList.length} กลุ่ม)</option>
              {groupsList.map((group) => (
                <option key={group} value={group}>
                  กลุ่ม{group}
                </option>
              ))}
            </select>
            <Filter className="w-4 h-4 text-slate-400 absolute right-3 top-1/2 -translate-y-1/2 pointer-events-none" />
          </div>
        </div>

        {/* Status Filter (3 cols) */}
        <div className="lg:col-span-3">
          <label className="block text-xs font-medium text-slate-500 mb-1">
            สถานะการส่งรายงาน
          </label>
          <select
            value={filters.selectedStatus}
            onChange={(e) =>
              onFilterChange({
                selectedStatus: e.target.value as FilterOptions['selectedStatus'],
              })
            }
            className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-sm text-slate-800 focus:outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500 cursor-pointer"
          >
            <option value="all">แสดงสถานะทั้งหมด</option>
            <option value="complete">🟢 ส่งครบทั้ง 2 รายงาน</option>
            <option value="plc_only">🔵 ส่งรายงาน PLC แล้ว</option>
            <option value="steam_only">🟠 ส่งรายงาน STEAM แล้ว</option>
          </select>
        </div>

        {/* Sort Dropdown (2 cols) */}
        <div className="lg:col-span-2">
          <label className="block text-xs font-medium text-slate-500 mb-1">
            เรียงตาม
          </label>
          <div className="relative">
            <select
              value={filters.sortBy}
              onChange={(e) =>
                onFilterChange({
                  sortBy: e.target.value as FilterOptions['sortBy'],
                })
              }
              className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-sm text-slate-800 focus:outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500 cursor-pointer appearance-none pr-8"
            >
              <option value="timestamp_desc">เวลาล่าสุด</option>
              <option value="timestamp_asc">เวลาเก่าสุด</option>
              <option value="school_asc">ชื่อโรงเรียน (ก-ฮ)</option>
              <option value="school_desc">ชื่อโรงเรียน (ฮ-ก)</option>
              <option value="group_asc">กลุ่มโรงเรียน</option>
            </select>
            <ArrowUpDown className="w-3.5 h-3.5 text-slate-400 absolute right-3 top-1/2 -translate-y-1/2 pointer-events-none" />
          </div>
        </div>

      </div>

      {/* Bottom Filter Summary & Tags */}
      <div className="mt-4 pt-3 border-t border-slate-100 flex flex-col sm:flex-row sm:items-center justify-between gap-3 text-xs">
        
        {/* Results Counter */}
        <div className="flex items-center space-x-2 text-slate-600 font-medium">
          <span>
            แสดงผล <strong className="text-indigo-600 font-bold">{filteredCount}</strong> จาก{' '}
            {totalCount} โรงเรียน
          </span>
          {hasActiveFilters && (
            <span className="bg-amber-50 text-amber-700 px-2 py-0.5 rounded-md border border-amber-200 text-[11px]">
              มีการกรองข้อมูลอยู่
            </span>
          )}
        </div>

        {/* Quick Clear Button */}
        {hasActiveFilters && (
          <button
            onClick={onResetFilters}
            className="inline-flex items-center space-x-1 text-slate-500 hover:text-red-600 hover:bg-red-50 px-2.5 py-1 rounded-lg transition-colors font-medium self-start sm:self-auto"
          >
            <X className="w-3.5 h-3.5" />
            <span>ล้างตัวกรองทั้งหมด</span>
          </button>
        )}

      </div>

    </div>
  );
};
