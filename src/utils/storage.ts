import { DictionaryItem, DictionaryMeta, TranslationHistoryItem } from '../types/dictionary';

const DB_NAME = 'OfficeDictionaryDB';
const DB_VERSION = 1;
const STORE_ENTRIES = 'entries';
const STORE_META = 'metadata';
const STORE_HISTORY = 'history';

function openDB(): Promise<IDBDatabase> {
  return new Promise((resolve, reject) => {
    const request = indexedDB.open(DB_NAME, DB_VERSION);

    request.onupgradeneeded = (event) => {
      const db = (event.target as IDBOpenDBRequest).result;
      if (!db.objectStoreNames.contains(STORE_ENTRIES)) {
        const store = db.createObjectStore(STORE_ENTRIES, { keyPath: 'id' });
        store.createIndex('normalizedSource', 'normalizedSource', { unique: false });
        store.createIndex('normalizedTarget', 'normalizedTarget', { unique: false });
      }
      if (!db.objectStoreNames.contains(STORE_META)) {
        db.createObjectStore(STORE_META, { keyPath: 'key' });
      }
      if (!db.objectStoreNames.contains(STORE_HISTORY)) {
        db.createObjectStore(STORE_HISTORY, { keyPath: 'id' });
      }
    };

    request.onsuccess = () => resolve(request.result);
    request.onerror = () => reject(request.error);
  });
}

export async function saveDictionaryEntries(
  entries: DictionaryItem[],
  meta: DictionaryMeta
): Promise<void> {
  const db = await openDB();
  return new Promise((resolve, reject) => {
    const tx = db.transaction([STORE_ENTRIES, STORE_META], 'readwrite');
    const entriesStore = tx.objectStore(STORE_ENTRIES);
    const metaStore = tx.objectStore(STORE_META);

    entriesStore.clear();
    for (const item of entries) {
      entriesStore.put(item);
    }

    metaStore.put({ key: 'currentMeta', data: meta });

    tx.oncomplete = () => resolve();
    tx.onerror = () => reject(tx.error);
  });
}

export async function loadDictionary(): Promise<{
  entries: DictionaryItem[];
  meta: DictionaryMeta | null;
}> {
  const db = await openDB();
  return new Promise((resolve, reject) => {
    const tx = db.transaction([STORE_ENTRIES, STORE_META], 'readonly');
    const entriesStore = tx.objectStore(STORE_ENTRIES);
    const metaStore = tx.objectStore(STORE_META);

    const entriesRequest = entriesStore.getAll();
    const metaRequest = metaStore.get('currentMeta');

    let entries: DictionaryItem[] = [];
    let meta: DictionaryMeta | null = null;

    entriesRequest.onsuccess = () => {
      entries = entriesRequest.result || [];
    };

    metaRequest.onsuccess = () => {
      if (metaRequest.result && metaRequest.result.data) {
        meta = metaRequest.result.data;
      }
    };

    tx.oncomplete = () => {
      resolve({ entries, meta });
    };

    tx.onerror = () => reject(tx.error);
  });
}

export async function saveHistoryItem(item: TranslationHistoryItem): Promise<void> {
  const db = await openDB();
  return new Promise((resolve, reject) => {
    const tx = db.transaction([STORE_HISTORY], 'readwrite');
    const store = tx.objectStore(STORE_HISTORY);
    store.put(item);
    tx.oncomplete = () => resolve();
    tx.onerror = () => reject(tx.error);
  });
}

export async function loadHistory(): Promise<TranslationHistoryItem[]> {
  const db = await openDB();
  return new Promise((resolve, reject) => {
    const tx = db.transaction([STORE_HISTORY], 'readonly');
    const store = tx.objectStore(STORE_HISTORY);
    const request = store.getAll();

    request.onsuccess = () => {
      const items = (request.result || []) as TranslationHistoryItem[];
      // Sort newest first, keep last 50
      items.sort((a, b) => b.timestamp - a.timestamp);
      resolve(items.slice(0, 50));
    };

    request.onerror = () => reject(request.error);
  });
}

export async function clearAllDictionary(): Promise<void> {
  const db = await openDB();
  return new Promise((resolve, reject) => {
    const tx = db.transaction([STORE_ENTRIES, STORE_META], 'readwrite');
    tx.objectStore(STORE_ENTRIES).clear();
    tx.objectStore(STORE_META).clear();
    tx.oncomplete = () => resolve();
    tx.onerror = () => reject(tx.error);
  });
}
