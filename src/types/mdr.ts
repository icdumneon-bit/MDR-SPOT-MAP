export type SpecimenCategory =
  | 'เสมหะ'
  | 'ปัสสาวะ'
  | 'เลือด'
  | 'หนอง/แผล/เนื้อเยื่อ'
  | 'อื่นๆ';

export interface MDRCase {
  id: string;
  year?: number; // e.g. 2568
  month?: number; // 1 - 12 (1 = มกราคม, 10 = ตุลาคม)
  day: number; // 1 - 31
  wardId: string;
  organism: string; // e.g. "Acinetobacter baumannii"
  resistanceGroup: string; // e.g. "A. baumannii (CRAB_MDR)"
  specimen: SpecimenCategory | string;
  count: number; // e.g. 1 or 2 (from ×2)
  hn?: string;
  originalSpecimen?: string;
  note?: string;
}

export interface MonthInfo {
  number: number; // 1 - 12
  name: string;
  shortName: string;
  daysCount: number;
}

export interface FiscalMonthInfo {
  fiscalIndex: number; // 1 - 12 (1 = ต.ค. 68, 12 = ก.ย. 69)
  monthNumber: number; // 10, 11, 12, 1, 2, 3, 4, 5, 6, 7, 8, 9
  year: number; // 2568 หรือ 2569
  name: string; // e.g. "ตุลาคม 2568"
  shortName: string; // e.g. "ต.ค. 68"
  monthNameOnly: string; // e.g. "ตุลาคม"
  daysCount: number;
}

export interface PathogenItem {
  id: string;
  organism: string;
  resistanceGroup: string;
  isCustom?: boolean;
}

export interface SpecimenItem {
  id: string;
  name: string;
  icon?: string;
  color?: string;
  isCustom?: boolean;
}

export interface PathogenSpecimenPreset {
  id: string;
  organism: string;
  resistanceGroup: string;
  specimen: string;
  count?: number;
  label?: string;
}

export interface CopiedCaseTemplate {
  organism: string;
  resistanceGroup: string;
  specimen: string;
  count?: number;
  hn?: string;
  note?: string;
}

export interface WardInfo {
  id: string;
  name: string;
  building?: string;
  floor?: string;
  isCustom?: boolean; // For the 5 additional departments
  customName?: string;
}

export interface OrganismConfig {
  name: string;
  shortName: string;
  color: {
    bg: string;
    text: string;
    border: string;
    badgeBg: string;
    dot: string;
  };
  totalCases: number;
  description?: string;
  riskCategory: 'High' | 'Medium' | 'Critical';
}

export interface WardRecommendation {
  wardId: string;
  riskLevel: 'critical' | 'high' | 'moderate' | 'low';
  caseCount: number;
  topOrganisms: { organism: string; count: number }[];
  topSpecimens: { specimen: string; count: number }[];
  hasClusterAlert: boolean;
  recommendations: string[];
  icBundles: string[];
  customNotes?: string;
}
