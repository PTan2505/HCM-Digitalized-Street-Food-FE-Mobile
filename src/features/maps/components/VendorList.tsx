import { MaterialIcons } from '@expo/vector-icons';
import MOCK_VENDORS from '@features/maps/constants/mockData';
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
    }): JSX.Element => {
      // Mock multiple images (in real app, this would come from item.images)
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
          {/* Main Thumbnail Image */}
          <View className="relative h-48 w-full bg-gray-200">
            <Image
              source={{ uri: item.imageUrl }}
              className="h-full w-full"
              resizeMode="cover"
            />
            {/* Bookmark Button on Image */}
            <TouchableOpacity className="absolute right-3 top-3 rounded-full bg-white p-2 shadow-md">
              <MaterialIcons name="bookmark-border" size={22} color="#FF6B35" />
            </TouchableOpacity>
          </View>

          {/* Small Image Gallery */}
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

          {/* Vendor Info */}
          <View className="px-3 pb-3">
            <Text
              className="mb-1 text-lg font-bold text-[#333]"
              numberOfLines={1}
            >
              {item.name}
            </Text>

            <View className="mb-2 flex-row items-center">
              <MaterialIcons name="star" size={18} color="#FFB800" />
              <Text className="ml-1 text-sm font-semibold text-[#333]">
                {item.avgRating}
              </Text>
              <Text className="mx-2 text-[#999]">•</Text>
              <Text className="text-sm text-[#999]">{item.ward}</Text>
            </View>

            <View className="mb-2 flex-row items-center">
              <MaterialIcons name="local-offer" size={16} color="#00B14F" />
              <Text className="ml-1 text-sm font-semibold text-[#00B14F]">
                Từ 150k đến 200k
              </Text>
            </View>

            <View className="flex-row flex-wrap gap-2">
              <View className="rounded-full bg-[#E8F5E9] px-3 py-1">
                <Text className="text-xs font-medium text-[#00B14F]">
                  Món Việt
                </Text>
              </View>
              <View className="rounded-full bg-[#FFF3E0] px-3 py-1">
                <Text className="text-xs font-medium text-[#FF6B35]">
                  Phổ biến
                </Text>
              </View>
            </View>
          </View>
        </View>
      );
    };

    return (
      <View className="absolute bottom-0 left-0 right-0 bg-transparent pb-4 pt-2">
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
