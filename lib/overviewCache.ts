// lib/overviewCache.ts
// IndexedDB-backed store for tenant overview snapshots. localStorage caps out around 5 MB, which a tenant with
// a thousand policies plus their assignment rows exceeds; IndexedDB has no practical limit. Every function
// resolves gracefully (null / no-op) when IndexedDB is unavailable, so callers never need a try/catch.

const DB_NAME = 'ia-tenant-overview';
const DB_VERSION = 1;
const STORE = 'snapshots';

function openDb(): Promise<IDBDatabase | null> {
    return new Promise(resolve => {
        if (typeof indexedDB === 'undefined') {
            resolve(null);
            return;
        }
        try {
            const request = indexedDB.open(DB_NAME, DB_VERSION);
            request.onupgradeneeded = () => {
                const db = request.result;
                if (!db.objectStoreNames.contains(STORE)) {
                    db.createObjectStore(STORE);
                }
            };
            request.onsuccess = () => resolve(request.result);
            request.onerror = () => resolve(null);
            request.onblocked = () => resolve(null);
        } catch {
            resolve(null);
        }
    });
}

function runRequest<T>(db: IDBDatabase, mode: IDBTransactionMode, action: (store: IDBObjectStore) => IDBRequest<T>): Promise<T | null> {
    return new Promise(resolve => {
        try {
            const tx = db.transaction(STORE, mode);
            const request = action(tx.objectStore(STORE));
            request.onsuccess = () => resolve(request.result);
            request.onerror = () => resolve(null);
            tx.oncomplete = () => db.close();
            tx.onabort = () => { db.close(); resolve(null); };
        } catch {
            db.close();
            resolve(null);
        }
    });
}

export async function readCachedSnapshot<T>(key: string): Promise<T | null> {
    const db = await openDb();
    if (!db) return null;
    const value = await runRequest<T | undefined>(db, 'readonly', store => store.get(key) as IDBRequest<T | undefined>);
    return value ?? null;
}

export async function writeCachedSnapshot<T>(key: string, value: T): Promise<boolean> {
    const db = await openDb();
    if (!db) return false;
    const result = await runRequest(db, 'readwrite', store => store.put(value, key));
    return result !== null;
}

export async function deleteCachedSnapshot(key: string): Promise<void> {
    const db = await openDb();
    if (!db) return;
    await runRequest(db, 'readwrite', store => store.delete(key));
}

/** Removes every cached overview for every user/tenant — called on sign-out so nothing lingers on shared machines. */
export async function clearCachedSnapshots(): Promise<void> {
    const db = await openDb();
    if (!db) return;
    await runRequest(db, 'readwrite', store => store.clear());
}
