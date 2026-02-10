import React, { useState } from 'react';
import {
  View,
  Text,
  TouchableOpacity,
  StatusBar,
  ScrollView,
  type ImageSourcePropType,
} from 'react-native';
import type { JSX } from 'react';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import { useNavigation } from '@react-navigation/native';
import { useTranslation } from 'react-i18next';
import SortModal from '@features/home/components/SortModal';
import CurrentPickCard from '@features/home/components/CurrentPickCard';

interface Location {
  id: string;
  name: string;
  rating: number;
  distance: string;
  priceRange: string;
  tag: string;
  image: ImageSourcePropType;
  likes: number;
  comments: number;
  isTopPick?: boolean;
}

const CurrentPickDetailsScreen = (): JSX.Element => {
  const navigation = useNavigation();
  const { t } = useTranslation();
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
        <TouchableOpacity className="p-1" onPress={() => navigation.goBack()}>
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
          {t('current_pick.title')} {t('current_pick.number', { number: 1 })}
        </Text>
        <Text className="mb-2 text-sm text-gray-400">
          3 {t('actions.locations')}
        </Text>

        <View className="mb-3 flex-row items-center justify-between">
          <Text className="mr-2 text-sm font-medium text-[#086524]">
            {t('actions.list_expires_in')}
          </Text>
          <View className="flex-row items-center">
            <View className="h-[18px] w-[49px] items-center justify-center rounded-md border-[0.95px] border-[#1D7518] bg-white">
              <Text className="text-[9.45px] font-semibold leading-[100%] text-[#1D7518]">
                04 {t('actions.days')}
              </Text>
            </View>
            <Text className="mx-1.5 text-sm font-semibold text-[#1D7518]">
              :
            </Text>
            <View className="h-[18px] w-[49px] items-center justify-center rounded-md border-[0.95px] border-[#1D7518] bg-white">
              <Text className="text-[9.45px] font-semibold leading-[100%] text-[#1D7518]">
                12 {t('actions.hours')}
              </Text>
            </View>
            <Text className="mx-1.5 text-sm font-semibold text-[#1D7518]">
              :
            </Text>
            <View className="h-[18px] w-[49px] items-center justify-center rounded-md border-[0.95px] border-[#1D7518] bg-white">
              <Text className="text-[9.45px] font-semibold leading-[100%] text-[#1D7518]">
                21 {t('actions.minutes')}
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
            <Text className="text-[12px] font-medium text-black">
              {t('actions.map')}
            </Text>
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
            <Text className="text-[12px] font-medium text-black">
              {t('actions.share')}
            </Text>
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
              {t('actions.random_pick')}
            </Text>
          </TouchableOpacity>
        </View>

        {/* List Header */}
        <View className="mb-4 flex-row items-center justify-between px-4">
          <Text className="text-[16px] font-semibold text-black">
            {t('actions.location_list')}
          </Text>
          <TouchableOpacity
            className="h-[26px] w-[97px] flex-row items-center justify-center gap-1.5 rounded-[16px] bg-[#ECECEC]"
            onPress={() => setShowSortModal(true)}
          >
            <Ionicons name="options-outline" size={14} color="#666" />
            <Text className="text-[10px] text-gray-600">
              {t('actions.sort_by')}
            </Text>
          </TouchableOpacity>
        </View>

        {/* Locations List */}
        <ScrollView
          className="flex-1 px-4"
          showsVerticalScrollIndicator={false}
        >
          {locations.map((location) => (
            <CurrentPickCard
              key={location.id}
              id={location.id}
              name={location.name}
              rating={location.rating}
              distance={location.distance}
              priceRange={location.priceRange}
              tag={location.tag}
              image={location.image}
              likes={location.likes}
              comments={location.comments}
              isTopPick={location.isTopPick}
            />
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
