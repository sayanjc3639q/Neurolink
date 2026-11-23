import MiniSearch from 'minisearch';
import { get, set } from 'idb-keyval';
import { SearchIndexDoc } from './types';
import { getSearchIndexVersion, fetchSearchIndexDocuments, fetchSearchIndexDocumentsSince } from './topicsApi';

const IDB_INDEX_DOCS_KEY = 'neurolink_search_docs_v1';
const IDB_INDEX_VERSION_KEY = 'neurolink_search_version_v1';

let miniSearchInstance: MiniSearch<SearchIndexDoc> | null = null;
let currentCachedDocs: SearchIndexDoc[] = [];
let isInitializing = false;
let initPromise: Promise<MiniSearch<SearchIndexDoc>> | null = null;

function createMiniSearchInstance(docs: SearchIndexDoc[]): MiniSearch<SearchIndexDoc> {
  const ms = new MiniSearch<SearchIndexDoc>({
    fields: ['title', 'tags', 'summary', 'contentText'],
    storeFields: ['slug', 'title', 'summary', 'tags'],
    idField: 'slug',
    searchOptions: {
      boost: { title: 3, tags: 2, summary: 1.5, contentText: 1 },
      fuzzy: 0.2,
      prefix: true,
    },
  });

  ms.addAll(docs);
  return ms;
}

/**
 * Initializes or updates the MiniSearch index using IndexedDB and Firestore.
 * Repeat visits cost ~1 or 0 reads!
 */
export async function getOrInitSearchIndex(): Promise<MiniSearch<SearchIndexDoc>> {
  if (miniSearchInstance && !isInitializing) {
    return miniSearchInstance;
  }

  if (initPromise) {
    return initPromise;
  }

  initPromise = (async () => {
    isInitializing = true;
    try {
      const [cachedDocs, cachedVersion] = await Promise.all([
        get<SearchIndexDoc[]>(IDB_INDEX_DOCS_KEY),
        get<number>(IDB_INDEX_VERSION_KEY),
      ]);

      const remoteMeta = await getSearchIndexVersion();
      const remoteVersion = remoteMeta ? remoteMeta.version : 0;

      if (cachedDocs && cachedDocs.length > 0 && cachedVersion === remoteVersion) {
        // Cache is fresh! 0 further reads
        currentCachedDocs = cachedDocs;
        miniSearchInstance = createMiniSearchInstance(cachedDocs);
        return miniSearchInstance;
      }

      let freshDocs: SearchIndexDoc[] = [];

      if (cachedDocs && cachedDocs.length > 0 && cachedVersion !== undefined) {
        // Incremental sync: find max updatedAt from cached
        const lastSync = Math.max(...cachedDocs.map((d) => d.updatedAt || 0));
        const changedDocs = await fetchSearchIndexDocumentsSince(lastSync);

        const docMap = new Map<string, SearchIndexDoc>(cachedDocs.map((d) => [d.slug, d]));
        for (const doc of changedDocs) {
          docMap.set(doc.slug, doc);
        }
        freshDocs = Array.from(docMap.values());
      } else {
        // First load or empty cache: full lightweight fetch
        freshDocs = await fetchSearchIndexDocuments();
      }

      currentCachedDocs = freshDocs;
      miniSearchInstance = createMiniSearchInstance(freshDocs);

      // Save to IndexedDB
      await Promise.all([
        set(IDB_INDEX_DOCS_KEY, freshDocs),
        set(IDB_INDEX_VERSION_KEY, remoteVersion),
      ]);

      return miniSearchInstance;
    } catch (err) {
      console.warn('Search index initialization error, falling back to local docs:', err);
      if (currentCachedDocs.length > 0) {
        miniSearchInstance = createMiniSearchInstance(currentCachedDocs);
        return miniSearchInstance;
      }
      miniSearchInstance = createMiniSearchInstance([]);
      return miniSearchInstance;
    } finally {
      isInitializing = false;
      initPromise = null;
    }
  })();

  return initPromise;
}

/**
 * Synchronous check to see if a topic slug exists in current index (for red-link resolution).
 */
export function topicExistsLocally(slug: string): boolean {
  return currentCachedDocs.some((d) => d.slug === slug);
}

/**
 * Direct lookup of cached summary/title for instant hover previews without network requests.
 */
export function getCachedTopicSummary(slug: string): { title: string; summary: string } | null {
  const doc = currentCachedDocs.find((d) => d.slug === slug);
  if (!doc) return null;
  return { title: doc.title, summary: doc.summary };
}

/**
 * Immediate in-memory and IDB update after create/update by owner
 */
export async function updateLocalIndexDoc(doc: SearchIndexDoc) {
  const existingIdx = currentCachedDocs.findIndex((d) => d.slug === doc.slug);
  if (existingIdx >= 0) {
    currentCachedDocs[existingIdx] = doc;
  } else {
    currentCachedDocs.push(doc);
  }

  miniSearchInstance = createMiniSearchInstance(currentCachedDocs);
  await set(IDB_INDEX_DOCS_KEY, currentCachedDocs);
}

/**
 * Immediate in-memory and IDB removal after delete by owner
 */
export async function removeLocalIndexDoc(slug: string) {
  currentCachedDocs = currentCachedDocs.filter((d) => d.slug !== slug);
  miniSearchInstance = createMiniSearchInstance(currentCachedDocs);
  await set(IDB_INDEX_DOCS_KEY, currentCachedDocs);
}

/**
 * Returns all known topics from index for suggestion dropdowns
 */
export function getAllIndexedTopics(): Array<{ slug: string; title: string }> {
  return currentCachedDocs.map((d) => ({ slug: d.slug, title: d.title }));
}
