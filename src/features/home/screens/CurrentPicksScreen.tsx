import React from 'react';
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
import Swipeable from 'react-native-gesture-handler/ReanimatedSwipeable';
import { GestureHandlerRootView } from 'react-native-gesture-handler';
import 'react-native-reanimated';
import { useNavigation } from '@react-navigation/native';

interface PickItem {
  id: string;
  title: string;
  locations: string;
  days: number;
  hours: number;
  minutes: number;
  image: any;
}

const CurrentPicksScreen = (): JSX.Element => {
  const navigation = useNavigation();
  const picks: PickItem[] = [
    {
      id: '1',
      title: 'Current Picks #1',
      locations: '3 địa điểm',
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
      locations: '9 địa điểm',
      days: 4,
      hours: 12,
      minutes: 21,
      image: {
        uri: 'https://images.unsplash.com/photo-1559925393-8be0ec4767c8?w=400',
      },
    },
  ];

  const renderRightActions = (pickId: string) => {
    return (
      <View className="flex-row">
        <TouchableOpacity
          className="w-[65px] items-center justify-center bg-[#E1FFC2]"
          onPress={() => console.log('Edit', pickId)}
        >
          <Ionicons name="pencil-outline" size={24} color="#000000" />
        </TouchableOpacity>
        <TouchableOpacity
          className="w-[65px] items-center justify-center bg-[#B1EE73]"
          onPress={() => console.log('Delete', pickId)}
        >
          <Ionicons name="trash-outline" size={24} color="#000000" />
        </TouchableOpacity>
      </View>
    );
  };

  return (
    <GestureHandlerRootView className="flex-1">
      <SafeAreaView
        className="flex-1 bg-white"
        edges={['top', 'left', 'right']}
      >
        <StatusBar barStyle="dark-content" />

        {/* Header */}
        <View className="flex-row items-center justify-between border-b border-gray-100 px-4 py-3">
          <TouchableOpacity onPress={() => navigation.goBack()} className="p-1">
            <Ionicons name="chevron-back" size={28} color="#000" />
          </TouchableOpacity>
          <Text className="text-xl font-semibold text-black">
            Current Picks
          </Text>
          <View className="w-9" />
        </View>

        {/* Picks List */}
        <ScrollView className="flex-1" showsVerticalScrollIndicator={false}>
          {picks.map((pick) => (
            <Swipeable
              key={pick.id}
              renderRightActions={() => renderRightActions(pick.id)}
              overshootRight={false}
              rightThreshold={40}
            >
              <TouchableOpacity onPress={() => navigation.navigate('CurrentPickDetails')} className="flex-row items-center border-b border-gray-100 bg-white p-4">
                <View className="relative mr-4">
                  <View
                    className="absolute -left-2 top-3 h-[63px] w-[63px] rounded-[6px] bg-[#EE66127D] opacity-60"
                    style={{ transform: [{ rotate: '-15deg' }] }}
                  />
                  <View
                    className="absolute -right-2 -top-1 h-[63px] w-[63px] rounded-[6px] bg-[#E1FFC280] opacity-60"
                    style={{ transform: [{ rotate: '15deg' }] }}
                  />
                  <Image
                    source={pick.image}
                    className="h-[80px] w-[80px] rounded-xl bg-gray-100"
                  />
                </View>

                <View className="flex-1 justify-center">
                  <Text className="mb-3 text-[14px] font-semibold text-black">
                    {pick.title}
                  </Text>
                  <Text className="mb-3 text-[10px] text-gray-500">
                    {pick.locations}
                  </Text>

                  <View className="flex-row items-center">
                    <View className="h-[18px] w-[49px] items-center justify-center rounded-md border-[0.95px] border-[#1D7518] bg-white">
                      <Text className="text-[9.45px] font-semibold leading-[100%] text-[#1D7518]">
                        {String(pick.days).padStart(2, '0')} ngày
                      </Text>
                    </View>
                    <Text className="mx-1.5 text-base font-semibold text-[#1D7518]">
                      :
                    </Text>
                    <View className="h-[18px] w-[49px] items-center justify-center rounded-md border-[0.95px] border-[#1D7518] bg-white">
                      <Text className="text-[9.45px] font-semibold leading-[100%] text-[#1D7518]">
                        {String(pick.hours).padStart(2, '0')} tiếng
                      </Text>
                    </View>
                    <Text className="mx-1.5 text-base font-semibold text-[#1D7518]">
                      :
                    </Text>
                    <View className="h-[18px] w-[49px] items-center justify-center rounded-md border-[0.95px] border-[#1D7518] bg-white">
                      <Text className="text-[9.45px] font-semibold leading-[100%] text-[#1D7518]">
                        {String(pick.minutes).padStart(2, '0')} phút
                      </Text>
                    </View>
                  </View>
                </View>

                <TouchableOpacity className="ml-2 p-2">
                  <Ionicons
                    name="share-social-outline"
                    size={24}
                    color="#000"
                  />
                </TouchableOpacity>
              </TouchableOpacity>
            </Swipeable>
          ))}
        </ScrollView>

        {/* Add Button */}
        <TouchableOpacity className="absolute bottom-9 right-9 flex-row items-center gap-2 rounded-[8px] bg-[#EE6612] px-2 py-2">
          <Ionicons name="add" size={24} color="#fff" />
          <Text className="text-base font-semibold text-white">Thêm mới</Text>
        </TouchableOpacity>
      </SafeAreaView>
    </GestureHandlerRootView>
  );
};

export default CurrentPicksScreen;
