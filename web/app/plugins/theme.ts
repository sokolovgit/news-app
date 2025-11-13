/**
 * Theme initialization plugin
 * Note: Initial theme is applied by a blocking script in nuxt.config.ts
 * This plugin ensures the theme class is present (backup for SSR scenarios)
 */
import { APP_CONFIG } from '~/config/app.config'

export default defineNuxtPlugin(() => {
  // Only run on client side
  if (!import.meta.client) return

  const THEME_STORAGE_KEY = APP_CONFIG.theme.storageKey

  const getSystemTheme = (): 'light' | 'dark' => {
    return window.matchMedia('(prefers-color-scheme: dark)').matches ? 'dark' : 'light'
  }

  // Ensure theme is applied (the blocking script should have already done this)
  const root = document.documentElement
  if (!root.classList.contains('light') && !root.classList.contains('dark')) {
    const savedTheme = localStorage.getItem(THEME_STORAGE_KEY) as 'light' | 'dark' | 'system' | null
    const initialTheme = savedTheme || 'system'
    const effectiveTheme = initialTheme === 'system' ? getSystemTheme() : initialTheme
    root.classList.add(effectiveTheme)
  }
})

