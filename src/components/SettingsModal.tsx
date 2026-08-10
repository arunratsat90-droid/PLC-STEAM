import React, { useState } from 'react';
import { X, Settings, Link, RefreshCw, CheckCircle2 } from 'lucide-react';

interface SettingsModalProps {
  isOpen: boolean;
  currentSheetUrl: string;
  onClose: () => void;
  onSaveSheetUrl: (newUrl: string) => void;
}

const DEFAULT_URL = 'https://docs.google.com/spreadsheets/d/15oVvMev4APIW-6xNdh2igbjRGHzS6HJ9SV0KQnEbYD0/edit?usp=sharing';

export const SettingsModal: React.FC<SettingsModalProps> = ({
  isOpen,
  currentSheetUrl,
  onClose,
  onSaveSheetUrl,
}) => {
  const [inputUrl, setInputUrl] = useState(currentSheetUrl);
  const [savedSuccess, setSavedSuccess] = useState(false);

  if (!isOpen) return null;

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (inputUrl.trim()) {
      onSaveSheetUrl(inputUrl.trim());
      setSavedSuccess(true);
      setTimeout(() => {
        setSavedSuccess(false);
        onClose();
      }, 1000);
    }
  };

  const handleResetDefault = () => {
    setInputUrl(DEFAULT_URL);
  };

  return (
    <div className="fixed inset-0 z-50 bg-slate-900/60 backdrop-blur-xs flex items-center justify-center p-4 animate-fadeIn">
      <div className="bg-white rounded-2xl shadow-xl border border-slate-200 max-w-lg w-full p-6 overflow-hidden relative">
        
        <div className="flex items-center justify-between pb-4 border-b border-slate-100 mb-5">
          <div className="flex items-center space-x-2.5">
            <div className="p-2 bg-indigo-50 text-indigo-600 rounded-lg">
              <Settings className="w-5 h-5" />
            </div>
            <div>
              <h3 className="text-lg font-bold text-slate-900">
                ตั้งค่าแหล่งข้อมูล Google Sheet
              </h3>
              <p className="text-xs text-slate-500">
                ระบบจะดึงข้อมูล live และอัปเดตแบบเรียลไทม์อัตโนมัติ
              </p>
            </div>
          </div>

          <button
            onClick={onClose}
            className="p-1.5 text-slate-400 hover:text-slate-600 rounded-lg hover:bg-slate-100"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="block text-xs font-semibold text-slate-700 mb-1.5 flex items-center space-x-1">
              <Link className="w-3.5 h-3.5 text-slate-400" />
              <span>URL ไฟล์ Google Sheet (แชร์แบบทุกคนที่มีลิงก์อ่านได้)</span>
            </label>
            <textarea
              rows={3}
              value={inputUrl}
              onChange={(e) => setInputUrl(e.target.value)}
              placeholder="https://docs.google.com/spreadsheets/d/.../edit"
              className="w-full p-3 bg-slate-50 border border-slate-200 rounded-xl text-xs sm:text-sm text-slate-800 focus:outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500 font-mono"
            />
          </div>

          <div className="flex items-center justify-between pt-2">
            <button
              type="button"
              onClick={handleResetDefault}
              className="text-xs text-indigo-600 hover:text-indigo-800 font-medium underline flex items-center space-x-1"
            >
              <RefreshCw className="w-3.5 h-3.5" />
              <span>รีเซ็ตเป็นลิงก์เริ่มต้น</span>
            </button>

            {savedSuccess && (
              <span className="inline-flex items-center gap-1 text-xs text-emerald-600 font-medium bg-emerald-50 px-2.5 py-1 rounded-md border border-emerald-200">
                <CheckCircle2 className="w-3.5 h-3.5" />
                บันทึกสำเร็จ
              </span>
            )}
          </div>

          <div className="pt-4 border-t border-slate-100 flex items-center justify-end space-x-2">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 bg-slate-100 hover:bg-slate-200 text-slate-700 text-xs font-semibold rounded-xl transition-colors"
            >
              ยกเลิก
            </button>
            <button
              type="submit"
              className="px-5 py-2 bg-indigo-600 hover:bg-indigo-700 text-white text-xs font-semibold rounded-xl transition-colors shadow-2xs"
            >
              บันทึกการตั้งค่า
            </button>
          </div>
        </form>

      </div>
    </div>
  );
};
