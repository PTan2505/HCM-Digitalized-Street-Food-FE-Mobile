# Profile Configuration Guide

This guide explains how to customize the ProfileScreen using the configuration-based approach.

## Overview

The ProfileScreen now uses a declarative configuration system that makes it easy to add, remove, or modify sections without touching the main screen component.

## File Structure

```
src/features/user/
├── config/
│   └── profileSections.tsx        # Profile configuration
├── types/
│   └── profileConfig.ts            # TypeScript types
├── components/
│   └── profile/
│       ├── ProfileActionCards.tsx  # Action cards renderer
│       ├── ProfileFeatureButtons.tsx # Feature buttons renderer
│       ├── ProfileListItem.tsx     # List item renderer
│       ├── ProfileTabs.tsx         # Tabs renderer
│       └── index.ts                # Component exports
└── screens/
    └── ProfileScreen.tsx           # Main screen component
```

## Configuration File

The `profileSections.tsx` file exports a function `getProfileSections()` that returns an array of sections. Each section has:

- `id`: Unique identifier
- `type`: Section type (action-cards, tabs, feature-buttons, list-items, custom)
- `visible`: Whether to show the section
- `title`: Optional section title
- `items` / `actionCards` / `tabs`: Section content
- `containerClassName`: Optional Tailwind classes for container
- `titleClassName`: Optional Tailwind classes for title

## Section Types

### 1. **action-cards**

Two-column cards with icons, titles, and subtitles.

```typescript
{
  id: 'action-cards',
  type: 'action-cards',
  actionCards: [
    {
      id: 'points',
      icon: 'star',
      title: t('profile.my_points'),
      subtitle: `${user?.point ?? 0} ${t('profile.points')}`,
      backgroundColor: '#FFF9E6',
      onPress: () => { /* ... */ },
    },
  ],
  containerClassName: 'px-4 mb-4',
  visible: true,
}
```

### 2. **feature-buttons**

Large buttons with icons for primary features.

```typescript
{
  id: 'feature-buttons',
  type: 'feature-buttons',
  items: [
    {
      id: 'dietary',
      icon: 'nutrition-outline',
      title: t('profile.dietary_preferences'),
      onPress: () => navigation.navigate('DietaryPreferences'),
      color: '#9FD356',
    },
  ],
  containerClassName: 'px-4 mb-6',
  visible: true,
}
```

### 3. **list-items**

Vertical list of items with icons, text, and navigation arrows.

```typescript
{
  id: 'general',
  type: 'list-items',
  title: t('profile.general'),
  items: [
    {
      id: 'edit-profile',
      icon: 'person-outline',
      title: t('profile.edit_profile'),
      rightIcon: 'chevron-forward',
      onPress: () => navigation.navigate('SetupUserInfo'),
    },
  ],
  containerClassName: 'mb-6',
  titleClassName: 'px-4 mb-3 text-base font-bold text-gray-900',
  visible: true,
}
```

### 4. **tabs**

Tab navigation (currently disabled, set `visible: true` to enable).

```typescript
{
  id: 'tabs',
  type: 'tabs',
  tabs: [
    { id: 'main', title: t('profile.main_menu') },
    { id: 'activity', title: t('profile.activity') },
  ],
  containerClassName: 'px-4 mb-4',
  visible: false,
}
```

### 5. **custom**

Custom component (not yet used, for future extensions).

## Adding a New Section

To add a new section:

1. **Open** `src/features/user/config/profileSections.tsx`

2. **Add** a new section object to the array:

```typescript
{
  id: 'my-new-section',
  type: 'list-items',
  title: t('profile.my_section_title'),
  items: [
    {
      id: 'my-item',
      icon: 'heart-outline',
      title: t('profile.my_item'),
      rightIcon: 'chevron-forward',
      onPress: (): void => navigation.navigate('MyNewScreen'),
    },
  ],
  containerClassName: 'mb-6',
  visible: true,
}
```

3. **Add** translations to locale files:
   - `src/assets/locales/vi/strings.json`
   - `src/assets/locales/en/strings.json`

```json
"profile": {
  "my_section_title": "Phần Mới",
  "my_item": "Mục mới"
}
```

## Showing/Hiding Sections

Simply change the `visible` property:

```typescript
{
  id: 'payment-cards',
  type: 'payment-cards',
  visible: false, // Hidden
}
```

## Customizing Styles

Use the `containerClassName` and `titleClassName` properties:

```typescript
{
  id: 'my-section',
  type: 'list-items',
  title: 'My Section',
  containerClassName: 'px-6 mb-8 bg-blue-50 rounded-xl',
  titleClassName: 'px-4 mb-4 text-2xl font-black text-blue-900',
  // ...
}
```

## Item Properties

### List Items

- `id`: Unique identifier
- `icon`: Ionicons icon name
- `title`: Main text
- `subtitle`: Secondary text (optional)
- `badge`: Badge text (optional, e.g., "New")
- `badgeColor`: Badge background color (optional)
- `rightText`: Text on the right side (optional)
- `rightIcon`: Icon on the right side (optional)
- `color`: Icon and title color (optional)
- `onPress`: Click handler

## Best Practices

1. **Use translation keys** for all user-facing text
2. **Add explicit return types** to all `onPress` handlers (`: void =>`)
3. **Use Ionicons names** for icons (e.g., `'person-outline'`)
4. **Keep sections modular** - one responsibility per section
5. **Use meaningful IDs** - they help with debugging
6. **Group related items** into the same section

## Example: Adding "Favorites" Section

```typescript
// 1. Add to profileSections.tsx
{
  id: 'favorites',
  type: 'list-items',
  title: t('profile.favorites'),
  items: [
    {
      id: 'favorite-dishes',
      icon: 'heart',
      title: t('profile.favorite_dishes'),
      rightText: '12',
      rightIcon: 'chevron-forward',
      onPress: (): void => navigation.navigate('FavoriteDishes'),
      color: '#FF6B6B',
    },
    {
      id: 'favorite-vendors',
      icon: 'storefront',
      title: t('profile.favorite_vendors'),
      rightText: '8',
      rightIcon: 'chevron-forward',
      onPress: (): void => navigation.navigate('FavoriteVendors'),
      color: '#9FD356',
    },
  ],
  containerClassName: 'mb-6',
  visible: true,
}

// 2. Add translations
// vi/strings.json
"profile": {
  "favorites": "Yêu thích",
  "favorite_dishes": "Món ăn yêu thích",
  "favorite_vendors": "Quán yêu thích"
}

// en/strings.json
"profile": {
  "favorites": "Favorites",
  "favorite_dishes": "Favorite Dishes",
  "favorite_vendors": "Favorite Vendors"
}
```

That's it! The section will automatically appear in the ProfileScreen.
