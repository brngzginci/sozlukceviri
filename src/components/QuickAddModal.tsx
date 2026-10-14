import React, { useState, useEffect } from 'react';
import { X, PlusCircle, Check, Download, AlertCircle, HardDrive, CheckCircle2 } from 'lucide-react';
import { DictionaryItem } from '../types/dictionary';
import { normalizeTurkishAndEnglish, exportCurrentDictionaryToExcel } from '../utils/excelParser';
import { writeDirectlyToFileHandle } from '../utils/fileSystemSync';

interface QuickAddModalProps {
  isOpen: boolean;
  onClose: () => void;
  prefilledWord: string;
  onAddEntry: (item: DictionaryItem) => void;
  allEntries: DictionaryItem[];
  currentFileName: string;
  activeFileHandle: any | null;
}

export const QuickAddModal: React.FC<QuickAddModalProps> = ({
  isOpen,
  onClose,
  prefilledWord,
  onAddEntry,
  allEntries,
  currentFileName,
  activeFileHandle,
}) => {
  const [source, setSource] = useState(prefilledWord);
  const [target, setTarget] = useState('');
  const [category, setCategory] = useState('');
  const [notes, setNotes] = useState('');
  const [isSaving, setIsSaving] = useState(false);
  const [savedSuccessMsg, setSavedSuccessMsg] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    setSource(prefilledWord);
    setTarget('');
    setError(null);
    setSavedSuccessMsg(null);
  }, [prefilledWord, isOpen]);

  if (!isOpen) return null;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!source.trim() || !target.trim()) {
      setError('Lütfen hem İngilizce metni hem de Türkçe karşılığını doldurun.');
      return;
    }

    setIsSaving(true);
    setError(null);

    const newItem: DictionaryItem = {
      id: `custom-${Date.now()}`,
      sourceText: source.trim(),
      targetText: target.trim(),
      normalizedSource: normalizeTurkishAndEnglish(source.trim()),
      normalizedTarget: normalizeTurkishAndEnglish(target.trim()),
      category: category.trim() || undefined,
      notes: notes.trim() || undefined,
    };

    const updatedList = [newItem, ...allEntries];

    try {
      if (activeFileHandle) {
        await writeDirectlyToFileHandle(activeFileHandle, updatedList);
        setSavedSuccessMsg(`Yeni terim "${currentFileName}" dosyanıza doğrudan kaydedildi!`);
      }

      onAddEntry(newItem);

      if (activeFileHandle) {
        setTimeout(() => {
          setIsSaving(false);
          onClose();
        }, 1200);
      } else {
        setIsSaving(false);
        onClose();
      }
    } catch (err: any) {
      console.error(err);
      setError(err.message || 'Dosyaya yazılırken hata oluştu. Yine de yerel hafızaya kaydedildi.');
      onAddEntry(newItem);
      setIsSaving(false);
    }
  };

  const handleManualExport = () => {
    exportCurrentDictionaryToExcel(allEntries, currentFileName || 'dikkan_sozluk.xlsx');
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/70 backdrop-blur-sm">
      <div className="relative w-full max-w-md bg-white dark:bg-zinc-900 rounded-2xl shadow-2xl border border-zinc-200 dark:border-zinc-800 overflow-hidden">
        
        {/* Header */}
        <div className="flex items-center justify-between px-5 py-4 border-b border-zinc-200 dark:border-zinc-800 bg-zinc-50/70 dark:bg-zinc-900">
          <div className="flex items-center gap-2">
            <PlusCircle className="w-5 h-5" style={{ color: '#ec691f' }} />
            <h3 className="font-bold text-sm text-zinc-900 dark:text-zinc-100">
              Dikkan Sözlüğüne Yeni Terim Ekle
            </h3>
          </div>
          <button
            onClick={onClose}
            className="p-1 rounded-lg text-zinc-400 hover:text-zinc-600 dark:hover:text-zinc-200 transition-colors cursor-pointer"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Form */}
        <form onSubmit={handleSubmit} className="p-5 space-y-4 text-xs">
          
          {/* File connection status badge */}
          {activeFileHandle ? (
            <div 
              className="p-2.5 rounded-xl border flex items-center gap-2 text-xs"
              style={{
                backgroundColor: 'rgba(236, 105, 31, 0.08)',
                borderColor: 'rgba(236, 105, 31, 0.3)',
                color: '#ec691f'
              }}
            >
              <HardDrive className="w-4 h-4 shrink-0" />
              <span>
                <strong>{currentFileName}</strong> dosyasına doğrudan canlı bağlı. Kaydettiğinizde dosyanız hemen güncellenir.
              </span>
            </div>
          ) : (
            <div className="p-2.5 rounded-xl bg-zinc-100 dark:bg-zinc-800 border border-zinc-200 dark:border-zinc-700 text-zinc-600 dark:text-zinc-300 text-xs">
              Terim Dikkan yerel hafızasına kaydedilecektir. Excel dosyanızın doğrudan üzerine yazılmasını isterseniz üst menüden &ldquo;Doğrudan Excel Dosyasına Bağlan&rdquo; seçeneğini kullanabilirsiniz.
            </div>
          )}

          {error && (
            <div className="p-2.5 rounded-lg bg-rose-50 dark:bg-rose-950/40 border border-rose-200 dark:border-rose-900/60 text-rose-700 dark:text-rose-300 flex items-center gap-2">
              <AlertCircle className="w-4 h-4 shrink-0" />
              <span>{error}</span>
            </div>
          )}

          {savedSuccessMsg && (
            <div 
              className="p-2.5 rounded-lg border flex items-center gap-2"
              style={{
                backgroundColor: 'rgba(236, 105, 31, 0.1)',
                borderColor: 'rgba(236, 105, 31, 0.4)',
                color: '#ec691f'
              }}
            >
              <CheckCircle2 className="w-4 h-4 shrink-0" />
              <span>{savedSuccessMsg}</span>
            </div>
          )}

          <div>
            <label className="block font-semibold text-zinc-700 dark:text-zinc-300 mb-1">
              İngilizce Metin / Kelime:
            </label>
            <input
              type="text"
              value={source}
              onChange={(e) => setSource(e.target.value)}
              placeholder="Örn: Gate Valve"
              className="w-full p-2.5 rounded-lg bg-zinc-100 dark:bg-zinc-800 border border-zinc-200 dark:border-zinc-700 text-zinc-900 dark:text-zinc-100 font-medium focus:outline-none"
              onFocus={(e) => (e.target.style.borderColor = '#ec691f')}
              onBlur={(e) => (e.target.style.borderColor = '')}
              autoFocus
            />
          </div>

          <div>
            <label className="block font-semibold text-zinc-700 dark:text-zinc-300 mb-1">
              Türkçe Karşılığı:
            </label>
            <input
              type="text"
              value={target}
              onChange={(e) => setTarget(e.target.value)}
              placeholder="Örn: Sürgülü Vana"
              className="w-full p-2.5 rounded-lg bg-zinc-100 dark:bg-zinc-800 border border-zinc-200 dark:border-zinc-700 text-zinc-900 dark:text-zinc-100 font-medium focus:outline-none"
              onFocus={(e) => (e.target.style.borderColor = '#ec691f')}
              onBlur={(e) => (e.target.style.borderColor = '')}
            />
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block font-medium text-zinc-600 dark:text-zinc-400 mb-1">
                Kategori (Opsiyonel):
              </label>
              <input
                type="text"
                value={category}
                onChange={(e) => setCategory(e.target.value)}
                placeholder="Örn: Ürün / Vana"
                className="w-full p-2 rounded-lg bg-zinc-100 dark:bg-zinc-800 border border-zinc-200 dark:border-zinc-700 text-zinc-900 dark:text-zinc-100 focus:outline-none"
                onFocus={(e) => (e.target.style.borderColor = '#ec691f')}
                onBlur={(e) => (e.target.style.borderColor = '')}
              />
            </div>
            <div>
              <label className="block font-medium text-zinc-600 dark:text-zinc-400 mb-1">
                Not / Açıklama (Opsiyonel):
              </label>
              <input
                type="text"
                value={notes}
                onChange={(e) => setNotes(e.target.value)}
                placeholder="Örn: Fabrika üretimi"
                className="w-full p-2 rounded-lg bg-zinc-100 dark:bg-zinc-800 border border-zinc-200 dark:border-zinc-700 text-zinc-900 dark:text-zinc-100 focus:outline-none"
                onFocus={(e) => (e.target.style.borderColor = '#ec691f')}
                onBlur={(e) => (e.target.style.borderColor = '')}
              />
            </div>
          </div>

          <div className="pt-2 flex items-center justify-between">
            <button
              type="button"
              onClick={handleManualExport}
              className="text-[11px] hover:underline flex items-center gap-1 cursor-pointer"
              style={{ color: '#ec691f' }}
            >
              <Download className="w-3.5 h-3.5" />
              Yedek Excel İndir
            </button>

            <div className="flex items-center gap-2">
              <button
                type="button"
                onClick={onClose}
                disabled={isSaving}
                className="px-3 py-1.5 rounded-lg text-zinc-600 dark:text-zinc-400 hover:bg-zinc-100 dark:hover:bg-zinc-800 transition-colors cursor-pointer"
              >
                İptal
              </button>
              <button
                type="submit"
                disabled={isSaving}
                className="flex items-center gap-1.5 px-4 py-1.5 rounded-lg text-white font-bold shadow-xs transition-colors disabled:opacity-50 cursor-pointer"
                style={{ backgroundColor: '#ec691f' }}
                onMouseEnter={(e) => (e.currentTarget.style.backgroundColor = '#d85810')}
                onMouseLeave={(e) => (e.currentTarget.style.backgroundColor = '#ec691f')}
              >
                <Check className="w-3.5 h-3.5" />
                {isSaving ? 'Kaydediliyor...' : 'Kaydet'}
              </button>
            </div>
          </div>
        </form>

      </div>
    </div>
  );
};
