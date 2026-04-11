import { MaterialIcons } from '@expo/vector-icons';
import type { MapVendor } from '@features/home/types/stall';
import React, { forwardRef, JSX } from 'react';
import {
  Dimensions,
  FlatList,
  Image,
  ScrollView,
  Text,
  TouchableOpacity,
  View,
  ViewToken,
} from 'react-native';

const { width } = Dimensions.get('window');
export const CARD_WIDTH = width * 0.9;
export const CARD_SPACING = 16;

interface VendorListProps {
  vendors: MapVendor[];
  selectedVendorId: string | null;
  onViewableItemsChanged: (info: { viewableItems: ViewToken[] }) => void;
  viewabilityConfig: {
    itemVisiblePercentThreshold: number;
  };
}

export const VendorList = forwardRef<FlatList, VendorListProps>(
  ({ vendors, onViewableItemsChanged, viewabilityConfig }, ref) => {
    const renderVendorCard = ({ item }: { item: MapVendor }): JSX.Element => {
      const images = [
        item.imageUrl,
        item.imageUrl,
        item.imageUrl,
        item.imageUrl,
      ];

      return (
        <View
          className="mx-2 overflow-hidden rounded-2xl bg-white shadow-lg"
          style={{ width: CARD_WIDTH }}
        >
          <View className="relative h-48 w-full bg-gray-200">
            <Image
              source={{ uri: item.imageUrl }}
              className="h-full w-full"
              resizeMode="cover"
            />
            <TouchableOpacity className="absolute right-3 top-3 rounded-full bg-white p-2 shadow-md">
              <MaterialIcons name="bookmark-border" size={22} color="#FF6B35" />
            </TouchableOpacity>
          </View>

          <View className="px-3 py-2">
            <ScrollView
              horizontal
              showsHorizontalScrollIndicator={false}
              contentContainerStyle={{ gap: 8 }}
            >
              {images.map((imgUrl, index) => (
                <TouchableOpacity key={index}>
                  <Image
                    source={{ uri: imgUrl }}
                    className="h-16 w-16 rounded-lg"
                    resizeMode="cover"
                  />
                </TouchableOpacity>
              ))}
            </ScrollView>
          </View>

          <View className="px-3 pb-3">
            <Text
              className="mb-1 text-lg font-bold text-[#333]"
              numberOfLines={1}
            >
              {item.name}
            </Text>

            <View className="mb-2 flex-row items-center">
              <MaterialIcons name="star" size={18} color="#FFB800" />
              <Text className="ml-1 text-base font-semibold text-[#333]">
                {item.avgRating.toFixed(1)}
              </Text>
              <Text className="mx-2 text-[#999]">•</Text>
              <Text className="text-base text-[#999]">{item.ward}</Text>
            </View>

            <View className="flex-row flex-wrap gap-2">
              <View className="rounded-full bg-[#E8F5E9] px-3 py-1">
                <Text className="text-sm font-medium text-[#00B14F]">
                  Món Việt
                </Text>
              </View>
              {!item.isVerified && (
                <View className="rounded-full bg-[#FEF3C7] px-3 py-1">
                  <Text className="text-sm font-medium text-[#92400E]">
                    Chưa xác minh
                  </Text>
                </View>
              )}
            </View>
          </View>
        </View>
      );
    };

    return (
      <View className="absolute bottom-0 left-0 right-0 bg-transparent pb-4 pt-2">
        <FlatList
          ref={ref}
          data={vendors}
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
