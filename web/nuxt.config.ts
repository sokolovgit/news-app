import tailwindcss from "@tailwindcss/vite";

// https://nuxt.com/docs/api/configuration/nuxt-config
export default defineNuxtConfig({
  compatibilityDate: '2025-07-15',
  devtools: { enabled: true },
  devServer: {
    host: '0.0.0.0',
    port: 3001
  },
  vite: {
    plugins: [
      tailwindcss(),
    ],
  },
  css: ['./app/assets/css/main.css'],
})
