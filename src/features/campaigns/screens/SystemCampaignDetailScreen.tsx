import { Ionicons } from '@expo/vector-icons';
import { useCampaignQuest } from '@features/campaigns/hooks/useCampaignQuests';
import { useSystemCampaigns } from '@features/campaigns/hooks/useSystemCampaigns';
import { StaticScreenProps, useNavigation } from '@react-navigation/native';
import { LinearGradient } from 'expo-linear-gradient';
import type { JSX } from 'react';
import { useMemo } from 'react';
import { useTranslation } from 'react-i18next';
import {
  ActivityIndicator,
  ImageBackground,
  ScrollView,
  Text,
  TouchableOpacity,
  View,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

type SystemCampaignDetailScreenProps = StaticScreenProps<{
  campaignId: string;
}>;

export const SystemCampaignDetailScreen = ({
  route,
}: SystemCampaignDetailScreenProps): JSX.Element => {
  const { t } = useTranslation();
  const navigation = useNavigation();
  const { campaignId } = route.params;

  const { systemCampaigns } = useSystemCampaigns();
  const { quest, isLoading: questLoading } = useCampaignQuest(campaignId);

  const campaign = useMemo(
    () => systemCampaigns.find((c) => String(c.campaignId) === campaignId),
    [systemCampaigns, campaignId]
  );

  if (!campaign) {
    return (
      <SafeAreaView
        edges={['top']}
        className="flex-1 items-center justify-center bg-white"
      >
        <Text className="text-gray-500">{t('campaign.not_found')}</Text>
      </SafeAreaView>
    );
  }

  const startDate = new Date(campaign.startDate).toLocaleDateString();
  const endDate = new Date(campaign.endDate).toLocaleDateString();

  return (
    <SafeAreaView edges={['top', 'left', 'right']} className="flex-1 bg-white">
      <View className="flex-row items-center px-4 py-3">
        <TouchableOpacity onPress={() => navigation.goBack()}>
          <Ionicons name="arrow-back" size={24} color="#111827" />
        </TouchableOpacity>
        <Text className="ml-3 text-lg font-bold text-gray-900">
          {t('campaign.system_detail')}
        </Text>
      </View>

      <ScrollView
        className="flex-1"
        contentContainerStyle={{ paddingBottom: 100 }}
        showsVerticalScrollIndicator={false}
      >
        <ImageBackground
          source={{ uri: campaign.imageUrl }}
          className="h-fit w-full"
          resizeMode="cover"
        >
          <LinearGradient
            colors={['rgba(0,0,0,0.1)', 'rgba(0,0,0,0.7)']}
            locations={[0, 0.7]}
            style={{ padding: 16 }}
          >
            {/* Campaign badge */}
            <View className="mb-3 self-start rounded-full bg-[#a1d973] px-3 py-1">
              <Text className="text-xs font-bold text-white">
                {t('campaign.platform_event')}
              </Text>
            </View>

            <Text className="mb-2 text-2xl font-bold text-white shadow-sm shadow-black">
              {campaign.name}
            </Text>

            <Text className="mb-4 text-base leading-6 text-white/90">
              {campaign.description}
            </Text>

            <View className="mb-6 flex-row items-center">
              <Ionicons name="calendar-outline" size={16} color="white" />
              <Text className="ml-2 text-sm text-white/80">
                {startDate} - {endDate}
              </Text>
            </View>
          </LinearGradient>
        </ImageBackground>

        {/* Quest section */}
        <View className="px-4 pt-4">
          <Text className="mb-3 text-base font-bold text-gray-900">
            {t('campaign.quest')}
          </Text>

          {questLoading ? (
            <ActivityIndicator size="small" color="#a1d973" />
          ) : quest ? (
            <TouchableOpacity
              className="rounded-2xl border border-gray-100 bg-gray-50 p-4"
              activeOpacity={0.7}
              onPress={() =>
                navigation.navigate('QuestDetail', { questId: quest.questId })
              }
            >
              <View className="mb-1 flex-row items-center justify-between">
                <View className="flex-row items-center">
                  <Ionicons name="trophy-outline" size={18} color="#7AB82D" />
                  <Text className="ml-2 text-base font-bold text-gray-900">
                    {quest.title}
                  </Text>
                </View>
                <Ionicons name="chevron-forward" size={18} color="#9CA3AF" />
              </View>

              {quest.description ? (
                <Text
                  className="mb-3 text-sm leading-5 text-gray-500"
                  numberOfLines={2}
                >
                  {quest.description}
                </Text>
              ) : null}

              <View className="flex-row items-center">
                <Ionicons name="list-outline" size={14} color="#9CA3AF" />
                <Text className="ml-1 text-xs text-gray-400">
                  {quest.taskCount} {t('quest.tasks')}
                </Text>
              </View>
            </TouchableOpacity>
          ) : (
            <Text className="text-sm text-gray-400">
              {t('campaign.no_quest')}
            </Text>
          )}
        </View>
      </ScrollView>
    </SafeAreaView>
  );
};
