import React, { useState } from 'react';
import { WardInfo } from '../types/mdr';
import { X, Building2, Check, RotateCcw, Plus, Sparkles } from 'lucide-react';

interface WardSettingsModalProps {
  isOpen: boolean;
  onClose: () => void;
  wards: WardInfo[];
  onUpdateWards: (updatedWards: WardInfo[]) => void;
  onResetWards: () => void;
}

export const WardSettingsModal: React.FC<WardSettingsModalProps> = ({
  isOpen,
  onClose,
  wards,
  onUpdateWards,
  onResetWards,
}) => {
  const [localWards, setLocalWards] = useState<WardInfo[]>([...wards]);

  React.useEffect(() => {
    setLocalWards([...wards]);
  }, [wards]);

  if (!isOpen) return null;

  const handleNameChange = (id: string, newName: string) => {
    setLocalWards((prev) =>
      prev.map((w) => (w.id === id ? { ...w, name: newName } : w))
    );
  };

  const handleBuildingChange = (id: string, newBuilding: string) => {
    setLocalWards((prev) =>
      prev.map((w) => (w.id === id ? { ...w, building: newBuilding } : w))
    );
  };

  const handleSave = () => {
    onUpdateWards(localWards);
    onClose();
  };

  const customWards = localWards.filter((w) => w.isCustom);
  const originalWards = localWards.filter((w) => !w.isCustom);

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-xs overflow-y-auto">
      <div className="bg-white rounded-2xl shadow-xl border border-slate-200 max-w-2xl w-full overflow-hidden my-8 animate-in fade-in zoom-in-95 duration-150">
        {/* Header */}
        <div className="bg-gradient-to-r from-emerald-800 to-teal-900 text-white p-4 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Building2 className="w-5 h-5 text-emerald-300" />
            <div>
              <h3 className="font-bold text-base">จัดการหน่วยงาน / หอผู้ป่วย (+5 ช่องเพิ่มเติม)</h3>
              <p className="text-xs text-emerald-200">
                ปรับเปลี่ยนชื่อหน่วยงานเพิ่มเติม 5 ช่อง หรือปรับปรุงชื่อตึกให้ตรงกับบริบทโรงพยาบาลของคุณ
              </p>
            </div>
          </div>
          <button onClick={onClose} className="text-slate-300 hover:text-white p-1">
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Body */}
        <div className="p-5 max-h-[60vh] overflow-y-auto space-y-6 text-xs">
          {/* Highlight Section: The 5 Additional Departments */}
          <div className="bg-emerald-50/70 p-4 rounded-xl border border-emerald-200 space-y-3">
            <div className="flex items-center justify-between">
              <h4 className="font-bold text-sm text-emerald-950 flex items-center gap-1.5">
                <Sparkles className="w-4 h-4 text-emerald-600" />
                หน่วยงานเพิ่มเติม 5 ช่อง (Custom Departments):
              </h4>
              <span className="text-[11px] font-semibold text-emerald-800 bg-emerald-100 px-2 py-0.5 rounded-full border border-emerald-300">
                5 ช่องกำหนดเอง
              </span>
            </div>
            <p className="text-slate-600 text-[11px]">
              คุณสามารถแก้ไขชื่อหน่วยงานทั้ง 5 ช่องนี้ได้ตามจริง (เช่น NICU, ICU ศัลยกรรม, หอผู้ป่วยเคมีบำบัด, หอสงฆ์ ฯลฯ)
            </p>

            <div className="space-y-2 mt-2">
              {customWards.map((w, idx) => (
                <div
                  key={w.id}
                  className="bg-white p-2.5 rounded-lg border border-emerald-200 grid grid-cols-1 sm:grid-cols-2 gap-2 items-center shadow-2xs"
                >
                  <div>
                    <label className="text-[10px] font-bold text-emerald-900 uppercase">
                      ช่องที่ {idx + 1} - ชื่อหน่วยงาน
                    </label>
                    <input
                      type="text"
                      value={w.name}
                      onChange={(e) => handleNameChange(w.id, e.target.value)}
                      placeholder={`หน่วยงาน ${idx + 1}`}
                      className="w-full mt-1 p-2 rounded-md border border-slate-300 focus:outline-none focus:ring-2 focus:ring-emerald-500 font-semibold text-slate-900"
                    />
                  </div>
                  <div>
                    <label className="text-[10px] font-bold text-slate-600 uppercase">
                      อาคาร / ชั้น
                    </label>
                    <input
                      type="text"
                      value={w.building || ''}
                      onChange={(e) => handleBuildingChange(w.id, e.target.value)}
                      placeholder="เช่น ตึกกุมารเวช ชั้น 3"
                      className="w-full mt-1 p-2 rounded-md border border-slate-300 focus:outline-none focus:ring-2 focus:ring-emerald-500 text-slate-700"
                    />
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Original 17 Wards */}
          <div>
            <h4 className="font-bold text-sm text-slate-800 mb-2">
              หอผู้ป่วยเดิม 17 ตึก (จากรายงาน ต.ค.68):
            </h4>
            <div className="space-y-1.5">
              {originalWards.map((w) => (
                <div
                  key={w.id}
                  className="bg-slate-50 p-2 rounded-lg border border-slate-200 flex items-center justify-between gap-3 text-slate-800"
                >
                  <div className="flex-1">
                    <input
                      type="text"
                      value={w.name}
                      onChange={(e) => handleNameChange(w.id, e.target.value)}
                      className="w-full p-1.5 rounded border border-slate-300 focus:outline-none focus:ring-1 focus:ring-teal-500 font-medium bg-white"
                    />
                  </div>
                  <div className="text-slate-500 text-[11px] shrink-0 font-mono">
                    {w.building || ''} {w.floor || ''}
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* Footer */}
        <div className="p-4 bg-slate-50 border-t border-slate-200 flex items-center justify-between">
          <button
            type="button"
            onClick={() => {
              if (window.confirm('รีเซ็ตชื่อหน่วยงานกลับเป็นค่าเริ่มต้น?')) {
                onResetWards();
                onClose();
              }
            }}
            className="text-slate-500 hover:text-slate-800 text-xs flex items-center gap-1 hover:underline"
          >
            <RotateCcw className="w-3.5 h-3.5" />
            คืนค่าเริ่มต้น
          </button>

          <div className="flex items-center gap-2">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 rounded-lg text-slate-600 hover:bg-slate-200 font-medium text-xs"
            >
              ยกเลิก
            </button>
            <button
              type="button"
              onClick={handleSave}
              className="px-5 py-2 rounded-lg bg-teal-600 hover:bg-teal-700 text-white font-semibold text-xs flex items-center gap-1.5 shadow-xs"
            >
              <Check className="w-4 h-4" />
              บันทึกการตั้งค่า
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};
