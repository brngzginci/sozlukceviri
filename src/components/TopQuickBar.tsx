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
  HelpCircle,
  Image
} from 'lucide-react';
import { DictionaryItem } from '../types/dictionary';
import { DikkanLogo } from './DikkanLogo';

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
  onOpenLogoSettings: () => void;
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
  onOpenLogoSettings,
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
        
        {/* Left: Dikkan Brand & Excel File Info */}
        <div className="flex items-center gap-3 shrink-0">
          <div 
            onClick={onOpenLogoSettings} 
            title="Dikkan Logo Ayarları &amp; Yükleme (Tıklayın)"
            className="cursor-pointer transition-transform hover:opacity-90 active:scale-95"
          >
            <DikkanLogo variant="full" />
          </div>

          <button
            onClick={onOpenExcelModal}
            title="Excel dosyasını değiştir veya yeni dosya yükle (Otomatik hatırlanır)"
            className="flex items-center gap-1.5 px-2.5 py-1 text-xs rounded-lg border transition-colors font-medium cursor-pointer"
            style={{
              backgroundColor: 'rgba(236, 105, 31, 0.1)',
              borderColor: 'rgba(236, 105, 31, 0.35)',
              color: '#ec691f'
            }}
          >
            <FileSpreadsheet className="w-3.5 h-3.5 shrink-0" />
            <span className="max-w-[100px] sm:max-w-[140px] truncate">
              {fileName || 'Excel Sözlüğü'}
            </span>
            <span 
              className="px-1.5 py-0.2 rounded text-[10px] font-mono font-bold"
              style={{
                backgroundColor: 'rgba(236, 105, 31, 0.25)',
                color: '#ec691f'
              }}
            >
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
              placeholder="Dikkan terim ara / metin girişi (ESC ile sil)..."
              className="w-full pl-8 pr-10 py-1.5 text-xs sm:text-sm rounded-lg bg-zinc-100 dark:bg-zinc-800 text-zinc-900 dark:text-zinc-100 placeholder-zinc-400 dark:placeholder-zinc-500 border border-transparent focus:bg-white dark:focus:bg-zinc-950 focus:outline-none transition-all shadow-inner"
              onFocus={(e) => (e.target.style.borderColor = '#ec691f')}
              onBlur={(e) => (e.target.style.borderColor = 'transparent')}
            />

            {localInput && (
              <button
                onClick={handleClear}
                className="absolute inset-y-0 right-2 px-1 flex items-center text-zinc-400 hover:text-zinc-600 dark:hover:text-zinc-200 cursor-pointer"
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
              className="hidden lg:flex items-center gap-1.5 ml-2 px-2.5 py-1 rounded-md text-xs cursor-pointer transition-all shrink-0 max-w-xs group"
              style={{
                backgroundColor: 'rgba(236, 105, 31, 0.12)',
                borderColor: 'rgba(236, 105, 31, 0.35)',
                borderWidth: '1px',
                color: '#ec691f'
              }}
            >
              <span className="font-semibold truncate max-w-[140px]">
                {quickResult.targetText}
              </span>
              <button className="p-0.5 rounded group-hover:scale-110 transition-transform cursor-pointer">
                {isCopied ? <Check className="w-3.5 h-3.5 text-emerald-500" /> : <Copy className="w-3.5 h-3.5" />}
              </button>
            </div>
          )}
        </div>

        {/* Right: Actions */}
        <div className="flex items-center gap-1 sm:gap-2 shrink-0">
          {/* Add Term Button in Dikkan Orange */}
          <button
            onClick={onOpenQuickAdd}
            title="Dikkan sözlüğüne yeni terim ekle"
            className="flex items-center gap-1.5 px-2.5 py-1.5 text-xs font-semibold rounded-lg text-white shadow-xs transition-colors cursor-pointer"
            style={{ backgroundColor: '#ec691f' }}
            onMouseEnter={(e) => (e.currentTarget.style.backgroundColor = '#d85810')}
            onMouseLeave={(e) => (e.currentTarget.style.backgroundColor = '#ec691f')}
          >
            <PlusCircle className="w-3.5 h-3.5" />
            <span className="hidden md:inline">Yeni Terim</span>
          </button>

          {/* Download Updated Excel */}
          <button
            onClick={onExportExcel}
            title="Güncel Excel dosyasını bilgisayarına indir"
            className="p-1.5 sm:px-2 sm:py-1.5 text-xs font-medium rounded-lg text-zinc-700 dark:text-zinc-300 hover:bg-zinc-100 dark:hover:bg-zinc-800 border border-zinc-200 dark:border-zinc-700 flex items-center gap-1 transition-colors cursor-pointer"
          >
            <Download className="w-3.5 h-3.5" style={{ color: '#ec691f' }} />
            <span className="hidden lg:inline">Excel İndir</span>
          </button>

          {/* Logo Upload & Settings Button */}
          <button
            onClick={onOpenLogoSettings}
            title="Dikkan logosu yükle veya dosya konumunu gör"
            className="p-1.5 text-zinc-600 dark:text-zinc-400 hover:text-zinc-900 dark:hover:text-zinc-100 hover:bg-zinc-100 dark:hover:bg-zinc-800 rounded-lg transition-colors cursor-pointer"
          >
            <Image className="w-4 h-4" style={{ color: '#ec691f' }} />
          </button>

          {/* Windows Setup / Kurulum Rehberi */}
          <button
            onClick={onOpenInstallGuide}
            title="Masaüstü kurulum rehberi"
            className="p-1.5 text-zinc-600 dark:text-zinc-400 hover:text-zinc-900 dark:hover:text-zinc-100 hover:bg-zinc-100 dark:hover:bg-zinc-800 rounded-lg transition-colors cursor-pointer"
          >
            <HelpCircle className="w-4 h-4" />
          </button>

          {/* Dark Mode Toggle */}
          <button
            onClick={onToggleDarkMode}
            title={darkMode ? "Açık Tema" : "Karanlık Tema"}
            className="p-1.5 text-zinc-600 dark:text-zinc-400 hover:text-zinc-900 dark:hover:text-zinc-100 hover:bg-zinc-100 dark:hover:bg-zinc-800 rounded-lg transition-colors cursor-pointer"
          >
            {darkMode ? <Sun className="w-4 h-4 text-amber-400" /> : <Moon className="w-4 h-4" />}
          </button>
        </div>

      </div>
    </header>
  );
};
