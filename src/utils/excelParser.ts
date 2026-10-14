import * as XLSX from 'xlsx';
import { DictionaryItem, ExcelColumnMapping } from '../types/dictionary';

// Default initial starter dictionary with common office/IT/business terms
export const DEFAULT_OFFICE_DICTIONARY: DictionaryItem[] = [
  {
    id: 'demo-1',
    sourceText: 'Action Item',
    targetText: 'Aksiyon Maddesi / Yapılacak İş',
    normalizedSource: 'action item',
    normalizedTarget: 'aksiyon maddesi / yapilacak is',
    category: 'Toplantı'
  },
  {
    id: 'demo-2',
    sourceText: 'Approve',
    targetText: 'Onaylamak',
    normalizedSource: 'approve',
    normalizedTarget: 'onaylamak',
    category: 'İş Akışı'
  },
  {
    id: 'demo-3',
    sourceText: 'Pending Approval',
    targetText: 'Onay Bekliyor',
    normalizedSource: 'pending approval',
    normalizedTarget: 'onay bekliyor',
    category: 'Durum'
  },
  {
    id: 'demo-4',
    sourceText: 'Deliverable',
    targetText: 'Teslim Edilecek Çıktı',
    normalizedSource: 'deliverable',
    normalizedTarget: 'teslim edilecek cikti',
    category: 'Proje'
  },
  {
    id: 'demo-5',
    sourceText: 'Due Date',
    targetText: 'Son Teslim Tarihi',
    normalizedSource: 'due date',
    normalizedTarget: 'son teslim tarihi',
    category: 'Zaman Planı'
  },
  {
    id: 'demo-6',
    sourceText: 'Scope of Work',
    targetText: 'İş Kapsamı (SOW)',
    normalizedSource: 'scope of work',
    normalizedTarget: 'is kapsami (sow)',
    category: 'Sözleşme'
  },
  {
    id: 'demo-7',
    sourceText: 'Invoice',
    targetText: 'Fatura',
    normalizedSource: 'invoice',
    normalizedTarget: 'fatura',
    category: 'Finans'
  },
  {
    id: 'demo-8',
    sourceText: 'Purchase Order',
    targetText: 'Satın Alma Siparişi (PO)',
    normalizedSource: 'purchase order',
    normalizedTarget: 'satin alma siparisi (po)',
    category: 'Satın Alma'
  },
  {
    id: 'demo-9',
    sourceText: 'Follow up',
    targetText: 'Takip Etmek / Gelişmeleri İzlemek',
    normalizedSource: 'follow up',
    normalizedTarget: 'takip etmek / gelismeleri izlemek',
    category: 'İletişim'
  },
  {
    id: 'demo-10',
    sourceText: 'Escalation',
    targetText: 'Üst Birime İletme / Eskalasyon',
    normalizedSource: 'escalation',
    normalizedTarget: 'ust birime iletme / eskalasyon',
    category: 'Operasyon'
  },
  {
    id: 'demo-11',
    sourceText: 'Out of Office',
    targetText: 'Ofis Dışında (İzinli / Görevli)',
    normalizedSource: 'out of office',
    normalizedTarget: 'ofis disinda (izinli / gorevli)',
    category: 'Durum'
  },
  {
    id: 'demo-12',
    sourceText: 'Quarterly Report',
    targetText: 'Üç Aylık Faaliyet Raporu',
    normalizedSource: 'quarterly report',
    normalizedTarget: 'uc aylik faaliyet raporu',
    category: 'Raporlama'
  },
  {
    id: 'demo-13',
    sourceText: 'Stakeholder',
    targetText: 'Paydaş / İlgili Taraf',
    normalizedSource: 'stakeholder',
    normalizedTarget: 'paydas / ilgili taraf',
    category: 'Yönetim'
  },
  {
    id: 'demo-14',
    sourceText: 'Turnaround Time',
    targetText: 'Geri Dönüş / Tamamlama Süresi (TAT)',
    normalizedSource: 'turnaround time',
    normalizedTarget: 'geri donus / tamamlama suresi (tat)',
    category: 'Metrikler'
  },
  {
    id: 'demo-15',
    sourceText: 'Work in Progress',
    targetText: 'Devam Eden Çalışma (WIP)',
    normalizedSource: 'work in progress',
    normalizedTarget: 'devam eden calisma (wip)',
    category: 'Durum'
  }
];

export function normalizeTurkishAndEnglish(str: string): string {
  if (!str) return '';
  return str
    .toString()
    .trim()
    .toLowerCase()
    .replace(/İ/g, 'i')
    .replace(/I/g, 'ı')
    .replace(/ğ/g, 'g')
    .replace(/ü/g, 'u')
    .replace(/ş/g, 's')
    .replace(/ö/g, 'o')
    .replace(/ç/g, 'c')
    .replace(/ı/g, 'i')
    .replace(/\s+/g, ' ')
    .replace(/[.,/#!$%^&*;:{}=\-_`~()?"'’]/g, ' ')
    .trim();
}

export function cleanText(str: any): string {
  if (str === null || str === undefined) return '';
  return String(str).trim();
}

export interface ParsedWorkbookData {
  sheetNames: string[];
  sheets: Record<string, {
    columns: string[];
    rows: Record<string, any>[];
  }>;
  suggestedMapping: ExcelColumnMapping;
}

export function parseExcelFile(arrayBuffer: ArrayBuffer): ParsedWorkbookData {
  const workbook = XLSX.read(arrayBuffer, { type: 'array' });
  const sheetNames = workbook.SheetNames;
  
  const sheets: ParsedWorkbookData['sheets'] = {};
  
  let primarySheet = sheetNames[0];
  let bestColumns: string[] = [];

  for (const name of sheetNames) {
    const worksheet = workbook.Sheets[name];
    const jsonData = XLSX.utils.sheet_to_json<Record<string, any>>(worksheet, { defval: '' });
    
    // find column keys
    const columns = jsonData.length > 0 ? Object.keys(jsonData[0]) : [];
    sheets[name] = {
      columns,
      rows: jsonData,
    };

    if (jsonData.length > 0 && bestColumns.length === 0) {
      primarySheet = name;
      bestColumns = columns;
    }
  }

  // Detect English and Turkish columns automatically
  const suggestedMapping = detectBestColumns(bestColumns, primarySheet);

  return {
    sheetNames,
    sheets,
    suggestedMapping,
  };
}

export function detectBestColumns(columns: string[], sheetName: string): ExcelColumnMapping {
  let sourceCol = '';
  let targetCol = '';
  let categoryCol = '';
  let notesCol = '';

  const enKeywords = ['english', 'ingilizce', 'ing', 'en', 'eng', 'source', 'kaynak', 'metin', 'text', 'original', 'term'];
  const trKeywords = ['turkish', 'turkce', 'türkçe', 'tr', 'tur', 'target', 'hedef', 'ceviri', 'çeviri', 'anlam', 'karsilik', 'karşılık', 'meaning'];
  const catKeywords = ['kategori', 'category', 'alan', 'departman', 'type', 'tur', 'tür'];
  const noteKeywords = ['not', 'notes', 'aciklama', 'açıklama', 'ornek', 'örnek', 'description'];

  // Check column names
  for (const col of columns) {
    const lower = col.toLowerCase().trim();
    if (!sourceCol && enKeywords.some(k => lower.includes(k))) {
      sourceCol = col;
    } else if (!targetCol && trKeywords.some(k => lower.includes(k))) {
      targetCol = col;
    } else if (!categoryCol && catKeywords.some(k => lower.includes(k))) {
      categoryCol = col;
    } else if (!notesCol && noteKeywords.some(k => lower.includes(k))) {
      notesCol = col;
    }
  }

  // Fallbacks if not matched by keyword
  if (!sourceCol && columns.length >= 1) {
    sourceCol = columns[0];
  }
  if (!targetCol && columns.length >= 2) {
    targetCol = columns[1];
  }

  return {
    sheetName,
    sourceColumn: sourceCol,
    targetColumn: targetCol,
    categoryColumn: categoryCol || undefined,
    notesColumn: notesCol || undefined,
  };
}

export function convertRowsToDictionary(
  rows: Record<string, any>[],
  mapping: ExcelColumnMapping
): DictionaryItem[] {
  const items: DictionaryItem[] = [];

  rows.forEach((row, index) => {
    const src = cleanText(row[mapping.sourceColumn]);
    const tgt = cleanText(row[mapping.targetColumn]);

    if (src || tgt) {
      items.push({
        id: `row-${index + 1}`,
        sourceText: src,
        targetText: tgt,
        normalizedSource: normalizeTurkishAndEnglish(src),
        normalizedTarget: normalizeTurkishAndEnglish(tgt),
        category: mapping.categoryColumn ? cleanText(row[mapping.categoryColumn]) : undefined,
        notes: mapping.notesColumn ? cleanText(row[mapping.notesColumn]) : undefined,
      });
    }
  });

  return items;
}

export function generateSampleExcelFile(): void {
  const wb = XLSX.utils.book_new();
  const sampleData = [
    {
      'İngilizce (English)': 'Quarterly Business Review',
      'Türkçe Karşılık': 'Üç Aylık İş Değerlendirme Toplantısı (QBR)',
      'Kategori': 'Toplantı',
      'Açıklama / Örnek': 'Yönetim sunumlarında sık kullanılır'
    },
    {
      'İngilizce (English)': 'As soon as possible (ASAP)',
      'Türkçe Karşılık': 'Mümkün olan en kısa sürede',
      'Kategori': 'E-posta',
      'Açıklama / Örnek': 'Acil iş bildirimleri'
    },
    {
      'İngilizce (English)': 'Bottleneck',
      'Türkçe Karşılık': 'Darboğaz / Süreci Tıkayan Nokta',
      'Kategori': 'Operasyon',
      'Açıklama / Örnek': 'Üretim veya operasyon takibi'
    },
    {
      'İngilizce (English)': 'Non-disclosure Agreement (NDA)',
      'Türkçe Karşılık': 'Gizlilik Sözleşmesi',
      'Kategori': 'Hukuk',
      'Açıklama / Örnek': 'Müşteri sözleşmesi'
    },
    {
      'İngilizce (English)': 'Feedback',
      'Türkçe Karşılık': 'Geri Bildirim / Dönüt',
      'Kategori': 'İletişim',
      'Açıklama / Örnek': 'Performans veya iş değerlendirmesi'
    },
    {
      'İngilizce (English)': 'Benchmark',
      'Türkçe Karşılık': 'Kıyaslama Ölçütü / Referans Noktası',
      'Kategori': 'Analiz',
      'Açıklama / Örnek': 'Piyasa kıyaslaması'
    },
    {
      'İngilizce (English)': 'Deliverable',
      'Türkçe Karşılık': 'Teslim Edilecek Çıktı / Ürün',
      'Kategori': 'Proje',
      'Açıklama / Örnek': 'Proje kilometre taşı'
    }
  ];

  const ws = XLSX.utils.json_to_sheet(sampleData);
  // Auto column widths
  ws['!cols'] = [
    { wch: 30 },
    { wch: 45 },
    { wch: 15 },
    { wch: 35 }
  ];

  XLSX.utils.book_append_sheet(wb, ws, 'Sozluk');
  XLSX.writeFile(wb, 'ornek_ofis_sozluk.xlsx');
}

export function exportCurrentDictionaryToExcel(
  items: DictionaryItem[],
  fileName: string = 'guncel_ofis_sozluk.xlsx'
): void {
  const wb = XLSX.utils.book_new();
  const exportData = items.map((item) => ({
    'İngilizce': item.sourceText,
    'Türkçe': item.targetText,
    'Kategori': item.category || '',
    'Açıklama': item.notes || '',
  }));

  const ws = XLSX.utils.json_to_sheet(exportData);
  ws['!cols'] = [
    { wch: 30 },
    { wch: 45 },
    { wch: 18 },
    { wch: 30 },
  ];

  XLSX.utils.book_append_sheet(wb, ws, 'Sozluk');
  const safeName = fileName.endsWith('.xlsx') ? fileName : `${fileName}.xlsx`;
  XLSX.writeFile(wb, safeName);
}

export function generateExcelUint8Array(items: DictionaryItem[]): Uint8Array {
  const wb = XLSX.utils.book_new();
  const exportData = items.map((item) => ({
    'İngilizce': item.sourceText,
    'Türkçe': item.targetText,
    'Kategori': item.category || '',
    'Açıklama': item.notes || '',
  }));

  const ws = XLSX.utils.json_to_sheet(exportData);
  ws['!cols'] = [
    { wch: 30 },
    { wch: 45 },
    { wch: 18 },
    { wch: 30 },
  ];

  XLSX.utils.book_append_sheet(wb, ws, 'Sozluk');
  const wbout = XLSX.write(wb, { bookType: 'xlsx', type: 'array' });
  return new Uint8Array(wbout);
}


