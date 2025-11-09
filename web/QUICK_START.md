# Quick Start Guide

## 🚀 Installation & Setup

### 1. Verify Installation

All configuration files and utilities have been set up. To verify everything is in place:

```bash
# Check that you're in the web directory
cd web

# Verify package.json exists
ls package.json

# Verify configuration files
ls -la | grep -E '\.(json|ts|md|prettierrc|editorconfig)'
```

### 2. Install Dependencies (if not already done)

```bash
npm install
```

### 3. Start Development Server

```bash
npm run dev
```

The application should start at `http://localhost:3001`

### 4. View Color Palette Reference

Navigate to: `http://localhost:3001` and add the ColorPaletteReference component to your app.vue to see all colors.

---

## 📁 What Was Set Up

### ✅ Configuration Files

- [x] `tailwind.config.ts` - Tailwind with custom palette
- [x] `nuxt.config.ts` - Enhanced Nuxt configuration
- [x] `tsconfig.json` - TypeScript configuration (pre-existing)
- [x] `.prettierrc` - Code formatting rules
- [x] `.prettierignore` - Prettier ignore patterns
- [x] `.eslintrc.cjs` - ESLint configuration
- [x] `.editorconfig` - Editor consistency
- [x] `.gitignore` - Updated ignore rules

### ✅ Environment Files

- [x] `.env.example` - Environment template
- [x] `.env.development` - Dev environment
- [x] `.env.production` - Production environment

### ✅ Type Definitions (`app/types/`)

- [x] `common.types.ts` - 40+ common types
- [x] `api.types.ts` - API-specific types
- [x] `env.types.ts` - Runtime config types
- [x] `index.ts` - Type exports

### ✅ Configuration (`app/config/`)

- [x] `app.config.ts` - App-wide settings
- [x] `constants.ts` - Constants & enums
- [x] `index.ts` - Config exports

### ✅ API Client (`app/lib/api/`)

- [x] `api-client.ts` - HTTP client
- [x] `index.ts` - API exports

### ✅ Composables (`app/composables/`)

- [x] `useApi.ts` - API client composable
- [x] `useAsyncData.ts` - Enhanced async data
- [x] `useNotification.ts` - Toast notifications
- [x] `useLocalStorage.ts` - SSR-safe storage
- [x] `useDebounce.ts` - Debouncing
- [x] `useTheme.ts` - Theme management (pre-existing)

### ✅ Utilities (`app/utils/`)

- [x] `validation.ts` - Validation helpers
- [x] `formatters.ts` - Formatting functions
- [x] `helpers.ts` - General helpers
- [x] `index.ts` - Utility exports

### ✅ Styles (`app/assets/css/`)

- [x] `tailwind.css` - Custom CSS variables & styles

### ✅ Components (`app/components/`)

- [x] `ColorPaletteReference.vue` - Color reference
- [x] `ThemeSwitcher.vue` - Theme switcher (pre-existing)
- [x] `ThemeToggle.vue` - Theme toggle (pre-existing)

### ✅ VS Code Setup (`.vscode/`)

- [x] `settings.json` - Workspace settings
- [x] `extensions.json` - Recommended extensions

### ✅ Documentation

- [x] `README.md` - Complete project docs
- [x] `CONFIGURATION.md` - Detailed config guide
- [x] `SETUP_SUMMARY.md` - What was set up
- [x] `QUICK_START.md` - This file
- [x] `THEMING.md` - Theme guide (pre-existing)

---

## 🎨 Using Your Custom Palette

### Brand Colors (Direct Access)

```vue
<template>
  <!-- Use brand colors directly -->
  <div class="bg-brand-black">Black background</div>
  <div class="text-brand-tropical-indigo">Indigo text</div>
  <div class="border-brand-periwinkle">Periwinkle border</div>
</template>
```

### Semantic Tokens (Recommended)

```vue
<template>
  <!-- Use semantic tokens for theme support -->
  <div class="bg-primary text-primary-foreground">Primary button</div>

  <div class="bg-secondary text-secondary-foreground">Secondary button</div>

  <div class="bg-card text-card-foreground border border-border">Card content</div>
</template>
```

### Available Semantic Colors

- `background` / `foreground`
- `primary` / `primary-foreground`
- `secondary` / `secondary-foreground`
- `muted` / `muted-foreground`
- `accent` / `accent-foreground`
- `card` / `card-foreground`
- `popover` / `popover-foreground`
- `destructive` / `destructive-foreground`
- `success` / `success-foreground`
- `warning` / `warning-foreground`
- `info` / `info-foreground`

---

## 🔨 Quick Examples

### 1. Make an API Call

```vue
<script setup lang="ts">
const api = useApi()

const { data, loading, error } = useAsyncData(async () => {
  return await api.get('/news')
})
</script>

<template>
  <div v-if="loading">Loading...</div>
  <div v-else-if="error">Error: {{ error.message }}</div>
  <div v-else>{{ data }}</div>
</template>
```

### 2. Show a Notification

```vue
<script setup lang="ts">
const notification = useNotification()

const handleSave = async () => {
  try {
    // ... save logic
    notification.success('Saved!', 'Your changes have been saved')
  } catch (error) {
    notification.error('Error', 'Failed to save changes')
  }
}
</script>
```

### 3. Use Local Storage

```vue
<script setup lang="ts">
const preferences = useLocalStorage('user-preferences', {
  theme: 'light',
  language: 'en',
})

// Automatically synced to localStorage
const toggleTheme = () => {
  preferences.value.theme = preferences.value.theme === 'light' ? 'dark' : 'light'
}
</script>
```

### 4. Validate Input

```vue
<script setup lang="ts">
import { validation } from '~/utils'

const email = ref('')
const isValid = computed(() => validation.isEmail(email.value))
</script>

<template>
  <input v-model="email" type="email" />
  <span v-if="!isValid" class="text-destructive">Invalid email</span>
</template>
```

### 5. Format Data

```vue
<script setup lang="ts">
import { formatCurrency, formatRelativeTime } from '~/utils'

const price = 99.99
const date = new Date('2024-01-01')
</script>

<template>
  <div>Price: {{ formatCurrency(price, 'USD') }}</div>
  <div>Posted: {{ formatRelativeTime(date) }}</div>
</template>
```

---

## 🎯 Next Steps

### For Development

1. **Create your first page**

   ```bash
   # Create a news page
   mkdir -p app/pages/news
   touch app/pages/news/index.vue
   ```

2. **Create components**

   ```bash
   mkdir -p app/components/news
   touch app/components/news/NewsCard.vue
   ```

3. **Add a service**
   ```bash
   mkdir -p app/services
   touch app/services/news.service.ts
   ```

### For Customization

1. **Adjust colors** - Edit `app/assets/css/tailwind.css`
2. **Change config** - Edit `app/config/app.config.ts`
3. **Add constants** - Edit `app/config/constants.ts`
4. **Add types** - Add to `app/types/`

---

## 🐛 Troubleshooting

### TypeScript Errors

```bash
# Restart TypeScript server in VS Code
# CMD/CTRL + Shift + P -> "TypeScript: Restart TS Server"
```

### Tailwind Classes Not Working

```bash
# Make sure dev server is running
npm run dev

# Check tailwind.config.ts content paths
```

### Import Errors

```bash
# Use ~ alias for app directory
import { validation } from '~/utils'
import type { ApiResponse } from '~/types'
```

### Environment Variables Not Loading

```bash
# Make sure you have .env file (copy from .env.example)
cp .env.example .env

# Restart dev server
npm run dev
```

---

## 📚 Documentation

- [README.md](./README.md) - Full documentation
- [CONFIGURATION.md](./CONFIGURATION.md) - Configuration details
- [SETUP_SUMMARY.md](./SETUP_SUMMARY.md) - What was configured
- [THEMING.md](./THEMING.md) - Theme customization

---

## ✅ Verification Checklist

Run these commands to verify everything is working:

```bash
# 1. Check TypeScript compilation
npm run build

# 2. Run linter
npm run lint

# 3. Format code
npm run format

# 4. Start dev server
npm run dev
```

If all commands succeed, your setup is complete! 🎉

---

## 🤝 Getting Help

If you encounter any issues:

1. Check the documentation files
2. Review the setup summary
3. Check VS Code for TypeScript errors
4. Verify environment variables are set
5. Ensure dependencies are installed

---

**Your enterprise frontend is ready to go! Happy coding! 🚀**
