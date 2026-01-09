import type { JSX } from 'react';
import { View, Text, Image, type ImageSourcePropType } from 'react-native';
import { MaterialCommunityIcons } from '@expo/vector-icons';

interface PlaceCardProps {
    title: string;
    rating: number;
    distance: string;
    priceRange: string;
    imageSource: ImageSourcePropType;
    isVegetarian?: boolean;
};

export const PlaceCard = ({
    title,
    rating,
    distance,
    priceRange,
    imageSource,
    isVegetarian,
}: PlaceCardProps): JSX.Element => {
    return (
        <View className="w-[171.3px] border border-[#ededed] rounded-[16.81px] overflow-hidden bg-white">
            <View className="p-[6.31px]">
                <View className="relative w-full h-[117.7px] rounded-t-[14.71px] overflow-hidden">
                    <Image
                        className="w-full h-full"
                        source={imageSource}
                        resizeMode="cover"
                    />
                    <View className="absolute top-2 right-2 w-[23px] h-[23px] bg-[#EE6612] rounded-full items-center justify-center">
                        <MaterialCommunityIcons name="bookmark" size={14} color="#fff" />
                    </View>
                    {isVegetarian && (
                        <View className="absolute bottom-2 left-2 flex-row bg-[#4FBE71] rounded-[16.81px] items-center justify-center px-[6.31px] py-[6.31px] gap-[4.2px]">
                            <Text className="font-comfortaa font-medium text-[#FFFF] text-[10.5px] leading-[10.5px]">
                                MÃ³n chay
                            </Text>
                        </View>
                    )}
                </View>

                <View className="px-[8.41px] py-[4.2px] bg-white rounded-b-[14.71px]">
                    <Text className="font-nunito font-semibold text-black text-[12.6px] leading-[23.1px] -mt-[1.05px]">
                        {title}
                    </Text>

                    <View className="flex-row items-center w-[88.27px]">
                        {isVegetarian ? (
                            <>
                                <View className="flex-row items-center gap-[4.2px] rounded-[16.81px] bg-[#4FBE71] px-[6.31px] py-[6.31px]">
                                    <MaterialCommunityIcons name="star" size={9.81} color="#FFF" />
                                    <Text className="font-comfortaa font-medium text-[#FFF] text-[10.5px] leading-[10.5px]">
                                        {rating}
                                    </Text>
                                </View>

                                <View className="flex-row items-center px-[6.31px] py-[6.31px] rounded-[16.81px] gap-[4.2px] bg-[#E1FFC2] ml-[4.2px]">
                                    <Text className="font-nunito font-medium text-[#000000] text-[10.5px] leading-[10.5px]">
                                        {distance}
                                    </Text>
                                </View>
                            </>
                        ) : (
                            <>
                                <View className="flex-row items-center gap-[4.2px] rounded-[16.81px] px-[6.31px] py-[6.31px]">
                                    <MaterialCommunityIcons name="star" size={9.81} color="#FACC15" />
                                    <Text className="font-comfortaa font-medium text-[#FACC15] text-[10.5px] leading-[10.5px]">
                                        {rating}
                                    </Text>
                                </View>

                                <View className="flex-row items-center px-[6.31px] py-[6.31px] rounded-[16.81px] gap-[4.2px] ml-[-5px]">
                                    <Text className="font-nunito font-medium text-[#979797] text-[10.5px] leading-[10.5px]">
                                        {distance}
                                    </Text>
                                </View>
                            </>
                        )}
                    </View>

                    <View className="flex-row items-center gap-[4.2px]">
                        <MaterialCommunityIcons
                            name="tag-outline"
                            size={14.71}
                            color={isVegetarian ? '#4FBE71' : '#a5cf7bff'}
                            className="w-[14.71px] h-[14.71px]"
                            style={{ transform: [{ rotate: '90deg' }] }}
                        />
                        {isVegetarian ? (
                            <>
                                <Text className="font-nunito font-bold text-[#4FBE71] text-[13.7px] leading-[23.1px] -mt-[1.05px]">
                                    {priceRange}
                                </Text>
                            </>
                        ) : (
                            <Text className="font-nunito font-bold text-[#a5cf7bff] text-[13.7px] leading-[23.1px] -mt-[1.05px]">
                                {priceRange}
                            </Text>
                        )}
                    </View>
                </View>
            </View>
        </View>
    );
};