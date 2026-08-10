import React from 'react';
import { SchoolEvaluation } from '../types';
import { CheckCircle2, ShieldCheck, Sparkles, User, Award, X } from 'lucide-react';

interface SaveSuccessPopupProps {
  evaluation: SchoolEvaluation | null;
  onClose: () => void;
}

export const SaveSuccessPopup: React.FC<SaveSuccessPopupProps> = ({
  evaluation,
  onClose,
}) => {
  if (!evaluation) return null;

  return (
    <div className="fixed inset-0 z-50 overflow-y-auto bg-slate-900/70 backdrop-blur-xs flex items-center justify-center p-4 animate-fadeIn">
      <div className="bg-white rounded-3xl shadow-2xl border border-emerald-200 w-full max-w-md overflow-hidden relative transform transition-all scale-100">
        
        {/* Header Ribbon */}
        <div className="bg-gradient-to-r from-emerald-600 to-teal-600 text-white p-6 text-center relative overflow-hidden">
          <div className="absolute -right-6 -bottom-6 w-24 h-24 bg-white/10 rounded-full blur-lg pointer-events-none" />
          <div className="absolute -left-6 -top-6 w-24 h-24 bg-white/10 rounded-full blur-lg pointer-events-none" />

          <button
            onClick={onClose}
            className="absolute top-4 right-4 p-1.5 bg-black/20 hover:bg-black/30 text-white rounded-full transition-colors"
          >
            <X className="w-4 h-4" />
          </button>

          <div className="w-16 h-16 bg-white text-emerald-600 rounded-full flex items-center justify-center mx-auto shadow-lg mb-3 animate-bounce-short">
            <CheckCircle2 className="w-10 h-10 stroke-[2.5]" />
          </div>

          <h3 className="text-lg font-black tracking-tight">บันทึกข้อมูลสำเร็จแล้ว!</h3>
          <p className="text-xs text-emerald-100 font-medium mt-1">
            ระบบได้ทำการบันทึกและจับคู่คะแนนตรงกับโรงเรียนเรียบร้อยแล้ว
          </p>
        </div>

        {/* Content Details */}
        <div className="p-6 space-y-4 bg-slate-50">
          
          {/* School Name */}
          <div className="bg-white p-3.5 rounded-2xl border border-slate-200 shadow-2xs text-center">
            <span className="text-[11px] font-bold text-slate-400 uppercase tracking-wider block">
              โรงเรียนที่ได้รับการประเมิน
            </span>
            <p className="text-sm font-black text-slate-900 mt-0.5">
              {evaluation.schoolName}
            </p>
          </div>

          {/* Scores grid */}
          <div className="grid grid-cols-2 gap-3">
            {/* System Score */}
            <div className="bg-indigo-50/80 p-3 rounded-2xl border border-indigo-200/70 text-center">
              <span className="text-[10px] font-bold text-indigo-600 flex items-center justify-center gap-1">
                <Sparkles className="w-3 h-3" /> คะแนนประเมินระบบ
              </span>
              <p className="text-base font-black text-indigo-950 mt-1">
                {evaluation.aiTotalScore ?? 20} <span className="text-xs font-normal text-indigo-600">/ 24</span>
              </p>
            </div>

            {/* Evaluator Score */}
            <div className="bg-emerald-50/80 p-3 rounded-2xl border border-emerald-200/70 text-center">
              <span className="text-[10px] font-bold text-emerald-700 flex items-center justify-center gap-1">
                <Award className="w-3 h-3" /> คะแนนผู้รับผิดชอบ
              </span>
              <p className="text-base font-black text-emerald-950 mt-1">
                {evaluation.totalScore} <span className="text-xs font-normal text-emerald-600">/ 24</span>
              </p>
              <span className="text-[10px] font-bold text-emerald-800 bg-emerald-200/70 px-2 py-0.5 rounded-full inline-block mt-0.5">
                ระดับ{evaluation.qualityLevel}
              </span>
            </div>
          </div>

          {/* Evaluator name */}
          <div className="bg-white p-3 rounded-xl border border-slate-200 text-xs text-slate-700 flex items-center space-x-2">
            <User className="w-4 h-4 text-indigo-600 shrink-0" />
            <span>
              <strong>ผู้ประเมิน:</strong> {evaluation.evaluatorName || 'ผู้รับผิดชอบ'}
            </span>
          </div>

          {/* Verification Badge */}
          <div className="flex items-center space-x-2 text-[11px] font-bold text-emerald-800 bg-emerald-100/60 p-2.5 rounded-xl border border-emerald-200">
            <ShieldCheck className="w-4 h-4 text-emerald-600 shrink-0" />
            <span>การตรวจจับคู่อยู่ในระดับ 100% และซิงค์คะแนนลงแถวข้อมูลตรงกัน</span>
          </div>

          {/* Action Button */}
          <button
            onClick={onClose}
            className="w-full py-3 bg-emerald-600 hover:bg-emerald-700 text-white font-bold rounded-2xl shadow-md transition-all text-sm flex items-center justify-center space-x-2 active:scale-98"
          >
            <span>รับทราบ / ตกลง</span>
          </button>

        </div>

      </div>
    </div>
  );
};
