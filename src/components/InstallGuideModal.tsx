import React, { useState } from 'react';
import { 
  X, 
  Laptop, 
  ShieldCheck, 
  Download, 
  Copy, 
  Check, 
  HelpCircle,
  FileCode,
  HardDrive
} from 'lucide-react';

interface InstallGuideModalProps {
  isOpen: boolean;
  onClose: () => void;
  appUrl: string;
}

export const InstallGuideModal: React.FC<InstallGuideModalProps> = ({
  isOpen,
  onClose,
  appUrl,
}) => {
  const [copiedLink, setCopiedLink] = useState(false);
  const [isDownloading, setIsDownloading] = useState(false);

  if (!isOpen) return null;

  const currentUrl = appUrl || window.location.href;

  const handleCopyLink = () => {
    navigator.clipboard.writeText(currentUrl);
    setCopiedLink(true);
    setTimeout(() => setCopiedLink(false), 2000);
  };

  const handleDownloadStandaloneHtml = async () => {
    setIsDownloading(true);
    try {
      const resp = await fetch('/ofis_sozluk_tam_surum.html');
      if (resp.ok) {
        const blob = await resp.blob();
        const url = URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.href = url;
        a.download = 'ofis_sozluk_tam_surum.html';
        document.body.appendChild(a);
        a.click();
        document.body.removeChild(a);
        URL.revokeObjectURL(url);
        setIsDownloading(false);
        return;
      }
    } catch (err) {
      console.warn('Fetch error:', err);
    }

    // Direct fallback
    const a = document.createElement('a');
    a.href = '/ofis_sozluk_tam_surum.html';
    a.download = 'ofis_sozluk_tam_surum.html';
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    setIsDownloading(false);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/75 backdrop-blur-sm overflow-y-auto">
      <div className="relative w-full max-w-2xl bg-white dark:bg-zinc-900 rounded-3xl shadow-2xl border border-zinc-200 dark:border-zinc-800 overflow-hidden my-auto">
        
        {/* Header */}
        <div className="flex items-center justify-between px-6 py-4 border-b border-zinc-200 dark:border-zinc-800 bg-zinc-50/70 dark:bg-zinc-900">
          <div className="flex items-center gap-2.5">
            <div className="p-2 rounded-xl bg-emerald-100 dark:bg-emerald-950/70 text-emerald-700 dark:text-emerald-400">
              <Laptop className="w-5 h-5" />
            </div>
            <div>
              <h3 className="font-bold text-base text-zinc-900 dark:text-zinc-100">
                Uygulama Bilgisayara Nasıl Alınır?
              </h3>
              <p className="text-xs text-zinc-500 dark:text-zinc-400">
                Yönetici (admin) izni gerekmez &bull; %100 Çevrimdışı &bull; Masaüstü Çift Tıkla Aç
              </p>
            </div>
          </div>

          <button
            onClick={onClose}
            className="p-1.5 rounded-lg text-zinc-400 hover:text-zinc-600 dark:hover:text-zinc-200 transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Content */}
        <div className="p-6 space-y-5 text-xs text-zinc-700 dark:text-zinc-300 leading-relaxed overflow-y-auto max-h-[75vh]">
          
          {/* Method 1: The REAL Single-File Full App HTML Download */}
          <div className="p-5 rounded-2xl border-2 border-emerald-500/50 bg-emerald-50/40 dark:bg-emerald-950/30 space-y-3">
            <div className="flex items-center justify-between">
              <span className="font-bold text-sm text-emerald-900 dark:text-emerald-200 flex items-center gap-2">
                <FileCode className="w-5 h-5 text-emerald-600 dark:text-emerald-400" />
                <span>1. Yöntem (En Sağlamı): Tam Sürüm HTML Olarak İndir</span>
              </span>
              <span className="px-2.5 py-0.5 rounded-full text-[10px] font-bold bg-emerald-600 text-white shadow-xs">
                Önerilen &bull; Tek Dosya
              </span>
            </div>

            <p className="text-zinc-600 dark:text-zinc-300">
              Uygulamanın tüm React kodlarını, karanlık temasını, Excel motorunu ve arama sistemini <strong>tek bir bağımsız .html dosyası</strong> olarak bilgisayarınıza indirin.
            </p>

            <div className="pt-1">
              <button
                type="button"
                onClick={handleDownloadStandaloneHtml}
                disabled={isDownloading}
                className="w-full flex items-center justify-center gap-2 py-3 px-4 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white font-bold text-xs shadow-md transition-all active:scale-[0.99] disabled:opacity-50"
              >
                <Download className="w-4 h-4" />
                <span>
                  {isDownloading ? 'İndiriliyor...' : 'Tam Sürümü İndir (ofis_sozluk_tam_surum.html)'}
                </span>
              </button>
            </div>

            <div className="p-3 bg-white/70 dark:bg-zinc-900/80 rounded-xl border border-emerald-200/60 dark:border-emerald-800/60 text-[11px] text-zinc-600 dark:text-zinc-300 space-y-1">
              <div className="font-semibold text-emerald-800 dark:text-emerald-300">İndirdikten sonra ne yapacaksınız?</div>
              <div>&bull; İnen dosyayı masaüstünüze veya flash belleğe taşıyın.</div>
              <div>&bull; Çift tıklayın; Microsoft Edge veya Chrome içinde anında açılır.</div>
              <div>&bull; İnternet bağlantısına ihtiyaç duymaz, Excel dosyanızı yerel hafızasında tutar.</div>
            </div>
          </div>

          {/* Method 2: Live Browser Link */}
          <div className="p-4 rounded-2xl border border-zinc-200 dark:border-zinc-800 bg-zinc-50/60 dark:bg-zinc-800/40 space-y-3">
            <div className="flex items-center justify-between">
              <span className="font-bold text-sm text-zinc-900 dark:text-zinc-100 flex items-center gap-2">
                <Laptop className="w-4 h-4 text-emerald-500" />
                <span>2. Yöntem: Tarayıcı Canlı Bağlantısı</span>
              </span>
            </div>

            <p className="text-zinc-600 dark:text-zinc-300">
              AI Studio önizleme ekranınızın adres çubuğundaki linki kopyalayıp yer işaretlerine ekleyebilirsiniz:
            </p>

            <div className="flex items-center gap-2 p-2 rounded-xl bg-white dark:bg-zinc-950 border border-zinc-200 dark:border-zinc-800">
              <input
                type="text"
                readOnly
                value={currentUrl}
                className="w-full bg-transparent font-mono text-[11px] text-zinc-800 dark:text-zinc-200 outline-none truncate"
              />
              <button
                type="button"
                onClick={handleCopyLink}
                className="flex items-center gap-1 px-2.5 py-1 text-xs rounded-lg bg-zinc-200 dark:bg-zinc-700 hover:bg-zinc-300 dark:hover:bg-zinc-600 text-zinc-800 dark:text-zinc-200 font-bold shrink-0 transition-colors"
              >
                {copiedLink ? <Check className="w-3.5 h-3.5" /> : <Copy className="w-3.5 h-3.5" />}
                <span>{copiedLink ? 'Kopyalandı' : 'Kopyala'}</span>
              </button>
            </div>
          </div>

        </div>

        {/* Footer */}
        <div className="px-6 py-3 border-t border-zinc-200 dark:border-zinc-800 bg-zinc-50 dark:bg-zinc-900/90 flex justify-end">
          <button
            type="button"
            onClick={onClose}
            className="px-4 py-2 text-xs font-semibold rounded-lg bg-emerald-600 hover:bg-emerald-700 text-white transition-colors"
          >
            Tamam, Kapat
          </button>
        </div>

      </div>
    </div>
  );
};
