const DB_NAME = 'RBX_FILES_DB';
const DB_VERSION = 1;
const STORE_NAME = 'routeFiles';

interface FileRecord {
  routeId: string;
  fileName: string;
  fileData: ArrayBuffer;
  fileType: string;
  uploadDate: number;
}

class FileStorage {
  private db: IDBDatabase | null = null;

  async init(): Promise<void> {
    return new Promise((resolve, reject) => {
      const request = indexedDB.open(DB_NAME, DB_VERSION);

      request.onerror = () => reject(request.error);
      request.onsuccess = () => {
        this.db = request.result;
        resolve();
      };

      request.onupgradeneeded = (event) => {
        const db = (event.target as IDBOpenDBRequest).result;
        if (!db.objectStoreNames.contains(STORE_NAME)) {
          const store = db.createObjectStore(STORE_NAME, { keyPath: ['routeId', 'fileName'] });
          store.createIndex('routeId', 'routeId', { unique: false });
          store.createIndex('uploadDate', 'uploadDate', { unique: false });
        }
      };
    });
  }

  async saveFiles(routeId: string, files: File[]): Promise<void> {
    if (!this.db) await this.init();

    if (files.length === 0) {
      return;
    }

    const arrayBuffers = await Promise.all(
      files.map((file) => file.arrayBuffer())
    );

    return new Promise((resolve, reject) => {
      const transaction = this.db!.transaction([STORE_NAME], 'readwrite');
      const store = transaction.objectStore(STORE_NAME);

      let completed = 0;
      const total = files.length;
      let hasError = false;

      const checkComplete = () => {
        if (completed === total && !hasError) {
          resolve();
        }
      };

      transaction.onerror = (event) => {
        if (!hasError) {
          hasError = true;
          reject(transaction.error || new Error('Ошибка транзакции IndexedDB'));
        }
      };

      transaction.onabort = () => {
        if (!hasError) {
          hasError = true;
          reject(new Error('Транзакция была прервана'));
        }
      };

      files.forEach((file, index) => {
        try {
          const record: FileRecord = {
            routeId,
            fileName: file.name,
            fileData: arrayBuffers[index],
            fileType: file.type || this.getFileTypeFromName(file.name),
            uploadDate: Date.now(),
          };

          const request = store.put(record);
          
          request.onerror = () => {
            if (!hasError) {
              hasError = true;
              reject(request.error || new Error(`Ошибка сохранения файла: ${file.name}`));
            }
          };
          
          request.onsuccess = () => {
            completed++;
            checkComplete();
          };
        } catch (error) {
          if (!hasError) {
            hasError = true;
            reject(error instanceof Error ? error : new Error('Неизвестная ошибка'));
          }
        }
      });
    });
  }

  private getFileTypeFromName(fileName: string): string {
    const ext = fileName.toLowerCase().substring(fileName.lastIndexOf('.'));
    const typeMap: Record<string, string> = {
      '.jpg': 'image/jpeg',
      '.jpeg': 'image/jpeg',
      '.png': 'image/png',
      '.tiff': 'image/tiff',
      '.tif': 'image/tiff',
      '.dng': 'image/x-adobe-dng',
      '.raw': 'image/x-raw',
      '.cr2': 'image/x-canon-cr2',
      '.cr3': 'image/x-canon-cr3',
      '.nef': 'image/x-nikon-nef',
      '.arw': 'image/x-sony-arw',
    };
    return typeMap[ext] || 'application/octet-stream';
  }

  async getFiles(routeId: string): Promise<File[]> {
    if (!this.db) await this.init();

    return new Promise((resolve, reject) => {
      const transaction = this.db!.transaction([STORE_NAME], 'readonly');
      const store = transaction.objectStore(STORE_NAME);
      const index = store.index('routeId');
      const request = index.getAll(routeId);

      request.onerror = () => reject(request.error);
      request.onsuccess = () => {
        const records = request.result as FileRecord[];
        const files = records.map((record) => {
          const blob = new Blob([record.fileData], { type: record.fileType });
          return new File([blob], record.fileName, { type: record.fileType });
        });
        resolve(files);
      };
    });
  }

  async getFileCount(routeId: string): Promise<number> {
    if (!this.db) await this.init();

    return new Promise((resolve, reject) => {
      const transaction = this.db!.transaction([STORE_NAME], 'readonly');
      const store = transaction.objectStore(STORE_NAME);
      const index = store.index('routeId');
      const request = index.count(routeId);

      request.onerror = () => reject(request.error);
      request.onsuccess = () => resolve(request.result);
    });
  }

  async deleteRouteFiles(routeId: string): Promise<void> {
    if (!this.db) await this.init();

    return new Promise((resolve, reject) => {
      const transaction = this.db!.transaction([STORE_NAME], 'readwrite');
      const store = transaction.objectStore(STORE_NAME);
      const index = store.index('routeId');
      const request = index.openKeyCursor(IDBKeyRange.only(routeId));

      request.onerror = () => reject(request.error);
      request.onsuccess = () => {
        const cursor = request.result;
        if (cursor) {
          store.delete(cursor.primaryKey);
          cursor.continue();
        } else {
          resolve();
        }
      };
    });
  }

  async getAllFileNames(routeId: string): Promise<string[]> {
    if (!this.db) await this.init();

    return new Promise((resolve, reject) => {
      const transaction = this.db!.transaction([STORE_NAME], 'readonly');
      const store = transaction.objectStore(STORE_NAME);
      const index = store.index('routeId');
      const request = index.getAll(routeId);

      request.onerror = () => reject(request.error);
      request.onsuccess = () => {
        const records = request.result as FileRecord[];
        resolve(records.map((r) => r.fileName));
      };
    });
  }
}

export const fileStorage = new FileStorage();

