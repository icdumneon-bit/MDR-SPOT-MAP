import React, { useState } from 'react';
import { WardInfo, MDRCase } from '../types/mdr';
import {
  Building2,
  Grid,
  Filter,
  Search,
  CheckCircle2,
  Flame,
  Check,
  ChevronRight,
  SlidersHorizontal,
} from 'lucide-react';

interface WardSelectorBarProps {
  wards: WardInfo[];
  cases: MDRCase[];
  selectedWardId: string | 'all';
  onSelectWardId: (wardId: string | 'all') => void;
  // Multi-column filter in matrix mode
  visibleWardIds?: string[];
  onToggleVisibleWard?: (wardId: string) => void;
  onSetAllVisibleWards?: (wardIds: string[]) => void;
}

export const WardSelectorBar: React.FC<WardSelectorBarProps> = ({
  wards,
  cases,
  selectedWardId,
  onSelectWardId,
  visibleWardIds,
  onToggleVisibleWard,
  onSetAllVisibleWards,
}) => {
  const [searchTerm, setSearchTerm] = useState('');
  const [activeCategory, setActiveCategory] = useState<string>('all');
  const [showColumnFilter, setShowColumnFilter] = useState(false);

  // Pre-calculate cases per ward
  const casesPerWard = React.useMemo(() => {
    const map = new Map<string, number>();
    wards.forEach((w) => map.set(w.id, 0));
    cases.forEach((c) => {
      map.set(c.wardId, (map.get(c.wardId) || 0) + (c.count || 1));
    });
    return map;
  }, [wards, cases]);

  // Ward categorization helper
  const getCategory = (ward: WardInfo): string => {
    if (ward.isCustom) return 'custom';
    const name = ward.name.toLowerCase();
    if (name.includes('icu') || name.includes('วิกฤต')) return 'icu';
    if (name.includes('อายุรกรรม')) return 'med';
    if (name.includes('ศัลยกรรม') || name.includes('กระดูก')) return 'surg';
    if (name.includes('กุมาร') || name.includes('สูติ') || name.includes('นรีเวช')) return 'peds_obgyn';
    if (name.includes('พิเศษ') || name.includes('ตา') || name.includes('หู')) return 'special';
    return 'other';
  };

  const categories = [
    { id: 'all', label: 'ทั้งหมด (22)', icon: '🏥' },
    { id: 'has_cases', label: 'เฉพาะตึกที่มีเคส', icon: '🔥' },
    { id: 'icu', label: 'ICU/วิกฤต', icon: '🫀' },
    { id: 'med', label: 'อายุรกรรม', icon: '🩺' },
    { id: 'surg', label: 'ศัลยกรรม/กระดูก', icon: '🩹' },
    { id: 'peds_obgyn', label: 'กุมาร/สูติ', icon: '👶' },
    { id: 'special', label: 'ตึกพิเศษ/เฉพาะทาง', icon: '🏢' },
    { id: 'custom', label: 'หน่วยงานเพิ่ม (+5)', icon: '⭐' },
  ];

  // Filtered wards by category and search
  const filteredWards = React.useMemo(() => {
    return wards.filter((w) => {
      // Category filter
      if (activeCategory === 'has_cases') {
        const count = casesPerWard.get(w.id) || 0;
        if (count === 0) return false;
      } else if (activeCategory !== 'all') {
        if (getCategory(w) !== activeCategory) return false;
      }

      // Search term filter
      if (searchTerm.trim()) {
        const term = searchTerm.toLowerCase();
        return (
          w.name.toLowerCase().includes(term) ||
          (w.building && w.building.toLowerCase().includes(term)) ||
          (w.floor && w.floor.toLowerCase().includes(term))
        );
      }

      return true;
    });
  }, [wards, activeCategory, searchTerm, casesPerWard]);

  // Wards with cases count
  const wardsWithCasesCount = wards.filter((w) => (casesPerWard.get(w.id) || 0) > 0).length;

  return (
    <div className="bg-white rounded-xl border border-slate-200 shadow-sm p-3.5 mb-4">
      {/* Top Header: View Mode Switcher & Category Pills */}
      <div className="flex flex-wrap items-center justify-between gap-3 pb-3 border-b border-slate-100">
        <div className="flex items-center gap-2">
          <div className="w-7 h-7 rounded-lg bg-teal-500/10 text-teal-700 flex items-center justify-center">
            <Building2 className="w-4 h-4" />
          </div>
          <div>
            <h4 className="text-xs sm:text-sm font-bold text-slate-900 flex items-center gap-2">
              <span>เลือกดูตาราง Spot Map ประจำหน่วยงาน</span>
              <span className="text-[10px] font-semibold px-2 py-0.5 rounded-full bg-slate-100 text-slate-700 border border-slate-200">
                {wards.length} หน่วยงาน
              </span>
            </h4>
          </div>
        </div>

        {/* View Mode Buttons: All Wards vs Single Ward Mode */}
        <div className="flex items-center gap-2">
          <button
            onClick={() => onSelectWardId('all')}
            className={`px-3 py-1.5 rounded-lg text-xs font-bold transition-all flex items-center gap-1.5 ${
              selectedWardId === 'all'
                ? 'bg-teal-600 text-white shadow-2xs ring-2 ring-teal-600/20'
                : 'bg-slate-100 text-slate-700 hover:bg-slate-200'
            }`}
          >
            <Grid className="w-3.5 h-3.5" />
            <span>ตารางรวมทุกหน่วยงาน (22 ตึก)</span>
          </button>

          {visibleWardIds && onSetAllVisibleWards && selectedWardId === 'all' && (
            <button
              onClick={() => setShowColumnFilter(!showColumnFilter)}
              className={`px-2.5 py-1.5 rounded-lg text-xs font-medium border transition-colors flex items-center gap-1 ${
                showColumnFilter
                  ? 'bg-slate-800 text-white border-slate-800'
                  : 'bg-white text-slate-700 border-slate-200 hover:bg-slate-50'
              }`}
              title="เลือกเปิด/ปิดคอลัมน์ตึกในตารางรวม"
            >
              <SlidersHorizontal className="w-3 h-3 text-teal-600" />
              <span>กรองคอลัมน์ ({visibleWardIds.length}/{wards.length})</span>
            </button>
          )}
        </div>
      </div>

      {/* Filter and Category Ribbon */}
      <div className="pt-2.5 flex flex-wrap items-center justify-between gap-2 text-xs">
        {/* Category Pills */}
        <div className="flex flex-wrap items-center gap-1.5 overflow-x-auto py-1">
          {categories.map((cat) => {
            const isActive = activeCategory === cat.id;
            const extraCount =
              cat.id === 'has_cases' ? `(${wardsWithCasesCount})` : '';
            return (
              <button
                key={cat.id}
                onClick={() => setActiveCategory(cat.id)}
                className={`px-2.5 py-1 rounded-md text-[11px] font-medium transition-colors flex items-center gap-1 ${
                  isActive
                    ? 'bg-slate-900 text-white shadow-2xs'
                    : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
                }`}
              >
                <span>{cat.icon}</span>
                <span>
                  {cat.label} {extraCount}
                </span>
              </button>
            );
          })}
        </div>

        {/* Quick Search */}
        <div className="relative w-full sm:w-48">
          <input
            type="text"
            placeholder="ค้นหาชื่อตึก/หน่วยงาน..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-full pl-7 pr-3 py-1 rounded-md text-xs border border-slate-200 bg-slate-50 focus:bg-white focus:outline-hidden focus:ring-1 focus:ring-teal-500"
          />
          <Search className="w-3.5 h-3.5 text-slate-400 absolute left-2 top-2 pointer-events-none" />
          {searchTerm && (
            <button
              onClick={() => setSearchTerm('')}
              className="absolute right-2 top-1.5 text-slate-400 hover:text-slate-600 text-xs font-bold"
            >
              ×
            </button>
          )}
        </div>
      </div>

      {/* Wards Button Chips Grid (Click any ward to instantly open its dedicated spot map!) */}
      <div className="mt-3 flex flex-wrap gap-1.5 max-h-36 overflow-y-auto p-1 bg-slate-50/70 rounded-lg border border-slate-100">
        {filteredWards.map((w) => {
          const isSelected = selectedWardId === w.id;
          const caseCount = casesPerWard.get(w.id) || 0;
          const isCustom = w.isCustom;

          return (
            <button
              key={w.id}
              onClick={() => onSelectWardId(w.id)}
              className={`px-2.5 py-1 rounded-lg text-xs font-medium border transition-all flex items-center gap-1.5 shadow-2xs text-left ${
                isSelected
                  ? 'bg-teal-600 text-white border-teal-700 shadow-xs ring-2 ring-teal-500/30'
                  : caseCount > 0
                  ? isCustom
                    ? 'bg-emerald-50 hover:bg-emerald-100 text-emerald-950 border-emerald-300'
                    : 'bg-white hover:bg-amber-50 text-slate-800 border-amber-200'
                  : 'bg-white hover:bg-slate-100 text-slate-600 border-slate-200'
              }`}
              title={`${w.name} (${w.building || ''}) — มีเคส ${caseCount} ราย`}
            >
              <span className="truncate max-w-[140px] font-semibold">{w.name}</span>

              {/* Case Count Badge */}
              {caseCount > 0 ? (
                <span
                  className={`text-[10px] font-bold px-1.5 py-0.2 rounded-full ${
                    isSelected
                      ? 'bg-white text-teal-800'
                      : caseCount >= 4
                      ? 'bg-rose-500 text-white'
                      : 'bg-amber-500 text-white'
                  }`}
                >
                  {caseCount}
                </span>
              ) : (
                <span className="text-[10px] text-slate-400 opacity-60">0</span>
              )}

              {isCustom && !isSelected && (
                <span className="text-[9px] text-emerald-700 font-bold bg-emerald-100 px-1 rounded">
                  +5
                </span>
              )}
            </button>
          );
        })}

        {filteredWards.length === 0 && (
          <div className="text-slate-400 text-xs py-2 text-center w-full italic">
            ไม่พบหน่วยงานที่ตรงกับเงื่อนไขการค้นหา
          </div>
        )}
      </div>

      {/* Multi-Column Picker Dropdown for Matrix View */}
      {showColumnFilter && selectedWardId === 'all' && visibleWardIds && onToggleVisibleWard && onSetAllVisibleWards && (
        <div className="mt-3 p-3 bg-slate-900 text-white rounded-xl text-xs space-y-2 border border-slate-800 animate-in fade-in">
          <div className="flex items-center justify-between border-b border-slate-800 pb-2">
            <span className="font-bold text-teal-300">
              เลือกคอลัมน์หน่วยงานที่ต้องการแสดงในตารางรวม (กำลังแสดง {visibleWardIds.length} จาก {wards.length} ตึก)
            </span>
            <div className="flex items-center gap-2">
              <button
                onClick={() => onSetAllVisibleWards(wards.map((w) => w.id))}
                className="text-[11px] bg-slate-800 hover:bg-slate-700 px-2 py-0.5 rounded text-teal-300"
              >
                เลือกทั้งหมด (22)
              </button>
              <button
                onClick={() =>
                  onSetAllVisibleWards(
                    wards.filter((w) => (casesPerWard.get(w.id) || 0) > 0).map((w) => w.id)
                  )
                }
                className="text-[11px] bg-slate-800 hover:bg-slate-700 px-2 py-0.5 rounded text-amber-300"
              >
                เลือกเฉพาะที่มีเคส ({wardsWithCasesCount})
              </button>
            </div>
          </div>

          <div className="flex flex-wrap gap-2 pt-1 max-h-36 overflow-y-auto">
            {wards.map((w) => {
              const isChecked = visibleWardIds.includes(w.id);
              const count = casesPerWard.get(w.id) || 0;
              return (
                <label
                  key={w.id}
                  className={`flex items-center gap-1.5 px-2.5 py-1 rounded-md text-xs cursor-pointer select-none transition-colors border ${
                    isChecked
                      ? 'bg-teal-950/80 border-teal-500 text-teal-100 font-semibold'
                      : 'bg-slate-800/80 border-slate-700 text-slate-400'
                  }`}
                >
                  <input
                    type="checkbox"
                    checked={isChecked}
                    onChange={() => onToggleVisibleWard(w.id)}
                    className="rounded border-slate-600 text-teal-600 focus:ring-teal-500"
                  />
                  <span>{w.name}</span>
                  {count > 0 && (
                    <span className="bg-slate-700 px-1 py-0.2 rounded text-[10px] text-amber-300 font-bold">
                      {count}
                    </span>
                  )}
                </label>
              );
            })}
          </div>
        </div>
      )}
    </div>
  );
};
