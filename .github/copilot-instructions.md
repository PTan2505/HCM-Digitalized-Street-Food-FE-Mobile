# Copilot Instructions — Lowca (HCM Street Food Mobile)

## Project Overview

**Lowca** is a React Native (Expo) street food discovery app for Ho Chi Minh City. Users find nearby street food vendors via a map, swipe UI, and dietary preference filters.

- **Platform:** iOS + Android via Expo (~54) with New Architecture (`newArchEnabled: true`)
- **Language:** TypeScript ~5.9 (strict mode)
- **Package manager:** `bun`
- **Bundle ID:** `com.hcmstreetfood.mobile`

---

## Technology Stack

| Concern       | Library                                                             |
| ------------- | ------------------------------------------------------------------- |
| UI framework  | React Native 0.81.5 + React 19                                      |
| Styling       | NativeWind v4 (Tailwind CSS via `className`)                        |
| Navigation    | React Navigation v7 (native stack + bottom tabs, static config API) |
| State         | Redux Toolkit v2 + react-redux v9                                   |
| Forms         | React Hook Form v7 + Zod v4 + `@hookform/resolvers`                 |
| HTTP client   | Axios v1 (custom `ApiClient` wrapper)                               |
| Maps          | `@maplibre/maplibre-react-native` v10 + OpenMap Vietnam tiles       |
| Auth (social) | Google Sign-In, Facebook SDK                                        |
| Animation     | react-native-reanimated v4, react-native-worklets                   |
| i18n          | i18next v25 + react-i18next v16 (locales: `vi` default, `en`)       |
| Fonts         | Nunito via `@expo-google-fonts/nunito`                              |

---

## Architecture

### Feature-Sliced Design

Code is organized under `src/features/<domain>/` with strict import boundaries enforced by ESLint (`import/no-restricted-paths`):

- **Features** (`auth`, `home`, `maps`, `user`) own their screens, components, hooks, API, types, and utils.
- **Shared layers** (`src/components/`, `src/hooks/`, `src/utils/`, `src/config/`, `src/constants/`) must **not** import from features or `src/app`.
- Features must **not** import from `src/app`.

```
src/
├── app/               Bootstrap: App.tsx, provider.tsx, store.ts, navigation/
├── assets/            Locales, icons (SVG), logos, backgrounds
├── components/        Shared UI components (CustomButton, CustomInput, etc.)
├── config/            Axios instance + interceptors
├── constants/         Error messages (Vietnamese and English strings)
├── features/
│   ├── auth/          Login, Register, OTP, Forgot Password
│   ├── home/          HomeScreen, SearchScreen, RestaurantSwipe, RestaurantDetails, CurrentPicks
│   ├── maps/          MapScreen, LocationPickerScreen, geocoding services
│   └── user/          ProfileScreen, EditProfile, DietaryPreferences
├── hooks/             Typed Redux hooks (useAppDispatch, useAppSelector, createAppAsyncThunk)
├── lib/api/           ApiClient class, axiosApi singleton, URL map
├── slices/            Redux slices: auth.ts (store key: 'user'), dietary.ts
├── types/             Shared types: apiResponse.ts, user.ts
└── utils/             tokenManagement, i18n setup, formatCountDownTime, getHighResAvatar
```

### API Layer (Repository Pattern)

```
AxiosApiService (config/axiosApiService.ts)    — Axios instance, auth header, 401 clear
    ↓
ApiClient (lib/api/apiClient.ts)               — get/post/put/patch/delete wrappers, error normalization
    ↓
API classes (features/*/api/*.ts)              — LoginApi, UserProfileApi, DietaryPreferenceApi, etc.
    ↓
axiosApi singleton (lib/api/apiInstance.ts)    — single import point consumed by Redux slices
```

- Backend response envelope: `{ status, message, data: T, errorCode }`
- Errors normalized to `APIErrorResponse { code, status, message, fieldErrors }`
- Token stored in `AsyncStorage` via `TokenManagement` (key: `'accessToken'`)
- **No refresh token flow** — on 401, tokens are cleared and user must re-authenticate

### State Management (Redux Toolkit)

- Two slices: `user` (store key: `user`) and `dietary`
- Use `createAppAsyncThunk` (from `src/hooks/reduxHooks.ts`) for all async thunks
- Auth slice uses `addMatcher` with `isPending`/`isRejected`/`isFulfilled` to consolidate loading/error state
- `AppInitializer` in `provider.tsx` dispatches `loadUserFromStorage()` on startup for auth rehydration
- Always use typed hooks: `useAppDispatch`, `useAppSelector` from `@hooks/reduxHooks`

### Navigation

```
Auth stack (unauthenticated)
    ↓ login success → navigation.replace()
Main (HomeBottomTabs)
    ├── Home tab  → HomeScreen → (redirects to SetupUserInfo / DietaryPreferences if needed)
    └── Profile tab → ProfileScreen
Stack screens: Search, RestaurantSwipe, RestaurantDetails,
               CurrentPicks, CurrentPickDetails, SetupUserInfo,
               DietaryPreferences, Map, LocationPicker
```

- Auth transitions use `navigation.replace()` (clears back stack)
- Stack pushes use `navigation.navigate()`
- Navigation types come from `StaticParamList<typeof RootStack>` augmented into `ReactNavigation.RootParamList`
- **No Expo Router** — this uses React Navigation manual stack/tab setup

---

## Coding Conventions

### File & Folder Naming

| Element              | Convention                                 | Example                               |
| -------------------- | ------------------------------------------ | ------------------------------------- |
| Components / Screens | PascalCase                                 | `HomeScreen.tsx`, `ReviewCard.tsx`    |
| Hooks                | camelCase with `use` prefix                | `useLogin.tsx`, `useProfile.ts`       |
| API classes          | PascalCase with `Api` suffix               | `LoginApi`, `UserProfileApi`          |
| Utils / services     | camelCase                                  | `tokenManagement.ts`, `geocoding.ts`  |
| Redux slices         | camelCase                                  | `slices/auth.ts`, `slices/dietary.ts` |
| Zod schemas          | camelCase with `Schema` suffix in `utils/` | `loginFormSchema.ts`                  |
| Type files           | camelCase                                  | `apiResponse.ts`, `user.ts`           |

### Component Pattern

```tsx
// PascalCase named export, explicit return type
export const MyComponent = (): JSX.Element => {
  return <View className="flex-1 bg-white" />;
};
```

### Hooks Pattern

```tsx
// Feature-level hooks own API calls and dispatch
export const useLogin = () => {
  const dispatch = useAppDispatch();
  // ... returns { handleLogin, isLoading, error }
};
```

### API Class Pattern

```tsx
export class LoginApi extends ApiClient {
  async login(data: LoginRequest): Promise<ApiResponse<LoginResponse>> {
    return this.post(API_URLS.AUTH.LOGIN, data);
  }
}
```

### Redux Thunk Pattern

```tsx
export const myThunk = createAppAsyncThunk(
  'sliceName/actionName',
  async (arg, { rejectWithValue }) => {
    const result = await axiosApi.someApi.someMethod(arg);
    if (!result.success) return rejectWithValue(result.error);
    return result.data;
  }
);
```

---

## Styling

- **Primary method:** NativeWind `className` prop (Tailwind utility classes)
- **Brand colors:**
  - Primary green: `#a1d973` / Tailwind: `primary.DEFAULT: #9FD356`, `primary.light: #B8E986`, `primary.dark: #7AB82D`
- **Custom title classes:** `.title-xl`, `.title-lg`, `.title-md`, `.title-sm`, `.title-xs`
- **Inline styles / StyleSheet:** only for dynamic values, animations, or conditional styles
- Always use `SafeAreaView` from `react-native-safe-area-context` with explicit `edges` prop
- Font: **Nunito** loaded via `useFonts` in `App.tsx`

---

## Form Validation

- Always use **React Hook Form** + **Zod** via `@hookform/resolvers/zod`
- Schemas live in `features/<feature>/utils/<name>Schema.ts`
- **Schemas are factory functions** — each schema file exports `get<Name>Schema(t: TFunction)` (not a bare `const`), so error messages are resolved at call time using the active language
- Error message **keys** live in `src/constants/errorMessage.ts` (`VALIDATE_ERROR_MESSAGES`); actual strings are in `src/assets/locales/vi/strings.json` and `en/strings.json` under the `validation` namespace
- Use the `validator` library for phone/email/name format checks inside Zod `.refine()`
- In components/hooks, create the schema with `useMemo` and pass `t` from `useTranslation()`:

```tsx
const { t } = useTranslation();
const schema = useMemo(() => getSomeSchema(t), [t]);
const methods = useForm({ resolver: zodResolver(schema) });
```

---

## Path Aliases

Always use these aliases instead of relative imports:

```
@assets/*       → src/assets/*
@app/*          → src/app/*
@components/*   → src/components/*
@contexts/*     → src/contexts/*
@hooks/*        → src/hooks/*
@lib/*          → src/lib/*
@custom-types/* → src/types/*
@utils/*        → src/utils/*
@config/*       → src/config/*
@slices/*       → src/slices/*
@constants/*    → src/constants/*
@features/*     → src/features/*
@auth/*         → src/features/auth/*
@user/*         → src/features/user/*
```

---

## Environment Variables

All env vars are `EXPO_PUBLIC_*` (exposed to the JS bundle):

| Variable                           | Purpose                    |
| ---------------------------------- | -------------------------- |
| `EXPO_PUBLIC_API_URL`              | Backend base URL           |
| `EXPO_PUBLIC_GOOGLE_IOS_CLIENT_ID` | Google Sign-In iOS         |
| `EXPO_PUBLIC_GOOGLE_CLIENT_ID`     | Google Sign-In web/Android |
| `EXPO_PUBLIC_OPENMAP_API_KEY`      | OpenMap Vietnam API key    |
| `EXPO_PUBLIC_OPENMAP_VN_STYLE`     | MapLibre tile style URL    |

---

## Maps & Location

- Map tiles: OpenMap Vietnam via MapLibre (`@maplibre/maplibre-react-native`)
- Geocoding/autocomplete: `src/features/maps/services/geocoding.ts` (`searchAddress`, `getPlaceDetail`, `forwardGeocode`, `reverseGeocode`)
- Location permissions: `src/features/maps/hooks/useLocationPermission.ts`
- Vendor tier visibility: `tier_premium` always visible, `tier_standard` at zoom ≥ 13, `tier_basic` at zoom ≥ 15

---

## i18n

- Setup in `src/utils/i18n.ts`; call `useTranslation()` hook for translated strings
- Default/fallback locale: `vi`; supported: `vi`, `en`
- Language auto-detected from device, persisted to `AsyncStorage` (key: `@app_language`)
- Translation files: `src/assets/locales/vi/strings.json`, `src/assets/locales/en/strings.json`

---

## Key Rules

1. **Never import from `src/app` or cross-feature** — respect the feature-sliced import boundaries.
2. **Always use typed Redux hooks** — `useAppDispatch` and `useAppSelector` from `@hooks/reduxHooks`.
3. **Use `createAppAsyncThunk`** (not raw `createAsyncThunk`) for all async Redux actions.
4. **Schemas are i18n factory functions** — always export `get<Name>Schema(t: TFunction)` from `features/<feature>/utils/`; never export a bare Zod object. Consume with `useMemo(() => getSchema(t), [t])`.
5. **Use path aliases** — never use deep relative paths (`../../../`).
6. **Prefer NativeWind** — use `className` for styling; fallback to `StyleSheet` only for dynamic/animated styles.
7. **Screens are named exports** — `export const MyScreen = (): JSX.Element`.
8. **No Expo Router** — this project uses React Navigation; do not suggest file-based routing patterns.
9. **Bun is the package manager** — use `bun add` / `bun remove`, not `npm` or `yarn`.
10. **SVGs are React components** — imported via `react-native-svg-transformer`; use `import Logo from '@assets/logos/logo.svg'`.
