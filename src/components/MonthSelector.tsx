import React from 'react';
import { FISCAL_MONTHS } from '../data/fullYearData';
import { MDRCase, FiscalMonthInfo } from '../types/mdr';
import { ChevronLeft, ChevronRight, BarChart3, Grid3X3, Sparkles } from 'lucide-react';

interface MonthSelectorProps {
  currentFiscalIndex: number; // 1 to 12
  cases: MDRCase[];
  viewMode: 'month' | 'annual';
  onSelectFiscalMonth: (fiscalIndex: number) => void;
  onSelectViewMode: (mode: 'month' | 'annual') => void;
}

export const MonthSelector: React.FC<MonthSelectorProps> = ({
  currentFiscalIndex,
  cases,
  viewMode,
  onSelectFiscalMonth,
  onSelectViewMode,
}) => {
  // Compute total cases for each fiscal month (matching both month and year)
  const fiscalMonthCounts = React.useMemo(() => {
    const counts: Record<number, number> = {};
    FISCAL_MONTHS.forEach((fm) => {
      counts[fm.fiscalIndex] = 0;
    });

    cases.forEach((c) => {
      const cMonth = c.month || 10;
      const cYear = c.year || 2568;
      const match = FISCAL_MONTHS.find(
        (fm) => fm.monthNumber === cMonth && fm.year === cYear
      );
      if (match) {
        counts[match.fiscalIndex] += c.count || 1;
      } else {
        // Fallback matching by month
        const matchByMonth = FISCAL_MONTHS.find((fm) => fm.monthNumber === cMonth);
        if (matchByMonth) {
          counts[matchByMonth.fiscalIndex] += c.count || 1;
        }
      }
    });

    return counts;
  }, [cases]);

  const activeFiscalMonth =
    FISCAL_MONTHS.find((fm) => fm.fiscalIndex === currentFiscalIndex) || FISCAL_MONTHS[0];

  const handlePrevMonth = () => {
    onSelectViewMode('month');
    onSelectFiscalMonth(currentFiscalIndex === 1 ? 12 : currentFiscalIndex - 1);
  };

  const handleNextMonth = () => {
    onSelectViewMode('month');
    onSelectFiscalMonth(currentFiscalIndex === 12 ? 1 : currentFiscalIndex + 1);
  };

  const grandTotalFiscalYear = React.useMemo(() => {
    return cases.reduce((sum, c) => sum + (c.count || 1), 0);
  }, [cases]);

  return (
    <div className="bg-white rounded-xl border border-slate-200 shadow-sm p-3.5 mb-5">
      {/* Top Bar: View Mode Tabs & Fiscal Year Badge */}
      <div className="flex flex-wrap items-center justify-between gap-3 pb-3 border-b border-slate-100">
        <div className="flex flex-wrap items-center gap-2">
          {/* View Mode Toggle */}
          <div className="bg-slate-100 p-1 rounded-lg flex items-center gap-1 border border-slate-200 text-xs">
            <button
              onClick={() => onSelectViewMode('month')}
              className={`px-3 py-1.5 rounded-md font-medium flex items-center gap-1.5 transition-all ${
                viewMode === 'month'
                  ? 'bg-white text-teal-800 shadow-2xs font-bold'
                  : 'text-slate-600 hover:text-slate-900'
              }`}
            >
              <Grid3X3 className="w-3.5 h-3.5" />
              <span>ตาราง Spot Map ประจำเดือน</span>
            </button>
            <button
              onClick={() => onSelectViewMode('annual')}
              className={`px-3 py-1.5 rounded-md font-medium flex items-center gap-1.5 transition-all ${
                viewMode === 'annual'
                  ? 'bg-white text-teal-800 shadow-2xs font-bold'
                  : 'text-slate-600 hover:text-slate-900'
              }`}
            >
              <BarChart3 className="w-3.5 h-3.5 text-teal-600" />
              <span>ภาพรวมปีงบประมาณ 2569 (12 เดือน)</span>
            </button>
          </div>

          <div className="flex items-center gap-1.5">
            <span className="text-xs font-bold px-2.5 py-1 rounded-full bg-emerald-50 text-emerald-800 border border-emerald-300 flex items-center gap-1">
              <Sparkles className="w-3 h-3 text-emerald-600" />
              ปีงบประมาณ 2569 (ต.ค. 68 – ก.ย. 69)
            </span>
            <span className="text-xs font-semibold px-2 py-0.5 rounded-full bg-slate-100 text-slate-600 border border-slate-200 font-mono">
              รวมทั้งปี {grandTotalFiscalYear} ราย
            </span>
          </div>
        </div>

        {/* Month Arrows Navigation */}
        <div className="flex items-center gap-1.5">
          <button
            onClick={handlePrevMonth}
            className="p-1.5 rounded-lg border border-slate-200 hover:bg-slate-100 text-slate-600 hover:text-slate-900 transition-colors"
            title="เดือนก่อนหน้า"
          >
            <ChevronLeft className="w-4 h-4" />
          </button>
          <div className="text-xs font-bold text-slate-800 px-2 min-w-[140px] text-center">
            <span>{activeFiscalMonth.name}</span>
            <span className="text-[10px] text-slate-500 font-normal block">
              ({activeFiscalMonth.daysCount} วัน)
            </span>
          </div>
          <button
            onClick={handleNextMonth}
            className="p-1.5 rounded-lg border border-slate-200 hover:bg-slate-100 text-slate-600 hover:text-slate-900 transition-colors"
            title="เดือนถัดไป"
          >
            <ChevronRight className="w-4 h-4" />
          </button>
        </div>
      </div>

      {/* 12 Months Tabs Strip (Strict Fiscal Year Order: Oct 68 -> Sep 69) */}
      <div className="grid grid-cols-3 sm:grid-cols-4 md:grid-cols-6 lg:grid-cols-12 gap-1.5 pt-3">
        {FISCAL_MONTHS.map((fm) => {
          const isSelected = viewMode === 'month' && currentFiscalIndex === fm.fiscalIndex;
          const count = fiscalMonthCounts[fm.fiscalIndex] || 0;
          const isDocumentMonth = fm.fiscalIndex === 1; // ตุลาคม 2568 (Exact document month)

          return (
            <button
              key={fm.fiscalIndex}
              onClick={() => {
                onSelectViewMode('month');
                onSelectFiscalMonth(fm.fiscalIndex);
              }}
              className={`relative p-2 rounded-lg border text-center transition-all flex flex-col items-center justify-between min-h-[62px] ${
                isSelected
                  ? 'bg-teal-700 text-white border-teal-800 shadow-md ring-2 ring-teal-500/30'
                  : 'bg-slate-50/80 hover:bg-slate-100 text-slate-700 border-slate-200'
              }`}
            >
              {isDocumentMonth && (
                <span
                  className="absolute -top-1.5 -right-1 text-[8px] font-black bg-rose-600 text-white px-1.5 py-0.2 rounded-full shadow-2xs"
                  title="ข้อมูลตรงตามเอกสารแนบ"
                >
                  เอกสาร
                </span>
              )}

              <div className="flex flex-col items-center">
                <span className={`text-xs font-bold leading-tight ${isSelected ? 'text-white' : 'text-slate-800'}`}>
                  {fm.shortName}
                </span>
                <span className={`text-[9px] ${isSelected ? 'text-teal-200' : 'text-slate-400'}`}>
                  (ด.{fm.fiscalIndex})
                </span>
              </div>

              <div className="mt-1 flex items-center justify-center">
                <span
                  className={`text-[10px] font-bold px-1.5 py-0.2 rounded-full font-mono ${
                    isSelected
                      ? 'bg-teal-800/90 text-teal-100 border border-teal-600'
                      : count > 0
                      ? 'bg-white text-slate-700 border border-slate-200 shadow-2xs'
                      : 'text-slate-400'
                  }`}
                >
                  {count}
                </span>
              </div>
            </button>
          );
        })}
      </div>
    </div>
  );
};
