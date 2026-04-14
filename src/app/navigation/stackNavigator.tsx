import { HomeBottomTabs } from '@app/navigation/bottomTabNavigator';
import { DirectCheckoutScreen } from '@features/direct-ordering/screens/DirectCheckoutScreen';
import { MyCartsScreen } from '@features/direct-ordering/screens/MyCartsScreen';
import { OrderHistoryScreen } from '@features/direct-ordering/screens/OrderHistoryScreen';
import { OrderStatusScreen } from '@features/direct-ordering/screens/OrderStatusScreen';
import { PaymentQRScreen } from '@features/direct-ordering/screens/PaymentQRScreen';
import { PersonalCartScreen } from '@features/direct-ordering/screens/PersonalCartScreen';
import type { UserVoucherApiDto } from '@features/campaigns/api/voucherApi';
import type { Voucher } from '@slices/campaigns';
import { VoucherSelectScreen } from '@features/direct-ordering/screens/VoucherSelectScreen';
import { CurrentPickDetailsScreen } from '@features/home/screens/CurrentPickDetailsScreen';
import { FavoritesScreen } from '@features/home/screens/FavoritesScreen';
import { CurrentPicksScreen } from '@features/home/screens/CurrentPicksScreen';
import type { VoucherChip } from '@features/home/components/common/PlaceCard';
import { ListBranchScreen } from '@features/home/screens/ListBranchScreen';
import { RestaurantDetailsScreen } from '@features/home/screens/RestaurantDetailsScreen';
import { RestaurantSwipeScreen } from '@features/home/screens/RestaurantSwipeScreen';
import { RestaurantDeepLinkScreen } from '@features/home/screens/RestaurantDeepLinkScreen';
import { ReviewListScreen } from '@features/home/screens/ReviewListScreen';
import { SearchScreen } from '@features/home/screens/SearchScreen';
import { GhostPinCreationScreen } from '@features/maps/screens/GhostPinCreationScreen';
import { LocationPickerScreen } from '@features/maps/screens/LocationPickerScreen';
import { MapScreen } from '@features/maps/screens/MapScreen';
import { MyGhostPinsScreen } from '@features/maps/screens/MyGhostPinsScreen';
import { NotificationScreen } from '@features/notifications/screens/NotificationScreen';
import { useAppSelector } from '@hooks/reduxHooks';
import {
  createStaticNavigation,
  StaticParamList,
  Theme,
} from '@react-navigation/native';
import { navigationRef } from '@utils/navigationRef';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import { selectUser } from '@slices/auth';

import { CampaignListScreen } from '@features/campaigns/screens/CampaignListScreen';
import { RestaurantCampaignDetailScreen } from '@features/campaigns/screens/RestaurantCampaignDetailScreen';
import { SystemCampaignDetailScreen } from '@features/campaigns/screens/SystemCampaignDetailScreen';
import { VoucherHistoryScreen } from '@features/campaigns/screens/VoucherHistoryScreen';
import { VoucherApplicableBranchesScreen } from '@features/campaigns/screens/VoucherApplicableBranchesScreen';
import { VoucherMarketplaceScreen } from '@features/campaigns/screens/VoucherMarketplaceScreen';
import { VoucherWalletScreen } from '@features/campaigns/screens/VoucherWalletScreen';
import { AuthScreen } from '@features/auth/screens/AuthScreen';
// import ProfileScreen from '@features/user/screens/ProfileScreen';
import type { TabType } from '@features/home/screens/RestaurantDetailsScreen';
import type { ActiveBranch, Dish } from '@features/home/types/branch';
import { QuestDetailScreen } from '@features/quests/screens/QuestDetailScreen';
import { QuestListScreen } from '@features/quests/screens/QuestListScreen';
import { DietaryPreferencesScreen } from '@features/user/screens/DietaryPreferencesScreen';
import { EditUserInfoScreen } from '@features/user/screens/EditUserProfileScreen';
import { ProfileScreen } from '@features/user/screens/ProfileScreen';
import { WithdrawScreen } from '@features/user/screens/WithdrawScreen';

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
    ReviewList: {
      screen: ReviewListScreen,
      params: {} as {
        branchId: number;
        displayName: string;
        ownFeedbackId?: number;
        dishes: Dish[];
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
