import React, { useState } from 'react';
import {
  View,
  StatusBar,
  ScrollView,
  type ImageSourcePropType,
} from 'react-native';
import type { JSX } from 'react';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useNavigation } from '@react-navigation/native';
import { useTranslation } from 'react-i18next';
import SortModal from '@features/home/components/common/SortModal';
import CurrentPickCard from '@features/home/components/common/CurrentPickCard';
import Header from '@features/home/components/currentPickDetails/Header';
import TitleSection from '@features/home/components/currentPickDetails/TitleSection';
import ActionButtons from '@features/home/components/currentPickDetails/ActionButtons';
import ListHeader from '@features/home/components/currentPickDetails/ListHeader';

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

export const CurrentPickDetailsScreen = (): JSX.Element => {
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

      <Header
        onBackPress={() => navigation.goBack()}
        onMenuPress={() => console.log('Menu pressed')}
      />

      <TitleSection
        title={t('current_pick.title')}
        numberLabel={t('current_pick.number', { number: 1 })}
        locationsCount={3}
        locationsLabel={t('actions.locations')}
        expiresLabel={t('actions.list_expires_in')}
        days={4}
        hours={12}
        minutes={21}
        daysLabel={t('actions.days')}
        hoursLabel={t('actions.hours')}
        minutesLabel={t('actions.minutes')}
      />

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
        <ActionButtons
          mapLabel={t('actions.map')}
          shareLabel={t('actions.share')}
          randomPickLabel={t('actions.random_pick')}
          onMapPress={() => console.log('Map pressed')}
          onSharePress={() => console.log('Share pressed')}
          onRandomPickPress={() => console.log('Random pick pressed')}
        />

        <ListHeader
          title={t('actions.location_list')}
          sortByLabel={t('actions.sort_by')}
          onSortPress={() => setShowSortModal(true)}
        />

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
