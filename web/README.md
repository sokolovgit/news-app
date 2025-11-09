# Enterprise Frontend Setup - News App

## 📋 Overview

This is a comprehensive enterprise-grade frontend setup for the News App, built with Nuxt 3, Vue 3, TypeScript, and Tailwind CSS. The configuration follows industry best practices and provides a solid foundation for scalable application development.

## 🎨 Color System

### Brand Palette

The application uses a custom color palette:

| Color Name          | Hex       | HSL            | Usage                           |
| ------------------- | --------- | -------------- | ------------------------------- |
| **Black**           | `#000807` | `173 100% 2%`  | Dark backgrounds, text          |
| **Cool Gray**       | `#a2a3bb` | `238 16% 68%`  | Muted elements, disabled states |
| **Tropical Indigo** | `#9395d3` | `238 42% 70%`  | Primary actions, links          |
| **Periwinkle**      | `#b3b7ee` | `236 63% 82%`  | Secondary actions, accents      |
| **Ghost White**     | `#fbf9ff` | `260 100% 99%` | Light backgrounds, cards        |

### Semantic Tokens

Colors are mapped to semantic tokens that adapt between light and dark themes:

```css
/* Light Theme */
--background: ghost-white --foreground: black --primary: tropical-indigo --secondary: periwinkle
  --muted: cool-gray /* Dark Theme */ --background: black --foreground: ghost-white
  --primary: tropical-indigo (lighter variant) --secondary: periwinkle (adjusted) --muted: cool-gray
  (darker variant);
```

### Usage in Components

```vue
<template>
  <!-- Using semantic tokens (recommended) -->
  <button class="bg-primary text-primary-foreground">Primary Button</button>

  <!-- Using brand colors directly -->
  <div class="text-brand-tropical-indigo">Branded Text</div>
</template>
```

## 📁 Project Structure

```
web/
├── app/
│   ├── assets/
│   │   └── css/
│   │       └── tailwind.css          # Global styles & CSS variables
│   ├── components/
│   │   └── ui/                       # Reusable UI components
│   ├── composables/                  # Vue composables
│   │   ├── useApi.ts                 # API client composable
│   │   ├── useAsyncData.ts           # Enhanced async data handling
│   │   ├── useDebounce.ts            # Debounce utility
│   │   ├── useLocalStorage.ts        # SSR-safe localStorage
│   │   ├── useNotification.ts        # Toast notifications
│   │   └── useTheme.ts               # Theme management
│   ├── config/                       # Application configuration
│   │   ├── app.config.ts             # App-wide settings
│   │   ├── constants.ts              # Constants & enums
│   │   └── index.ts
│   ├── lib/                          # Core libraries
│   │   └── api/
│   │       ├── api-client.ts         # HTTP client implementation
│   │       └── index.ts
│   ├── types/                        # TypeScript type definitions
│   │   ├── api.types.ts              # API-related types
│   │   ├── common.types.ts           # Common types
│   │   ├── env.types.ts              # Environment variable types
│   │   └── index.ts
│   ├── utils/                        # Utility functions
│   │   ├── formatters.ts             # Format helpers
│   │   ├── helpers.ts                # General helpers
│   │   ├── validation.ts             # Validation utilities
│   │   └── index.ts
│   └── app.vue                       # Root component
├── .vscode/
│   ├── extensions.json               # Recommended extensions
│   └── settings.json                 # Editor settings
├── .env.example                      # Environment variables template
├── .gitignore                        # Git ignore rules
├── .prettierrc                       # Prettier configuration
├── .prettierignore                   # Prettier ignore rules
├── nuxt.config.ts                    # Nuxt configuration
├── tailwind.config.ts                # Tailwind configuration
├── tsconfig.json                     # TypeScript configuration
├── package.json                      # Dependencies
├── CONFIGURATION.md                  # Detailed config docs
└── README.md                         # This file
```

## 🚀 Getting Started

### Prerequisites

- Node.js >= 18.x
- npm, yarn, or pnpm

### Installation

1. **Install dependencies:**

```bash
npm install
```

2. **Set up environment variables:**

```bash
cp .env.example .env
```

Edit `.env` with your configuration values.

3. **Start development server:**

```bash
npm run dev
```

The app will be available at `http://localhost:3001`

### Available Scripts

```bash
npm run dev          # Start development server
npm run build        # Build for production
npm run generate     # Generate static site
npm run preview      # Preview production build
npm run lint         # Run ESLint
npm run lint:fix     # Fix ESLint errors
npm run format       # Format with Prettier
```

## ⚙️ Configuration

### Environment Variables

Create a `.env` file based on `.env.example`:

```bash
# Application
NUXT_PUBLIC_APP_NAME=News App
NUXT_PUBLIC_APP_URL=http://localhost:3001
NUXT_PUBLIC_APP_ENV=development

# API
NUXT_PUBLIC_API_BASE_URL=http://localhost:3000/api
NUXT_PUBLIC_API_TIMEOUT=30000

# Features
NUXT_PUBLIC_FEATURE_ANALYTICS=false
NUXT_PUBLIC_FEATURE_DEBUG_MODE=false
```

### Application Configuration

Edit `app/config/app.config.ts` to modify:

- Pagination settings
- API timeout & retry logic
- Theme defaults
- Validation rules
- Cache settings
- Animation durations

### Constants

Edit `app/config/constants.ts` for:

- HTTP status codes
- Storage keys
- Route paths
- API endpoints
- Breakpoints
- Date formats
- Regex patterns

## 🛠️ Key Features

### Type-Safe API Client

```typescript
// app/composables/useApi.ts
const api = useApi()

// GET request
const news = await api.get('/news', { page: 1, pageSize: 20 })

// POST request
const newArticle = await api.post('/news', {
  title: 'Title',
  content: 'Content',
})

// Error handling
try {
  await api.delete('/news/123')
} catch (error) {
  if (error instanceof ApiError) {
    console.error(error.statusCode, error.message)
  }
}
```

### Enhanced Async Data

```typescript
const { data, loading, error, execute, reset } = useAsyncData(
  async () => {
    return await api.get('/news')
  },
  {
    immediate: true,
    onSuccess: (data) => console.log('Loaded:', data),
    onError: (error) => console.error('Error:', error),
  },
)
```

### Notifications

```typescript
const notification = useNotification()

notification.success('Saved!', 'Your changes have been saved')
notification.error('Error', 'Something went wrong')
notification.warning('Warning', 'Please check your input')
notification.info('Info', 'New updates available')
```

### Local Storage (SSR-Safe)

```typescript
const preferences = useLocalStorage('user-preferences', {
  theme: 'light',
  language: 'en',
})

// Automatically synced to localStorage
preferences.value.theme = 'dark'
```

### Debounce

```typescript
// Debounce a ref value
const searchQuery = ref('')
const debouncedQuery = useDebounce(searchQuery, 500)

// Debounce a function
const debouncedSearch = useDebouncedFn(async (query: string) => {
  return await api.get('/search', { q: query })
}, 500)
```

### Utilities

#### Validation

```typescript
import { validation } from '~/utils'

validation.isEmail('test@example.com') // true
validation.isUrl('https://example.com') // true
validation.isEmpty('') // true
validation.isLength('text', 3, 10) // true
```

#### Formatters

```typescript
import { formatNumber, formatCurrency, formatFileSize, formatRelativeTime } from '~/utils'

formatNumber(1000) // "1,000"
formatCurrency(99.99, 'USD') // "$99.99"
formatFileSize(1048576) // "1 MB"
formatRelativeTime(new Date()) // "just now"
```

#### Helpers

```typescript
import { groupBy, unique, sortBy, deepClone } from '~/utils'

const items = [
  { type: 'A', val: 1 },
  { type: 'B', val: 2 },
]

groupBy(items, 'type') // { A: [...], B: [...] }
unique([1, 2, 2, 3]) // [1, 2, 3]
sortBy(items, 'val', 'desc') // Sorted array
const copy = deepClone(items) // Deep copy
```

## 🎭 Theming

The app supports light, dark, and system themes.

### Usage

```vue
<script setup lang="ts">
const { theme, setTheme, isDark } = useTheme()

// Get current theme
console.log(theme.value) // 'light', 'dark', or 'system'

// Set theme
setTheme('dark')

// Check if dark mode is active
console.log(isDark.value)
</script>
```

### Customization

Edit `app/assets/css/tailwind.css` to modify theme colors:

```css
:root {
  --primary: 238 42% 70%; /* Adjust HSL values */
  --background: 260 100% 99%;
  /* ... */
}

.dark {
  --primary: 238 42% 75%; /* Lighter for dark mode */
  --background: 173 100% 2%;
  /* ... */
}
```

## 📝 TypeScript

### Type Imports

```typescript
import type {
  // Common types
  Nullable,
  Optional,
  PaginatedResponse,
  PaginationParams,
  SortParams,

  // API types
  ApiResponse,
  ApiError,
  ApiRequestConfig,

  // Form types
  FormState,

  // Async types
  AsyncState,
  LoadingState,
} from '~/types'
```

### Type-Safe Runtime Config

```typescript
const config = useRuntimeConfig()

// Fully typed
config.public.appName // string
config.public.apiBaseUrl // string
config.public.apiTimeout // number
```

## 🔧 VS Code Setup

### Recommended Extensions

The `.vscode/extensions.json` file includes:

- ESLint
- Prettier
- Volar (Vue)
- Tailwind CSS IntelliSense
- Iconify IntelliSense
- i18n Ally

### Settings

Pre-configured for:

- Auto-format on save
- ESLint auto-fix
- TypeScript workspace version
- Tailwind CSS class completion

## 📚 Additional Documentation

- [CONFIGURATION.md](./CONFIGURATION.md) - Detailed configuration guide
- [THEMING.md](./THEMING.md) - Theme customization guide

## 🤝 Best Practices

1. **Always use semantic color tokens** (`bg-primary`) instead of brand colors for theme support
2. **Import types from `~/types`** for consistency
3. **Use the `useApi` composable** for all API calls
4. **Leverage validation utilities** for consistent validation
5. **Use formatter utilities** for consistent data display
6. **Import constants from `~/config`** instead of hardcoding
7. **Keep environment variables in `.env`** (never commit)
8. **Follow the established folder structure** for new features

## 📦 Tech Stack

- **Framework:** Nuxt 3
- **UI Framework:** Vue 3 (Composition API)
- **Language:** TypeScript
- **Styling:** Tailwind CSS v4
- **Component Library:** Shadcn/ui (Nuxt)
- **Icons:** Lucide Vue
- **Utilities:** VueUse
- **Linting:** ESLint 9
- **Formatting:** Prettier 3

## 🔐 Security Notes

- Never commit `.env` files
- API keys should be server-side only (not in `public` runtime config)
- Sensitive data should use the private runtime config
- Always validate user input
- Use HTTPS in production

## 🚦 Next Steps

Now that the configuration is complete, you can:

1. Create page layouts in `app/layouts/`
2. Add pages in `app/pages/`
3. Build feature-specific components in `app/components/`
4. Implement authentication in `app/modules/auth/`
5. Create API service modules for different features
6. Set up state management if needed (Pinia recommended)

## 📄 License

[Your License Here]

## 👥 Contributors

[Your Team Here]
