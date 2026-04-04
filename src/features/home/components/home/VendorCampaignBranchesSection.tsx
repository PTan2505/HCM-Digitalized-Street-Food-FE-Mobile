import { MaterialCommunityIcons } from '@expo/vector-icons';
import type { VendorCampaignBranch } from '@features/campaigns/types/generated';
import { useNavigation } from '@react-navigation/native';
import { NativeStackNavigationProp } from '@react-navigation/native-stack';
import type { JSX } from 'react';
import { useTranslation } from 'react-i18next';
import {
  FlatList,
  Image,
  Text,
  TouchableOpacity,
  View,
} from 'react-native';
import Title from '../common/Title';

interface BranchCardProps {
  branch: VendorCampaignBranch;
  imageUri: string;
  onPress: () => void;
}

const BranchCard = ({ branch, imageUri, onPress }: BranchCardProps): JSX.Element => {
  const { t } = useTranslation();

  const distanceLabel =
    branch.distanceKm != null
      ? branch.distanceKm < 1
        ? `${Math.round(branch.distanceKm * 1000)} m`
        : `${branch.distanceKm.toFixed(1)} km`
      : null;

  return (
    <TouchableOpacity
      onPress={onPress}
      activeOpacity={0.8}
      className="mr-3 w-[160px] overflow-hidden rounded-2xl border border-[#ededed] bg-white"
    >
      <View className="p-[6px]">
        <View className="relative h-[100px] w-full overflow-hidden rounded-xl">
          <Image
            className="h-full w-full"
            source={{ uri: imageUri }}
            resizeMode="cover"
          />
          <View className="absolute left-2 top-2 flex-row items-center gap-1 rounded-full bg-[#EE6612] px-2 py-0.5">
            <MaterialCommunityIcons name="tag" size={10} color="#fff" />
            <Text className="text-[9px] font-bold text-white">
              {t('campaign.merchant_promo')}
            </Text>
          </View>
        </View>

        <View className="px-[6px] py-[4px]">
          <Text
            className="font-nunito text-[12px] font-bold leading-[18px] text-black"
            numberOfLines={2}
          >
            {branch.name}
          </Text>

          <View className="mt-1 flex-row items-center gap-[5px]">
            <MaterialCommunityIcons
              name="star"
              size={12}
              color="rgba(250,204,21,1)"
            />
            <Text className="text-[11px] font-semibold text-[rgba(250,204,21,1)]">
              {branch.avgRating.toFixed(1)}
            </Text>
            {distanceLabel && (
              <>
                <Text className="text-[#D1D5DB]">·</Text>
                <Text className="text-[11px] text-[#979797]">
                  {distanceLabel}
                </Text>
              </>
            )}
          </View>

          <View className="mt-1 flex-row items-center gap-1">
            <MaterialCommunityIcons
              name="map-marker"
              size={11}
              color="#a5cf7bff"
            />
            <Text
              className="flex-1 text-[10px] text-[#979797]"
              numberOfLines={1}
            >
              {branch.addressDetail}
            </Text>
          </View>
        </View>
      </View>
    </TouchableOpacity>
  );
};

interface VendorCampaignBranchesSectionProps {
  branches: VendorCampaignBranch[];
  imageMap: Record<number, string>;
}

export const VendorCampaignBranchesSection = ({
  branches,
  imageMap,
}: VendorCampaignBranchesSectionProps): JSX.Element | null => {
  const { t } = useTranslation();
  const navigation =
    useNavigation<NativeStackNavigationProp<ReactNavigation.RootParamList>>();

  if (branches.length === 0) return null;

  return (
    <View>
      <View className="px-4 py-2">
        <Title>{t('discount_branches_title')}</Title>
      </View>
      <FlatList
        data={branches}
        keyExtractor={(item) => String(item.branchId)}
        horizontal
        showsHorizontalScrollIndicator={false}
        contentContainerStyle={{
          paddingHorizontal: 16,
          paddingBottom: 8,
          paddingTop: 4,
        }}
        renderItem={({ item }) => (
          <BranchCard
            branch={item}
            imageUri={
              imageMap[item.branchId] ??
              `https://ui-avatars.com/api/?name=${encodeURIComponent(item.name)}&background=a1d973&color=fff&size=300`
            }
            onPress={() =>
              navigation.navigate('Restaurant', { branchId: item.branchId })
            }
          />
        )}
      />
    </View>
  );
};
