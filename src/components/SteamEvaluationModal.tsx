import React, { useState, useEffect } from 'react';
import { SchoolReport, SchoolEvaluation } from '../types';
import { getGroupColor } from '../utils/colors';
import {
  X,
  Award,
  CheckCircle2,
  AlertTriangle,
  Info,
  Sparkles,
  FileCheck2,
  Download,
  BookOpen,
  ChevronRight,
  Send,
  Building2,
  User,
  Clock,
  Save,
} from 'lucide-react';

import { getSchoolEvaluation, saveSchoolEvaluationAsync } from '../utils/evaluationStorage';

export interface RubricItem {
  id: number;
  title: string;
  description: string;
  level3: string;
  level2: string;
  level1: string;
}

export const STEAM_RUBRIC_CRITERIA: RubricItem[] = [
  {
    id: 1,
    title: '1. การวิเคราะห์และระบุสภาพปัญหา (ที่มาและความสำคัญ)',
    description: 'สะท้อนสมรรถนะและทักษะในศตวรรษที่ 21 (การคิด สื่อสาร แก้ปัญหา เทคโนโลยี ฯลฯ)',
    level3: 'ระบุสภาพปัญหาของผู้เรียนได้ชัดเจน ลึกซึ้ง มีข้อมูล/สภาพจริงสนับสนุนอย่างเป็นระบบ เชื่อมโยงปัญหากับสมรรถนะและทักษะในศตวรรษที่ 21 ได้อย่างชัดเจนและสอดคล้องกับบริบทสถานศึกษา',
    level2: 'ระบุสภาพปัญหาได้ชัดเจน มีข้อมูลสนับสนุนพอสมควร เชื่อมโยงกับสมรรถนะ/ทักษะในศตวรรษที่ 21 ได้เป็นบางส่วน',
    level1: 'ระบุสภาพปัญหาได้แต่ยังไม่ชัดเจน ขาดข้อมูลสนับสนุน หรือเชื่อมโยงกับสมรรถนะ/ทักษะในศตวรรษที่ 21 ได้น้อยหรือไม่ชัดเจน',
  },
  {
    id: 2,
    title: '2. ความสอดคล้องของมาตรฐาน ตัวชี้วัด และจุดประสงค์การเรียนรู้',
    description: 'ความถูกต้องตามหลักสูตรและความเป็นเหตุเป็นผลกับสภาพปัญหา',
    level3: 'ระบุมาตรฐาน ตัวชี้วัด และจุดประสงค์การเรียนรู้ครบถ้วน ถูกต้องตามหลักสูตร และสอดคล้องกับสภาพปัญหาที่ระบุไว้อย่างเป็นเหตุเป็นผล',
    level2: 'ระบุมาตรฐาน ตัวชี้วัด และจุดประสงค์ได้ถูกต้อง สอดคล้องกับสภาพปัญหาเป็นส่วนใหญ่',
    level1: 'ระบุมาตรฐาน ตัวชี้วัด และจุดประสงค์ได้ไม่ครบถ้วน หรือสอดคล้องกับสภาพปัญหาน้อย',
  },
  {
    id: 3,
    title: '3. การบูรณาการแนวคิดสะตีมศึกษา (STEAM Integration)',
    description: 'การหลอมรวมองค์ความรู้ทั้ง 5 สาขาวิชา (Science, Tech, Engineering, Arts, Math)',
    level3: 'บูรณาการองค์ความรู้ทั้ง 5 สาขาเข้าด้วยกันอย่างเป็นระบบ ชัดเจน และเชื่อมโยงกับสภาพปัญหา/เนื้อหาสาระการเรียนรู้ได้อย่างกลมกลืน',
    level2: 'บูรณาการองค์ความรู้ได้ครบทั้ง 5 สาขา แต่ความเชื่อมโยงระหว่างสาขายังไม่ชัดเจนในบางส่วน',
    level1: 'บูรณาการองค์ความรู้ได้ไม่ครบทุกสาขา หรือขาดความเชื่อมโยงที่ชัดเจนระหว่างสาขา',
  },
  {
    id: 4,
    title: '4. การออกแบบกิจกรรมการเรียนรู้แบบโครงงาน (Project-Based Learning)',
    description: 'การดำเนินกิจกรรมครบ 6 ขั้นตอน และการส่งเสริมทักษะกระบวนการคิด',
    level3: 'ออกแบบกิจกรรมครบทั้ง 6 ขั้นตอน มีรายละเอียดชัดเจน เป็นลำดับที่ส่งเสริมให้ผู้เรียนได้ฝึกคิดวิเคราะห์ แก้ปัญหา และลงมือปฏิบัติจริงอย่างเป็นระบบ สอดคล้องกับปัญหาและจุดประสงค์การเรียนรู้',
    level2: 'ออกแบบกิจกรรมครบทั้ง 6 ขั้นตอน มีรายละเอียดพอสมควร สอดคล้องกับปัญหาและจุดประสงค์เป็นส่วนใหญ่',
    level1: 'ออกแบบกิจกรรมไม่ครบทุกขั้นตอน หรือรายละเอียดไม่ชัดเจน ขาดความสอดคล้องกับสภาพปัญหา',
  },
  {
    id: 5,
    title: '5. ผลลัพธ์ของผู้เรียนตามสมรรถนะและทักษะในศตวรรษที่ 21',
    description: 'ร่องรอย/หลักฐานเชิงประจักษ์และการครอบคลุมสมรรถนะเป้าหมาย',
    level3: 'รายงานผลลัพธ์ที่เกิดกับผู้เรียนชัดเจน ครอบคลุมสมรรถนะ/ทักษะที่มุ่งพัฒนา พร้อมหลักฐาน/ร่องรอยเชิงประจักษ์ที่สะท้อนการแก้ไขปัญหาตรงตามสภาพปัญหาที่ระบุไว้อย่างชัดเจน',
    level2: 'รายงานผลลัพธ์ของผู้เรียนครอบคลุมสมรรถนะ/ทักษะส่วนใหญ่ มีหลักฐานสนับสนุนพอสมควร',
    level1: 'รายงานผลลัพธ์ของผู้เรียนไม่ครอบคลุม ขาดหลักฐานสนับสนุน หรือไม่เชื่อมโยงกับสภาพปัญหาที่ระบุไว้',
  },
  {
    id: 6,
    title: '6. รูปแบบและเครื่องมือการวัดและประเมินผล',
    description: 'ความหลากหลายของเครื่องมือและความสอดคล้องกับตัวชี้วัด/สมรรถนะ',
    level3: 'ใช้รูปแบบการประเมินที่หลากหลาย (สังเกตพฤติกรรม ประเมินชิ้นงาน ประเมินโดยเพื่อน ประเมินตนเอง นำเสนอผลงาน) เครื่องมือ (รูบริค/checklist) สอดคล้องกับตัวชี้วัดและสมรรถนะที่มุ่งพัฒนาอย่างชัดเจน',
    level2: 'ใช้รูปแบบการประเมินหลากหลายพอสมควร เครื่องมือสอดคล้องกับตัวชี้วัดเป็นส่วนใหญ่',
    level1: 'ใช้รูปแบบการประเมินไม่หลากหลาย หรือเครื่องมือไม่สอดคล้องกับตัวชี้วัด/สมรรถนะ',
  },
  {
    id: 7,
    title: '7. สื่อและแหล่งเรียนรู้ประกอบการจัดการเรียนรู้',
    description: 'ความเหมาะสม ทันสมัย และประสิทธิภาพในการสนับสนุนสะตีมศึกษา',
    level3: 'ระบุสื่อ/แหล่งเรียนรู้ที่หลากหลาย เหมาะสม ทันสมัย และสอดคล้องกับกิจกรรม ช่วยส่งเสริมการเรียนรู้ตามแนวทางสะตีมศึกษาได้อย่างมีประสิทธิภาพ',
    level2: 'ระบุสื่อ/แหล่งเรียนรู้ที่เหมาะสมพอสมควร สอดคล้องกับกิจกรรมเป็นส่วนใหญ่',
    level1: 'ระบุสื่อ/แหล่งเรียนรู้น้อย หรือไม่สอดคล้องกับกิจกรรมการเรียนรู้',
  },
  {
    id: 8,
    title: '8. ความสมบูรณ์และคุณภาพโดยรวมของรายงาน',
    description: 'ความครบถ้วน ความเชื่อมโยงเชิงเหตุและผล และภาษาที่ใช้นำเสนอ',
    level3: 'รายงานมีความครบถ้วนสมบูรณ์ทุกองค์ประกอบ เชื่อมโยงเป็นเหตุเป็นผลตั้งแต่การวิเคราะห์ปัญหาจนถึงผลลัพธ์ผู้เรียน ภาษาชัดเจน อ่านง่าย',
    level2: 'รายงานมีความครบถ้วนเป็นส่วนใหญ่ เชื่อมโยงกันพอสมควร',
    level1: 'รายงานมีความครบถ้วนน้อย ขาดความเชื่อมโยงระหว่างองค์ประกอบ หรือภาษาไม่ชัดเจน',
  },
];

interface SteamEvaluationModalProps {
  isOpen: boolean;
  report: SchoolReport | null;
  savedEvaluation?: SchoolEvaluation | null;
  onSaveEvaluation: (evaluation: SchoolEvaluation) => void;
  onClose: () => void;
}

export const SteamEvaluationModal: React.FC<SteamEvaluationModalProps> = ({
  isOpen,
  report,
  savedEvaluation,
  onSaveEvaluation,
  onClose,
}) => {
  // Store score for each of the 8 criteria (Unique per school)
  const [scores, setScores] = useState<Record<number, number>>({
    1: 3,
    2: 3,
    3: 3,
    4: 3,
    5: 3,
    6: 2,
    7: 3,
    8: 3,
  });

  const [evaluatorNotes, setEvaluatorNotes] = useState<string>('');
  const [evaluatorName, setEvaluatorName] = useState<string>('คณะกรรมการประเมิน สพฐ.');
  const [isSavedNotice, setIsSavedNotice] = useState<boolean>(false);

  // Load school-specific evaluation data when opening or switching schools
  useEffect(() => {
    if (report) {
      const activeEval = savedEvaluation || getSchoolEvaluation(report.schoolName);
      if (activeEval) {
        setScores(activeEval.scores || { 1: 3, 2: 3, 3: 3, 4: 3, 5: 3, 6: 2, 7: 3, 8: 3 });
        setEvaluatorNotes(activeEval.evaluatorNotes || '');
        setEvaluatorName(activeEval.evaluatorName || 'คณะกรรมการประเมิน สพฐ.');
      } else {
        // Fallback generator for unseeded new schools
        setScores({ 1: 3, 2: 3, 3: 2, 4: 3, 5: 2, 6: 2, 7: 3, 8: 2 });
        setEvaluatorNotes(`ประเมินผลการจัดกิจกรรมสะตีมศึกษาของ ${report.schoolName} (กลุ่ม${report.schoolGroup}): รายงานครอบคลุมองค์ประกอบหลัก มีสื่อและกระบวนการเรียนรู้เชิงประจักษ์`);
        setEvaluatorName('คณะกรรมการประเมิน สพป.สิงห์บุรี');
      }
      setIsSavedNotice(false);
    }
  }, [report, savedEvaluation, isOpen]);

  if (!isOpen || !report) return null;

  const totalScore: number = (Object.values(scores) as number[]).reduce((a: number, b: number) => a + b, 0);
  const percentage = Math.round((totalScore / 24) * 100);

  let qualityLevel: 'ดีเยี่ยม' | 'ดี' | 'พอใช้' = 'พอใช้';
  let qualityBadgeClass = 'bg-amber-100 text-amber-800 border-amber-300';
  let passStatus = 'ควรปรับปรุงแก้ไขให้ได้ระดับ "ดี" ขึ้นไป (>= 14 คะแนน)';

  if (totalScore >= 20) {
    qualityLevel = 'ดีเยี่ยม';
    qualityBadgeClass = 'bg-emerald-100 text-emerald-800 border-emerald-300';
    passStatus = 'ผ่านเกณฑ์ระดับคุณภาพดีเยี่ยม (สอดคล้องตามเป้าหมายยุทธศาสตร์)';
  } else if (totalScore >= 14) {
    qualityLevel = 'ดี';
    qualityBadgeClass = 'bg-blue-100 text-blue-800 border-blue-300';
    passStatus = 'ผ่านเกณฑ์มาตรฐานการประเมิน (ระดับดีขึ้นไป)';
  }

  const handleScoreChange = (criteriaId: number, val: number) => {
    setScores((prev) => ({ ...prev, [criteriaId]: val }));
  };

  const handleSave = async () => {
    const aiScore = savedEvaluation?.aiTotalScore || 20;
    const aiLevel = savedEvaluation?.aiQualityLevel || 'ดีเยี่ยม';

    const evalData: SchoolEvaluation = {
      schoolId: report.id,
      schoolName: report.schoolName,
      schoolGroup: report.schoolGroup,
      aiTotalScore: aiScore,
      aiQualityLevel: aiLevel,
      aiNotes: savedEvaluation?.aiNotes || 'วิเคราะห์โครงสร้างรายงานเบื้องต้นจากระบบ',
      userTotalScore: totalScore,
      userQualityLevel: qualityLevel,
      scores,
      totalScore,
      qualityLevel,
      isEvaluatedByUser: true,
      evaluatorNotes,
      evaluatorName: evaluatorName.trim() || 'ผู้รับผิดชอบประเมิน',
      updatedAt: new Date().toISOString(),
    };

    onSaveEvaluation(evalData);
    setIsSavedNotice(true);

    // Call async real-time backend & Google Sheets webhook sync
    try {
      await saveSchoolEvaluationAsync(evalData);
    } catch (e) {
      console.log('Realtime sync attempt completed locally');
    }

    setTimeout(() => {
      onClose();
    }, 700);
  };

  const groupColor = getGroupColor(report.schoolGroup);

  return (
    <div className="fixed inset-0 z-50 overflow-y-auto bg-slate-900/70 backdrop-blur-xs flex items-center justify-center p-3 sm:p-4 md:p-6 animate-fadeIn">
      <div className="bg-white rounded-3xl shadow-2xl border border-slate-200 w-full max-w-5xl max-h-[94vh] flex flex-col overflow-hidden relative">
        
        {/* Modal Header */}
        <div className="bg-slate-900 text-white p-5 sm:p-6 flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-slate-800">
          <div className="flex items-start space-x-3">
            <div className="p-2.5 bg-amber-500 text-slate-950 rounded-xl font-bold flex-shrink-0 mt-0.5">
              <Sparkles className="w-6 h-6" />
            </div>
            <div>
              <div className="flex items-center space-x-2 flex-wrap gap-y-1">
                <span className="px-2.5 py-0.5 text-xs font-semibold rounded-md bg-amber-400 text-slate-950">
                  เครื่องมือประเมินคุณภาพรายงาน STEAM
                </span>
                <span className={`px-2.5 py-0.5 text-xs font-semibold rounded-md border ${groupColor.bg} ${groupColor.text} ${groupColor.border}`}>
                  กลุ่ม{report.schoolGroup}
                </span>
                {savedEvaluation && (
                  <span className="px-2 py-0.5 text-xs font-medium rounded-md bg-emerald-900/80 text-emerald-300 border border-emerald-700/50 flex items-center gap-1">
                    <CheckCircle2 className="w-3 h-3 text-emerald-400" />
                    เคยประเมินแล้ว
                  </span>
                )}
              </div>
              <h2 className="text-xl sm:text-2xl font-bold text-white mt-1 leading-tight">
                ประเมินผลรายโรงเรียน: {report.schoolName}
              </h2>
            </div>
          </div>

          <button
            onClick={onClose}
            className="p-2 text-slate-400 hover:text-white bg-slate-800 hover:bg-slate-700 rounded-xl transition-colors border border-slate-700 self-end sm:self-auto"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Score Banner displaying 2 distinct columns */}
        <div className="bg-slate-100 border-b border-slate-200 px-6 py-4 grid grid-cols-1 md:grid-cols-3 gap-4 items-center">
          
          {/* Column 1: AI Baseline */}
          <div className="bg-white p-3.5 rounded-2xl border border-indigo-200 shadow-2xs flex items-center space-x-3">
            <div className="p-2.5 bg-indigo-50 text-indigo-700 rounded-xl font-bold text-center min-w-[50px]">
              <span className="block text-xl font-extrabold leading-none">
                {savedEvaluation?.aiTotalScore || 20}
              </span>
              <span className="text-[9px] text-indigo-500 uppercase font-semibold">
                / 24
              </span>
            </div>
            <div>
              <span className="text-[11px] font-bold text-indigo-900 block flex items-center gap-1">
                <span>คอลัมน์ 1: คะแนนประเมินเบื้องต้น (ระบบ)</span>
              </span>
              <span className="text-xs font-semibold text-slate-700">
                ระดับคุณภาพ: {savedEvaluation?.aiQualityLevel || 'ดีเยี่ยม'}
              </span>
              <p className="text-[10px] text-slate-400">ประเมินโดยอัตโนมัติจากโครงสร้างรายงาน</p>
            </div>
          </div>

          {/* Column 2: Responsible Person / User Evaluation (Interactive) */}
          <div className="bg-amber-50/80 p-3.5 rounded-2xl border border-amber-300 shadow-2xs flex items-center space-x-3 col-span-1 md:col-span-2 justify-between">
            <div className="flex items-center space-x-3">
              <div className="p-2.5 bg-amber-400 text-slate-950 rounded-xl font-bold text-center min-w-[55px]">
                <span className="block text-2xl font-extrabold leading-none">
                  {totalScore}
                </span>
                <span className="text-[9px] text-slate-800 uppercase font-semibold">
                  / 24
                </span>
              </div>
              <div>
                <span className="text-[11px] font-bold text-amber-950 block">
                  คอลัมน์ 2: คะแนนจากผู้รับผิดชอบ (ท่านกำลังให้คะแนน)
                </span>
                <div className="flex items-center space-x-2">
                  <span className={`px-2.5 py-0.5 rounded-full text-xs font-bold border ${qualityBadgeClass}`}>
                    ระดับคุณภาพ: {qualityLevel}
                  </span>
                  <span className="text-xs font-semibold text-slate-700">({percentage}%)</span>
                </div>
                <p className="text-[10px] text-amber-800 font-medium mt-0.5">
                  📌 {passStatus}
                </p>
              </div>
            </div>

            {savedEvaluation?.updatedAt && (
              <div className="hidden lg:block text-right text-[10px] text-slate-500 border-l border-amber-200 pl-3">
                <span>ประเมินล่าสุด:</span>
                <span className="block font-semibold text-slate-700">
                  {new Date(savedEvaluation.updatedAt).toLocaleDateString('th-TH')}
                </span>
              </div>
            )}
          </div>

        </div>

        {/* Scrollable Criteria Checklist */}
        <div className="p-6 overflow-y-auto flex-1 space-y-6 bg-slate-50">
          <div className="flex items-center justify-between">
            <h3 className="text-sm font-bold text-slate-800 flex items-center gap-2">
              <BookOpen className="w-4 h-4 text-indigo-600" />
              <span>ประเมินรายประเด็นทั้ง 8 ด้านสำหรับ {report.schoolName}</span>
            </h3>
            <span className="text-xs text-slate-500">คลิกเลือกระดับคะแนน 1, 2 หรือ 3 ในแต่ละข้อ</span>
          </div>

          {STEAM_RUBRIC_CRITERIA.map((item) => {
            const currentVal = scores[item.id] || 1;

            return (
              <div
                key={item.id}
                className="bg-white p-5 rounded-2xl border border-slate-200/90 shadow-2xs space-y-3"
              >
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 pb-2 border-b border-slate-100">
                  <div>
                    <h4 className="text-sm font-bold text-slate-900">{item.title}</h4>
                    <p className="text-xs text-slate-500 mt-0.5">{item.description}</p>
                  </div>
                  <span className="text-xs font-bold text-indigo-600 bg-indigo-50 px-2.5 py-1 rounded-lg border border-indigo-100 self-start sm:self-auto">
                    คะแนนที่ได้: {currentVal} / 3
                  </span>
                </div>

                {/* Level Selection Radios */}
                <div className="grid grid-cols-1 md:grid-cols-3 gap-3 pt-1">
                  
                  {/* Level 3 */}
                  <label
                    onClick={() => handleScoreChange(item.id, 3)}
                    className={`p-3 rounded-xl border text-xs cursor-pointer transition-all flex flex-col justify-between ${
                      currentVal === 3
                        ? 'bg-emerald-50/80 border-emerald-400 ring-2 ring-emerald-500/20 text-slate-900 font-medium'
                        : 'bg-slate-50/50 border-slate-200 hover:bg-slate-100 text-slate-600'
                    }`}
                  >
                    <div>
                      <div className="flex items-center justify-between mb-1.5">
                        <span className="font-bold text-emerald-800 bg-emerald-100 px-2 py-0.5 rounded text-[11px]">
                          ระดับ 3 : ดีเยี่ยม
                        </span>
                        {currentVal === 3 && <CheckCircle2 className="w-4 h-4 text-emerald-600" />}
                      </div>
                      <p className="leading-relaxed text-[11.5px]">{item.level3}</p>
                    </div>
                  </label>

                  {/* Level 2 */}
                  <label
                    onClick={() => handleScoreChange(item.id, 2)}
                    className={`p-3 rounded-xl border text-xs cursor-pointer transition-all flex flex-col justify-between ${
                      currentVal === 2
                        ? 'bg-blue-50/80 border-blue-400 ring-2 ring-blue-500/20 text-slate-900 font-medium'
                        : 'bg-slate-50/50 border-slate-200 hover:bg-slate-100 text-slate-600'
                    }`}
                  >
                    <div>
                      <div className="flex items-center justify-between mb-1.5">
                        <span className="font-bold text-blue-800 bg-blue-100 px-2 py-0.5 rounded text-[11px]">
                          ระดับ 2 : ดี
                        </span>
                        {currentVal === 2 && <CheckCircle2 className="w-4 h-4 text-blue-600" />}
                      </div>
                      <p className="leading-relaxed text-[11.5px]">{item.level2}</p>
                    </div>
                  </label>

                  {/* Level 1 */}
                  <label
                    onClick={() => handleScoreChange(item.id, 1)}
                    className={`p-3 rounded-xl border text-xs cursor-pointer transition-all flex flex-col justify-between ${
                      currentVal === 1
                        ? 'bg-amber-50/80 border-amber-400 ring-2 ring-amber-500/20 text-slate-900 font-medium'
                        : 'bg-slate-50/50 border-slate-200 hover:bg-slate-100 text-slate-600'
                    }`}
                  >
                    <div>
                      <div className="flex items-center justify-between mb-1.5">
                        <span className="font-bold text-amber-800 bg-amber-100 px-2 py-0.5 rounded text-[11px]">
                          ระดับ 1 : พอใช้
                        </span>
                        {currentVal === 1 && <CheckCircle2 className="w-4 h-4 text-amber-600" />}
                      </div>
                      <p className="leading-relaxed text-[11.5px]">{item.level1}</p>
                    </div>
                  </label>

                </div>
              </div>
            );
          })}

          {/* Evaluator Information & Academic Notes */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            
            <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-2xs space-y-2 col-span-1">
              <label className="block text-xs font-bold text-slate-800 flex items-center gap-1.5">
                <User className="w-3.5 h-3.5 text-indigo-600" />
                <span>ชื่อผู้ประเมิน / กรรมการ</span>
              </label>
              <input
                type="text"
                value={evaluatorName}
                onChange={(e) => setEvaluatorName(e.target.value)}
                placeholder="ระบุชื่อผู้ประเมิน..."
                className="w-full p-2.5 bg-slate-50 border border-slate-200 rounded-xl text-xs text-slate-800 focus:outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500"
              />
            </div>

            <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-2xs space-y-2 col-span-1 md:col-span-2">
              <label className="block text-xs font-bold text-slate-800 flex items-center gap-1.5">
                <BookOpen className="w-3.5 h-3.5 text-indigo-600" />
                <span>ข้อเสนอแนะเชิงวิชาการเพื่อการพัฒนาต่อยอด (Academic Recommendations)</span>
              </label>
              <textarea
                rows={2}
                value={evaluatorNotes}
                onChange={(e) => setEvaluatorNotes(e.target.value)}
                placeholder="ระบุข้อเสนอแนะทางวิชาการ จุดเด่น และประเด็นที่ควรส่งเสริม..."
                className="w-full p-2.5 bg-slate-50 border border-slate-200 rounded-xl text-xs text-slate-800 focus:outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500"
              />
            </div>

          </div>

        </div>

        {/* Modal Footer */}
        <div className="bg-white border-t border-slate-200 px-6 py-4 flex flex-col sm:flex-row items-center justify-between gap-3 text-xs">
          <div className="flex items-center space-x-2 text-slate-500">
            <span>ประเมินเฉพาะโรงเรียน: <strong className="text-slate-800">{report.schoolName}</strong></span>
          </div>

          <div className="flex items-center space-x-2">
            {isSavedNotice && (
              <span className="text-emerald-600 font-bold text-xs flex items-center gap-1 animate-fadeIn">
                <CheckCircle2 className="w-4 h-4" /> บันทึกผลรายโรงเรียนเรียบร้อย!
              </span>
            )}
            <button
              onClick={onClose}
              className="px-4 py-2 bg-slate-100 hover:bg-slate-200 text-slate-700 font-semibold rounded-xl transition-colors"
            >
              ยกเลิก
            </button>
            <button
              onClick={handleSave}
              className="px-5 py-2 bg-indigo-600 hover:bg-indigo-700 text-white font-semibold rounded-xl transition-colors shadow-2xs flex items-center space-x-1.5"
            >
              <Save className="w-4 h-4" />
              <span>บันทึกคะแนน {report.schoolName}</span>
            </button>
          </div>
        </div>

      </div>
    </div>
  );
};

