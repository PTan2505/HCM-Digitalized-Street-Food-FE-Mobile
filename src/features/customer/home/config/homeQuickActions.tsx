import Heart from '@assets/quickActions/heart.png';
import Map from '@assets/quickActions/map.png';
import Quest from '@assets/quickActions/quest.png';
import Shop from '@assets/quickActions/store.png';
import { TFunction } from 'i18next';

export interface HomeQuickAction {
  id: string;
  icon: number;
  label: string;
  onPress: () => void;
}

interface Navigation {
  navigate: (screen: string) => void;
}

export const getHomeQuickActions = (
  t: TFunction,
  navigation: Navigation
): HomeQuickAction[] => [
  {
    id: 'ghost-pin',
    icon: Map,
    label: t('home_quick_actions.ghost_pin'),
    onPress: (): void => navigation.navigate('GhostPinCreation'),
  },
  {
    id: 'quest',
    icon: Quest,
    label: t('home_quick_actions.quest'),
    onPress: (): void => navigation.navigate('QuestList'),
  },
  {
    id: 'voucher-market',
    icon: Shop,
    label: t('home_quick_actions.voucher_market'),
    onPress: (): void => navigation.navigate('VoucherMarketplace'),
  },
  {
    id: 'favorites',
    icon: Heart,
    label: t('home_quick_actions.favorites'),
    onPress: (): void => navigation.navigate('Favorites'),
  },
];
