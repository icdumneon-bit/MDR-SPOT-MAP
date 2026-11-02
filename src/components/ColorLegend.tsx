import React from 'react';
import { OrganismConfig, SpecimenCategory } from '../types/mdr';
import { Activity, ShieldAlert, Sparkles, Filter, Check } from 'lucide-react';

interface ColorLegendProps {
  organismConfigs: Record<string, OrganismConfig>;
  selectedOrganisms: string[];
  onToggleOrganism: (organism: string) => void;
  onClearFilter: () => void;
  selectedSpecimens: string[];
  onToggleSpecimen: (specimen: string) => void;
}

export const SPECIMEN_ICONS: Record<string, { icon: string; label: string; color: string }> = {
  เสมหะ: { icon: '🫁', label: 'เสมหะ (Sputum)', color: 'bg-amber-100 text-amber-900 border-amber-300' },
  ปัสสาวะ: { icon: '💧', label: 'ปัสสาวะ (Urine)', color: 'bg-sky-100 text-sky-900 border-sky-300' },
  เลือด: { icon: '🩸', label: 'เลือด (Hemoculture)', color: 'bg-red-100 text-red-900 border-red-300' },
  'หนอง/แผล/เนื้อเยื่อ': { icon: '🩹', label: 'หนอง/แผล/เนื้อเยื่อ (Pus/Wound)', color: 'bg-orange-100 text-orange-900 border-orange-300' },
  อื่นๆ: { icon: '🔬', label: 'อื่นๆ (Other)', color: 'bg-slate-100 text-slate-800 border-slate-300' },
};

export const ColorLegend: React.FC<ColorLegendProps> = ({
  organismConfigs,
  selectedOrganisms,
  onToggleOrganism,
  onClearFilter,
  selectedSpecimens,
  onToggleSpecimen,
}) => {
  const organisms = Object.values(organismConfigs).sort((a, b) => b.totalCases - a.totalCases);
  const totalReportedCases = organisms.reduce((sum, item) => sum + item.totalCases, 0);

  return (
    <div className="bg-white rounded-xl border border-slate-200 shadow-sm p-4 mb-6">
      <div className="flex flex-wrap items-center justify-between gap-3 pb-3 border-b border-slate-100">
        <div className="flex items-center gap-2">
          <div className="w-8 h-8 rounded-lg bg-teal-50 border border-teal-200 flex items-center justify-center text-teal-700">
            <Activity className="w-4 h-4" />
          </div>
          <div>
            <h2 className="text-base font-bold text-slate-800 flex items-center gap-2">
              คำอธิบายสีเชื้อดื้อยา (Pathogen Color Legend)
              <span className="text-xs font-semibold px-2 py-0.5 rounded-full bg-slate-100 text-slate-600 border border-slate-200">
                พบ 11 ชนิด รวม {totalReportedCases} ราย
              </span>
            </h2>
            <p className="text-xs text-slate-500">
              คลิกที่บัตรเชื้อหรือสิ่งส่งตรวจเพื่อกรองเน้นเฉพาะรายการที่ต้องการบนตาราง Spot map
            </p>
          </div>
        </div>

        {(selectedOrganisms.length > 0 || selectedSpecimens.length > 0) && (
          <button
            onClick={onClearFilter}
            className="text-xs font-medium text-teal-700 hover:text-teal-800 bg-teal-50 hover:bg-teal-100 px-3 py-1.5 rounded-lg border border-teal-200 flex items-center gap-1.5 transition-colors"
          >
            <Filter className="w-3.5 h-3.5" />
            ล้างตัวกรอง ({selectedOrganisms.length + selectedSpecimens.length})
          </button>
        )}
      </div>

      {/* Organisms color grid */}
      <div className="mt-3">
        <div className="text-xs font-semibold text-slate-600 mb-2 flex items-center gap-1.5">
          <ShieldAlert className="w-3.5 h-3.5 text-rose-500" />
          เชื้อที่ตรวจพบในเดือนนี้ (เรียงตามจำนวนที่พบ):
        </div>
        <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-6 gap-2">
          {organisms.map((item) => {
            const isSelected = selectedOrganisms.includes(item.name);
            const isAnySelected = selectedOrganisms.length > 0;
            const opacityClass = isAnySelected && !isSelected ? 'opacity-40 grayscale-[25%]' : 'opacity-100';
            const percentage = totalReportedCases > 0 ? ((item.totalCases / totalReportedCases) * 100).toFixed(0) : '0';

            return (
              <button
                key={item.name}
                onClick={() => onToggleOrganism(item.name)}
                className={`relative text-left p-2.5 rounded-lg border transition-all text-xs flex flex-col justify-between ${
                  item.color.badgeBg
                } ${isSelected ? 'ring-2 ring-slate-700 shadow-md scale-[1.02]' : 'hover:shadow-sm'} ${opacityClass}`}
                title={`${item.name} - คลิกเพื่อกรอง (${item.totalCases} ราย)`}
              >
                <div className="flex items-start justify-between gap-1.5 w-full">
                  <div className="flex items-center gap-1.5 min-w-0">
                    <span
                      className="w-3 h-3 rounded-full shrink-0 shadow-xs"
                      style={{ backgroundColor: item.color.dot }}
                    />
                    <span className="font-semibold italic truncate text-slate-900" title={item.name}>
                      {item.shortName}
                    </span>
                  </div>
                  {isSelected && (
                    <span className="bg-slate-800 text-white rounded-full p-0.5 shrink-0">
                      <Check className="w-2.5 h-2.5" />
                    </span>
                  )}
                </div>

                <div className="mt-1.5 flex items-center justify-between text-[11px] text-slate-600">
                  <span className="font-bold text-slate-800">
                    {item.totalCases} <span className="font-normal text-slate-500">ราย</span>
                  </span>
                  <span className="text-[10px] px-1 py-0.2 rounded bg-white/70 border border-black/5 font-medium">
                    {percentage}%
                  </span>
                </div>
              </button>
            );
          })}
        </div>
      </div>

      {/* Specimen legend */}
      <div className="mt-3 pt-3 border-t border-slate-100 flex flex-wrap items-center gap-2">
        <span className="text-xs font-semibold text-slate-600 flex items-center gap-1 shrink-0">
          <Sparkles className="w-3.5 h-3.5 text-teal-600" />
          สัญลักษณ์สิ่งส่งตรวจ:
        </span>
        <div className="flex flex-wrap gap-1.5">
          {Object.entries(SPECIMEN_ICONS).map(([key, data]) => {
            const isSelected = selectedSpecimens.includes(key);
            const isAnySpecimenSelected = selectedSpecimens.length > 0;
            const opacity = isAnySpecimenSelected && !isSelected ? 'opacity-40' : 'opacity-100';

            return (
              <button
                key={key}
                onClick={() => onToggleSpecimen(key)}
                className={`text-[11px] px-2.5 py-1 rounded-md border font-medium flex items-center gap-1 transition-all ${
                  data.color
                } ${isSelected ? 'ring-2 ring-slate-800 shadow-xs' : 'hover:brightness-95'} ${opacity}`}
              >
                <span>{data.icon}</span>
                <span>{key}</span>
                {isSelected && <Check className="w-3 h-3 ml-0.5" />}
              </button>
            );
          })}
        </div>
      </div>
    </div>
  );
};
