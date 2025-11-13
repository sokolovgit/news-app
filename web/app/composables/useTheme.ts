import { computed, onMounted, ref } from 'vue'
import { APP_CONFIG } from '~/config/app.config'

export type Theme = 'light' | 'dark' | 'system'

const THEME_STORAGE_KEY = APP_CONFIG.theme.storageKey

export function useTheme() {
  const theme = ref<Theme>('system')
  const resolvedTheme = ref<'light' | 'dark'>('light')

  const isBrowser = typeof window !== 'undefined'

  const getSystemTheme = (): 'light' | 'dark' => {
    if (!isBrowser) return 'light'
    return window.matchMedia('(prefers-color-scheme: dark)').matches ? 'dark' : 'light'
  }

  const applyTheme = (newTheme: 'light' | 'dark') => {
    if (!isBrowser) return

    const root = document.documentElement
    root.classList.remove('light', 'dark')
    root.classList.add(newTheme)
    resolvedTheme.value = newTheme
  }

  const updateTheme = (newTheme: Theme) => {
    theme.value = newTheme

    if (isBrowser) {
      localStorage.setItem(THEME_STORAGE_KEY, newTheme)
    }

    const effectiveTheme = newTheme === 'system' ? getSystemTheme() : newTheme
    applyTheme(effectiveTheme)
  }

  const toggleTheme = () => {
    const newTheme = resolvedTheme.value === 'light' ? 'dark' : 'light'
    updateTheme(newTheme)
  }

  const setTheme = (newTheme: Theme) => {
    updateTheme(newTheme)
  }

  onMounted(() => {
    if (!isBrowser) return

    const savedTheme = localStorage.getItem(THEME_STORAGE_KEY) as Theme | null
    const initialTheme = savedTheme || 'system'

    theme.value = initialTheme

    const effectiveTheme = initialTheme === 'system' ? getSystemTheme() : initialTheme
    applyTheme(effectiveTheme)

    const mediaQuery = window.matchMedia('(prefers-color-scheme: dark)')
    const handleChange = (e: MediaQueryListEvent) => {
      if (theme.value === 'system') {
        applyTheme(e.matches ? 'dark' : 'light')
      }
    }

    mediaQuery.addEventListener('change', handleChange)

    return () => {
      mediaQuery.removeEventListener('change', handleChange)
    }
  })

  return {
    theme: computed(() => theme.value),
    resolvedTheme: computed(() => resolvedTheme.value),
    setTheme,
    toggleTheme,
  }
}

