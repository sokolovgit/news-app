# Configuration Guide

This document describes the configuration setup for the News App frontend.

## Table of Contents

- [Environment Variables](#environment-variables)
- [Application Configuration](#application-configuration)
- [Color System](#color-system)
- [TypeScript Setup](#typescript-setup)
- [API Client](#api-client)
- [Utilities](#utilities)

## Environment Variables

### Files

- `.env.example` - Template for environment variables
- `.env.development` - Development environment config
- `.env.production` - Production environment config
- `.env` - Local overrides (gitignored)

### Available Variables

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

## Application Configuration

Configuration constants are defined in `app/config/`:

### `app.config.ts`

Application-wide settings:

- Navigation settings
- Pagination defaults
- API configuration
- Theme settings
- Validation rules
- Cache settings
- Animation durations

### `constants.ts`

Application constants:

- HTTP status codes
- Storage keys (localStorage, sessionStorage)
- Route paths
- API endpoints
- Breakpoints
- Date formats
- Regex patterns

## Color System

### Brand Palette

Based on your provided palette:

```css
--brand-black: #000807 (HSL: 173 100% 2%) --brand-cool-gray: #a2a3bb (HSL: 238 16% 68%)
  --brand-tropical-indigo: #9395d3 (HSL: 238 42% 70%) --brand-periwinkle: #b3b7ee (HSL: 236 63% 82%)
  --brand-ghost-white: #fbf9ff (HSL: 260 100% 99%);
```

### Semantic Colors

Mapped to semantic tokens for light/dark themes:

**Light Theme:**

- Background: ghost-white
- Foreground: black
- Primary: tropical-indigo
- Secondary: periwinkle
- Muted: cool-gray

**Dark Theme:**

- Background: black
- Foreground: ghost-white
- Primary: tropical-indigo
- Secondary: periwinkle
- Muted: adjusted cool-gray

### Usage in Tailwind

```vue
<div class="bg-primary text-primary-foreground">
  <p class="text-brand-tropical-indigo">Custom brand color</p>
</div>
```

## TypeScript Setup

### Type Definitions

Located in `app/types/`:

- `common.types.ts` - Common types (Nullable, Optional, Pagination, etc.)
- `api.types.ts` - API-specific types (Request config, Error responses, etc.)
- `env.types.ts` - Environment variable types

### Usage

```typescript
import type { PaginatedResponse, ApiResponse } from '~/types'

const response: PaginatedResponse<News> = await api.get('/news')
```

## API Client

### Setup

The API client is configured in `app/lib/api/api-client.ts` and exposed via the `useApi` composable.

### Usage

```typescript
const api = useApi()

// GET request
const news = await api.get('/news', { page: 1, pageSize: 20 })

// POST request
const newNews = await api.post('/news', { title: 'New Article' })

// Error handling
try {
  const data = await api.get('/news')
} catch (error) {
  if (error instanceof ApiError) {
    console.error(error.message, error.statusCode)
  }
}
```

## Utilities

### Validation (`app/utils/validation.ts`)

```typescript
import { validation } from '~/utils'

validation.isEmail('test@example.com') // true
validation.isUrl('https://example.com') // true
validation.isEmpty('') // true
```

### Formatters (`app/utils/formatters.ts`)

```typescript
import { formatNumber, formatCurrency, formatFileSize } from '~/utils'

formatNumber(1000) // "1,000"
formatCurrency(99.99, 'USD') // "$99.99"
formatFileSize(1048576) // "1 MB"
```

### Helpers (`app/utils/helpers.ts`)

```typescript
import { groupBy, unique, sortBy } from '~/utils'

const items = [{ type: 'A' }, { type: 'B' }, { type: 'A' }]
groupBy(items, 'type') // { A: [...], B: [...] }
unique([1, 2, 2, 3]) // [1, 2, 3]
sortBy(items, 'type', 'asc')
```

## Composables

### `useApi`

Access configured API client.

### `useTheme`

Manage theme (light/dark/system).

### `useNotification`

Show toast notifications.

### `useLocalStorage`

SSR-safe localStorage with reactivity.

### `useDebounce`

Debounce values and functions.

### `useAsyncData`

Enhanced async data fetching with loading states.

## Best Practices

1. **Environment Variables**: Never commit `.env` files. Use `.env.example` as template.

2. **Colors**: Use semantic color tokens (`bg-primary`) instead of brand colors directly for better theme support.

3. **Types**: Import types from `~/types` for consistency.

4. **API Calls**: Always use the `useApi` composable for API requests.

5. **Validation**: Use the validation utilities for consistent validation.

6. **Formatting**: Use formatter utilities for consistent data display.

7. **Configuration**: Import from `~/config` for application constants.

## VS Code Setup

Recommended extensions (see `.vscode/extensions.json`):

- ESLint
- Prettier
- Volar (Vue Language Features)
- Tailwind CSS IntelliSense

Settings are pre-configured for:

- Format on save
- ESLint auto-fix
- TypeScript workspace version
- Tailwind CSS class completion
