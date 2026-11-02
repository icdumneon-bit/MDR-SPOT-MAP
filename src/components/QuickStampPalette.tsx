import React, { useState } from 'react';
import { PathogenItem, SpecimenItem, CopiedCaseTemplate, OrganismConfig } from '../types/mdr';
import { SPECIMEN_ICONS } from './ColorLegend';
import {
  Copy,
  Sparkles,
  Plus,
  Check,
  X,
  ShieldAlert,
  Pipette,
  Edit2,
  Trash2,
  ClipboardPaste,
  ChevronDown,
  ChevronUp,
} from 'lucide-react';

export const INITIAL_PATHOGENS: PathogenItem[] = [
  { id: 'path-1', organism: 'Acinetobacter baumannii', resistanceGroup: 'A. baumannii (CRAB_MDR)' },
  { id: 'path-2', organism: 'Acinetobacter baumannii', resistanceGroup: 'A. baumannii (CRAB_MDR_CoRO)' },
  { id: 'path-3', organism: 'Acinetobacter baumannii', resistanceGroup: 'A. baumannii (CoRO)' },
  { id: 'path-4', organism: 'Escherichia coli', resistanceGroup: 'E. coli (MDR)' },
  { id: 'path-5', organism: 'Escherichia coli', resistanceGroup: 'E. coli (CRE_MDR)' },
  { id: 'path-6', organism: 'Staphylococcus aureus', resistanceGroup: 'S. aureus (MRSA)' },
  { id: 'path-7', organism: 'Klebsiella pneumoniae', resistanceGroup: 'K. pneumoniae (CRE_MDR)' },
  { id: 'path-8', organism: 'Klebsiella pneumoniae', resistanceGroup: 'K. pneumoniae (MDR)' },
  { id: 'path-9', organism: 'Pseudomonas aeruginosa', resistanceGroup: 'P. aeruginosa (CRPA_MDR)' },
  { id: 'path-10', organism: 'Pseudomonas aeruginosa', resistanceGroup: 'P. aeruginosa (MDR)' },
  { id: 'path-11', organism: 'Achromobacter xylosoxidans', resistanceGroup: 'Achromobacter spp. (MDR)' },
  { id: 'path-12', organism: 'Klebsiella aerogenes', resistanceGroup: 'Enterobacter spp. (MDR)' },
  { id: 'path-13', organism: 'Pseudomonas stutzeri', resistanceGroup: 'อื่นๆ (MDR)' },
  { id: 'path-14', organism: 'Staphylococcus capitis', resistanceGroup: 'CoNS อื่นๆ (MRSE)' },
  { id: 'path-15', organism: 'Staphylococcus epidermidis', resistanceGroup: 'S. epidermidis (MRSE)' },
  { id: 'path-16', organism: 'Staphylococcus haemolyticus', resistanceGroup: 'CoNS อื่นๆ (MRSE)' },
];

export const INITIAL_SPECIMENS: SpecimenItem[] = [
  { id: 'spec-1', name: 'เสมหะ', icon: '🫁', color: 'bg-amber-100 text-amber-900 border-amber-300' },
  { id: 'spec-2', name: 'ปัสสาวะ', icon: '💧', color: 'bg-sky-100 text-sky-900 border-sky-300' },
  { id: 'spec-3', name: 'เลือด', icon: '🩸', color: 'bg-red-100 text-red-900 border-red-300' },
  { id: 'spec-4', name: 'หนอง/แผล/เนื้อเยื่อ', icon: '🩹', color: 'bg-orange-100 text-orange-900 border-orange-300' },
  { id: 'spec-5', name: 'อื่นๆ', icon: '🔬', color: 'bg-slate-100 text-slate-800 border-slate-300' },
  { id: 'spec-6', name: 'น้ำล้างปอด (BAL)', icon: '🫁', color: 'bg-teal-100 text-teal-900 border-teal-300' },
  { id: 'spec-7', name: 'น้ำไขสันหลัง (CSF)', icon: '🧪', color: 'bg-purple-100 text-purple-900 border-purple-300' },
  { id: 'spec-8', name: 'ป้ายช่องคอ/จมูก (NPS)', icon: '👃', color: 'bg-indigo-100 text-indigo-900 border-indigo-300' },
];

interface QuickStampPaletteProps {
  organismConfigs: Record<string, OrganismConfig>;
  activeCopiedTemplate: CopiedCaseTemplate | null;
  onCopyTemplate: (template: CopiedCaseTemplate) => void;
  onClearCopiedTemplate: () => void;
}

export const QuickStampPalette: React.FC<QuickStampPaletteProps> = ({
  organismConfigs,
  activeCopiedTemplate,
  onCopyTemplate,
  onClearCopiedTemplate,
}) => {
  const [isOpen, setIsOpen] = useState<boolean>(true);

  // Pathogens state (editable and expandable)
  const [pathogens, setPathogens] = useState<PathogenItem[]>(() => {
    const saved = localStorage.getItem('mdr_custom_pathogens_list');
    if (saved) {
      try {
        return JSON.parse(saved);
      } catch (e) {
        console.error(e);
      }
    }
    return INITIAL_PATHOGENS;
  });

  // Specimens state (editable and expandable)
  const [specimens, setSpecimens] = useState<SpecimenItem[]>(() => {
    const saved = localStorage.getItem('mdr_custom_specimens_list');
    if (saved) {
      try {
        return JSON.parse(saved);
      } catch (e) {
        console.error(e);
      }
    }
    return INITIAL_SPECIMENS;
  });

  // Selected Pathogen & Selected Specimen
  const [selectedPathogen, setSelectedPathogen] = useState<PathogenItem>(INITIAL_PATHOGENS[0]);
  const [selectedSpecimen, setSelectedSpecimen] = useState<SpecimenItem>(INITIAL_SPECIMENS[0]);

  // Modals for adding/editing pathogen and specimen
  const [isAddingPathogen, setIsAddingPathogen] = useState(false);
  const [newOrgName, setNewOrgName] = useState('Escherichia coli');
  const [newResGroup, setNewResGroup] = useState('E. coli (MDR)');

  const [isAddingSpecimen, setIsAddingSpecimen] = useState(false);
  const [newSpecName, setNewSpecName] = useState('');
  const [newSpecIcon, setNewSpecIcon] = useState('🔬');

  // Helper to persist
  const savePathogens = (list: PathogenItem[]) => {
    setPathogens(list);
    localStorage.setItem('mdr_custom_pathogens_list', JSON.stringify(list));
  };

  const saveSpecimens = (list: SpecimenItem[]) => {
    setSpecimens(list);
    localStorage.setItem('mdr_custom_specimens_list', JSON.stringify(list));
  };

  // When either selected pathogen or specimen changes, trigger copy if already in copy mode
  const handleSelectPathogen = (p: PathogenItem) => {
    setSelectedPathogen(p);
    onCopyTemplate({
      organism: p.organism,
      resistanceGroup: p.resistanceGroup,
      specimen: selectedSpecimen.name,
      count: 1,
    });
  };

  const handleSelectSpecimen = (s: SpecimenItem) => {
    setSelectedSpecimen(s);
    onCopyTemplate({
      organism: selectedPathogen.organism,
      resistanceGroup: selectedPathogen.resistanceGroup,
      specimen: s.name,
      count: 1,
    });
  };

  const handleAddPathogenSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newOrgName.trim()) return;
    const item: PathogenItem = {
      id: `p-${Date.now()}`,
      organism: newOrgName.trim(),
      resistanceGroup: newResGroup.trim() || `${newOrgName} (MDR)`,
      isCustom: true,
    };
    const updated = [item, ...pathogens];
    savePathogens(updated);
    setSelectedPathogen(item);
    setIsAddingPathogen(false);
    onCopyTemplate({
      organism: item.organism,
      resistanceGroup: item.resistanceGroup,
      specimen: selectedSpecimen.name,
      count: 1,
    });
  };

  const handleAddSpecimenSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newSpecName.trim()) return;
    const item: SpecimenItem = {
      id: `s-${Date.now()}`,
      name: newSpecName.trim(),
      icon: newSpecIcon || '🔬',
      color: 'bg-teal-50 text-teal-900 border-teal-300',
      isCustom: true,
    };
    const updated = [...specimens, item];
    saveSpecimens(updated);
    setSelectedSpecimen(item);
    setIsAddingSpecimen(false);
    onCopyTemplate({
      organism: selectedPathogen.organism,
      resistanceGroup: selectedPathogen.resistanceGroup,
      specimen: item.name,
      count: 1,
    });
  };

  const handleDeletePathogen = (id: string, e: React.MouseEvent) => {
    e.stopPropagation();
    const updated = pathogens.filter((p) => p.id !== id);
    savePathogens(updated);
    if (selectedPathogen.id === id && updated.length > 0) {
      setSelectedPathogen(updated[0]);
    }
  };

  const handleDeleteSpecimen = (id: string, e: React.MouseEvent) => {
    e.stopPropagation();
    const updated = specimens.filter((s) => s.id !== id);
    saveSpecimens(updated);
    if (selectedSpecimen.id === id && updated.length > 0) {
      setSelectedSpecimen(updated[0]);
    }
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
    <div className="bg-white rounded-xl border border-slate-200 shadow-sm overflow-hidden mb-5">
      {/* Top Bar */}
      <div className="p-3 bg-gradient-to-r from-teal-50 via-slate-50 to-indigo-50 border-b border-slate-200 flex flex-wrap items-center justify-between gap-3">
        <div className="flex items-center gap-2">
          <div className="w-8 h-8 rounded-lg bg-teal-600 text-white flex items-center justify-center shadow-2xs">
            <Copy className="w-4 h-4" />
          </div>
          <div>
            <h3 className="text-xs sm:text-sm font-bold text-slate-900 flex items-center gap-2">
              <span>กล่องเลือกเชื้อ &amp; สิ่งส่งตรวจ (แยกกล่องอิสระเพื่อเติมและแก้ไขได้)</span>
              <span className="text-[10px] font-semibold px-2 py-0.2 rounded-full bg-teal-100 text-teal-800 border border-teal-200">
                คลิกเลือกแล้ววางในตาราง
              </span>
            </h3>
            <p className="text-[11px] text-slate-500">
              แยกกล่อง <strong>"รายชื่อเชื้อ"</strong> และ <strong>"สิ่งส่งตรวจ"</strong> ออกจากกัน สามารถจับคู่ เติมเชื้อใหม่ หรือแก้ไขสิ่งส่งตรวจได้อย่างสะดวก
            </p>
          </div>
        </div>

        <button
          onClick={() => setIsOpen(!isOpen)}
          className="p-1.5 rounded-lg text-slate-500 hover:text-slate-800 hover:bg-slate-100 transition-colors"
          title={isOpen ? 'ซ่อนกล่องเครื่องมือ' : 'แสดงกล่องเครื่องมือ'}
        >
          {isOpen ? <ChevronUp className="w-4 h-4" /> : <ChevronDown className="w-4 h-4" />}
        </button>
      </div>

      {/* Active Selection / Paste Banner */}
      <div className="p-3 bg-slate-900 text-white flex flex-wrap items-center justify-between gap-3">
        <div className="flex flex-wrap items-center gap-2 text-xs">
          <span className="text-teal-300 font-bold flex items-center gap-1">
            <ClipboardPaste className="w-4 h-4 text-teal-400" />
            ชุดที่พร้อมวางในตาราง:
          </span>

          {/* Pathogen pill */}
          <div className="bg-slate-800 px-2.5 py-1 rounded-lg border border-teal-500/50 flex items-center gap-1.5 shadow-2xs">
            <span
              className="w-2.5 h-2.5 rounded-full shrink-0"
              style={{ backgroundColor: getOrganismStyle(selectedPathogen.organism).color.dot }}
            />
            <span className="italic font-bold text-white">{selectedPathogen.organism}</span>
            <span className="text-slate-300 text-[11px]">({selectedPathogen.resistanceGroup})</span>
          </div>

          <span className="text-teal-400 font-bold">+</span>

          {/* Specimen pill */}
          <div className="bg-slate-800 px-2.5 py-1 rounded-lg border border-sky-400/50 flex items-center gap-1.5 shadow-2xs">
            <span>{selectedSpecimen.icon || '🔬'}</span>
            <span className="font-bold text-sky-200">{selectedSpecimen.name}</span>
          </div>

          <span className="text-[11px] text-teal-200 bg-teal-950 px-2 py-0.5 rounded border border-teal-700 ml-1">
            👉 กดปุ่ม <strong>"+ วางที่นี่"</strong> ในช่องวัน/ตึกที่ต้องการได้เลย
          </span>
        </div>

        <div className="flex items-center gap-2">
          {activeCopiedTemplate ? (
            <button
              onClick={onClearCopiedTemplate}
              className="text-xs bg-slate-800 hover:bg-slate-700 text-slate-300 hover:text-white px-3 py-1 rounded-md border border-slate-600 transition-colors"
            >
              ยกเลิกโหมดวาง
            </button>
          ) : (
            <button
              onClick={() =>
                onCopyTemplate({
                  organism: selectedPathogen.organism,
                  resistanceGroup: selectedPathogen.resistanceGroup,
                  specimen: selectedSpecimen.name,
                  count: 1,
                })
              }
              className="text-xs bg-teal-600 hover:bg-teal-500 text-white font-bold px-3 py-1 rounded-md shadow-2xs flex items-center gap-1 transition-colors"
            >
              <Copy className="w-3.5 h-3.5" />
              <span>เปิดโหมดวางในตาราง</span>
            </button>
          )}
        </div>
      </div>

      {/* Two Separate Interactive Boxes (เชื้อ vs สิ่งส่งตรวจ) */}
      {isOpen && (
        <div className="p-4 grid grid-cols-1 lg:grid-cols-12 gap-4 bg-slate-50/70">
          {/* ================= BOX 1: PATHOGENS BOX (กล่องที่ 1: รายชื่อเชื้อและกลุ่มดื้อยา) ================= */}
          <div className="lg:col-span-7 bg-white p-3.5 rounded-xl border border-slate-200 shadow-2xs flex flex-col">
            <div className="flex items-center justify-between pb-2.5 border-b border-slate-100 mb-2.5">
              <div className="flex items-center gap-2">
                <div className="w-6 h-6 rounded-md bg-rose-100 text-rose-700 flex items-center justify-center">
                  <ShieldAlert className="w-3.5 h-3.5" />
                </div>
                <div>
                  <h4 className="text-xs font-bold text-slate-900">
                    กล่องที่ 1: รายชื่อเชื้อและกลุ่มดื้อยา (Pathogens &amp; Resistance)
                  </h4>
                  <span className="text-[10px] text-slate-500">คลิกที่การ์ดเชื้อเพื่อเลือกนำไปใช้</span>
                </div>
              </div>

              <button
                onClick={() => setIsAddingPathogen(!isAddingPathogen)}
                className="text-[11px] font-semibold text-rose-700 bg-rose-50 hover:bg-rose-100 px-2.5 py-1 rounded-md border border-rose-200 flex items-center gap-1 transition-colors"
              >
                <Plus className="w-3 h-3" />
                <span>+ เติมชื่อเชื้อใหม่</span>
              </button>
            </div>

            {/* Add Custom Pathogen Form */}
            {isAddingPathogen && (
              <form
                onSubmit={handleAddPathogenSubmit}
                className="mb-3 p-3 bg-rose-50/50 rounded-lg border border-rose-200 space-y-2 text-xs animate-in fade-in"
              >
                <div className="font-bold text-rose-900 text-[11px]">เติมชื่อเชื้อและกลุ่มดื้อยาใหม่:</div>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                  <div>
                    <label className="text-[10px] text-slate-600 block mb-0.5">ชื่อเชื้อ (Organism)</label>
                    <input
                      type="text"
                      value={newOrgName}
                      onChange={(e) => setNewOrgName(e.target.value)}
                      placeholder="เช่น Enterococcus faecium"
                      required
                      className="w-full p-1.5 rounded border border-slate-300 bg-white italic"
                    />
                  </div>
                  <div>
                    <label className="text-[10px] text-slate-600 block mb-0.5">กลุ่มดื้อยา (Resistance)</label>
                    <input
                      type="text"
                      value={newResGroup}
                      onChange={(e) => setNewResGroup(e.target.value)}
                      placeholder="เช่น E. faecium (VRE)"
                      required
                      className="w-full p-1.5 rounded border border-slate-300 bg-white"
                    />
                  </div>
                </div>
                <div className="flex justify-end gap-1.5 pt-1">
                  <button
                    type="button"
                    onClick={() => setIsAddingPathogen(false)}
                    className="px-2.5 py-1 text-[11px] text-slate-600 hover:bg-white rounded"
                  >
                    ยกเลิก
                  </button>
                  <button
                    type="submit"
                    className="px-3 py-1 text-[11px] bg-rose-600 text-white font-semibold rounded shadow-2xs hover:bg-rose-700"
                  >
                    บันทึกเชื้อ
                  </button>
                </div>
              </form>
            )}

            {/* Pathogens Cards Grid */}
            <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-1.5 max-h-[260px] overflow-y-auto pr-1">
              {pathogens.map((p) => {
                const org = getOrganismStyle(p.organism);
                const isSelected = selectedPathogen.id === p.id;

                return (
                  <button
                    key={p.id}
                    onClick={() => handleSelectPathogen(p)}
                    className={`p-2 rounded-lg border text-left transition-all duration-150 flex flex-col justify-between relative group ${
                      org.color.badgeBg
                    } ${
                      isSelected
                        ? 'ring-2 ring-rose-600 shadow-sm border-rose-400 bg-rose-50/90 font-bold'
                        : 'hover:shadow-2xs hover:border-slate-400'
                    }`}
                  >
                    <div className="flex items-start justify-between gap-1 w-full">
                      <div className="flex items-center gap-1.5 min-w-0">
                        <span
                          className="w-2.5 h-2.5 rounded-full shrink-0 shadow-2xs"
                          style={{ backgroundColor: org.color.dot }}
                        />
                        <span className="text-[11px] italic truncate text-slate-900 leading-tight">
                          {p.organism}
                        </span>
                      </div>
                      {isSelected && (
                        <span className="w-4 h-4 rounded-full bg-rose-600 text-white flex items-center justify-center shrink-0 text-[10px]">
                          ✓
                        </span>
                      )}
                    </div>

                    <div className="mt-1 text-[10px] text-slate-700 truncate bg-white/70 px-1 py-0.5 rounded border border-black/5">
                      {p.resistanceGroup}
                    </div>

                    {/* Delete custom pathogen option */}
                    {p.isCustom && (
                      <span
                        onClick={(e) => handleDeletePathogen(p.id, e)}
                        className="opacity-0 group-hover:opacity-100 text-rose-500 hover:text-rose-800 p-0.5 absolute top-1 right-1"
                        title="ลบเชื้อนี้"
                      >
                        <Trash2 className="w-3 h-3" />
                      </span>
                    )}
                  </button>
                );
              })}
            </div>
          </div>

          {/* ================= BOX 2: SPECIMENS BOX (กล่องที่ 2: รายการสิ่งส่งตรวจ) ================= */}
          <div className="lg:col-span-5 bg-white p-3.5 rounded-xl border border-slate-200 shadow-2xs flex flex-col">
            <div className="flex items-center justify-between pb-2.5 border-b border-slate-100 mb-2.5">
              <div className="flex items-center gap-2">
                <div className="w-6 h-6 rounded-md bg-sky-100 text-sky-700 flex items-center justify-center">
                  <Pipette className="w-3.5 h-3.5" />
                </div>
                <div>
                  <h4 className="text-xs font-bold text-slate-900">
                    กล่องที่ 2: รายการสิ่งส่งตรวจ (Specimens)
                  </h4>
                  <span className="text-[10px] text-slate-500">คลิกที่สิ่งส่งตรวจเพื่อเลือกจับคู่</span>
                </div>
              </div>

              <button
                onClick={() => setIsAddingSpecimen(!isAddingSpecimen)}
                className="text-[11px] font-semibold text-sky-700 bg-sky-50 hover:bg-sky-100 px-2.5 py-1 rounded-md border border-sky-200 flex items-center gap-1 transition-colors"
              >
                <Plus className="w-3 h-3" />
                <span>+ เติมสิ่งส่งตรวจ</span>
              </button>
            </div>

            {/* Add Custom Specimen Form */}
            {isAddingSpecimen && (
              <form
                onSubmit={handleAddSpecimenSubmit}
                className="mb-3 p-3 bg-sky-50/50 rounded-lg border border-sky-200 space-y-2 text-xs animate-in fade-in"
              >
                <div className="font-bold text-sky-900 text-[11px]">เติมสิ่งส่งตรวจใหม่:</div>
                <div className="grid grid-cols-3 gap-2">
                  <div className="col-span-2">
                    <label className="text-[10px] text-slate-600 block mb-0.5">ชื่อสิ่งส่งตรวจ</label>
                    <input
                      type="text"
                      value={newSpecName}
                      onChange={(e) => setNewSpecName(e.target.value)}
                      placeholder="เช่น น้ำในช่องเยื่อหุ้มปอด"
                      required
                      className="w-full p-1.5 rounded border border-slate-300 bg-white"
                    />
                  </div>
                  <div>
                    <label className="text-[10px] text-slate-600 block mb-0.5">ไอคอน</label>
                    <input
                      type="text"
                      value={newSpecIcon}
                      onChange={(e) => setNewSpecIcon(e.target.value)}
                      placeholder="เช่น 🫁"
                      className="w-full p-1.5 rounded border border-slate-300 bg-white text-center"
                    />
                  </div>
                </div>
                <div className="flex justify-end gap-1.5 pt-1">
                  <button
                    type="button"
                    onClick={() => setIsAddingSpecimen(false)}
                    className="px-2.5 py-1 text-[11px] text-slate-600 hover:bg-white rounded"
                  >
                    ยกเลิก
                  </button>
                  <button
                    type="submit"
                    className="px-3 py-1 text-[11px] bg-sky-600 text-white font-semibold rounded shadow-2xs hover:bg-sky-700"
                  >
                    บันทึกสิ่งส่งตรวจ
                  </button>
                </div>
              </form>
            )}

            {/* Specimens Cards Grid */}
            <div className="grid grid-cols-2 gap-2 max-h-[260px] overflow-y-auto pr-1">
              {specimens.map((s) => {
                const isSelected = selectedSpecimen.id === s.id;
                const specColor = s.color || 'bg-slate-100 text-slate-800 border-slate-300';

                return (
                  <button
                    key={s.id}
                    onClick={() => handleSelectSpecimen(s)}
                    className={`p-2.5 rounded-lg border text-left transition-all duration-150 flex items-center justify-between group ${specColor} ${
                      isSelected
                        ? 'ring-2 ring-sky-600 shadow-sm font-bold scale-[1.01] brightness-95'
                        : 'hover:shadow-2xs hover:brightness-95'
                    }`}
                  >
                    <div className="flex items-center gap-2 min-w-0">
                      <span className="text-base shrink-0">{s.icon || '🔬'}</span>
                      <span className="text-xs truncate">{s.name}</span>
                    </div>

                    <div className="flex items-center gap-1 shrink-0">
                      {isSelected ? (
                        <span className="w-4 h-4 rounded-full bg-sky-700 text-white flex items-center justify-center text-[10px]">
                          ✓
                        </span>
                      ) : (
                        s.isCustom && (
                          <span
                            onClick={(e) => handleDeleteSpecimen(s.id, e)}
                            className="opacity-0 group-hover:opacity-100 text-rose-500 hover:text-rose-800 p-0.5"
                            title="ลบสิ่งส่งตรวจนี้"
                          >
                            <Trash2 className="w-3 h-3" />
                          </span>
                        )
                      )}
                    </div>
                  </button>
                );
              })}
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
