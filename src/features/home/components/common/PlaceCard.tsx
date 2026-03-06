import { MaterialCommunityIcons } from '@expo/vector-icons';
import type { ActiveBranch } from '@features/home/types/branch';
import { useLocationPermission } from '@features/maps/hooks/useLocationPermission';
import { haversineKm } from '@utils/haversineFormula';
import type { JSX } from 'react';
import { useMemo } from 'react';
import { Image, Text, TouchableOpacity, View } from 'react-native';

interface PlaceCardProps {
  branch: ActiveBranch;
  displayName: string;
  imageUri?: string;
  onPress?: () => void;
}

export const PlaceCard = ({
  branch,
  displayName,
  imageUri,
  onPress,
}: PlaceCardProps): JSX.Element => {
  const { coords } = useLocationPermission();
  const resolvedImageUri =
    imageUri ??
    `https://ui-avatars.com/api/?name=${encodeURIComponent(branch.name)}&background=a1d973&color=fff&size=300`;

  const distanceLabel = useMemo(() => {
    if (!coords) return null;
    const km = haversineKm(
      coords.latitude,
      coords.longitude,
      branch.lat,
      branch.long
    );
    return km < 1 ? `${Math.round(km * 1000)} m` : `${km} km`;
  }, [coords, branch.lat, branch.long]);

  return (
    <TouchableOpacity
      onPress={onPress}
      className="h-fit overflow-hidden rounded-[16.81px] border border-[#ededed] bg-white"
    >
      <View className="p-[6.31px]">
        <View className="relative h-[117.7px] w-full overflow-hidden rounded-t-[14.71px]">
          <Image
            className="h-full w-full"
            source={{ uri: resolvedImageUri }}
            resizeMode="cover"
          />
          <View className="absolute right-2 top-2 h-[23px] w-[23px] items-center justify-center rounded-full bg-[#EE6612]">
            <MaterialCommunityIcons name="bookmark" size={14} color="#fff" />
          </View>
        </View>

        <View className="rounded-b-[14.71px] bg-white px-[8.41px] py-[4.2px]">
          <Text
            className="font-nunito -mt-[1.05px] h-[36px] py-1 text-[12.6px] font-bold leading-[18px] text-black"
            numberOfLines={2}
          >
            {branch.isVerified && (
              <MaterialCommunityIcons
                name="check-decagram"
                size={13}
                color="#186bde"
              />
            )}{' '}
            {displayName}
          </Text>

          <View className="flex-row items-center gap-[6px] py-1">
            <MaterialCommunityIcons
              name="star"
              size={13}
              color={'rgba(250,204,21,1)'}
            />
            <Text className="font-comfortaa text-[12px] font-semibold leading-[14px] text-[rgba(250,204,21,1)]">
              {branch.avgRating.toFixed(1)}
            </Text>
            {distanceLabel && (
              <Text className="font-comfortaa text-[12px] font-medium leading-[14px] text-[#979797]">
                {distanceLabel}
              </Text>
            )}
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
