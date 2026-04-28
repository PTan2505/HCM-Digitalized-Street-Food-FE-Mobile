# Lowca — HCM Street Food Mobile

A React Native (Expo) mobile application for discovering street food vendors in Ho Chi Minh City. The app ships as **two variants** from a single codebase:

- **Lowca** (`com.hcmstreetfood.mobile`) — customer/diner-facing app
- **Lowca Manager** (`com.hcmstreetfood.manager`) — vendor management app

---

## Tech Stack

| Concern | Library |
|---|---|
| Framework | React Native 0.81.5 + React 19 + Expo ~54 |
| Language | TypeScript ~5.9 (strict) |
| Styling | NativeWind v4 (Tailwind CSS via `className`) |
| Navigation | React Navigation v7 (native stack + bottom tabs) |
| Server state | TanStack React Query v5 |
| Client state | Redux Toolkit v2 + react-redux v9 |
| Forms | React Hook Form v7 + Zod v4 |
| HTTP | Axios v1 (custom `ApiClient` wrapper) |
| Maps | `@maplibre/maplibre-react-native` v10 + OpenMap Vietnam tiles |
| Auth | Google Sign-In, Facebook SDK |
| Animation | react-native-reanimated v4 + react-native-worklets |
| Real-time | `@microsoft/signalr` |
| i18n | i18next v25 + react-i18next v16 (vi default, en) |
| Fonts | Nunito via `@expo-google-fonts/nunito` |
| Package manager | `bun` |

---

## Project Structure

```
hcm-digitalized-street-food-fe-mobile/
├── src/
│   ├── apps/                     # App bootstrapping per variant
│   │   ├── customer/             # Customer app entry + navigation
│   │   └── manager/              # Manager app entry + navigation
│   ├── assets/                   # Shared static assets
│   │   ├── icons/                # SVG icons
│   │   ├── logos/                # App logos
│   │   ├── backgrounds/          # Background images
│   │   ├── sounds/               # Audio files
│   │   └── locales/
│   │       ├── vi/strings.json   # Vietnamese translations (default)
│   │       └── en/strings.json   # English translations
│   ├── components/               # Shared UI components
│   ├── config/                   # Axios instance + interceptors
│   ├── constants/                # Error message keys (i18n)
│   ├── contexts/                 # React contexts
│   ├── features/                 # Feature-sliced domain modules
│   │   ├── auth/                 # Login, Register, OTP, Forgot Password
│   │   ├── customer/             # Customer-facing features
│   │   │   ├── campaigns/        # Promotions & campaign browsing
│   │   │   ├── direct-ordering/  # Direct checkout & order placement
│   │   │   ├── home/             # Feed, swipe UI, restaurant details
│   │   │   ├── maps/             # Map view, location picker, geocoding
│   │   │   ├── quests/           # Gamification / quest system
│   │   │   └── reputation/       # User reputation & badges
│   │   ├── manager/              # Vendor manager features
│   │   │   ├── account/          # Manager account settings
│   │   │   ├── branch/           # Branch management
│   │   │   ├── day-off/          # Day-off scheduling
│   │   │   ├── feedback/         # Customer feedback review
│   │   │   ├── home/             # Manager dashboard
│   │   │   ├── menu/             # Menu & dish management
│   │   │   ├── orders/           # Order management
│   │   │   └── schedule/         # Opening schedule
│   │   ├── notifications/        # Push notification handling & UI
│   │   └── user/                 # Profile, dietary preferences, payment
│   ├── hooks/                    # Typed Redux hooks
│   ├── lib/
│   │   └── api/                  # ApiClient class, axiosApi singleton
│   ├── screens/                  # Shared/fallback screens
│   ├── slices/                   # Redux slices (auth, dietary)
│   ├── types/                    # Shared TypeScript types
│   └── utils/                    # Token management, i18n setup, helpers
├── app.config.ts                 # Expo config (variant-aware)
├── babel.config.cjs
├── tailwind.config.js
├── tsconfig.json
├── eslint.config.js
├── orval.config.ts               # OpenAPI code generation config
└── eas.json                      # EAS Build profiles
```

### Feature Module Structure

Each feature follows this internal layout:

```
src/features/<domain>/
├── api/         API request classes and React Query hooks
├── assets/      Static files scoped to this feature
├── components/  UI components used only within this feature
├── hooks/       React hooks scoped to this feature
├── screens/     Screen components (one per file, PascalCase)
├── types/       TypeScript types and interfaces
└── utils/       Utility functions and Zod validation schemas
```

---

## Architecture

### API Layer

```
AxiosApiService          — Axios instance, auth header injection, 401 handling
    ↓
ApiClient                — get/post/put/patch/delete wrappers, error normalization
    ↓
Feature API classes      — e.g. LoginApi, UserProfileApi, DietaryPreferenceApi
    ↓
axiosApi singleton       — single import point consumed by Redux thunks
```

Backend response envelope: `{ status, message, data: T, errorCode }`

### State Management

- **React Query** — all server data (lists, details, paginated results)
- **Redux Toolkit** — auth session, user profile, global client state
- Two Redux slices: `user` and `dietary`
- Auth rehydration via `AppInitializer` dispatching `loadUserFromStorage()` on startup

### Navigation

```
Auth stack (unauthenticated)
    ↓ login success → navigation.replace()
Customer app (HomeBottomTabs)
    ├── Home tab      → HomeScreen → RestaurantSwipe / RestaurantDetails / CurrentPicks
    ├── Map tab       → MapScreen → LocationPicker
    ├── Quests tab    → QuestsScreen
    └── Profile tab   → ProfileScreen → EditProfile / DietaryPreferences / Payment History

Manager app (ManagerBottomTabs)
    ├── Home tab      → Manager Dashboard
    ├── Orders tab    → Order Management
    ├── Menu tab      → Dish / Menu Management
    └── Account tab   → Branch / Schedule / Account Settings
```

---

## Getting Started

### Prerequisites

- [Bun](https://bun.sh/) — package manager
- [Expo CLI](https://docs.expo.dev/get-started/installation/)
- Xcode (iOS) or Android Studio (Android)

### Install

```bash
bun install
```

### Environment Variables

Create a `.env` file at the project root:

```env
EXPO_PUBLIC_API_URL=https://your-backend-url
EXPO_PUBLIC_GOOGLE_IOS_CLIENT_ID=...
EXPO_PUBLIC_GOOGLE_CLIENT_ID=...
EXPO_PUBLIC_OPENMAP_API_KEY=...
EXPO_PUBLIC_OPENMAP_VN_STYLE=...
EXPO_PUBLIC_WEB_URL=https://your-web-domain
```

### Run

```bash
# Customer app
bun run start:customer

# Manager app
bun run start:manager
```

### Build (local)

```bash
# Customer
bun run build:android
bun run build:ios

# Manager
bun run build:manager:android
bun run build:manager:ios
```

---

## Code Quality

Run these in order after every change:

```bash
bun run type-check      # TypeScript (tsc --noEmit)
bun run lint            # ESLint
bun run format:check    # Prettier
```

Only when touching build config, navigation, or entry points:

```bash
bun run check:bundle    # Expo bundle export (slow)
```

### Code Generation

API types are generated from the OpenAPI spec via [Orval](https://orval.dev/):

```bash
bun run generate
```

---

## Key Conventions

- **Path aliases** over relative imports — always use `@features/*`, `@components/*`, `@hooks/*`, etc.
- **NativeWind** (`className`) for styling; `StyleSheet` only for dynamic/animated values
- **Schemas are i18n factory functions** — export `get<Name>Schema(t: TFunction)`, consume with `useMemo(() => getSchema(t), [t])`
- **One component per file** — PascalCase filename matching the export name
- **Named exports only** for screens: `export const MyScreen = (): JSX.Element => { ... }`
- **Feature-sliced import boundaries** — features must not import from `src/app` or other features
- **React Query** for server data; **Redux** for auth/client-only state
