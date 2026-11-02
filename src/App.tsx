import React, { useState, useEffect, useMemo } from 'react';
import {
  INITIAL_WARDS,
  ORGANISM_CONFIGS,
  INITIAL_RECOMMENDATIONS,
} from './data/initialData';
import { FISCAL_MONTHS, getInitial12MonthsCases } from './data/fullYearData';
import { WardInfo, MDRCase, OrganismConfig, WardRecommendation, FiscalMonthInfo, CopiedCaseTemplate } from './types/mdr';
import { Header } from './components/Header';
import { MonthSelector } from './components/MonthSelector';
import { QuickStampPalette } from './components/QuickStampPalette';
import { ColorLegend } from './components/ColorLegend';
import { SpotMapTable } from './components/SpotMapTable';
import { WardRecommendations } from './components/WardRecommendations';
import { AnnualOverview } from './components/AnnualOverview';
import { AddCaseModal } from './components/AddCaseModal';
import { CaseDetailsModal } from './components/CaseDetailsModal';
import { WardSettingsModal } from './components/WardSettingsModal';
import { WardSelectorBar } from './components/WardSelectorBar';
import { WardSpotMapTable } from './components/WardSpotMapTable';
import { ShareModal } from './components/ShareModal';

export default function App() {
  // Current Fiscal Index: 1 to 12 (1 = ต.ค. 68 where user's 50 cases are, 12 = ก.ย. 69)
  const [currentFiscalIndex, setCurrentFiscalIndex] = useState<number>(1);
  const [viewMode, setViewMode] = useState<'month' | 'annual'>('month');

  // Persistence state
  const [wards, setWards] = useState<WardInfo[]>(() => {
    const saved = localStorage.getItem('mdr_spot_map_wards_fy26');
    if (saved) {
      try {
        return JSON.parse(saved);
      } catch (e) {
        console.error('Failed to parse saved wards', e);
      }
    }
    return INITIAL_WARDS;
  });

  const [cases, setCases] = useState<MDRCase[]>(() => {
    const saved = localStorage.getItem('mdr_spot_map_cases_fy26');
    if (saved) {
      try {
        const parsed = JSON.parse(saved);
        if (Array.isArray(parsed) && parsed.length > 0) {
          return parsed;
        }
      } catch (e) {
        console.error('Failed to parse saved cases', e);
      }
    }
    return getInitial12MonthsCases();
  });

  const [recommendations, setRecommendations] = useState<Record<string, WardRecommendation>>(() => {
    const saved = localStorage.getItem('mdr_spot_map_recommendations_fy26');
    if (saved) {
      try {
        return JSON.parse(saved);
      } catch (e) {
        console.error('Failed to parse saved recommendations', e);
      }
    }
    return INITIAL_RECOMMENDATIONS;
  });

  // Save to localStorage on change
  useEffect(() => {
    localStorage.setItem('mdr_spot_map_wards_fy26', JSON.stringify(wards));
  }, [wards]);

  useEffect(() => {
    localStorage.setItem('mdr_spot_map_cases_fy26', JSON.stringify(cases));
  }, [cases]);

  useEffect(() => {
    localStorage.setItem('mdr_spot_map_recommendations_fy26', JSON.stringify(recommendations));
  }, [recommendations]);

  // Selected Fiscal Month Info (from 1 = ต.ค. 68 to 12 = ก.ย. 69)
  const activeFiscalMonth: FiscalMonthInfo = useMemo(() => {
    return (
      FISCAL_MONTHS.find((fm) => fm.fiscalIndex === currentFiscalIndex) || FISCAL_MONTHS[0]
    );
  }, [currentFiscalIndex]);

  // Dynamic Days Array for the active fiscal month (28, 30, or 31 days)
  const daysArray = useMemo(() => {
    return Array.from({ length: activeFiscalMonth.daysCount }, (_, i) => i + 1);
  }, [activeFiscalMonth]);

  // Filters & Search
  const [selectedOrganisms, setSelectedOrganisms] = useState<string[]>([]);
  const [selectedSpecimens, setSelectedSpecimens] = useState<string[]>([]);
  const [searchTerm, setSearchTerm] = useState<string>('');

  // Quick Copy-Paste Template state
  const [activeCopiedTemplate, setActiveCopiedTemplate] = useState<CopiedCaseTemplate | null>(null);

  // Modals state
  const [isAddModalOpen, setIsAddModalOpen] = useState(false);
  const [addModalInitialDay, setAddModalInitialDay] = useState<number>(1);
  const [addModalInitialWardId, setAddModalInitialWardId] = useState<string>(wards[0]?.id || 'med_male');

  const [isCaseDetailsOpen, setIsCaseDetailsOpen] = useState(false);
  const [selectedCase, setSelectedCase] = useState<MDRCase | null>(null);

  const [isWardSettingsOpen, setIsWardSettingsOpen] = useState(false);
  const [selectedWardForRec, setSelectedWardForRec] = useState<string | null>(null);

  // Ward Selection / Spot Map View state: 'all' = 22-ward matrix, or specific ward ID = single ward focus
  const [selectedWardViewId, setSelectedWardViewId] = useState<string | 'all'>('all');
  const [visibleWardIds, setVisibleWardIds] = useState<string[]>(() => wards.map((w) => w.id));

  // Sync visibleWardIds if wards array updates
  useEffect(() => {
    setVisibleWardIds((prev) => {
      const existingIds = new Set(wards.map((w) => w.id));
      const kept = prev.filter((id) => existingIds.has(id));
      if (kept.length === 0) return wards.map((w) => w.id);
      const added = wards.filter((w) => !prev.includes(w.id)).map((w) => w.id);
      return [...kept, ...added];
    });
  }, [wards]);

  const handleToggleVisibleWard = (wardId: string) => {
    setVisibleWardIds((prev) => {
      if (prev.includes(wardId)) {
        if (prev.length <= 1) return prev;
        return prev.filter((id) => id !== wardId);
      } else {
        return [...prev, wardId];
      }
    });
  };

  // Collaborative Share Modal & Live Sync state
  const [isShareModalOpen, setIsShareModalOpen] = useState(false);
  const [lastSyncTime, setLastSyncTime] = useState<number | null>(null);
  const [isSyncing, setIsSyncing] = useState(false);
  const lastServerUpdatedRef = React.useRef<number>(0);

  // Fetch shared database from server (ensures all colleagues with the link see and edit live data)
  const fetchSharedData = async (isManual = false) => {
    try {
      if (isManual) setIsSyncing(true);
      const res = await fetch('/api/shared-data');
      if (res.ok) {
        const data = await res.json();
        if (data && Array.isArray(data.cases)) {
          if (data.cases.length === 0) {
            // Server was empty on first launch, bootstrap server database
            const initRes = await fetch('/api/initialize', {
              method: 'POST',
              headers: { 'Content-Type': 'application/json' },
              body: JSON.stringify({
                cases: cases.length > 0 ? cases : getInitial12MonthsCases(),
                wards: wards.length > 0 ? wards : INITIAL_WARDS,
                recommendations: recommendations || INITIAL_RECOMMENDATIONS,
              }),
            });
            if (initRes.ok) {
              const initData = await initRes.json();
              lastServerUpdatedRef.current = initData.lastUpdated || Date.now();
              setLastSyncTime(lastServerUpdatedRef.current);
            }
          } else {
            // If server has data, update if it's the initial load or newer than our last sync
            if (!lastServerUpdatedRef.current || (data.lastUpdated && data.lastUpdated > lastServerUpdatedRef.current)) {
              setCases(data.cases);
              if (Array.isArray(data.wards) && data.wards.length > 0) {
                setWards(data.wards);
              }
              if (data.recommendations && typeof data.recommendations === 'object') {
                setRecommendations(data.recommendations);
              }
              lastServerUpdatedRef.current = data.lastUpdated || Date.now();
              setLastSyncTime(lastServerUpdatedRef.current);
            }
          }
        }
      }
    } catch (err) {
      // Offline fallback
      console.log('[Sync] Offline or server initial check skipped');
    } finally {
      if (isManual) setIsSyncing(false);
    }
  };

  // Poll server every 5 seconds so any edits made by other users appear automatically
  useEffect(() => {
    fetchSharedData();
    const interval = setInterval(() => {
      fetchSharedData();
    }, 5000);
    return () => clearInterval(interval);
  }, []);

  // Active Month Cases (strictly filtered by monthNumber AND year)
  const activeMonthCases = useMemo(() => {
    return cases.filter((c) => {
      const cMonth = c.month || 10;
      const cYear = c.year || 2568;
      return cMonth === activeFiscalMonth.monthNumber && cYear === activeFiscalMonth.year;
    });
  }, [cases, activeFiscalMonth]);

  // Filtered cases for search term in active month
  const filteredActiveMonthCases = useMemo(() => {
    if (!searchTerm.trim()) return activeMonthCases;
    const term = searchTerm.toLowerCase();
    return activeMonthCases.filter((c) => {
      const ward = wards.find((w) => w.id === c.wardId);
      const wardName = ward ? ward.name.toLowerCase() : '';
      return (
        c.organism.toLowerCase().includes(term) ||
        c.resistanceGroup.toLowerCase().includes(term) ||
        c.specimen.toLowerCase().includes(term) ||
        wardName.includes(term) ||
        (c.hn && c.hn.toLowerCase().includes(term)) ||
        (c.note && c.note.toLowerCase().includes(term))
      );
    });
  }, [activeMonthCases, searchTerm, wards]);

  // Dynamically compute organism total counts from current month's cases
  const dynamicOrganismConfigs = useMemo(() => {
    const configs: Record<string, OrganismConfig> = { ...ORGANISM_CONFIGS };

    // Reset counts
    Object.keys(configs).forEach((key) => {
      configs[key] = { ...configs[key], totalCases: 0 };
    });

    const targetCases = viewMode === 'month' ? activeMonthCases : cases;

    targetCases.forEach((c) => {
      const count = c.count || 1;
      if (configs[c.organism]) {
        configs[c.organism].totalCases += count;
      } else {
        // Fallback for custom added organisms
        configs[c.organism] = {
          name: c.organism,
          shortName: c.organism.split(' ').map((p, i) => (i === 0 ? p[0] + '.' : p)).join(' '),
          color: {
            bg: 'bg-slate-700 text-white',
            text: 'text-slate-800',
            border: 'border-slate-300',
            badgeBg: 'bg-slate-50 text-slate-800 border-slate-200',
            dot: '#475569',
          },
          totalCases: count,
          riskCategory: 'Medium',
          description: 'เชื้อจุลชีพที่บันทึกเพิ่มเติม',
        };
      }
    });

    return configs;
  }, [activeMonthCases, cases, viewMode]);

  // Total case count in active month
  const monthGrandTotal = useMemo(() => {
    return activeMonthCases.reduce((sum, c) => sum + (c.count || 1), 0);
  }, [activeMonthCases]);

  // Total case count in full fiscal year
  const fiscalYearGrandTotal = useMemo(() => {
    return cases.reduce((sum, c) => sum + (c.count || 1), 0);
  }, [cases]);

  // Toggle filter handlers
  const handleToggleOrganism = (organism: string) => {
    setSelectedOrganisms((prev) =>
      prev.includes(organism) ? prev.filter((o) => o !== organism) : [...prev, organism]
    );
  };

  const handleToggleSpecimen = (specimen: string) => {
    setSelectedSpecimens((prev) =>
      prev.includes(specimen) ? prev.filter((s) => s !== specimen) : [...prev, specimen]
    );
  };

  const handleClearFilters = () => {
    setSelectedOrganisms([]);
    setSelectedSpecimens([]);
    setSearchTerm('');
  };

  // Add Case Slot Click from Spot Map Table (+ เพิ่มกล่อง)
  const handleAddCaseToSlot = (day: number, wardId: string) => {
    setAddModalInitialDay(day);
    setAddModalInitialWardId(wardId);
    setIsAddModalOpen(true);
  };

  // Paste copied template directly to a day and ward cell
  const handlePasteTemplateToSlot = async (day: number, wardId: string) => {
    if (!activeCopiedTemplate) return;
    const newCase: MDRCase = {
      id: `fy-${activeFiscalMonth.year}-m${activeFiscalMonth.monthNumber}-c${Date.now()}-${Math.random().toString(36).substring(2, 6)}`,
      month: activeFiscalMonth.monthNumber,
      year: activeFiscalMonth.year,
      day,
      wardId,
      organism: activeCopiedTemplate.organism,
      resistanceGroup: activeCopiedTemplate.resistanceGroup,
      specimen: activeCopiedTemplate.specimen,
      count: activeCopiedTemplate.count || 1,
      hn: activeCopiedTemplate.hn,
      note: activeCopiedTemplate.note,
    };
    // Optimistic local update
    setCases((prev) => [newCase, ...prev]);

    // Central server sync
    try {
      const res = await fetch('/api/cases', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(newCase),
      });
      if (res.ok) {
        const data = await res.json();
        if (data.lastUpdated) lastServerUpdatedRef.current = data.lastUpdated;
        setLastSyncTime(Date.now());
      }
    } catch (e) {
      console.log('Central sync queued locally', e);
    }
  };

  // Copy an existing spot map box to clipboard template
  const handleCopyCaseAsTemplate = (caseItem: MDRCase) => {
    setActiveCopiedTemplate({
      organism: caseItem.organism,
      resistanceGroup: caseItem.resistanceGroup,
      specimen: caseItem.specimen,
      count: caseItem.count || 1,
      hn: caseItem.hn,
      note: caseItem.note,
    });
  };

  // Add case submit
  const handleAddCase = async (newCaseData: Omit<MDRCase, 'id'>) => {
    const newCase: MDRCase = {
      ...newCaseData,
      id: `fy-${newCaseData.year || activeFiscalMonth.year}-m${newCaseData.month || activeFiscalMonth.monthNumber}-c${Date.now()}-${Math.random().toString(36).substring(2, 6)}`,
      month: newCaseData.month || activeFiscalMonth.monthNumber,
      year: newCaseData.year || activeFiscalMonth.year,
    };
    // Optimistic local update
    setCases((prev) => [newCase, ...prev]);

    // Central server sync
    try {
      const res = await fetch('/api/cases', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(newCase),
      });
      if (res.ok) {
        const data = await res.json();
        if (data.lastUpdated) lastServerUpdatedRef.current = data.lastUpdated;
        setLastSyncTime(Date.now());
      }
    } catch (e) {
      console.log('Central sync queued locally', e);
    }
  };

  // Update existing case
  const handleUpdateCase = async (updatedCase: MDRCase) => {
    // Optimistic local update
    setCases((prev) => prev.map((c) => (c.id === updatedCase.id ? updatedCase : c)));

    // Central server sync
    try {
      const res = await fetch(`/api/cases/${encodeURIComponent(updatedCase.id)}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(updatedCase),
      });
      if (res.ok) {
        const data = await res.json();
        if (data.lastUpdated) lastServerUpdatedRef.current = data.lastUpdated;
        setLastSyncTime(Date.now());
      }
    } catch (e) {
      console.log('Central sync queued locally', e);
    }
  };

  // Delete case
  const handleDeleteCase = async (caseId: string) => {
    // Optimistic local update
    setCases((prev) => prev.filter((c) => c.id !== caseId));

    // Central server sync
    try {
      const res = await fetch(`/api/cases/${encodeURIComponent(caseId)}`, {
        method: 'DELETE',
      });
      if (res.ok) {
        const data = await res.json();
        if (data.lastUpdated) lastServerUpdatedRef.current = data.lastUpdated;
        setLastSyncTime(Date.now());
      }
    } catch (e) {
      console.log('Central sync queued locally', e);
    }
  };

  // Select case for detail modal
  const handleSelectCase = (caseItem: MDRCase) => {
    setSelectedCase(caseItem);
    setIsCaseDetailsOpen(true);
  };

  // Select ward header to jump to recommendations
  const handleSelectWard = (ward: WardInfo) => {
    setSelectedWardForRec(ward.id);
  };

  // Update ward settings (+5 channels)
  const handleUpdateWards = async (newWards: WardInfo[]) => {
    setWards(newWards);
    try {
      const res = await fetch('/api/wards', {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ wards: newWards }),
      });
      if (res.ok) {
        const data = await res.json();
        if (data.lastUpdated) lastServerUpdatedRef.current = data.lastUpdated;
        setLastSyncTime(Date.now());
      }
    } catch (e) {
      console.log('Central sync queued locally', e);
    }
  };

  // Update ward notes in recommendations
  const handleUpdateWardNotes = async (wardId: string, notes: string) => {
    const updated = {
      ...recommendations,
      [wardId]: {
        ...(recommendations[wardId] || recommendations.default || { wardId }),
        wardId,
        customNotes: notes,
      },
    };
    setRecommendations(updated);

    try {
      const res = await fetch('/api/recommendations', {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ recommendations: updated }),
      });
      if (res.ok) {
        const data = await res.json();
        if (data.lastUpdated) lastServerUpdatedRef.current = data.lastUpdated;
        setLastSyncTime(Date.now());
      }
    } catch (e) {
      console.log('Central sync queued locally', e);
    }
  };

  // Reset data to defaults
  const handleResetData = async () => {
    if (
      window.confirm(
        'คุณต้องการรีเซ็ตข้อมูลปีงบประมาณ 2569 (ต.ค. 68 – ก.ย. 69) กลับเป็นค่าเริ่มต้นตามเอกสารจริงหรือไม่? (ต.ค. 68 จะมีครบ 50 เคสตรงตามไฟล์แนบ)'
      )
    ) {
      const initialCases = getInitial12MonthsCases();
      setCases(initialCases);
      setWards(INITIAL_WARDS);
      setRecommendations(INITIAL_RECOMMENDATIONS);
      setSelectedOrganisms([]);
      setSelectedSpecimens([]);
      setSearchTerm('');
      setCurrentFiscalIndex(1);
      localStorage.removeItem('mdr_spot_map_cases_fy26');
      localStorage.removeItem('mdr_spot_map_wards_fy26');
      localStorage.removeItem('mdr_spot_map_recommendations_fy26');

      try {
        await fetch('/api/reset', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            initialCases,
            initialWards: INITIAL_WARDS,
            initialRecommendations: INITIAL_RECOMMENDATIONS,
          }),
        });
        setLastSyncTime(Date.now());
      } catch (e) {
        console.error('Reset central server error', e);
      }
    }
  };

  // Export Spot Map CSV for current active fiscal month
  const handleExportCSV = () => {
    const days = Array.from({ length: activeFiscalMonth.daysCount }, (_, i) => i + 1);

    const headers = ['วันที่', ...wards.map((w) => `"${w.name}"`), 'รวม'];
    const rows: string[] = [
      `Spot map เชื้อดื้อยา รายวัน แยกตามหอผู้ป่วย — ${activeFiscalMonth.name} (ปีงบประมาณ 2569)`,
      'แต่ละช่อง = เชื้อ / กลุ่มเชื้อ (RESIST) / สิ่งส่งตรวจ · ×N = จำนวนราย',
      '',
      headers.join(','),
    ];

    days.forEach((day) => {
      const rowCols: string[] = [`${day}`];
      let daySum = 0;

      wards.forEach((w) => {
        const dayCases = activeMonthCases.filter((c) => c.day === day && c.wardId === w.id);
        if (dayCases.length > 0) {
          const cellText = dayCases
            .map((c) => {
              const multi = c.count > 1 ? ` ×${c.count}` : '';
              return `${c.organism}${multi}\n${c.resistanceGroup}\n${c.specimen}`;
            })
            .join('\n---\n');
          rowCols.push(`"${cellText.replace(/"/g, '""')}"`);
          daySum += dayCases.reduce((sum, c) => sum + (c.count || 1), 0);
        } else {
          rowCols.push('""');
        }
      });

      rowCols.push(`${daySum}`);
      rows.push(rowCols.join(','));
    });

    // Total row
    const totalCols: string[] = ['รวม'];
    let allGrandTotal = 0;
    wards.forEach((w) => {
      const wardSum = activeMonthCases
        .filter((c) => c.wardId === w.id)
        .reduce((sum, c) => sum + (c.count || 1), 0);
      totalCols.push(`${wardSum}`);
      allGrandTotal += wardSum;
    });
    totalCols.push(`${allGrandTotal}`);
    rows.push(totalCols.join(','));

    // Color explanation at bottom
    rows.push('');
    rows.push('คำอธิบายสี (เชื้อที่พบในเดือนนี้),ราย');
    Object.values(dynamicOrganismConfigs)
      .filter((org) => org.totalCases > 0)
      .sort((a, b) => b.totalCases - a.totalCases)
      .forEach((org) => {
        rows.push(`"${org.name}",${org.totalCases}`);
      });

    const csvContent = '\uFEFF' + rows.join('\r\n');
    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.setAttribute('download', `spot_map_mdr_${activeFiscalMonth.shortName.replace(/\s+/g, '_')}_FY2569.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    URL.revokeObjectURL(url);
  };

  // Export Full 12 Fiscal Months (ปีงบประมาณ 2569: ต.ค. 68 - ก.ย. 69) CSV
  const handleExportAllMonthsCSV = () => {
    const rows: string[] = [
      `สรุปรายงานเฝ้าระวังเชื้อดื้อยา Spot Map ปีงบประมาณ 2569 (ตุลาคม 2568 – กันยายน 2569)`,
      `รวมทั้งปีงบประมาณ: ${fiscalYearGrandTotal} ราย`,
      '',
    ];

    // Summary per fiscal month
    rows.push('ลำดับ,เดือน,ปี พ.ศ.,จำนวนผู้ป่วยเชื้อดื้อยา (ราย)');
    FISCAL_MONTHS.forEach((fm) => {
      const count = cases
        .filter((c) => (c.month || 10) === fm.monthNumber && (c.year || 2568) === fm.year)
        .reduce((sum, c) => sum + (c.count || 1), 0);
      rows.push(`${fm.fiscalIndex},"${fm.name}",${fm.year},${count}`);
    });
    rows.push('');

    // Detailed Raw Case Log in Fiscal Order
    rows.push('ID,ปี พ.ศ.,เดือน,วันที่,หอผู้ป่วย/ตึก,เชื้อจุลชีพ,กลุ่มความดื้อยา,สิ่งส่งตรวจ,จำนวนราย,HN,บันทึก');
    cases
      .sort((a, b) => {
        const fmA = FISCAL_MONTHS.find(
          (fm) => fm.monthNumber === (a.month || 10) && fm.year === (a.year || 2568)
        )?.fiscalIndex || 1;
        const fmB = FISCAL_MONTHS.find(
          (fm) => fm.monthNumber === (b.month || 10) && fm.year === (b.year || 2568)
        )?.fiscalIndex || 1;
        return fmA !== fmB ? fmA - fmB : a.day - b.day;
      })
      .forEach((c) => {
        const ward = wards.find((w) => w.id === c.wardId);
        const fm = FISCAL_MONTHS.find(
          (f) => f.monthNumber === (c.month || 10) && f.year === (c.year || 2568)
        );
        rows.push(
          [
            `"${c.id}"`,
            c.year || 2568,
            `"${fm?.name || c.month}"`,
            c.day,
            `"${ward?.name || c.wardId}"`,
            `"${c.organism}"`,
            `"${c.resistanceGroup}"`,
            `"${c.specimen}"`,
            c.count || 1,
            `"${c.hn || ''}"`,
            `"${(c.note || '').replace(/"/g, '""')}"`,
          ].join(',')
        );
      });

    const csvContent = '\uFEFF' + rows.join('\r\n');
    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.setAttribute('download', `spot_map_mdr_full_FY2569_Oct68_Sep69.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    URL.revokeObjectURL(url);
  };

  // Print view
  const handlePrint = () => {
    window.print();
  };

  return (
    <div className="min-h-screen bg-slate-100/70 text-slate-900 font-sans antialiased selection:bg-teal-500 selection:text-white flex flex-col">
      {/* Top Application Header */}
      <Header
        totalCases={viewMode === 'month' ? monthGrandTotal : fiscalYearGrandTotal}
        wardCount={wards.length}
        cases={viewMode === 'month' ? activeMonthCases : cases}
        wards={wards}
        monthName={activeFiscalMonth.name}
        daysCount={activeFiscalMonth.daysCount}
        currentYear={activeFiscalMonth.year}
        searchTerm={searchTerm}
        onSearchChange={setSearchTerm}
        onOpenAddModal={() => {
          setAddModalInitialDay(1);
          setAddModalInitialWardId(wards[0]?.id || 'med_male');
          setIsAddModalOpen(true);
        }}
        onOpenWardSettings={() => setIsWardSettingsOpen(true)}
        onOpenShareModal={() => setIsShareModalOpen(true)}
        onResetData={handleResetData}
        onExportCSV={handleExportCSV}
        onExportAllMonthsCSV={handleExportAllMonthsCSV}
        onPrint={handlePrint}
        lastSyncTime={lastSyncTime}
        isSyncing={isSyncing}
      />

      {/* Main Content Area */}
      <main className="flex-1 max-w-7xl w-full mx-auto px-3 sm:px-6 lg:px-8 py-5">
        {/* 12-Month Fiscal Year Selector Strip (ต.ค. 68 – ก.ย. 69) */}
        <MonthSelector
          currentFiscalIndex={currentFiscalIndex}
          cases={cases}
          viewMode={viewMode}
          onSelectFiscalMonth={(idx) => {
            setCurrentFiscalIndex(idx);
            setViewMode('month');
          }}
          onSelectViewMode={setViewMode}
        />

        {/* Search Results Alert if active */}
        {searchTerm.trim() && (
          <div className="mb-4 p-3 bg-teal-50 border border-teal-200 rounded-xl flex items-center justify-between text-xs text-teal-900">
            <span>
              ผลการค้นหาสำหรับ <strong>"{searchTerm}"</strong> ใน {activeFiscalMonth.name}: พบเคสที่ตรงกัน{' '}
              <strong>{filteredActiveMonthCases.reduce((s, c) => s + (c.count || 1), 0)} ราย</strong>
            </span>
            <button
              onClick={() => setSearchTerm('')}
              className="text-teal-700 font-bold hover:underline"
            >
              ล้างการค้นหา
            </button>
          </div>
        )}

        {/* View Mode: 12-Month Annual Overview vs Monthly Spot Map */}
        {viewMode === 'annual' ? (
          <AnnualOverview
            cases={cases}
            wards={wards}
            organismConfigs={dynamicOrganismConfigs}
            onSelectFiscalMonth={(idx) => {
              setCurrentFiscalIndex(idx);
              setViewMode('month');
            }}
          />
        ) : (
          <>
            {/* Ward / Department Quick Selector Bar */}
            <WardSelectorBar
              wards={wards}
              cases={activeMonthCases}
              selectedWardId={selectedWardViewId}
              onSelectWardId={(id) => {
                setSelectedWardViewId(id);
                if (id !== 'all') {
                  setSelectedWardForRec(id);
                }
              }}
              visibleWardIds={visibleWardIds}
              onToggleVisibleWard={handleToggleVisibleWard}
              onSetAllVisibleWards={setVisibleWardIds}
            />

            {/* Pathogen Color Legend & Specimen Guide */}
            <ColorLegend
              organismConfigs={dynamicOrganismConfigs}
              selectedOrganisms={selectedOrganisms}
              onToggleOrganism={handleToggleOrganism}
              onClearFilter={handleClearFilters}
              selectedSpecimens={selectedSpecimens}
              onToggleSpecimen={handleToggleSpecimen}
            />

            {/* Quick Copy-Paste Palette Box (กล่องรายชื่อเชื้อสิ่งส่งตรวจสำหรับคัดลอก-วาง) */}
            <QuickStampPalette
              organismConfigs={dynamicOrganismConfigs}
              activeCopiedTemplate={activeCopiedTemplate}
              onCopyTemplate={setActiveCopiedTemplate}
              onClearCopiedTemplate={() => setActiveCopiedTemplate(null)}
            />

            {/* Spot Map Table: Single Ward Dedicated View VS All-Wards 2D Matrix */}
            {selectedWardViewId !== 'all' ? (
              (() => {
                const focusedWard = wards.find((w) => w.id === selectedWardViewId) || wards[0];
                return (
                  <WardSpotMapTable
                    ward={focusedWard}
                    allWards={wards}
                    days={daysArray}
                    cases={filteredActiveMonthCases}
                    monthName={activeFiscalMonth.name}
                    monthShortName={activeFiscalMonth.shortName}
                    year={activeFiscalMonth.year}
                    monthNumber={activeFiscalMonth.monthNumber}
                    organismConfigs={dynamicOrganismConfigs}
                    selectedOrganisms={selectedOrganisms}
                    selectedSpecimens={selectedSpecimens}
                    activeCopiedTemplate={activeCopiedTemplate}
                    recommendation={recommendations[focusedWard.id]}
                    onSelectWard={(w) => {
                      setSelectedWardViewId(w.id);
                      setSelectedWardForRec(w.id);
                    }}
                    onAddCaseToSlot={handleAddCaseToSlot}
                    onSelectCase={handleSelectCase}
                    onPasteTemplateToSlot={handlePasteTemplateToSlot}
                    onCopyCaseAsTemplate={handleCopyCaseAsTemplate}
                    onSwitchToAllWards={() => setSelectedWardViewId('all')}
                  />
                );
              })()
            ) : (
              <SpotMapTable
                days={daysArray}
                wards={wards}
                cases={filteredActiveMonthCases}
                monthName={activeFiscalMonth.name}
                monthShortName={activeFiscalMonth.shortName}
                organismConfigs={dynamicOrganismConfigs}
                selectedOrganisms={selectedOrganisms}
                selectedSpecimens={selectedSpecimens}
                activeCopiedTemplate={activeCopiedTemplate}
                visibleWardIds={visibleWardIds}
                onAddCaseToSlot={handleAddCaseToSlot}
                onSelectCase={handleSelectCase}
                onSelectWard={(ward) => {
                  setSelectedWardForRec(ward.id);
                }}
                onFocusWard={(ward) => {
                  setSelectedWardViewId(ward.id);
                  setSelectedWardForRec(ward.id);
                }}
                onManageWards={() => setIsWardSettingsOpen(true)}
                onPasteTemplateToSlot={handlePasteTemplateToSlot}
                onCopyCaseAsTemplate={handleCopyCaseAsTemplate}
              />
            )}

            {/* Ward-by-Ward Summary and IC Recommendations */}
            <div className="mt-8">
              <WardRecommendations
                wards={wards}
                cases={activeMonthCases}
                recommendations={recommendations}
                organismConfigs={dynamicOrganismConfigs}
                onUpdateWardNotes={handleUpdateWardNotes}
                selectedWardId={selectedWardForRec}
                onClearSelectedWard={() => setSelectedWardForRec(null)}
              />
            </div>
          </>
        )}
      </main>

      {/* Footer */}
      <footer className="bg-white border-t border-slate-200 py-4 px-4 text-center text-xs text-slate-500">
        <div className="max-w-7xl mx-auto flex flex-col sm:flex-row items-center justify-between gap-2">
          <div>
            ระบบตาราง Spot Map เชื้อดื้อยา รายวัน แยกตามหอผู้ป่วย — ปีงบประมาณ 2569 (ตุลาคม 2568 – กันยายน 2569)
          </div>
          <div className="text-slate-400 font-mono text-[11px]">
            17 หอผู้ป่วยเดิม + 5 หน่วยงานเพิ่มเติม = รวม 22 หน่วยงาน
          </div>
        </div>
      </footer>

      {/* Modals */}
      <AddCaseModal
        isOpen={isAddModalOpen}
        onClose={() => setIsAddModalOpen(false)}
        onAddCase={handleAddCase}
        wards={wards}
        organismConfigs={dynamicOrganismConfigs}
        initialFiscalIndex={currentFiscalIndex}
        initialDay={addModalInitialDay}
        initialWardId={addModalInitialWardId}
      />

      <CaseDetailsModal
        isOpen={isCaseDetailsOpen}
        onClose={() => {
          setIsCaseDetailsOpen(false);
          setSelectedCase(null);
        }}
        caseItem={selectedCase}
        ward={wards.find((w) => w.id === selectedCase?.wardId)}
        organismConfig={selectedCase ? dynamicOrganismConfigs[selectedCase.organism] : undefined}
        onUpdateCase={handleUpdateCase}
        onDeleteCase={handleDeleteCase}
      />

      <WardSettingsModal
        isOpen={isWardSettingsOpen}
        onClose={() => setIsWardSettingsOpen(false)}
        wards={wards}
        onUpdateWards={handleUpdateWards}
        onResetWards={() => handleUpdateWards(INITIAL_WARDS)}
      />

      {/* Collaborative Share Link Modal with Full Editor Permissions */}
      <ShareModal
        isOpen={isShareModalOpen}
        onClose={() => setIsShareModalOpen(false)}
        casesCount={cases.length}
        wardsCount={wards.length}
        lastSyncTime={lastSyncTime}
        onManualSync={() => fetchSharedData(true)}
        isSyncing={isSyncing}
      />
    </div>
  );
}
