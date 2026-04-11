import { TFunction } from 'i18next';

export interface HomeQuickAction {
  id: string;
  ionIcon: string;
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
    ionIcon: 'location',
    label: t('home_quick_actions.ghost_pin'),
    onPress: (): void => navigation.navigate('GhostPinCreation'),
  },
  {
    id: 'quest',
    ionIcon: 'trophy',
    label: t('home_quick_actions.quest'),
    onPress: (): void => navigation.navigate('QuestList'),
  },
  {
    id: 'voucher-market',
    ionIcon: 'storefront',
    label: t('home_quick_actions.voucher_market'),
    onPress: (): void => navigation.navigate('VoucherMarketplace'),
  },
  {
    id: 'favorites',
    ionIcon: 'heart',
    label: t('home_quick_actions.favorites'),
    onPress: (): void => navigation.navigate('Favorites'),
  },
];
