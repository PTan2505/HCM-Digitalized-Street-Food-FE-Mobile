import type { Feedback } from '@features/customer/home/types/feedback';
import { StarRating } from '@features/manager/feedback/components/StarRating';
import {
  useCreateReply,
  useDeleteReply,
  useManagerFeedbackDetail,
  useUpdateReply,
} from '@features/manager/feedback/hooks/useManagerFeedback';
import { Ionicons } from '@expo/vector-icons';
import { useNavigation, useRoute } from '@react-navigation/native';
import type { NativeStackNavigationProp } from '@react-navigation/native-stack';
import type { TFunction } from 'i18next';
import React, { useCallback, useEffect, useMemo, useState } from 'react';
import { useTranslation } from 'react-i18next';
import {
  ActivityIndicator,
  Alert,
  Image,
  KeyboardAvoidingView,
  Platform,
  ScrollView,
  StyleSheet,
  Text,
  TextInput,
  TouchableOpacity,
  View,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

const MAX_REPLY_LENGTH = 500;

const formatTimeAgo = (createdAt: string, t: TFunction): string => {
  const diff = Date.now() - new Date(createdAt).getTime();
  const minutes = Math.floor(diff / 60_000);
  if (minutes < 1) return t('manager_feedback.just_now');
  if (minutes < 60) return `${String(minutes)} min`;
  const hours = Math.floor(minutes / 60);
  if (hours < 24) return `${String(hours)}h`;
  return `${String(Math.floor(hours / 24))}d`;
};

const getInitials = (name?: string): string => {
  if (!name) return '?';
  const parts = name.trim().split(' ');
  if (parts.length >= 2)
    return `${parts[0][0]}${parts[parts.length - 1][0]}`.toUpperCase();
  return name.slice(0, 2).toUpperCase();
};

interface ReviewSectionProps {
  feedback: Feedback;
}

const ReviewSection = ({ feedback }: ReviewSectionProps): React.JSX.Element => {
  const { t } = useTranslation();
  const hasImages = (feedback.images?.length ?? 0) > 0;

  return (
    <View className="mx-4 rounded-2xl bg-green-50 p-5">
      {/* User row */}
      <View className="mb-4 flex-row items-start justify-between">
        <View className="flex-row items-center gap-3">
          {feedback.user?.avatar ? (
            <Image
              source={{ uri: feedback.user.avatar }}
              className="h-10 w-10 rounded-full"
              style={styles.avatar}
            />
          ) : (
            <View className="h-10 w-10 items-center justify-center rounded-full bg-green-200">
              <Text className="text-sm font-bold text-green-800">
                {getInitials(feedback.user?.name)}
              </Text>
            </View>
          )}
          <View>
            <Text className="text-sm font-bold text-gray-900">
              {feedback.user?.name ?? '—'}
            </Text>
            <Text className="text-xs text-gray-400">
              {formatTimeAgo(feedback.createdAt, t)}
            </Text>
          </View>
        </View>
        <StarRating rating={feedback.rating} size="sm" />
      </View>

      {/* Comment */}
      <View className="rounded-xl bg-white p-4">
        {feedback.comment ? (
          <Text className="text-sm italic leading-relaxed text-gray-600">
            "{feedback.comment}"
          </Text>
        ) : (
          <Text className="text-sm italic text-gray-300">
            {t('manager_feedback.no_comment')}
          </Text>
        )}
      </View>

      {/* Images gallery */}
      {hasImages && (
        <ScrollView
          horizontal
          showsHorizontalScrollIndicator={false}
          contentContainerStyle={{ gap: 8, paddingTop: 12 }}
        >
          {feedback.images?.map((img) => (
            <Image
              key={img.id}
              source={{ uri: img.url }}
              style={styles.feedbackImage}
              className="rounded-xl"
            />
          ))}
        </ScrollView>
      )}

      {/* Tags */}
      {(feedback.tags?.length ?? 0) > 0 && (
        <View className="mt-3 flex-row flex-wrap gap-2">
          {feedback.tags?.map((tag) => (
            <View key={tag.id} className="rounded-full bg-green-100 px-3 py-1">
              <Text className="text-xs font-semibold text-green-800">
                {tag.name}
              </Text>
            </View>
          ))}
        </View>
      )}

      {/* Votes */}
      <View className="mt-3 flex-row items-center gap-4 border-t border-green-100 pt-3">
        <View className="flex-row items-center gap-1">
          <Ionicons name="thumbs-up" size={16} color="#9FD356" />
          <Text className="text-sm font-semibold text-gray-600">
            {feedback.upVotes}
          </Text>
        </View>
        <View className="flex-row items-center gap-1">
          <Ionicons name="thumbs-down" size={16} color="#f87171" />
          <Text className="text-sm font-semibold text-gray-600">
            {feedback.downVotes}
          </Text>
        </View>
        <Text
          className={`min-w-[16px] text-center text-sm font-semibold ${
            feedback.upVotes - feedback.downVotes > 0
              ? 'text-primary'
              : feedback.upVotes - feedback.downVotes < 0
                ? 'text-red-400'
                : 'text-gray-400'
          }`}
        >
          {feedback.upVotes - feedback.downVotes > 0 ? '+' : ''}
          {feedback.upVotes - feedback.downVotes}
        </Text>
      </View>
    </View>
  );
};

export const ManagerFeedbackDetailScreen = (): React.JSX.Element => {
  const { t } = useTranslation();
  const navigation =
    useNavigation<NativeStackNavigationProp<ReactNavigation.RootParamList>>();
  const route = useRoute();
  const { feedbackId } = route.params as { feedbackId: number };

  const { feedback, isLoading } = useManagerFeedbackDetail(feedbackId);
  const createReply = useCreateReply();
  const updateReply = useUpdateReply();
  const deleteReply = useDeleteReply();

  const [replyText, setReplyText] = useState('');
  const [isEditing, setIsEditing] = useState(false);

  const existingReply = feedback?.vendorReply;
  const showComposeArea = !existingReply || isEditing;
  const isMutating =
    createReply.isPending || updateReply.isPending || deleteReply.isPending;

  useEffect(() => {
    if (isEditing && existingReply) {
      setReplyText(existingReply.content);
    }
  }, [isEditing, existingReply]);

  const handleSend = useCallback((): void => {
    const trimmed = replyText.trim();
    if (!trimmed) {
      Alert.alert('', t('manager_feedback.reply_empty_error'));
      return;
    }
    if (isEditing && existingReply) {
      updateReply.mutate(
        { feedbackId, content: trimmed },
        {
          onSuccess: () => {
            setIsEditing(false);
            setReplyText('');
          },
        }
      );
    } else {
      createReply.mutate(
        { feedbackId, content: trimmed },
        {
          onSuccess: () => {
            setReplyText('');
          },
        }
      );
    }
  }, [
    replyText,
    isEditing,
    existingReply,
    feedbackId,
    createReply,
    updateReply,
    t,
  ]);

  const handleDelete = useCallback((): void => {
    Alert.alert(
      t('manager_feedback.confirm_delete'),
      t('manager_feedback.confirm_delete_message'),
      [
        { text: t('manager_feedback.cancel'), style: 'cancel' },
        {
          text: t('manager_feedback.delete'),
          style: 'destructive',
          onPress: (): void => {
            deleteReply.mutate({ feedbackId });
          },
        },
      ]
    );
  }, [feedbackId, deleteReply, t]);

  const handleCancel = useCallback((): void => {
    if (isEditing) {
      setIsEditing(false);
      setReplyText('');
    } else {
      navigation.goBack();
    }
  }, [isEditing, navigation]);

  const QUICK_REPLIES = useMemo(
    () => [
      t('manager_feedback.quick_apologize'),
      t('manager_feedback.quick_thank_you'),
      t('manager_feedback.quick_contact_us'),
    ],
    [t]
  );

  const appendQuickReply = useCallback((text: string): void => {
    setReplyText((prev) => (prev ? `${prev} ${text}` : text));
  }, []);

  return (
    <SafeAreaView edges={['top']} className="flex-1 bg-white">
      {/* Header */}
      <View className="flex-row items-center justify-between border-b border-gray-100 px-2 py-2">
        <TouchableOpacity
          activeOpacity={0.7}
          className="rounded-full p-2"
          onPress={() => {
            navigation.goBack();
          }}
        >
          <Text className="text-2xl text-gray-700">←</Text>
        </TouchableOpacity>
        <Text className="text-base font-extrabold text-gray-900">
          {t('manager_feedback.title')}
        </Text>
        {existingReply && !isEditing ? (
          <TouchableOpacity
            activeOpacity={0.7}
            className="rounded-full p-2"
            onPress={(): void => {
              Alert.alert('', '', [
                {
                  text: t('manager_feedback.edit_reply'),
                  onPress: (): void => {
                    setIsEditing(true);
                  },
                },
                {
                  text: t('manager_feedback.delete_reply'),
                  style: 'destructive',
                  onPress: handleDelete,
                },
                { text: t('manager_feedback.cancel'), style: 'cancel' },
              ]);
            }}
          >
            <Text className="text-xl text-gray-600">⋮</Text>
          </TouchableOpacity>
        ) : (
          <View className="w-10" />
        )}
      </View>

      <KeyboardAvoidingView
        behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
        style={styles.flex}
      >
        <ScrollView
          contentContainerStyle={{ paddingVertical: 20, gap: 20 }}
          keyboardShouldPersistTaps="handled"
          showsVerticalScrollIndicator={false}
        >
          {isLoading || !feedback ? (
            <View className="items-center py-12">
              <ActivityIndicator size="large" color="#9FD356" />
            </View>
          ) : (
            <>
              {/* Original review */}
              <ReviewSection feedback={feedback} />

              {/* Existing reply display */}
              {existingReply && !isEditing && (
                <View className="mx-4 rounded-2xl border border-gray-100 bg-white p-5 shadow-sm">
                  <View className="mb-3 flex-row items-center justify-between">
                    <Text className="text-sm font-bold text-gray-700">
                      ✓ {t('manager_feedback.replied')}
                    </Text>
                    <Text className="text-xs text-gray-400">
                      {formatTimeAgo(existingReply.createdAt, t)}
                    </Text>
                  </View>
                  <Text className="text-sm leading-relaxed text-gray-700">
                    {existingReply.content}
                  </Text>
                  <View className="mt-4 flex-row gap-3 border-t border-gray-100 pt-3">
                    <TouchableOpacity
                      activeOpacity={0.8}
                      className="flex-1 items-center rounded-full border border-gray-200 py-2"
                      onPress={(): void => {
                        setIsEditing(true);
                      }}
                    >
                      <Text className="text-sm font-semibold text-gray-600">
                        {t('manager_feedback.edit_reply')}
                      </Text>
                    </TouchableOpacity>
                    <TouchableOpacity
                      activeOpacity={0.8}
                      className="flex-1 items-center rounded-full bg-red-50 py-2"
                      onPress={handleDelete}
                    >
                      <Text className="text-sm font-semibold text-red-600">
                        {t('manager_feedback.delete_reply')}
                      </Text>
                    </TouchableOpacity>
                  </View>
                </View>
              )}

              {/* Compose area */}
              {showComposeArea && (
                <View className="mx-4 gap-3">
                  <Text className="pl-1 text-sm font-semibold text-gray-800">
                    {isEditing
                      ? t('manager_feedback.edit_reply')
                      : t('manager_feedback.reply')}
                  </Text>

                  {/* Textarea */}
                  <View className="rounded-2xl bg-green-50 p-4">
                    <TextInput
                      multiline
                      value={replyText}
                      onChangeText={setReplyText}
                      placeholder={t('manager_feedback.reply_placeholder')}
                      placeholderTextColor="#9ca3af"
                      maxLength={MAX_REPLY_LENGTH}
                      style={styles.textInput}
                      className="text-sm text-gray-900"
                    />
                    <Text className="mt-2 text-right text-xs text-gray-400">
                      {replyText.length} / {MAX_REPLY_LENGTH}
                    </Text>
                  </View>

                  {/* Quick reply chips */}
                  <ScrollView
                    horizontal
                    showsHorizontalScrollIndicator={false}
                    contentContainerStyle={{ gap: 8 }}
                  >
                    {QUICK_REPLIES.map((text) => (
                      <TouchableOpacity
                        key={text}
                        activeOpacity={0.8}
                        className="rounded-full bg-orange-100 px-4 py-2"
                        onPress={(): void => {
                          appendQuickReply(text);
                        }}
                      >
                        <Text className="text-xs font-semibold text-orange-700">
                          {text}
                        </Text>
                      </TouchableOpacity>
                    ))}
                  </ScrollView>

                  {/* Actions */}
                  <View className="mt-2 flex-row gap-4">
                    <TouchableOpacity
                      activeOpacity={0.8}
                      className="flex-1 items-center rounded-full border border-gray-200 py-4"
                      onPress={handleCancel}
                    >
                      <Text className="text-sm font-bold text-gray-600">
                        {t('manager_feedback.cancel')}
                      </Text>
                    </TouchableOpacity>
                    <TouchableOpacity
                      activeOpacity={0.8}
                      disabled={isMutating || replyText.trim().length === 0}
                      className="flex-[2] items-center rounded-full bg-primary py-4"
                      style={
                        isMutating || replyText.trim().length === 0
                          ? { opacity: 0.5 }
                          : undefined
                      }
                      onPress={handleSend}
                    >
                      {isMutating ? (
                        <ActivityIndicator size="small" color="#fff" />
                      ) : (
                        <Text className="text-sm font-bold text-white">
                          {isEditing
                            ? t('manager_feedback.update')
                            : t('manager_feedback.send')}
                        </Text>
                      )}
                    </TouchableOpacity>
                  </View>
                </View>
              )}
            </>
          )}
        </ScrollView>
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  flex: { flex: 1 },
  avatar: { width: 40, height: 40, borderRadius: 20 },
  feedbackImage: { width: 120, height: 120 },
  textInput: {
    minHeight: 120,
    textAlignVertical: 'top',
    fontSize: 14,
    lineHeight: 20,
  },
});
