import React, { useState } from 'react';
import { WardInfo, MDRCase, OrganismConfig, CopiedCaseTemplate, WardRecommendation } from '../types/mdr';
import { SPECIMEN_ICONS } from './ColorLegend';
import {
  Building2,
  Calendar,
  ChevronLeft,
  ChevronRight,
  Plus,
  PlusSquare,
  Copy,
  ClipboardPaste,
  ShieldAlert,
  AlertTriangle,
  CheckCircle2,
  Filter,
  Sparkles,
  ArrowRight,
  Stethoscope,
  Info,
  Clock,
  Layers,
  FileText,
} from 'lucide-react';

interface WardSpotMapTableProps {
  ward: WardInfo;
  allWards: WardInfo[];
  days: number[];
  cases: MDRCase[];
  monthName: string;
  monthShortName: string;
  year: number;
  monthNumber: number;
  organismConfigs: Record<string, OrganismConfig>;
  selectedOrganisms: string[];
  selectedSpecimens: string[];
  activeCopiedTemplate: CopiedCaseTemplate | null;
  recommendation?: WardRecommendation;
  onSelectWard: (ward: WardInfo) => void;
  onAddCaseToSlot: (day: number, wardId: string) => void;
  onSelectCase: (caseItem: MDRCase) => void;
  onPasteTemplateToSlot?: (day: number, wardId: string) => void;
  onCopyCaseAsTemplate?: (caseItem: MDRCase) => void;
  onSwitchToAllWards: () => void;
}

export const WardSpotMapTable: React.FC<WardSpotMapTableProps> = ({
  ward,
  allWards,
  days,
  cases,
  monthName,
  monthShortName,
  year,
  monthNumber,
  organismConfigs,
  selectedOrganisms,
  selectedSpecimens,
  activeCopiedTemplate,
  recommendation,
  onSelectWard,
  onAddCaseToSlot,
  onSelectCase,
  onPasteTemplateToSlot,
  onCopyCaseAsTemplate,
  onSwitchToAllWards,
}) => {
  const [displayLayout, setDisplayLayout] = useState<'timeline' | 'calendar'>('timeline');

  // Filter cases for THIS ward
  const wardCases = React.useMemo(() => {
    return cases.filter((c) => c.wardId === ward.id);
  }, [cases, ward.id]);

  // Group cases by day
  const casesByDay = React.useMemo(() => {
    const map = new Map<number, MDRCase[]>();
    days.forEach((d) => map.set(d, []));
    wardCases.forEach((c) => {
      const existing = map.get(c.day) || [];
      existing.push(c);
      map.set(c.day, existing);
    });
    return map;
  }, [wardCases, days]);

  // Total cases in this ward
  const totalWardCases = React.useMemo(() => {
    return wardCases.reduce((sum, c) => sum + (c.count || 1), 0);
  }, [wardCases]);

  // Organism breakdown in this ward
  const organismBreakdown = React.useMemo(() => {
    const counts: Record<string, number> = {};
    wardCases.forEach((c) => {
      counts[c.organism] = (counts[c.organism] || 0) + (c.count || 1);
    });
    return Object.entries(counts).sort((a, b) => b[1] - a[1]);
  }, [wardCases]);

  // Specimen breakdown in this ward
  const specimenBreakdown = React.useMemo(() => {
    const counts: Record<string, number> = {};
    wardCases.forEach((c) => {
      counts[c.specimen] = (counts[c.specimen] || 0) + (c.count || 1);
    });
    return Object.entries(counts).sort((a, b) => b[1] - a[1]);
  }, [wardCases]);

  // Ward navigation (Prev / Next)
  const currentWardIndex = allWards.findIndex((w) => w.id === ward.id);
  const prevWard = currentWardIndex > 0 ? allWards[currentWardIndex - 1] : allWards[allWards.length - 1];
  const nextWard = currentWardIndex < allWards.length - 1 ? allWards[currentWardIndex + 1] : allWards[0];

  const getOrganismStyle = (name: string) => {
    return (
      organismConfigs[name] || {
        name,
        shortName: name,
        color: {
          bg: 'bg-slate-700 text-white',
          text: 'text-slate-800',
          border: 'border-slate-300',
          badgeBg: 'bg-slate-50 text-slate-800 border-slate-200',
          dot: '#64748b',
        },
        totalCases: 1,
        riskCategory: 'Medium',
      }
    );
  };

  // Helper to format weekday for a day in month
  // Buddhist year: Year CE = year - 543
  const getDayOfWeekName = (day: number) => {
    try {
      const ceYear = year - 543;
      const date = new Date(ceYear, monthNumber - 1, day);
      const dayNames = ['อาทิตย์', 'จันทร์', 'อังคาร', 'พุธ', 'พฤหัสบดี', 'ศุกร์', 'เสาร์'];
      const shortDays = ['อา.', 'จ.', 'อ.', 'พ.', 'พฤ.', 'ศ.', 'ส.'];
      const dayIdx = date.getDay();
      return {
        name: dayNames[dayIdx],
        short: shortDays[dayIdx],
        isWeekend: dayIdx === 0 || dayIdx === 6,
      };
    } catch {
      return { name: `วันที่ ${day}`, short: `${day}`, isWeekend: false };
    }
  };

  // Risk status badge
  const riskStatus = totalWardCases >= 4 ? 'high' : totalWardCases >= 2 ? 'medium' : totalWardCases > 0 ? 'low' : 'zero';

  return (
    <div className="bg-white rounded-xl border border-slate-200 shadow-sm overflow-hidden flex flex-col mb-6">
      {/* Ward Switcher Header */}
      <div className="bg-gradient-to-r from-slate-900 via-slate-800 to-teal-950 text-white p-4">
        <div className="flex flex-wrap items-center justify-between gap-3 pb-3 border-b border-slate-700/70">
          {/* Navigation Controls */}
          <div className="flex items-center gap-2">
            <button
              onClick={() => onSelectWard(prevWard)}
              className="p-1.5 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-300 hover:text-white border border-slate-700 transition-colors flex items-center gap-1 text-xs"
              title={`ตึกก่อนหน้า: ${prevWard.name}`}
            >
              <ChevronLeft className="w-4 h-4" />
              <span className="hidden sm:inline">ก่อนหน้า</span>
            </button>

            {/* Ward Dropdown Selector */}
            <div className="relative">
              <select
                value={ward.id}
                onChange={(e) => {
                  const target = allWards.find((w) => w.id === e.target.value);
                  if (target) onSelectWard(target);
                }}
                className="bg-slate-800/90 text-white font-bold text-sm sm:text-base px-3 py-1.5 rounded-lg border border-teal-500/50 focus:ring-2 focus:ring-teal-400 focus:outline-hidden appearance-none pr-8 cursor-pointer"
              >
                {allWards.map((w) => {
                  const cCount = cases.filter((c) => c.wardId === w.id).reduce((s, c) => s + (c.count || 1), 0);
                  return (
                    <option key={w.id} value={w.id} className="bg-slate-900 text-white">
                      {w.name} {w.isCustom ? '⭐ (+5)' : ''} — {cCount} เคส
                    </option>
                  );
                })}
              </select>
              <Building2 className="w-4 h-4 absolute right-2.5 top-2.5 pointer-events-none text-teal-400" />
            </div>

            <button
              onClick={() => onSelectWard(nextWard)}
              className="p-1.5 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-300 hover:text-white border border-slate-700 transition-colors flex items-center gap-1 text-xs"
              title={`ตึกถัดไป: ${nextWard.name}`}
            >
              <span className="hidden sm:inline">ถัดไป</span>
              <ChevronRight className="w-4 h-4" />
            </button>
          </div>

          {/* Action buttons on right */}
          <div className="flex flex-wrap items-center gap-2">
            {/* View layout toggle */}
            <div className="bg-slate-800 p-0.5 rounded-lg border border-slate-700 flex items-center text-xs">
              <button
                onClick={() => setDisplayLayout('timeline')}
                className={`px-2.5 py-1 rounded-md font-medium transition-colors ${
                  displayLayout === 'timeline'
                    ? 'bg-teal-600 text-white shadow-2xs'
                    : 'text-slate-400 hover:text-white'
                }`}
              >
                ตารางรายวัน (1-31)
              </button>
              <button
                onClick={() => setDisplayLayout('calendar')}
                className={`px-2.5 py-1 rounded-md font-medium transition-colors ${
                  displayLayout === 'calendar'
                    ? 'bg-teal-600 text-white shadow-2xs'
                    : 'text-slate-400 hover:text-white'
                }`}
              >
                ปฏิทินรายเดือน
              </button>
            </div>

            {/* Back to all wards matrix */}
            <button
              onClick={onSwitchToAllWards}
              className="text-xs bg-slate-800/80 hover:bg-slate-700 text-slate-200 hover:text-white font-medium px-3 py-1.5 rounded-lg border border-slate-600 transition-colors flex items-center gap-1.5"
            >
              <Layers className="w-3.5 h-3.5 text-teal-400" />
              <span>กลับสู่ตารางรวม 22 หน่วยงาน</span>
            </button>
          </div>
        </div>

        {/* Ward Info Summary Banner */}
        <div className="mt-3 grid grid-cols-1 md:grid-cols-4 gap-3 text-xs">
          {/* Col 1: Ward Title & Department */}
          <div className="bg-slate-800/70 p-3 rounded-xl border border-slate-700/80">
            <div className="flex items-center gap-2">
              <span className="text-xl">🏥</span>
              <div>
                <h2 className="text-base font-extrabold text-teal-300">{ward.name}</h2>
                <div className="text-slate-400 text-[11px] flex items-center gap-2 mt-0.5">
                  <span>{ward.building || 'อาคารผู้ป่วย'}</span>
                  <span>•</span>
                  <span>{ward.floor || 'ชั้น 1'}</span>
                  {ward.isCustom && (
                    <span className="bg-emerald-900/70 text-emerald-300 px-1.5 py-0.2 rounded text-[10px] border border-emerald-600">
                      หน่วยงานเพิ่มเติม
                    </span>
                  )}
                </div>
              </div>
            </div>
          </div>

          {/* Col 2: Total Cases & Risk Level */}
          <div className="bg-slate-800/70 p-3 rounded-xl border border-slate-700/80 flex items-center justify-between">
            <div>
              <div className="text-slate-400 text-[11px]">ยอดตรวจพบในเดือนนี้</div>
              <div className="text-2xl font-black text-white mt-0.5 flex items-baseline gap-1">
                <span>{totalWardCases}</span>
                <span className="text-xs font-normal text-slate-400">ราย</span>
              </div>
            </div>
            <div>
              {riskStatus === 'high' ? (
                <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-xs font-bold bg-rose-950 text-rose-300 border border-rose-600">
                  <ShieldAlert className="w-3.5 h-3.5" />
                  เฝ้าระวังเข้มงวด
                </span>
              ) : riskStatus === 'medium' ? (
                <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-xs font-bold bg-amber-950 text-amber-300 border border-amber-600">
                  <AlertTriangle className="w-3.5 h-3.5" />
                  พบเคสต่อเนื่อง
                </span>
              ) : riskStatus === 'low' ? (
                <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-xs font-bold bg-sky-950 text-sky-300 border border-sky-600">
                  <Info className="w-3.5 h-3.5" />
                  พบประปราย
                </span>
              ) : (
                <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-xs font-bold bg-emerald-950 text-emerald-300 border border-emerald-600">
                  <CheckCircle2 className="w-3.5 h-3.5" />
                  ไม่พบเคสในเดือนนี้
                </span>
              )}
            </div>
          </div>

          {/* Col 3: Organisms Detected */}
          <div className="bg-slate-800/70 p-3 rounded-xl border border-slate-700/80">
            <div className="text-slate-400 text-[11px] mb-1 font-semibold flex items-center justify-between">
              <span>เชื้อดื้อยาที่พบ ({organismBreakdown.length} ชนิด):</span>
            </div>
            {organismBreakdown.length > 0 ? (
              <div className="flex flex-wrap gap-1.5 max-h-12 overflow-y-auto pr-1">
                {organismBreakdown.map(([org, count]) => {
                  const style = getOrganismStyle(org);
                  return (
                    <span
                      key={org}
                      className="px-2 py-0.5 rounded-md text-[11px] font-bold flex items-center gap-1 border shadow-2xs"
                      style={{
                        backgroundColor: style.color.dot + '25',
                        borderColor: style.color.dot,
                        color: '#f8fafc',
                      }}
                    >
                      <span className="w-2 h-2 rounded-full" style={{ backgroundColor: style.color.dot }} />
                      <span className="italic">{org.split(' ')[0]}</span>
                      <span className="bg-black/40 px-1 rounded text-[10px]">{count}</span>
                    </span>
                  );
                })}
              </div>
            ) : (
              <div className="text-slate-400 italic text-[11px]">ไม่พบเชื้อในเดือนนี้</div>
            )}
          </div>

          {/* Col 4: Specimens Detected */}
          <div className="bg-slate-800/70 p-3 rounded-xl border border-slate-700/80">
            <div className="text-slate-400 text-[11px] mb-1 font-semibold">
              สิ่งส่งตรวจที่พบ:
            </div>
            {specimenBreakdown.length > 0 ? (
              <div className="flex flex-wrap gap-1.5 max-h-12 overflow-y-auto pr-1">
                {specimenBreakdown.map(([spec, count]) => (
                  <span
                    key={spec}
                    className="px-2 py-0.5 rounded-md text-[11px] font-medium bg-slate-700/80 text-sky-200 border border-slate-600 flex items-center gap-1"
                  >
                    <span>{SPECIMEN_ICONS[spec]?.icon || '🔬'}</span>
                    <span>{spec}</span>
                    <span className="text-slate-400">({count})</span>
                  </span>
                ))}
              </div>
            ) : (
              <div className="text-slate-400 italic text-[11px]">ไม่มีข้อมูลสิ่งส่งตรวจ</div>
            )}
          </div>
        </div>
      </div>

      {/* Paste Mode Alert if template is active */}
      {activeCopiedTemplate && (
        <div className="p-3 bg-teal-50 border-b border-teal-200 flex flex-wrap items-center justify-between gap-3 text-xs text-teal-900">
          <div className="flex items-center gap-2">
            <ClipboardPaste className="w-4 h-4 text-teal-600 shrink-0" />
            <span>
              กำลังอยู่ในโหมดวาง: เชื้อ <strong className="italic">{activeCopiedTemplate.organism}</strong> ({activeCopiedTemplate.resistanceGroup}) สิ่งส่งตรวจ <strong>{activeCopiedTemplate.specimen}</strong>
            </span>
          </div>
          <span className="text-[11px] text-teal-700 bg-teal-100 px-2 py-0.5 rounded border border-teal-300">
            👉 คลิกปุ่ม "+ วางที่นี่" ในวันที่ต้องการของหอผู้ป่วยนี้ได้ทันที
          </span>
        </div>
      )}

      {/* Body: Timeline Table Layout */}
      {displayLayout === 'timeline' ? (
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs border-collapse">
            <thead>
              <tr className="bg-slate-100 text-slate-700 border-b border-slate-200">
                <th className="py-2.5 px-3 font-bold w-24 text-center border-r border-slate-200">วันที่</th>
                <th className="py-2.5 px-3 font-bold w-24 text-center border-r border-slate-200">วันในสัปดาห์</th>
                <th className="py-2.5 px-4 font-bold border-r border-slate-200">
                  กล่องบันทึก Spot Map (ชื่อเชื้อ / สิ่งส่งตรวจ)
                </th>
                <th className="py-2.5 px-3 font-bold w-24 text-center border-r border-slate-200">จำนวนเคส</th>
                <th className="py-2.5 px-3 font-bold w-36 text-center">จัดการกล่อง</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {days.map((day) => {
                const dayCases = casesByDay.get(day) || [];
                const weekday = getDayOfWeekName(day);
                const hasCases = dayCases.length > 0;

                return (
                  <tr
                    key={day}
                    className={`transition-colors ${
                      hasCases
                        ? 'bg-amber-50/40 hover:bg-amber-50/70'
                        : weekday.isWeekend
                        ? 'bg-slate-50/60 hover:bg-slate-100/60'
                        : 'hover:bg-slate-50'
                    }`}
                  >
                    {/* Day number */}
                    <td className="py-2.5 px-3 text-center border-r border-slate-200">
                      <div className="inline-flex items-center justify-center w-7 h-7 rounded-full font-bold text-xs bg-slate-800 text-white shadow-2xs">
                        {day}
                      </div>
                    </td>

                    {/* Weekday */}
                    <td className="py-2.5 px-3 text-center border-r border-slate-200">
                      <span
                        className={`text-[11px] font-semibold px-2 py-0.5 rounded ${
                          weekday.isWeekend ? 'text-rose-700 bg-rose-50' : 'text-slate-600 bg-slate-100'
                        }`}
                      >
                        {weekday.name}
                      </span>
                    </td>

                    {/* Spot Map Boxes (Separated Pathogen & Specimen) */}
                    <td className="py-2 px-3 border-r border-slate-200">
                      {hasCases ? (
                        <div className="flex flex-wrap gap-2 items-center">
                          {dayCases.map((c) => {
                            const orgStyle = getOrganismStyle(c.organism);
                            return (
                              <div
                                key={c.id}
                                className="group relative bg-white border border-slate-300 rounded-lg p-2 shadow-2xs hover:shadow-md transition-all flex flex-col gap-1 min-w-[200px] max-w-[260px]"
                              >
                                {/* กล่องที่ 1: กล่องชื่อเชื้อและกลุ่มดื้อยา */}
                                <div
                                  onClick={() => onSelectCase(c)}
                                  className="p-1 rounded cursor-pointer transition-colors"
                                  style={{
                                    backgroundColor: orgStyle.color.dot + '15',
                                    borderLeft: `3px solid ${orgStyle.color.dot}`,
                                  }}
                                  title={`คลิกดูรายละเอียดเคส ${c.organism}`}
                                >
                                  <div className="flex items-center justify-between gap-1">
                                    <div className="flex items-center gap-1 min-w-0">
                                      <span
                                        className="w-2.5 h-2.5 rounded-full shrink-0"
                                        style={{ backgroundColor: orgStyle.color.dot }}
                                      />
                                      <span className="font-bold text-slate-900 text-xs truncate italic">
                                        {c.organism}
                                      </span>
                                    </div>
                                    {c.count && c.count > 1 && (
                                      <span className="text-[10px] font-bold bg-slate-800 text-white px-1.5 py-0.2 rounded shrink-0">
                                        x{c.count}
                                      </span>
                                    )}
                                  </div>
                                  <div className="text-[10px] text-slate-600 font-medium truncate mt-0.5 pl-3.5">
                                    {c.resistanceGroup}
                                  </div>
                                </div>

                                {/* กล่องที่ 2: กล่องสิ่งส่งตรวจ */}
                                <div className="flex items-center justify-between gap-1 pt-0.5 border-t border-slate-100 text-[11px]">
                                  <span className="inline-flex items-center gap-1 px-1.5 py-0.5 rounded bg-sky-50 text-sky-900 border border-sky-200 font-medium">
                                    <span>{SPECIMEN_ICONS[c.specimen]?.icon || '🔬'}</span>
                                    <span>{c.specimen}</span>
                                  </span>

                                  {/* Quick Actions (Copy template) */}
                                  <div className="flex items-center gap-1 opacity-80 group-hover:opacity-100">
                                    {onCopyCaseAsTemplate && (
                                      <button
                                        onClick={(e) => {
                                          e.stopPropagation();
                                          onCopyCaseAsTemplate(c);
                                        }}
                                        className="p-1 hover:bg-slate-100 text-slate-500 hover:text-teal-700 rounded transition-colors"
                                        title="คัดลอกเชื้อ+สิ่งส่งตรวจชุดนี้เพื่อวางต่อ"
                                      >
                                        <Copy className="w-3.5 h-3.5" />
                                      </button>
                                    )}
                                    <button
                                      onClick={() => onSelectCase(c)}
                                      className="text-[10px] text-teal-700 hover:underline px-1"
                                    >
                                      แก้ไข
                                    </button>
                                  </div>
                                </div>

                                {c.hn && (
                                  <div className="text-[10px] text-slate-500 truncate">
                                    HN: <span className="font-mono">{c.hn}</span>
                                  </div>
                                )}
                              </div>
                            );
                          })}
                        </div>
                      ) : (
                        <div className="text-slate-400 italic text-[11px] py-1">
                          - ไม่มีเชื้อดื้อยาตรวจพบในวันนี้ -
                        </div>
                      )}
                    </td>

                    {/* Case Count badge */}
                    <td className="py-2.5 px-3 text-center border-r border-slate-200">
                      {hasCases ? (
                        <span className="inline-flex items-center justify-center font-extrabold px-2 py-0.5 rounded-full text-xs bg-rose-100 text-rose-800 border border-rose-200">
                          {dayCases.reduce((s, c) => s + (c.count || 1), 0)} ราย
                        </span>
                      ) : (
                        <span className="text-slate-300 text-xs">0</span>
                      )}
                    </td>

                    {/* Actions */}
                    <td className="py-2 px-3 text-center">
                      <div className="flex items-center justify-center gap-1.5">
                        {activeCopiedTemplate && onPasteTemplateToSlot && (
                          <button
                            onClick={() => onPasteTemplateToSlot(day, ward.id)}
                            className="text-[11px] bg-teal-600 hover:bg-teal-700 text-white font-bold px-2 py-1 rounded shadow-2xs flex items-center gap-1 transition-colors"
                            title={`วางเชื้อ ${activeCopiedTemplate.organism} ลงในวันที่ ${day}`}
                          >
                            <ClipboardPaste className="w-3 h-3" />
                            <span>+ วางที่นี่</span>
                          </button>
                        )}
                        <button
                          onClick={() => onAddCaseToSlot(day, ward.id)}
                          className="text-[11px] bg-white hover:bg-slate-100 text-slate-700 border border-slate-300 font-semibold px-2 py-1 rounded shadow-2xs flex items-center gap-1 transition-colors"
                          title={`เพิ่มกล่องเคสในวันที่ ${day}`}
                        >
                          <Plus className="w-3 h-3 text-teal-600" />
                          <span>+ เพิ่มกล่อง</span>
                        </button>
                      </div>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      ) : (
        /* Calendar 7-Column Grid Layout */
        <div className="p-4 bg-slate-50">
          <div className="grid grid-cols-7 gap-2">
            {['อา.', 'จ.', 'อ.', 'พ.', 'พฤ.', 'ศ.', 'ส.'].map((dayName, idx) => (
              <div
                key={dayName}
                className={`text-center font-bold text-xs py-2 rounded-lg ${
                  idx === 0 || idx === 6 ? 'bg-rose-100 text-rose-800' : 'bg-slate-200 text-slate-700'
                }`}
              >
                {dayName}
              </div>
            ))}

            {days.map((day) => {
              const dayCases = casesByDay.get(day) || [];
              const weekday = getDayOfWeekName(day);
              const hasCases = dayCases.length > 0;

              return (
                <div
                  key={day}
                  className={`min-h-[110px] p-2 rounded-xl border flex flex-col justify-between transition-all ${
                    hasCases
                      ? 'bg-white border-amber-300 shadow-2xs hover:border-amber-400'
                      : 'bg-white/80 border-slate-200 hover:border-slate-300'
                  }`}
                >
                  <div className="flex items-center justify-between">
                    <span
                      className={`inline-flex items-center justify-center w-6 h-6 rounded-full text-xs font-bold ${
                        hasCases
                          ? 'bg-rose-600 text-white'
                          : weekday.isWeekend
                          ? 'bg-rose-100 text-rose-800'
                          : 'bg-slate-100 text-slate-700'
                      }`}
                    >
                      {day}
                    </span>

                    {hasCases && (
                      <span className="text-[10px] font-bold text-rose-700 bg-rose-50 px-1.5 py-0.2 rounded border border-rose-200">
                        {dayCases.reduce((s, c) => s + (c.count || 1), 0)} เคส
                      </span>
                    )}
                  </div>

                  {/* Micro list of cases */}
                  <div className="my-1.5 space-y-1 overflow-y-auto max-h-24">
                    {dayCases.map((c) => {
                      const orgStyle = getOrganismStyle(c.organism);
                      return (
                        <div
                          key={c.id}
                          onClick={() => onSelectCase(c)}
                          className="p-1 rounded text-[10px] border cursor-pointer hover:shadow-xs transition-shadow"
                          style={{
                            backgroundColor: orgStyle.color.dot + '15',
                            borderColor: orgStyle.color.dot,
                          }}
                          title={`${c.organism} (${c.resistanceGroup}) - สิ่งส่งตรวจ: ${c.specimen}`}
                        >
                          <div className="font-bold truncate text-slate-900 italic">
                            {c.organism.split(' ')[0]}
                          </div>
                          <div className="text-[9px] text-slate-600 truncate flex items-center gap-1">
                            <span>{SPECIMEN_ICONS[c.specimen]?.icon || '🔬'}</span>
                            <span>{c.specimen}</span>
                          </div>
                        </div>
                      );
                    })}
                  </div>

                  {/* Bottom Action buttons */}
                  <div className="flex items-center justify-end gap-1 pt-1 border-t border-slate-100">
                    {activeCopiedTemplate && onPasteTemplateToSlot && (
                      <button
                        onClick={() => onPasteTemplateToSlot(day, ward.id)}
                        className="p-1 bg-teal-600 text-white rounded hover:bg-teal-700 transition-colors"
                        title="วางเชื้อที่นี่"
                      >
                        <ClipboardPaste className="w-3 h-3" />
                      </button>
                    )}
                    <button
                      onClick={() => onAddCaseToSlot(day, ward.id)}
                      className="p-1 bg-slate-100 hover:bg-slate-200 text-slate-700 rounded transition-colors"
                      title="เพิ่มกล่องใหม่"
                    >
                      <Plus className="w-3 h-3 text-teal-700" />
                    </button>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      )}

      {/* Ward IC Care Bundle & Recommendation Footer */}
      {recommendation && (
        <div className="p-4 bg-gradient-to-r from-teal-50/60 to-slate-50 border-t border-slate-200 text-xs">
          <div className="flex items-start gap-3">
            <div className="w-7 h-7 rounded-lg bg-teal-600 text-white flex items-center justify-center shrink-0 mt-0.5">
              <Stethoscope className="w-4 h-4" />
            </div>
            <div className="flex-1">
              <div className="font-bold text-slate-900 text-sm flex items-center gap-2">
                <span>ข้อเสนอแนะและมาตรการ IC สำหรับ {ward.name}</span>
                <span className="text-[10px] bg-teal-100 text-teal-800 font-semibold px-2 py-0.5 rounded">
                  มาตรการเฉพาะหอผู้ป่วย
                </span>
              </div>
              <div className="space-y-1 mt-1 text-slate-600 leading-relaxed">
                {recommendation.recommendations &&
                  recommendation.recommendations.map((rec, rIdx) => (
                    <p key={rIdx}>• {rec}</p>
                  ))}
              </div>

              {recommendation.icBundles && recommendation.icBundles.length > 0 && (
                <div className="mt-2 flex flex-wrap gap-2">
                  {recommendation.icBundles.map((bundle: string, bIdx: number) => (
                    <span
                      key={bIdx}
                      className="bg-white border border-teal-200 text-teal-900 px-2 py-0.5 rounded-md text-[11px] font-medium shadow-2xs"
                    >
                      ✓ {bundle}
                    </span>
                  ))}
                </div>
              )}
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
