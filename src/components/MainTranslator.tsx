import React, { useRef, useState, useEffect } from 'react';
import { 
  Copy, 
  Check, 
  ClipboardPaste, 
  RotateCcw, 
  PlusCircle, 
  Search, 
  Sparkles, 
  ArrowRightLeft,
  CheckCheck,
  ShieldCheck,
  HelpCircle
} from 'lucide-react';
import { DictionaryItem, MatchResult } from '../types/dictionary';

interface MainTranslatorProps {
  input: string;
  onChangeInput: (val: string) => void;
  matchResult: MatchResult;
  onCopy: (text: string) => void;
  isCopied: boolean;
  direction: 'auto' | 'en-tr' | 'tr-en';
  onToggleDirection: () => void;
  onOpenQuickAdd: (prefilledWord: string) => void;
}

export const MainTranslator: React.FC<MainTranslatorProps> = ({
  input,
  onChangeInput,
  matchResult,
  onCopy,
  isCopied,
  direction,
  onToggleDirection,
  onOpenQuickAdd,
}) => {
  const inputRef = useRef<HTMLTextAreaElement>(null);
  const [pasteStatus, setPasteStatus] = useState<string | null>(null);
  const [showPermissionTip, setShowPermissionTip] = useState<boolean>(false);

  // Focus automatically on mount
  useEffect(() => {
    if (inputRef.current) {
      inputRef.current.focus();
    }
  }, []);

  // Global Ctrl+V native paste handler: Chrome NEVER prompts for permission on Ctrl+V!
  useEffect(() => {
    const handleGlobalPaste = (e: ClipboardEvent) => {
      const activeEl = document.activeElement;
      if (activeEl?.tagName !== 'INPUT' && activeEl !== inputRef.current) {
        const text = e.clipboardData?.getData('text');
        if (text && text.trim()) {
          onChangeInput(text.trim());
          setPasteStatus('Metin yapıştırıldı! 📋');
          setTimeout(() => setPasteStatus(null), 1500);
        }
      }
    };
    window.addEventListener('paste', handleGlobalPaste);
    return () => window.removeEventListener('paste', handleGlobalPaste);
  }, [onChangeInput]);

  // Robust Instant Paste: Pastes immediately whenever clicked!
  const handleInstantPaste = async (e?: React.MouseEvent) => {
    if (e) e.stopPropagation();

    try {
      if (navigator.clipboard && navigator.clipboard.readText) {
        const text = await navigator.clipboard.readText();
        if (text && text.trim()) {
          onChangeInput(text.trim());
          setPasteStatus('Panodaki metin yapıştırıldı! 📋');
          setTimeout(() => setPasteStatus(null), 1800);
          return;
        }
      }
    } catch {
      // If Chrome blocked or showed permission prompt
      setShowPermissionTip(true);
      if (inputRef.current) {
        inputRef.current.focus();
      }
    }
  };

  const exactItem = matchResult.exact;
  const hasExact = !!exactItem;
  const bestPartial = !hasExact && matchResult.partials.length > 0 ? matchResult.partials[0].item : null;
  const activeDisplayItem = exactItem || bestPartial;

  // Split multiple meanings if separated by slash, comma or semicolon in Excel
  const meaningList = activeDisplayItem?.targetText
    ? activeDisplayItem.targetText.split(/[/;,]+/).map(s => s.trim()).filter(Boolean)
    : [];

  return (
    <div className="w-full max-w-7xl mx-auto px-4 sm:px-6 py-6 sm:py-8 flex flex-col gap-6">
      
      {/* Top Helper Strip */}
      <div className="flex flex-wrap items-center justify-between gap-3 text-xs text-zinc-500 dark:text-zinc-400">
        <div className="flex items-center gap-2">
          <button
            onClick={onToggleDirection}
            className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-white dark:bg-zinc-800 border border-zinc-200 dark:border-zinc-700 text-zinc-800 dark:text-zinc-200 font-semibold shadow-2xs hover:bg-zinc-50 dark:hover:bg-zinc-700/80 transition-colors"
          >
            <ArrowRightLeft className="w-3.5 h-3.5 text-emerald-600 dark:text-emerald-400" />
            <span>
              {direction === 'auto'
                ? 'Otomatik Algıla (EN ↔ TR)'
                : direction === 'en-tr'
                ? 'İngilizce → Türkçe'
                : 'Türkçe → İngilizce'}
            </span>
          </button>
        </div>

        <div className="flex items-center gap-2">
          <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full bg-emerald-50 dark:bg-emerald-950/60 text-emerald-700 dark:text-emerald-400 border border-emerald-200 dark:border-emerald-800/80 text-[11px] font-medium">
            <CheckCheck className="w-3.5 h-3.5" />
            Kutuya tıklayınca anında yapıştırır &bull; Türkçeye tıklayınca kopyalar ve temizler
          </span>
          <button
            onClick={() => setShowPermissionTip(!showPermissionTip)}
            className="text-[11px] text-zinc-400 hover:text-emerald-500 underline flex items-center gap-1 cursor-pointer"
          >
            <HelpCircle className="w-3.5 h-3.5" />
            <span>İzin Ayarı</span>
          </button>
        </div>
      </div>

      {/* Chrome Permanent Permission Info Banner */}
      {showPermissionTip && (
        <div className="p-3.5 rounded-2xl bg-amber-500/10 border border-amber-500/30 text-amber-800 dark:text-amber-200 text-xs flex items-start justify-between gap-3 animate-in fade-in duration-200">
          <div className="space-y-1">
            <div className="font-bold flex items-center gap-1.5">
              <ShieldCheck className="w-4 h-4 text-amber-500" />
              <span>Chrome / Edge'in Her Seferinde İzin Sormasını Engellemek İçin:</span>
            </div>
            <p className="text-[11px] text-zinc-600 dark:text-zinc-300">
              1. Tarayıcının en üstündeki adres çubuğunun <strong>sol tarafındaki simgeye (Kilit 🔒 veya Ayar simgesi)</strong> tıklayın.<br/>
              2. <strong>&ldquo;Site Ayarları&rdquo; (Site Settings)</strong> seçeneğine tıklayın.<br/>
              3. Listeden <strong>&ldquo;Pano&rdquo; (Clipboard)</strong> ayarını bulun ve <strong>&ldquo;İzin Ver&rdquo; (Allow)</strong> olarak değiştirin.<br/>
              <em>Bunu bir kez yaptığınızda Chrome bir daha asla izin sormaz, kutuya her tıkladığınızda anında yapıştırır!</em>
            </p>
          </div>
          <button 
            onClick={() => setShowPermissionTip(false)}
            className="text-zinc-400 hover:text-zinc-200 p-1 font-bold cursor-pointer"
          >
            ✕
          </button>
        </div>
      )}

      {/* TWO HUGE BLOCKS */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 items-stretch">
        
        {/* HUGE INPUT AREA - CLICKS PASTE IMMEDIATELY! */}
        <div 
          onClick={handleInstantPaste}
          className="flex flex-col bg-white dark:bg-zinc-900 rounded-3xl border border-zinc-200/90 dark:border-zinc-800 shadow-sm transition-all focus-within:ring-2 focus-within:ring-emerald-500/40 focus-within:border-emerald-500 min-h-[360px] sm:min-h-[420px] overflow-hidden group relative cursor-pointer"
        >
          {/* Header */}
          <div className="px-5 py-3.5 border-b border-zinc-100 dark:border-zinc-800/80 flex items-center justify-between bg-zinc-50/60 dark:bg-zinc-900/60">
            <div className="flex items-center gap-2">
              <span className="w-2.5 h-2.5 rounded-full bg-emerald-500" />
              <span className="text-xs font-bold uppercase tracking-wider text-zinc-700 dark:text-zinc-300">
                {direction === 'tr-en' ? 'Türkçe Metin Girişi' : 'İngilizce Metin Girişi'}
              </span>
              {pasteStatus && (
                <span className="px-2 py-0.5 rounded-full bg-emerald-100 dark:bg-emerald-900 text-emerald-800 dark:text-emerald-200 text-[11px] font-semibold animate-pulse">
                  {pasteStatus}
                </span>
              )}
            </div>

            <div className="flex items-center gap-1.5" onClick={(e) => e.stopPropagation()}>
              <button
                type="button"
                onClick={handleInstantPaste}
                title="Panodaki metni yapıştır"
                className="flex items-center gap-1 px-3 py-1.5 text-xs rounded-lg bg-emerald-600 hover:bg-emerald-700 text-white font-bold transition-all shadow-xs"
              >
                <ClipboardPaste className="w-3.5 h-3.5" />
                <span>Panoyu Yapıştır</span>
              </button>

              {input && (
                <button
                  type="button"
                  onClick={() => onChangeInput('')}
                  title="Temizle (ESC)"
                  className="p-1.5 rounded-md text-zinc-400 hover:text-zinc-600 dark:hover:text-zinc-200 hover:bg-zinc-100 dark:hover:bg-zinc-800 transition-colors"
                >
                  <RotateCcw className="w-3.5 h-3.5" />
                </button>
              )}
            </div>
          </div>

          {/* Huge Textarea */}
          <div className="p-6 flex-1 flex flex-col justify-center">
            <textarea
              ref={inputRef}
              value={input}
              onClick={handleInstantPaste}
              onChange={(e) => onChangeInput(e.target.value)}
              placeholder="Tıkladığınız anda panonuzdaki metin yapıştırılır..."
              className="w-full h-full resize-none bg-transparent font-medium text-zinc-900 dark:text-zinc-50 placeholder-zinc-400 dark:placeholder-zinc-600 text-2xl sm:text-3xl lg:text-4xl leading-tight focus:outline-none cursor-pointer"
            />
          </div>

          {/* Bottom Bar */}
          <div className="px-5 py-3 bg-zinc-50/50 dark:bg-zinc-900/40 border-t border-zinc-100 dark:border-zinc-800/80 flex items-center justify-between text-xs text-zinc-500 dark:text-zinc-400">
            <span>Kutuya tıkladığınız anda panodaki metin yapışır (veya klavyeden <strong>Ctrl + V</strong>).</span>
            {input.trim() && (
              <span className="font-mono text-[11px] text-emerald-600 dark:text-emerald-400 font-semibold">
                {input.trim().length} karakter
              </span>
            )}
          </div>
        </div>

        {/* HUGE OUTPUT AREA (Click to copy & auto-clears!) */}
        <div 
          onClick={() => {
            if (activeDisplayItem) {
              onCopy(activeDisplayItem.targetText);
            }
          }}
          className={`flex flex-col rounded-3xl border transition-all select-none relative min-h-[360px] sm:min-h-[420px] overflow-hidden ${
            activeDisplayItem
              ? isCopied
                ? 'bg-emerald-50 dark:bg-emerald-950/40 border-emerald-500 ring-4 ring-emerald-500/20 shadow-lg cursor-pointer'
                : 'bg-white dark:bg-zinc-900 border-zinc-200/90 dark:border-zinc-800 hover:border-emerald-500 dark:hover:border-emerald-500 hover:shadow-xl cursor-pointer group'
              : 'bg-zinc-50/50 dark:bg-zinc-900/30 border-dashed border-zinc-300 dark:border-zinc-800 cursor-default'
          }`}
        >
          {/* Header */}
          <div className="px-5 py-3.5 border-b border-zinc-100 dark:border-zinc-800/80 flex items-center justify-between bg-zinc-50/60 dark:bg-zinc-900/60">
            <div className="flex items-center gap-2">
              <span className={`w-2.5 h-2.5 rounded-full ${activeDisplayItem ? 'bg-emerald-500' : 'bg-zinc-400'}`} />
              <span className="text-xs font-bold uppercase tracking-wider text-zinc-700 dark:text-zinc-300">
                {direction === 'tr-en' ? 'İngilizce Karşılık (Excel)' : 'Türkçe Karşılık (Excel)'}
              </span>

              {hasExact && (
                <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-emerald-100 dark:bg-emerald-900/70 text-emerald-800 dark:text-emerald-200">
                  Tam Eşleşme
                </span>
              )}

              {!hasExact && bestPartial && (
                <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-amber-100 dark:bg-amber-900/70 text-amber-800 dark:text-amber-200">
                  En Yakın Eşleşme (Ön Ek)
                </span>
              )}
            </div>

            {/* Click to Copy Indicator Badge */}
            {activeDisplayItem && (
              <div>
                <span className={`text-xs font-bold px-3 py-1 rounded-lg transition-all flex items-center gap-1.5 shadow-2xs ${
                  isCopied
                    ? 'bg-emerald-600 text-white font-extrabold scale-105'
                    : 'bg-emerald-100 dark:bg-emerald-900/50 text-emerald-800 dark:text-emerald-300 group-hover:bg-emerald-600 group-hover:text-white'
                }`}>
                  {isCopied ? (
                    <>
                      <Check className="w-3.5 h-3.5" />
                      Kopyalandı &amp; Temizlendi!
                    </>
                  ) : (
                    <>
                      <Copy className="w-3.5 h-3.5" />
                      Tıkla Kopyala &amp; Sıfırla
                    </>
                  )}
                </span>
              </div>
            )}
          </div>

          {/* Huge Output Area */}
          <div className="p-6 sm:p-8 flex-1 flex flex-col justify-center">
            {activeDisplayItem ? (
              <div className="space-y-4">
                {/* Kocaman Yazı */}
                <div className="font-extrabold tracking-tight text-zinc-900 dark:text-zinc-50 leading-tight text-3xl sm:text-4xl lg:text-5xl transition-transform active:scale-[0.99]">
                  {activeDisplayItem.targetText}
                </div>

                <div className="flex flex-wrap items-center gap-2 pt-2 text-zinc-500 dark:text-zinc-400 text-sm">
                  <span className="font-medium text-zinc-700 dark:text-zinc-300">
                    Kayıt: {activeDisplayItem.sourceText}
                  </span>
                  {activeDisplayItem.category && (
                    <span className="px-2 py-0.5 rounded bg-zinc-100 dark:bg-zinc-800 text-xs font-semibold text-zinc-600 dark:text-zinc-300 border border-zinc-200 dark:border-zinc-700">
                      {activeDisplayItem.category}
                    </span>
                  )}
                </div>

                {/* Multiple meaning pills if any */}
                {meaningList.length > 1 && (
                  <div className="pt-2" onClick={(e) => e.stopPropagation()}>
                    <span className="text-[11px] font-semibold text-zinc-400 block mb-1.5">
                      Ayrı Anlamlar:
                    </span>
                    <div className="flex flex-wrap gap-2">
                      {meaningList.map((m, idx) => (
                        <button
                          key={idx}
                          type="button"
                          onClick={() => onCopy(m)}
                          className="px-3 py-1.5 text-xs rounded-lg bg-zinc-100 dark:bg-zinc-800 hover:bg-emerald-600 hover:text-white border border-zinc-200 dark:border-zinc-700 font-semibold transition-colors"
                        >
                          {m}
                        </button>
                      ))}
                    </div>
                  </div>
                )}
              </div>
            ) : input.trim() ? (
              /* Not Found -> Direct Add Button */
              <div className="text-center py-8 px-4 space-y-4">
                <div className="w-12 h-12 mx-auto rounded-full bg-amber-100 dark:bg-amber-950/70 flex items-center justify-center text-amber-600 dark:text-amber-400">
                  <Search className="w-6 h-6" />
                </div>
                <div className="space-y-1">
                  <h4 className="text-base font-bold text-zinc-800 dark:text-zinc-200">
                    &ldquo;{input.trim()}&rdquo; ile başlayan bir terim bulunamadı
                  </h4>
                  <p className="text-xs text-zinc-500 dark:text-zinc-400 max-w-sm mx-auto">
                    Bu terimi şimdi Türkçe karşılığıyla birlikte sözlüğe ve Excel dosyanıza ekleyebilirsiniz.
                  </p>
                </div>
                <div onClick={(e) => e.stopPropagation()}>
                  <button
                    type="button"
                    onClick={() => onOpenQuickAdd(input.trim())}
                    className="inline-flex items-center gap-2 px-4 py-2.5 text-xs font-bold rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white shadow-sm transition-colors"
                  >
                    <PlusCircle className="w-4 h-4" />
                    Bu Terimi Sözlüğe ve Excel'e Ekle
                  </button>
                </div>
              </div>
            ) : (
              /* Empty state */
              <div className="text-center py-10 px-4 text-zinc-400 dark:text-zinc-600 space-y-2">
                <Sparkles className="w-10 h-10 mx-auto stroke-1 text-emerald-500/50" />
                <p className="text-base font-semibold text-zinc-600 dark:text-zinc-400">
                  Sol kutuya tıkladığınız anda panonuzdaki metin yapıştırılır.
                </p>
                <p className="text-xs">
                  Türkçe karşılık kocaman çıkar; tıkladığınızda kopyalanır ve her iki kutu otomatik temizlenir.
                </p>
              </div>
            )}
          </div>

          {/* Bottom Bar */}
          <div className="px-5 py-3 bg-zinc-50/50 dark:bg-zinc-900/40 border-t border-zinc-100 dark:border-zinc-800/80 flex items-center justify-between text-xs text-zinc-500 dark:text-zinc-400">
            <span>
              {activeDisplayItem ? '📋 Tıklayınca panoya kopyalar ve bir sonraki kelime için alanı boşaltır' : 'Hazır bekliyor...'}
            </span>
            {isCopied && (
              <span className="font-bold text-emerald-600 dark:text-emerald-400 flex items-center gap-1">
                <Check className="w-4 h-4" /> Panoya Kopyalandı &amp; Temizlendi!
              </span>
            )}
          </div>
        </div>

      </div>

    </div>
  );
};
