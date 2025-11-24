# Layouts and Pages Design Document

## Overview

This document outlines the UX/UI design for the News App frontend, including layouts, navigation structure, and all main pages. The design follows modern UX principles and leverages shadcn/ui components with the existing purple brand palette.

---

## 📐 Layout Structure

### 1. Default Layout (`layouts/default.vue`)

**Purpose**: Main application layout for authenticated users

**Structure**:

```
┌─────────────────────────────────────────────────┐
│              Top Navigation Bar                 │
│  [Logo] [Feed] [Sources] [Profile] [Settings]  │
├─────────────────────────────────────────────────┤
│                                                 │
│              Main Content Area                  │
│              (NuxtPage)                         │
│                                                 │
│                                                 │
└─────────────────────────────────────────────────┘
```

**Components**:

- **Top Navigation Bar** (`components/navigation/AppNavbar.vue`)
  - Fixed at top with backdrop blur
  - Logo on the left (clickable → home)
  - Main navigation links: Feed, Sources, Profile
  - Right side: Search bar, Notifications (bell icon), User avatar dropdown, Settings icon
  - Responsive: Hamburger menu on mobile
  - Sticky/fixed positioning

- **Mobile Sidebar** (`components/navigation/MobileSidebar.vue`)
  - Slide-out drawer for mobile navigation
  - Contains all navigation links
  - User profile section at bottom
  - Overlay backdrop when open

**Features**:

- Dark mode toggle in user dropdown
- Active route highlighting
- Smooth transitions
- Responsive breakpoints: mobile (< 768px), tablet (768px - 1024px), desktop (> 1024px)

---

### 2. Auth Layout (`layouts/auth.vue`)

**Purpose**: Clean layout for authentication pages (login, register, verify-email)

**Structure**:

```
┌─────────────────────────────────────────────────┐
│                                                 │
│              Centered Content                   │
│              (NuxtPage)                         │
│                                                 │
│                                                 │
└─────────────────────────────────────────────────┘
```

**Features**:

- Minimal design, no navigation
- Centered content with max-width constraint
- Optional: Subtle background pattern/gradient
- Theme toggle in top-right corner
- Back to home link

---

## 🏠 Pages Design

### 1. Main Page (`pages/index.vue`)

**Purpose**: Landing page / Dashboard overview

**Design**:

- **Hero Section**:
  - Welcome message with user's name
  - Quick stats cards: Total Sources, Posts Today, Unread Items
  - Gradient background (primary → secondary → tertiary)
- **Quick Actions**:
  - Large CTA button: "Add New Source"
  - Secondary button: "View Feed"
  - Cards showing recent activity

- **Recent Sources Preview**:
  - Grid of source cards (last 6 sources)
  - Each card shows: Source name, type icon, last fetch time, post count
  - Click to view full sources page

- **Feed Preview**:
  - Latest 3-5 posts in a compact list
  - Preview cards with: Title, source, timestamp, excerpt
  - "View All" link to feed page

**Layout**: Single column on mobile, 2-column grid on desktop

**Components Needed**:

- `components/dashboard/StatsCard.vue`
- `components/dashboard/QuickActionCard.vue`
- `components/sources/SourceCard.vue` (preview version)
- `components/posts/PostPreviewCard.vue`

---

### 2. Feed Page (`pages/feed.vue`)

**Purpose**: Display paginated posts from user's sources

**Design**:

- **Header**:
  - Page title: "Your Feed"
  - Filter/Sort controls: Date, Source, Type
  - Search bar
  - View toggle: List / Grid

- **Post List**:
  - Infinite scroll or pagination
  - Each post card includes:
    - Source badge/icon
    - Post title (clickable)
    - Post excerpt/preview
    - Timestamp (relative: "2 hours ago")
    - External link button
    - Read/Unread indicator
    - Bookmark button (future feature)
  - Empty state: "No posts yet. Add sources to get started!"

- **Sidebar** (desktop only):
  - Quick filters: Today, This Week, This Month
  - Source filter list (checkboxes)
  - Refresh button

**Layout**:

- Mobile: Single column, full width
- Desktop: 2/3 content + 1/3 sidebar

**Components Needed**:

- `components/posts/PostCard.vue`
- `components/posts/PostList.vue`
- `components/posts/PostFilters.vue`
- `components/posts/EmptyFeedState.vue`
- `components/ui/select/` (for filters)
- `components/ui/checkbox/` (for source filters)

---

### 3. Add Sources Page (`pages/sources/add.vue`)

**Purpose**: Add new news sources to user's feed

**Design**:

- **Header**:
  - Page title: "Add Source"
  - Back button to sources list
  - Help text: "Add RSS feeds, Instagram accounts, or other supported sources"

- **Source Type Selection**:
  - Tabs or cards: RSS Feed, Instagram, Twitter (future), etc.
  - Each type shows icon and description
  - Active type highlighted

- **Add Source Form**:
  - URL input field (with validation)
  - Source name input (auto-filled if possible, editable)
  - Source type indicator
  - Preview section (shows fetched metadata if URL is valid)
  - "Validate" button to check URL before adding
  - "Add Source" primary button
  - Loading states during validation/addition

- **Validation Feedback**:
  - Success: Shows source preview (name, description, icon)
  - Error: Clear error message with suggestions
  - Inline validation feedback

- **Recent Sources** (optional):
  - List of recently added sources
  - Quick re-add option

**Layout**: Centered form with max-width, single column

**Components Needed**:

- `components/sources/AddSourceForm.vue`
- `components/sources/SourceTypeSelector.vue`
- `components/sources/SourcePreview.vue`
- `components/sources/ValidationStatus.vue`
- `components/ui/tabs/` (for source types)
- `components/ui/alert/` (for validation feedback)

---

### 4. User Sources Page (`pages/sources/index.vue`)

**Purpose**: View and manage all user's sources

**Design**:

- **Header**:
  - Page title: "My Sources"
  - "Add Source" button (primary CTA)
  - Search/filter bar
  - View toggle: Grid / List

- **Sources Grid/List**:
  - Each source card shows:
    - Source icon/logo
    - Source name
    - Source type badge (RSS, Instagram, etc.)
    - URL (truncated, copy button)
    - Last fetched time
    - Post count (last 24h or total)
    - Status indicator (active, error, fetching)
    - Actions menu: Edit, Refresh, Remove
  - Empty state: "No sources yet. Add your first source!"

- **Source Actions**:
  - Click card → View source details/posts
  - Hover → Show quick actions
  - Menu button → Full actions menu

- **Bulk Actions** (if multiple selected):
  - Select all checkbox
  - Bulk refresh, bulk remove

**Layout**:

- Mobile: Single column grid (1 item per row)
- Tablet: 2-column grid
- Desktop: 3-column grid

**Components Needed**:

- `components/sources/SourceCard.vue` (full version)
- `components/sources/SourcesGrid.vue`
- `components/sources/SourcesList.vue`
- `components/sources/SourceActionsMenu.vue`
- `components/ui/dialog/` (for remove confirmation)
- `components/ui/dropdown-menu/` (for actions)
- `components/ui/badge/` (for source types)

---

### 5. Profile Page (`pages/profile/index.vue`)

**Purpose**: User profile and account information

**Design**:

- **Profile Header**:
  - User avatar (large, circular)
  - User email
  - Account status badges (Verified, etc.)
  - Edit profile button

- **Tabs**:
  - Overview
  - Activity
  - Preferences

- **Overview Tab**:
  - Account information card:
    - Email
    - Account created date
    - Last login
    - Email verification status
  - Statistics card:
    - Total sources
    - Total posts read
    - Account age

- **Activity Tab**:
  - Recent activity timeline
  - Source additions
  - Login history (if available)

- **Preferences Tab**:
  - Notification preferences (future)
  - Display preferences
  - Link to Settings

**Layout**: Single column, centered content with max-width

**Components Needed**:

- `components/profile/ProfileHeader.vue`
- `components/profile/AccountInfoCard.vue`
- `components/profile/StatisticsCard.vue`
- `components/profile/ActivityTimeline.vue`
- `components/ui/tabs/` (for tab navigation)
- `components/ui/avatar/` (for user avatar)
- `components/ui/card/` (for info cards)

---

### 6. Settings Window (`components/settings/SettingsDialog.vue`)

**Purpose**: Application settings modal/dialog

**Design**:

- **Modal/Dialog Structure**:
  - Header: "Settings" title + Close button
  - Tabs/Sections:
    - General
    - Appearance
    - Notifications (future)
    - Privacy (future)
    - Account

- **General Tab**:
  - Language selector (if i18n implemented)
  - Default page (Feed, Sources, Dashboard)
  - Posts per page
  - Auto-refresh interval

- **Appearance Tab**:
  - Theme selector: Light / Dark / System
  - Accent color (if customizable)
  - Font size preference
  - Compact/Dense mode toggle

- **Account Tab**:
  - Change password (opens sub-dialog)
  - Delete account (danger zone)
  - Export data (future)

- **Footer**:
  - "Save" button (if changes made)
  - "Cancel" button
  - "Reset to defaults" link

**Layout**: Modal dialog, centered, max-width 600px

**Components Needed**:

- `components/settings/SettingsDialog.vue`
- `components/settings/SettingsTabs.vue`
- `components/settings/GeneralSettings.vue`
- `components/settings/AppearanceSettings.vue`
- `components/settings/AccountSettings.vue`
- `components/ui/dialog/` (for modal)
- `components/ui/switch/` (for toggles)
- `components/ui/select/` (for dropdowns)
- `components/ui/slider/` (for numeric inputs)

---

## 🧩 Navigation Structure

### Main Navigation Items

1. **Feed** (`/feed`)
   - Icon: Rss or Newspaper
   - Active when: `/feed` or `/feed/*`

2. **Sources** (`/sources`)
   - Icon: BookOpen or Layers
   - Active when: `/sources` or `/sources/*`
   - Dropdown: Add Source, My Sources

3. **Profile** (`/profile`)
   - Icon: User
   - Active when: `/profile` or `/profile/*`

4. **Settings** (opens dialog)
   - Icon: Settings or Cog
   - Always accessible from user dropdown

### User Dropdown Menu

- User email/name
- Divider
- Profile link
- Settings link
- Theme toggle
- Divider
- Logout button

---

## 🎨 Design System Integration

### Color Usage

- **Primary Actions**: Use `bg-primary` for main CTAs
- **Secondary Actions**: Use `bg-secondary` or `variant="outline"`
- **Cards/Surfaces**: Use `bg-surface` or `bg-card`
- **Borders**: Use `border-border`
- **Text**: Use `text-text` for primary, `text-muted` for secondary
- **Accents**: Use brand colors for highlights and badges

### Typography

- **Headings**: Bold, larger sizes (h1: 2.5rem, h2: 2rem, h3: 1.5rem)
- **Body**: Regular weight, readable line-height
- **Labels**: Medium weight, smaller size
- **Muted text**: Lighter color, smaller size

### Spacing

- Consistent spacing scale: 4px, 8px, 12px, 16px, 24px, 32px, 48px
- Card padding: 24px (desktop), 16px (mobile)
- Section spacing: 48px vertical

### Shadows & Elevation

- Cards: Subtle shadow (`shadow-sm`)
- Modals: Larger shadow (`shadow-lg`)
- Hover states: Slightly elevated shadow

---

## 📱 Responsive Design

### Breakpoints

- **Mobile**: < 768px
  - Single column layouts
  - Hamburger menu
  - Stacked cards
  - Full-width buttons

- **Tablet**: 768px - 1024px
  - 2-column grids where appropriate
  - Sidebar becomes collapsible
  - Adjusted font sizes

- **Desktop**: > 1024px
  - Multi-column layouts
  - Persistent sidebar
  - Hover states enabled
  - Larger touch targets

### Mobile Considerations

- Bottom navigation bar (optional alternative)
- Swipe gestures for navigation
- Touch-friendly button sizes (min 44x44px)
- Pull-to-refresh on feed
- Bottom sheet for filters/actions

---

## 🔄 User Flows

### Adding a Source Flow

1. User clicks "Add Source" button
2. Navigate to `/sources/add`
3. Select source type (if multiple types)
4. Enter URL
5. Click "Validate" → Shows preview
6. Confirm and click "Add Source"
7. Success toast → Redirect to sources list
8. New source appears in list

### Viewing Feed Flow

1. User navigates to `/feed`
2. Posts load (with loading skeleton)
3. User can filter/sort
4. Scroll to load more (infinite scroll)
5. Click post → Opens in new tab (external link)
6. Mark as read (optional)

### Managing Sources Flow

1. User navigates to `/sources`
2. See grid/list of all sources
3. Click source card → View details/posts
4. Click menu → Edit/Remove options
5. Remove → Confirmation dialog
6. Refresh → Loading state, then updated

---

## 🎯 UX Best Practices

### Loading States

- Skeleton loaders for content
- Spinner for actions
- Progress indicators for long operations
- Optimistic updates where possible

### Error Handling

- Clear error messages
- Retry buttons
- Fallback UI for failed states
- Toast notifications for actions

### Feedback

- Success toasts for completed actions
- Hover states on interactive elements
- Active state indicators
- Smooth transitions (300ms)

### Accessibility

- Keyboard navigation support
- ARIA labels where needed
- Focus indicators
- Screen reader friendly
- Color contrast compliance

---

## 📦 Required shadcn Components

To implement this design, you'll need to add these shadcn components:

### Already Available

- ✅ Button
- ✅ Input
- ✅ Form components
- ✅ Label
- ✅ Sonner (toast)

### Need to Add

- 🔲 **Card** - For content containers
- 🔲 **Dialog** - For modals (Settings, Confirmations)
- 🔲 **Dropdown Menu** - For user menu, source actions
- 🔲 **Tabs** - For Settings, Profile sections
- 🔲 **Badge** - For source types, status indicators
- 🔲 **Avatar** - For user profile
- 🔲 **Select** - For dropdowns (filters, settings)
- 🔲 **Checkbox** - For filters, bulk selection
- 🔲 **Switch** - For toggles (settings)
- 🔲 **Separator** - For dividers
- 🔲 **Skeleton** - For loading states
- 🔲 **Alert** - For validation feedback, messages
- 🔲 **Sheet** - For mobile sidebar (alternative to Dialog)
- 🔲 **Scroll Area** - For scrollable content
- 🔲 **Tooltip** - For hover hints

---

## 🚀 Implementation Priority

### Phase 1: Core Layout & Navigation

1. Default layout with navigation
2. Auth layout
3. Mobile responsive navigation

### Phase 2: Main Pages

1. Feed page (basic)
2. Sources list page
3. Add source page

### Phase 3: Enhanced Features

1. Profile page
2. Settings dialog
3. Main dashboard page

### Phase 4: Polish

1. Loading states
2. Error handling
3. Animations & transitions
4. Accessibility improvements

---

## 📝 Notes

- **Backend Endpoint Needed**: GET `/api/user-sources` or `/api/sources/user` to fetch all user's sources with details
- **State Management**: Consider Pinia stores for:
  - Sources list
  - Feed posts
  - User preferences
  - UI state (sidebar, modals)
- **Caching**: Cache sources list and feed data appropriately
- **Real-time Updates**: Consider WebSocket/SSE for live feed updates (future)

---

**Last Updated**: January 2025
**Version**: 1.0.0
