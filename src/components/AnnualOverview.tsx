import React, { useMemo } from 'react';
import { FISCAL_MONTHS } from '../data/fullYearData';
import { MDRCase, WardInfo, OrganismConfig } from '../types/mdr';
import {
  TrendingUp,
  BarChart3,
  Building2,
  ShieldAlert,
  Calendar,
  Sparkles,
} from 'lucide-react';

interface AnnualOverviewProps {
  cases: MDRCase[];
  wards: WardInfo[];
  organismConfigs: Record<string, OrganismConfig>;
  onSelectFiscalMonth: (fiscalIndex: number) => void;
}

export const AnnualOverview: React.FC<AnnualOverviewProps> = ({
  cases,
  wards,
  organismConfigs,
  onSelectFiscalMonth,
}) => {
  // Monthly Totals ordered by fiscal month (1 = Oct 68 ... 12 = Sep 69)
  const fiscalTotals = useMemo(() => {
    const totals: Record<number, number> = {};
    FISCAL_MONTHS.forEach((fm) => {
      totals[fm.fiscalIndex] = 0;
    });

    cases.forEach((c) => {
      const cMonth = c.month || 10;
      const cYear = c.year || 2568;
      const match = FISCAL_MONTHS.find(
        (fm) => fm.monthNumber === cMonth && fm.year === cYear
      );
      if (match) {
        totals[match.fiscalIndex] += c.count || 1;
      } else {
        const matchByMonth = FISCAL_MONTHS.find((fm) => fm.monthNumber === cMonth);
        if (matchByMonth) {
          totals[matchByMonth.fiscalIndex] += c.count || 1;
        }
      }
    });

    return totals;
  }, [cases]);

  const maxMonthVal = useMemo(() => {
    return Math.max(...Object.values(fiscalTotals), 1);
  }, [fiscalTotals]);

  const grandTotal = useMemo(() => {
    return cases.reduce((sum, c) => sum + (c.count || 1), 0);
  }, [cases]);

  const averagePerMonth = (grandTotal / 12).toFixed(1);

  // Month-by-Ward Matrix (Fiscal Year)
  const wardMonthlyData = useMemo(() => {
    const matrix: Record<string, Record<number, number>> = {};
    wards.forEach((w) => {
      matrix[w.id] = {};
      FISCAL_MONTHS.forEach((fm) => {
        matrix[w.id][fm.fiscalIndex] = 0;
      });
    });

    cases.forEach((c) => {
      const cMonth = c.month || 10;
      const cYear = c.year || 2568;
      const match = FISCAL_MONTHS.find(
        (fm) => fm.monthNumber === cMonth && fm.year === cYear
      );
      const fIdx = match ? match.fiscalIndex : (FISCAL_MONTHS.find(fm => fm.monthNumber === cMonth)?.fiscalIndex || 1);

      if (matrix[c.wardId]) {
        matrix[c.wardId][fIdx] = (matrix[c.wardId][fIdx] || 0) + (c.count || 1);
      }
    });

    return matrix;
  }, [wards, cases]);

  // Pathogen breakdown per fiscal month
  const topOrganisms = useMemo(() => {
    const orgCounts: Record<string, number> = {};
    cases.forEach((c) => {
      orgCounts[c.organism] = (orgCounts[c.organism] || 0) + (c.count || 1);
    });
    return Object.entries(orgCounts)
      .sort((a, b) => b[1] - a[1])
      .map(([name]) => name);
  }, [cases]);

  const pathogenMonthlyData = useMemo(() => {
    const data: Record<string, Record<number, number>> = {};
    topOrganisms.forEach((org) => {
      data[org] = {};
      FISCAL_MONTHS.forEach((fm) => {
        data[org][fm.fiscalIndex] = 0;
      });
    });

    cases.forEach((c) => {
      const cMonth = c.month || 10;
      const cYear = c.year || 2568;
      const match = FISCAL_MONTHS.find(
        (fm) => fm.monthNumber === cMonth && fm.year === cYear
      );
      const fIdx = match ? match.fiscalIndex : (FISCAL_MONTHS.find(fm => fm.monthNumber === cMonth)?.fiscalIndex || 1);

      if (data[c.organism]) {
        data[c.organism][fIdx] = (data[c.organism][fIdx] || 0) + (c.count || 1);
      }
    });

    return data;
  }, [topOrganisms, cases]);

  return (
    <div className="space-y-6">
      {/* Header Banner: Thai Fiscal Year 2569 */}
      <div className="bg-gradient-to-r from-teal-800 to-slate-900 text-white p-5 rounded-2xl shadow-sm flex flex-wrap items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2">
            <span className="bg-emerald-500/20 text-emerald-300 border border-emerald-400/30 text-xs px-2.5 py-0.5 rounded-full font-bold flex items-center gap-1">
              <Sparkles className="w-3.5 h-3.5" />
              ปีงบประมาณ 2569 (Fiscal Year 2026)
            </span>
          </div>
          <h2 className="text-xl font-black mt-1 tracking-tight">
            ภาพรวมเฝ้าระวังเชื้อดื้อยา 12 เดือน (ตุลาคม 2568 – กันยายน 2569)
          </h2>
          <p className="text-xs text-teal-200 mt-0.5">
            สรุปสถานการณ์ความชุกทางระบาดวิทยา การติดเชื้อในโรงพยาบาล และแนวโน้มจำแนกตามหอผู้ป่วย
          </p>
        </div>

        <div className="flex items-center gap-3 bg-white/10 p-3 rounded-xl backdrop-blur-xs">
          <div>
            <div className="text-[10px] text-teal-200 uppercase font-semibold">ยอดรวมทั้งปีงบประมาณ</div>
            <div className="text-2xl font-black text-white">{grandTotal} <span className="text-xs font-normal text-teal-200">ราย</span></div>
          </div>
        </div>
      </div>

      {/* KPI Cards Strip */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <div className="bg-white p-4 rounded-xl border border-slate-200 shadow-xs">
          <div className="text-xs text-slate-500 font-semibold uppercase">รวมผู้ป่วยเชื้อดื้อยา (ปีงบ 2569)</div>
          <div className="text-2xl font-black text-slate-900 mt-1">
            {grandTotal} <span className="text-xs font-normal text-slate-500">ราย</span>
          </div>
          <div className="text-[11px] text-teal-700 mt-1 font-medium">เฉลี่ย {averagePerMonth} ราย / เดือน</div>
        </div>

        <div className="bg-white p-4 rounded-xl border border-slate-200 shadow-xs">
          <div className="text-xs text-slate-500 font-semibold uppercase">เดือนข้อมูลจริงตามเอกสาร</div>
          <div className="text-2xl font-black text-rose-600 mt-1">
            ตุลาคม 2568 (50 ราย)
          </div>
          <div className="text-[11px] text-slate-500 mt-1">ตรงตามไฟล์รายงาน MDR ประจำโรงพยาบาล</div>
        </div>

        <div className="bg-white p-4 rounded-xl border border-slate-200 shadow-xs">
          <div className="text-xs text-slate-500 font-semibold uppercase">เชื้อที่พบบ่อยสุดทั้งปี</div>
          <div className="text-2xl font-black text-emerald-700 mt-1 italic truncate">
            {topOrganisms[0] || 'E. coli'}
          </div>
          <div className="text-[11px] text-slate-500 mt-1">พบบ่อยในปัสสาวะ แผล และกระแสเลือด</div>
        </div>

        <div className="bg-white p-4 rounded-xl border border-slate-200 shadow-xs">
          <div className="text-xs text-slate-500 font-semibold uppercase">หอผู้ป่วยที่มีภาระโรคสูงสุด</div>
          <div className="text-2xl font-black text-slate-900 mt-1">
            อายุรกรรมชาย
          </div>
          <div className="text-[11px] text-rose-600 font-medium mt-1">เฝ้าระวังเชื้อ CRAB และ CRE อย่างใกล้ชิด</div>
        </div>
      </div>

      {/* 12 Months Visual Trend Chart (Fiscal Order: Oct 68 - Sep 69) */}
      <div className="bg-white rounded-xl border border-slate-200 shadow-sm p-5">
        <div className="flex items-center justify-between pb-3 border-b border-slate-100">
          <div className="flex items-center gap-2">
            <div className="w-8 h-8 rounded-lg bg-teal-50 border border-teal-200 flex items-center justify-center text-teal-700">
              <TrendingUp className="w-4 h-4" />
            </div>
            <div>
              <h3 className="font-bold text-slate-800 text-sm md:text-base">
                แนวโน้มจำนวนผู้ป่วยเชื้อดื้อยารายเดือน ตลอดปีงบประมาณ 2569 (ต.ค. 68 – ก.ย. 69)
              </h3>
              <p className="text-xs text-slate-500">
                คลิกที่แท่งกราฟเดือนใดเพื่อเปิดตาราง Spot Map ประจำเดือนนั้นทันที
              </p>
            </div>
          </div>
        </div>

        {/* Visual Bar Chart */}
        <div className="mt-6 pt-4 pb-2 px-2">
          <div className="grid grid-cols-12 gap-2 sm:gap-3 items-end h-48 border-b border-slate-200">
            {FISCAL_MONTHS.map((fm) => {
              const count = fiscalTotals[fm.fiscalIndex] || 0;
              const heightPercent = maxMonthVal > 0 ? (count / maxMonthVal) * 100 : 0;
              const isDocumentMonth = fm.fiscalIndex === 1; // ต.ค. 68

              return (
                <button
                  key={fm.fiscalIndex}
                  onClick={() => onSelectFiscalMonth(fm.fiscalIndex)}
                  className="group flex flex-col items-center justify-end h-full focus:outline-none transition-all"
                  title={`${fm.name}: ${count} ราย (คลิกเพื่อดู Spot Map)`}
                >
                  <span className="text-[10px] font-bold text-slate-700 opacity-0 group-hover:opacity-100 mb-1 transition-opacity">
                    {count}
                  </span>
                  <div
                    className={`w-full max-w-[36px] rounded-t-md transition-all duration-300 relative ${
                      isDocumentMonth
                        ? 'bg-rose-500 group-hover:bg-rose-600 shadow-md ring-2 ring-rose-300/40'
                        : 'bg-teal-600 group-hover:bg-teal-500 shadow-2xs'
                    }`}
                    style={{ height: `${Math.max(12, heightPercent)}%` }}
                  >
                    {isDocumentMonth && (
                      <span className="absolute -top-5 left-1/2 -translate-x-1/2 text-[8px] font-extrabold bg-rose-600 text-white px-1 py-0.2 rounded shadow-2xs whitespace-nowrap">
                        เอกสารจริง
                      </span>
                    )}
                  </div>
                </button>
              );
            })}
          </div>

          {/* Month labels under bars */}
          <div className="grid grid-cols-12 gap-2 sm:gap-3 mt-2 text-center text-xs font-semibold text-slate-600">
            {FISCAL_MONTHS.map((fm) => (
              <button
                key={fm.fiscalIndex}
                onClick={() => onSelectFiscalMonth(fm.fiscalIndex)}
                className="hover:text-teal-700 hover:underline focus:outline-none text-[11px] truncate"
              >
                {fm.shortName}
              </button>
            ))}
          </div>

          {/* Counts under labels */}
          <div className="grid grid-cols-12 gap-2 sm:gap-3 mt-1 text-center text-[11px] font-bold text-slate-800 font-mono">
            {FISCAL_MONTHS.map((fm) => (
              <span key={fm.fiscalIndex}>{fiscalTotals[fm.fiscalIndex]}</span>
            ))}
          </div>
        </div>
      </div>

      {/* Ward Burden Matrix across 12 Fiscal Months */}
      <div className="bg-white rounded-xl border border-slate-200 shadow-sm overflow-hidden">
        <div className="p-4 bg-slate-50 border-b border-slate-200 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Building2 className="w-4 h-4 text-slate-600" />
            <h4 className="font-bold text-slate-800 text-sm">
              ตารางเปรียบเทียบภาระเชื้อดื้อยาแยกตามหอผู้ป่วย ปีงบประมาณ 2569 (Ward Surveillance Heatmap)
            </h4>
          </div>
          <span className="text-xs text-slate-500">คลิกที่ตัวเลขเพื่อข้ามไปยัง Spot Map เดือนนั้น</span>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-xs text-left border-collapse">
            <thead>
              <tr className="bg-slate-800 text-white divide-x divide-slate-700">
                <th className="p-2.5 font-bold min-w-[150px]">หอผู้ป่วย / หน่วยงาน</th>
                {FISCAL_MONTHS.map((fm) => (
                  <th key={fm.fiscalIndex} className="p-2 text-center min-w-[55px] font-semibold">
                    <span className="block text-[11px]">{fm.shortName}</span>
                  </th>
                ))}
                <th className="p-2 text-center bg-slate-900 font-bold min-w-[65px] text-teal-300">
                  รวมปีงบ
                </th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-200">
              {wards.map((ward) => {
                const wardYearTotal = FISCAL_MONTHS.reduce(
                  (sum, fm) => sum + (wardMonthlyData[ward.id]?.[fm.fiscalIndex] || 0),
                  0
                );

                return (
                  <tr key={ward.id} className="divide-x divide-slate-200 hover:bg-slate-50/70 transition-colors">
                    <td className="p-2 font-medium text-slate-900">
                      <div className="flex items-center gap-1.5">
                        {ward.isCustom && (
                          <span className="text-[9px] bg-emerald-100 text-emerald-800 px-1 py-0.2 rounded font-mono">
                            +ช่องเพิ่ม
                          </span>
                        )}
                        <span className="truncate max-w-[150px]">{ward.name}</span>
                      </div>
                    </td>

                    {FISCAL_MONTHS.map((fm) => {
                      const count = wardMonthlyData[ward.id]?.[fm.fiscalIndex] || 0;
                      let cellStyle = 'text-slate-400 font-normal';
                      if (count >= 10) cellStyle = 'bg-rose-100 text-rose-800 font-extrabold';
                      else if (count >= 5) cellStyle = 'bg-amber-100 text-amber-900 font-bold';
                      else if (count > 0) cellStyle = 'bg-teal-50 text-teal-900 font-semibold';

                      return (
                        <td
                          key={fm.fiscalIndex}
                          onClick={() => onSelectFiscalMonth(fm.fiscalIndex)}
                          className={`p-2 text-center cursor-pointer hover:ring-2 hover:ring-teal-500 transition-all ${cellStyle}`}
                          title={`เปิด Spot Map เดือน ${fm.name} สำหรับ ${ward.name} (${count} ราย)`}
                        >
                          {count > 0 ? count : '-'}
                        </td>
                      );
                    })}

                    <td className="p-2 text-center font-bold bg-slate-50 text-slate-900 font-mono">
                      {wardYearTotal}
                    </td>
                  </tr>
                );
              })}
            </tbody>
            <tfoot>
              <tr className="bg-slate-900 text-white font-bold divide-x divide-slate-800">
                <td className="p-2.5 text-teal-300">รวมทุกหน่วยงาน</td>
                {FISCAL_MONTHS.map((fm) => (
                  <td key={fm.fiscalIndex} className="p-2 text-center text-teal-300 font-mono">
                    {fiscalTotals[fm.fiscalIndex]}
                  </td>
                ))}
                <td className="p-2 text-center bg-slate-950 text-teal-400 text-sm font-mono">
                  {grandTotal}
                </td>
              </tr>
            </tfoot>
          </table>
        </div>
      </div>

      {/* Pathogens 12 Fiscal Months Surveillance Table */}
      <div className="bg-white rounded-xl border border-slate-200 shadow-sm p-4 sm:p-5">
        <h4 className="font-bold text-slate-800 text-sm mb-3 flex items-center gap-2">
          <ShieldAlert className="w-4 h-4 text-rose-500" />
          การกระจายของเชื้อดื้อยาแต่ละชนิด ตลอดปีงบประมาณ 2569 (Pathogen Surveillance Matrix)
        </h4>

        <div className="overflow-x-auto">
          <table className="w-full text-xs text-left border-collapse">
            <thead>
              <tr className="bg-slate-100 border-b border-slate-300 divide-x divide-slate-200 text-slate-700 font-semibold">
                <th className="p-2 min-w-[170px]">ชนิดเชื้อ (Pathogen)</th>
                {FISCAL_MONTHS.map((fm) => (
                  <th key={fm.fiscalIndex} className="p-2 text-center min-w-[50px]">
                    {fm.shortName}
                  </th>
                ))}
                <th className="p-2 text-center bg-slate-200 font-bold min-w-[60px] text-slate-900">
                  รวม
                </th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-200">
              {topOrganisms.map((orgName) => {
                const config = organismConfigs[orgName];
                const orgYearTotal = FISCAL_MONTHS.reduce(
                  (sum, fm) => sum + (pathogenMonthlyData[orgName]?.[fm.fiscalIndex] || 0),
                  0
                );

                return (
                  <tr key={orgName} className="divide-x divide-slate-200 hover:bg-slate-50 transition-colors">
                    <td className="p-2 font-medium text-slate-900">
                      <div className="flex items-center gap-1.5">
                        <span
                          className="w-2.5 h-2.5 rounded-full shrink-0"
                          style={{ backgroundColor: config?.color.dot || '#64748b' }}
                        />
                        <span className="italic">{orgName}</span>
                      </div>
                    </td>

                    {FISCAL_MONTHS.map((fm) => {
                      const count = pathogenMonthlyData[orgName]?.[fm.fiscalIndex] || 0;
                      return (
                        <td
                          key={fm.fiscalIndex}
                          onClick={() => onSelectFiscalMonth(fm.fiscalIndex)}
                          className="p-2 text-center font-mono cursor-pointer hover:bg-teal-50"
                        >
                          {count > 0 ? (
                            <span className="font-semibold text-slate-800">{count}</span>
                          ) : (
                            <span className="text-slate-300">-</span>
                          )}
                        </td>
                      );
                    })}

                    <td className="p-2 text-center font-bold font-mono bg-slate-50 text-slate-900">
                      {orgYearTotal}
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};
