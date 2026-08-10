import React, { useEffect } from 'react';
import { X, ExternalLink, Download, Maximize2 } from 'lucide-react';

interface LightboxModalProps {
  imageUrl: string | null;
  title: string | null;
  onClose: () => void;
}

export const LightboxModal: React.FC<LightboxModalProps> = ({
  imageUrl,
  title,
  onClose,
}) => {
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape') onClose();
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [onClose]);

  if (!imageUrl) return null;

  return (
    <div className="fixed inset-0 z-50 bg-black/90 backdrop-blur-md flex flex-col justify-between p-4 sm:p-6 animate-fadeIn">
      {/* Lightbox Header */}
      <div className="flex items-center justify-between text-white border-b border-white/10 pb-4 z-10">
        <div className="flex items-center space-x-2">
          <Maximize2 className="w-5 h-5 text-indigo-400" />
          <h3 className="text-base sm:text-lg font-bold tracking-tight text-white line-clamp-1">
            {title || 'ภาพตัวอย่างเอกสารแนบ'}
          </h3>
        </div>

        <div className="flex items-center space-x-3">
          <a
            href={imageUrl}
            target="_blank"
            rel="noopener noreferrer"
            download
            className="p-2 bg-white/10 hover:bg-white/20 text-white rounded-xl transition-colors"
            title="เปิดรูปภาพในแท็บใหม่"
          >
            <ExternalLink className="w-5 h-5" />
          </a>

          <button
            onClick={onClose}
            className="p-2 bg-white/10 hover:bg-white/20 text-white rounded-xl transition-colors"
            title="ปิด (Esc)"
          >
            <X className="w-5 h-5" />
          </button>
        </div>
      </div>

      {/* Main Image Stage */}
      <div className="flex-1 flex items-center justify-center py-4 my-auto overflow-hidden">
        <img
          src={imageUrl}
          alt={title || 'Document preview'}
          className="max-h-[85vh] max-w-[95vw] object-contain rounded-lg shadow-2xl transition-transform duration-200"
        />
      </div>

      {/* Lightbox Footer */}
      <div className="text-center text-xs text-white/60 pt-2 border-t border-white/10 z-10">
        <span>กด Esc เพื่อปิดหน้าต่าง | ภาพตัวอย่างความละเอียดสูง</span>
      </div>
    </div>
  );
};
