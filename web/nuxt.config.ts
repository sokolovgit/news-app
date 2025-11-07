// https://nuxt.com/docs/api/configuration/nuxt-config
import tailwindcss from '@tailwindcss/vite'

export default defineNuxtConfig({
  compatibilityDate: '2025-07-15',
  devtools: { enabled: true },

  devServer: {
    host: '0.0.0.0',
    port: 3001,
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
    componentDir: './app/components/ui'
  },

  css: ['./app/assets/css/tailwind.css'],
  plugins: ['./app/plugins/ssr-width.ts'],
  modules: [
    '@nuxt/eslint',
    'shadcn-nuxt',
    '@vueuse/nuxt',
  ],

  vite: {
    plugins: [
      tailwindcss(),
    ],
  },
})