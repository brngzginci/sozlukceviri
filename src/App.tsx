import React, { useState, useEffect, useMemo, useCallback } from 'react';
import { 
  DEFAULT_OFFICE_DICTIONARY,
  exportCurrentDictionaryToExcel
} from './utils/excelParser';
import { 
  DictionaryItem, 
  DictionaryMeta 
} from './types/dictionary';
import { 
  loadDictionary, 
  saveDictionaryEntries, 
  clearAllDictionary 
} from './utils/storage';
import { findMatches } from './utils/matcher';
import { writeDirectlyToFileHandle } from './utils/fileSystemSync';

import { TopQuickBar } from './components/TopQuickBar';
import { MainTranslator } from './components/MainTranslator';
import { ExcelManagerModal } from './components/ExcelManagerModal';
import { QuickAddModal } from './components/QuickAddModal';
import { InstallGuideModal } from './components/InstallGuideModal';
import { LogoSettingsModal } from './components/LogoSettingsModal';

export default function App() {
  // Theme state (Dark Mode by default with Dikkan Orange accents)
  const [darkMode, setDarkMode] = useState<boolean>(() => {
    const saved = localStorage.getItem('office_dict_theme');
    if (saved) return saved === 'dark';
    return true; // Default to sleek dark mode
  });

  // Translation direction
  const [direction, setDirection] = useState<'auto' | 'en-tr' | 'tr-en'>('auto');

  // Dictionary state (Loaded and remembered permanently via IndexedDB)
  const [entries, setEntries] = useState<DictionaryItem[]>(DEFAULT_OFFICE_DICTIONARY);
  const [meta, setMeta] = useState<DictionaryMeta | null>({
    fileName: 'Dikkan Terim Sözlüğü (Hazır)',
    totalEntries: DEFAULT_OFFICE_DICTIONARY.length,
    lastUpdated: Date.now(),
    columns: ['İngilizce', 'Türkçe', 'Kategori'],
    activeMapping: {
      sheetName: 'Sozluk',
      sourceColumn: 'İngilizce',
      targetColumn: 'Türkçe',
      categoryColumn: 'Kategori',
    },
  });

  // Direct Disk File System Access Handle (Directly edits file on PC disk!)
  const [activeFileHandle, setActiveFileHandle] = useState<any | null>(null);

  // Search input and copy feedback
  const [inputText, setInputText] = useState<string>('');
  const [isCopied, setIsCopied] = useState<boolean>(false);

  // Modals state
  const [isExcelModalOpen, setIsExcelModalOpen] = useState<boolean>(false);
  const [isQuickAddOpen, setIsQuickAddOpen] = useState<boolean>(false);
  const [isInstallGuideOpen, setIsInstallGuideOpen] = useState<boolean>(false);
  const [isLogoSettingsOpen, setIsLogoSettingsOpen] = useState<boolean>(false);
  const [prefilledAddWord, setPrefilledAddWord] = useState<string>('');
  const [logoVersion, setLogoVersion] = useState<number>(0);

  // Handle Dark Mode class on HTML and body
  useEffect(() => {
    if (darkMode) {
      document.documentElement.classList.add('dark');
      document.body.classList.add('dark');
      localStorage.setItem('office_dict_theme', 'dark');
    } else {
      document.documentElement.classList.remove('dark');
      document.body.classList.remove('dark');
      localStorage.setItem('office_dict_theme', 'light');
    }
  }, [darkMode]);

  // Load persisted dictionary from IndexedDB (Remembers user's Excel file every time the app opens!)
  useEffect(() => {
    async function initDB() {
      try {
        const stored = await loadDictionary();
        if (stored.entries && stored.entries.length > 0) {
          setEntries(stored.entries);
          if (stored.meta) {
            setMeta(stored.meta);
          }
        } else {
          // Store default dictionary to IndexedDB so it's ready offline
          const initialMeta: DictionaryMeta = {
            fileName: 'Dikkan Terim Sözlüğü (Hazır)',
            totalEntries: DEFAULT_OFFICE_DICTIONARY.length,
            lastUpdated: Date.now(),
            columns: ['İngilizce', 'Türkçe', 'Kategori'],
            activeMapping: {
              sheetName: 'Sozluk',
              sourceColumn: 'İngilizce',
              targetColumn: 'Türkçe',
              categoryColumn: 'Kategori',
            },
          };
          await saveDictionaryEntries(DEFAULT_OFFICE_DICTIONARY, initialMeta);
        }
      } catch (err) {
        console.warn('Storage initialisation error:', err);
      }
    }
    initDB();
  }, []);

  // Compute live match result using our strict prefix-first ranking
  const matchResult = useMemo(() => {
    return findMatches(inputText, entries, direction);
  }, [inputText, entries, direction]);

  // Copy to clipboard handler with visual feedback AND AUTO-CLEAR
  const handleCopyText = useCallback(async (textToCopy: string) => {
    if (!textToCopy) return;

    try {
      await navigator.clipboard.writeText(textToCopy);
      setIsCopied(true);

      // Otomatik olarak hem İngilizce giriş hem de Türkçe çıktı temizlenir
      setTimeout(() => {
        setInputText('');
        setIsCopied(false);
      }, 450);
    } catch {
      const textarea = document.createElement('textarea');
      textarea.value = textToCopy;
      document.body.appendChild(textarea);
      textarea.select();
      document.execCommand('copy');
      document.body.removeChild(textarea);
      setIsCopied(true);

      setTimeout(() => {
        setInputText('');
        setIsCopied(false);
      }, 450);
    }
  }, []);

  // Global Keyboard shortcuts (ESC clears input)
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape') {
        setInputText('');
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, []);

  // Save new dictionary from Excel Upload (remembers permanently)
  const handleSaveNewDictionary = async (
    newEntries: DictionaryItem[],
    newMeta: DictionaryMeta,
    fileHandle?: any
  ) => {
    setEntries(newEntries);
    setMeta(newMeta);
    if (fileHandle) {
      setActiveFileHandle(fileHandle);
    }
    await saveDictionaryEntries(newEntries, newMeta);
    setInputText('');
  };

  // Reset to default dictionary
  const handleResetToDefault = async () => {
    await clearAllDictionary();
    setActiveFileHandle(null);
    const initialMeta: DictionaryMeta = {
      fileName: 'Dikkan Terim Sözlüğü (Hazır)',
      totalEntries: DEFAULT_OFFICE_DICTIONARY.length,
      lastUpdated: Date.now(),
      columns: ['İngilizce', 'Türkçe', 'Kategori'],
      activeMapping: {
        sheetName: 'Sozluk',
        sourceColumn: 'İngilizce',
        targetColumn: 'Türkçe',
        categoryColumn: 'Kategori',
      },
    };
    await saveDictionaryEntries(DEFAULT_OFFICE_DICTIONARY, initialMeta);
    setEntries(DEFAULT_OFFICE_DICTIONARY);
    setMeta(initialMeta);
    setIsExcelModalOpen(false);
  };

  // Add single term & persist in IndexedDB and direct Excel disk file
  const handleAddQuickEntry = async (item: DictionaryItem) => {
    const updated = [item, ...entries];
    setEntries(updated);
    const updatedMeta = meta
      ? { ...meta, totalEntries: updated.length, lastUpdated: Date.now() }
      : {
          fileName: 'dikkan_sozluk.xlsx',
          totalEntries: updated.length,
          lastUpdated: Date.now(),
          columns: ['İngilizce', 'Türkçe'],
          activeMapping: { sheetName: 'Sozluk', sourceColumn: 'İngilizce', targetColumn: 'Türkçe' },
        };

    setMeta(updatedMeta);
    await saveDictionaryEntries(updated, updatedMeta);

    // If directly connected to Excel file on disk, write right away!
    if (activeFileHandle) {
      try {
        await writeDirectlyToFileHandle(activeFileHandle, updated);
      } catch (err) {
        console.error('Doğrudan dosyaya yazılamadı:', err);
      }
    }

    setInputText(item.sourceText);
  };

  const handleExportCurrentExcel = () => {
    exportCurrentDictionaryToExcel(entries, meta?.fileName || 'dikkan_sozluk.xlsx');
  };

  const handleToggleDirection = () => {
    setDirection(prev => {
      if (prev === 'auto') return 'en-tr';
      if (prev === 'en-tr') return 'tr-en';
      return 'auto';
    });
  };

  return (
    <div 
      key={logoVersion}
      className="min-h-screen flex flex-col bg-zinc-100 dark:bg-zinc-950 text-zinc-900 dark:text-zinc-100 font-sans transition-colors antialiased"
      style={{
        accentColor: '#ec691f'
      }}
    >
      
      {/* 1. STICKY TOP QUICK BAR */}
      <TopQuickBar
        onSearch={setInputText}
        searchTerm={inputText}
        quickResult={matchResult.exact || (matchResult.partials.length > 0 ? matchResult.partials[0].item : null)}
        onCopyResult={handleCopyText}
        isCopied={isCopied}
        totalTerms={entries.length}
        fileName={meta?.fileName || 'Dikkan Sözlüğü'}
        onOpenExcelModal={() => setIsExcelModalOpen(true)}
        onOpenQuickAdd={() => {
          setPrefilledAddWord('');
          setIsQuickAddOpen(true);
        }}
        onExportExcel={handleExportCurrentExcel}
        onOpenInstallGuide={() => setIsInstallGuideOpen(true)}
        onOpenLogoSettings={() => setIsLogoSettingsOpen(true)}
        darkMode={darkMode}
        onToggleDarkMode={() => setDarkMode(!darkMode)}
      />

      {/* 2. MAIN TRANSLATOR / HUGE INPUT & HUGE OUTPUT */}
      <main className="flex-1 flex flex-col justify-start">
        <MainTranslator
          input={inputText}
          onChangeInput={setInputText}
          matchResult={matchResult}
          onCopy={handleCopyText}
          isCopied={isCopied}
          direction={direction}
          onToggleDirection={handleToggleDirection}
          onOpenQuickAdd={(word) => {
            setPrefilledAddWord(word);
            setIsQuickAddOpen(true);
          }}
        />
      </main>

      {/* 3. FOOTER */}
      <footer className="py-2.5 px-4 border-t border-zinc-200 dark:border-zinc-800/80 bg-white/50 dark:bg-zinc-950 text-center text-xs text-zinc-500 dark:text-zinc-400 flex flex-wrap items-center justify-between gap-2 max-w-7xl mx-auto w-full">
        <div className="flex items-center gap-2">
          <span className="w-2.5 h-2.5 rounded-full" style={{ backgroundColor: '#ec691f' }} />
          <span>
            {activeFileHandle ? (
              <strong className="font-semibold" style={{ color: '#ec691f' }}>
                🟢 Dikkan Excel Dosyasına Doğrudan Bağlı (Otomatik Kaydedilir)
              </strong>
            ) : (
              'Dikkan Terim Sözlüğü &bull; %100 Çevrimdışı &bull; Yönetici İzni Gerekmez'
            )}
          </span>
        </div>

        <div className="flex items-center gap-3 text-[11px]">
          <button
            onClick={() => setIsLogoSettingsOpen(true)}
            className="font-semibold hover:underline cursor-pointer"
            style={{ color: '#ec691f' }}
          >
            🎨 Dikkan Logo Yükle
          </button>
          <span>&bull;</span>
          <button
            onClick={() => setIsInstallGuideOpen(true)}
            className="font-semibold hover:underline cursor-pointer"
            style={{ color: '#ec691f' }}
          >
            Masaüstü Kurulumu
          </button>
        </div>
      </footer>

      {/* MODALS */}
      <ExcelManagerModal
        isOpen={isExcelModalOpen}
        onClose={() => setIsExcelModalOpen(false)}
        currentMeta={meta}
        onSaveNewDictionary={handleSaveNewDictionary}
        onResetToDefault={handleResetToDefault}
        activeFileHandle={activeFileHandle}
      />

      <QuickAddModal
        isOpen={isQuickAddOpen}
        onClose={() => setIsQuickAddOpen(false)}
        prefilledWord={prefilledAddWord}
        onAddEntry={handleAddQuickEntry}
        allEntries={entries}
        currentFileName={meta?.fileName || 'dikkan_sozluk.xlsx'}
        activeFileHandle={activeFileHandle}
      />

      <InstallGuideModal
        isOpen={isInstallGuideOpen}
        onClose={() => setIsInstallGuideOpen(false)}
        appUrl={window.location.href}
        onOpenLogoSettings={() => setIsLogoSettingsOpen(true)}
      />

      <LogoSettingsModal
        isOpen={isLogoSettingsOpen}
        onClose={() => setIsLogoSettingsOpen(false)}
        onLogosUpdated={() => setLogoVersion(v => v + 1)}
      />

    </div>
  );
}
