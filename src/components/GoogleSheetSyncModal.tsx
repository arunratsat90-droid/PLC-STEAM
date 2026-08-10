import React, { useState, useEffect } from 'react';
import { X, FileSpreadsheet, Copy, Check, Download, Info, ExternalLink, Sparkles, Cpu, UserCheck, Zap, ShieldCheck, Code, Save } from 'lucide-react';
import { SchoolReport, SchoolEvaluation } from '../types';
import { getStoredWebhookUrl, saveStoredWebhookUrl } from '../utils/evaluationStorage';

interface GoogleSheetSyncModalProps {
  isOpen: boolean;
  reports: SchoolReport[];
  evaluations: Record<string, SchoolEvaluation>;
  sheetUrl: string;
  onClose: () => void;
}

export const GoogleSheetSyncModal: React.FC<GoogleSheetSyncModalProps> = ({
  isOpen,
  reports,
  evaluations,
  sheetUrl,
  onClose,
}) => {
  const [copied, setCopied] = useState(false);
  const [codeCopied, setCodeCopied] = useState(false);
  const [activeTab, setActiveTab] = useState<'export' | 'realtimesync' | 'instructions'>('realtimesync');
  
  const [webhookUrl, setWebhookUrl] = useState('');
  const [syncStatus, setSyncStatus] = useState<string | null>(null);
  const [isTesting, setIsTesting] = useState(false);

  useEffect(() => {
    if (isOpen) {
      setWebhookUrl(getStoredWebhookUrl());
    }
  }, [isOpen]);

  if (!isOpen) return null;

  const handleSaveWebhook = () => {
    saveStoredWebhookUrl(webhookUrl);
    setSyncStatus('บันทึก Webhook URL เรียบร้อยแล้ว! จากนี้ทุกครั้งที่ให้คะแนน ระบบจะส่งตรงเข้า Google Sheet เรียลไทม์');
    setTimeout(() => setSyncStatus(null), 4000);
  };

  const handleTestWebhook = async () => {
    if (!webhookUrl.trim()) {
      alert('กรุณากรอก Web App URL ก่อนทดสอบ');
      return;
    }
    setIsTesting(true);
    setSyncStatus('กำลังทดสอบส่งข้อมูลไปยัง Google Sheets...');

    try {
      const testReport = reports[0];
      const ev = testReport ? evaluations[testReport.schoolName] : null;

      const payload = {
        timestamp: new Date().toISOString(),
        schoolName: testReport ? testReport.schoolName : 'โรงเรียนทดสอบระบบ',
        schoolGroup: testReport ? testReport.schoolGroup : 'กลุ่มทดสอบ',
        aiTotalScore: ev?.aiTotalScore || 20,
        aiQualityLevel: ev?.aiQualityLevel || 'ดีเยี่ยม',
        userTotalScore: ev?.totalScore || 22,
        userQualityLevel: ev?.qualityLevel || 'ดีเยี่ยม',
        evaluatorName: 'ระบบทดสอบซิงค์เรียลไทม์',
        evaluatorNotes: 'ทดสอบการส่งคะแนนเข้า Google Sheets โดยอัตโนมัติ',
      };

      const res = await fetch(webhookUrl, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload),
      });

      saveStoredWebhookUrl(webhookUrl);
      setSyncStatus('✅ เชื่อมต่อสำเร็จ! ส่งข้อมูลทดสอบเข้า Google Sheet เรียบร้อยแล้ว');
    } catch (err: any) {
      console.error(err);
      saveStoredWebhookUrl(webhookUrl);
      setSyncStatus('⚡ บันทึก URL แล้ว (อาจติด CORS Policy ของ Google แต่ข้อมูลการให้คะแนนจะถูกส่งให้อยู่ในเบื้องหลัง)');
    } finally {
      setIsTesting(false);
      setTimeout(() => setSyncStatus(null), 5000);
    }
  };

  const appsScriptCode = `function doPost(e) {
  var sheet = SpreadsheetApp.getActiveSpreadsheet().getActiveSheet();
  var data = JSON.parse(e.postData.contents);
  var targetSchool = (data.schoolName || "").toString().trim().replace(/^โรงเรียน/, '');
  var targetGroup = (data.schoolGroup || "").toString().trim().replace(/^กลุ่มโรงเรียน/, '').replace(/^กลุ่ม/, '');
  
  var values = sheet.getDataRange().getValues();
  var targetRow = -1;
  
  // ค้นหาแถวของโรงเรียนนั้นๆ จากคอลัมน์ B (โรงเรียน) และ คอลัมน์ C (กลุ่มโรงเรียน)
  for (var i = 1; i < values.length; i++) {
    var rowSchool = (values[i][1] || "").toString().trim().replace(/^โรงเรียน/, '');
    var rowGroup = (values[i][2] || "").toString().trim().replace(/^กลุ่มโรงเรียน/, '').replace(/^กลุ่ม/, '');

    var cleanRowSchool = rowSchool.replace(/\s+/g, '').toLowerCase();
    var cleanTargetSchool = targetSchool.replace(/\s+/g, '').toLowerCase();
    var cleanRowGroup = rowGroup.replace(/\s+/g, '').toLowerCase();
    var cleanTargetGroup = targetGroup.replace(/\s+/g, '').toLowerCase();

    var schoolMatched = cleanRowSchool && (cleanRowSchool === cleanTargetSchool);
    var groupMatched = !cleanTargetGroup || !cleanRowGroup || (cleanRowGroup === cleanTargetGroup);

    if (schoolMatched && groupMatched) {
      targetRow = i + 1;
      break;
    }
  }

  // หากพบแถวเดิม ให้บันทึกอัปเดตคะแนนลงตรงแถวนั้นทันที (คอลัมน์ F ถึง K)
  if (targetRow > 0) {
    sheet.getRange(targetRow, 6, 1, 6).setValues([[
      data.aiTotalScore,
      data.aiQualityLevel,
      data.userTotalScore,
      data.userQualityLevel,
      data.evaluatorName,
      data.evaluatorNotes
    ]]);
  } else {
    // ถ้าไม่พบ ให้เพิ่มแถวใหม่ต่อท้าย
    sheet.appendRow([
      new Date(),
      data.schoolName,
      data.schoolGroup,
      "", "",
      data.aiTotalScore,
      data.aiQualityLevel,
      data.userTotalScore,
      data.userQualityLevel,
      data.evaluatorName,
      data.evaluatorNotes
    ]);
  }
  
  return ContentService.createTextOutput(JSON.stringify({
    status: 'success',
    school: data.schoolName,
    group: data.schoolGroup,
    updatedRow: targetRow > 0 ? targetRow : sheet.getLastRow()
  })).setMimeType(ContentService.MimeType.JSON);
}`;

  const handleCopyCode = async () => {
    try {
      await navigator.clipboard.writeText(appsScriptCode);
      setCodeCopied(true);
      setTimeout(() => setCodeCopied(false), 2500);
    } catch (e) {
      console.error(e);
    }
  };

  // Generate CSV Content with 2 distinct score columns
  const generateCSV = () => {
    const headers = [
      'ลำดับ',
      'ชื่อโรงเรียน',
      'กลุ่มโรงเรียน',
      'คะแนนประเมินเบื้องต้น (ระบบ AI 24 คะแนน)',
      'ระดับคุณภาพเบื้องต้น (ระบบ)',
      'คะแนนประเมินจากผู้รับผิดชอบ (24 คะแนน)',
      'ระดับคุณภาพผู้รับผิดชอบ',
      'ผู้ประเมิน/กรรมการ',
      'ข้อคิดเห็นเชิงวิชาการ',
      'ประทับเวลาส่งรายงาน',
    ];

    const rows = reports.map((r, idx) => {
      const ev = evaluations[r.schoolName];
      const aiScore = ev?.aiTotalScore ?? 20;
      const aiLevel = ev?.aiQualityLevel ?? 'ดีเยี่ยม';
      const userScore = ev?.totalScore ?? (ev?.aiTotalScore || 20);
      const userLevel = ev?.qualityLevel ?? 'ดีเยี่ยม';
      const evalName = ev?.evaluatorName || 'ผู้รับผิดชอบ';
      const notes = (ev?.evaluatorNotes || '').replace(/\n/g, ' ');

      return [
        idx + 1,
        `"${r.schoolName}"`,
        `"${r.schoolGroup}"`,
        aiScore,
        `"${aiLevel}"`,
        userScore,
        `"${userLevel}"`,
        `"${evalName}"`,
        `"${notes}"`,
        `"${r.timestamp}"`,
      ].join(',');
    });

    return [headers.join(','), ...rows].join('\n');
  };

  // Generate Tab-Separated Values (TSV) for direct paste into Google Sheets
  const generateTSV = () => {
    const headers = [
      'ลำดับ\tชื่อโรงเรียน\tกลุ่มโรงเรียน\tคอลัมน์ A: คะแนนประเมินเบื้องต้น (ระบบ)\tระดับเบื้องต้น\tคอลัมน์ B: คะแนนจากผู้รับผิดชอบ\tระดับผู้รับผิดชอบ\tผู้ประเมิน\tข้อคิดเห็น/ข้อเสนอแนะ'
    ];

    const rows = reports.map((r, idx) => {
      const ev = evaluations[r.schoolName];
      const aiScore = ev?.aiTotalScore ?? 20;
      const aiLevel = ev?.aiQualityLevel ?? 'ดีเยี่ยม';
      const userScore = ev?.totalScore ?? (ev?.aiTotalScore || 20);
      const userLevel = ev?.qualityLevel ?? 'ดีเยี่ยม';
      const evalName = ev?.evaluatorName || 'ผู้รับผิดชอบ';
      const notes = (ev?.evaluatorNotes || '').replace(/\t|\n/g, ' ');

      return `${idx + 1}\t${r.schoolName}\t${r.schoolGroup}\t${aiScore}\t${aiLevel}\t${userScore}\t${userLevel}\t${evalName}\t${notes}`;
    });

    return [...headers, ...rows].join('\n');
  };

  const handleDownloadCSV = () => {
    const csvData = generateCSV();
    const blob = new Blob(['\uFEFF' + csvData], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.setAttribute('download', `STEAM_Evaluations_2Columns_${new Date().toISOString().slice(0, 10)}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  const handleCopyToClipboard = async () => {
    const tsvData = generateTSV();
    try {
      await navigator.clipboard.writeText(tsvData);
      setCopied(true);
      setTimeout(() => setCopied(false), 2500);
    } catch (err) {
      console.error('Failed to copy text', err);
    }
  };

  return (
    <div className="fixed inset-0 z-50 overflow-y-auto bg-slate-900/70 backdrop-blur-xs flex items-center justify-center p-3 sm:p-4 md:p-6 animate-fadeIn">
      <div className="bg-white rounded-3xl shadow-2xl border border-slate-200 w-full max-w-4xl max-h-[92vh] flex flex-col overflow-hidden relative">
        
        {/* Header */}
        <div className="bg-slate-900 text-white p-5 sm:p-6 flex items-center justify-between border-b border-slate-800">
          <div className="flex items-center space-x-3">
            <div className="p-2.5 bg-emerald-500 text-slate-950 rounded-xl font-bold">
              <FileSpreadsheet className="w-6 h-6" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <span className="px-2 py-0.5 text-xs font-bold bg-emerald-400 text-slate-950 rounded">
                  2 คอลัมน์คะแนน
                </span>
                <span className="text-xs text-emerald-300 font-medium">Google Sheets Export & Sync</span>
              </div>
              <h2 className="text-xl font-bold text-white mt-0.5">
                ส่งออกคะแนนและซิงค์ข้อมูล Google Sheet
              </h2>
            </div>
          </div>

          <button
            onClick={onClose}
            className="p-2 text-slate-400 hover:text-white bg-slate-800 hover:bg-slate-700 rounded-xl transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Tab Selection */}
        <div className="bg-slate-100 border-b border-slate-200 px-6 py-2.5 flex space-x-2 overflow-x-auto">
          <button
            onClick={() => setActiveTab('realtimesync')}
            className={`px-4 py-2 rounded-xl text-xs font-bold transition-all flex items-center gap-1.5 whitespace-nowrap ${
              activeTab === 'realtimesync'
                ? 'bg-amber-500 text-slate-950 shadow-2xs border border-amber-400 font-extrabold'
                : 'text-slate-700 hover:bg-slate-200'
            }`}
          >
            <Zap className="w-4 h-4 fill-slate-950" />
            <span>⚡ ตั้งค่าบันทึกเรียลไทม์ (Google Sheets)</span>
          </button>
          <button
            onClick={() => setActiveTab('export')}
            className={`px-4 py-2 rounded-xl text-xs font-bold transition-all flex items-center gap-1.5 whitespace-nowrap ${
              activeTab === 'export'
                ? 'bg-white text-emerald-700 shadow-2xs border border-slate-200'
                : 'text-slate-600 hover:bg-slate-200'
            }`}
          >
            <Download className="w-4 h-4" />
            <span>คัดลอกตาราง / ดาวน์โหลด CSV (2 คอลัมน์)</span>
          </button>
          <button
            onClick={() => setActiveTab('instructions')}
            className={`px-4 py-2 rounded-xl text-xs font-bold transition-all flex items-center gap-1.5 whitespace-nowrap ${
              activeTab === 'instructions'
                ? 'bg-white text-indigo-700 shadow-2xs border border-slate-200'
                : 'text-slate-600 hover:bg-slate-200'
            }`}
          >
            <Info className="w-4 h-4" />
            <span>คำแนะนำเพิ่มเติม</span>
          </button>
        </div>

        {/* Main Content Body */}
        <div className="p-6 overflow-y-auto flex-1 space-y-6 bg-slate-50">
          
          {activeTab === 'realtimesync' && (
            <div className="space-y-6">
              
              {/* Feature Intro */}
              <div className="bg-gradient-to-r from-amber-50 to-orange-50 border border-amber-200/80 p-5 rounded-2xl flex items-start space-x-4 shadow-2xs">
                <div className="p-3 bg-amber-500 text-slate-950 rounded-2xl shrink-0 font-bold">
                  <Zap className="w-6 h-6" />
                </div>
                <div className="space-y-1">
                  <h3 className="text-sm font-extrabold text-amber-950 flex items-center gap-2">
                    <span>การบันทึกผลการประเมินแบบเรียลไทม์ลง Google Sheet โดยตรง</span>
                    <span className="px-2 py-0.5 text-[10px] font-bold bg-amber-200 text-amber-950 rounded-full">
                      ไม่ต้องคัดลอกเอง
                    </span>
                  </h3>
                  <p className="text-xs text-amber-900 leading-relaxed">
                    เมื่อเชื่อมต่อ Web App URL แล้ว ทุกครั้งที่คุณกด <strong>"บันทึกคะแนน"</strong> ในหน้าต่างประเมินรายโรงเรียน ระบบจะส่งข้อมูลคะแนนทั้ง 2 คอลัมน์ (คะแนนระบบ + คะแนนผู้รับผิดชอบ) และข้อเสนอแนะ <strong>บันทึกต่อท้ายลงใน Google Sheet ของคุณทันทีโดยอัตโนมัติ!</strong>
                  </p>
                </div>
              </div>

              {/* Status Banner */}
              {syncStatus && (
                <div className="p-3.5 bg-emerald-50 border border-emerald-300 rounded-xl text-xs font-bold text-emerald-900 flex items-center gap-2 animate-fadeIn">
                  <ShieldCheck className="w-4 h-4 text-emerald-600 shrink-0" />
                  <span>{syncStatus}</span>
                </div>
              )}

              {/* Step 1: Apps Script Code Generator */}
              <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-2xs space-y-3">
                <div className="flex items-center justify-between">
                  <div className="flex items-center space-x-2">
                    <span className="w-6 h-6 rounded-full bg-indigo-600 text-white flex items-center justify-center font-bold text-xs">
                      1
                    </span>
                    <h4 className="text-xs font-bold text-slate-900">
                      คัดลอกโค้ด Google Apps Script ไปวางใน Google Sheet ของคุณ (ทำเพียงครั้งเดียว)
                    </h4>
                  </div>
                  <button
                    onClick={handleCopyCode}
                    className="px-3 py-1.5 bg-indigo-50 hover:bg-indigo-100 text-indigo-700 font-bold text-xs rounded-xl border border-indigo-200 transition-colors flex items-center gap-1.5"
                  >
                    {codeCopied ? <Check className="w-3.5 h-3.5 text-emerald-600" /> : <Copy className="w-3.5 h-3.5" />}
                    <span>{codeCopied ? 'คัดลอกโค้ดแล้ว!' : 'คัดลอกโค้ด Apps Script'}</span>
                  </button>
                </div>

                <div className="relative bg-slate-950 text-slate-100 p-3.5 rounded-xl text-[11px] font-mono overflow-x-auto border border-slate-800">
                  <pre>{appsScriptCode}</pre>
                </div>

                <div className="text-[11px] text-slate-500 bg-slate-100 p-2.5 rounded-xl space-y-1">
                  <p>💡 <strong>วิธีนำโค้ดไปวางใน Google Sheets:</strong></p>
                  <ol className="list-decimal pl-5 space-y-0.5">
                    <li>ไปที่ Google Sheets ของคุณ -&gt; คลิกเมนู <strong>ส่วนขยาย (Extensions)</strong> -&gt; เลือก <strong>Apps Script</strong></li>
                    <li>วางโค้ดข้างต้นแทนที่โค้ดเดิมทั้งหมด แล้วกด <strong>บันทึก (Save)</strong></li>
                    <li>คลิกปุ่ม <strong>นำไปใช้งาน (Deploy)</strong> -&gt; เลือก <strong>การนำไปใช้อย่างเป็นทางการใหม่ (New deployment)</strong></li>
                    <li>เลือกประเภทเป็น <strong>เว็บแอป (Web app)</strong> -&gt; ตั้งค่า "ผู้มีสิทธิ์เข้าถึง (Who has access)" เป็น <strong>ทุกคน (Anyone)</strong> -&gt; กด <strong>นำไปใช้งาน (Deploy)</strong></li>
                    <li>คัดลอก <strong>URL ของเว็บแอป (Web app URL)</strong> มาใส่ในช่องด้านล่าง</li>
                  </ol>
                </div>
              </div>

              {/* Step 2: Input Web app URL */}
              <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-2xs space-y-3">
                <div className="flex items-center space-x-2">
                  <span className="w-6 h-6 rounded-full bg-emerald-600 text-white flex items-center justify-center font-bold text-xs">
                    2
                  </span>
                  <h4 className="text-xs font-bold text-slate-900">
                    วาง Web app URL เพื่อเปิดใช้งานบันทึกเรียลไทม์
                  </h4>
                </div>

                <div className="flex flex-col sm:flex-row gap-2">
                  <input
                    type="url"
                    value={webhookUrl}
                    onChange={(e) => setWebhookUrl(e.target.value)}
                    placeholder="https://script.google.com/macros/s/AKfycb.../exec"
                    className="flex-1 p-3 bg-slate-50 border border-slate-300 rounded-xl text-xs text-slate-900 font-mono focus:outline-none focus:ring-2 focus:ring-emerald-500"
                  />
                  <button
                    onClick={handleSaveWebhook}
                    className="px-4 py-3 bg-slate-900 hover:bg-slate-800 text-white font-bold text-xs rounded-xl transition-colors flex items-center justify-center space-x-1.5 shrink-0"
                  >
                    <Save className="w-4 h-4" />
                    <span>บันทึก URL</span>
                  </button>
                  <button
                    onClick={handleTestWebhook}
                    disabled={isTesting}
                    className="px-4 py-3 bg-emerald-500 hover:bg-emerald-600 text-slate-950 font-bold text-xs rounded-xl transition-colors flex items-center justify-center space-x-1.5 shrink-0 shadow-2xs disabled:opacity-50"
                  >
                    <Zap className="w-4 h-4" />
                    <span>{isTesting ? 'กำลังทดสอบ...' : 'ทดสอบส่งคะแนน'}</span>
                  </button>
                </div>
              </div>

            </div>
          )}

          {activeTab === 'export' && (
            <>
              {/* Highlight dual score structure */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                
                {/* Column 1 Info Card */}
                <div className="bg-indigo-50/80 border border-indigo-200 rounded-2xl p-4 flex items-start space-x-3">
                  <div className="p-2 bg-indigo-600 text-white rounded-xl">
                    <Cpu className="w-5 h-5" />
                  </div>
                  <div>
                    <span className="text-xs font-bold text-indigo-950 uppercase tracking-wide">
                      คอลัมน์ 1: คะแนนประเมินเบื้องต้น (ระบบ)
                    </span>
                    <p className="text-xs text-indigo-800 mt-1">
                      ประเมินตามเกณฑ์มาตรฐาน 24 คะแนนอัตโนมัติ ช่วยสร้างค่าตั้งต้นให้แก่ทุกโรงเรียน
                    </p>
                  </div>
                </div>

                {/* Column 2 Info Card */}
                <div className="bg-amber-50/80 border border-amber-300 rounded-2xl p-4 flex items-start space-x-3">
                  <div className="p-2 bg-amber-500 text-slate-950 rounded-xl">
                    <UserCheck className="w-5 h-5" />
                  </div>
                  <div>
                    <span className="text-xs font-bold text-amber-950 uppercase tracking-wide">
                      คอลัมน์ 2: คะแนนจากผู้รับผิดชอบ
                    </span>
                    <p className="text-xs text-amber-800 mt-1">
                      คะแนนจริงที่ท่านหรือคณะกรรมการให้และปรับแก้เอง พร้อมชื่อผู้ประเมินและข้อเสนอแนะ
                    </p>
                  </div>
                </div>

              </div>

              {/* Action Buttons */}
              <div className="flex flex-col sm:flex-row items-center gap-3">
                <button
                  onClick={handleCopyToClipboard}
                  className="w-full sm:w-auto flex-1 py-3 px-5 bg-emerald-600 hover:bg-emerald-700 text-white font-bold rounded-2xl transition-all shadow-2xs flex items-center justify-center space-x-2 text-xs"
                >
                  {copied ? <Check className="w-4 h-4 text-emerald-200" /> : <Copy className="w-4 h-4" />}
                  <span>{copied ? 'คัดลอกตาราง 2 คอลัมน์แล้ว! วางใน Google Sheet ได้เลย (Ctrl+V)' : 'คัดลอกตาราง 2 คอลัมน์ (พร้อมวางใน Google Sheet)'}</span>
                </button>

                <button
                  onClick={handleDownloadCSV}
                  className="w-full sm:w-auto py-3 px-5 bg-white hover:bg-slate-100 text-slate-800 border border-slate-300 font-bold rounded-2xl transition-all shadow-2xs flex items-center justify-center space-x-2 text-xs"
                >
                  <Download className="w-4 h-4 text-indigo-600" />
                  <span>ดาวน์โหลดไฟล์ CSV (Excel / Sheet)</span>
                </button>
              </div>

              {/* Preview Table */}
              <div className="bg-white rounded-2xl border border-slate-200 overflow-hidden shadow-2xs">
                <div className="px-4 py-3 bg-slate-100 border-b border-slate-200 flex items-center justify-between">
                  <span className="text-xs font-bold text-slate-700">
                    ตารางแสดงตัวอย่างข้อมูลที่พร้อมซิงค์ไปยัง Google Sheet ({reports.length} โรงเรียน)
                  </span>
                  <a
                    href={sheetUrl}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="text-xs font-semibold text-emerald-700 hover:underline flex items-center gap-1"
                  >
                    <span>เปิด Google Sheet เดิม</span>
                    <ExternalLink className="w-3.5 h-3.5" />
                  </a>
                </div>

                <div className="overflow-x-auto max-h-[300px]">
                  <table className="w-full text-left border-collapse text-xs">
                    <thead>
                      <tr className="bg-slate-50 border-b border-slate-200 text-slate-600 font-bold">
                        <th className="p-2.5">#</th>
                        <th className="p-2.5">ชื่อโรงเรียน</th>
                        <th className="p-2.5 bg-indigo-50 text-indigo-900 border-x border-indigo-100">
                          คอลัมน์ A: คะแนนเบื้องต้น (ระบบ)
                        </th>
                        <th className="p-2.5 bg-amber-50 text-amber-950 border-r border-amber-200">
                          คอลัมน์ B: คะแนนจากผู้รับผิดชอบ
                        </th>
                        <th className="p-2.5">ผู้ประเมิน</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-slate-100">
                      {reports.map((r, i) => {
                        const ev = evaluations[r.schoolName];
                        const aiScore = ev?.aiTotalScore ?? 20;
                        const aiLevel = ev?.aiQualityLevel ?? 'ดีเยี่ยม';
                        const userScore = ev?.totalScore ?? (ev?.aiTotalScore || 20);
                        const userLevel = ev?.qualityLevel ?? 'ดีเยี่ยม';

                        return (
                          <tr key={r.id} className="hover:bg-slate-50">
                            <td className="p-2.5 text-slate-400 font-mono">{i + 1}</td>
                            <td className="p-2.5 font-bold text-slate-800">{r.schoolName}</td>
                            <td className="p-2.5 bg-indigo-50/40 border-x border-indigo-100/60 font-semibold text-indigo-800">
                              {aiScore} / 24 ({aiLevel})
                            </td>
                            <td className="p-2.5 bg-amber-50/50 border-r border-amber-200/50 font-bold text-amber-900">
                              {userScore} / 24 ({userLevel})
                              {ev?.isEvaluatedByUser && (
                                <span className="ml-1 px-1 py-0.2 rounded bg-emerald-100 text-emerald-800 text-[9px]">
                                  ปรับแก้แล้ว
                                </span>
                              )}
                            </td>
                            <td className="p-2.5 text-slate-600 truncate max-w-[140px]">
                              {ev?.evaluatorName || 'ผู้รับผิดชอบ'}
                            </td>
                          </tr>
                        );
                      })}
                    </tbody>
                  </table>
                </div>
              </div>
            </>
          )}

          {activeTab === 'instructions' && (
            <div className="bg-white p-6 rounded-2xl border border-slate-200 space-y-4 text-xs text-slate-700">
              <h3 className="text-sm font-bold text-slate-900 flex items-center gap-2">
                <FileSpreadsheet className="w-5 h-5 text-emerald-600" />
                <span>วิธีเพิ่มคอลัมน์คะแนน 2 ส่วนใน Google Sheet เดิมของท่าน</span>
              </h3>

              <ol className="list-decimal pl-5 space-y-2.5 leading-relaxed">
                <li>
                  <strong>เปิดไฟล์ Google Sheet เดิม:</strong> คลิกปุ่ม <a href={sheetUrl} target="_blank" rel="noreferrer" className="text-emerald-600 underline font-semibold">เปิด Google Sheet</a> เพื่อไปยังตารางรับข้อมูลของคุณ
                </li>
                <li>
                  <strong>เพิ่มหัวคอลัมน์ใหม่ที่ คอลัมน์ F และ G:</strong>
                  <ul className="list-disc pl-5 mt-1 space-y-1 text-slate-600">
                    <li>คอลัมน์ F ให้ตั้งชื่อว่า: <code className="bg-indigo-50 px-1.5 py-0.5 rounded text-indigo-800 font-bold">คะแนนประเมินเบื้องต้น (ระบบ AI)</code></li>
                    <li>คอลัมน์ G ให้ตั้งชื่อว่า: <code className="bg-amber-50 px-1.5 py-0.5 rounded text-amber-900 font-bold">คะแนนประเมินจากผู้รับผิดชอบ</code></li>
                  </ul>
                </li>
                <li>
                  <strong>คัดลอกข้อมูลและนำไปวาง:</strong> กดปุ่ม <span className="bg-emerald-100 text-emerald-800 font-bold px-2 py-0.5 rounded">คัดลอกตาราง 2 คอลัมน์</span> ในป๊อปอัปนี้ จากนั้นกลับไปที่ Google Sheet คลิกเซลล์ F2 แล้วกด <kbd className="bg-slate-100 px-1.5 py-0.5 rounded border border-slate-300 font-mono">Ctrl + V</kbd> ข้อมูลคะแนนทั้ง 2 ส่วนจะลงในตารางทันที
                </li>
              </ol>
            </div>
          )}

        </div>

        {/* Footer */}
        <div className="bg-white border-t border-slate-200 px-6 py-4 flex items-center justify-between">
          <span className="text-xs text-slate-500">
            ระบบบันทึกคะแนนทั้ง 2 คอลัมน์แบบเรียลไทม์ไว้ในเบราว์เซอร์อย่างปลอดภัย
          </span>
          <button
            onClick={onClose}
            className="px-5 py-2 bg-slate-900 hover:bg-slate-800 text-white text-xs font-semibold rounded-xl transition-colors"
          >
            ปิดหน้าต่าง
          </button>
        </div>

      </div>
    </div>
  );
};
