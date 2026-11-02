import React, { useState } from 'react';
import { MDRCase, WardInfo, OrganismConfig } from '../types/mdr';
import { SPECIMEN_ICONS } from './ColorLegend';
import { X, Trash2, Edit3, Save, Calendar, Building2, ShieldAlert, Sparkles, User, FileText } from 'lucide-react';
import { THAI_MONTHS } from '../data/fullYearData';

interface CaseDetailsModalProps {
  isOpen: boolean;
  onClose: () => void;
  caseItem: MDRCase | null;
  ward: WardInfo | undefined;
  organismConfig: OrganismConfig | undefined;
  onUpdateCase: (updatedCase: MDRCase) => void;
  onDeleteCase: (caseId: string) => void;
}

export const CaseDetailsModal: React.FC<CaseDetailsModalProps> = ({
  isOpen,
  onClose,
  caseItem,
  ward,
  organismConfig,
  onUpdateCase,
  onDeleteCase,
}) => {
  const [isEditing, setIsEditing] = useState(false);
  const [editForm, setEditForm] = useState<MDRCase | null>(null);

  React.useEffect(() => {
    if (caseItem) {
      setEditForm({ ...caseItem });
      setIsEditing(false);
    }
  }, [caseItem]);

  if (!isOpen || !caseItem || !editForm) return null;

  const handleSave = (e: React.FormEvent) => {
    e.preventDefault();
    onUpdateCase(editForm);
    setIsEditing(false);
  };

  const handleDelete = () => {
    if (window.confirm(`ยืนยันการลบเคส ${caseItem.organism} (${caseItem.resistanceGroup}) วันที่ ${caseItem.day}?`)) {
      onDeleteCase(caseItem.id);
      onClose();
    }
  };

  const spec = SPECIMEN_ICONS[caseItem.specimen] || {
    icon: '🔬',
    label: caseItem.specimen,
    color: 'bg-slate-100 text-slate-800 border-slate-300',
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-xs">
      <div className="bg-white rounded-2xl shadow-xl border border-slate-200 max-w-md w-full overflow-hidden animate-in fade-in zoom-in-95 duration-150">
        {/* Header */}
        <div className="bg-slate-800 text-white p-4 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <span
              className="w-3.5 h-3.5 rounded-full"
              style={{ backgroundColor: organismConfig?.color.dot || '#14b8a6' }}
            />
            <h3 className="font-bold text-sm">รายละเอียดเคสเชื้อดื้อยา</h3>
          </div>
          <button onClick={onClose} className="text-slate-300 hover:text-white p-1">
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Content */}
        {!isEditing ? (
          <div className="p-5 space-y-4 text-xs">
            {/* Organism Banner */}
            <div className={`p-3.5 rounded-xl border ${organismConfig?.color.badgeBg || 'bg-slate-50'}`}>
              <div className="flex items-start justify-between">
                <div>
                  <h4 className="font-bold text-sm italic text-slate-900">{caseItem.organism}</h4>
                  <p className="text-xs font-semibold text-slate-700 mt-0.5">{caseItem.resistanceGroup}</p>
                </div>
                {caseItem.count > 1 && (
                  <span className="bg-rose-600 text-white text-[11px] font-black px-2 py-0.5 rounded-full">
                    ×{caseItem.count} ราย
                  </span>
                )}
              </div>
            </div>

            {/* Grid Information */}
            <div className="grid grid-cols-2 gap-3 bg-slate-50 p-3 rounded-xl border border-slate-200">
              <div className="space-y-1">
                <span className="text-slate-500 text-[10px] uppercase font-semibold flex items-center gap-1">
                  <Calendar className="w-3 h-3 text-teal-600" />
                  วันที่ตรวจพบ
                </span>
                <p className="font-bold text-slate-800 text-sm">
                  {caseItem.day}{' '}
                  {THAI_MONTHS.find((m) => m.number === (caseItem.month || 10))?.name || 'ตุลาคม'}{' '}
                  {caseItem.year || 2568}
                </p>
              </div>

              <div className="space-y-1">
                <span className="text-slate-500 text-[10px] uppercase font-semibold flex items-center gap-1">
                  <Building2 className="w-3 h-3 text-teal-600" />
                  หอผู้ป่วย / ตึก
                </span>
                <p className="font-bold text-slate-800 text-sm truncate">{ward?.name || caseItem.wardId}</p>
              </div>

              <div className="space-y-1">
                <span className="text-slate-500 text-[10px] uppercase font-semibold flex items-center gap-1">
                  <Sparkles className="w-3 h-3 text-teal-600" />
                  สิ่งส่งตรวจ
                </span>
                <span
                  className={`inline-flex items-center gap-1 px-2 py-0.5 rounded font-medium border text-xs ${spec.color}`}
                >
                  <span>{spec.icon}</span>
                  <span>{caseItem.specimen}</span>
                </span>
              </div>

              <div className="space-y-1">
                <span className="text-slate-500 text-[10px] uppercase font-semibold flex items-center gap-1">
                  <User className="w-3 h-3 text-slate-500" />
                  เลขประจำตัวผู้ป่วย
                </span>
                <p className="font-mono text-slate-800">{caseItem.hn || 'ไม่ระบุ'}</p>
              </div>
            </div>

            {/* Note / Description if available */}
            {caseItem.note && (
              <div className="p-3 rounded-lg bg-amber-50/70 border border-amber-200 text-slate-700">
                <span className="font-semibold block text-[10px] uppercase text-amber-900 mb-0.5">
                  บันทึกอาการ / ประวัติผู้ป่วย:
                </span>
                {caseItem.note}
              </div>
            )}

            {/* Organism Description */}
            {organismConfig?.description && (
              <div className="p-3 rounded-lg bg-slate-50 border border-slate-200 text-slate-600 text-[11px] leading-relaxed">
                <span className="font-semibold text-slate-800 block mb-0.5">ลักษณะทางคลินิก:</span>
                {organismConfig.description}
              </div>
            )}

            {/* Action Buttons */}
            <div className="pt-2 flex items-center justify-between border-t border-slate-200">
              <button
                type="button"
                onClick={handleDelete}
                className="text-rose-600 hover:text-rose-700 font-medium px-3 py-1.5 rounded-lg hover:bg-rose-50 flex items-center gap-1 transition-colors"
              >
                <Trash2 className="w-3.5 h-3.5" />
                ลบเคสนี้
              </button>

              <button
                type="button"
                onClick={() => setIsEditing(true)}
                className="bg-teal-600 hover:bg-teal-700 text-white font-medium px-4 py-1.5 rounded-lg flex items-center gap-1.5 transition-colors"
              >
                <Edit3 className="w-3.5 h-3.5" />
                แก้ไขข้อมูล
              </button>
            </div>
          </div>
        ) : (
          <form onSubmit={handleSave} className="p-5 space-y-3 text-xs">
            <div>
              <label className="block font-semibold text-slate-700 mb-1">กลุ่มเชื้อดื้อยา</label>
              <input
                type="text"
                value={editForm.resistanceGroup}
                onChange={(e) => setEditForm({ ...editForm, resistanceGroup: e.target.value })}
                required
                className="w-full p-2 rounded-lg border border-slate-300 focus:outline-none focus:ring-2 focus:ring-teal-500 text-slate-800"
              />
            </div>

            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className="block font-semibold text-slate-700 mb-1">สิ่งส่งตรวจ</label>
                <select
                  value={editForm.specimen}
                  onChange={(e) => setEditForm({ ...editForm, specimen: e.target.value })}
                  className="w-full p-2 rounded-lg border border-slate-300 focus:outline-none focus:ring-2 focus:ring-teal-500 text-slate-800 bg-white"
                >
                  {['เสมหะ', 'ปัสสาวะ', 'เลือด', 'หนอง/แผล/เนื้อเยื่อ', 'อื่นๆ'].map((s) => (
                    <option key={s} value={s}>
                      {s}
                    </option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block font-semibold text-slate-700 mb-1">จำนวนราย (×N)</label>
                <input
                  type="number"
                  min={1}
                  max={10}
                  value={editForm.count}
                  onChange={(e) => setEditForm({ ...editForm, count: Number(e.target.value) || 1 })}
                  className="w-full p-2 rounded-lg border border-slate-300 focus:outline-none focus:ring-2 focus:ring-teal-500 font-bold text-slate-800"
                />
              </div>
            </div>

            <div>
              <label className="block font-semibold text-slate-700 mb-1">HN</label>
              <input
                type="text"
                value={editForm.hn || ''}
                onChange={(e) => setEditForm({ ...editForm, hn: e.target.value })}
                placeholder="HN ผู้ป่วย"
                className="w-full p-2 rounded-lg border border-slate-300 focus:outline-none focus:ring-2 focus:ring-teal-500 font-mono text-slate-800"
              />
            </div>

            <div>
              <label className="block font-semibold text-slate-700 mb-1">บันทึกเพิ่มเติม</label>
              <input
                type="text"
                value={editForm.note || ''}
                onChange={(e) => setEditForm({ ...editForm, note: e.target.value })}
                placeholder="รายละเอียดเพิ่มเติม"
                className="w-full p-2 rounded-lg border border-slate-300 focus:outline-none focus:ring-2 focus:ring-teal-500 text-slate-800"
              />
            </div>

            <div className="pt-3 border-t border-slate-200 flex items-center justify-end gap-2">
              <button
                type="button"
                onClick={() => setIsEditing(false)}
                className="px-3 py-1.5 rounded-lg text-slate-600 hover:bg-slate-100 font-medium"
              >
                ยกเลิก
              </button>
              <button
                type="submit"
                className="px-4 py-1.5 rounded-lg bg-teal-600 hover:bg-teal-700 text-white font-medium flex items-center gap-1.5"
              >
                <Save className="w-3.5 h-3.5" />
                บันทึกการแก้ไข
              </button>
            </div>
          </form>
        )}
      </div>
    </div>
  );
};
