import Header from '@components/Header';
import { Ionicons } from '@expo/vector-icons';
import SearchResultCard from '@features/home/components/common/SearchResultCard';
import { useFavoriteBranches } from '@features/home/hooks/useFavoriteBranches';
import { useFocusEffect, useNavigation } from '@react-navigation/native';
import { NativeStackNavigationProp } from '@react-navigation/native-stack';
import type { JSX } from 'react';
import { useCallback } from 'react';
import { useTranslation } from 'react-i18next';
import { FlatList, Text, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

export const FavoritesScreen = (): JSX.Element => {
  const { t } = useTranslation();
  const navigation =
    useNavigation<NativeStackNavigationProp<ReactNavigation.RootParamList>>();
  const { favoriteBranches, reload } = useFavoriteBranches();

  useFocusEffect(
    useCallback(() => {
      reload();
    }, [reload])
  );

  return (
    <SafeAreaView edges={['left', 'right']} className="flex-1 bg-white">
      <Header
        title={t('favorites.title')}
        onBackPress={() => navigation.goBack()}
      />

      <FlatList
        data={favoriteBranches}
        keyExtractor={(item) => String(item.branch.branchId)}
        showsVerticalScrollIndicator={false}
        contentContainerStyle={{
          paddingHorizontal: 16,
          paddingTop: 12,
          paddingBottom: 100,
        }}
        renderItem={({ item }) => (
          <SearchResultCard
            branch={item.branch}
            displayName={item.displayName}
            imageUri={item.imageUri}
            onPress={() =>
              navigation.navigate('RestaurantDetails', {
                branch: item.branch,
                displayName: item.displayName,
              })
            }
          />
        )}
        ListEmptyComponent={
          <View className="items-center px-6 py-16">
            <Ionicons name="heart-outline" size={56} color="#D1D5DB" />
            <Text className="mt-4 text-center text-base font-semibold text-gray-400">
              {t('favorites.empty_title')}
            </Text>
            <Text className="mt-1 text-center text-sm text-gray-400">
              {t('favorites.empty_hint')}
            </Text>
          </View>
        }
      />
    </SafeAreaView>
  );
};
