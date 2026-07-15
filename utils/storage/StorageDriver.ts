// utils/storage/StorageDriver.ts
export interface StorageDriver {
  getItem<T>(key: string): T | null
  setItem<T>(key: string, value: T): void
  removeItem(key: string): void
  clear(): void
}

export class LocalStorageDriver implements StorageDriver {
  getItem<T>(key: string): T | null {
    if (typeof window === 'undefined') return null
    const data = localStorage.getItem(key)
    return data ? JSON.parse(data) : null
  }

  setItem<T>(key: string, value: T): void {
    if (typeof window === 'undefined') return
    localStorage.setItem(key, JSON.stringify(value))
  }

  removeItem(key: string): void {
    if (typeof window === 'undefined') return
    localStorage.removeItem(key)
  }

  clear(): void {
    if (typeof window === 'undefined') return
    localStorage.clear()
  }
}

export class SessionStorageDriver implements StorageDriver {
  getItem<T>(key: string): T | null {
    if (typeof window === 'undefined') return null
    const data = sessionStorage.getItem(key)
    return data ? JSON.parse(data) : null
  }

  setItem<T>(key: string, value: T): void {
    if (typeof window === 'undefined') return
    sessionStorage.setItem(key, JSON.stringify(value))
  }

  removeItem(key: string): void {
    if (typeof window === 'undefined') return
    sessionStorage.removeItem(key)
  }

  clear(): void {
    if (typeof window === 'undefined') return
    sessionStorage.clear()
  }
}
