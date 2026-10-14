import { DictionaryItem } from '../types/dictionary';
import { generateExcelUint8Array, parseExcelFile, convertRowsToDictionary, ParsedWorkbookData } from './excelParser';

export interface FileSystemResult {
  handle: any | null; // FileSystemFileHandle
  fileName: string;
  items: DictionaryItem[];
  columns: string[];
  parsed: ParsedWorkbookData;
}

export function isFileSystemAccessSupported(): boolean {
  return typeof window !== 'undefined' && 'showOpenFilePicker' in window;
}

export async function openAndAttachExcelFile(): Promise<FileSystemResult> {
  if (!isFileSystemAccessSupported()) {
    throw new Error('Tarayıcınız doğrudan dosya yazma sistemini desteklemiyor. Normal yükleme kullanabilirsiniz.');
  }

  const [handle] = await (window as any).showOpenFilePicker({
    types: [
      {
        description: 'Excel Dosyaları',
        accept: {
          'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet': ['.xlsx'],
          'application/vnd.ms-excel': ['.xls'],
          'text/csv': ['.csv'],
        },
      },
    ],
    multiple: false,
  });

  const file = await handle.getFile();
  const buffer = await file.arrayBuffer();
  const parsed = parseExcelFile(buffer);

  const sheetData = parsed.sheets[parsed.suggestedMapping.sheetName];
  if (!sheetData) {
    throw new Error('Excel sayfa verisi okunamadı.');
  }

  const items = convertRowsToDictionary(sheetData.rows, parsed.suggestedMapping);

  return {
    handle,
    fileName: file.name,
    items,
    columns: sheetData.columns,
    parsed,
  };
}

export async function writeDirectlyToFileHandle(
  handle: any,
  items: DictionaryItem[]
): Promise<boolean> {
  if (!handle) return false;

  try {
    // Request write permission if needed
    if (handle.requestPermission) {
      const perm = await handle.requestPermission({ mode: 'readwrite' });
      if (perm !== 'granted') {
        throw new Error('Dosyaya yazma izni verilmedi.');
      }
    }

    const uint8Data = generateExcelUint8Array(items);
    const writable = await handle.createWritable();
    await writable.write(uint8Data);
    await writable.close();
    return true;
  } catch (err) {
    console.error('Doğrudan dosyaya kaydetme hatası:', err);
    throw err;
  }
}
