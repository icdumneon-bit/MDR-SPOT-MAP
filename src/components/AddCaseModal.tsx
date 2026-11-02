import React, { useState } from 'react';
import { WardInfo, MDRCase, OrganismConfig } from '../types/mdr';
import { X, PlusSquare, Building2, Calendar, ShieldAlert, Sparkles, User } from 'lucide-react';
import { FISCAL_MONTHS } from '../data/fullYearData';

interface AddCaseModalProps {
  isOpen: boolean;
  onClose: () => void;
  onAddCase: (newCase: Omit<MDRCase, 'id'>) => void;
  wards: WardInfo[];
  organismConfigs: Record<string, OrganismConfig>;
  initialFiscalIndex?: number;
  initialDay?: number;
  initialWardId?: string;
}

const COMMON_RESISTANCES = [
  'A. baumannii (CRAB_MDR)',
  'A. baumannii (CRAB_MDR_CoRO)',
  'A. baumannii (CoRO)',
  'E. coli (MDR)',
  'E. coli (CRE_MDR)',
  'K. pneumoniae (CRE_MDR)',
  'K. pneumoniae (MDR)',
  'P. aeruginosa (CRPA_MDR)',
  'P. aeruginosa (MDR)',
  'S. aureus (MRSA)',
  'S. epidermidis (MRSE)',
  'CoNS อื่นๆ (MRSE)',
  'Achromobacter spp. (MDR)',
  'Enterobacter spp. (MDR)',
  'อื่นๆ (MDR)',
];

const SPECIMENS = ['เสมหะ', 'ปัสสาวะ', 'เลือด', 'หนอง/แผล/เนื้อเยื่อ', 'อื่นๆ'];

export const AddCaseModal: React.FC<AddCaseModalProps> = ({
  isOpen,
  onClose,
  onAddCase,
  wards,
  organismConfigs,
  initialFiscalIndex = 1, // 1 = ต.ค. 68
  initialDay = 1,
  initialWardId = 'med_male',
}) => {
  const [fiscalIndex, setFiscalIndex] = useState<number>(initialFiscalIndex);
  const [day, setDay] = useState<number>(initialDay);
  const [wardId, setWardId] = useState<string>(initialWardId);
  const [organism, setOrganism] = useState<string>('Escherichia coli');
  const [customOrganism, setCustomOrganism] = useState<string>('');
  const [resistanceGroup, setResistanceGroup] = useState<string>('E. coli (MDR)');
  const [customResistance, setCustomResistance] = useState<string>('');
  const [specimen, setSpecimen] = useState<string>('ปัสสาวะ');
  const [count, setCount] = useState<number>(1);
  const [hn, setHn] = useState<string>('');
  const [note, setNote] = useState<string>('');

  const selectedFiscalMonth =
    FISCAL_MONTHS.find((m) => m.fiscalIndex === fiscalIndex) || FISCAL_MONTHS[0];

  React.useEffect(() => {
    if (initialFiscalIndex) setFiscalIndex(initialFiscalIndex);
    if (initialDay) setDay(initialDay);
    if (initialWardId) setWardId(initialWardId);
  }, [initialFiscalIndex, initialDay, initialWardId]);

  if (!isOpen) return null;

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const finalOrganism = organism === 'custom' ? customOrganism.trim() : organism;
    const finalResistance = resistanceGroup === 'custom' ? customResistance.trim() : resistanceGroup;

    if (!finalOrganism) return;

    onAddCase({
      month: selectedFiscalMonth.monthNumber,
      year: selectedFiscalMonth.year,
      day: Number(day),
      wardId,
      organism: finalOrganism,
      resistanceGroup: finalResistance || `${finalOrganism} (MDR)`,
      specimen,
      count: Number(count) || 1,
      hn: hn.trim() || undefined,
      note: note.trim() || undefined,
    });

    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-xs overflow-y-auto">
      <div className="bg-white rounded-2xl shadow-xl border border-slate-200 max-w-lg w-full overflow-hidden my-8 animate-in fade-in zoom-in-95 duration-150">
        {/* Modal Header */}
        <div className="bg-gradient-to-r from-teal-700 to-slate-800 text-white p-4 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <PlusSquare className="w-5 h-5 text-teal-300" />
            <div>
              <h3 className="font-bold text-base">เพิ่มกล่อง Spot Map เชื้อดื้อยา</h3>
              <p className="text-xs text-teal-200">
                ปีงบประมาณ 2569 — บันทึกข้อมูลลงในช่องตาราง Spot Map ประจำหอผู้ป่วย
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="text-slate-300 hover:text-white p-1 rounded-lg hover:bg-white/10 transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Modal Form */}
        <form onSubmit={handleSubmit} className="p-5 space-y-4 text-xs">
          {/* Month, Day & Ward Row */}
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
            <div>
              <label className="block font-semibold text-slate-700 mb-1 flex items-center gap-1">
                <Calendar className="w-3.5 h-3.5 text-teal-600" />
                เดือน (ปีงบ 69)
              </label>
              <select
                value={fiscalIndex}
                onChange={(e) => setFiscalIndex(Number(e.target.value))}
                className="w-full p-2.5 rounded-lg border border-slate-300 focus:outline-none focus:ring-2 focus:ring-teal-500 font-semibold text-slate-800 bg-white"
              >
                {FISCAL_MONTHS.map((fm) => (
                  <option key={fm.fiscalIndex} value={fm.fiscalIndex}>
                    {fm.name} ({fm.daysCount} วัน)
                  </option>
                ))}
              </select>
            </div>

            <div>
              <label className="block font-semibold text-slate-700 mb-1 flex items-center gap-1">
                <Calendar className="w-3.5 h-3.5 text-teal-600" />
                วันที่ (1 - {selectedFiscalMonth.daysCount} {selectedFiscalMonth.shortName})
              </label>
              <input
                type="number"
                min={1}
                max={selectedFiscalMonth.daysCount}
                value={day}
                onChange={(e) =>
                  setDay(Math.min(selectedFiscalMonth.daysCount, Math.max(1, Number(e.target.value))))
                }
                required
                className="w-full p-2.5 rounded-lg border border-slate-300 focus:outline-none focus:ring-2 focus:ring-teal-500 font-bold text-slate-800"
              />
            </div>

            <div>
              <label className="block font-semibold text-slate-700 mb-1 flex items-center gap-1">
                <Building2 className="w-3.5 h-3.5 text-teal-600" />
                หอผู้ป่วย / หน่วยงาน
              </label>
              <select
                value={wardId}
                onChange={(e) => setWardId(e.target.value)}
                className="w-full p-2.5 rounded-lg border border-slate-300 focus:outline-none focus:ring-2 focus:ring-teal-500 text-slate-800 bg-white"
              >
                {wards.map((w) => (
                  <option key={w.id} value={w.id}>
                    {w.isCustom ? `⭐ ${w.name}` : w.name}
                  </option>
                ))}
              </select>
            </div>
          </div>

          {/* Organism Select */}
          <div>
            <label className="block font-semibold text-slate-700 mb-1 flex items-center gap-1">
              <ShieldAlert className="w-3.5 h-3.5 text-rose-500" />
              ชื่อเชื้อจุลชีพ (Organism)
            </label>
            <select
              value={organism}
              onChange={(e) => {
                setOrganism(e.target.value);
                if (e.target.value === 'Acinetobacter baumannii') {
                  setResistanceGroup('A. baumannii (CRAB_MDR)');
                } else if (e.target.value === 'Escherichia coli') {
                  setResistanceGroup('E. coli (MDR)');
                } else if (e.target.value === 'Staphylococcus aureus') {
                  setResistanceGroup('S. aureus (MRSA)');
                }
              }}
              className="w-full p-2.5 rounded-lg border border-slate-300 focus:outline-none focus:ring-2 focus:ring-teal-500 text-slate-800 bg-white italic font-medium"
            >
              {Object.keys(organismConfigs).map((name) => (
                <option key={name} value={name}>
                  {name} ({organismConfigs[name].shortName})
                </option>
              ))}
              <option value="custom">+ ระบุเชื้ออื่นๆ ด้วยตนเอง...</option>
            </select>

            {organism === 'custom' && (
              <input
                type="text"
                placeholder="พิมพ์ชื่อเชื้อ เช่น Enterococcus faecium (VRE)"
                value={customOrganism}
                onChange={(e) => setCustomOrganism(e.target.value)}
                required
                className="mt-2 w-full p-2.5 rounded-lg border border-slate-300 focus:outline-none focus:ring-2 focus:ring-teal-500 text-slate-800"
              />
            )}
          </div>

          {/* Resistance Phenotype */}
          <div>
            <label className="block font-semibold text-slate-700 mb-1">
              กลุ่มเชื้อ / กลไกดื้อยา (Resistance Phenotype)
            </label>
            <select
              value={resistanceGroup}
              onChange={(e) => setResistanceGroup(e.target.value)}
              className="w-full p-2.5 rounded-lg border border-slate-300 focus:outline-none focus:ring-2 focus:ring-teal-500 text-slate-800 bg-white"
            >
              {COMMON_RESISTANCES.map((res) => (
                <option key={res} value={res}>
                  {res}
                </option>
              ))}
              <option value="custom">+ กำหนดกลุ่มดื้อยาเอง...</option>
            </select>

            {resistanceGroup === 'custom' && (
              <input
                type="text"
                placeholder="ระบุข้อความ เช่น E. coli (CRE / NDM-1)"
                value={customResistance}
                onChange={(e) => setCustomResistance(e.target.value)}
                required
                className="mt-2 w-full p-2.5 rounded-lg border border-slate-300 focus:outline-none focus:ring-2 focus:ring-teal-500 text-slate-800"
              />
            )}
          </div>

          {/* Specimen and Count */}
          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block font-semibold text-slate-700 mb-1 flex items-center gap-1">
                <Sparkles className="w-3.5 h-3.5 text-teal-600" />
                สิ่งส่งตรวจ (Specimen)
              </label>
              <select
                value={specimen}
                onChange={(e) => setSpecimen(e.target.value)}
                className="w-full p-2.5 rounded-lg border border-slate-300 focus:outline-none focus:ring-2 focus:ring-teal-500 text-slate-800 bg-white"
              >
                {SPECIMENS.map((sp) => (
                  <option key={sp} value={sp}>
                    {sp}
                  </option>
                ))}
              </select>
            </div>

            <div>
              <label className="block font-semibold text-slate-700 mb-1">
                จำนวนราย (หากตรวจพบซ้ำ ×N)
              </label>
              <input
                type="number"
                min={1}
                max={10}
                value={count}
                onChange={(e) => setCount(Math.max(1, Number(e.target.value)))}
                className="w-full p-2.5 rounded-lg border border-slate-300 focus:outline-none focus:ring-2 focus:ring-teal-500 font-bold text-slate-800"
              />
            </div>
          </div>

          {/* HN and Notes */}
          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block font-semibold text-slate-700 mb-1 flex items-center gap-1">
                <User className="w-3.5 h-3.5 text-slate-500" />
                เลขประจำตัวผู้ป่วย (HN - ทางเลือก)
              </label>
              <input
                type="text"
                placeholder="เช่น 6601234"
                value={hn}
                onChange={(e) => setHn(e.target.value)}
                className="w-full p-2.5 rounded-lg border border-slate-300 focus:outline-none focus:ring-2 focus:ring-teal-500 text-slate-800 font-mono"
              />
            </div>

            <div>
              <label className="block font-semibold text-slate-700 mb-1">
                บันทึกเพิ่มเติม (Notes)
              </label>
              <input
                type="text"
                placeholder="เช่น แผลกดทับ, ใส่สาย CVC"
                value={note}
                onChange={(e) => setNote(e.target.value)}
                className="w-full p-2.5 rounded-lg border border-slate-300 focus:outline-none focus:ring-2 focus:ring-teal-500 text-slate-800"
              />
            </div>
          </div>

          {/* Modal Actions */}
          <div className="pt-3 border-t border-slate-200 flex items-center justify-end gap-2">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 rounded-lg text-slate-600 hover:bg-slate-100 font-medium transition-colors"
            >
              ยกเลิก
            </button>
            <button
              type="submit"
              className="px-5 py-2 rounded-lg bg-teal-600 hover:bg-teal-700 text-white font-semibold shadow-xs flex items-center gap-1.5 transition-colors"
            >
              <PlusSquare className="w-4 h-4" />
              บันทึกกล่อง Spot Map
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};
