/**
 * Debounce composable
 * Delays function execution until after wait time has elapsed since last call
 */

import type { Ref } from 'vue'

export function useDebounce<T>(value: Ref<T>, delay = 300): Ref<T> {
  const debouncedValue = ref(value.value) as Ref<T>
  let timeoutId: ReturnType<typeof setTimeout> | null = null

  watch(value, (newValue) => {
    if (timeoutId) {
      clearTimeout(timeoutId)
    }

    timeoutId = setTimeout(() => {
      debouncedValue.value = newValue
    }, delay)
  })

  onUnmounted(() => {
    if (timeoutId) {
      clearTimeout(timeoutId)
    }
  })

  return debouncedValue
}

export function useDebouncedFn<T extends (...args: unknown[]) => unknown>(
  fn: T,
  delay = 300,
): T {
  let timeoutId: ReturnType<typeof setTimeout> | null = null

  const debouncedFn = ((...args: Parameters<T>) => {
    if (timeoutId) {
      clearTimeout(timeoutId)
    }

    return new Promise<ReturnType<T>>((resolve) => {
      timeoutId = setTimeout(() => {
        resolve(fn(...args) as ReturnType<T>)
      }, delay)
    })
  }) as T

  onUnmounted(() => {
    if (timeoutId) {
      clearTimeout(timeoutId)
    }
  })

  return debouncedFn
}

