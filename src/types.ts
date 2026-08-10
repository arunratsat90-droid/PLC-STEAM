export interface SchoolEvaluation {
  schoolId: string;
  schoolName: string;
  schoolGroup?: string;
  // Initial AI Evaluation (คะแนนประเมินเบื้องต้นจากระบบ)
  aiTotalScore: number;
  aiQualityLevel: 'ดีเยี่ยม' | 'ดี' | 'พอใช้';
  aiNotes?: string;
  aiScores?: Record<number, number>;
  
  // Responsible Person / Official Evaluator Score (คะแนนประเมินจากผู้รับผิดชอบ)
  userTotalScore?: number | null;
  userQualityLevel?: 'ดีเยี่ยม' | 'ดี' | 'พอใช้' | null;
  evaluatorNotes?: string;
  evaluatorName?: string;
  scores: Record<number, number>; // Detailed 8 rubric items scores
  
  // Active/Effective combined score
  totalScore: number;
  qualityLevel: 'ดีเยี่ยม' | 'ดี' | 'พอใช้';
  isEvaluatedByUser?: boolean;
  updatedAt: string;
}

export interface SchoolReport {
  id: string;
  timestamp: string;
  formattedDate: string;
  schoolName: string;
  schoolGroup: string;
  plcUrl: string | null;
  plcFileId: string | null;
  plcThumbnailUrl: string | null;
  plcPreviewUrl: string | null;
  plcViewUrl: string | null;
  steamUrl: string | null;
  steamFileId: string | null;
  steamThumbnailUrl: string | null;
  steamPreviewUrl: string | null;
  steamViewUrl: string | null;
  hasPlc: boolean;
  hasSteam: boolean;
  completionStatus: 'complete' | 'plc_only' | 'steam_only' | 'incomplete';
}

export interface GroupStat {
  group: string;
  total: number;
  plcCount: number;
  steamCount: number;
  bothCount: number;
}

export interface DashboardSummary {
  totalSubmissions: number;
  totalSchools: number;
  totalPlcReports: number;
  totalSteamReports: number;
  bothReportsCount: number;
  groupStats: GroupStat[];
  lastFetched: string;
  sheetUrl: string;
}

export interface FilterOptions {
  searchQuery: string;
  selectedGroup: string;
  selectedStatus: 'all' | 'complete' | 'plc_only' | 'steam_only';
  sortBy: 'timestamp_desc' | 'timestamp_asc' | 'school_asc' | 'school_desc' | 'group_asc';
}
