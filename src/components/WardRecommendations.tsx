import React, { useState } from 'react';
import { WardInfo, WardRecommendation, MDRCase, OrganismConfig } from '../types/mdr';
import {
  ShieldAlert,
  AlertTriangle,
  CheckCircle2,
  FileText,
  Building2,
  Sparkles,
  ClipboardList,
  Edit3,
  Save,
  Printer,
  ChevronDown,
  ChevronUp,
} from 'lucide-react';

interface WardRecommendationsProps {
  wards: WardInfo[];
  cases: MDRCase[];
  recommendations: Record<string, WardRecommendation>;
  organismConfigs: Record<string, OrganismConfig>;
  onUpdateWardNotes: (wardId: string, notes: string) => void;
  selectedWardId?: string | null;
  onClearSelectedWard?: () => void;
}

export const WardRecommendations: React.FC<WardRecommendationsProps> = ({
  wards,
  cases,
  recommendations,
  organismConfigs,
  onUpdateWardNotes,
  selectedWardId,
  onClearSelectedWard,
}) => {
  const [filterType, setFilterType] = useState<'all' | 'alert' | 'hasCases' | 'custom'>('all');
  const [editingWardId, setEditingWardId] = useState<string | null>(null);
  const [tempNotes, setTempNotes] = useState<string>('');
  const [expandedWardId, setExpandedWardId] = useState<string | null>(selectedWardId || null);

  // Sync if selectedWardId changes from parent table click
  React.useEffect(() => {
    if (selectedWardId) {
      setExpandedWardId(selectedWardId);
      // scroll to ward element if found
      const el = document.getElementById(`ward-rec-${selectedWardId}`);
      if (el) {
        el.scrollIntoView({ behavior: 'smooth', block: 'center' });
      }
    }
  }, [selectedWardId]);

  // Calculate dynamic stats per ward from cases
  const wardCaseAnalysis = React.useMemo(() => {
    const analysis: Record<
      string,
      {
        total: number;
        organisms: Record<string, number>;
        specimens: Record<string, number>;
      }
    > = {};

    wards.forEach((w) => {
      analysis[w.id] = { total: 0, organisms: {}, specimens: {} };
    });

    cases.forEach((c) => {
      if (!analysis[c.wardId]) {
        analysis[c.wardId] = { total: 0, organisms: {}, specimens: {} };
      }
      const count = c.count || 1;
      analysis[c.wardId].total += count;
      analysis[c.wardId].organisms[c.organism] =
        (analysis[c.wardId].organisms[c.organism] || 0) + count;
      analysis[c.wardId].specimens[c.specimen] =
        (analysis[c.wardId].specimens[c.specimen] || 0) + count;
    });

    return analysis;
  }, [wards, cases]);

  const handleStartEdit = (wardId: string, currentNote?: string) => {
    setEditingWardId(wardId);
    setTempNotes(currentNote || '');
  };

  const handleSaveEdit = (wardId: string) => {
    onUpdateWardNotes(wardId, tempNotes);
    setEditingWardId(null);
  };

  // Sort wards: higher case count first
  const sortedWards = React.useMemo(() => {
    return [...wards].sort((a, b) => {
      const countA = wardCaseAnalysis[a.id]?.total || 0;
      const countB = wardCaseAnalysis[b.id]?.total || 0;
      return countB - countA;
    });
  }, [wards, wardCaseAnalysis]);

  const filteredWards = sortedWards.filter((w) => {
    const count = wardCaseAnalysis[w.id]?.total || 0;
    if (filterType === 'alert') return count >= 5;
    if (filterType === 'hasCases') return count > 0;
    if (filterType === 'custom') return w.isCustom;
    return true;
  });

  const getRiskBadge = (count: number) => {
    if (count >= 10) {
      return {
        label: 'วิกฤตสูงมาก (Critical Alert)',
        bg: 'bg-rose-100 text-rose-800 border-rose-300',
        dot: 'bg-rose-600',
        icon: ShieldAlert,
      };
    }
    if (count >= 5) {
      return {
        label: 'ความเสี่ยงสูง (High Risk)',
        bg: 'bg-amber-100 text-amber-800 border-amber-300',
        dot: 'bg-amber-500',
        icon: AlertTriangle,
      };
    }
    if (count > 0) {
      return {
        label: 'เฝ้าระวังปกติ (Moderate)',
        bg: 'bg-teal-100 text-teal-800 border-teal-300',
        dot: 'bg-teal-600',
        icon: CheckCircle2,
      };
    }
    return {
      label: 'ไม่พบเชื้อดื้อยา (No Case)',
      bg: 'bg-slate-100 text-slate-600 border-slate-200',
      dot: 'bg-slate-400',
      icon: CheckCircle2,
    };
  };

  return (
    <div className="bg-white rounded-xl border border-slate-200 shadow-sm p-4 sm:p-6 mb-8">
      {/* Header */}
      <div className="flex flex-wrap items-center justify-between gap-4 pb-4 border-b border-slate-200">
        <div>
          <div className="flex items-center gap-2">
            <div className="w-8 h-8 rounded-lg bg-teal-50 border border-teal-200 flex items-center justify-center text-teal-700">
              <ClipboardList className="w-4 h-4" />
            </div>
            <h2 className="text-lg font-bold text-slate-800">
              สรุปสถานการณ์และข้อเสนอแนะการควบคุมการติดเชื้อ (IC Recommendations)
            </h2>
          </div>
          <p className="text-xs text-slate-500 mt-1">
            มาตรการจำเพาะรายหอผู้ป่วยตามแนวทาง IPC สำหรับเชื้อดื้อยาปฏิชีวนะ (MDR, CRE, CRAB, MRSA, CRPA)
          </p>
        </div>

        {/* Filter Pills */}
        <div className="flex flex-wrap items-center gap-1.5 bg-slate-100 p-1 rounded-lg border border-slate-200 text-xs">
          <button
            onClick={() => setFilterType('all')}
            className={`px-3 py-1.5 rounded-md font-medium transition-all ${
              filterType === 'all'
                ? 'bg-white text-slate-800 shadow-2xs font-semibold'
                : 'text-slate-600 hover:text-slate-900'
            }`}
          >
            ทั้งหมด ({wards.length})
          </button>
          <button
            onClick={() => setFilterType('alert')}
            className={`px-3 py-1.5 rounded-md font-medium transition-all ${
              filterType === 'alert'
                ? 'bg-white text-rose-700 shadow-2xs font-semibold'
                : 'text-slate-600 hover:text-slate-900'
            }`}
          >
            เฉพาะหอเสี่ยงสูง (≥5 ราย)
          </button>
          <button
            onClick={() => setFilterType('hasCases')}
            className={`px-3 py-1.5 rounded-md font-medium transition-all ${
              filterType === 'hasCases'
                ? 'bg-white text-slate-800 shadow-2xs font-semibold'
                : 'text-slate-600 hover:text-slate-900'
            }`}
          >
            พบเชื้อในเดือนนี้ ({wards.filter((w) => (wardCaseAnalysis[w.id]?.total || 0) > 0).length})
          </button>
          <button
            onClick={() => setFilterType('custom')}
            className={`px-3 py-1.5 rounded-md font-medium transition-all ${
              filterType === 'custom'
                ? 'bg-white text-teal-700 shadow-2xs font-semibold'
                : 'text-slate-600 hover:text-slate-900'
            }`}
          >
            หน่วยงานเพิ่มเติม (+5 ช่อง)
          </button>
        </div>
      </div>

      {/* Selected Ward Alert Banner if opened from Spot Map click */}
      {selectedWardId && (
        <div className="mt-4 p-3 bg-teal-50 border border-teal-200 rounded-lg flex items-center justify-between text-xs text-teal-800">
          <div className="flex items-center gap-2">
            <Sparkles className="w-4 h-4 text-teal-600" />
            <span>
              กำลังเจาะลึกข้อเสนอแนะของ <strong>{wards.find((w) => w.id === selectedWardId)?.name}</strong>
            </span>
          </div>
          {onClearSelectedWard && (
            <button
              onClick={onClearSelectedWard}
              className="font-medium text-teal-700 underline hover:text-teal-900"
            >
              แสดงมุมมองปกติ
            </button>
          )}
        </div>
      )}

      {/* Wards Recommendation List */}
      <div className="mt-5 space-y-4">
        {filteredWards.map((ward) => {
          const analysis = wardCaseAnalysis[ward.id] || { total: 0, organisms: {}, specimens: {} };
          const recData = recommendations[ward.id] || recommendations.default;
          const risk = getRiskBadge(analysis.total);
          const isExpanded = expandedWardId === ward.id || selectedWardId === ward.id || analysis.total >= 5;
          const isEditing = editingWardId === ward.id;

          const topOrgs = Object.entries(analysis.organisms).sort((a, b) => b[1] - a[1]);
          const topSpecs = Object.entries(analysis.specimens).sort((a, b) => b[1] - a[1]);

          return (
            <div
              key={ward.id}
              id={`ward-rec-${ward.id}`}
              className={`rounded-xl border transition-all ${
                analysis.total >= 10
                  ? 'border-rose-300 bg-rose-50/20'
                  : analysis.total >= 5
                  ? 'border-amber-300 bg-amber-50/20'
                  : 'border-slate-200 bg-white'
              } overflow-hidden shadow-2xs hover:shadow-sm`}
            >
              {/* Ward Card Top Summary Bar */}
              <div
                onClick={() => setExpandedWardId(isExpanded ? null : ward.id)}
                className="p-4 cursor-pointer flex flex-wrap items-center justify-between gap-3 hover:bg-slate-50/80 transition-colors"
              >
                <div className="flex items-center gap-3">
                  <div
                    className={`w-10 h-10 rounded-xl flex items-center justify-center font-bold text-sm shrink-0 border ${
                      analysis.total >= 10
                        ? 'bg-rose-600 text-white border-rose-700'
                        : analysis.total >= 5
                        ? 'bg-amber-500 text-white border-amber-600'
                        : analysis.total > 0
                        ? 'bg-teal-600 text-white border-teal-700'
                        : 'bg-slate-100 text-slate-500 border-slate-300'
                    }`}
                  >
                    {analysis.total}
                  </div>

                  <div>
                    <div className="flex items-center gap-2">
                      <h3 className="font-bold text-slate-900 text-base flex items-center gap-1.5">
                        <Building2 className="w-4 h-4 text-slate-500" />
                        {ward.name}
                      </h3>
                      {ward.isCustom && (
                        <span className="text-[10px] font-medium bg-emerald-100 text-emerald-800 px-2 py-0.5 rounded-full border border-emerald-300">
                          หน่วยงานเพิ่มเติม
                        </span>
                      )}
                    </div>
                    <div className="text-xs text-slate-500 mt-0.5">
                      {ward.building ? `${ward.building} ` : ''}
                      {ward.floor ? `· ${ward.floor}` : ''}
                      {analysis.total > 0
                        ? ` · พบเชื้อดื้อยาทั้งหมด ${analysis.total} รายในเดือนนี้`
                        : ' · ไม่มีรายงานเชื้อดื้อยาในเดือนนี้'}
                    </div>
                  </div>
                </div>

                <div className="flex items-center gap-3">
                  <span
                    className={`text-xs px-2.5 py-1 rounded-full font-medium border flex items-center gap-1.5 ${risk.bg}`}
                  >
                    <span className={`w-2 h-2 rounded-full ${risk.dot}`} />
                    {risk.label}
                  </span>
                  <button className="text-slate-400 hover:text-slate-700 p-1">
                    {isExpanded ? <ChevronUp className="w-5 h-5" /> : <ChevronDown className="w-5 h-5" />}
                  </button>
                </div>
              </div>

              {/* Collapsible Details & Actionable Recommendations */}
              {isExpanded && (
                <div className="px-4 pb-5 pt-2 border-t border-slate-100 bg-white/70">
                  {/* Mini Overview Row: Top Pathogens & Specimens */}
                  {analysis.total > 0 && (
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-3 mb-4 mt-2">
                      {/* Top Organisms in this ward */}
                      <div className="bg-slate-50 p-3 rounded-lg border border-slate-200">
                        <div className="text-xs font-semibold text-slate-700 mb-2 flex items-center gap-1">
                          <ShieldAlert className="w-3.5 h-3.5 text-rose-500" />
                          เชื้อที่ตรวจพบในหอผู้ป่วยนี้:
                        </div>
                        <div className="flex flex-wrap gap-1.5">
                          {topOrgs.map(([orgName, count]) => {
                            const config = organismConfigs[orgName];
                            return (
                              <span
                                key={orgName}
                                className={`text-[11px] px-2 py-1 rounded-md border font-medium flex items-center gap-1.5 ${
                                  config?.color.badgeBg || 'bg-slate-100 text-slate-700'
                                }`}
                              >
                                <span
                                  className="w-2 h-2 rounded-full"
                                  style={{ backgroundColor: config?.color.dot || '#666' }}
                                />
                                <span className="italic">{orgName}</span>
                                <span className="font-bold">({count} ราย)</span>
                              </span>
                            );
                          })}
                        </div>
                      </div>

                      {/* Top Specimens in this ward */}
                      <div className="bg-slate-50 p-3 rounded-lg border border-slate-200">
                        <div className="text-xs font-semibold text-slate-700 mb-2 flex items-center gap-1">
                          <Sparkles className="w-3.5 h-3.5 text-teal-600" />
                          สิ่งส่งตรวจที่พบ:
                        </div>
                        <div className="flex flex-wrap gap-1.5">
                          {topSpecs.map(([spec, count]) => (
                            <span
                              key={spec}
                              className="text-[11px] px-2 py-1 rounded-md border bg-white border-slate-200 text-slate-800 font-medium"
                            >
                              {spec}: <strong className="text-slate-900">{count} ราย</strong>
                            </span>
                          ))}
                        </div>
                      </div>
                    </div>
                  )}

                  {/* Recommendations Points */}
                  <div className="space-y-2 mt-3">
                    <div className="text-xs font-bold text-slate-800 flex items-center justify-between">
                      <span className="flex items-center gap-1.5">
                        <FileText className="w-4 h-4 text-teal-600" />
                        มาตรการและข้อเสนอแนะในการควบคุมการติดเชื้อ (IC Action Items):
                      </span>
                      {recData.icBundles && recData.icBundles.length > 0 && (
                        <div className="flex flex-wrap gap-1">
                          {recData.icBundles.map((b) => (
                            <span
                              key={b}
                              className="text-[10px] bg-slate-100 text-slate-700 px-2 py-0.5 rounded border border-slate-200 font-mono font-medium"
                            >
                              {b}
                            </span>
                          ))}
                        </div>
                      )}
                    </div>

                    <ul className="space-y-1.5 text-xs text-slate-700 bg-slate-50 p-3.5 rounded-lg border border-slate-200">
                      {(recData.recommendations || []).map((rec, idx) => (
                        <li key={idx} className="flex items-start gap-2">
                          <span className="w-4 h-4 rounded-full bg-teal-100 text-teal-800 flex items-center justify-center text-[10px] font-bold shrink-0 mt-0.5">
                            {idx + 1}
                          </span>
                          <span className="leading-relaxed">{rec}</span>
                        </li>
                      ))}
                    </ul>
                  </div>

                  {/* Ward Custom ICP/Doctor Notes Section */}
                  <div className="mt-3 pt-3 border-t border-slate-100">
                    <div className="flex items-center justify-between text-xs mb-1.5">
                      <span className="font-semibold text-slate-700 flex items-center gap-1">
                        <Edit3 className="w-3.5 h-3.5 text-slate-500" />
                        บันทึกเพิ่มเติมจากทีม ICN / คณะกรรมการ IC:
                      </span>
                      {!isEditing && (
                        <button
                          onClick={() => handleStartEdit(ward.id, recData.customNotes)}
                          className="text-teal-700 hover:text-teal-800 font-medium hover:underline text-[11px]"
                        >
                          {recData.customNotes ? 'แก้ไขบันทึก' : '+ เพิ่มบันทึกเฉพาะตึก'}
                        </button>
                      )}
                    </div>

                    {isEditing ? (
                      <div className="space-y-2">
                        <textarea
                          value={tempNotes}
                          onChange={(e) => setTempNotes(e.target.value)}
                          placeholder="พิมพ์ข้อสั่งการ, นัดหมายตรวจติดตาม, หรือบันทึกเฉพาะของหอผู้ป่วยนี้..."
                          className="w-full text-xs p-2.5 rounded-lg border border-slate-300 focus:outline-none focus:ring-2 focus:ring-teal-500 min-h-[70px]"
                        />
                        <div className="flex justify-end gap-2">
                          <button
                            onClick={() => setEditingWardId(null)}
                            className="px-3 py-1 rounded-md text-xs text-slate-600 hover:bg-slate-100"
                          >
                            ยกเลิก
                          </button>
                          <button
                            onClick={() => handleSaveEdit(ward.id)}
                            className="px-3 py-1 rounded-md text-xs bg-teal-600 hover:bg-teal-700 text-white font-medium flex items-center gap-1"
                          >
                            <Save className="w-3.5 h-3.5" />
                            บันทึก
                          </button>
                        </div>
                      </div>
                    ) : (
                      recData.customNotes && (
                        <div className="p-2.5 rounded-lg bg-teal-50/60 border border-teal-200 text-xs text-teal-900 leading-relaxed">
                          {recData.customNotes}
                        </div>
                      )
                    )}
                  </div>
                </div>
              )}
            </div>
          );
        })}
      </div>
    </div>
  );
};
