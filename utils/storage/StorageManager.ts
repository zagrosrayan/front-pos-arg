// utils/storage/StorageManager.ts
import {
  LocalStorageDriver,
  SessionStorageDriver,
  StorageDriver,
} from './StorageDriver'

export type StorageType = 'local' | 'session'

export class StorageManager {
  private drivers: Map<StorageType, StorageDriver>

  constructor() {
    this.drivers = new Map<StorageType, StorageDriver>()
    this.drivers.set('local', new LocalStorageDriver())
    this.drivers.set('session', new SessionStorageDriver())
  }

  private getDriver(type: StorageType): StorageDriver {
    const driver = this.drivers.get(type)
    if (!driver) {
      throw new Error(`Storage driver for type "${type}" not found.`)
    }
    return driver
  }

  getItem<T>(type: StorageType, key: string): T | null {
    return this.getDriver(type).getItem<T>(key)
  }

  setItem<T>(type: StorageType, key: string, value: T): void {
    this.getDriver(type).setItem<T>(key, value)
  }

  removeItem(type: StorageType, key: string): void {
    this.getDriver(type).removeItem(key)
  }

  clear(type: StorageType): void {
    this.getDriver(type).clear()
  }
}

export const storageManager = new StorageManager()
