import { DictionaryItem, MatchResult } from '../types/dictionary';
import { normalizeTurkishAndEnglish } from './excelParser';

export function findMatches(
  query: string,
  entries: DictionaryItem[],
  direction: 'auto' | 'en-tr' | 'tr-en' = 'auto'
): MatchResult {
  const cleanRaw = query.trim();
  if (!cleanRaw) {
    return { exact: null, partials: [] };
  }

  const normalizedQuery = normalizeTurkishAndEnglish(cleanRaw);
  if (!normalizedQuery) {
    return { exact: null, partials: [] };
  }

  // 1. EXACT MATCH CHECK (Highest priority)
  for (const item of entries) {
    const normSrc = item.normalizedSource;
    const normTgt = item.normalizedTarget;

    if (direction === 'en-tr' || direction === 'auto') {
      if (normSrc === normalizedQuery) {
        return {
          exact: item,
          partials: [],
        };
      }
    }

    if (direction === 'tr-en' || direction === 'auto') {
      if (normTgt === normalizedQuery) {
        return {
          exact: item,
          partials: [],
        };
      }
    }
  }

  // If no exact match:
  // 2. PREFIX MATCHES ("bor" ile başladıysam aradığı kelime de "bor" ile başlasın)
  const prefixMatches: Array<{ item: DictionaryItem; score: number; matchedIn: 'source' | 'target' }> = [];

  for (const item of entries) {
    const normSrc = item.normalizedSource;
    const normTgt = item.normalizedTarget;

    // Check if source begins directly with query
    if (direction === 'en-tr' || direction === 'auto') {
      if (normSrc.startsWith(normalizedQuery)) {
        // Closer length to query gets higher score
        const diff = Math.max(0, normSrc.length - normalizedQuery.length);
        prefixMatches.push({
          item,
          score: 1000 - diff,
          matchedIn: 'source',
        });
        continue;
      }

      // Check if any word in the source phrase starts with query (e.g. "heavy border" starts with "bor")
      const words = normSrc.split(' ');
      if (words.some(w => w.startsWith(normalizedQuery))) {
        const diff = Math.max(0, normSrc.length - normalizedQuery.length);
        prefixMatches.push({
          item,
          score: 800 - diff,
          matchedIn: 'source',
        });
        continue;
      }
    }

    // Check if target begins directly with query
    if (direction === 'tr-en' || direction === 'auto') {
      if (normTgt.startsWith(normalizedQuery)) {
        const diff = Math.max(0, normTgt.length - normalizedQuery.length);
        prefixMatches.push({
          item,
          score: 950 - diff,
          matchedIn: 'target',
        });
        continue;
      }

      const words = normTgt.split(' ');
      if (words.some(w => w.startsWith(normalizedQuery))) {
        const diff = Math.max(0, normTgt.length - normalizedQuery.length);
        prefixMatches.push({
          item,
          score: 750 - diff,
          matchedIn: 'target',
        });
        continue;
      }
    }
  }

  // If prefix matches were found, return the best prefix match! (Do NOT show words that merely contain it)
  if (prefixMatches.length > 0) {
    prefixMatches.sort((a, b) => b.score - a.score);
    const best = prefixMatches[0];
    return {
      exact: best.item,
      partials: prefixMatches.slice(1, 7).map(p => ({
        item: p.item,
        similarityScore: p.score,
        matchedIn: p.matchedIn,
      })),
    };
  }

  // 3. FALLBACK ONLY: If ABSOLUTELY NO prefix match was found, search words containing the query
  const substringMatches: Array<{ item: DictionaryItem; score: number; matchedIn: 'source' | 'target' }> = [];

  for (const item of entries) {
    const normSrc = item.normalizedSource;
    const normTgt = item.normalizedTarget;

    if (direction === 'en-tr' || direction === 'auto') {
      if (normSrc.includes(normalizedQuery)) {
        const diff = Math.max(0, normSrc.length - normalizedQuery.length);
        substringMatches.push({
          item,
          score: 500 - diff,
          matchedIn: 'source',
        });
        continue;
      }
    }

    if (direction === 'tr-en' || direction === 'auto') {
      if (normTgt.includes(normalizedQuery)) {
        const diff = Math.max(0, normTgt.length - normalizedQuery.length);
        substringMatches.push({
          item,
          score: 450 - diff,
          matchedIn: 'target',
        });
        continue;
      }
    }
  }

  if (substringMatches.length > 0) {
    substringMatches.sort((a, b) => b.score - a.score);
    const best = substringMatches[0];
    return {
      exact: best.item,
      partials: substringMatches.slice(1, 7).map(s => ({
        item: s.item,
        similarityScore: s.score,
        matchedIn: s.matchedIn,
      })),
    };
  }

  return {
    exact: null,
    partials: [],
  };
}
