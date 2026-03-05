import { MaterialCommunityIcons } from '@expo/vector-icons';
import type { ActiveBranch } from '@features/home/types/branch';
import type { JSX } from 'react';
import { Image, Text, TouchableOpacity, View } from 'react-native';

interface PlaceCardProps {
  branch: ActiveBranch;
  displayName: string;
  onPress?: () => void;
}

export const PlaceCard = ({
  branch,
  displayName,
  onPress,
}: PlaceCardProps): JSX.Element => {
  const imageUri = `https://ui-avatars.com/api/?name=${encodeURIComponent(branch.name)}&background=a1d973&color=fff&size=300`;

  return (
    <TouchableOpacity
      onPress={onPress}
      className="h-fit overflow-hidden rounded-[16.81px] border border-[#ededed] bg-white"
    >
      <View className="p-[6.31px]">
        <View className="relative h-[117.7px] w-full overflow-hidden rounded-t-[14.71px]">
          <Image
            className="h-full w-full"
            source={{ uri: imageUri }}
            resizeMode="cover"
          />
          <View className="absolute right-2 top-2 h-[23px] w-[23px] items-center justify-center rounded-full bg-[#EE6612]">
            <MaterialCommunityIcons name="bookmark" size={14} color="#fff" />
          </View>
          {branch.isVerified && (
            <View className="absolute bottom-2 left-2 flex-row items-center justify-center gap-[4.2px] rounded-[16.81px] bg-[#4FBE71] px-[6.31px] py-[6.31px]">
              <MaterialCommunityIcons
                name="check-decagram"
                size={10}
                color="#FFF"
              />
              <Text className="font-comfortaa text-[10.5px] font-medium leading-[10.5px] text-[#FFF]">
                Đã xác minh
              </Text>
            </View>
          )}
        </View>

        <View className="rounded-b-[14.71px] bg-white px-[8.41px] py-[4.2px]">
          <Text
            className="font-nunito -mt-[1.05px] py-1 text-[12.6px] font-semibold leading-[23.1px] text-black"
            numberOfLines={2}
          >
            {displayName}
          </Text>

          <View className="flex-row items-center py-1">
            <View
              className={`flex-row items-center gap-[5px] rounded-[18px] px-[7px] py-[6px] ${
                branch.isVerified ? 'bg-[#4FBE71]' : ''
              }`}
            >
              <MaterialCommunityIcons
                name="star"
                size={11}
                color={branch.isVerified ? '#FFF' : '#FACC15'}
              />
              <Text
                className={`font-comfortaa text-[11.5px] font-medium leading-[11.5px] ${
                  branch.isVerified ? 'text-[#FFF]' : 'text-[#FACC15]'
                }`}
              >
                {branch.avgRating.toFixed(1)}
              </Text>
            </View>

            <View className="flex-row items-center gap-[5px] rounded-[18px] px-[7px] py-[6px]">
              <MaterialCommunityIcons
                name="map-marker-outline"
                size={11}
                color="#979797"
              />
              <Text
                className="font-nunito text-[11.5px] font-medium leading-[11.5px] text-[#979797]"
                numberOfLines={1}
              >
                {branch.city}
              </Text>
            </View>
          </View>

          <View className="flex-row items-center gap-[4.2px] pt-1">
            <MaterialCommunityIcons
              name="map-marker"
              size={13}
              color="#a5cf7bff"
            />
            <Text
              className="font-nunito -mt-[1.05px] flex-1 text-[11px] font-medium leading-[16px] text-[#979797]"
              numberOfLines={2}
            >
              {branch.addressDetail}
            </Text>
          </View>
        </View>
      </View>
    </TouchableOpacity>
  );
};
