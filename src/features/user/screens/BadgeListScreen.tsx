import Header from '@components/Header';
import { Ionicons } from '@expo/vector-icons';
import { useBadges } from '@features/user/hooks/profile/useBadges';
import type { UserBadge } from '@features/user/types/badge';
import { useNavigation } from '@react-navigation/native';
import type { JSX } from 'react';
import { useTranslation } from 'react-i18next';
import {
  ActivityIndicator,
  Alert,
  FlatList,
  Image,
  RefreshControl,
  Text,
  TouchableOpacity,
  View,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

interface BadgeItemProps {
  item: UserBadge;
  isSelecting: boolean;
  onSelect: (badgeId: number) => void;
  onClear: () => void;
}

const BadgeItem = ({
  item,
  isSelecting,
  onSelect,
  onClear,
}: BadgeItemProps): JSX.Element => {
  const { t } = useTranslation();

  const handlePress = (): void => {
    if (item.isSelected) {
      Alert.alert(t('badge.deselect_title'), t('badge.deselect_confirm'), [
        { text: t('common.cancel'), style: 'cancel' },
        {
          text: t('badge.deselect'),
          style: 'destructive',
          onPress: onClear,
        },
      ]);
    } else {
      onSelect(item.badgeId);
    }
  };

  return (
    <TouchableOpacity
      activeOpacity={0.75}
      onPress={handlePress}
      disabled={isSelecting}
      className={`mx-4 mb-3 flex-row items-center rounded-2xl border p-4 ${
        item.isSelected
          ? 'border-primary bg-primary/5'
          : 'border-gray-200 bg-white'
      }`}
    >
      <Image
        source={{ uri: item.iconUrl }}
        className="mr-4 h-16 w-16 rounded-full"
      />

      <View className="flex-1">
        <Text className="text-base font-bold text-gray-900">
          {item.badgeName}
        </Text>
        <Text className="mt-0.5 text-sm text-gray-500">{item.description}</Text>
        {item.earnedAt && (
          <Text className="mt-1 text-xs text-gray-400">
            {t('badge.earned_on', {
              date: new Date(item.earnedAt).toLocaleDateString(),
            })}
          </Text>
        )}
      </View>

      {item.isSelected && (
        <View className="ml-2 flex-row items-center gap-1 rounded-full bg-primary px-2 py-1">
          <Ionicons name="checkmark" size={12} color="white" />
          <Text className="text-xs font-semibold text-white">
            {t('badge.displaying')}
          </Text>
        </View>
      )}
    </TouchableOpacity>
  );
};

export const BadgeListScreen = (): JSX.Element => {
  const { t } = useTranslation();
  const navigation = useNavigation();
  const {
    badges,
    isLoading,
    isError,
    refetch,
    selectBadge,
    clearSelectedBadge,
    isSelecting,
  } = useBadges();

  return (
    <SafeAreaView className="flex-1 bg-gray-50" edges={['left', 'right']}>
      <Header
        title={t('badge.title')}
        onBackPress={() => navigation.goBack()}
      />

      {isLoading ? (
        <View className="flex-1 items-center justify-center">
          <ActivityIndicator size="large" color="#9FD356" />
        </View>
      ) : isError ? (
        <View className="flex-1 items-center justify-center px-8">
          <Text className="text-center text-base text-gray-500">
            {t('badge.load_error')}
          </Text>
        </View>
      ) : (
        <FlatList
          data={badges}
          keyExtractor={(item) => String(item.badgeId)}
          renderItem={({ item }) => (
            <BadgeItem
              item={item}
              isSelecting={isSelecting}
              onSelect={selectBadge}
              onClear={clearSelectedBadge}
            />
          )}
          ListHeaderComponent={
            <View className="px-4 py-4">
              <Text className="text-sm text-gray-500">
                {t('badge.tap_to_display')}
              </Text>
            </View>
          }
          ListEmptyComponent={
            <View className="flex-1 items-center justify-center py-16">
              <Text className="text-4xl">🏅</Text>
              <Text className="mt-4 text-base font-semibold text-gray-700">
                {t('badge.empty_title')}
              </Text>
              <Text className="mt-1 text-sm text-gray-500">
                {t('badge.empty_hint')}
              </Text>
            </View>
          }
          refreshControl={
            <RefreshControl
              refreshing={isLoading}
              onRefresh={refetch}
              tintColor="#9FD356"
            />
          }
          contentContainerStyle={{ paddingBottom: 24 }}
        />
      )}
    </SafeAreaView>
  );
};
