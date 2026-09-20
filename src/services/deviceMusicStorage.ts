// Native IndexedDB storage for device music library
// Persists scanned audio files and metadata across browser sessions on Laptop & Mobile

export interface DeviceTrackRecord {
  id: string;
  name: string;
  title: string;
  artist: string;
  album: string;
  format: string; // e.g. MP3, WAV, FLAC, M4A, AAC, OGG
  sizeFormatted: string;
  sizeBytes: number;
  durationMs: number;
  dateAdded: string;
  blob?: Blob;
  objectUrl?: string;
}

const DB_NAME = 'MuseDeviceMusicDB';
const DB_VERSION = 1;
const STORE_NAME = 'device_tracks';

function openDB(): Promise<IDBDatabase> {
  return new Promise((resolve, reject) => {
    if (typeof window === 'undefined' || !window.indexedDB) {
      return reject(new Error('IndexedDB not supported in this environment'));
    }

    const request = window.indexedDB.open(DB_NAME, DB_VERSION);

    request.onupgradeneeded = (event) => {
      const db = (event.target as IDBOpenDBRequest).result;
      if (!db.objectStoreNames.contains(STORE_NAME)) {
        db.createObjectStore(STORE_NAME, { keyPath: 'id' });
      }
    };

    request.onsuccess = () => {
      resolve(request.result);
    };

    request.onerror = () => {
      reject(request.error);
    };
  });
}

/**
 * Save multiple device tracks into IndexedDB
 */
export async function saveDeviceTracks(tracks: DeviceTrackRecord[]): Promise<void> {
  const db = await openDB();
  return new Promise((resolve, reject) => {
    const tx = db.transaction(STORE_NAME, 'readwrite');
    const store = tx.objectStore(STORE_NAME);

    for (const track of tracks) {
      // Clone track without objectUrl (since objectUrl is transient)
      const toStore: DeviceTrackRecord = {
        id: track.id,
        name: track.name,
        title: track.title,
        artist: track.artist,
        album: track.album,
        format: track.format,
        sizeFormatted: track.sizeFormatted,
        sizeBytes: track.sizeBytes,
        durationMs: track.durationMs,
        dateAdded: track.dateAdded,
        blob: track.blob
      };
      store.put(toStore);
    }

    tx.oncomplete = () => resolve();
    tx.onerror = () => reject(tx.error);
  });
}

/**
 * Load all stored device tracks from IndexedDB and regenerate objectUrls
 */
export async function loadAllDeviceTracks(): Promise<DeviceTrackRecord[]> {
  try {
    const db = await openDB();
    return new Promise((resolve, reject) => {
      const tx = db.transaction(STORE_NAME, 'readonly');
      const store = tx.objectStore(STORE_NAME);
      const request = store.getAll();

      request.onsuccess = () => {
        const records = request.result as DeviceTrackRecord[];
        const withUrls = records.map((record) => {
          let objectUrl = '';
          if (record.blob) {
            try {
              objectUrl = URL.createObjectURL(record.blob);
            } catch (e) {
              console.warn('Failed to create object URL for track:', record.name, e);
            }
          }
          return {
            ...record,
            objectUrl
          };
        });
        resolve(withUrls);
      };

      request.onerror = () => reject(request.error);
    });
  } catch (err) {
    console.warn('Could not load device tracks from IndexedDB:', err);
    return [];
  }
}

/**
 * Delete a single track from IndexedDB
 */
export async function deleteDeviceTrack(id: string): Promise<void> {
  const db = await openDB();
  return new Promise((resolve, reject) => {
    const tx = db.transaction(STORE_NAME, 'readwrite');
    const store = tx.objectStore(STORE_NAME);
    const request = store.delete(id);

    request.onsuccess = () => resolve();
    request.onerror = () => reject(request.error);
  });
}

/**
 * Clear all device tracks from IndexedDB (e.g. revoke permission / reset)
 */
export async function clearAllDeviceTracks(): Promise<void> {
  const db = await openDB();
  return new Promise((resolve, reject) => {
    const tx = db.transaction(STORE_NAME, 'readwrite');
    const store = tx.objectStore(STORE_NAME);
    const request = store.clear();

    request.onsuccess = () => resolve();
    request.onerror = () => reject(request.error);
  });
}
