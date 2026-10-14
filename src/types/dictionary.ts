export interface DictionaryItem {
  id: string;
  sourceText: string; // Typically English
  targetText: string; // Typically Turkish
  normalizedSource: string;
  normalizedTarget: string;
  category?: string;
  notes?: string;
}

export interface MatchResult {
  exact: DictionaryItem | null;
  partials: Array<{
    item: DictionaryItem;
    similarityScore: number;
    matchedIn: 'source' | 'target';
  }>;
}

export interface ExcelColumnMapping {
  sourceColumn: string;
  targetColumn: string;
  sheetName: string;
  categoryColumn?: string;
  notesColumn?: string;
}

export interface DictionaryMeta {
  fileName: string;
  totalEntries: number;
  lastUpdated: number;
  columns: string[];
  activeMapping: ExcelColumnMapping;
}

export interface TranslationHistoryItem {
  id: string;
  input: string;
  output: string;
  timestamp: number;
}
