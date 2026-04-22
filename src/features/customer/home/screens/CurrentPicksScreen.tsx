import Header from '@components/Header';
import AddButton from '@features/customer/home/components/currentPicks/AddButton';
import PickCard from '@features/customer/home/components/currentPicks/PickCard';
import { useNavigation } from '@react-navigation/native';
import type { JSX } from 'react';
import React from 'react';
import { useTranslation } from 'react-i18next';
import { ScrollView, type ImageSourcePropType } from 'react-native';
import { GestureHandlerRootView } from 'react-native-gesture-handler';
import 'react-native-reanimated';
import { SafeAreaView } from 'react-native-safe-area-context';

interface PickItem {
  id: string;
  title: string;
  locations: string;
  days: number;
  hours: number;
  minutes: number;
  image: ImageSourcePropType;
}

export const CurrentPicksScreen = (): JSX.Element => {
  const navigation = useNavigation();
  const { t } = useTranslation();

  const picks: PickItem[] = [
    {
      id: '1',
      title: 'Current Picks #1',
      locations: `3 ${t('actions.locations')}`,
      days: 4,
      hours: 12,
      minutes: 21,
      image: {
        uri: 'https://images.unsplash.com/photo-1626700051175-6818013e1d4f?w=400',
      },
    },
    {
      id: '2',
      title: 'Current Picks #2',
      locations: `9 ${t('actions.locations')}`,
      days: 4,
      hours: 12,
      minutes: 21,
      image: {
        uri: 'https://images.unsplash.com/photo-1559925393-8be0ec4767c8?w=400',
      },
    },
  ];

  return (
    <GestureHandlerRootView className="flex-1">
      <SafeAreaView className="flex-1 bg-white" edges={['left', 'right']}>
        <Header
          title={t('current_pick.title')}
          onBackPress={() => navigation.goBack()}
        />

        <ScrollView className="flex-1" showsVerticalScrollIndicator={false}>
          {picks.map((pick) => (
            <PickCard
              key={pick.id}
              id={pick.id}
              title={pick.title}
              locations={pick.locations}
              days={pick.days}
              hours={pick.hours}
              minutes={pick.minutes}
              image={pick.image}
              onPress={() => navigation.navigate('CurrentPickDetails')}
              onEdit={(id) => console.log('Edit', id)}
              onDelete={(id) => console.log('Delete', id)}
              onShare={() => console.log('Share', pick.id)}
              daysLabel={t('actions.days')}
              hoursLabel={t('actions.hours')}
              minutesLabel={t('actions.minutes')}
            />
          ))}
        </ScrollView>

        <AddButton
          label={t('actions.add_new')}
          onPress={() => console.log('Add new')}
        />
      </SafeAreaView>
    </GestureHandlerRootView>
  );
};
