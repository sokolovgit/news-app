// @ts-check
import withNuxt from './.nuxt/eslint.config.mjs'

export default withNuxt(
  // Your custom configs here
  {
    files: ['app/components/ui/**/*.vue'],
    rules: {
      'vue/require-default-prop': 'off',
    },
  },
)
