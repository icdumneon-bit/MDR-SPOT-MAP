import React, { useState } from 'react';
import {
  Share2,
  Copy,
  Check,
  Users,
  ShieldCheck,
  Globe,
  Sparkles,
  X,
  ExternalLink,
  RefreshCw,
  QrCode,
  Smartphone,
  Laptop,
} from 'lucide-react';

interface ShareModalProps {
  isOpen: boolean;
  onClose: () => void;
  casesCount: number;
  wardsCount: number;
  lastSyncTime?: number | null;
  onManualSync?: () => void;
  isSyncing?: boolean;
}

export const ShareModal: React.FC<ShareModalProps> = ({
  isOpen,
  onClose,
  casesCount,
  wardsCount,
  lastSyncTime,
  onManualSync,
  isSyncing = false,
}) => {
  const [copied, setCopied] = useState(false);
  const [showQr, setShowQr] = useState(false);

  if (!isOpen) return null;

  // Use current window location as share URL
  const shareUrl = typeof window !== 'undefined' ? window.location.href : '';

  const handleCopy = async () => {
    try {
      if (navigator.clipboard) {
        await navigator.clipboard.writeText(shareUrl);
      } else {
        const input = document.createElement('input');
        input.value = shareUrl;
        document.body.appendChild(input);
        input.select();
        document.execCommand('copy');
        document.body.removeChild(input);
      }
      setCopied(true);
      setTimeout(() => setCopied(false), 2500);
    } catch (err) {
      console.error('Failed to copy', err);
    }
  };

  const handleNativeShare = async () => {
    if (navigator.share) {
      try {
        await navigator.share({
          title: 'MDR Spot Map Surveillance — ตารางเชื้อดื้อยารายวัน',
          text: `ระบบตาราง Spot Map เชื้อดื้อยาสำหรับร่วมบันทึกและแก้ไขข้อมูล (${casesCount} เคส, ${wardsCount} หน่วยงาน)`,
          url: shareUrl,
        });
      } catch (e) {
        console.log('Share canceled or not supported', e);
      }
    } else {
      handleCopy();
    }
  };

  // Format time
  const formattedSyncTime = lastSyncTime
    ? new Date(lastSyncTime).toLocaleTimeString('th-TH', { hour: '2-digit', minute: '2-digit', second: '2-digit' })
    : 'เมื่อสักครู่';

  return (
    <div className="fixed inset-0 z-50 bg-slate-900/60 backdrop-blur-xs flex items-center justify-center p-3 sm:p-4 overflow-y-auto animate-in fade-in duration-150">
      <div className="bg-white rounded-2xl shadow-2xl max-w-lg w-full overflow-hidden border border-slate-200">
        {/* Header */}
        <div className="bg-gradient-to-r from-teal-700 via-teal-600 to-indigo-700 text-white p-5 relative">
          <button
            onClick={onClose}
            className="absolute right-4 top-4 text-white/80 hover:text-white p-1 rounded-lg hover:bg-white/10 transition-colors"
          >
            <X className="w-5 h-5" />
          </button>

          <div className="flex items-center gap-2.5">
            <div className="w-10 h-10 rounded-xl bg-white/20 backdrop-blur-xs flex items-center justify-center text-white shadow-2xs">
              <Share2 className="w-5 h-5" />
            </div>
            <div>
              <h3 className="text-lg font-extrabold flex items-center gap-2">
                <span>แชร์ลิงก์เปิดสิทธิ์ให้ทุกคนแก้ไขได้</span>
              </h3>
              <p className="text-teal-100 text-xs mt-0.5">
                ทุกคนที่มีลิงก์นี้สามารถเข้ามาดู เพิ่มกล่องเชื้อ และแก้ไขได้ทันที
              </p>
            </div>
          </div>
        </div>

        {/* Body */}
        <div className="p-5 space-y-4">
          {/* Permission Status Box */}
          <div className="p-3.5 bg-emerald-50 border border-emerald-200 rounded-xl flex items-start gap-3">
            <div className="w-8 h-8 rounded-lg bg-emerald-600 text-white flex items-center justify-center shrink-0 mt-0.5 shadow-2xs">
              <ShieldCheck className="w-5 h-5" />
            </div>
            <div className="text-xs">
              <div className="font-bold text-emerald-900 text-sm flex items-center gap-1.5">
                <span>สิทธิ์การใช้งาน: ผู้แก้ไขทั้งหมด (Full Editor Access)</span>
                <span className="w-2 h-2 rounded-full bg-emerald-500 animate-ping" />
              </div>
              <p className="text-emerald-800 mt-1 leading-relaxed">
                ลิงก์นี้เปิดให้ <strong>ทุกคนที่มีลิงก์ (Anyone with link)</strong> สามารถ <strong>เพิ่มกล่องเคส, แก้ไขชื่อเชื้อ, เปลี่ยนสิ่งส่งตรวจ, คัดลอก-วาง และลบเคส</strong> ได้อย่างอิสระ ไม่ใช่โหมดอ่านอย่างเดียว (ไม่ใช่ View-Only)
              </p>
            </div>
          </div>

          {/* Share Link Input Box */}
          <div>
            <label className="block text-xs font-bold text-slate-700 mb-1.5">
              ลิงก์สำหรับแชร์ให้ทีม/หอผู้ป่วย:
            </label>
            <div className="flex items-center gap-2">
              <div className="flex-1 bg-slate-50 border border-slate-300 rounded-xl px-3 py-2 text-xs text-slate-700 font-mono select-all truncate">
                {shareUrl}
              </div>
              <button
                onClick={handleCopy}
                className={`px-4 py-2 rounded-xl text-xs font-bold transition-all shadow-2xs flex items-center gap-1.5 shrink-0 ${
                  copied
                    ? 'bg-emerald-600 text-white ring-2 ring-emerald-400'
                    : 'bg-teal-600 hover:bg-teal-700 text-white'
                }`}
              >
                {copied ? (
                  <>
                    <Check className="w-4 h-4" />
                    <span>คัดลอกสำเร็จ!</span>
                  </>
                ) : (
                  <>
                    <Copy className="w-4 h-4" />
                    <span>คัดลอกลิงก์</span>
                  </>
                )}
              </button>
            </div>
          </div>

          {/* Mobile Native Share / QR Code button */}
          <div className="flex flex-wrap items-center gap-2 pt-1">
            {typeof navigator !== 'undefined' && 'share' in navigator && (
              <button
                onClick={handleNativeShare}
                className="flex-1 text-xs bg-slate-100 hover:bg-slate-200 text-slate-700 font-semibold px-3 py-2 rounded-xl border border-slate-200 transition-colors flex items-center justify-center gap-1.5"
              >
                <Smartphone className="w-4 h-4 text-teal-600" />
                <span>แชร์ผ่าน LINE / แอปอื่น</span>
              </button>
            )}

            <button
              onClick={() => setShowQr(!showQr)}
              className="text-xs bg-slate-100 hover:bg-slate-200 text-slate-700 font-semibold px-3 py-2 rounded-xl border border-slate-200 transition-colors flex items-center gap-1.5"
            >
              <QrCode className="w-4 h-4 text-indigo-600" />
              <span>{showQr ? 'ซ่อน QR Code' : 'เปิด QR Code สแกนเข้ามือถือ'}</span>
            </button>
          </div>

          {/* QR Code view */}
          {showQr && (
            <div className="p-4 bg-slate-50 border border-slate-200 rounded-xl text-center space-y-2 animate-in fade-in">
              <div className="text-xs font-bold text-slate-700">
                สแกนด้วยกล้องมือถือเพื่อเปิดตาราง Spot Map และแก้ไขได้ทันที:
              </div>
              <div className="flex justify-center p-2 bg-white rounded-lg border border-slate-200 max-w-[200px] mx-auto">
                <img
                  src={`https://api.qrserver.com/v1/create-qr-code/?size=180x180&data=${encodeURIComponent(
                    shareUrl
                  )}`}
                  alt="QR Code สำหรับเปิดแชร์ตาราง Spot Map"
                  className="w-40 h-40"
                />
              </div>
              <div className="text-[11px] text-slate-500">
                ใช้กล้องสมาร์ตโฟนสแกนเพื่อร่วมแก้ไขได้เลย ไม่ต้องติดตั้งแอป
              </div>
            </div>
          )}

          {/* Collaboration features list */}
          <div className="p-3 bg-slate-50 rounded-xl border border-slate-200 text-xs space-y-2">
            <div className="font-bold text-slate-800 flex items-center gap-1.5">
              <Users className="w-4 h-4 text-teal-600" />
              <span>ความสามารถในการทำงานร่วมกัน (Real-Time Collaborative Editing):</span>
            </div>
            <ul className="text-slate-600 space-y-1.5 pl-5 list-disc text-[11px] leading-relaxed">
              <li>
                <strong>ข้อมูลซิงค์เข้าเซิร์ฟเวอร์ส่วนกลาง:</strong> เมื่อมีผู้ใช้คนใดกดเพิ่มกล่องเชื้อ แก้ไข หรือลบ ทุกคนที่เปิดลิงก์อยู่อีกเครื่องจะเห็นข้อมูลอัปเดตตรงกันอัตโนมัติ
              </li>
              <li>
                <strong>ไม่มีการล็อกสิทธิ์:</strong> แพทย์ พยาบาลประจำตึก และ ICN สามารถเข้ามาเติมข้อมูลของหอผู้ป่วยตนเองพร้อมกันได้ทันที
              </li>
              <li>
                <strong>รองรับทุกอุปกรณ์:</strong> ใช้งานได้ทั้งบนคอมพิวเตอร์ แท็บเล็ต และสมาร์ตโฟน
              </li>
            </ul>
          </div>

          {/* Sync status info */}
          <div className="flex items-center justify-between text-xs text-slate-500 pt-1">
            <div className="flex items-center gap-1.5">
              <span className="w-2 h-2 rounded-full bg-emerald-500" />
              <span>ซิงค์ล่าสุด: {formattedSyncTime} ({casesCount} เคส)</span>
            </div>
            {onManualSync && (
              <button
                onClick={onManualSync}
                disabled={isSyncing}
                className="text-teal-700 hover:text-teal-800 font-semibold flex items-center gap-1 hover:underline disabled:opacity-50"
              >
                <RefreshCw className={`w-3 h-3 ${isSyncing ? 'animate-spin' : ''}`} />
                <span>{isSyncing ? 'กำลังซิงค์...' : 'รีเฟรชข้อมูล'}</span>
              </button>
            )}
          </div>
        </div>

        {/* Footer */}
        <div className="p-4 bg-slate-50 border-t border-slate-200 flex justify-end">
          <button
            onClick={onClose}
            className="px-4 py-2 bg-slate-800 hover:bg-slate-700 text-white rounded-xl text-xs font-semibold transition-colors"
          >
            ปิดหน้าต่าง
          </button>
        </div>
      </div>
    </div>
  );
};
