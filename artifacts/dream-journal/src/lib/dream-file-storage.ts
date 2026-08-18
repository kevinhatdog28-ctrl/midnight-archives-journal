import type { Dream } from "@workspace/api-client-react";

type DirectoryPermission = "granted" | "denied" | "prompt";

type WritableFile = {
  write(data: string): Promise<void>;
  close(): Promise<void>;
};

type DreamDirectoryHandle = {
  name: string;
  queryPermission?: (descriptor?: { mode: "read" | "readwrite" }) => Promise<DirectoryPermission>;
  requestPermission?: (descriptor?: { mode: "read" | "readwrite" }) => Promise<DirectoryPermission>;
  getFileHandle(name: string, options?: { create?: boolean }): Promise<{
    createWritable(): Promise<WritableFile>;
  }>;
};

type PickerWindow = Window & {
  showDirectoryPicker?: (options?: { mode?: "read" | "readwrite" }) => Promise<DreamDirectoryHandle>;
};

const DATABASE_NAME = "midnight-archives-storage";
const STORE_NAME = "settings";
const DIRECTORY_KEY = "dream-directory";

function getPickerWindow() {
  return typeof window === "undefined" ? null : (window as PickerWindow);
}

export function isDreamStorageSupported() {
  return Boolean(getPickerWindow()?.showDirectoryPicker && typeof indexedDB !== "undefined");
}

function openStorageDatabase(): Promise<IDBDatabase> {
  return new Promise((resolve, reject) => {
    const request = indexedDB.open(DATABASE_NAME, 1);
    request.onupgradeneeded = () => {
      request.result.createObjectStore(STORE_NAME);
    };
    request.onsuccess = () => resolve(request.result);
    request.onerror = () => reject(request.error ?? new Error("Unable to open local storage settings."));
  });
}

async function getStoredDirectory(): Promise<DreamDirectoryHandle | null> {
  if (!isDreamStorageSupported()) return null;
  const database = await openStorageDatabase();

  return new Promise((resolve, reject) => {
    const request = database
      .transaction(STORE_NAME, "readonly")
      .objectStore(STORE_NAME)
      .get(DIRECTORY_KEY);
    request.onsuccess = () => {
      database.close();
      resolve((request.result as DreamDirectoryHandle | undefined) ?? null);
    };
    request.onerror = () => {
      database.close();
      reject(request.error ?? new Error("Unable to read the selected folder."));
    };
  });
}

async function storeDirectory(directory: DreamDirectoryHandle) {
  const database = await openStorageDatabase();

  return new Promise<void>((resolve, reject) => {
    const request = database
      .transaction(STORE_NAME, "readwrite")
      .objectStore(STORE_NAME)
      .put(directory, DIRECTORY_KEY);
    request.onsuccess = () => {
      database.close();
      resolve();
    };
    request.onerror = () => {
      database.close();
      reject(request.error ?? new Error("Unable to remember the selected folder."));
    };
  });
}

async function hasWritePermission(directory: DreamDirectoryHandle) {
  if (!directory.queryPermission) return true;
  return (await directory.queryPermission({ mode: "readwrite" })) === "granted";
}

export async function chooseDreamStorageFolder(): Promise<string | null> {
  const picker = getPickerWindow()?.showDirectoryPicker;
  if (!picker) return null;

  try {
    const directory = await picker({ mode: "readwrite" });
    const permission = directory.requestPermission
      ? await directory.requestPermission({ mode: "readwrite" })
      : "granted";

    if (permission !== "granted") return null;
    await storeDirectory(directory);
    return directory.name;
  } catch (error) {
    if (error instanceof DOMException && error.name === "AbortError") return null;
    throw error;
  }
}

export async function getDreamStorageFolderName() {
  const directory = await getStoredDirectory();
  return directory?.name ?? null;
}

export type DreamFileSaveResult = "saved" | "not-configured" | "permission-needed" | "failed";

export async function saveDreamToFolder(dream: Dream): Promise<DreamFileSaveResult> {
  try {
    const directory = await getStoredDirectory();
    if (!directory) return "not-configured";
    if (!(await hasWritePermission(directory))) return "permission-needed";

    const file = await directory.getFileHandle(`dream-${dream.id}.json`, { create: true });
    const writable = await file.createWritable();
    await writable.write(
      JSON.stringify(
        {
          format: "midnight-archives-dream",
          version: 1,
          exportedAt: new Date().toISOString(),
          dream,
        },
        null,
        2,
      ),
    );
    await writable.close();
    return "saved";
  } catch {
    return "failed";
  }
}