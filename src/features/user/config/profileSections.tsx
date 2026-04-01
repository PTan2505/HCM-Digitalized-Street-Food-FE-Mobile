import { User } from '@custom-types/user';
import { TFunction } from 'i18next';
import { Alert } from 'react-native';
import { ProfileSection } from '../types/profileConfig';

interface Navigation {
  navigate: (screen: string) => void;
}

export const getProfileSections = (
  t: TFunction,
  navigation: Navigation,
  onLogout: () => void,
  user: User | null,
  currentLanguage: string,
  onChangeLanguage: (lng: string) => Promise<void>
): ProfileSection[] => {
  return [
    // Header section - rendered separately in ProfileScreen
    {
      id: 'header',
      type: 'header',
      visible: true,
    },

    // Action Cards Row
    {
      id: 'action-cards',
      type: 'action-cards',
      actionCards: [
        {
          id: 'balance',
          icon: 'wallet-outline',
          title: t('profile.my_balance'),
          subtitle: `${(user?.moneyBalance ?? 0).toLocaleString('vn-VN')} đ`,
          backgroundColor: '#FFF9E6',
          onPress: (): void => {
            // Navigate to balance screen
          },
        },
        {
          id: 'cart-tracking',
          icon: 'cart-outline',
          title: t('cart.title'),
          subtitle: t('profile.view_history'),
          backgroundColor: '#E8F5E9',
          onPress: (): void => navigation.navigate('PersonalCart'),
        },
      ],
      containerClassName: 'px-4 mb-4',
      visible: true,
    },

    // Tabs Section
    {
      id: 'tabs',
      type: 'tabs',
      tabs: [
        { id: 'main', title: t('profile.main_menu') },
        { id: 'activity', title: t('profile.activity') },
      ],
      containerClassName: 'px-4 mb-4',
      visible: false, // Set to true when implementing tabs functionality
    },

    // Payment Cards Section
    {
      id: 'payment-cards',
      type: 'payment-cards',
      title: t('profile.payment_methods'),
      containerClassName: 'mb-4',
      visible: false, // Set to true when implementing payment methods
    },

    // Feature Buttons Section
    {
      id: 'feature-buttons',
      type: 'feature-buttons',
      items: [
        {
          id: 'order-history',
          icon: 'bag-handle-outline',
          title: t('order.my_orders'),
          onPress: (): void => navigation.navigate('OrderHistory'),
          color: '#9FD356',
        },

        {
          id: 'ghost-pins',
          icon: 'location-outline',
          title: t('profile.my_ghost_pins'),
          onPress: (): void => navigation.navigate('MyGhostPins'),
          color: '#FF6B6B',
        },
      ],
      containerClassName: 'px-4 mb-6',
      visible: true,
    },

    // Benefits & Savings Section
    {
      id: 'benefits',
      type: 'list-items',
      title: t('profile.benefits_savings'),
      items: [
        {
          id: 'points-detail',
          icon: 'star',
          title: t('profile.my_points'),
          rightText: `${user?.point ?? 0}`,
          onPress: (): void => {
            // Navigate to points detail
          },
        },
        {
          id: 'vouchers',
          icon: 'ticket-outline',
          title: t('profile.voucher_wallet'),
          badgeColor: '#FF6B6B',
          rightIcon: 'chevron-forward',
          onPress: (): void => {
            navigation.navigate('VoucherWallet');
          },
        },
        {
          id: 'rewards',
          icon: 'gift-outline',
          title: t('profile.rewards'),
          badge: t('profile.new'),
          badgeColor: '#FF6B6B',
          onPress: (): void => {
            // Navigate to rewards
          },
        },
        {
          id: 'challenges',
          icon: 'trophy-outline',
          title: t('profile.challenges'),
          rightIcon: 'chevron-forward',
          onPress: (): void => {
            navigation.navigate('QuestList');
          },
        },
      ],
      containerClassName: 'mb-6',
      titleClassName: 'px-4 mb-3 text-base font-bold text-gray-900',
      visible: true,
    },

    // Account Settings Section
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
          onPress: (): void => navigation.navigate('SetupUserInfo'),
        },
        {
          id: 'dietary',
          icon: 'nutrition-outline',
          title: t('profile.dietary_preferences'),
          rightIcon: 'chevron-forward',
          onPress: (): void => navigation.navigate('DietaryPreferences'),
        },
        {
          id: 'notifications',
          icon: 'notifications-outline',
          title: t('profile.notifications'),
          rightIcon: 'chevron-forward',
          onPress: (): void => {
            // Navigate to notifications settings
          },
        },
        {
          id: 'language',
          icon: 'language-outline',
          title: t('profile.language'),
          rightText: currentLanguage === 'en' ? 'English' : 'Tiếng Việt',
          rightIcon: 'chevron-forward',
          onPress: (): void => {
            Alert.alert(t('profile.language'), t('profile.select_language'), [
              {
                text: '🇻🇳 Tiếng Việt',
                onPress: (): void => void onChangeLanguage('vi'),
              },
              {
                text: '🇬🇧 English',
                onPress: (): void => void onChangeLanguage('en'),
              },
              { text: t('common.cancel'), style: 'cancel' },
            ]);
          },
        },
      ],
      containerClassName: 'mb-6',
      titleClassName: 'px-4 mb-3 text-base font-bold text-gray-900',
      visible: true,
    },

    // Help & Support Section
    {
      id: 'support',
      type: 'list-items',
      title: t('profile.help_support'),
      items: [
        {
          id: 'help-center',
          icon: 'help-circle-outline',
          title: t('profile.help_center'),
          rightIcon: 'chevron-forward',
          onPress: (): void => {
            // Navigate to help center
          },
        },
        {
          id: 'contact',
          icon: 'chatbubble-outline',
          title: t('profile.contact_support'),
          rightIcon: 'chevron-forward',
          onPress: (): void => {
            // Navigate to contact support
          },
        },
        {
          id: 'terms',
          icon: 'document-text-outline',
          title: t('profile.terms_conditions'),
          rightIcon: 'chevron-forward',
          onPress: (): void => {
            // Navigate to terms
          },
        },
        {
          id: 'privacy',
          icon: 'shield-checkmark-outline',
          title: t('profile.privacy_policy'),
          rightIcon: 'chevron-forward',
          onPress: (): void => {
            // Navigate to privacy policy
          },
        },
      ],
      containerClassName: 'mb-6',
      titleClassName: 'px-4 mb-3 text-base font-bold text-gray-900',
      visible: true,
    },

    // Logout Section
    {
      id: 'logout',
      type: 'list-items',
      items: [
        {
          id: 'logout-btn',
          icon: 'log-out-outline',
          title: t('profile.logout'),
          color: '#FF6B6B',
          onPress: onLogout,
        },
      ],
      containerClassName: 'mb-8',
      visible: true,
    },
  ];
};
