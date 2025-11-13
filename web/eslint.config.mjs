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
  {
    rules: {
      'vue/html-self-closing': [
        'error',
        {
          html: {
            void: 'any', // Allow both <img> and <img /> for void elements
            normal: 'always',
            component: 'always',
          },
          svg: 'always',
          math: 'always',
        },
      ],
    },
  },
)
