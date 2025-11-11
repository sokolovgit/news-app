# Color System Documentation

## 🎨 Purple Brand Palette

This project uses a vibrant purple-based color palette designed for modern, playful UI while maintaining accessibility and visual hierarchy.

## Color Palette

### Primary Colors

| Color | Hex | Role | Usage |
|-------|-----|------|-------|
| **Primary** | `#4E56C0` | Main Brand Color | Primary buttons, key accents, links, headers/logo, focus states |
| **Secondary** | `#9B5DE0` | Secondary Accent | Secondary buttons, highlighted components (tabs, badges), hover states |
| **Tertiary** | `#D78FEE` | Soft Accent | Background tints, surfaces/cards, subtle highlights, light gradients, data viz |
| **Background Tint** | `#FDCFFA` | Support Color | Light backgrounds, illustration fills, lightest gradient stops, notification backgrounds |

### Usage in Tailwind

You can use these colors with the following Tailwind classes:

```html
<!-- Primary Color (#4E56C0) -->
<button class="bg-primary text-white">Primary Button</button>
<a class="text-primary hover:text-primary/80">Primary Link</a>

<!-- Secondary Color (#9B5DE0) -->
<button class="bg-secondary text-white">Secondary Button</button>
<div class="border-secondary">Secondary Border</div>

<!-- Tertiary Color (#D78FEE) -->
<div class="bg-tertiary">Tertiary Background</div>
<span class="text-tertiary">Tertiary Text</span>

<!-- Background Tint (#FDCFFA) -->
<div class="bg-bg-tint">Light Background</div>
```

## Core System Colors

### Light Theme

| Variable | Value | Purpose |
|----------|-------|---------|
| `--color-bg` | `#ffffff` | Main background color |
| `--color-surface` | `#FDCFFA` | Cards, panels, elevated surfaces |
| `--color-accent` | `#4E56C0` | Primary interactive elements |
| `--color-text` | `#1a1a1a` | Primary text color |
| `--color-border` | `#e0d4f5` | Borders and dividers |
| `--color-muted` | `#7c7c8a` | Secondary/muted text |

### Dark Theme

| Variable | Value | Purpose |
|----------|-------|---------|
| `--color-bg` | `#1a1a1a` | Main background color |
| `--color-surface` | `#2a2a35` | Cards, panels, elevated surfaces |
| `--color-accent` | `#9B5DE0` | Primary interactive elements |
| `--color-text` | `#f5f5f5` | Primary text color |
| `--color-border` | `#3a3a4a` | Borders and dividers |
| `--color-muted` | `#9c9ca8` | Secondary/muted text |

## Component Usage Examples

### Buttons

```html
<!-- Primary Button (uses #4E56C0 in light mode) -->
<button class="px-6 py-3 bg-primary text-white rounded-lg hover:bg-primary/90">
  Primary Action
</button>

<!-- Secondary Button (uses #9B5DE0 in light mode) -->
<button class="px-6 py-3 bg-secondary text-white rounded-lg hover:bg-secondary/90">
  Secondary Action
</button>

<!-- Tertiary/Soft Button (uses #D78FEE) -->
<button class="px-6 py-3 bg-tertiary text-primary rounded-lg hover:bg-tertiary/80">
  Tertiary Action
</button>

<!-- Outline Button -->
<button class="px-6 py-3 border-2 border-primary text-primary rounded-lg hover:bg-primary hover:text-white">
  Outline
</button>
```

### Cards & Surfaces

```html
<!-- Standard Card (uses #FDCFFA in light mode) -->
<div class="p-6 bg-surface rounded-lg border border-border">
  <h3 class="text-xl font-semibold mb-2">Card Title</h3>
  <p class="text-muted">Card content goes here</p>
</div>

<!-- Highlighted Card -->
<div class="p-6 bg-surface rounded-lg border-2 border-primary">
  <h3 class="text-xl font-semibold mb-2">Featured Card</h3>
  <p class="text-muted">Important content</p>
</div>

<!-- Tertiary Background -->
<div class="p-6 bg-tertiary/20 rounded-lg">
  <p class="text-text">Soft highlighted section</p>
</div>
```

### Badges & Tags

```html
<!-- Primary Badge -->
<span class="px-3 py-1 bg-primary text-white text-sm rounded-full">
  New
</span>

<!-- Secondary Badge -->
<span class="px-3 py-1 bg-secondary text-white text-sm rounded-full">
  Featured
</span>

<!-- Tertiary Badge (soft) -->
<span class="px-3 py-1 bg-tertiary text-primary text-sm rounded-full">
  Info
</span>
```

### Gradients

```html
<!-- Hero Gradient (Primary → Tertiary) -->
<div class="bg-gradient-to-r from-primary via-secondary to-tertiary">
  <h1 class="text-white">Hero Section</h1>
</div>

<!-- Soft Background Gradient -->
<div class="bg-gradient-to-br from-bg-tint to-tertiary/30">
  <p>Subtle gradient background</p>
</div>
```

### Links & Focus States

```html
<!-- Link (uses primary color) -->
<a href="#" class="text-primary hover:text-primary/80 underline-offset-4 hover:underline">
  Learn More
</a>

<!-- Focus Ring -->
<input 
  type="text" 
  class="px-4 py-2 border-2 border-border rounded-lg focus:border-primary focus:ring-2 focus:ring-primary/20 focus:outline-none"
/>
```

## Status Colors

In addition to the brand colors, we maintain semantic status colors:

| Status | Light | Dark | Usage |
|--------|-------|------|-------|
| **Success** | `#2d6a4f` | `#52b788` | Success messages, positive actions |
| **Warning** | `#f59e0b` | `#fbbf24` | Warning messages, caution states |
| **Error** | `#dc2626` | `#f87171` | Error messages, destructive actions |
| **Info** | `#9B5DE0` | `#D78FEE` | Informational messages (uses secondary/tertiary) |

```html
<!-- Status Examples -->
<div class="p-4 bg-success/10 border-l-4 border-success text-success">
  Success message
</div>

<div class="p-4 bg-warning/10 border-l-4 border-warning text-warning">
  Warning message
</div>

<div class="p-4 bg-error/10 border-l-4 border-error text-error">
  Error message
</div>

<div class="p-4 bg-info/10 border-l-4 border-info text-info">
  Info message
</div>
```

## ⚠️ Accessibility Guidelines

### Text Contrast

- **DO**: Use `#4E56C0` (Primary) for text on white backgrounds ✅
- **DO**: Use `#9B5DE0` (Secondary) for text on white backgrounds ✅
- **DON'T**: Use `#D78FEE` (Tertiary) for text - background only ❌
- **DON'T**: Use `#FDCFFA` (Background Tint) for text - background only ❌

### Recommended Pairings

```html
<!-- Good: Dark primary on light background -->
<div class="bg-white text-primary">High contrast text</div>

<!-- Good: White text on primary background -->
<div class="bg-primary text-white">High contrast text</div>

<!-- Good: Tertiary as background with dark text -->
<div class="bg-tertiary/20 text-text">Readable content</div>

<!-- Bad: Light colors for text -->
<div class="bg-white text-tertiary">❌ Poor contrast</div>
```

## Color Hierarchy

When building interfaces, follow this hierarchy:

1. **Primary** (`#4E56C0`) - Most important actions, main CTAs
2. **Secondary** (`#9B5DE0`) - Secondary actions, supporting elements
3. **Tertiary** (`#D78FEE`) - Backgrounds, soft accents, less prominent features
4. **Background Tint** (`#FDCFFA`) - Very subtle backgrounds, illustrations

## Design Tokens

If you're working in JavaScript/TypeScript:

```typescript
export const colors = {
  primary: '#4E56C0',
  secondary: '#9B5DE0',
  tertiary: '#D78FEE',
  bgTint: '#FDCFFA',
  
  // Light theme
  light: {
    bg: '#ffffff',
    surface: '#FDCFFA',
    accent: '#4E56C0',
    text: '#1a1a1a',
    border: '#e0d4f5',
    muted: '#7c7c8a',
  },
  
  // Dark theme
  dark: {
    bg: '#1a1a1a',
    surface: '#2a2a35',
    accent: '#9B5DE0',
    text: '#f5f5f5',
    border: '#3a3a4a',
    muted: '#9c9ca8',
  }
}
```

## Best Practices

1. **Use neutral whites/grays to balance vibrancy** - Don't overuse bright colors
2. **Add dark neutrals for text contrast** - Use `#1a1a1a` for primary text
3. **Leverage gradients subtly** - Great for hero sections and highlights
4. **Respect the hierarchy** - Primary for main actions, secondary for support
5. **Test accessibility** - Always check contrast ratios
6. **Use opacity for variations** - `bg-primary/90`, `text-secondary/80`

## Examples by Component Type

### Navigation

```html
<nav class="bg-white border-b border-border">
  <a href="#" class="text-primary font-semibold">Active Link</a>
  <a href="#" class="text-muted hover:text-primary">Link</a>
</nav>
```

### Forms

```html
<input 
  class="w-full px-4 py-2 bg-surface border-2 border-border rounded-lg 
         focus:border-primary focus:ring-2 focus:ring-primary/20 
         placeholder:text-muted"
  placeholder="Enter text..."
/>
```

### Hero Sections

```html
<section class="bg-gradient-to-r from-primary via-secondary to-tertiary">
  <h1 class="text-white text-5xl font-bold">Welcome</h1>
  <button class="bg-white text-primary px-8 py-3 rounded-lg">
    Get Started
  </button>
</section>
```

## Figma Variables

If you're designing in Figma, use these variable names:

- `color/primary` → #4E56C0
- `color/secondary` → #9B5DE0
- `color/tertiary` → #D78FEE
- `color/bg-tint` → #FDCFFA

---

**Last Updated**: November 2025
**Version**: 1.0.0

