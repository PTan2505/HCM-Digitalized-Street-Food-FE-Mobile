import { Ionicons } from '@expo/vector-icons';
import { QuestProgressBar } from '@features/campaigns/components/QuestProgressBar';
import { useSystemCampaigns } from '@features/campaigns/hooks/useSystemCampaigns';
import { useQuestProgress } from '@features/campaigns/hooks/useQuestProgress';
import { StaticScreenProps, useNavigation } from '@react-navigation/native';
import type { JSX } from 'react';
import { useMemo } from 'react';
import { useTranslation } from 'react-i18next';
import { ScrollView, Text, TouchableOpacity, View } from 'react-native';
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
  const { campaignQuest, getProgressPercentage } = useQuestProgress(campaignId);

  const campaign = useMemo(
    () => systemCampaigns.find((c) => c.campaignId === campaignId),
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

  const startDate = new Date(campaign.startAt).toLocaleDateString();
  const endDate = new Date(campaign.endAt).toLocaleDateString();

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
        contentContainerStyle={{ padding: 16, paddingBottom: 100 }}
        showsVerticalScrollIndicator={false}
      >
        {/* Campaign badge */}
        <View className="mb-3 self-start rounded-full bg-[#a1d973]/20 px-3 py-1">
          <Text className="text-xs font-semibold text-[#7AB82D]">
            {t('campaign.platform_event')}
          </Text>
        </View>

        <Text className="mb-2 text-2xl font-bold text-gray-900">
          {campaign.title}
        </Text>

        <Text className="mb-4 text-base leading-6 text-gray-600">
          {campaign.description}
        </Text>

        {/* Date range */}
        <View className="mb-4 flex-row items-center">
          <Ionicons name="calendar-outline" size={16} color="#6B7280" />
          <Text className="ml-2 text-sm text-gray-500">
            {startDate} - {endDate}
          </Text>
        </View>

        {/* Reward */}
        {campaign.reward && (
          <View className="mb-4 rounded-xl bg-amber-50 p-4">
            <View className="flex-row items-center">
              <Ionicons name="gift-outline" size={20} color="#D97706" />
              <Text className="ml-2 text-sm font-semibold text-amber-700">
                {t('campaign.reward')}
              </Text>
            </View>
            <Text className="mt-1 text-sm text-amber-600">
              {campaign.reward}
            </Text>
          </View>
        )}

        {/* Requirements */}
        {campaign.requirements && (
          <View className="mb-4 rounded-xl bg-blue-50 p-4">
            <View className="flex-row items-center">
              <Ionicons name="list-outline" size={20} color="#2563EB" />
              <Text className="ml-2 text-sm font-semibold text-blue-700">
                {t('campaign.requirements')}
              </Text>
            </View>
            <Text className="mt-1 text-sm text-blue-600">
              {campaign.requirements}
            </Text>
          </View>
        )}

        {/* Quest progress (shown when progress data is available) */}
        {campaignQuest && (
          <View className="mb-4">
            <Text className="mb-2 text-sm font-semibold text-gray-700">
              {t('campaign.quest_progress')}
            </Text>
            <QuestProgressBar
              progress={getProgressPercentage(campaignQuest)}
              current={campaignQuest.currentProgress}
              target={campaignQuest.targetProgress}
              description={campaignQuest.questDescription}
            />
          </View>
        )}
      </ScrollView>
    </SafeAreaView>
  );
};
