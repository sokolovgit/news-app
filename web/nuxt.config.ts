// https://nuxt.com/docs/api/configuration/nuxt-config
import tailwindcss from '@tailwindcss/vite'

export default defineNuxtConfig({
  compatibilityDate: '2025-07-15',
  devtools: { enabled: true },

  devServer: {
    host: '0.0.0.0',
    port: 3001,
  },

  dir: {
    public: './app/public',
  },

  shadcn: {
    /**
     * Prefix for all the imported component
     */
    prefix: '',
    /**
     * Directory that the component lives in.
     * @default "./components/ui"
     */
    componentDir: './app/components/ui',
  },

  css: ['./app/assets/css/tailwind.css'],
  modules: ['@nuxt/eslint', 'shadcn-nuxt', '@vueuse/nuxt', '@nuxt/icon', '@pinia/nuxt'],

  vite: {
    plugins: [tailwindcss()],
  },

  icon: {
    mode: 'css',
    cssLayer: 'base'
  },

   typescript: {
    typeCheck: false,
    strict: true,
  },

  // Runtime configuration
  runtimeConfig: {
    // Private keys (server-side only)
    apiSecretKey: '',
    databaseUrl: '',

    // Public keys (exposed to client)
    public: {
      appName: 'News App',
      appUrl: 'http://localhost:3001',
      appEnv: 'development' as 'development' | 'staging' | 'production',
      apiBaseUrl: 'http://localhost:3000/api',
      apiTimeout: 30000,
      featureAnalytics: false,
      featureDebugMode: false,
    },
  },

  // App configuration
  app: {
    head: {
      title: 'News App',
      meta: [
        { charset: 'utf-8' },
        { name: 'viewport', content: 'width=device-width, initial-scale=1' },
        { name: 'description', content: 'Enterprise News Application' },
      ],
      link: [
        { rel: 'icon', type: 'image/x-icon', href: '/favicon.ico' },
        // Add Inter font
        { rel: 'preconnect', href: 'https://fonts.googleapis.com' },
        { rel: 'preconnect', href: 'https://fonts.gstatic.com', crossorigin: '' },
        {
          rel: 'stylesheet',
          href: 'https://fonts.googleapis.com/css2?family=Inter:wght@300;400;500;600;700&display=swap',
        },
      ],
      script: [
        {
          innerHTML: `
            (function() {
              const theme = localStorage.getItem('news-app-theme') || 'system';
              const getSystemTheme = () => window.matchMedia('(prefers-color-scheme: dark)').matches ? 'dark' : 'light';
              const effectiveTheme = theme === 'system' ? getSystemTheme() : theme;
              document.documentElement.classList.add(effectiveTheme);
            })();
          `,
          type: 'text/javascript',
        },
      ],
    },
  },

  // Build configuration
  build: {
    transpile: ['vue', '@vueuse/core'],
  },

  // Experimental features
  experimental: {
    typedPages: true,
    viewTransition: true,
  },
})