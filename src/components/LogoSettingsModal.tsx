import React, { useState } from 'react';
import { X, Image, Upload, Check, Trash2, FolderCode, Sparkles, AlertCircle } from 'lucide-react';
import { DikkanLogo } from './DikkanLogo';

interface LogoSettingsModalProps {
  isOpen: boolean;
  onClose: () => void;
  onLogosUpdated: () => void;
}

export const LogoSettingsModal: React.FC<LogoSettingsModalProps> = ({
  isOpen,
  onClose,
  onLogosUpdated,
}) => {
  const [fullLogoPreview, setFullLogoPreview] = useState<string | null>(() => {
    return localStorage.getItem('dikkan_custom_logo_full');
  });

  const [iconLogoPreview, setIconLogoPreview] = useState<string | null>(() => {
    return localStorage.getItem('dikkan_custom_logo_icon');
  });

  const [message, setMessage] = useState<string | null>(null);

  if (!isOpen) return null;

  const handleFileUpload = (type: 'full' | 'icon', e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    if (!file.type.startsWith('image/')) {
      alert('Lütfen geçerli bir resim dosyası seçin (PNG, JPG, SVG veya WEBP).');
      return;
    }

    const reader = new FileReader();
    reader.onload = () => {
      const result = reader.result as string;
      if (type === 'full') {
        localStorage.setItem('dikkan_custom_logo_full', result);
        setFullLogoPreview(result);
      } else {
        localStorage.setItem('dikkan_custom_logo_icon', result);
        setIconLogoPreview(result);
      }
      setMessage(type === 'full' ? 'Dikkan ana logosu güncellendi!' : 'Dikkan D ikonu güncellendi!');
      setTimeout(() => setMessage(null), 2500);
      onLogosUpdated();
    };
    reader.readAsDataURL(file);
  };

  const handleRemoveCustom = (type: 'full' | 'icon') => {
    if (type === 'full') {
      localStorage.removeItem('dikkan_custom_logo_full');
      setFullLogoPreview(null);
    } else {
      localStorage.removeItem('dikkan_custom_logo_icon');
      setIconLogoPreview(null);
    }
    setMessage('Özel logo sıfırlandı.');
    setTimeout(() => setMessage(null), 2000);
    onLogosUpdated();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/75 backdrop-blur-sm overflow-y-auto">
      <div className="relative w-full max-w-2xl bg-white dark:bg-zinc-900 rounded-3xl shadow-2xl border border-zinc-200 dark:border-zinc-800 overflow-hidden my-auto animate-in fade-in duration-150">
        
        {/* Header */}
        <div className="flex items-center justify-between px-6 py-4 border-b border-zinc-200 dark:border-zinc-800 bg-zinc-50/70 dark:bg-zinc-900">
          <div className="flex items-center gap-3">
            <div 
              className="p-2 rounded-xl text-white shadow-xs"
              style={{ backgroundColor: '#ec691f' }}
            >
              <Image className="w-5 h-5" />
            </div>
            <div>
              <h3 className="font-bold text-base text-zinc-900 dark:text-zinc-100 flex items-center gap-2">
                Dikkan Logo Yükleme &amp; Dosya Rehberi
              </h3>
              <p className="text-xs text-zinc-500 dark:text-zinc-400">
                Kurumsal Renk: <strong className="font-mono" style={{ color: '#ec691f' }}>#ec691f</strong> &bull; Logo Konumları
              </p>
            </div>
          </div>

          <button
            onClick={onClose}
            className="p-1.5 rounded-lg text-zinc-400 hover:text-zinc-600 dark:hover:text-zinc-200 transition-colors cursor-pointer"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Content */}
        <div className="p-6 space-y-6 text-xs text-zinc-700 dark:text-zinc-300 leading-relaxed max-h-[75vh] overflow-y-auto">
          
          {/* Answer to user's question: File location in Code editor */}
          <div 
            className="p-4 rounded-2xl border-2 space-y-2.5"
            style={{
              backgroundColor: 'rgba(236, 105, 31, 0.08)',
              borderColor: 'rgba(236, 105, 31, 0.35)'
            }}
          >
            <div className="flex items-center gap-2 font-bold text-sm" style={{ color: '#ec691f' }}>
              <FolderCode className="w-4.5 h-4.5" />
              <span>Kod (Code) Bölümünde Logoları Nereye Yükleyeceksiniz?</span>
            </div>
            <p className="text-zinc-700 dark:text-zinc-200">
              Sol taraftaki / üstteki dosya listesinde <strong>public</strong> klasörünün içine şu isimlerle yüklemeniz yeterlidir:
            </p>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 pt-1">
              <div className="p-3 bg-white dark:bg-zinc-950 rounded-xl border border-zinc-200 dark:border-zinc-800 space-y-1">
                <span className="font-semibold text-zinc-900 dark:text-zinc-100 block">
                  1. Dikkan Yazılı Ana Logo:
                </span>
                <code className="text-[11px] font-mono px-2 py-0.5 rounded bg-zinc-100 dark:bg-zinc-800 text-zinc-800 dark:text-zinc-200 block" style={{ color: '#ec691f' }}>
                  /public/dikkan-logo.png
                </code>
                <span className="text-[10px] text-zinc-400 block">
                  (PNG, SVG veya JPG formatında)
                </span>
              </div>

              <div className="p-3 bg-white dark:bg-zinc-950 rounded-xl border border-zinc-200 dark:border-zinc-800 space-y-1">
                <span className="font-semibold text-zinc-900 dark:text-zinc-100 block">
                  2. Sadece D Harfi İkon Logo:
                </span>
                <code className="text-[11px] font-mono px-2 py-0.5 rounded bg-zinc-100 dark:bg-zinc-800 text-zinc-800 dark:text-zinc-200 block" style={{ color: '#ec691f' }}>
                  /public/dikkan-icon.png
                </code>
                <span className="text-[10px] text-zinc-400 block">
                  (Sekme ikonu ve küçük alanlar için)
                </span>
              </div>
            </div>
          </div>

          {/* Quick UI Upload Option (Super easy for user without touching code) */}
          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <h4 className="font-bold text-sm text-zinc-900 dark:text-zinc-100 flex items-center gap-2">
                <Upload className="w-4 h-4" style={{ color: '#ec691f' }} />
                <span>Veya Şimdi Buradan Seçerek Doğrudan Yükleyin (Tek Tıkla):</span>
              </h4>
              {message && (
                <span className="px-2.5 py-0.5 rounded-full text-[11px] font-bold text-emerald-600 bg-emerald-100 dark:bg-emerald-950/60 flex items-center gap-1">
                  <Check className="w-3.5 h-3.5" />
                  {message}
                </span>
              )}
            </div>

            {/* Logo 1: Full Dikkan Logo */}
            <div className="p-4 rounded-2xl bg-zinc-50 dark:bg-zinc-800/50 border border-zinc-200 dark:border-zinc-700/70 space-y-3">
              <div className="flex items-center justify-between">
                <div>
                  <span className="font-bold text-xs text-zinc-900 dark:text-zinc-100 block">
                    1. Dikkan Yazılı Ana Logo
                  </span>
                  <span className="text-[11px] text-zinc-500 dark:text-zinc-400">
                    Üst menü ve ana ekran başlığında kullanılır.
                  </span>
                </div>

                {fullLogoPreview && (
                  <button
                    onClick={() => handleRemoveCustom('full')}
                    className="text-xs text-rose-500 hover:text-rose-600 flex items-center gap-1 cursor-pointer"
                  >
                    <Trash2 className="w-3.5 h-3.5" />
                    Kaldır
                  </button>
                )}
              </div>

              <div className="flex items-center gap-4">
                <div className="h-12 px-4 rounded-xl bg-white dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-700 flex items-center justify-center shrink-0 min-w-[140px]">
                  {fullLogoPreview ? (
                    <img src={fullLogoPreview} alt="Dikkan Logo" className="max-h-8 max-w-[120px] object-contain" />
                  ) : (
                    <DikkanLogo variant="full" />
                  )}
                </div>

                <label 
                  className="flex-1 py-2.5 px-3 rounded-xl border border-dashed border-zinc-300 dark:border-zinc-600 hover:border-[#ec691f] flex items-center justify-center gap-2 cursor-pointer transition-colors bg-white/70 dark:bg-zinc-900/50 text-center font-semibold text-xs text-zinc-700 dark:text-zinc-200"
                >
                  <Upload className="w-4 h-4 text-zinc-400" />
                  <span>{fullLogoPreview ? 'Farklı Dikkan Logosu Seç' : 'Bilgisayarından Dikkan Yazılı Logoyu Seç'}</span>
                  <input
                    type="file"
                    accept="image/*"
                    onChange={(e) => handleFileUpload('full', e)}
                    className="hidden"
                  />
                </label>
              </div>
            </div>

            {/* Logo 2: D Icon */}
            <div className="p-4 rounded-2xl bg-zinc-50 dark:bg-zinc-800/50 border border-zinc-200 dark:border-zinc-700/70 space-y-3">
              <div className="flex items-center justify-between">
                <div>
                  <span className="font-bold text-xs text-zinc-900 dark:text-zinc-100 block">
                    2. Dikkan &ldquo;D&rdquo; Harfi İkon Logo
                  </span>
                  <span className="text-[11px] text-zinc-500 dark:text-zinc-400">
                    Tarayıcı sekme simgesi, mobil ve rozetlerde kullanılır.
                  </span>
                </div>

                {iconLogoPreview && (
                  <button
                    onClick={() => handleRemoveCustom('icon')}
                    className="text-xs text-rose-500 hover:text-rose-600 flex items-center gap-1 cursor-pointer"
                  >
                    <Trash2 className="w-3.5 h-3.5" />
                    Kaldır
                  </button>
                )}
              </div>

              <div className="flex items-center gap-4">
                <div className="h-12 w-12 rounded-xl bg-white dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-700 flex items-center justify-center shrink-0">
                  {iconLogoPreview ? (
                    <img src={iconLogoPreview} alt="Dikkan D Icon" className="h-8 w-8 object-contain" />
                  ) : (
                    <DikkanLogo variant="icon" />
                  )}
                </div>

                <label 
                  className="flex-1 py-2.5 px-3 rounded-xl border border-dashed border-zinc-300 dark:border-zinc-600 hover:border-[#ec691f] flex items-center justify-center gap-2 cursor-pointer transition-colors bg-white/70 dark:bg-zinc-900/50 text-center font-semibold text-xs text-zinc-700 dark:text-zinc-200"
                >
                  <Upload className="w-4 h-4 text-zinc-400" />
                  <span>{iconLogoPreview ? 'Farklı D İkonu Seç' : 'Bilgisayarından D İkonunu Seç'}</span>
                  <input
                    type="file"
                    accept="image/*"
                    onChange={(e) => handleFileUpload('icon', e)}
                    className="hidden"
                  />
                </label>
              </div>
            </div>

          </div>

        </div>

        {/* Footer */}
        <div className="px-6 py-3 border-t border-zinc-200 dark:border-zinc-800 bg-zinc-50 dark:bg-zinc-900/90 flex justify-between items-center">
          <span className="text-[11px] text-zinc-400 flex items-center gap-1">
            <Sparkles className="w-3.5 h-3.5" style={{ color: '#ec691f' }} />
            Logo yüklenmese dahi hazır Dikkan vektör logosu aktiftir.
          </span>
          <button
            type="button"
            onClick={onClose}
            className="px-4 py-2 text-xs font-semibold rounded-lg text-white shadow-xs transition-colors cursor-pointer"
            style={{ backgroundColor: '#ec691f' }}
            onMouseEnter={(e) => (e.currentTarget.style.backgroundColor = '#d85810')}
            onMouseLeave={(e) => (e.currentTarget.style.backgroundColor = '#ec691f')}
          >
            Tamam, Kaydet
          </button>
        </div>

      </div>
    </div>
  );
};
