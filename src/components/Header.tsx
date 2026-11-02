import React from 'react';
import {
  Activity,
  Plus,
  Settings,
  Download,
  Printer,
  RotateCcw,
  Search,
  ShieldAlert,
  Building2,
  Calendar,
  Sparkles,
  FileSpreadsheet,
  Share2,
  Users,
} from 'lucide-react';
import { WardInfo, MDRCase } from '../types/mdr';

interface HeaderProps {
  totalCases: number;
  wardCount: number;
  cases: MDRCase[];
  wards: WardInfo[];
  monthName: string;
  daysCount: number;
  currentYear: number;
  searchTerm: string;
  onSearchChange: (val: string) => void;
  onOpenAddModal: () => void;
  onOpenWardSettings: () => void;
  onOpenShareModal: () => void;
  onResetData: () => void;
  onExportCSV: () => void;
  onExportAllMonthsCSV: () => void;
  onPrint: () => void;
  lastSyncTime?: number | null;
  isSyncing?: boolean;
}

export const Header: React.FC<HeaderProps> = ({
  totalCases,
  wardCount,
  cases,
  wards,
  monthName,
  daysCount,
  currentYear,
  searchTerm,
  onSearchChange,
  onOpenAddModal,
  onOpenWardSettings,
  onOpenShareModal,
  onResetData,
  onExportCSV,
  onExportAllMonthsCSV,
  onPrint,
  lastSyncTime,
  isSyncing,
}) => {
  // Count specific critical pathogens
  const criticalCount = cases.filter(
    (c) =>
      c.resistanceGroup.includes('CRAB') ||
      c.resistanceGroup.includes('CRE') ||
      c.resistanceGroup.includes('CRPA') ||
      c.resistanceGroup.includes('MRSA')
  ).reduce((sum, c) => sum + (c.count || 1), 0);

  const activeWardCount = new Set(cases.map((c) => c.wardId)).size;

  return (
    <header className="bg-white border-b border-slate-200 sticky top-0 z-40 shadow-xs">
      {/* Top Bar */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-3.5">
        <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-4">
          {/* Logo & Hospital Title */}
          <div className="flex items-start gap-3">
            <div className="w-11 h-11 rounded-xl bg-gradient-to-tr from-teal-700 to-emerald-500 text-white flex items-center justify-center shadow-md shadow-teal-700/20 shrink-0">
              <Activity className="w-6 h-6" />
            </div>

            <div>
              <div className="flex flex-wrap items-center gap-2">
                <h1 className="text-lg sm:text-xl font-black text-slate-900 tracking-tight">
                  Spot Map เชื้อดื้อยา รายวัน แยกตามหอผู้ป่วย
                </h1>
                <span className="text-xs font-bold px-2.5 py-0.5 rounded-full bg-teal-50 text-teal-800 border border-teal-200 flex items-center gap-1">
                  <Calendar className="w-3 h-3 text-teal-600" />
                  {monthName} {currentYear} ({daysCount} วัน)
                </span>
                <span className="text-xs font-semibold px-2 py-0.5 rounded-full bg-emerald-50 text-emerald-800 border border-emerald-200">
                  17 ตึก + 5 หน่วยงานเพิ่มเติม
                </span>
                <button
                  onClick={onOpenShareModal}
                  className="text-xs font-bold px-2.5 py-0.5 rounded-full bg-emerald-100 hover:bg-emerald-200 text-emerald-900 border border-emerald-300 flex items-center gap-1.5 transition-colors cursor-pointer"
                  title="คลิกเพื่อดูรายละเอียดและคัดลอกลิงก์แชร์สิทธิ์แก้ไข"
                >
                  <span className="w-2 h-2 rounded-full bg-emerald-600 animate-pulse" />
                  <span>สิทธิ์: ทุกคนแก้ไขได้ (Editor)</span>
                </button>
              </div>
              <p className="text-xs text-slate-500 mt-0.5">
                ระบบเฝ้าระวังทางระบาดวิทยา การติดเชื้อในโรงพยาบาล ครอบคลุม 12 เดือน (Infection Prevention and Control - IPC)
              </p>
            </div>
          </div>

          {/* Action Buttons */}
          <div className="flex flex-wrap items-center gap-2">
            {/* Prominent Share Button */}
            <button
              onClick={onOpenShareModal}
              className="px-3.5 py-2 rounded-lg bg-gradient-to-r from-emerald-600 to-teal-600 hover:from-emerald-700 hover:to-teal-700 text-white font-bold text-xs flex items-center gap-1.5 shadow-sm hover:shadow transition-all ring-1 ring-emerald-500"
              title="แชร์ลิงก์ให้แพทย์ พยาบาล และทีมงานทุกคนมีสิทธิ์แก้ไขเพิ่มเติมได้"
            >
              <Share2 className="w-4 h-4" />
              <span>แชร์ลิงก์แก้ไขร่วมกัน</span>
            </button>

            <button
              onClick={onOpenAddModal}
              className="px-3.5 py-2 rounded-lg bg-teal-600 hover:bg-teal-700 text-white font-semibold text-xs flex items-center gap-1.5 shadow-sm transition-all hover:shadow"
            >
              <Plus className="w-4 h-4" />
              <span>เพิ่มเคสเชื้อดื้อยา</span>
            </button>

            <button
              onClick={onOpenWardSettings}
              className="px-3 py-2 rounded-lg bg-slate-100 hover:bg-slate-200 text-slate-700 font-medium text-xs flex items-center gap-1.5 border border-slate-300 transition-colors"
              title="ตั้งค่าและเปลี่ยนชื่อหน่วยงานเพิ่มเติมทั้ง 5 ช่อง"
            >
              <Settings className="w-3.5 h-3.5 text-slate-500" />
              <span>จัดการหน่วยงาน (+5 ช่อง)</span>
            </button>

            <div className="relative group">
              <button
                onClick={onExportCSV}
                className="px-3 py-2 rounded-lg bg-slate-100 hover:bg-slate-200 text-slate-700 font-medium text-xs flex items-center gap-1.5 border border-slate-300 transition-colors"
                title="ดาวน์โหลดข้อมูล Spot Map เป็นไฟล์ CSV / Excel"
              >
                <FileSpreadsheet className="w-3.5 h-3.5 text-emerald-600" />
                <span>ส่งออก CSV (เดือนนี้)</span>
              </button>
            </div>

            <button
              onClick={onExportAllMonthsCSV}
              className="px-3 py-2 rounded-lg bg-emerald-50 hover:bg-emerald-100 text-emerald-800 font-medium text-xs flex items-center gap-1.5 border border-emerald-300 transition-colors"
              title="ส่งออกรายงานทั้งปี 12 เดือน เป็นไฟล์ CSV"
            >
              <FileSpreadsheet className="w-3.5 h-3.5 text-emerald-700" />
              <span>ส่งออก 12 เดือน</span>
            </button>


            <button
              onClick={onPrint}
              className="px-3 py-2 rounded-lg bg-slate-100 hover:bg-slate-200 text-slate-700 font-medium text-xs flex items-center gap-1.5 border border-slate-300 transition-colors"
              title="พิมพ์ตารางและรายงานข้อเสนอแนะ"
            >
              <Printer className="w-3.5 h-3.5 text-slate-600" />
              <span>พิมพ์รายงาน</span>
            </button>

            <button
              onClick={onResetData}
              className="p-2 rounded-lg text-slate-400 hover:text-slate-600 hover:bg-slate-100 transition-colors"
              title="รีเซ็ตข้อมูลทั้งหมดกลับเป็นค่าเริ่มต้นตามไฟล์"
            >
              <RotateCcw className="w-4 h-4" />
            </button>
          </div>
        </div>

        {/* Quick KPI Stats Strip */}
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 mt-3 pt-3 border-t border-slate-100 text-xs">
          <div className="bg-slate-50 p-2.5 rounded-lg border border-slate-200 flex items-center gap-2.5">
            <div className="w-8 h-8 rounded-lg bg-rose-100 text-rose-700 flex items-center justify-center font-bold text-xs shrink-0">
              <ShieldAlert className="w-4 h-4" />
            </div>
            <div>
              <div className="text-[10px] text-slate-500 uppercase font-semibold">ผู้ป่วยเชื้อดื้อยาทั้งหมด</div>
              <div className="text-base font-extrabold text-slate-900 leading-tight">
                {totalCases} <span className="text-xs font-normal text-slate-500">ราย</span>
              </div>
            </div>
          </div>

          <div className="bg-slate-50 p-2.5 rounded-lg border border-slate-200 flex items-center gap-2.5">
            <div className="w-8 h-8 rounded-lg bg-rose-100 text-rose-700 flex items-center justify-center font-bold text-xs shrink-0">
              <Activity className="w-4 h-4" />
            </div>
            <div>
              <div className="text-[10px] text-slate-500 uppercase font-semibold">กลุ่มวิกฤต (CRAB/CRE/MRSA)</div>
              <div className="text-base font-extrabold text-rose-700 leading-tight">
                {criticalCount} <span className="text-xs font-normal text-slate-500">ราย</span>
              </div>
            </div>
          </div>

          <div className="bg-slate-50 p-2.5 rounded-lg border border-slate-200 flex items-center gap-2.5">
            <div className="w-8 h-8 rounded-lg bg-amber-100 text-amber-700 flex items-center justify-center font-bold text-xs shrink-0">
              <Building2 className="w-4 h-4" />
            </div>
            <div>
              <div className="text-[10px] text-slate-500 uppercase font-semibold">หอผู้ป่วยที่มีรายงาน</div>
              <div className="text-base font-extrabold text-slate-900 leading-tight">
                {activeWardCount} <span className="text-xs font-normal text-slate-500">/ {wardCount} หน่วยงาน</span>
              </div>
            </div>
          </div>

          {/* Search Input Box */}
          <div className="relative flex items-center">
            <Search className="w-4 h-4 absolute left-3 text-slate-400" />
            <input
              type="text"
              placeholder="ค้นหา HN, เชื้อ, หอผู้ป่วย, สิ่งส่งตรวจ..."
              value={searchTerm}
              onChange={(e) => onSearchChange(e.target.value)}
              className="w-full pl-9 pr-3 py-2 bg-slate-50 hover:bg-slate-100/80 focus:bg-white text-xs rounded-lg border border-slate-200 focus:outline-none focus:ring-2 focus:ring-teal-500 text-slate-800 transition-colors"
            />
          </div>
        </div>
      </div>
    </header>
  );
};
