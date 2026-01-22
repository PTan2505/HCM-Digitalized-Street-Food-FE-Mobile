import React, { useState } from 'react';
import {
  View,
  Text,
  Image,
  TouchableOpacity,
  StatusBar,
  ScrollView,
} from 'react-native';
import type { JSX } from 'react';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import SortModal from '@features/home/components/SortModal';

interface Location {
  id: string;
  name: string;
  rating: number;
  distance: string;
  priceRange: string;
  tag: string;
  image: any;
  likes: number;
  comments: number;
  isTopPick?: boolean;
}

const CurrentPickDetailsScreen = (): JSX.Element => {
  const [sortBy, setSortBy] = useState('distance');
  const [showSortModal, setShowSortModal] = useState(false);

  const locations: Location[] = [
    {
      id: '1',
      name: 'Bánh mì Huỳnh Hoa',
      rating: 4.5,
      distance: '0.8 km',
      priceRange: 'Từ 150k đến 200k',
      tag: 'Món Việt',
      image: {
        uri: 'https://images.unsplash.com/photo-1626700051175-6818013e1d4f?w=400',
      },
      likes: 2,
      comments: 0,
      isTopPick: true,
    },
    {
      id: '2',
      name: 'Quán Gà Ta Muối',
      rating: 4.5,
      distance: '0.8 km',
      priceRange: 'Từ 150k đến 200k',
      tag: 'Món Việt',
      image: {
        uri: 'https://images.unsplash.com/photo-1598103442097-8b74394b95c6?w=400',
      },
      likes: 2,
      comments: 1,
    },
    {
      id: '3',
      name: 'The Gangs Mac Đĩnh Chi',
      rating: 4.5,
      distance: '0.8 km',
      priceRange: 'Từ 200k đến 500k',
      tag: 'Đi tập nhóm bè',
      image: {
        uri: 'https://images.unsplash.com/photo-1517248135467-4c7edcad34c4?w=400',
      },
      likes: 2,
      comments: 1,
      isTopPick: true,
    },
    {
      id: '4',
      name: 'The Gangs Mac Đĩnh Chi',
      rating: 4.5,
      distance: '0.8 km',
      priceRange: 'Từ 200k đến 500k',
      tag: 'Đi tập nhóm bè',
      image: {
        uri: 'https://images.unsplash.com/photo-1517248135467-4c7edcad34c4?w=400',
      },
      likes: 2,
      comments: 1,
    },
    {
      id: '5',
      name: 'The Gangs Mac Đĩnh Chi',
      rating: 4.5,
      distance: '0.8 km',
      priceRange: 'Từ 200k đến 500k',
      tag: 'Đi tập nhóm bè',
      image: {
        uri: 'https://images.unsplash.com/photo-1517248135467-4c7edcad34c4?w=400',
      },
      likes: 2,
      comments: 1,
    },
    {
      id: '6',
      name: 'The Gangs Mac Đĩnh Chi',
      rating: 4.5,
      distance: '0.8 km',
      priceRange: 'Từ 200k đến 500k',
      tag: 'Đi tập nhóm bè',
      image: {
        uri: 'https://images.unsplash.com/photo-1517248135467-4c7edcad34c4?w=400',
      },
      likes: 2,
      comments: 1,
    },
  ];

  return (
    <SafeAreaView className="flex-1 bg-white" edges={['top', 'left', 'right']}>
      <StatusBar barStyle="dark-content" />

      {/* Header */}
      <View className="flex-row items-center justify-between px-4 py-3">
        <TouchableOpacity className="p-1">
          <Ionicons name="chevron-back" size={28} color="#000" />
        </TouchableOpacity>
        <TouchableOpacity className="p-1">
          <Ionicons name="ellipsis-horizontal" size={28} color="#000" />
        </TouchableOpacity>
      </View>

      {/* Title Section */}
      <View
        className="px-4 pt-2"
        style={{
          shadowColor: '#CAC4C4',
          shadowOffset: { width: 0, height: 2 },
          shadowOpacity: 0.25,
          shadowRadius: 3.84,
          elevation: 5,
        }}
      >
        <Text className="mb-2 text-[20px] font-semibold leading-[22px] text-black">
          Current Picks #1
        </Text>
        <Text className="mb-2 text-sm text-gray-400">3 địa điểm</Text>

        <View className="mb-3 flex-row items-center justify-between">
          <Text className="mr-2 text-sm font-medium text-[#086524]">
            Danh sách hết hạn trong
          </Text>
          <View className="flex-row items-center">
            <View className="h-[18px] w-[49px] items-center justify-center rounded-md border-[0.95px] border-[#1D7518] bg-white">
              <Text className="text-[9.45px] font-semibold leading-[100%] text-[#1D7518]">
                04 ngày
              </Text>
            </View>
            <Text className="mx-1.5 text-sm font-semibold text-[#1D7518]">
              :
            </Text>
            <View className="h-[18px] w-[49px] items-center justify-center rounded-md border-[0.95px] border-[#1D7518] bg-white">
              <Text className="text-[9.45px] font-semibold leading-[100%] text-[#1D7518]">
                12 tiếng
              </Text>
            </View>
            <Text className="mx-1.5 text-sm font-semibold text-[#1D7518]">
              :
            </Text>
            <View className="h-[18px] w-[49px] items-center justify-center rounded-md border-[0.95px] border-[#1D7518] bg-white">
              <Text className="text-[9.45px] font-semibold leading-[100%] text-[#1D7518]">
                21 phút
              </Text>
            </View>
          </View>
        </View>
      </View>

      <View
        className="flex-1 bg-[#f9f9f9]"
        style={{
          shadowColor: '#D9D9D933',
          shadowOffset: { width: 0, height: -4 },
          shadowOpacity: 0.25,
          shadowRadius: 3.84,
          elevation: 5,
        }}
      >
        {/* Action Buttons */}
        <View className="mb-5 mt-4 flex-row gap-2 px-4">
          <TouchableOpacity
            className="h-[26px] w-[87px] flex-row items-center justify-center gap-1.5 rounded-[16px] bg-[#FFFFFF]"
            style={{
              shadowColor: '#CAC4C4',
              shadowOffset: { width: 0, height: 4 },
              shadowOpacity: 0.25,
              shadowRadius: 3.84,
              elevation: 5,
            }}
          >
            <Ionicons name="map-outline" size={20} color="#000" />
            <Text className="text-[12px] font-medium text-black">Bản đồ</Text>
          </TouchableOpacity>

          <TouchableOpacity
            className="h-[26px] w-[87px] flex-row items-center justify-center gap-1.5 rounded-[16px] bg-[#FFFFFF]"
            style={{
              shadowColor: '#CAC4C4',
              shadowOffset: { width: 0, height: 2 },
              shadowOpacity: 0.25,
              shadowRadius: 3.84,
              elevation: 5,
            }}
          >
            <Ionicons name="share-social-outline" size={20} color="#000" />
            <Text className="text-[12px] font-medium text-black">Chia sẻ</Text>
          </TouchableOpacity>

          <TouchableOpacity
            className="h-[26px] flex-1 flex-row items-center justify-center gap-1.5 rounded-[16px] border-[1px] border-[#1D7518] bg-white"
            style={{
              shadowColor: '#CAC4C4',
              shadowOffset: { width: 0, height: 2 },
              shadowOpacity: 0.25,
              shadowRadius: 3.84,
              elevation: 5,
            }}
          >
            <Ionicons name="dice-outline" size={20} color="#1D7518" />
            <Text className="text-[12px] font-medium text-black">
              Chọn ngẫu nhiên
            </Text>
          </TouchableOpacity>
        </View>

        {/* List Header */}
        <View className="mb-4 flex-row items-center justify-between px-4">
          <Text className="text-[16px] font-semibold text-black">
            Danh sách địa điểm
          </Text>
          <TouchableOpacity
            className="h-[26px] w-[97px] flex-row items-center justify-center gap-1.5 rounded-[16px] bg-[#ECECEC]"
            onPress={() => setShowSortModal(true)}
          >
            <Ionicons name="options-outline" size={14} color="#666" />
            <Text className="text-[10px] text-gray-600">Sắp xếp theo</Text>
          </TouchableOpacity>
        </View>

        {/* Locations List */}
        <ScrollView
          className="flex-1 px-4"
          showsVerticalScrollIndicator={false}
        >
          {locations.map((location) => (
            <View
              key={location.id}
              className="relative mb-5 flex-row rounded-[16px] border border-[#EEEEEE] bg-[#FFFFFF] px-3 py-[8px]"
            >
              {location.isTopPick && (
                <View className="absolute -left-3.5 top-4 z-10">
                  {/* Main ribbon */}
                  <View
                    className="rounded-r-md bg-[#ff6b35] px-4 py-1.5"
                    style={{
                      shadowColor: '#000',
                      shadowOffset: { width: 2, height: 2 },
                      shadowOpacity: 0.3,
                      shadowRadius: 3,
                      elevation: 5,
                    }}
                  >
                    <Text className="text-[10px] font-bold text-white">
                      TOP PICK
                    </Text>
                  </View>
                  {/* Ribbon fold effect */}
                  <View
                    className="absolute -bottom-3.5 left-0 h-0 w-0"
                    style={{
                      borderLeftWidth: 12,
                      borderLeftColor: 'transparent',
                      borderRightWidth: 0,
                      borderRightColor: 'transparent',
                      borderTopWidth: 12,
                      borderTopColor: '#cc5429',
                    }}
                  />
                </View>
              )}
              <View className="mr-3">
                <Image
                  source={location.image}
                  className="h-[99px] w-[99px] rounded-xl bg-gray-100"
                />
              </View>

              <View className="flex-1 justify-start">
                <Text className="mb-1.5 text-[16px] font-semibold text-black">
                  {location.name}
                </Text>

                <View className="mb-1.5 flex-row items-center">
                  <Ionicons name="star" size={14} color="#ffc107" />
                  <Text className="ml-1 text-[13px] font-medium text-[#ffc107]">
                    {location.rating}
                  </Text>
                  <Text className="mx-1.5 text-[13px] text-gray-400">·</Text>
                  <Text className="text-[13px] text-[#979797]">
                    {location.distance}
                  </Text>
                </View>

                <View className="mb-2 flex-row items-center gap-1">
                  <Ionicons name="pricetag-outline" size={14} color="#06AA4C" />
                  <Text className="text-[14px] font-bold text-[#06AA4C]">
                    {location.priceRange}
                  </Text>
                </View>

                <View className="flex-row">
                  <View className="rounded-[16px] bg-[#06AA4C] px-2.5 py-1">
                    <Text className="text-[11px] font-medium text-white">
                      {location.tag}
                    </Text>
                  </View>
                </View>
              </View>

              <TouchableOpacity className="absolute right-3 top-3 h-[22px] w-[22px] items-center justify-center rounded-full bg-[#EE6612CC]">
                <Ionicons name="bookmark" size={12} color="white" />
              </TouchableOpacity>

              <View className="absolute bottom-3 right-3 h-[18.75] w-[65.625] flex-row items-center justify-center gap-2 rounded-[33.33px] bg-[#F3F3F2]">
                <View className="flex-row items-center gap-1">
                  <Ionicons
                    name="thumbs-up-outline"
                    size={10.42}
                    color="black"
                  />
                  <Text className="text-[10.42px] text-black">
                    {location.likes}
                  </Text>
                </View>
                <View className="h-[12px] w-[1px] bg-gray-400" />
                <View className="flex-row items-center gap-1">
                  <Ionicons
                    name="chatbubble-outline"
                    size={10.42}
                    color="black"
                  />
                  <Text className="text-[10.42px] text-black">
                    {location.comments}
                  </Text>
                </View>
              </View>
            </View>
          ))}
        </ScrollView>
      </View>

      <SortModal
        visible={showSortModal}
        onClose={() => setShowSortModal(false)}
        selectedSort={sortBy}
        onSelectSort={(sort) => {
          setSortBy(sort);
          setShowSortModal(false);
        }}
      />
    </SafeAreaView>
  );
};

export default CurrentPickDetailsScreen;
