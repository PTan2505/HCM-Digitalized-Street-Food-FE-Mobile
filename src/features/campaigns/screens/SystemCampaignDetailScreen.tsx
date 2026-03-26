import { Ionicons } from '@expo/vector-icons';
import { QuestProgressBar } from '@features/campaigns/components/QuestProgressBar';
import { useCampaignQuestProgress } from '@features/campaigns/hooks/useCampaignQuestProgress';
import { useCampaignQuests } from '@features/campaigns/hooks/useCampaignQuests';
import { useSystemCampaigns } from '@features/campaigns/hooks/useSystemCampaigns';
import type { QuestTaskResponse } from '@features/campaigns/types/generated';
import { StaticScreenProps, useNavigation } from '@react-navigation/native';
import type { JSX } from 'react';
import { useMemo } from 'react';
import { useTranslation } from 'react-i18next';
import { ActivityIndicator, ScrollView, Text, TouchableOpacity, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

const TASK_TYPE_ICON: Record<QuestTaskResponse['type'], string> = {
  VISIT: 'location-outline',
  REVIEW: 'star-outline',
  ORDER_AMOUNT: 'cart-outline',
  SHARE: 'share-social-outline',
};

const REWARD_LABEL: Record<QuestTaskResponse['rewardType'], string> = {
  POINTS: 'điểm',
  BADGE: 'huy hiệu',
  VOUCHER: 'voucher',
};

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
  const { quests, isLoading: questsLoading } = useCampaignQuests(campaignId);
  const { progressList, isLoading: progressLoading, enroll, isEnrolling } =
    useCampaignQuestProgress(campaignId);

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
  const isLoadingQuests = questsLoading || progressLoading;

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
          {campaign.name}
        </Text>

        <Text className="mb-4 text-base leading-6 text-gray-600">
          {campaign.description}
        </Text>

        {/* Date range */}
        <View className="mb-6 flex-row items-center">
          <Ionicons name="calendar-outline" size={16} color="#6B7280" />
          <Text className="ml-2 text-sm text-gray-500">
            {startDate} - {endDate}
          </Text>
        </View>

        {/* Quest section */}
        {isLoadingQuests ? (
          <ActivityIndicator size="small" color="#a1d973" />
        ) : (
          quests.map((quest) => {
            const progress = progressList.find((p) => p.questId === quest.questId);
            const completedTasks = progress?.completedTasks ?? 0;
            const totalTasks = progress?.totalTasks ?? quest.taskCount;
            const progressPct =
              totalTasks > 0 ? Math.round((completedTasks / totalTasks) * 100) : 0;

            return (
              <View
                key={quest.questId}
                className="mb-4 rounded-2xl border border-gray-100 bg-gray-50 p-4"
              >
                {/* Quest header */}
                <View className="mb-1 flex-row items-center">
                  <Ionicons name="trophy-outline" size={18} color="#7AB82D" />
                  <Text className="ml-2 text-base font-bold text-gray-900">
                    {quest.title}
                  </Text>
                </View>
                <Text className="mb-4 text-sm leading-5 text-gray-500">
                  {quest.description}
                </Text>

                {/* Task list */}
                <Text className="mb-2 text-xs font-semibold uppercase tracking-wide text-gray-400">
                  {t('campaign.quest_tasks')}
                </Text>
                {quest.tasks.map((task) => (
                  <View
                    key={task.questTaskId}
                    className="mb-2 flex-row items-start rounded-xl bg-white p-3"
                  >
                    <View className="mr-3 mt-0.5 h-7 w-7 items-center justify-center rounded-full bg-[#a1d973]/20">
                      <Ionicons
                        name={TASK_TYPE_ICON[task.type] as never}
                        size={14}
                        color="#7AB82D"
                      />
                    </View>
                    <View className="flex-1">
                      <Text className="text-sm text-gray-700">{task.description}</Text>
                      <Text className="mt-0.5 text-xs text-gray-400">
                        {t('campaign.reward')}: +{task.rewardValue}{' '}
                        {REWARD_LABEL[task.rewardType]}
                      </Text>
                    </View>
                  </View>
                ))}

                {/* Progress or enroll */}
                {progress ? (
                  <View className="mt-2">
                    <Text className="mb-2 text-xs font-semibold text-gray-500">
                      {t('campaign.quest_progress')}
                    </Text>
                    <QuestProgressBar
                      progress={progressPct}
                      current={completedTasks}
                      target={totalTasks}
                      description={quest.description ?? quest.title}
                    />
                  </View>
                ) : (
                  <TouchableOpacity
                    className="mt-3 items-center rounded-xl bg-[#a1d973] py-3"
                    disabled={isEnrolling}
                    onPress={() => enroll(quest.questId)}
                  >
                    {isEnrolling ? (
                      <ActivityIndicator size="small" color="#fff" />
                    ) : (
                      <Text className="text-sm font-bold text-white">
                        {t('campaign.start_quest')}
                      </Text>
                    )}
                  </TouchableOpacity>
                )}
              </View>
            );
          })
        )}
      </ScrollView>
    </SafeAreaView>
  );
};
