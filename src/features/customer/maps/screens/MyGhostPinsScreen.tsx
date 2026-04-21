import Header from '@components/Header';
import { COLORS } from '@constants/colors';
import { Ionicons } from '@expo/vector-icons';
import type { MyGhostPinBranch } from '@features/customer/home/types/branch';
import { axiosApi } from '@lib/api/apiInstance';
import { useNavigation } from '@react-navigation/native';
import type { JSX } from 'react';
import { useCallback, useEffect, useState } from 'react';
import { useTranslation } from 'react-i18next';
import {
  ActivityIndicator,
  FlatList,
  RefreshControl,
  Text,
  TouchableOpacity,
  View,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

const STATUS_LABEL: Record<
  string,
  { label: string; color: string; bg: string }
> = {
  Pending: { label: 'Chờ duyệt', color: '#D97706', bg: '#FEF3C7' },
  Accept: { label: 'Đã duyệt', color: '#16A34A', bg: '#DCFCE7' },
  Reject: { label: 'Từ chối', color: '#DC2626', bg: '#FEE2E2' },
};

const GhostPinCard = ({ item }: { item: MyGhostPinBranch }): JSX.Element => {
  const status = STATUS_LABEL[item.licenseStatus] ?? STATUS_LABEL['Pending'];
  return (
    <View className="mb-3 overflow-hidden rounded-2xl border border-gray-100 bg-white p-4 shadow-sm">
      {/* Name + status badge */}
      <View className="mb-2 flex-row items-start justify-between gap-2">
        <Text
          className="flex-1 text-lg font-bold text-gray-800"
          numberOfLines={2}
        >
          {item.name}
        </Text>
        <View
          className="rounded-full px-2.5 py-1"
          style={{ backgroundColor: status.bg }}
        >
          <Text
            className="text-sm font-semibold"
            style={{ color: status.color }}
          >
            {status.label}
          </Text>
        </View>
      </View>

      {/* Address */}
      <View className="mb-3 flex-row items-start gap-1.5">
        <Ionicons
          name="location-outline"
          size={14}
          color="#9CA3AF"
          style={{ marginTop: 2 }}
        />
        <Text className="flex-1 text-base text-gray-500" numberOfLines={2}>
          {item.addressDetail}
          {item.ward ? `, ${item.ward}` : ''}
          {item.city ? `, ${item.city}` : ''}
        </Text>
      </View>

      {/* Stats row */}
      <View className="flex-row gap-4">
        <View className="flex-row items-center gap-1">
          <Ionicons name="star" size={13} color="#F59E0B" />
          <Text className="text-sm text-gray-600">
            {item.avgRating > 0 ? item.avgRating.toFixed(1) : '–'}
          </Text>
        </View>
        <View className="flex-row items-center gap-1">
          <Ionicons name="chatbubble-outline" size={13} color="#9CA3AF" />
          <Text className="text-sm text-gray-600">
            {item.totalReviewCount} đánh giá
          </Text>
        </View>
        {item.isVerified && (
          <View className="flex-row items-center gap-1">
            <Ionicons name="checkmark-circle" size={13} color="#16A34A" />
            <Text className="text-sm text-green-700">Đã xác minh</Text>
          </View>
        )}
      </View>

      {/* Reject reason */}
      {item.licenseStatus === 'Reject' && item.licenseRejectReason && (
        <View className="mt-3 rounded-xl bg-red-50 px-3 py-2">
          <Text className="text-sm text-red-600">
            Lý do từ chối: {item.licenseRejectReason}
          </Text>
        </View>
      )}

      {/* Created date */}
      <Text className="mt-3 text-sm text-gray-400">
        Đã tạo: {new Date(item.createdAt).toLocaleDateString('vi-VN')}
      </Text>
    </View>
  );
};

export const MyGhostPinsScreen = (): JSX.Element => {
  const navigation = useNavigation();
  const { t } = useTranslation();
  const [branches, setBranches] = useState<MyGhostPinBranch[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isRefreshing, setIsRefreshing] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const load = useCallback(async (refresh = false): Promise<void> => {
    if (refresh) setIsRefreshing(true);
    else setIsLoading(true);
    setError(null);
    try {
      const data = await axiosApi.branchApi.getMyGhostPins();
      setBranches(data.items ?? []);
    } catch {
      setError('Không thể tải danh sách. Vui lòng thử lại.');
    } finally {
      setIsLoading(false);
      setIsRefreshing(false);
    }
  }, []);

  useEffect(() => {
    void load();
  }, [load]);

  return (
    <SafeAreaView edges={['bottom']} className="flex-1 bg-gray-50">
      {/* Header */}
      <Header
        title={t('my_ghost_pins.title')}
        onBackPress={() => navigation.goBack()}
        secondaryAction={{
          label: t('my_ghost_pins.add_action'),
          onPress: () => navigation.navigate('GhostPinCreation'),
        }}
      />

      {isLoading ? (
        <View className="flex-1 items-center justify-center">
          <ActivityIndicator size="large" color={COLORS.primary} />
        </View>
      ) : error ? (
        <View className="flex-1 items-center justify-center px-8">
          <Ionicons name="cloud-offline-outline" size={48} color="#D1D5DB" />
          <Text className="mt-3 text-center text-base text-gray-500">
            {error}
          </Text>
          <TouchableOpacity
            onPress={() => void load()}
            className="mt-4 rounded-xl bg-primary px-6 py-3"
          >
            <Text className="font-semibold text-white">Thử lại</Text>
          </TouchableOpacity>
        </View>
      ) : (
        <FlatList
          data={branches}
          keyExtractor={(item) => String(item.branchId)}
          renderItem={({ item }) => <GhostPinCard item={item} />}
          contentContainerStyle={{
            padding: 16,
            flexGrow: 1,
          }}
          refreshControl={
            <RefreshControl
              refreshing={isRefreshing}
              onRefresh={() => void load(true)}
              tintColor={COLORS.primary}
            />
          }
          ListEmptyComponent={
            <View className="flex-1 items-center justify-center py-20">
              <Ionicons name="pin-outline" size={56} color="#D1D5DB" />
              <Text className="mt-4 text-base font-semibold text-gray-400">
                Chưa có quán nào
              </Text>
              <Text className="mt-1 text-center text-base text-gray-400">
                Thêm quán ăn mới để giúp cộng đồng khám phá
              </Text>
              <TouchableOpacity
                onPress={() => navigation.navigate('GhostPinCreation')}
                className="mt-5 rounded-xl bg-primary px-6 py-3"
              >
                <Text className="font-semibold text-white">Thêm quán mới</Text>
              </TouchableOpacity>
            </View>
          }
        />
      )}
    </SafeAreaView>
  );
};
