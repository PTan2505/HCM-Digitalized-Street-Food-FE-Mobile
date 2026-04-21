import { HomeBottomTabs } from '@customer-app/navigation/bottomTabNavigator';
import { DirectCheckoutScreen } from '@features/customer/direct-ordering/screens/DirectCheckoutScreen';
import { MyCartsScreen } from '@features/customer/direct-ordering/screens/MyCartsScreen';
import { OrderHistoryScreen } from '@features/customer/direct-ordering/screens/OrderHistoryScreen';
import { OrderStatusScreen } from '@features/customer/direct-ordering/screens/OrderStatusScreen';
import { PaymentQRScreen } from '@features/customer/direct-ordering/screens/PaymentQRScreen';
import { PersonalCartScreen } from '@features/customer/direct-ordering/screens/PersonalCartScreen';
import type { UserVoucherApiDto } from '@features/customer/campaigns/api/voucherApi';
import type { Voucher } from '@slices/campaigns';
import { VoucherSelectScreen } from '@features/customer/direct-ordering/screens/VoucherSelectScreen';
import { CurrentPickDetailsScreen } from '@features/customer/home/screens/CurrentPickDetailsScreen';
import { FavoritesScreen } from '@features/customer/home/screens/FavoritesScreen';
import { CurrentPicksScreen } from '@features/customer/home/screens/CurrentPicksScreen';
import type { VoucherChip } from '@features/customer/home/components/common/PlaceCard';
import { ListBranchScreen } from '@features/customer/home/screens/ListBranchScreen';
import { RestaurantDetailsScreen } from '@features/customer/home/screens/RestaurantDetailsScreen';
import { RestaurantSwipeScreen } from '@features/customer/home/screens/RestaurantSwipeScreen';
import { RestaurantDeepLinkScreen } from '@features/customer/home/screens/RestaurantDeepLinkScreen';
import { ReviewListScreen } from '@features/customer/home/screens/ReviewListScreen';
import { WriteReviewScreen } from '@features/customer/home/screens/WriteReviewScreen';
import { SearchScreen } from '@features/customer/home/screens/SearchScreen';
import { GhostPinCreationScreen } from '@features/customer/maps/screens/GhostPinCreationScreen';
import { LocationPickerScreen } from '@features/customer/maps/screens/LocationPickerScreen';
import { MapScreen } from '@features/customer/maps/screens/MapScreen';
import { MyGhostPinsScreen } from '@features/customer/maps/screens/MyGhostPinsScreen';
import { NotificationScreen } from '@features/customer/notifications/screens/NotificationScreen';
import { useAppSelector } from '@hooks/reduxHooks';
import {
  createStaticNavigation,
  StaticParamList,
  Theme,
} from '@react-navigation/native';
import { navigationRef } from '@utils/navigationRef';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import { selectUser } from '@slices/auth';

import { CampaignListScreen } from '@features/customer/campaigns/screens/CampaignListScreen';
import { RestaurantCampaignDetailScreen } from '@features/customer/campaigns/screens/RestaurantCampaignDetailScreen';
import { SystemCampaignDetailScreen } from '@features/customer/campaigns/screens/SystemCampaignDetailScreen';
import { VoucherHistoryScreen } from '@features/customer/campaigns/screens/VoucherHistoryScreen';
import { VoucherApplicableBranchesScreen } from '@features/customer/campaigns/screens/VoucherApplicableBranchesScreen';
import { VoucherMarketplaceScreen } from '@features/customer/campaigns/screens/VoucherMarketplaceScreen';
import { VoucherWalletScreen } from '@features/customer/campaigns/screens/VoucherWalletScreen';
import { AuthScreen } from '@features/auth/screens/AuthScreen';
// import ProfileScreen from '@features/customer/user/screens/ProfileScreen';
import type { TabType } from '@features/customer/home/screens/RestaurantDetailsScreen';
import type { ActiveBranch } from '@features/customer/home/types/branch';
import { QuestDetailScreen } from '@features/customer/quests/screens/QuestDetailScreen';
import { QuestListScreen } from '@features/customer/quests/screens/QuestListScreen';
import { DietaryPreferencesScreen } from '@features/customer/user/screens/DietaryPreferencesScreen';
import { EditUserInfoScreen } from '@features/customer/user/screens/EditUserProfileScreen';
import { ProfileScreen } from '@features/customer/user/screens/ProfileScreen';
import { TierProgressScreen } from '@features/customer/user/screens/TierProgressScreen';
import { WithdrawScreen } from '@features/customer/user/screens/WithdrawScreen';

const RootStack = createNativeStackNavigator({
  initialRouteName: 'Auth',
  screenOptions: { headerShown: false },
  screens: {
    Auth: {
      screen: AuthScreen,
    },
    Main: {
      screen: HomeBottomTabs,
      linking: '',
    },
    Search: {
      screen: SearchScreen,
      linking: 'search',
      params: {} as {
        autoFocus?: boolean;
        openFilter?: boolean;
      },
    },
    Restaurant: {
      screen: RestaurantDeepLinkScreen,
      linking: {
        path: 'restaurant/:branchId',
        parse: { branchId: Number },
      },
      params: {} as { branchId: number; tab?: TabType },
    },
    RestaurantSwipe: {
      screen: RestaurantSwipeScreen,
      params: {} as {
        branch: ActiveBranch;
        displayName: string;
        onRatingUpdateId?: string;
      },
    },
    RestaurantDetails: {
      screen: RestaurantDetailsScreen,
      params: {} as {
        branch: ActiveBranch;
        displayName: string;
        tab?: TabType;
        onRatingUpdateId?: string;
      },
    },
    WriteReview: {
      screen: WriteReviewScreen,
      params: {} as {
        orderId: number;
        branchId: number;
      },
    },
    ReviewList: {
      screen: ReviewListScreen,
      params: {} as {
        branchId: number;
        displayName: string;
        ownFeedbackId?: number;
        branchLat: number;
        branchLong: number;
      },
    },
    CurrentPicks: {
      screen: CurrentPicksScreen,
      linking: 'current-picks',
    },
    ListBranch: {
      screen: ListBranchScreen,
      params: {} as {
        items?: ActiveBranch[];
        title?: string;
        vouchersByBranchId?: Record<number, VoucherChip[]>;
      },
    },
    CurrentPickDetails: {
      screen: CurrentPickDetailsScreen,
    },
    Favorites: {
      screen: FavoritesScreen,
      linking: 'favorites',
    },
    SetupUserInfo: {
      screen: EditUserInfoScreen,
    },
    DietaryPreferences: {
      screen: DietaryPreferencesScreen,
    },
    Profile: {
      screen: ProfileScreen,
      linking: 'profile',
    },
    Map: {
      screen: MapScreen,
      linking: 'map',
    },
    LocationPicker: {
      screen: LocationPickerScreen,
    },
    GhostPinCreation: {
      screen: GhostPinCreationScreen,
    },
    MyGhostPins: {
      screen: MyGhostPinsScreen,
      linking: 'ghost-pins',
    },
    MyCarts: {
      screen: MyCartsScreen,
      linking: 'carts',
    },
    PersonalCart: {
      screen: PersonalCartScreen,
      linking: 'cart',
      params: {} as {
        branchId: number;
        branchName?: string;
        isOpen?: boolean;
      },
    },
    DirectCheckout: {
      screen: DirectCheckoutScreen,
      params: {} as {
        branchName: string;
        note?: string;
      },
    },
    VoucherSelect: {
      screen: VoucherSelectScreen,
      params: {} as {
        vouchers: UserVoucherApiDto[];
        totalAmount: number;
        selectedVoucherId?: number | null;
        onSelect: (voucher: UserVoucherApiDto | null) => void;
      },
    },
    PaymentQR: {
      screen: PaymentQRScreen,
      params: {} as {
        orderId: number;
        qrCode: string;
        totalAmount: number;
        branchName: string;
        bin?: string | null;
        accountNumber?: string | null;
        accountName?: string | null;
      },
    },
    OrderStatus: {
      screen: OrderStatusScreen,
      linking: {
        path: 'order-status/:orderId',
        parse: { orderId: Number },
      },
      params: {} as {
        orderId: number;
        branchName: string;
        readOnly?: boolean;
      },
    },
    OrderHistory: {
      screen: OrderHistoryScreen,
      linking: 'order-history',
    },
    Notifications: {
      screen: NotificationScreen,
      linking: 'notifications',
    },
    CampaignList: {
      screen: CampaignListScreen,
      linking: 'campaigns',
    },
    SystemCampaignDetail: {
      screen: SystemCampaignDetailScreen,
      params: {} as { campaignId: string },
    },
    RestaurantCampaignDetail: {
      screen: RestaurantCampaignDetailScreen,
      params: {} as { campaignId: string },
    },
    VoucherWallet: {
      screen: VoucherWalletScreen,
      linking: 'vouchers',
    },
    VoucherApplicableBranches: {
      screen: VoucherApplicableBranchesScreen,
      params: {} as { voucher: Voucher },
    },
    VoucherHistory: {
      screen: VoucherHistoryScreen,
      linking: 'vouchers/history',
    },
    VoucherMarketplace: {
      screen: VoucherMarketplaceScreen,
      linking: 'vouchers/marketplace',
    },
    QuestList: {
      screen: QuestListScreen,
      linking: 'quests',
    },
    QuestDetail: {
      screen: QuestDetailScreen,
      linking: {
        path: 'quests/:questId',
        parse: { questId: Number },
      },
      params: {} as { questId: number },
    },
    TierProgress: {
      screen: TierProgressScreen,
    },
    Withdraw: {
      screen: WithdrawScreen,
    },
  },
});

type RootStackParamList = StaticParamList<typeof RootStack>;

declare global {
  // eslint-disable-next-line @typescript-eslint/no-namespace
  namespace ReactNavigation {
    // eslint-disable-next-line @typescript-eslint/no-empty-object-type
    interface RootParamList extends RootStackParamList {}
  }
}

const StaticNavigation = createStaticNavigation(RootStack);

export function Navigation({ theme }: { theme: Theme }): React.JSX.Element {
  // AppSplashGate ensures auth is resolved before Navigation mounts,
  // so we can use the user object directly to pick the correct initial route
  // and avoid the Auth→Main flash on cold start.
  const user = useAppSelector(selectUser);

  return (
    <StaticNavigation
      ref={navigationRef}
      theme={theme}
      initialState={{
        index: 0,
        routes: [{ name: user !== null ? 'Main' : 'Auth' }],
      }}
      linking={{
        prefixes: ['lowca://', process.env.EXPO_PUBLIC_WEB_URL ?? ''],
      }}
    />
  );
}
