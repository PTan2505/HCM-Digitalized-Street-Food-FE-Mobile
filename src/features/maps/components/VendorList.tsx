import MOCK_VENDORS from '@features/maps/constants/mockData';
import React, { forwardRef, JSX } from 'react';
import { Dimensions, FlatList, Text, View, ViewToken } from 'react-native';

const { width } = Dimensions.get('window');
export const CARD_WIDTH = width * 0.8;
export const CARD_SPACING = 10;

interface VendorListProps {
  selectedVendorId: string | null;
  onViewableItemsChanged: (info: { viewableItems: ViewToken[] }) => void;
  viewabilityConfig: {
    itemVisiblePercentThreshold: number;
  };
}

export const VendorList = forwardRef<FlatList, VendorListProps>(
  ({ onViewableItemsChanged, viewabilityConfig }, ref) => {
    const renderVendorCard = ({
      item,
    }: {
      item: (typeof MOCK_VENDORS)[0];
    }): JSX.Element => (
      <View
        className="mx-[5px] rounded-xl bg-white p-4 shadow-lg"
        style={{ width: CARD_WIDTH }}
      >
        <Text className="mb-2 text-lg font-bold text-[#333]">{item.name}</Text>
        <Text className="mb-1 text-sm text-[#666]">{item.addressDetail}</Text>
        <Text className="mb-3 text-xs text-[#999]">
          {item.ward}, {item.city}
        </Text>
        <View className="flex-row items-center justify-between">
          <Text className="text-sm font-semibold text-[#a1d973]">
            ⭐ {item.avgRating}
          </Text>
          <Text className="text-xs text-[#666]">{item.phoneNumber}</Text>
        </View>
      </View>
    );

    return (
      <View className="absolute bottom-0 left-0 right-0 py-2.5">
        <FlatList
          ref={ref}
          data={MOCK_VENDORS}
          renderItem={renderVendorCard}
          keyExtractor={(item) => item.vendorId}
          horizontal
          snapToInterval={CARD_WIDTH + CARD_SPACING}
          decelerationRate="fast"
          showsHorizontalScrollIndicator={false}
          contentContainerStyle={{
            paddingHorizontal: (width - CARD_WIDTH) / 2,
          }}
          onViewableItemsChanged={onViewableItemsChanged}
          viewabilityConfig={viewabilityConfig}
          onScrollToIndexFailed={(info) => {
            const wait = new Promise((resolve) => setTimeout(resolve, 500));
            wait.then(() => {
              if (ref && typeof ref !== 'function' && ref.current) {
                ref.current?.scrollToIndex({
                  index: info.index,
                  animated: true,
                });
              }
            });
          }}
        />
      </View>
    );
  }
);

VendorList.displayName = 'VendorList';
