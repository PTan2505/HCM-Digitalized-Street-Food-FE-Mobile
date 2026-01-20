import React from 'react';
import {
    View,
    Text,
    Image,
    TouchableOpacity,
    StatusBar,
    ScrollView,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';

interface PickItem {
    id: string;
    title: string;
    locations: string;
    days: number;
    hours: number;
    minutes: number;
    image: any;
}

const CurrentPicksScreen = () => {
    const picks: PickItem[] = [
        {
            id: '1',
            title: 'Current Picks #1',
            locations: '3 địa điểm',
            days: 4,
            hours: 12,
            minutes: 21,
            image: { uri: 'https://images.unsplash.com/photo-1626700051175-6818013e1d4f?w=400' },
        },
        {
            id: '2',
            title: 'Current Picks #2',
            locations: '9 địa điểm',
            days: 4,
            hours: 12,
            minutes: 21,
            image: { uri: 'https://images.unsplash.com/photo-1559925393-8be0ec4767c8?w=400' },
        },
    ];

    return (
        <SafeAreaView className="flex-1 bg-white" edges={['top', 'left', 'right']}>
            <StatusBar barStyle="dark-content" />

            {/* Header */}
            <View className="flex-row items-center justify-between px-4 py-3 border-b border-gray-100">
                <TouchableOpacity className="p-1">
                    <Ionicons name="chevron-back" size={28} color="#000" />
                </TouchableOpacity>
                <Text className="text-xl font-semibold text-black">Current Picks</Text>
                <View className="w-9" />
            </View>

            {/* Picks List */}
            <ScrollView className="flex-1" showsVerticalScrollIndicator={false}>
                {picks.map((pick) => (
                    <View key={pick.id} className="flex-row p-4 border-b border-gray-100 items-center">
                        <View className="relative mr-4">
                            <View
                                className="absolute top-3 -left-2 bg-[#EE66127D] opacity-60 rounded-[6px] w-[63px] h-[63px]"
                                style={{ transform: [{ rotate: '-15deg' }] }}
                            />
                            <View
                                className="absolute -top-1 -right-2 bg-[#E1FFC280] opacity-60 rounded-[6px] w-[63px] h-[63px]"
                                style={{ transform: [{ rotate: '15deg' }] }}
                            />
                            <Image source={pick.image} className="w-[80px] h-[80px] rounded-xl bg-gray-100" />
                        </View>

                        <View className="flex-1 justify-center">
                            <Text className="text-[14px] font-semibold text-black mb-3">{pick.title}</Text>
                            <Text className="text-[10px] text-gray-500 mb-3">{pick.locations}</Text>

                            <View className="flex-row items-center">
                                <View className="rounded-md border-[0.95px] border-[#1D7518] bg-white w-[49px] h-[18px] items-center justify-center">
                                    <Text className="text-[9.45px] text-[#1D7518] font-semibold leading-[100%]">
                                        {String(pick.days).padStart(2, '0')} ngày
                                    </Text>
                                </View>
                                <Text className="text-base text-[#1D7518] font-semibold mx-1.5">:</Text>
                                <View className="rounded-md border-[0.95px] border-[#1D7518] bg-white w-[49px] h-[18px] items-center justify-center">
                                    <Text className="text-[9.45px] text-[#1D7518] font-semibold leading-[100%]">
                                        {String(pick.hours).padStart(2, '0')} tiếng
                                    </Text>
                                </View>
                                <Text className="text-base text-[#1D7518] font-semibold mx-1.5">:</Text>
                                <View className="rounded-md border-[0.95px] border-[#1D7518] bg-white w-[49px] h-[18px] items-center justify-center">
                                    <Text className="text-[9.45px] text-[#1D7518] font-semibold leading-[100%]">
                                        {String(pick.minutes).padStart(2, '0')} phút
                                    </Text>
                                </View>
                            </View>
                        </View>

                        <TouchableOpacity className="p-2 ml-2">
                            <Ionicons name="share-social-outline" size={24} color="#000" />
                        </TouchableOpacity>
                    </View>
                ))}
            </ScrollView>

            {/* Add Button */}
            <TouchableOpacity
                className="absolute bottom-5 right-5 bg-[#EE6612] flex-row items-center py-3 px-6 rounded-[8px]"
            >
                <Ionicons name="add" size={24} color="#fff" />
                <Text className="text-white text-base font-semibold ml-2">Thêm mới</Text>
            </TouchableOpacity>
        </SafeAreaView>
    );
};

export default CurrentPicksScreen;