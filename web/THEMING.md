# Theming System

This document describes the theming implementation in the News App using Tailwind CSS and shadcn-vue.

## Overview

The app supports three theme modes:

- **Light Mode** - Light color scheme
- **Dark Mode** - Dark color scheme
- **System** - Automatically follows the user's system preference

## Architecture

### 1. CSS Variables (`app/assets/css/tailwind.css`)

The theming system uses CSS custom properties (variables) for colors:

```css
:root {
  /* Light theme variables */
  --background: 0 0% 100%;
  --foreground: 240 10% 3.9%;
  /* ... more variables */
}

.dark {
  /* Dark theme variables */
  --background: 240 10% 3.9%;
  --foreground: 0 0% 98%;
  /* ... more variables */
}
```

### 2. Tailwind Configuration (`tailwind.config.ts`)

The Tailwind config maps these CSS variables to Tailwind utility classes:

```typescript
colors: {
  background: 'hsl(var(--background))',
  foreground: 'hsl(var(--foreground))',
  // ... more color mappings
}
```

### 3. Theme Composable (`app/composables/useTheme.ts`)

The `useTheme` composable manages theme state and switching:

```typescript
const { theme, resolvedTheme, setTheme, toggleTheme } = useTheme()
```

**API:**

- `theme` - Current theme setting ('light' | 'dark' | 'system')
- `resolvedTheme` - Actual applied theme ('light' | 'dark')
- `setTheme(theme)` - Set specific theme
- `toggleTheme()` - Toggle between light and dark

### 4. Components

#### ThemeSwitcher (`app/components/ThemeSwitcher.vue`)

A simple icon button that toggles between light and dark modes:

```vue
<ThemeSwitcher />
```

#### ThemeToggle (`app/components/ThemeToggle.vue`)

A segmented control with three options (Light, Dark, System):

```vue
<ThemeToggle />
```

## Usage

### Using Theme Colors in Components

Use Tailwind's semantic color classes:

```vue
<template>
  <div class="bg-background text-foreground">
    <h1 class="text-primary">Title</h1>
    <p class="text-muted-foreground">Description</p>
    <button class="bg-primary text-primary-foreground">Click me</button>
  </div>
</template>
```

### Available Color Tokens

- `background` / `foreground` - Base colors
- `card` / `card-foreground` - Card backgrounds
- `primary` / `primary-foreground` - Primary actions
- `secondary` / `secondary-foreground` - Secondary actions
- `muted` / `muted-foreground` - Muted/subtle elements
- `accent` / `accent-foreground` - Accent elements
- `destructive` / `destructive-foreground` - Error/danger states
- `border` - Border colors
- `input` - Input field borders
- `ring` - Focus rings

### Programmatic Theme Control

```vue
<script setup lang="ts">
import { useTheme } from '@/composables/useTheme'

const { theme, resolvedTheme, setTheme, toggleTheme } = useTheme()

// Set specific theme
const setLightMode = () => setTheme('light')
const setDarkMode = () => setTheme('dark')
const setSystemMode = () => setTheme('system')

// Toggle between light/dark
const handleToggle = () => toggleTheme()

// Check current theme
console.log('Current theme:', theme.value)
console.log('Resolved theme:', resolvedTheme.value)
</script>
```

## Customization

### Changing Theme Colors

Edit the CSS variables in `app/assets/css/tailwind.css`:

```css
:root {
  --primary: 220 70% 50%; /* Change primary color */
}

.dark {
  --primary: 220 70% 60%; /* Different shade for dark mode */
}
```

Colors are in HSL format: `hue saturation% lightness%`

### Adding New Color Tokens

1. Add CSS variable:

```css
:root {
  --custom: 200 100% 50%;
}

.dark {
  --custom: 200 100% 60%;
}
```

2. Add to Tailwind config:

```typescript
// tailwind.config.ts
colors: {
  custom: 'hsl(var(--custom))',
}
```

3. Use in components:

```vue
<div class="bg-custom text-white">Custom colored element</div>
```

### Changing Border Radius

Adjust the `--radius` variable:

```css
:root {
  --radius: 0.5rem; /* Default */
  /* or */
  --radius: 0.75rem; /* More rounded */
  /* or */
  --radius: 0; /* No rounding */
}
```

## How It Works

1. **Initialization**: On app mount, `useTheme` reads the saved preference from localStorage
2. **Theme Application**: Adds `.dark` or `.light` class to `<html>` element
3. **CSS Variables**: Browser applies corresponding CSS variables based on the class
4. **Tailwind**: Utility classes reference these variables, automatically updating colors
5. **System Preference**: Listens to `prefers-color-scheme` media query when in 'system' mode
6. **Persistence**: Saves user preference to localStorage for next visit

## Best Practices

1. **Always use semantic color tokens** instead of hardcoded colors:
   - ✅ `class="bg-background text-foreground"`
   - ❌ `class="bg-white text-black"`

2. **Pair colors correctly**:
   - Use `primary` with `primary-foreground`
   - Use `card` with `card-foreground`
   - This ensures proper contrast in both themes

3. **Test in both themes** to ensure readability and contrast

4. **Use `muted-foreground` for secondary text** to maintain hierarchy

5. **Avoid opacity tricks** - use semantic tokens instead:
   - ✅ `text-muted-foreground`
   - ❌ `text-foreground opacity-50`

## Troubleshooting

### Theme not persisting

- Check browser localStorage support
- Verify localStorage key 'theme' is being saved

### Colors not changing

- Ensure `.dark` class is being added to `<html>` element
- Check that CSS variables are properly defined
- Verify Tailwind config maps to correct variables

### Flash of wrong theme on page load

- Consider implementing SSR-compatible theme initialization
- Add a blocking script in `<head>` to set theme class before render

## Future Enhancements

- Add more theme variants (e.g., high contrast, colorblind modes)
- Implement custom theme creator
- Add theme preview/switcher in settings
- Support per-page theme overrides
- Add animation transitions between themes
