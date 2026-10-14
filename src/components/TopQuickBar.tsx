import React, { useState, useEffect } from 'react';
import { 
  Search, 
  Copy, 
  Check, 
  FileSpreadsheet, 
  Sun, 
  Moon, 
  PlusCircle, 
  Download,
  X,
  HelpCircle
} from 'lucide-react';
import { DictionaryItem } from '../types/dictionary';

interface TopQuickBarProps {
  onSearch: (text: string) => void;
  searchTerm: string;
  quickResult: DictionaryItem | null;
  onCopyResult: (text: string) => void;
  isCopied: boolean;
  totalTerms: number;
  fileName: string;
  onOpenExcelModal: () => void;
  onOpenQuickAdd: () => void;
  onExportExcel: () => void;
  onOpenInstallGuide: () => void;
  darkMode: boolean;
  onToggleDarkMode: () => void;
}

export const TopQuickBar: React.FC<TopQuickBarProps> = ({
  onSearch,
  searchTerm,
  quickResult,
  onCopyResult,
  isCopied,
  totalTerms,
  fileName,
  onOpenExcelModal,
  onOpenQuickAdd,
  onExportExcel,
  onOpenInstallGuide,
  darkMode,
  onToggleDarkMode,
}) => {
  const [localInput, setLocalInput] = useState(searchTerm);

  useEffect(() => {
    setLocalInput(searchTerm);
  }, [searchTerm]);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const val = e.target.value;
    setLocalInput(val);
    onSearch(val);
  };

  const handleClear = () => {
    setLocalInput('');
    onSearch('');
  };

  return (
    <header className="sticky top-0 z-40 w-full border-b backdrop-blur-md bg-white/95 dark:bg-zinc-900/95 border-zinc-200 dark:border-zinc-800 transition-colors shadow-xs">
      <div className="max-w-7xl mx-auto px-3 sm:px-6 py-2.5 flex items-center justify-between gap-2 sm:gap-4">
        
        {/* Left: Brand & Excel File Info */}
        <div className="flex items-center gap-2 shrink-0">
          <div className="flex items-center gap-1.5 font-bold text-sm tracking-tight text-zinc-900 dark:text-zinc-100">
            <span className="flex h-7 w-7 items-center justify-center rounded-lg bg-emerald-600 text-white font-mono text-xs shadow-xs font-bold">
              TR
            </span>
            <span className="hidden sm:inline font-semibold">Ofis Sözlük</span>
          </div>

          <button
            onClick={onOpenExcelModal}
            title="Excel dosyasını değiştir veya yeni dosya yükle (Otomatik hatırlanır)"
            className="flex items-center gap-1.5 px-2.5 py-1 text-xs rounded-lg bg-emerald-50 dark:bg-emerald-950/60 text-emerald-700 dark:text-emerald-400 border border-emerald-200 dark:border-emerald-800/80 hover:bg-emerald-100 dark:hover:bg-emerald-900/60 transition-colors font-medium"
          >
            <FileSpreadsheet className="w-3.5 h-3.5 shrink-0" />
            <span className="max-w-[110px] sm:max-w-[150px] truncate">
              {fileName || 'Excel Dosyası'}
            </span>
            <span className="px-1.5 py-0.2 rounded bg-emerald-200/70 dark:bg-emerald-800 text-[10px] text-emerald-900 dark:text-emerald-200 font-mono font-semibold">
              {totalTerms}
            </span>
          </button>
        </div>

        {/* Center: Quick Sticky Search Input */}
        <div className="flex-1 max-w-xl relative flex items-center">
          <div className="relative w-full">
            <div className="absolute inset-y-0 left-0 pl-2.5 flex items-center pointer-events-none text-zinc-400 dark:text-zinc-500">
              <Search className="w-4 h-4" />
            </div>
            
            <input
              type="text"
              value={localInput}
              onChange={handleChange}
              placeholder="Hızlı arama / metin girişi (ESC ile sil)..."
              className="w-full pl-8 pr-10 py-1.5 text-xs sm:text-sm rounded-lg bg-zinc-100 dark:bg-zinc-800 text-zinc-900 dark:text-zinc-100 placeholder-zinc-400 dark:placeholder-zinc-500 border border-transparent focus:border-emerald-500 dark:focus:border-emerald-500 focus:bg-white dark:focus:bg-zinc-950 focus:outline-none transition-all shadow-inner"
            />

            {localInput && (
              <button
                onClick={handleClear}
                className="absolute inset-y-0 right-2 px-1 flex items-center text-zinc-400 hover:text-zinc-600 dark:hover:text-zinc-200"
                title="Temizle (ESC)"
              >
                <X className="w-3.5 h-3.5" />
              </button>
            )}
          </div>

          {/* Quick inline translation preview if matched in top bar */}
          {quickResult && (
            <div 
              onClick={() => onCopyResult(quickResult.targetText)}
              title="Tıklayarak doğrudan panoya kopyala"
              className="hidden lg:flex items-center gap-1.5 ml-2 px-2.5 py-1 rounded-md bg-emerald-500/10 border border-emerald-500/30 text-emerald-800 dark:text-emerald-300 text-xs cursor-pointer hover:bg-emerald-500/20 transition-all shrink-0 max-w-xs group"
            >
              <span className="font-semibold truncate max-w-[140px]">
                {quickResult.targetText}
              </span>
              <button className="p-0.5 rounded text-emerald-700 dark:text-emerald-300 group-hover:scale-110 transition-transform">
                {isCopied ? <Check className="w-3.5 h-3.5 text-emerald-500" /> : <Copy className="w-3.5 h-3.5" />}
              </button>
            </div>
          )}
        </div>

        {/* Right: Actions */}
        <div className="flex items-center gap-1 sm:gap-2 shrink-0">
          {/* Add Term Button */}
          <button
            onClick={onOpenQuickAdd}
            title="Excel sözlüğüne yeni terim ekle"
            className="flex items-center gap-1.5 px-2.5 py-1.5 text-xs font-semibold rounded-lg bg-emerald-600 hover:bg-emerald-700 text-white shadow-xs transition-colors"
          >
            <PlusCircle className="w-3.5 h-3.5" />
            <span className="hidden md:inline">Yeni Terim Ekle</span>
          </button>

          {/* Download Updated Excel */}
          <button
            onClick={onExportExcel}
            title="Güncel Excel dosyasını bilgisayarına indir"
            className="p-1.5 sm:px-2 sm:py-1.5 text-xs font-medium rounded-lg text-zinc-700 dark:text-zinc-300 hover:bg-zinc-100 dark:hover:bg-zinc-800 border border-zinc-200 dark:border-zinc-700 flex items-center gap-1 transition-colors"
          >
            <Download className="w-3.5 h-3.5 text-emerald-600 dark:text-emerald-400" />
            <span className="hidden lg:inline">Excel'i İndir</span>
          </button>

          {/* Windows Setup / Kurulum Rehberi */}
          <button
            onClick={onOpenInstallGuide}
            title="Windows ofis bilgisayarına yönetici izinsiz masaüstü kurulum rehberi"
            className="p-1.5 text-zinc-600 dark:text-zinc-400 hover:text-zinc-900 dark:hover:text-zinc-100 hover:bg-zinc-100 dark:hover:bg-zinc-800 rounded-lg transition-colors"
          >
            <HelpCircle className="w-4 h-4" />
          </button>

          {/* Dark Mode Toggle */}
          <button
            onClick={onToggleDarkMode}
            title={darkMode ? "Açık Tema" : "Karanlık Tema"}
            className="p-1.5 text-zinc-600 dark:text-zinc-400 hover:text-zinc-900 dark:hover:text-zinc-100 hover:bg-zinc-100 dark:hover:bg-zinc-800 rounded-lg transition-colors"
          >
            {darkMode ? <Sun className="w-4 h-4 text-amber-400" /> : <Moon className="w-4 h-4" />}
          </button>
        </div>

      </div>
    </header>
  );
};
