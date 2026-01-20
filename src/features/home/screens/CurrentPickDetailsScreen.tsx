import React, { useState } from 'react';
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

const CurrentPickDetailsScreen = () => {
    const [sortBy, setSortBy] = useState('default');

    const locations: Location[] = [
        {
            id: '1',
            name: 'Bánh mì Huỳnh Hoa',
            rating: 4.5,
            distance: '0.8 km',
            priceRange: 'Từ 150k đến 200k',
            tag: 'Món Việt',
            image: { uri: 'https://images.unsplash.com/photo-1626700051175-6818013e1d4f?w=400' },
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
            image: { uri: 'https://images.unsplash.com/photo-1598103442097-8b74394b95c6?w=400' },
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
            image: { uri: 'https://images.unsplash.com/photo-1517248135467-4c7edcad34c4?w=400' },
            likes: 2,
            comments: 1,
        },
        {
            id: '4',
            name: 'The Gangs Mac Đĩnh Chi',
            rating: 4.5,
            distance: '0.8 km',
            priceRange: 'Từ 200k đến 500k',
            tag: 'Đi tập nhóm bè',
            image: { uri: 'https://images.unsplash.com/photo-1517248135467-4c7edcad34c4?w=400' },
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
            image: { uri: 'https://images.unsplash.com/photo-1517248135467-4c7edcad34c4?w=400' },
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
            image: { uri: 'https://images.unsplash.com/photo-1517248135467-4c7edcad34c4?w=400' },
            likes: 2,
            comments: 1,
        },
    ];

    return (
        <SafeAreaView className="flex-1 bg-white" edges={['top', 'left', 'right']}>
            <StatusBar barStyle="dark-content" />

            {/* Header */}
            <View className="flex-row justify-between items-center px-4 py-3">
                <TouchableOpacity className="p-1">
                    <Ionicons name="chevron-back" size={28} color="#000" />
                </TouchableOpacity>
                <TouchableOpacity className="p-1">
                    <Ionicons name="ellipsis-horizontal" size={28} color="#000" />
                </TouchableOpacity>
            </View>

            {/* Title Section */}
            <View className="px-4 pt-2" style={{
                shadowColor: '#CAC4C4',
                shadowOffset: { width: 0, height: 2 },
                shadowOpacity: 0.25,
                shadowRadius: 3.84,
                elevation: 5,
            }}>
                <Text className="text-[20px] font-semibold text-black mb-2 leading-[22px]">Current Picks #1</Text>
                {/* <View
                    style={{
                        width: 0,
                        height: 80, // chiều cao ban đầu (height)
                        borderTopWidth: 0,
                        borderBottomWidth: 40, // slantWidth
                        borderRightWidth: 120, // width - slantWidth
                        borderStyle: 'solid',
                        backgroundColor: 'transparent',
                        borderTopColor: 'transparent',
                        borderBottomColor: 'transparent',
                        borderRightColor: '#f59e0b',
                    }}
                /> */}
                <Text className="text-sm text-gray-400 mb-2">3 địa điểm</Text>

                <View className="mb-3 flex-row justify-between items-center">
                    <Text className="text-sm text-[#086524] font-medium mr-2">Danh sách hết hạn trong</Text>
                    <View className="flex-row items-center">
                        <View className="rounded-md border-[0.95px] border-[#1D7518] bg-white w-[49px] h-[18px] items-center justify-center">
                            <Text className="text-[9.45px] text-[#1D7518] font-semibold leading-[100%]">04 ngày</Text>
                        </View>
                        <Text className="text-sm text-[#1D7518] font-semibold mx-1.5">:</Text>
                        <View className="rounded-md border-[0.95px] border-[#1D7518] bg-white w-[49px] h-[18px] items-center justify-center">
                            <Text className="text-[9.45px] text-[#1D7518] font-semibold leading-[100%]">12 tiếng</Text>
                        </View>
                        <Text className="text-sm text-[#1D7518] font-semibold mx-1.5">:</Text>
                        <View className="rounded-md border-[0.95px] border-[#1D7518] bg-white w-[49px] h-[18px] items-center justify-center">
                            <Text className="text-[9.45px] text-[#1D7518] font-semibold leading-[100%]">21 phút</Text>
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
                <View className="flex-row px-4 mb-5 gap-2 mt-4">
                    <TouchableOpacity
                        className="flex-row items-center justify-center rounded-[16px] bg-[#FFFFFF] gap-1.5 w-[87px] h-[26px]"
                        style={{
                            shadowColor: '#CAC4C4',
                            shadowOffset: { width: 0, height: 4 },
                            shadowOpacity: 0.25,
                            shadowRadius: 3.84,
                            elevation: 5,
                        }}
                    >
                        <Ionicons name="map-outline" size={20} color="#000" />
                        <Text className="text-[12px] text-black font-medium">Bản đồ</Text>
                    </TouchableOpacity>

                    <TouchableOpacity
                        className="flex-row items-center justify-center rounded-[16px] bg-[#FFFFFF] gap-1.5 w-[87px] h-[26px]"
                        style={{
                            shadowColor: '#CAC4C4',
                            shadowOffset: { width: 0, height: 2 },
                            shadowOpacity: 0.25,
                            shadowRadius: 3.84,
                            elevation: 5,
                        }}
                    >
                        <Ionicons name="share-social-outline" size={20} color="#000" />
                        <Text className="text-[12px] text-black font-medium">Chia sẻ</Text>
                    </TouchableOpacity>

                    <TouchableOpacity
                        className="flex-1 flex-row items-center justify-center rounded-[16px] border-[1px] border-[#1D7518] bg-white gap-1.5 h-[26px]"
                        style={{
                            shadowColor: '#CAC4C4',
                            shadowOffset: { width: 0, height: 2 },
                            shadowOpacity: 0.25,
                            shadowRadius: 3.84,
                            elevation: 5,
                        }}
                    >
                        <Ionicons name="dice-outline" size={20} color="#1D7518" />
                        <Text className="text-[12px] text-black font-medium">Chọn ngẫu nhiên</Text>
                    </TouchableOpacity>
                </View>

                {/* List Header */}
                <View className="flex-row justify-between items-center px-4 mb-4">
                    <Text className="text-[16px] font-semibold text-black">Danh sách địa điểm</Text>
                    <TouchableOpacity className="flex-row items-center justify-center rounded-[16px] bg-[#ECECEC] gap-1.5 w-[97px] h-[26px]">
                        <Ionicons name="options-outline" size={14} color="#666" />
                        <Text className="text-[10px] text-gray-600">Sắp xếp theo</Text>
                    </TouchableOpacity>
                </View>

                {/* Locations List */}
                <ScrollView className="flex-1 px-4" showsVerticalScrollIndicator={false}>
                    {locations.map((location) => (
                        <View key={location.id} className="flex-row mb-5 bg-white py-[8px] relative px-3 rounded-[16px]">
                            {location.isTopPick && (
                                <>
                                    <View className="absolute top-3 -left-2 bg-[#ff6b35] px-3 py-1 rounded-tr rounded-br z-10">
                                        <Text className="text-[10px] text-white font-semibold">Top pick</Text>
                                    </View>
                                </>
                            )}
                            <View className="mr-3">
                                <Image source={location.image} className="w-[99px] h-[99px] rounded-xl bg-gray-100" />
                            </View>

                            <View className="flex-1 justify-start">
                                <Text className="text-[16px] font-semibold text-black mb-1.5">{location.name}</Text>

                                <View className="flex-row items-center mb-1.5">
                                    <Ionicons name="star" size={14} color="#ffc107" />
                                    <Text className="text-[13px] text-[#ffc107] ml-1 font-medium">{location.rating}</Text>
                                    <Text className="text-[13px] text-gray-400 mx-1.5">·</Text>
                                    <Text className="text-[13px] text-[#979797]">{location.distance}</Text>
                                </View>

                                <View className="flex-row items-center mb-2 gap-1">
                                    <Ionicons name="pricetag-outline" size={14} color="#06AA4C" />
                                    <Text className="text-[14px] text-[#06AA4C] font-bold">{location.priceRange}</Text>
                                </View>

                                <View className="flex-row">
                                    <View className="px-2.5 py-1 rounded-[16px] bg-[#06AA4C]">
                                        <Text className="text-[11px] text-white font-medium">{location.tag}</Text>
                                    </View>
                                </View>
                            </View>

                            <TouchableOpacity className="w-[22px] h-[22px] rounded-full bg-[#EE6612CC] items-center justify-center absolute top-3 right-3">
                                <Ionicons name="bookmark" size={12} color="white" />
                            </TouchableOpacity>

                            <View className="flex-row items-center justify-center gap-2 absolute bottom-3 right-3 bg-[#F3F3F2] rounded-[33.33px] w-[65.625] h-[18.75]">
                                <View className="flex-row items-center gap-1">
                                    <Ionicons name="thumbs-up-outline" size={10.42} color="black" />
                                    <Text className="text-[10.42px] text-black">{location.likes}</Text>
                                </View>
                                <View className="w-[1px] h-[12px] bg-gray-400" />
                                <View className="flex-row items-center gap-1">
                                    <Ionicons name="chatbubble-outline" size={10.42} color="black" />
                                    <Text className="text-[10.42px] text-black">{location.comments}</Text>
                                </View>
                            </View>
                        </View>
                    ))}
                </ScrollView>
            </View>
        </SafeAreaView>
    );
};

export default CurrentPickDetailsScreen;