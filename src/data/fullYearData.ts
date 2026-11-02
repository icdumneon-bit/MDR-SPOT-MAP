import { MDRCase, FiscalMonthInfo, MonthInfo } from '../types/mdr';
import { INITIAL_CASES as OCTOBER_CASES } from './initialData';

// 12 Months of Fiscal Year 2569 (ตุลาคม 2568 - กันยายน 2569)
export const FISCAL_MONTHS: FiscalMonthInfo[] = [
  {
    fiscalIndex: 1,
    monthNumber: 10,
    year: 2568,
    name: 'ตุลาคม 2568',
    shortName: 'ต.ค. 68',
    monthNameOnly: 'ตุลาคม',
    daysCount: 31,
  },
  {
    fiscalIndex: 2,
    monthNumber: 11,
    year: 2568,
    name: 'พฤศจิกายน 2568',
    shortName: 'พ.ย. 68',
    monthNameOnly: 'พฤศจิกายน',
    daysCount: 30,
  },
  {
    fiscalIndex: 3,
    monthNumber: 12,
    year: 2568,
    name: 'ธันวาคม 2568',
    shortName: 'ธ.ค. 68',
    monthNameOnly: 'ธันวาคม',
    daysCount: 31,
  },
  {
    fiscalIndex: 4,
    monthNumber: 1,
    year: 2569,
    name: 'มกราคม 2569',
    shortName: 'ม.ค. 69',
    monthNameOnly: 'มกราคม',
    daysCount: 31,
  },
  {
    fiscalIndex: 5,
    monthNumber: 2,
    year: 2569,
    name: 'กุมภาพันธ์ 2569',
    shortName: 'ก.พ. 69',
    monthNameOnly: 'กุมภาพันธ์',
    daysCount: 28,
  },
  {
    fiscalIndex: 6,
    monthNumber: 3,
    year: 2569,
    name: 'มีนาคม 2569',
    shortName: 'มี.ค. 69',
    monthNameOnly: 'มีนาคม',
    daysCount: 31,
  },
  {
    fiscalIndex: 7,
    monthNumber: 4,
    year: 2569,
    name: 'เมษายน 2569',
    shortName: 'เม.ย. 69',
    monthNameOnly: 'เมษายน',
    daysCount: 30,
  },
  {
    fiscalIndex: 8,
    monthNumber: 5,
    year: 2569,
    name: 'พฤษภาคม 2569',
    shortName: 'พ.ค. 69',
    monthNameOnly: 'พฤษภาคม',
    daysCount: 31,
  },
  {
    fiscalIndex: 9,
    monthNumber: 6,
    year: 2569,
    name: 'มิถุนายน 2569',
    shortName: 'มิ.ย. 69',
    monthNameOnly: 'มิถุนายน',
    daysCount: 30,
  },
  {
    fiscalIndex: 10,
    monthNumber: 7,
    year: 2569,
    name: 'กรกฎาคม 2569',
    shortName: 'ก.ค. 69',
    monthNameOnly: 'กรกฎาคม',
    daysCount: 31,
  },
  {
    fiscalIndex: 11,
    monthNumber: 8,
    year: 2569,
    name: 'สิงหาคม 2569',
    shortName: 'ส.ค. 69',
    monthNameOnly: 'สิงหาคม',
    daysCount: 31,
  },
  {
    fiscalIndex: 12,
    monthNumber: 9,
    year: 2569,
    name: 'กันยายน 2569',
    shortName: 'ก.ย. 69',
    monthNameOnly: 'กันยายน',
    daysCount: 30,
  },
];

// Backward-compatible THAI_MONTHS (aligned to fiscal list)
export const THAI_MONTHS: MonthInfo[] = FISCAL_MONTHS.map((f) => ({
  number: f.monthNumber,
  name: f.name,
  shortName: f.shortName,
  daysCount: f.daysCount,
}));

// Helper to generate realistic epidemiological surveillance data for other fiscal months
function generateFiscalMonthBaseline(
  fiscalItem: FiscalMonthInfo,
  seedShift: number,
  targetCount: number
): MDRCase[] {
  const maxDays = fiscalItem.daysCount;

  const pathogens = [
    { org: 'Escherichia coli', res: 'E. coli (MDR)', spec: 'ปัสสาวะ' },
    { org: 'Escherichia coli', res: 'E. coli (CRE_MDR)', spec: 'ปัสสาวะ' },
    { org: 'Escherichia coli', res: 'E. coli (MDR)', spec: 'เลือด' },
    { org: 'Acinetobacter baumannii', res: 'A. baumannii (CRAB_MDR)', spec: 'เสมหะ' },
    { org: 'Acinetobacter baumannii', res: 'A. baumannii (CRAB_MDR_CoRO)', spec: 'เสมหะ' },
    { org: 'Acinetobacter baumannii', res: 'A. baumannii (CRAB_MDR)', spec: 'หนอง/แผล/เนื้อเยื่อ' },
    { org: 'Staphylococcus aureus', res: 'S. aureus (MRSA)', spec: 'หนอง/แผล/เนื้อเยื่อ' },
    { org: 'Staphylococcus aureus', res: 'S. aureus (MRSA)', spec: 'เลือด' },
    { org: 'Klebsiella pneumoniae', res: 'K. pneumoniae (CRE_MDR)', spec: 'ปัสสาวะ' },
    { org: 'Klebsiella pneumoniae', res: 'K. pneumoniae (MDR)', spec: 'เลือด' },
    { org: 'Pseudomonas aeruginosa', res: 'P. aeruginosa (CRPA_MDR)', spec: 'เสมหะ' },
    { org: 'Pseudomonas aeruginosa', res: 'P. aeruginosa (MDR)', spec: 'หนอง/แผล/เนื้อเยื่อ' },
    { org: 'Staphylococcus epidermidis', res: 'S. epidermidis (MRSE)', spec: 'เลือด' },
    { org: 'Achromobacter xylosoxidans', res: 'Achromobacter spp. (MDR)', spec: 'หนอง/แผล/เนื้อเยื่อ' },
    { org: 'Klebsiella aerogenes', res: 'Enterobacter spp. (MDR)', spec: 'เสมหะ' },
  ];

  const wards = [
    'med_male',
    'med_male',
    'med_male',
    'med_female',
    'med_female',
    'surg_male',
    'icu',
    'cpk_6',
    'pediatric',
    'ortho',
    'cpk_5',
    'med_special_7',
    'hemodialysis',
    'ob_gyn',
    'custom_dept_1',
    'custom_dept_2',
  ];

  const result: MDRCase[] = [];
  let caseIdx = 1;

  for (let i = 0; i < targetCount; i++) {
    const day = (Math.abs(seedShift * 7 + i * 3 + (i % 5)) % maxDays) + 1;
    const pIdx = (seedShift + i * 2) % pathogens.length;
    const wIdx = (seedShift * 3 + i * 5) % wards.length;
    const p = pathogens[pIdx];
    const w = wards[wIdx];
    const isDouble = i % 11 === 0;

    result.push({
      id: `fy-${fiscalItem.year}-m${fiscalItem.monthNumber}-c${caseIdx++}`,
      year: fiscalItem.year,
      month: fiscalItem.monthNumber,
      day,
      wardId: w,
      organism: p.org,
      resistanceGroup: p.res,
      specimen: p.spec,
      count: isDouble ? 2 : 1,
    });
  }

  return result;
}

// Generate complete Fiscal Year (ตุลาคม 2568 - กันยายน 2569) dataset
export function getInitial12MonthsCases(): MDRCase[] {
  const allCases: MDRCase[] = [];

  // 1. ตุลาคม 2568: Exact 50 cases from user's attached CSV document!
  const octCasesWithDate: MDRCase[] = OCTOBER_CASES.map((c) => ({
    ...c,
    year: 2568,
    month: 10,
  }));
  allCases.push(...octCasesWithDate);

  // 2. Remaining 11 months of Fiscal Year 2569 (Nov 68 - Sep 69)
  const remainingMonths = FISCAL_MONTHS.filter((f) => !(f.monthNumber === 10 && f.year === 2568));

  const monthlyCounts = [41, 39, 44, 38, 46, 40, 47, 43, 48, 45, 42];

  remainingMonths.forEach((m, idx) => {
    const count = monthlyCounts[idx] || 42;
    const casesForMonth = generateFiscalMonthBaseline(m, (idx + 1) * 3, count);
    allCases.push(...casesForMonth);
  });

  return allCases;
}
