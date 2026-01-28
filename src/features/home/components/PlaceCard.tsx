import type { JSX } from 'react';
import {
  View,
  Text,
  Image,
  type ImageSourcePropType,
  TouchableOpacity,
} from 'react-native';
import { MaterialCommunityIcons } from '@expo/vector-icons';
import { useNavigation } from '@react-navigation/native';
import { useTranslation } from 'react-i18next';

interface PlaceCardProps {
  title: string;
  rating: number;
  distance: string;
  priceRange: string;
  imageSource: ImageSourcePropType;
  isVegetarian?: boolean;
}

export const PlaceCard = ({
  title,
  rating,
  distance,
  priceRange,
  imageSource,
  isVegetarian,
}: PlaceCardProps): JSX.Element => {
  const navigation = useNavigation();
  const { t } = useTranslation();
  return (
    <TouchableOpacity
      onPress={() => navigation.navigate('RestaurantSwipe')}
      className="h-fit overflow-hidden rounded-[16.81px] border border-[#ededed] bg-white"
    >
      <View className="p-[6.31px]">
        <View className="relative h-[117.7px] w-full overflow-hidden rounded-t-[14.71px]">
          <Image
            className="h-full w-full"
            source={imageSource}
            resizeMode="cover"
          />
          <View className="absolute right-2 top-2 h-[23px] w-[23px] items-center justify-center rounded-full bg-[#EE6612]">
            <MaterialCommunityIcons name="bookmark" size={14} color="#fff" />
          </View>
          {isVegetarian && (
            <View className="absolute bottom-2 left-2 flex-row items-center justify-center gap-[4.2px] rounded-[16.81px] bg-[#4FBE71] px-[6.31px] py-[6.31px]">
              <Text className="font-comfortaa text-[10.5px] font-medium leading-[10.5px] text-[#FFFF]">
                {t('vegetarian_dish')}
              </Text>
            </View>
          )}
        </View>

        <View className="rounded-b-[14.71px] bg-white px-[8.41px] py-[4.2px]">
          <Text className="font-nunito -mt-[1.05px] py-1 text-[12.6px] font-semibold leading-[23.1px] text-black">
            {title}
          </Text>

          <View className="w-[88.27px] flex-row items-center py-1">
            {isVegetarian ? (
              <>
                <View className="flex-row items-center gap-[5px] rounded-[18px] bg-[#4FBE71] px-[7px] py-[6px]">
                  <MaterialCommunityIcons name="star" size={11} color="#FFF" />
                  <Text className="font-comfortaa text-[11.5px] font-medium leading-[11.5px] text-[#FFF]">
                    {rating}
                  </Text>
                </View>

                <View className="ml-[6px] flex-row items-center gap-[5px] rounded-[18px] bg-[#E1FFC2] px-[7px] py-[6px]">
                  <Text className="font-nunito text-[11.5px] font-medium leading-[11.5px] text-[#000]">
                    {distance}
                  </Text>
                </View>
              </>
            ) : (
              <>
                <View className="flex-row items-center gap-[5px] rounded-[18px] px-[7px] py-[6px]">
                  <MaterialCommunityIcons
                    name="star"
                    size={11}
                    color="#FACC15"
                  />
                  <Text className="font-comfortaa text-[11.5px] font-medium leading-[11.5px] text-[#FACC15]">
                    {rating}
                  </Text>
                </View>

                <View className="ml-[-6px] flex-row items-center gap-[5px] rounded-[18px] px-[7px] py-[6px]">
                  <Text className="font-nunito text-[11.5px] font-medium leading-[11.5px] text-[#979797]">
                    {distance}
                  </Text>
                </View>
              </>
            )}
          </View>

          <View className="flex-row items-center gap-[4.2px] pt-1">
            <MaterialCommunityIcons
              name="tag-outline"
              size={14.71}
              color={isVegetarian ? '#4FBE71' : '#a5cf7bff'}
              className="h-[14.71px] w-[14.71px]"
              style={{ transform: [{ rotate: '90deg' }] }}
            />
            {isVegetarian ? (
              <>
                <Text className="font-nunito -mt-[1.05px] text-[13.7px] font-bold leading-[23.1px] text-[#4FBE71]">
                  {priceRange}
                </Text>
              </>
            ) : (
              <Text className="font-nunito -mt-[1.05px] text-[13.7px] font-bold leading-[23.1px] text-[#a5cf7bff]">
                {priceRange}
              </Text>
            )}
          </View>
        </View>
      </View>
    </TouchableOpacity>
  );
};
