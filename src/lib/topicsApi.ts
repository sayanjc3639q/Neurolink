import {
  collection,
  doc,
  getDoc,
  getDocs,
  setDoc,
  deleteDoc,
  query,
  where,
  orderBy,
  limit,
  startAfter,
  serverTimestamp,
  writeBatch,
  Timestamp,
  DocumentSnapshot,
} from 'firebase/firestore';
import { db } from './firebase';
import { Topic, SearchIndexDoc, MetaSearchIndexVersion, WriterRecord } from './types';
import { updateLocalIndexDoc, removeLocalIndexDoc } from './searchIndex';

const TOPICS_COLLECTION = 'topics';
const META_COLLECTION = 'meta';
const SEARCH_VERSION_DOC = 'searchIndexVersion';

export async function getSearchIndexVersion(): Promise<MetaSearchIndexVersion | null> {
  try {
    const snap = await getDoc(doc(db, META_COLLECTION, SEARCH_VERSION_DOC));
    if (snap.exists()) {
      return snap.data() as MetaSearchIndexVersion;
    }
  } catch (err) {
    console.warn('Failed reading searchIndexVersion:', err);
  }
  return null;
}

export async function fetchSearchIndexDocuments(): Promise<SearchIndexDoc[]> {
  const colRef = collection(db, TOPICS_COLLECTION);
  const snap = await getDocs(colRef);
  return snap.docs.map((d) => {
    const data = d.data() as Topic;
    return {
      slug: data.slug,
      title: data.title,
      summary: data.summary || '',
      tags: data.tags || [],
      contentText: (data.contentText || '').slice(0, 5000),
      updatedAt: data.updatedAt?.toMillis ? data.updatedAt.toMillis() : Date.now(),
    };
  });
}

export async function fetchSearchIndexDocumentsSince(lastSyncMillis: number): Promise<SearchIndexDoc[]> {
  const colRef = collection(db, TOPICS_COLLECTION);
  const q = query(
    colRef,
    where('updatedAt', '>', Timestamp.fromMillis(lastSyncMillis))
  );
  const snap = await getDocs(q);
  return snap.docs.map((d) => {
    const data = d.data() as Topic;
    return {
      slug: data.slug,
      title: data.title,
      summary: data.summary || '',
      tags: data.tags || [],
      contentText: (data.contentText || '').slice(0, 5000),
      updatedAt: data.updatedAt?.toMillis ? data.updatedAt.toMillis() : Date.now(),
    };
  });
}

export async function getTopic(slug: string): Promise<Topic | null> {
  const docRef = doc(db, TOPICS_COLLECTION, slug);
  const snap = await getDoc(docRef);
  if (!snap.exists()) return null;
  return snap.data() as Topic;
}

export async function saveTopic(
  topicData: Omit<Topic, 'createdAt' | 'updatedAt'>,
  isNew: boolean
): Promise<void> {
  const batch = writeBatch(db);
  const topicRef = doc(db, TOPICS_COLLECTION, topicData.slug);
  const metaRef = doc(db, META_COLLECTION, SEARCH_VERSION_DOC);

  const payload: any = {
    ...topicData,
    titleLower: topicData.title.toLowerCase(),
    updatedAt: serverTimestamp(),
  };

  if (isNew) {
    payload.createdAt = serverTimestamp();
  }

  batch.set(topicRef, payload, { merge: true });

  // Bump search index version
  const currentMeta = await getSearchIndexVersion();
  const nextVersion = (currentMeta?.version || 0) + 1;
  batch.set(metaRef, {
    version: nextVersion,
    updatedAt: serverTimestamp(),
  });

  await batch.commit();

  // Optimistically update client in-memory search index
  await updateLocalIndexDoc({
    slug: topicData.slug,
    title: topicData.title,
    summary: topicData.summary,
    tags: topicData.tags,
    contentText: topicData.contentText.slice(0, 5000),
    updatedAt: Date.now(),
  });
}

export async function getUserPublications(userUid: string, userEmail?: string | null): Promise<Topic[]> {
  const colRef = collection(db, TOPICS_COLLECTION);
  const snap = await getDocs(colRef);
  return snap.docs
    .map((d) => d.data() as Topic)
    .filter((t) => {
      if (t.authorUid && t.authorUid === userUid) return true;
      if (userEmail && t.authorEmail && t.authorEmail.toLowerCase() === userEmail.toLowerCase()) return true;
      return false;
    });
}

export async function getAllWriters(): Promise<WriterRecord[]> {
  const colRef = collection(db, 'writers');
  const snap = await getDocs(colRef);
  return snap.docs.map((d) => d.data() as WriterRecord);
}

export async function grantWriterAccess(uid: string, email: string, grantedBy: string): Promise<void> {
  const writerRef = doc(db, 'writers', uid);
  await setDoc(writerRef, {
    uid,
    email: email.trim().toLowerCase(),
    addedAt: serverTimestamp(),
    addedBy: grantedBy,
  });
}

export async function revokeWriterAccess(uid: string): Promise<void> {
  const writerRef = doc(db, 'writers', uid);
  await deleteDoc(writerRef);
}

export async function deleteTopic(slug: string): Promise<void> {
  const batch = writeBatch(db);
  const topicRef = doc(db, TOPICS_COLLECTION, slug);
  const metaRef = doc(db, META_COLLECTION, SEARCH_VERSION_DOC);

  batch.delete(topicRef);

  const currentMeta = await getSearchIndexVersion();
  const nextVersion = (currentMeta?.version || 0) + 1;
  batch.set(metaRef, {
    version: nextVersion,
    updatedAt: serverTimestamp(),
  });

  await batch.commit();
  await removeLocalIndexDoc(slug);
}

export async function getBacklinks(slug: string): Promise<Topic[]> {
  const q = query(
    collection(db, TOPICS_COLLECTION),
    where('outgoingLinks', 'array-contains', slug)
  );
  const snap = await getDocs(q);
  return snap.docs.map((d) => d.data() as Topic);
}

export async function getTopicsByTag(tag: string): Promise<Topic[]> {
  const q = query(
    collection(db, TOPICS_COLLECTION),
    where('tags', 'array-contains', tag.toLowerCase()),
    orderBy('titleLower', 'asc')
  );
  const snap = await getDocs(q);
  return snap.docs.map((d) => d.data() as Topic);
}

export async function getRecentChanges(limitCount = 30): Promise<Topic[]> {
  const q = query(
    collection(db, TOPICS_COLLECTION),
    orderBy('updatedAt', 'desc'),
    limit(limitCount)
  );
  const snap = await getDocs(q);
  return snap.docs.map((d) => d.data() as Topic);
}

export async function getTopicsAlphabetical(
  pageSize = 30,
  afterDoc?: DocumentSnapshot
): Promise<{ topics: Topic[]; lastDoc?: DocumentSnapshot }> {
  let q = query(
    collection(db, TOPICS_COLLECTION),
    orderBy('titleLower', 'asc'),
    limit(pageSize)
  );
  if (afterDoc) {
    q = query(
      collection(db, TOPICS_COLLECTION),
      orderBy('titleLower', 'asc'),
      startAfter(afterDoc),
      limit(pageSize)
    );
  }
  const snap = await getDocs(q);
  const topics = snap.docs.map((d) => d.data() as Topic);
  return {
    topics,
    lastDoc: snap.docs[snap.docs.length - 1],
  };
}
