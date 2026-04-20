import { Ionicons } from '@expo/vector-icons';
import type { JSX } from 'react';
import { useTranslation } from 'react-i18next';
import { Text, View } from 'react-native';

const SwipeUpPrompt = (): JSX.Element => {
  const { t } = useTranslation();

  return (
    <View className="items-center py-4">
      <View className="flex-row items-center gap-2 rounded-3xl bg-white px-10 py-2 shadow-sm">
        <View className="h-6 w-6 items-center justify-center rounded-full bg-[#4FBE71]">
          <Ionicons name="arrow-up" size={16} color="#FFF" />
        </View>
        <Text className="text-base font-semibold text-black">
          <Text className="text-[#4FBE71]">{t('actions.swipe_up')}</Text>{' '}
          {t('actions.to_see_similar')}
        </Text>
      </View>
    </View>
  );
};

export default SwipeUpPrompt;
