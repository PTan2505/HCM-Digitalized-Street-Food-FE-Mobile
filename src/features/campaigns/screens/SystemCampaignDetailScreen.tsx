import Header from '@components/Header';
import { COLORS } from '@constants/colors';
import { Ionicons } from '@expo/vector-icons';
import { useCampaignQuest } from '@features/campaigns/hooks/useCampaignQuests';
import { useSystemCampaigns } from '@features/campaigns/hooks/useSystemCampaigns';
import { axiosApi } from '@lib/api/apiInstance';
import { StaticScreenProps, useNavigation } from '@react-navigation/native';
import { LinearGradient } from 'expo-linear-gradient';
import type { JSX } from 'react';
import { useEffect, useMemo, useState } from 'react';
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

type CampaignRewardType = 'BADGE' | 'POINTS' | 'VOUCHER';

const NUMERIC_REWARD_MAP: Record<number, CampaignRewardType> = {
  1: 'BADGE',
  2: 'POINTS',
  3: 'VOUCHER',
};

const NUMERIC_TASK_MAP: Record<number, string> = {
  1: 'REVIEW',
  2: 'ORDER_AMOUNT',
  3: 'SHARE',
  4: 'CREATE_GHOST_PIN',
};

const REWARD_UI_MAP: Record<
  CampaignRewardType,
  {
    icon: React.ComponentProps<typeof Ionicons>['name'];
    bgClassName: string;
    textClassName: string;
    iconColor: string;
  }
> = {
  POINTS: {
    icon: 'star',
    bgClassName: 'bg-yellow-100',
    textClassName: 'text-yellow-700',
    iconColor: '#CA8A04',
  },
  BADGE: {
    icon: 'medal',
    bgClassName: 'bg-indigo-100',
    textClassName: 'text-indigo-700',
    iconColor: '#4338CA',
  },
  VOUCHER: {
    icon: 'pricetag',
    bgClassName: 'bg-orange-100',
    textClassName: 'text-orange-700',
    iconColor: '#C2410C',
  },
};

const normalizeRewardType = (
  value: CampaignRewardType | number
): CampaignRewardType => {
  if (typeof value === 'number') return NUMERIC_REWARD_MAP[value] ?? 'POINTS';
  return value;
};

const normalizeTaskType = (value: string | number): string => {
  if (typeof value === 'number') return NUMERIC_TASK_MAP[value] ?? 'REVIEW';
  return value;
};

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

  const rewardItems = useMemo(() => {
    if (!quest?.tasks?.length) return [];

    return quest.tasks.map((task) => {
      const primaryReward = task.rewards[0];
      const rewardType = primaryReward
        ? normalizeRewardType(
            primaryReward.rewardType as CampaignRewardType | number
          )
        : ('POINTS' as CampaignRewardType);
      const rewardValue = primaryReward?.rewardValue ?? 0;
      const taskType = normalizeTaskType(task.type as string | number);

      let taskLabel = task.description ?? '';
      if (!taskLabel) {
        if (taskType === 'REVIEW') taskLabel = t('quest.taskType.review');
        else if (taskType === 'ORDER_AMOUNT') {
          taskLabel = t('quest.taskType.orderAmount');
        } else if (taskType === 'SHARE') {
          taskLabel = t('quest.taskType.share');
        } else if (taskType === 'CREATE_GHOST_PIN') {
          taskLabel = t('quest.taskType.createGhostPin');
        } else {
          taskLabel = taskType;
        }
      }

      let rewardLabel = '';
      if (rewardType === 'POINTS') {
        rewardLabel = `+${rewardValue} ${t('quest.reward.points')}`;
      } else if (rewardType === 'BADGE') {
        rewardLabel = `${t('quest.reward.badge')} #${rewardValue}`;
      } else {
        rewardLabel = `${t('quest.reward.voucher')} #${rewardValue}`;
      }

      return {
        id: task.questTaskId,
        taskLabel,
        rewardType,
        rewardLabel,
        rewardValue,
      };
    });
  }, [quest, t]);

  const [rewardDetailsByTaskId, setRewardDetailsByTaskId] = useState<
    Record<
      number,
      {
        title?: string;
        subtitle?: string;
        extra?: string;
      }
    >
  >({});

  useEffect(() => {
    if (!rewardItems.length) {
      setRewardDetailsByTaskId({});
      return;
    }

    let isCancelled = false;

    const loadRewardDetails = async (): Promise<void> => {
      const entries = await Promise.all(
        rewardItems.map(async (item) => {
          if (item.rewardType === 'BADGE') {
            try {
              const badge = await axiosApi.questApi.getBadgeById(
                item.rewardValue
              );
              return [
                item.id,
                {
                  title: badge.badgeName,
                },
              ] as const;
            } catch {
              return [item.id, {}] as const;
            }
          }

          if (item.rewardType === 'VOUCHER') {
            try {
              const voucher = await axiosApi.questApi.getVoucherById(
                item.rewardValue
              );
              const isPercent = voucher.type.toUpperCase().includes('PERCENT');
              const discount = isPercent
                ? `${t('quest.reward.voucherOff')} ${voucher.discountValue}%`
                : `${t('quest.reward.voucherOff')} ${voucher.discountValue.toLocaleString('vi-VN')}đ`;
              return [
                item.id,
                {
                  title: voucher.name,
                  subtitle: discount,
                  extra: t('quest.reward.voucherRemain', {
                    count: voucher.remain,
                  }),
                },
              ] as const;
            } catch {
              return [item.id, {}] as const;
            }
          }

          return [item.id, {}] as const;
        })
      );

      if (!isCancelled) {
        setRewardDetailsByTaskId(Object.fromEntries(entries));
      }
    };

    void loadRewardDetails();

    return (): void => {
      isCancelled = true;
    };
  }, [rewardItems, t]);

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
  const daysLeft = Math.max(
    0,
    Math.ceil((new Date(campaign.endDate).getTime() - Date.now()) / 86400000)
  );
  const campaignStatusLabel =
    daysLeft === 0
      ? t('campaign.expired')
      : `${t('campaign.remaining', { count: daysLeft })}`;

  return (
    <SafeAreaView edges={['left', 'right']} className="flex-1 bg-gray-50">
      <Header
        title={t('campaign.system_detail')}
        onBackPress={(): void => navigation.goBack()}
      />

      <ScrollView
        className="flex-1"
        contentContainerStyle={{ paddingBottom: 100 }}
        showsVerticalScrollIndicator={false}
      >
        <View className="mx-4 mt-4 overflow-hidden rounded-3xl">
          <ImageBackground
            source={{ uri: campaign.imageUrl }}
            className="w-full"
            resizeMode="cover"
            style={{ minHeight: 260 }}
          >
            <LinearGradient
              colors={['rgba(0,0,0,0.12)', 'rgba(0,0,0,0.8)']}
              locations={[0, 0.72]}
              style={{ flex: 1, justifyContent: 'flex-end', padding: 18 }}
            >
              <View className="mb-3 flex-row items-center gap-2">
                <View className="self-start rounded-full bg-primary px-3 py-1">
                  <Text className="text-sm font-bold text-white">
                    {t('campaign.platform_event')}
                  </Text>
                </View>
                <View className="self-start rounded-full bg-black/35 px-3 py-1">
                  <Text className="text-sm font-semibold text-white">
                    {campaignStatusLabel}
                  </Text>
                </View>
              </View>

              <Text className="mb-3 text-3xl font-extrabold leading-9 text-white shadow-sm shadow-black">
                {campaign.name}
              </Text>

              <View className="self-start rounded-xl border border-white/20 bg-white/15 px-3 py-2">
                <View className="flex-row items-center">
                  <Ionicons name="calendar-outline" size={16} color="white" />
                  <Text className="ml-2 text-sm font-medium text-white/95">
                    {startDate} - {endDate}
                  </Text>
                </View>
              </View>
            </LinearGradient>
          </ImageBackground>
        </View>

        <View className="mx-4 mt-4 rounded-2xl border border-gray-100 bg-white p-4">
          <Text className="mb-2 text-sm font-semibold uppercase tracking-wide text-primary-dark">
            {t('campaign.system_detail')}
          </Text>
          <Text className="text-base leading-7 text-gray-700">
            {campaign.description}
          </Text>
        </View>

        <View className="px-4 pt-5">
          <Text className="mb-3 text-lg font-bold text-gray-900">
            {t('campaign.quest')}
          </Text>

          {questLoading ? (
            <View className="items-center rounded-2xl border border-gray-100 bg-white py-6">
              <ActivityIndicator size="small" color={COLORS.primary} />
            </View>
          ) : quest ? (
            <TouchableOpacity
              className="rounded-2xl border border-gray-100 bg-white p-4"
              activeOpacity={0.7}
              style={{
                shadowColor: '#000',
                shadowOffset: { width: 0, height: 6 },
                shadowOpacity: 0.08,
                shadowRadius: 10,
                elevation: 4,
              }}
              onPress={() =>
                navigation.navigate('QuestDetail', { questId: quest.questId })
              }
            >
              <View className="mb-2 mr-4 flex-row items-center justify-between">
                <View className="flex-row items-center">
                  <View className="rounded-xl bg-primary/10 p-2">
                    <Ionicons
                      name="trophy-outline"
                      size={18}
                      color={COLORS.primaryLight}
                    />
                  </View>
                  <Text className="ml-2 flex-1 text-base font-bold text-gray-900">
                    {quest.title}
                  </Text>
                </View>
                <Ionicons name="chevron-forward" size={18} color="#9CA3AF" />
              </View>

              {quest.description ? (
                <Text
                  className="mb-4 text-base leading-6 text-gray-600"
                  numberOfLines={2}
                >
                  {quest.description}
                </Text>
              ) : null}

              <View className="self-start rounded-full bg-gray-100 px-3 py-1.5">
                <View className="flex-row items-center">
                  <Ionicons name="list-outline" size={14} color="#6B7280" />
                  <Text className="ml-1 text-sm font-semibold text-gray-600">
                    {quest.taskCount} {t('quest.tasks')}
                  </Text>
                </View>
              </View>
            </TouchableOpacity>
          ) : (
            <View className="items-center rounded-2xl border border-dashed border-gray-200 bg-white px-4 py-6">
              <Ionicons name="sparkles-outline" size={22} color="#9CA3AF" />
              <Text className="mt-2 text-center text-base text-gray-500">
                {t('campaign.no_quest')}
              </Text>
            </View>
          )}
        </View>

        {rewardItems.length > 0 && (
          <View className="px-4 pt-5">
            <Text className="mb-3 text-lg font-bold text-gray-900">
              {t('quest.rewards')}
            </Text>
            <View className="gap-2">
              {rewardItems.map((item) => {
                const rewardUI = REWARD_UI_MAP[item.rewardType];
                const rewardDetail = rewardDetailsByTaskId[item.id];
                const rewardTitle = rewardDetail?.title ?? item.rewardLabel;
                const rewardTypeLabel =
                  item.rewardType === 'BADGE'
                    ? t('quest.reward.badge')
                    : item.rewardType === 'VOUCHER'
                      ? t('quest.reward.voucher')
                      : t('quest.reward.points');

                return (
                  <View
                    key={item.id}
                    className="rounded-2xl border border-gray-100 bg-white px-3.5 py-3"
                    style={{
                      shadowColor: '#000',
                      shadowOffset: { width: 0, height: 4 },
                      shadowOpacity: 0.05,
                      shadowRadius: 8,
                      elevation: 2,
                    }}
                  >
                    <View className="flex-row items-start">
                      <View
                        className={`rounded-xl p-2.5 ${rewardUI.bgClassName}`}
                      >
                        <Ionicons
                          name={rewardUI.icon}
                          size={18}
                          color={rewardUI.iconColor}
                        />
                      </View>

                      <View className="ml-3 flex-1">
                        <View
                          className={`self-start rounded-full px-2.5 py-0.5 ${rewardUI.bgClassName}`}
                        >
                          <Text
                            className={`text-xs font-semibold uppercase ${rewardUI.textClassName}`}
                          >
                            {rewardTypeLabel}
                          </Text>
                        </View>

                        <Text
                          className="mt-1 text-base font-bold text-gray-900"
                          numberOfLines={2}
                        >
                          {rewardTitle}
                        </Text>

                        {rewardDetail?.subtitle ? (
                          <Text
                            className="mt-1 text-sm text-gray-600"
                            numberOfLines={1}
                          >
                            {rewardDetail.subtitle}
                          </Text>
                        ) : null}

                        {rewardDetail?.extra ? (
                          <Text
                            className="mt-0.5 text-sm font-medium text-gray-500"
                            numberOfLines={1}
                          >
                            {rewardDetail.extra}
                          </Text>
                        ) : null}
                      </View>
                    </View>
                  </View>
                );
              })}
            </View>
          </View>
        )}
      </ScrollView>
    </SafeAreaView>
  );
};
