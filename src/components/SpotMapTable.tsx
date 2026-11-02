import React, { useState } from 'react';
import { MDRCase, WardInfo, OrganismConfig, CopiedCaseTemplate } from '../types/mdr';
import { SPECIMEN_ICONS } from './ColorLegend';
import {
  Plus,
  Edit2,
  Info,
  PlusSquare,
  Maximize2,
  Minimize2,
  Copy,
  ClipboardPaste,
} from 'lucide-react';

interface SpotMapTableProps {
  days: number[];
  wards: WardInfo[];
  cases: MDRCase[];
  monthName?: string;
  monthShortName?: string;
  organismConfigs: Record<string, OrganismConfig>;
  selectedOrganisms: string[];
  selectedSpecimens: string[];
  activeCopiedTemplate?: CopiedCaseTemplate | null;
  visibleWardIds?: string[];
  onAddCaseToSlot: (day: number, wardId: string) => void;
  onSelectCase: (caseItem: MDRCase) => void;
  onSelectWard: (ward: WardInfo) => void;
  onManageWards: () => void;
  onPasteTemplateToSlot?: (day: number, wardId: string) => void;
  onCopyCaseAsTemplate?: (caseItem: MDRCase) => void;
  onFocusWard?: (ward: WardInfo) => void;
}

export const SpotMapTable: React.FC<SpotMapTableProps> = ({
  days,
  wards,
  cases,
  monthName = 'ตุลาคม 2568',
  monthShortName = 'ต.ค. 68',
  organismConfigs,
  selectedOrganisms,
  selectedSpecimens,
  activeCopiedTemplate,
  visibleWardIds,
  onAddCaseToSlot,
  onSelectCase,
  onSelectWard,
  onManageWards,
  onPasteTemplateToSlot,
  onCopyCaseAsTemplate,
  onFocusWard,
}) => {
  const [isExpandedBox, setIsExpandedBox] = useState<boolean>(true);

  // Filter wards if visibleWardIds is provided
  const displayedWards = React.useMemo(() => {
    if (!visibleWardIds || visibleWardIds.length === 0) return wards;
    return wards.filter((w) => visibleWardIds.includes(w.id));
  }, [wards, visibleWardIds]);

  // Pre-index cases by `day_wardId` for fast lookup
  const caseMap = React.useMemo(() => {
    const map = new Map<string, MDRCase[]>();
    cases.forEach((c) => {
      const key = `${c.day}_${c.wardId}`;
      const existing = map.get(key) || [];
      existing.push(c);
      map.set(key, existing);
    });
    return map;
  }, [cases]);

  // Calculate totals per ward
  const wardTotals = React.useMemo(() => {
    const totals: Record<string, number> = {};
    wards.forEach((w) => {
      totals[w.id] = 0;
    });
    cases.forEach((c) => {
      if (totals[c.wardId] !== undefined) {
        totals[c.wardId] += c.count || 1;
      }
    });
    return totals;
  }, [wards, cases]);

  // Calculate totals per day
  const dayTotals = React.useMemo(() => {
    const totals: Record<number, number> = {};
    days.forEach((d) => {
      totals[d] = 0;
    });
    cases.forEach((c) => {
      if (totals[c.day] !== undefined) {
        totals[c.day] += c.count || 1;
      }
    });
    return totals;
  }, [days, cases]);

  const grandTotal = React.useMemo(() => {
    return cases.reduce((sum, c) => sum + (c.count || 1), 0);
  }, [cases]);

  // Helper to check if case passes current filters
  const matchesFilter = (c: MDRCase) => {
    const organismMatch =
      selectedOrganisms.length === 0 || selectedOrganisms.includes(c.organism);
    const specimenMatch =
      selectedSpecimens.length === 0 || selectedSpecimens.includes(c.specimen);
    return organismMatch && specimenMatch;
  };

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

  return (
    <div className="bg-white rounded-xl border border-slate-200 shadow-sm overflow-hidden flex flex-col">
      {/* Table Title and Controls */}
      <div className="p-4 bg-slate-50 border-b border-slate-200 flex flex-wrap items-center justify-between gap-3">
        <div className="flex items-center gap-2">
          <div className="w-3 h-3 rounded-full bg-teal-500 animate-pulse" />
          <h3 className="font-bold text-slate-800 text-sm md:text-base">
            ตาราง Spot Map เชื้อดื้อยา ({monthName} วันที่ 1 - {days.length} แยกตามหอผู้ป่วย)
          </h3>
          <span className="text-xs bg-teal-100 text-teal-800 font-semibold px-2.5 py-0.5 rounded-full border border-teal-200">
            รวม {grandTotal} ราย
          </span>
        </div>

        <div className="flex flex-wrap items-center gap-2">
          {/* Quick Add Box Button */}
          <button
            onClick={() => onAddCaseToSlot(1, wards[0]?.id || 'med_male')}
            className="text-xs bg-teal-600 hover:bg-teal-700 text-white font-semibold px-3 py-1.5 rounded-lg shadow-2xs flex items-center gap-1.5 transition-colors"
            title="เพิ่มกล่องบันทึกเคสเชื้อดื้อยาลงในตาราง"
          >
            <PlusSquare className="w-3.5 h-3.5" />
            <span>+ เพิ่มกล่อง Spot Map</span>
          </button>

          {/* Toggle Box View Size */}
          <button
            onClick={() => setIsExpandedBox(!isExpandedBox)}
            className="text-xs bg-white hover:bg-slate-100 text-slate-700 font-medium px-3 py-1.5 rounded-lg border border-slate-300 shadow-2xs flex items-center gap-1.5 transition-colors"
            title="สลับขนาดกล่องเคสในตาราง"
          >
            {isExpandedBox ? (
              <>
                <Minimize2 className="w-3.5 h-3.5 text-slate-500" />
                <span>กล่องกะทัดรัด</span>
              </>
            ) : (
              <>
                <Maximize2 className="w-3.5 h-3.5 text-slate-500" />
                <span>กล่องละเอียด</span>
              </>
            )}
          </button>

          <button
            onClick={onManageWards}
            className="text-xs bg-white hover:bg-slate-100 text-slate-700 font-medium px-3 py-1.5 rounded-lg border border-slate-300 shadow-2xs flex items-center gap-1.5 transition-colors"
          >
            <Edit2 className="w-3.5 h-3.5 text-slate-500" />
            <span>ปรับแต่งหน่วยงาน (+5 ช่อง)</span>
          </button>
        </div>
      </div>

      {/* Matrix Table with sticky headers and responsive scrolling */}
      <div className="relative overflow-auto max-h-[750px] border-b border-slate-200">
        <table className="w-full border-collapse text-left text-xs">
          <thead>
            <tr className="bg-slate-800 text-white divide-x divide-slate-700">
              {/* Sticky Top-Left Corner: วันที่ */}
              <th className="sticky top-0 left-0 z-30 bg-slate-900 px-3 py-3 text-center font-bold min-w-[75px] shadow-sm">
                <span className="block text-slate-400 text-[10px] uppercase font-semibold">วันที่</span>
                <span>Day</span>
              </th>

              {/* Horizontal Ward Columns */}
              {displayedWards.map((ward, idx) => (
                <th
                  key={ward.id}
                  className={`sticky top-0 z-20 px-2 py-2.5 text-center font-semibold select-none transition-colors group min-w-[160px] max-w-[190px] ${
                    ward.isCustom
                      ? 'bg-emerald-950/90 hover:bg-emerald-900 text-emerald-100'
                      : 'bg-slate-800 hover:bg-slate-700'
                  }`}
                  title={`${ward.name} (${ward.building || ''} ${ward.floor || ''})`}
                >
                  <div className="flex flex-col items-center justify-center gap-0.5">
                    {ward.isCustom && (
                      <span className="text-[9px] uppercase tracking-wider bg-emerald-700/80 text-emerald-100 px-1.5 py-0.2 rounded font-mono font-normal">
                        +ช่องเพิ่ม {idx - 16}
                      </span>
                    )}
                    <span
                      onClick={() => onSelectWard(ward)}
                      className="font-bold text-xs truncate max-w-[150px] text-white group-hover:text-teal-300 transition-colors cursor-pointer"
                      title="คลิกดูสรุปและข้อเสนอแนะ IC"
                    >
                      {ward.name}
                    </span>
                    <div className="flex items-center gap-1.5 text-[10px] text-slate-300 font-mono mt-0.5">
                      <span>{wardTotals[ward.id] || 0} ราย</span>
                      {onFocusWard && (
                        <button
                          onClick={(e) => {
                            e.stopPropagation();
                            onFocusWard(ward);
                          }}
                          className="px-1.5 py-0.2 rounded bg-slate-700/90 hover:bg-teal-600 text-slate-200 hover:text-white text-[10px] border border-slate-600 transition-colors shadow-2xs"
                          title={`สลับดูตาราง Spot Map เฉพาะหอผู้ป่วย ${ward.name}`}
                        >
                          🔍 ดูแยกเดี่ยว
                        </button>
                      )}
                    </div>
                  </div>
                </th>
              ))}

              {/* Rightmost Total Column Header */}
              <th className="sticky top-0 right-0 z-30 bg-slate-900 px-3 py-2.5 text-center font-bold min-w-[65px] text-teal-300 shadow-sm">
                <span className="block text-[10px] text-slate-400">รวม</span>
                <span>Total</span>
              </th>
            </tr>
          </thead>

          <tbody className="divide-y divide-slate-200">
            {days.map((day) => {
              const dayCaseCount = dayTotals[day] || 0;
              const isZeroDay = dayCaseCount === 0;

              return (
                <tr
                  key={day}
                  className={`divide-x divide-slate-200 hover:bg-slate-50/60 transition-colors ${
                    isZeroDay ? 'bg-white' : 'bg-slate-50/20'
                  }`}
                >
                  {/* Sticky Vertical Day Column */}
                  <td className="sticky left-0 z-10 bg-slate-100/95 font-bold text-center px-2 py-2 text-slate-800 border-r border-slate-300 select-none shadow-xs">
                    <div className="flex flex-col items-center justify-center">
                      <span className="text-sm">{day}</span>
                      <span className="text-[9px] text-slate-500 font-medium">{monthShortName}</span>
                    </div>
                  </td>

                  {/* Ward Cells */}
                  {displayedWards.map((ward) => {
                    const key = `${day}_${ward.id}`;
                    const cellCases = caseMap.get(key) || [];
                    const hasCases = cellCases.length > 0;

                    return (
                      <td
                        key={ward.id}
                        className={`p-1.5 align-top relative group transition-all min-h-[54px] ${
                          hasCases ? 'bg-amber-50/10' : ''
                        } ${activeCopiedTemplate ? 'hover:bg-teal-50/40' : ''}`}
                      >
                        {hasCases ? (
                          <div className="space-y-1.5">
                            {cellCases.map((c) => {
                              const org = getOrganismStyle(c.organism);
                              const isMatch = matchesFilter(c);
                              const spec = SPECIMEN_ICONS[c.specimen] || {
                                icon: '🔬',
                                label: c.specimen,
                                color: 'bg-slate-100 text-slate-800 border-slate-300',
                              };

                              return (
                                <div
                                  key={c.id}
                                  onClick={() => onSelectCase(c)}
                                  className={`rounded-xl p-1.5 border cursor-pointer transition-all duration-150 shadow-2xs hover:shadow-md hover:scale-[1.01] bg-white space-y-1 ${
                                    isMatch
                                      ? 'opacity-100 ring-1 ring-slate-300'
                                      : 'opacity-25 grayscale-[60%]'
                                  }`}
                                  title={`คลิกเพื่อดูรายละเอียด / แก้ไข: ${c.organism} (${c.resistanceGroup}) · ${c.specimen}`}
                                >
                                  {/* กล่องที่ 1: กล่องชื่อเชื้อและกลุ่มความดื้อยา */}
                                  <div className={`rounded-lg p-1.5 border ${org.color.badgeBg}`}>
                                    <div className="flex items-start justify-between gap-1 mb-0.5">
                                      <div className="flex items-center gap-1 min-w-0">
                                        <span
                                          className="w-2.5 h-2.5 rounded-full shrink-0 shadow-2xs"
                                          style={{ backgroundColor: org.color.dot }}
                                        />
                                        <span className="font-bold text-[11px] italic truncate text-slate-900 leading-tight">
                                          {c.organism}
                                        </span>
                                      </div>
                                      <div className="flex items-center gap-1 shrink-0">
                                        {c.count > 1 && (
                                          <span className="text-[10px] font-black bg-rose-600 text-white px-1.5 py-0.2 rounded-full shadow-2xs">
                                            ×{c.count}
                                          </span>
                                        )}
                                        {/* Quick Copy this case button */}
                                        <button
                                          onClick={(e) => {
                                            e.stopPropagation();
                                            if (onCopyCaseAsTemplate) onCopyCaseAsTemplate(c);
                                          }}
                                          className="p-1 rounded text-slate-500 hover:text-slate-900 hover:bg-black/10 transition-colors"
                                          title="คัดลอกชุดเชื้อนี้เพื่อนำไปวางในช่องอื่น"
                                        >
                                          <Copy className="w-2.5 h-2.5" />
                                        </button>
                                      </div>
                                    </div>

                                    {/* Resistance Tag */}
                                    <div className="text-[10px] font-medium text-slate-700 leading-snug line-clamp-1 bg-white/80 px-1 py-0.5 rounded border border-black/5">
                                      {c.resistanceGroup}
                                    </div>
                                  </div>

                                  {/* กล่องที่ 2: กล่องสิ่งส่งตรวจ (แยกกล่องอิสระ) */}
                                  <div
                                    className={`rounded-md px-1.5 py-1 border flex items-center justify-between text-[10px] font-medium leading-none ${spec.color}`}
                                  >
                                    <div className="flex items-center gap-1 min-w-0">
                                      <span className="text-[11px]">{spec.icon}</span>
                                      <span className="truncate max-w-[85px]">{c.specimen}</span>
                                    </div>
                                    {c.hn && (
                                      <span className="text-[9px] font-mono text-slate-600 bg-white/80 px-1 rounded">
                                        HN: {c.hn}
                                      </span>
                                    )}
                                  </div>
                                </div>
                              );
                            })}

                            {/* Paste or Add another box */}
                            {activeCopiedTemplate ? (
                              <button
                                onClick={() => onPasteTemplateToSlot && onPasteTemplateToSlot(day, ward.id)}
                                className="w-full mt-1 p-1.5 rounded-md text-[10px] font-bold text-white bg-teal-600 hover:bg-teal-700 border border-teal-700 flex items-center justify-center gap-1 shadow-2xs transition-colors"
                                title={`วาง ${activeCopiedTemplate.organism} ลงในช่องนี้`}
                              >
                                <ClipboardPaste className="w-3 h-3" />
                                <span>+ วางที่นี่</span>
                              </button>
                            ) : (
                              <button
                                onClick={() => onAddCaseToSlot(day, ward.id)}
                                className="w-full mt-1 opacity-0 group-hover:opacity-100 transition-opacity p-1 rounded-md text-[10px] text-teal-700 bg-teal-50 hover:bg-teal-100 border border-dashed border-teal-300 flex items-center justify-center gap-1"
                                title={`เพิ่มกล่องเชื้อดื้อยาอีกเคส วันที่ ${day} หอ ${ward.name}`}
                              >
                                <Plus className="w-3 h-3" />
                                <span>+ เพิ่มกล่อง</span>
                              </button>
                            )}
                          </div>
                        ) : (
                          <div className="w-full h-full min-h-[46px] flex flex-col items-center justify-center">
                            {activeCopiedTemplate ? (
                              <button
                                onClick={() => onPasteTemplateToSlot && onPasteTemplateToSlot(day, ward.id)}
                                className="w-full py-2 px-1 rounded-lg bg-teal-50 hover:bg-teal-600 text-teal-800 hover:text-white font-bold text-[10px] border border-teal-300 hover:border-teal-600 flex items-center justify-center gap-1 shadow-2xs transition-all"
                                title={`คลิกเพื่อวาง ${activeCopiedTemplate.organism} (${activeCopiedTemplate.specimen})`}
                              >
                                <ClipboardPaste className="w-3.5 h-3.5" />
                                <span>+ วางที่นี่</span>
                              </button>
                            ) : (
                              <button
                                onClick={() => onAddCaseToSlot(day, ward.id)}
                                className="w-full py-1.5 px-1 rounded-md text-slate-400 hover:text-teal-700 hover:bg-teal-50/80 border border-dashed border-slate-200 hover:border-teal-400 text-[10px] flex items-center justify-center gap-1 transition-all group-hover:border-teal-300"
                                title={`เพิ่มกล่อง Spot Map วันที่ ${day} หอผู้ป่วย ${ward.name}`}
                              >
                                <Plus className="w-3 h-3" />
                                <span className="font-medium">+ กล่อง</span>
                              </button>
                            )}
                          </div>
                        )}
                      </td>
                    );
                  })}

                  {/* Sticky Right Daily Total */}
                  <td className="sticky right-0 z-10 bg-slate-100/95 font-bold text-center px-2 py-2 text-slate-800 border-l border-slate-300 shadow-xs">
                    <span
                      className={`inline-block px-2 py-0.5 rounded text-xs ${
                        dayCaseCount > 2
                          ? 'bg-rose-100 text-rose-800 font-extrabold'
                          : dayCaseCount > 0
                          ? 'bg-slate-200 text-slate-800'
                          : 'text-slate-400 font-normal'
                      }`}
                    >
                      {dayCaseCount}
                    </span>
                  </td>
                </tr>
              );
            })}
          </tbody>

          {/* Table Footer: Total row per ward */}
          <tfoot>
            <tr className="bg-slate-900 text-white font-bold divide-x divide-slate-800 sticky bottom-0 z-30 shadow-lg">
              <td className="sticky left-0 bottom-0 z-40 bg-slate-950 px-3 py-3 text-center text-teal-400">
                <span className="block text-[10px] text-slate-400 uppercase">สรุปรวม</span>
                <span>รวม</span>
              </td>

              {displayedWards.map((ward) => {
                const count = wardTotals[ward.id] || 0;
                let badgeColor = 'bg-slate-800 text-slate-400';
                if (count >= 10) badgeColor = 'bg-rose-600 text-white font-black animate-pulse';
                else if (count >= 5) badgeColor = 'bg-amber-600 text-white font-bold';
                else if (count > 0) badgeColor = 'bg-teal-700 text-white font-semibold';

                return (
                  <td
                    key={ward.id}
                    onClick={() => onSelectWard(ward)}
                    className="p-2 text-center cursor-pointer hover:bg-slate-800 transition-colors"
                    title={`รวมหอผู้ป่วย ${ward.name}: ${count} ราย (คลิกดูข้อเสนอแนะ)`}
                  >
                    <div className="flex flex-col items-center justify-center">
                      <span className={`text-xs px-2.5 py-0.5 rounded-full ${badgeColor}`}>
                        {count}
                      </span>
                      <span className="text-[10px] text-slate-400 mt-0.5 font-normal">ราย</span>
                    </div>
                  </td>
                );
              })}

              {/* Grand Total */}
              <td className="sticky right-0 bottom-0 z-40 bg-slate-950 px-3 py-3 text-center text-teal-300">
                <div className="flex flex-col items-center justify-center">
                  <span className="text-sm font-extrabold text-teal-400 px-2 py-0.5 rounded bg-teal-950 border border-teal-800">
                    {grandTotal}
                  </span>
                  <span className="text-[10px] text-slate-400 mt-0.5 font-normal">ราย</span>
                </div>
              </td>
            </tr>
          </tfoot>
        </table>
      </div>

      {/* Helpful Hint footer */}
      <div className="px-4 py-2.5 bg-slate-50 border-t border-slate-200 text-[11px] text-slate-500 flex flex-wrap items-center justify-between gap-2">
        <div className="flex items-center gap-1.5">
          <Info className="w-3.5 h-3.5 text-teal-600" />
          <span>
            คำแนะนำ: สามารถคลิกไอคอน <strong>Copy (คัดลอก)</strong> บนกล่องเคส หรือเลือกจาก <strong>กล่องรายชื่อเชื้อแม่แบบด้านบน</strong> แล้วคลิก <strong>"+ วางที่นี่"</strong> ได้ทันที
          </span>
        </div>
        <div className="flex items-center gap-3 text-slate-600 font-medium">
          <span className="flex items-center gap-1">
            <span className="w-2.5 h-2.5 rounded-full bg-rose-600 inline-block" /> วิกฤต (≥10 ราย)
          </span>
          <span className="flex items-center gap-1">
            <span className="w-2.5 h-2.5 rounded-full bg-amber-600 inline-block" /> สูง (5-9 ราย)
          </span>
          <span className="flex items-center gap-1">
            <span className="w-2.5 h-2.5 rounded-full bg-teal-700 inline-block" /> ปานกลาง/น้อย (1-4 ราย)
          </span>
        </div>
      </div>
    </div>
  );
};
