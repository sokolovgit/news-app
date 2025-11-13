# Toast Notification Styling Guide

## Overview

The toast notification system uses **vue-sonner** v2 with custom styling that matches your purple brand theme. Toasts automatically adapt to light/dark mode and use your design system's color palette.

## 🎨 Styled Toast Types

### Success Toasts

- **Color**: Green (`--success`)
- **Background**: Light green with transparency
- **Border**: Solid green border
- **Use For**: Successful operations, confirmations

```typescript
toast.success('Account Created!', {
  description: 'Your account has been successfully created.',
  duration: 3000,
})
```

### Error Toasts

- **Color**: Red (`--destructive`)
- **Background**: Light red with transparency
- **Border**: Solid red border
- **Use For**: Errors, failed operations

```typescript
toast.error('Login Failed', {
  description: 'Invalid credentials. Please try again.',
  duration: 5000,
})
```

### Warning Toasts

- **Color**: Orange/Yellow (`--warning`)
- **Background**: Light orange with transparency
- **Border**: Solid orange border
- **Use For**: Warnings, cautions

```typescript
toast.warning('Session Expiring', {
  description: 'Your session will expire in 5 minutes.',
  duration: 4000,
})
```

### Info Toasts

- **Color**: Purple (`--info` / `--primary`)
- **Background**: Light purple with transparency
- **Border**: Solid purple border
- **Use For**: Informational messages

```typescript
toast.info('New Feature Available', {
  description: 'Check out our new dark mode!',
  duration: 3000,
})
```

### Loading Toasts

- **Color**: Primary purple
- **Background**: Muted background
- **Icon**: Animated spinner
- **Use For**: Loading states, processing

```typescript
toast.loading('Processing...', {
  description: 'Please wait while we process your request.',
})
```

## 🔧 Implementation Details

### CSS Variables Used

The toast styling system uses these CSS custom properties that automatically adapt to your theme:

**Light Mode:**

- `--card`: Toast background (white)
- `--card-foreground`: Text color (dark)
- `--border`: Border color (light purple)
- `--success`: Green (#2d6a4f)
- `--destructive`: Red (#dc2626)
- `--warning`: Orange (#f59e0b)
- `--info`: Purple (#9b5de0)

**Dark Mode:**

- `--card`: Toast background (dark surface)
- `--card-foreground`: Text color (light)
- `--border`: Border color (dark purple)
- `--success`: Light green (#52b788)
- `--destructive`: Light red (#f87171)
- `--warning`: Light orange (#fbbf24)
- `--info`: Light purple (#d78fee)

### Custom Styling Applied

1. **Base Styles** (`tailwind.css`)
   - Card-style background with rounded corners
   - Subtle border with brand colors
   - Responsive shadow (darker in dark mode)
   - Smooth animations

2. **Typography**
   - **Title**: Semibold, 14px, colored by toast type
   - **Description**: Regular, 13px, muted foreground color
   - Optimal line height for readability

3. **Interactive Elements**
   - **Action buttons**: Primary brand color
   - **Cancel buttons**: Muted background
   - **Close buttons**: Transparent with border

## 📍 Configuration

### Global Toaster Setup

The `Toaster` component is configured in `app.vue`:

```vue
<template>
  <Toaster />
  <div>
    <NuxtPage />
  </div>
</template>
```

### Toaster Props (Sonner.vue)

Default configuration:

- **Position**: `bottom-right`
- **Theme**: `system` (auto light/dark)
- **Rich Colors**: `true` (enhanced colors)
- **Close Button**: `true` (X button visible)
- **Expand**: `false` (compact mode)

### Custom Position

Override position per page if needed:

```vue
<Toaster position="top-center" />
```

Available positions:

- `top-left`, `top-center`, `top-right`
- `bottom-left`, `bottom-center`, `bottom-right`

## 💡 Best Practices

### 1. Choose Appropriate Duration

```typescript
// Success/Info: 3 seconds (quick confirmation)
toast.success('Saved!', { duration: 3000 })

// Warning: 4 seconds (needs attention)
toast.warning('Check required', { duration: 4000 })

// Error: 5 seconds (needs to be read carefully)
toast.error('Failed to save', { duration: 5000 })

// Loading: No duration (dismissed programmatically)
const loadingToast = toast.loading('Processing...')
// Later: toast.dismiss(loadingToast)
```

### 2. Provide Clear Descriptions

**Good:**

```typescript
toast.error('Login Failed', {
  description: 'Invalid email or password. Please try again.',
})
```

**Bad:**

```typescript
toast.error('Error', {
  description: 'Something went wrong.',
})
```

### 3. Use Actions When Appropriate

```typescript
toast('File deleted', {
  description: 'Your file has been moved to trash.',
  action: {
    label: 'Undo',
    onClick: () => restoreFile(),
  },
})
```

### 4. Handle Promise-based Operations

```typescript
const saveData = async () => {
  const promise = api.saveData(data)

  toast.promise(promise, {
    loading: 'Saving...',
    success: 'Data saved successfully!',
    error: 'Failed to save data',
  })
}
```

### 5. Don't Overuse Toasts

❌ **Avoid:**

- Too many toasts at once
- Toasts for every minor action
- Very long toast messages
- Toasts for critical errors (use modals instead)

✅ **Use:**

- For transient feedback
- Non-blocking notifications
- Status updates
- Quick confirmations

## 🧪 Testing Toasts

Visit `/toast-demo` to see all toast variants in action and test them in both light and dark modes.

## 🎯 Usage in Forms

### Login/Register Forms

API errors now use toasts instead of inline banners:

```typescript
try {
  await authStore.login(credentials)

  toast.success('Welcome back!', {
    description: 'You have successfully logged in.',
    duration: 3000,
  })

  router.push('/')
} catch (error) {
  toast.error('Login Failed', {
    description: error.message || 'Please check your credentials.',
    duration: 5000,
  })
}
```

**Note**: Validation errors remain inline (field-level), while API/server errors use toasts.

## 📦 Package Information

- **Package**: `vue-sonner` v2.0.9
- **Documentation**: [vue-sonner docs](https://vue-sonner.vercel.app/)
- **Styling**: Custom CSS in `tailwind.css`

## 🔄 Theme Synchronization

Toasts automatically sync with your app's theme:

- `theme="system"` follows OS preference
- Updates when theme switcher is used
- No manual theme management needed

## 🛠️ Customization

To modify toast styling, edit `/app/assets/css/tailwind.css`:

```css
/* Find the Toast (Sonner) Styling section */
[data-sonner-toast] {
  /* Modify base styles here */
}

[data-sonner-toast][data-type='success'] {
  /* Modify success toast styles */
}
```

## 🎨 Color Customization

To change toast colors system-wide, update the CSS variables in `tailwind.css`:

```css
:root {
  --success: 150 60% 30%; /* Change success color */
  --destructive: 0 72% 51%; /* Change error color */
  --warning: 38 92% 50%; /* Change warning color */
  --info: 263 67% 61%; /* Change info color */
}
```

---

**Last Updated**: November 2025  
**Version**: 1.0.0
