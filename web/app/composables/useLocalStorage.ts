/**
 * Local storage composable with SSR support
 */

import type { Ref } from 'vue'

export interface UseLocalStorageOptions<T> {
  serializer?: {
    read: (raw: string) => T
    write: (value: T) => string
  }
  onError?: (error: Error) => void
}

const defaultSerializer = {
  read: <T>(raw: string): T => JSON.parse(raw),
  write: <T>(value: T): string => JSON.stringify(value),
}

export function useLocalStorage<T>(
  key: string,
  defaultValue: T,
  options: UseLocalStorageOptions<T> = {},
): Ref<T> {
  const {
    serializer = defaultSerializer,
    onError = (error) => console.error(error),
  } = options

  const data = ref(defaultValue) as Ref<T>

  // Read from localStorage on mount (client-side only)
  const read = () => {
    if (!import.meta.client) return

    try {
      const rawValue = localStorage.getItem(key)
      if (rawValue !== null) {
        data.value = serializer.read(rawValue)
      }
    } catch (error) {
      onError(error instanceof Error ? error : new Error(String(error)))
    }
  }

  // Write to localStorage
  const write = () => {
    if (!import.meta.client) return

    try {
      if (data.value === null || data.value === undefined) {
        localStorage.removeItem(key)
      } else {
        localStorage.setItem(key, serializer.write(data.value))
      }
    } catch (error) {
      onError(error instanceof Error ? error : new Error(String(error)))
    }
  }

  // Initialize
  read()

  // Watch for changes and sync to localStorage
  watch(
    data,
    () => {
      write()
    },
    { deep: true },
  )

  // Listen to storage events from other tabs
  if (import.meta.client) {
    window.addEventListener('storage', (event: StorageEvent) => {
      if (event.key === key && event.newValue !== null) {
        try {
          data.value = serializer.read(event.newValue)
        } catch (error) {
          onError(error instanceof Error ? error : new Error(String(error)))
        }
      }
    })
  }

  return data
}

