# 3.2 Navigation Screen Flow (from stackNavigator)

## 3.2.1 App Entry and Authentication

- Function Description: The app starts at the root stack and selects the first screen based on authentication state. If user exists, it opens Main; otherwise Auth.
- Function Trigger:
  - Button/Navigation: App launch, app cold start, auth restore completion, login success.
  - Trigger: `initialState.routes = [{ name: user !== null ? 'Main' : 'Auth' }]` and auth `navigation.replace('Main')`.
  - Function: Prevents Auth to Main flash and guarantees correct first screen.
- Related screens/components: Navigation container, AuthScreen, Login hook.

## 3.2.2 Main Tabs

- Function Description: Main hosts the bottom tab navigator with Home and Profile tabs.
- Function Trigger:
  - Button/Navigation: Tap tab item in CustomBottomTabBar.
  - Trigger: `navigation.navigate(route.name, route.params)` in bottom tab bar.
  - Function: Switches between discovery and account areas.
- Related screens/components: HomeBottomTabs, CustomBottomTabBar, HomeScreen, ProfileScreen.

## 3.2.3 Home Discovery Flow

- Function Description: Users discover branches from Home sections and cards, then open Search, ListBranch, RestaurantSwipe, RestaurantDetails, Map, Favorites, or Notifications.
- Function Trigger:
  - Button/Navigation: Search bar, filter button, category card, campaign cards, branch cards, header icons.
  - Trigger: Multiple `navigation.navigate(...)` calls from HomeScreen and HomeHeader.
  - Function: Main browsing entry for food places and promotional campaigns.
- Related screens/components: HomeScreen, HomeHeader, PlaceCard, VendorCampaignPlaceCard.

## 3.2.4 Restaurant Flow

- Function Description: Users open branch detail journey from cards/maps/search/favorites and continue to details, reviews, cart, and map direction.
- Function Trigger:
  - Button/Navigation: Branch card click, map card click, deep link restaurant/:branchId.
  - Trigger: `RestaurantSwipe`, `RestaurantDetails`, `Restaurant`, `ReviewList` navigation.
  - Function: Full branch engagement flow (menu, reviews, nearby, order entry).
- Related screens/components: RestaurantSwipeScreen, RestaurantDetailsScreen, RestaurantDeepLinkScreen, ReviewsTab.

## 3.2.5 Direct Ordering Flow

- Function Description: Users create cart, checkout, choose voucher, pay via QR, and track order status/history.
- Function Trigger:
  - Button/Navigation: Open cart from RestaurantDetails/Profile, place order, confirm payment.
  - Trigger: `PersonalCart -> DirectCheckout -> VoucherSelect (optional) -> PaymentQR -> OrderStatus`.
  - Function: End-to-end direct ordering and payment tracking.
- Related screens/components: PersonalCartScreen, DirectCheckoutScreen, VoucherSelectScreen, PaymentQRScreen, OrderStatusScreen, OrderHistoryScreen.

## 3.2.6 Campaigns, Vouchers, and Quests

- Function Description: Users browse campaigns, voucher wallet/marketplace, applicable branches, and quest detail/progress.
- Function Trigger:
  - Button/Navigation: Home banners, profile menu actions, quick actions, campaign/voucher cards.
  - Trigger: `CampaignList`, `SystemCampaignDetail`, `RestaurantCampaignDetail`, `VoucherWallet`, `VoucherHistory`, `VoucherApplicableBranches`, `VoucherMarketplace`, `QuestList`, `QuestDetail`.
  - Function: Growth loop for promotions and gamification.
- Related screens/components: CampaignListScreen, VoucherWalletScreen, QuestListScreen, SystemCampaignDetailScreen.

## 3.2.7 Map and Ghost Pin Flow

- Function Description: Users open map from Home/Search/Details, manage ghost pins, and navigate from map list/markers to restaurant screens.
- Function Trigger:
  - Button/Navigation: Header map icon, search map icon, details view-on-map, profile ghost pin menu.
  - Trigger: `Map`, `GhostPinCreation`, `MyGhostPins`, plus map-driven `RestaurantSwipe` and `RestaurantDetails`.
  - Function: Location-centric discovery and user-generated ghost pin interactions.
- Related screens/components: MapScreen, MyGhostPinsScreen, GhostPinCreationScreen.

## 3.2.8 Profile and Setup Flow

- Function Description: Profile hub routes to favorites, wallet, order history, withdraw, user info setup, dietary preferences, and cart shortcut.
- Function Trigger:
  - Button/Navigation: Profile header actions and section list items.
  - Trigger: `navigation.navigate(...)` from ProfileScreen and profile section config.
  - Function: Account management and personal settings.
- Related screens/components: ProfileScreen, profileSections config, EditUserInfoScreen, DietaryPreferencesScreen, WithdrawScreen.

---

# 3.3 Route-to-Source Mapping (Stack Screen by Screen)

## 3.3.1 Auth

- Used from: App initial route; logout/auth reset (`useLogin` can replace to Auth).
- Related sources: stack navigator, auth hooks.

## 3.3.2 Main

- Used from: Auth success and onboarding completion (`AuthScreen`, `DietaryPreferencesScreen`, `UserProfileForm`).
- Related sources: auth screen/hook, user setup forms.

## 3.3.3 Search

- Used from: Home search bar, filter CTA, category cards.
- Related sources: HomeScreen.

## 3.3.4 Restaurant

- Used from: Vendor campaign branch section (deep-link resolver route).
- Related sources: VendorCampaignBranchesSection.

## 3.3.5 RestaurantSwipe

- Used from: Home place cards, ListBranch cards, map list interactions, applicable voucher branch grid.
- Related sources: HomeScreen, ListBranchScreen, MapScreen, ApplicableBranchGridItem.

## 3.3.6 RestaurantDetails

- Used from: Search results, favorites, map detail card, vendor campaign card, personal cart links, restaurant deep-link resolution.
- Related sources: SearchScreen, FavoritesScreen, MapScreen, VendorCampaignPlaceCard, PersonalCartScreen, RestaurantDeepLinkScreen.

## 3.3.7 ReviewList

- Used from: Restaurant details reviews tab, notifications (vendor reply), notification hook auto-routing.
- Related sources: ReviewsTab, NotificationScreen, useNotificationNavigation.

## 3.3.8 CurrentPicks

- Used from: Deep link path current-picks (no direct in-app navigate found).
- Related sources: stack linking config.

## 3.3.9 ListBranch

- Used from: Home campaign branch section and generic places list CTA.
- Related sources: HomeScreen.

## 3.3.10 CurrentPickDetails

- Used from: CurrentPicksScreen cards.
- Related sources: CurrentPicksScreen.

## 3.3.11 Favorites

- Used from: Home header icon, Home quick action, Profile section item.
- Related sources: HomeHeader, homeQuickActions, profileSections.

## 3.3.12 SetupUserInfo

- Used from: Home onboarding guard, Profile quick profile action, Profile section item.
- Related sources: HomeScreen, ProfileScreen, profileSections.

## 3.3.13 DietaryPreferences

- Used from: Home onboarding guard, Profile section item.
- Related sources: HomeScreen, profileSections.

## 3.3.14 Profile

- Used from: Bottom tab Profile route and deep link path profile.
- Related sources: bottomTabNavigator, stack linking config.

## 3.3.15 Map

- Used from: Home header, Search header icon, Restaurant details view-on-map.
- Related sources: HomeHeader, SearchScreen, RestaurantDetailsScreen.

## 3.3.16 LocationPicker

- Used from: No in-app navigate call found currently.
- Related sources: stack route declaration only.

## 3.3.17 GhostPinCreation

- Used from: Home quick action and MyGhostPins actions.
- Related sources: homeQuickActions, MyGhostPinsScreen.

## 3.3.18 MyGhostPins

- Used from: Profile section item.
- Related sources: profileSections.

## 3.3.19 PersonalCart

- Used from: Restaurant details floating cart CTA and Profile cart icon.
- Related sources: RestaurantDetailsScreen, ProfileScreen.

## 3.3.20 DirectCheckout

- Used from: Personal cart place-order action.
- Related sources: PersonalCartScreen.

## 3.3.21 VoucherSelect

- Used from: Direct checkout voucher picker row.
- Related sources: DirectCheckoutScreen.

## 3.3.22 PaymentQR

- Used from: Direct checkout confirm action.
- Related sources: DirectCheckoutScreen.

## 3.3.23 OrderStatus

- Used from: PaymentQR auto/manual actions, OrderHistory item tap, Notification item tap, notification hook deep action, deep-link `order-status/:orderId`.
- Related sources: PaymentQRScreen, OrderHistoryScreen, NotificationScreen, useNotificationNavigation, stack linking config.

## 3.3.24 OrderHistory

- Used from: Profile section item.
- Related sources: profileSections.

## 3.3.25 Notifications

- Used from: Home header bell icon.
- Related sources: HomeHeader.

## 3.3.26 CampaignList

- Used from: Deep-link path campaigns (no direct in-app navigate found).
- Related sources: stack linking config.

## 3.3.27 SystemCampaignDetail

- Used from: Home campaign banner and CampaignList cards.
- Related sources: HomeScreen, CampaignListScreen.

## 3.3.28 RestaurantCampaignDetail

- Used from: Home campaign banner and CampaignList cards.
- Related sources: HomeScreen, CampaignListScreen.

## 3.3.29 VoucherWallet

- Used from: Profile section item.
- Related sources: profileSections.

## 3.3.30 VoucherApplicableBranches

- Used from: Voucher wallet apply action.
- Related sources: VoucherWalletScreen.

## 3.3.31 VoucherHistory

- Used from: Voucher wallet header action.
- Related sources: VoucherWalletScreen.

## 3.3.32 VoucherMarketplace

- Used from: Home quick action and Profile section item.
- Related sources: homeQuickActions, profileSections.

## 3.3.33 QuestList

- Used from: Home quick action and Profile section item.
- Related sources: homeQuickActions, profileSections.

## 3.3.34 QuestDetail

- Used from: Quest list cards, System campaign quest card, notifications, notification hook.
- Related sources: QuestListScreen, SystemCampaignDetailScreen, NotificationScreen, useNotificationNavigation.

## 3.3.35 Withdraw

- Used from: Profile section item.
- Related sources: profileSections.

---

# 3.4 Important Notes

- `CurrentPicks`, `CampaignList`, and `LocationPicker` currently have no direct in-app navigate source discovered in scanned files; they are still reachable by route registration/deep links or future calls.
- Notification taps can bypass regular screen entry and jump directly to `OrderStatus`, `ReviewList`, or `QuestDetail` after navigation is ready and user is authenticated.
- `Restaurant` is a special deep-link resolver route, not a final detail UI; it fetches data then replaces to `RestaurantDetails`.
