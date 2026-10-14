import React, { useState } from 'react';
import { 
  X, 
  UploadCloud, 
  FileSpreadsheet, 
  Download, 
  CheckCircle, 
  AlertCircle,
  HelpCircle,
  Database,
  Trash2,
  Table,
  FolderOpen,
  HardDrive
} from 'lucide-react';
import { 
  parseExcelFile, 
  convertRowsToDictionary, 
  generateSampleExcelFile,
  ParsedWorkbookData 
} from '../utils/excelParser';
import { openAndAttachExcelFile, isFileSystemAccessSupported } from '../utils/fileSystemSync';
import { DictionaryItem, DictionaryMeta, ExcelColumnMapping } from '../types/dictionary';

interface ExcelManagerModalProps {
  isOpen: boolean;
  onClose: () => void;
  currentMeta: DictionaryMeta | null;
  onSaveNewDictionary: (entries: DictionaryItem[], meta: DictionaryMeta, fileHandle?: any) => void;
  onResetToDefault: () => void;
  activeFileHandle: any | null;
}

export const ExcelManagerModal: React.FC<ExcelManagerModalProps> = ({
  isOpen,
  onClose,
  currentMeta,
  onSaveNewDictionary,
  onResetToDefault,
  activeFileHandle,
}) => {
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [parsedData, setParsedData] = useState<ParsedWorkbookData | null>(null);
  const [mapping, setMapping] = useState<ExcelColumnMapping | null>(null);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);
  const [successMsg, setSuccessMsg] = useState<string | null>(null);
  const [fileHandle, setFileHandle] = useState<any>(activeFileHandle);
  const [activeTab, setActiveTab] = useState<'upload' | 'guide'>('upload');

  if (!isOpen) return null;

  // Modern direct disk access: Edge & Chrome on Windows
  const handleDirectDiskConnect = async () => {
    setErrorMsg(null);
    setSuccessMsg(null);
    try {
      const res = await openAndAttachExcelFile();
      setFileHandle(res.handle);
      setParsedData(res.parsed);
      setMapping(res.parsed.suggestedMapping);

      const meta: DictionaryMeta = {
        fileName: res.fileName,
        totalEntries: res.items.length,
        lastUpdated: Date.now(),
        columns: res.columns,
        activeMapping: res.parsed.suggestedMapping,
      };

      onSaveNewDictionary(res.items, meta, res.handle);
      setSuccessMsg(`"${res.fileName}" başarıyla bağlandı! Yeni terim eklediğinizde doğrudan bu dosyaya kaydedilecektir.`);
      setTimeout(() => {
        onClose();
      }, 1200);
    } catch (err: any) {
      if (err.name !== 'AbortError') {
        setErrorMsg(err.message || 'Dosya seçilirken bir hata oluştu.');
      }
    }
  };

  const handleFileChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    setErrorMsg(null);
    setSelectedFile(file);

    try {
      const buffer = await file.arrayBuffer();
      const parsed = parseExcelFile(buffer);

      if (parsed.sheetNames.length === 0) {
        throw new Error('Excel dosyasında çalışma sayfası bulunamadı.');
      }

      setParsedData(parsed);
      setMapping(parsed.suggestedMapping);
    } catch (err: any) {
      setErrorMsg(err.message || 'Excel dosyası okunurken hata oluştu.');
      setParsedData(null);
    }
  };

  const handleApplyMappingAndSave = () => {
    if (!parsedData || !mapping || (!selectedFile && !fileHandle)) return;

    try {
      const sheetData = parsedData.sheets[mapping.sheetName];
      if (!sheetData) throw new Error('Seçilen çalışma sayfası bulunamadı.');

      const items = convertRowsToDictionary(sheetData.rows, mapping);

      if (items.length === 0) {
        throw new Error('Seçilen sütunlarda geçerli veri bulunamadı.');
      }

      const meta: DictionaryMeta = {
        fileName: selectedFile ? selectedFile.name : (currentMeta?.fileName || 'dikkan_sozluk.xlsx'),
        totalEntries: items.length,
        lastUpdated: Date.now(),
        columns: sheetData.columns,
        activeMapping: mapping,
      };

      onSaveNewDictionary(items, meta, fileHandle);
      onClose();
    } catch (err: any) {
      setErrorMsg(err.message || 'Sözlük kaydedilirken bir hata oluştu.');
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-4 bg-black/70 backdrop-blur-sm overflow-y-auto">
      <div className="relative w-full max-w-3xl bg-white dark:bg-zinc-900 rounded-2xl shadow-2xl border border-zinc-200 dark:border-zinc-800 overflow-hidden my-auto">
        
        {/* Modal Header */}
        <div className="flex items-center justify-between px-5 py-4 border-b border-zinc-200 dark:border-zinc-800 bg-zinc-50/70 dark:bg-zinc-900">
          <div className="flex items-center gap-2.5">
            <div 
              className="p-2 rounded-lg"
              style={{ backgroundColor: 'rgba(236, 105, 31, 0.15)', color: '#ec691f' }}
            >
              <FileSpreadsheet className="w-5 h-5" />
            </div>
            <div>
              <h3 className="font-bold text-base text-zinc-900 dark:text-zinc-100">
                Dikkan Excel Sözlük Veritabanı
              </h3>
              <p className="text-xs text-zinc-500 dark:text-zinc-400">
                Dosyanız tarayıcının yerel hafızasında tutulur ve her açılışta otomatik hatırlanır.
              </p>
            </div>
          </div>

          <button
            onClick={onClose}
            className="p-1.5 rounded-lg text-zinc-400 hover:text-zinc-600 dark:hover:text-zinc-200 hover:bg-zinc-100 dark:hover:bg-zinc-800 transition-colors cursor-pointer"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Modal Nav Tabs */}
        <div className="flex border-b border-zinc-200 dark:border-zinc-800 px-5 pt-2 gap-4 text-xs font-semibold">
          <button
            onClick={() => setActiveTab('upload')}
            className="pb-2.5 border-b-2 transition-all flex items-center gap-1.5 cursor-pointer"
            style={{
              borderColor: activeTab === 'upload' ? '#ec691f' : 'transparent',
              color: activeTab === 'upload' ? '#ec691f' : undefined
            }}
          >
            <UploadCloud className="w-4 h-4" />
            Excel Dosyası Bağla &amp; Yükle
          </button>

          <button
            onClick={() => setActiveTab('guide')}
            className="pb-2.5 border-b-2 transition-all flex items-center gap-1.5 cursor-pointer"
            style={{
              borderColor: activeTab === 'guide' ? '#ec691f' : 'transparent',
              color: activeTab === 'guide' ? '#ec691f' : undefined
            }}
          >
            <HelpCircle className="w-4 h-4" />
            Excel Format Rehberi &amp; Şablon
          </button>
        </div>

        {/* Tab 1: Upload & Map */}
        {activeTab === 'upload' && (
          <div className="p-5 space-y-5 max-h-[75vh] overflow-y-auto">
            
            {/* Current Active Info */}
            {currentMeta && (
              <div className="flex items-center justify-between p-3 rounded-xl bg-zinc-50 dark:bg-zinc-800/60 border border-zinc-200 dark:border-zinc-700/60 text-xs">
                <div className="flex items-center gap-2">
                  <Database className="w-4 h-4 shrink-0" style={{ color: '#ec691f' }} />
                  <div>
                    <span className="font-semibold text-zinc-900 dark:text-zinc-100 flex items-center gap-2">
                      Aktif Dosya: {currentMeta.fileName}
                      {activeFileHandle && (
                        <span 
                          className="px-2 py-0.5 rounded-full text-[10px] font-bold"
                          style={{
                            backgroundColor: 'rgba(236, 105, 31, 0.2)',
                            color: '#ec691f'
                          }}
                        >
                          Doğrudan Diske Bağlı ⚡
                        </span>
                      )}
                    </span>
                    <span className="text-zinc-500 dark:text-zinc-400 block">
                      {currentMeta.totalEntries.toLocaleString('tr-TR')} terim yüklü &bull; Uygulamayı her açtığınızda otomatik yüklenir.
                    </span>
                  </div>
                </div>

                <button
                  type="button"
                  onClick={onResetToDefault}
                  className="flex items-center gap-1 px-2.5 py-1 text-xs text-rose-600 dark:text-rose-400 hover:bg-rose-50 dark:hover:bg-rose-950/30 rounded-md transition-colors cursor-pointer"
                >
                  <Trash2 className="w-3.5 h-3.5" />
                  Sıfırla
                </button>
              </div>
            )}

            {/* DIRECT DISK CONNECTION */}
            {isFileSystemAccessSupported() && (
              <div 
                className="p-4 rounded-2xl border-2 space-y-2"
                style={{
                  backgroundColor: 'rgba(236, 105, 31, 0.08)',
                  borderColor: 'rgba(236, 105, 31, 0.35)'
                }}
              >
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2 font-bold text-sm" style={{ color: '#ec691f' }}>
                    <HardDrive className="w-4 h-4" />
                    <span>Önerilen: Bilgisayarınızdaki Excel Dosyasına Doğrudan Bağlanın</span>
                  </div>
                </div>
                <p className="text-xs text-zinc-700 dark:text-zinc-300">
                  Bu butonla seçtiğinizde yeni terim eklediğiniz an <strong>doğrudan masaüstünüzdeki / klasörünüzdeki Excel dosyasına kaydedilir</strong>. Yeni dosya indirmenize gerek kalmaz!
                </p>
                <div className="pt-1">
                  <button
                    type="button"
                    onClick={handleDirectDiskConnect}
                    className="w-full flex items-center justify-center gap-2 py-2.5 px-4 rounded-xl text-white font-bold text-xs shadow-md transition-all active:scale-[0.99] cursor-pointer"
                    style={{ backgroundColor: '#ec691f' }}
                    onMouseEnter={(e) => (e.currentTarget.style.backgroundColor = '#d85810')}
                    onMouseLeave={(e) => (e.currentTarget.style.backgroundColor = '#ec691f')}
                  >
                    <FolderOpen className="w-4 h-4" />
                    Excel Dosyasını Seç (Doğrudan Üzerine Kaydetme Yetkisiyle)
                  </button>
                </div>
              </div>
            )}

            {/* Or Standard File Drop Zone */}
            <div className="space-y-2">
              <span className="text-[11px] font-semibold text-zinc-400 block">
                Veya Standart Dosya Yükleme:
              </span>
              <div className="relative border-2 border-dashed border-zinc-300 dark:border-zinc-700 hover:border-[#ec691f] rounded-2xl p-5 text-center transition-all bg-zinc-50/50 dark:bg-zinc-900/50">
                <input
                  type="file"
                  accept=".xlsx, .xls, .csv"
                  onChange={handleFileChange}
                  className="absolute inset-0 w-full h-full opacity-0 cursor-pointer"
                />
                <div className="flex flex-col items-center justify-center space-y-1.5 pointer-events-none">
                  <UploadCloud className="w-6 h-6 text-zinc-400" />
                  <div className="text-xs font-semibold text-zinc-700 dark:text-zinc-300">
                    {selectedFile ? selectedFile.name : 'Excel Dosyanızı Sürükleyin veya Seçin'}
                  </div>
                  <p className="text-[11px] text-zinc-400">
                    .xlsx, .xls ve .csv formatlarını destekler.
                  </p>
                </div>
              </div>
            </div>

            {errorMsg && (
              <div className="p-3 rounded-xl bg-rose-50 dark:bg-rose-950/40 border border-rose-200 dark:border-rose-900/60 text-xs text-rose-700 dark:text-rose-300 flex items-center gap-2">
                <AlertCircle className="w-4 h-4 shrink-0" />
                <span>{errorMsg}</span>
              </div>
            )}

            {successMsg && (
              <div 
                className="p-3 rounded-xl border text-xs flex items-center gap-2"
                style={{
                  backgroundColor: 'rgba(236, 105, 31, 0.1)',
                  borderColor: 'rgba(236, 105, 31, 0.4)',
                  color: '#ec691f'
                }}
              >
                <CheckCircle className="w-4 h-4 shrink-0" />
                <span>{successMsg}</span>
              </div>
            )}

            {/* Column Mapping Section if Parsed */}
            {parsedData && mapping && (
              <div className="p-4 rounded-xl border border-zinc-200 dark:border-zinc-800 bg-white dark:bg-zinc-900 space-y-4">
                <div className="flex items-center justify-between border-b border-zinc-100 dark:border-zinc-800 pb-2">
                  <div className="flex items-center gap-2 text-xs font-bold text-zinc-800 dark:text-zinc-200">
                    <Table className="w-4 h-4" style={{ color: '#ec691f' }} />
                    <span>Sütun Eşleme (Otomatik Algılandı)</span>
                  </div>
                  <span className="text-[11px] text-zinc-500">
                    {parsedData.sheets[mapping.sheetName]?.rows.length || 0} satır bulundu
                  </span>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 text-xs">
                  <div>
                    <label className="block text-zinc-700 dark:text-zinc-300 font-semibold mb-1">
                      İngilizce Metin Sütunu:
                    </label>
                    <select
                      value={mapping.sourceColumn}
                      onChange={(e) => setMapping({ ...mapping, sourceColumn: e.target.value })}
                      className="w-full p-2 rounded-lg bg-zinc-100 dark:bg-zinc-800 border border-zinc-200 dark:border-zinc-700 text-zinc-900 dark:text-zinc-100 font-medium"
                    >
                      {parsedData.sheets[mapping.sheetName]?.columns.map((col) => (
                        <option key={col} value={col}>{col}</option>
                      ))}
                    </select>
                  </div>

                  <div>
                    <label className="block text-zinc-700 dark:text-zinc-300 font-semibold mb-1">
                      Türkçe Karşılık Sütunu:
                    </label>
                    <select
                      value={mapping.targetColumn}
                      onChange={(e) => setMapping({ ...mapping, targetColumn: e.target.value })}
                      className="w-full p-2 rounded-lg bg-zinc-100 dark:bg-zinc-800 border border-zinc-200 dark:border-zinc-700 text-zinc-900 dark:text-zinc-100 font-medium"
                    >
                      {parsedData.sheets[mapping.sheetName]?.columns.map((col) => (
                        <option key={col} value={col}>{col}</option>
                      ))}
                    </select>
                  </div>
                </div>

                <div className="pt-2 flex justify-end">
                  <button
                    type="button"
                    onClick={handleApplyMappingAndSave}
                    className="flex items-center gap-2 px-4 py-2 rounded-lg text-white font-semibold text-xs shadow-md transition-colors cursor-pointer"
                    style={{ backgroundColor: '#ec691f' }}
                    onMouseEnter={(e) => (e.currentTarget.style.backgroundColor = '#d85810')}
                    onMouseLeave={(e) => (e.currentTarget.style.backgroundColor = '#ec691f')}
                  >
                    <CheckCircle className="w-4 h-4" />
                    Bu Sözlüğü Yükle ve Kullan
                  </button>
                </div>
              </div>
            )}

          </div>
        )}

        {/* Tab 2: Excel Formatting Guide & Template */}
        {activeTab === 'guide' && (
          <div className="p-5 space-y-4 max-h-[75vh] overflow-y-auto text-xs leading-relaxed text-zinc-700 dark:text-zinc-300">
            
            {/* Download Template Banner */}
            <div 
              className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 p-4 rounded-xl border"
              style={{
                backgroundColor: 'rgba(236, 105, 31, 0.08)',
                borderColor: 'rgba(236, 105, 31, 0.3)'
              }}
            >
              <div>
                <h4 className="font-bold text-sm" style={{ color: '#ec691f' }}>
                  Örnek Excel Şablonu (.xlsx)
                </h4>
                <p className="text-zinc-600 dark:text-zinc-300 text-xs">
                  Tüm sütunları ve örnek ofis terimleri ayarlanmış şablon dosyasını tek tıkla indirin.
                </p>
              </div>

              <button
                type="button"
                onClick={generateSampleExcelFile}
                className="flex items-center gap-1.5 px-3 py-2 rounded-lg text-white font-semibold shadow-xs transition-colors shrink-0 cursor-pointer"
                style={{ backgroundColor: '#ec691f' }}
                onMouseEnter={(e) => (e.currentTarget.style.backgroundColor = '#d85810')}
                onMouseLeave={(e) => (e.currentTarget.style.backgroundColor = '#ec691f')}
              >
                <Download className="w-4 h-4" />
                Şablonu İndir (.xlsx)
              </button>
            </div>

            <div className="space-y-3">
              <h4 className="font-bold text-sm text-zinc-900 dark:text-zinc-100">
                📋 Excel Dosyanızın Düzeni:
              </h4>

              <div className="p-3.5 rounded-xl bg-zinc-50 dark:bg-zinc-800/60 border border-zinc-200 dark:border-zinc-700/60 space-y-1">
                <p className="font-semibold text-zinc-900 dark:text-zinc-100">
                  1. Sütun: İngilizce &bull; 2. Sütun: Türkçe
                </p>
                <p className="text-zinc-600 dark:text-zinc-400">
                  A sütununa <strong>İngilizce</strong>, B sütununa <strong>Türkçe</strong> yazmanız yeterlidir. Başlıklar otomatik algılanır.
                </p>
              </div>

              <div className="p-3.5 rounded-xl bg-zinc-50 dark:bg-zinc-800/60 border border-zinc-200 dark:border-zinc-700/60 space-y-1">
                <p className="font-semibold text-zinc-900 dark:text-zinc-100">
                  2. Otomatik Kaydetme Özelliği:
                </p>
                <p className="text-zinc-600 dark:text-zinc-400">
                  Yukarıdaki <strong>&ldquo;Doğrudan Excel Dosyasına Bağlan&rdquo;</strong> butonunu kullandığınızda yeni terim eklediğiniz an orijinal dosyanız güncellenir.
                </p>
              </div>
            </div>

          </div>
        )}

        {/* Modal Footer */}
        <div className="px-5 py-3 border-t border-zinc-200 dark:border-zinc-800 bg-zinc-50 dark:bg-zinc-900/90 flex justify-end">
          <button
            type="button"
            onClick={onClose}
            className="px-4 py-2 text-xs font-semibold rounded-lg bg-zinc-200 dark:bg-zinc-800 text-zinc-800 dark:text-zinc-200 hover:bg-zinc-300 dark:hover:bg-zinc-700 transition-colors cursor-pointer"
          >
            Kapat
          </button>
        </div>

      </div>
    </div>
  );
};
