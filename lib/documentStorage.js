export const DOCUMENTS_KEY = 'deepwrite-documents';
export const DELETED_KEY = 'deepwrite-deleted-documents';

export function countWords(text = '') {
  const plain = String(text).replace(/<[^>]*>/g, ' ').replace(/&nbsp;/g, ' ');
  return plain.trim() ? plain.trim().split(/\s+/).length : 0;
}

export function normalizeDocument(doc) {
  const now = Date.now();
  return {
    id: doc.id || `${now}-${Math.random().toString(36).slice(2)}`,
    title: doc.title || 'Untitled document',
    content: doc.content || '',
    documentType: doc.documentType || 'General',
    folder: doc.folder || 'Unfiled',
    favorite: Boolean(doc.favorite),
    archived: Boolean(doc.archived),
    deleted: Boolean(doc.deleted),
    createdAt: doc.createdAt || now,
    updatedAt: doc.updatedAt || now,
    versions: Array.isArray(doc.versions) ? doc.versions : [],
  };
}

export function readDocuments() {
  if (typeof window === 'undefined') return [];
  try {
    return JSON.parse(localStorage.getItem(DOCUMENTS_KEY) || '[]').map(normalizeDocument);
  } catch {
    return [];
  }
}

export function writeDocuments(documents) {
  if (typeof window === 'undefined') return;
  localStorage.setItem(DOCUMENTS_KEY, JSON.stringify(documents));
}

export function createVersion(doc) {
  const versions = Array.isArray(doc.versions) ? doc.versions : [];
  return {
    ...doc,
    versions: [
      {
        id: `${Date.now()}-${Math.random().toString(36).slice(2)}`,
        title: doc.title,
        content: doc.content,
        savedAt: Date.now(),
      },
      ...versions,
    ].slice(0, 30),
  };
}
