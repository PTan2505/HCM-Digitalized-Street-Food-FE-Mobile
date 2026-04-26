import { COLORS } from '@constants/colors';
import { Ionicons } from '@expo/vector-icons';
import type { JSX } from 'react';
import { useRef, useState } from 'react';
import { useTranslation } from 'react-i18next';
import {
  Animated,
  Dimensions,
  FlatList,
  Image,
  Modal,
  PanResponder,
  Pressable,
  ScrollView,
  Text,
  TouchableOpacity,
  View,
} from 'react-native';

const BADGE_SIZE = 16;

const SCREEN_WIDTH = Dimensions.get('window').width;
const CLOSE_THRESHOLD = 100;

export interface ReviewTag {
  id: number;
  name: string;
}

export interface Review {
  id: string;
  feedbackId: number;
  userName: string;
  avatar?: string;
  selectedBadge?: {
    name: string;
    iconUrl: string;
  };
  date: string;
  time: string;
  rating: number;
  comment: string;
  imageUris: string[];
  tags: ReviewTag[];
  isOwn: boolean;
  editable: boolean;
  dishName?: string;
  upVotes: number;
  downVotes: number;
  userVote: 'up' | 'down' | null;
  vendorName?: string;
  vendorReply?: {
    content: string;
    repliedBy: string;
    createdAt: string;
  };
}

interface ReviewCardProps {
  review: Review;
  onEdit?: (feedbackId: number) => void;
  onDelete?: (feedbackId: number) => void;
  onVote?: (feedbackId: number, voteType: 'up' | 'down') => void;
}

const ReviewCard = ({
  review,
  onEdit,
  onVote,
}: ReviewCardProps): JSX.Element => {
  const { t } = useTranslation();
  const [showMenu, setShowMenu] = useState(false);
  const [menuPosition, setMenuPosition] = useState({ x: 0, y: 0 });
  const buttonRef = useRef<View>(null);
  const [lightboxOpen, setLightboxOpen] = useState(false);
  const [lightboxIndex, setLightboxIndex] = useState(0);
  const lightboxRef = useRef<FlatList<string>>(null);
  const translateY = useRef(new Animated.Value(0)).current;

  const panResponder = useRef(
    PanResponder.create({
      onMoveShouldSetPanResponder: (_, { dy, dx }) =>
        Math.abs(dy) > Math.abs(dx) && dy > 5,
      onPanResponderMove: (_, { dy }) => {
        if (dy > 0) translateY.setValue(dy);
      },
      onPanResponderRelease: (_, { dy }) => {
        if (dy > CLOSE_THRESHOLD) {
          Animated.timing(translateY, {
            toValue: 600,
            duration: 200,
            useNativeDriver: true,
          }).start(() => {
            setLightboxOpen(false);
            translateY.setValue(0);
          });
        } else {
          Animated.spring(translateY, {
            toValue: 0,
            useNativeDriver: true,
          }).start();
        }
      },
    })
  ).current;

  const openLightbox = (index: number): void => {
    setLightboxIndex(index);
    setLightboxOpen(true);
    translateY.setValue(0);
    setTimeout(() => {
      lightboxRef.current?.scrollToIndex({ index, animated: false });
    }, 50);
  };

  const closeLightbox = (): void => {
    setLightboxOpen(false);
    translateY.setValue(0);
  };

  const handleOpenMenu = (): void => {
    buttonRef.current?.measure(
      (
        fx: number,
        fy: number,
        width: number,
        height: number,
        px: number,
        py: number
      ) => {
        setMenuPosition({
          x: px + width,
          y: py + height + 4,
        });
        setShowMenu(true);
      }
    );
  };

  const handleEdit = (): void => {
    setShowMenu(false);
    onEdit?.(review.feedbackId);
  };

  // Render star icons based on rating
  const renderStars = (): JSX.Element[] => {
    const stars: JSX.Element[] = [];
    const fullStars = Math.floor(review.rating);
    const hasHalfStar = review.rating % 1 >= 0.5;

    // Full stars
    for (let i = 0; i < fullStars; i++) {
      stars.push(
        <Ionicons key={`full-${i}`} name="star" size={14} color="#FFA500" />
      );
    }

    // Half star
    if (hasHalfStar && fullStars < 5) {
      stars.push(
        <Ionicons key="half" name="star-half" size={14} color="#FFA500" />
      );
    }

    // Empty stars
    const emptyStars = 5 - fullStars - (hasHalfStar ? 1 : 0);
    for (let i = 0; i < emptyStars; i++) {
      stars.push(
        <Ionicons
          key={`empty-${i}`}
          name="star-outline"
          size={14}
          color="#FFA500"
        />
      );
    }

    return stars;
  };

  return (
    <View
      className="mx-2 rounded-2xl bg-white p-4"
      style={{
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.08,
        shadowRadius: 10,
        elevation: 3,
        borderWidth: review.isOwn ? 1.5 : 0,
        borderColor: review.isOwn ? COLORS.primary : 'transparent',
      }}
    >
      {/* Header */}
      <View className="mb-3 flex-row items-center">
        {/* Avatar */}
        <View className="mr-3">
          {review.avatar ? (
            <Image
              source={{ uri: review.avatar }}
              className="h-10 w-10 rounded-full"
            />
          ) : (
            <View className="h-10 w-10 items-center justify-center rounded-full bg-gray-100">
              <Ionicons name="person" size={22} color="#9CA3AF" />
            </View>
          )}
        </View>

        <View className="flex-1">
          <View className="flex-row flex-wrap items-center gap-1.5">
            <Text
              className="text-[15px] font-semibold text-black"
              numberOfLines={1}
            >
              {review.userName || t('user')}
            </Text>
            {review.isOwn && (
              <View className="rounded-full bg-primary px-1.5 py-0.5">
                <Text className="text-[10px] font-bold text-white">Bạn</Text>
              </View>
            )}
            {review.selectedBadge && (
              <View className="flex-row items-center gap-1 rounded-full border border-primary/30 bg-primary/10 px-1.5 py-0.5">
                <Image
                  source={{ uri: review.selectedBadge.iconUrl }}
                  style={{ width: BADGE_SIZE, height: BADGE_SIZE }}
                  className="rounded-full"
                />
                <Text className="text-[10px] font-semibold text-primary-dark">
                  {review.selectedBadge.name}
                </Text>
              </View>
            )}
          </View>
          <Text className="text-sm text-gray-400">{review.date}</Text>
          <Text
            className={`text-sm font-semibold ${
              review.upVotes - review.downVotes > 0
                ? 'text-primary-light'
                : review.upVotes - review.downVotes < 0
                  ? 'text-red-400'
                  : 'text-gray-400'
            }`}
          >
            {review.upVotes - review.downVotes} votes
          </Text>
        </View>

        {/* Rating + own actions */}
        <View className="items-end gap-1.5">
          {review.isOwn ? (
            <View ref={buttonRef} collapsable={false}>
              <TouchableOpacity
                onPress={handleOpenMenu}
                hitSlop={8}
                className="rounded-full p-1"
              >
                <Ionicons name="ellipsis-vertical" size={18} color="#6B7280" />
              </TouchableOpacity>

              {/* Dropdown Menu Modal */}
              <Modal
                visible={showMenu}
                transparent
                animationType="fade"
                onRequestClose={() => setShowMenu(false)}
              >
                <View className="flex-1">
                  {/* Backdrop */}
                  <Pressable
                    className="absolute inset-0"
                    onPress={() => setShowMenu(false)}
                  />

                  {/* Dropdown positioned next to button */}
                  <View
                    style={{
                      position: 'absolute',
                      top: menuPosition.y,
                      right: 16,
                    }}
                  >
                    <View
                      className="rounded-xl bg-white"
                      style={{
                        shadowColor: '#000',
                        shadowOffset: { width: 0, height: 2 },
                        shadowOpacity: 0.25,
                        shadowRadius: 8,
                        elevation: 5,
                        minWidth: 140,
                      }}
                    >
                      {/* Edit Option */}
                      <TouchableOpacity
                        onPress={handleEdit}
                        disabled={!review.editable}
                        className="flex-row items-center gap-3 border-gray-100 px-4 py-3 disabled:opacity-30"
                      >
                        <Ionicons
                          name="pencil-outline"
                          size={18}
                          color="#6B7280"
                        />
                        <Text className="text-base font-medium text-gray-700">
                          {t('review.edit')}
                        </Text>
                      </TouchableOpacity>
                    </View>
                  </View>
                </View>
              </Modal>
            </View>
          ) : (
            <View className="flex-row items-center gap-2">
              <TouchableOpacity
                onPress={() => onVote?.(review.feedbackId, 'up')}
                hitSlop={6}
              >
                <Ionicons
                  name={
                    review.userVote === 'up' ? 'thumbs-up' : 'thumbs-up-outline'
                  }
                  size={18}
                  color={
                    review.userVote === 'up' ? COLORS.primaryLight : '#9CA3AF'
                  }
                />
              </TouchableOpacity>
              <Text
                className={`min-w-[16px] text-center text-sm font-semibold ${
                  review.upVotes - review.downVotes > 0
                    ? 'text-primary-light'
                    : review.upVotes - review.downVotes < 0
                      ? 'text-red-400'
                      : 'text-gray-400'
                }`}
              >
                {review.upVotes - review.downVotes}
              </Text>
              <TouchableOpacity
                onPress={() => onVote?.(review.feedbackId, 'down')}
                hitSlop={6}
              >
                <Ionicons
                  name={
                    review.userVote === 'down'
                      ? 'thumbs-down'
                      : 'thumbs-down-outline'
                  }
                  size={18}
                  color={review.userVote === 'down' ? '#EF4444' : '#9CA3AF'}
                />
              </TouchableOpacity>
            </View>
          )}
        </View>
      </View>

      {/* Stars */}
      <View className="mb-2 flex-row items-center gap-1">{renderStars()}</View>

      {/* Dish name */}
      {review.dishName ? (
        <View className="mb-2 flex-row items-center gap-1">
          <Ionicons name="restaurant-outline" size={13} color="#9CA3AF" />
          <Text className="text-sm text-gray-400">{review.dishName}</Text>
        </View>
      ) : null}

      {/* Tags */}
      {review.tags.length > 0 && (
        <View className="mb-2 flex-row flex-wrap gap-1.5">
          {review.tags.map((tag) => (
            <View
              key={tag.id}
              className="rounded-full border border-primary/40 bg-primary/10 px-2.5 py-0.5"
            >
              <Text className="text-[11px] font-medium text-primary-dark">
                {tag.name}
              </Text>
            </View>
          ))}
        </View>
      )}

      {/* Comment */}
      <Text className="mb-3 text-base leading-5 text-gray-700">
        {review.comment}
      </Text>

      {/* Images */}
      {review.imageUris.length > 0 && (
        <>
          <ScrollView
            horizontal
            showsHorizontalScrollIndicator={false}
            className="mb-3 flex-row"
          >
            {review.imageUris.map((uri, index) => (
              <TouchableOpacity
                key={index}
                onPress={() => openLightbox(index)}
                activeOpacity={0.85}
              >
                <Image source={{ uri }} className="mr-2 h-20 w-20 rounded-xl" />
              </TouchableOpacity>
            ))}
          </ScrollView>

          {/* Lightbox Modal */}
          <Modal
            visible={lightboxOpen}
            transparent
            animationType="fade"
            onRequestClose={closeLightbox}
            statusBarTranslucent
          >
            <Animated.View
              className="flex-1 bg-black"
              style={{ transform: [{ translateY }] }}
              {...panResponder.panHandlers}
            >
              {/* Close button */}
              <TouchableOpacity
                onPress={closeLightbox}
                className="absolute right-4 top-12 z-10 rounded-full bg-black/50 p-2"
                hitSlop={8}
              >
                <Ionicons name="close" size={24} color="#fff" />
              </TouchableOpacity>

              {/* Page indicator */}
              <View className="absolute bottom-10 z-10 w-full items-center">
                <Text className="text-base font-semibold text-white/80">
                  {lightboxIndex + 1} / {review.imageUris.length}
                </Text>
              </View>

              <FlatList
                ref={lightboxRef}
                data={review.imageUris}
                keyExtractor={(_, i) => String(i)}
                horizontal
                pagingEnabled
                showsHorizontalScrollIndicator={false}
                initialScrollIndex={lightboxIndex}
                getItemLayout={(_, i) => ({
                  length: SCREEN_WIDTH,
                  offset: SCREEN_WIDTH * i,
                  index: i,
                })}
                onMomentumScrollEnd={(e) => {
                  const idx = Math.round(
                    e.nativeEvent.contentOffset.x / SCREEN_WIDTH
                  );
                  setLightboxIndex(idx);
                }}
                renderItem={({ item }) => (
                  <View
                    style={{ width: SCREEN_WIDTH }}
                    className="items-center justify-center"
                  >
                    <Image
                      source={{ uri: item }}
                      style={{ width: SCREEN_WIDTH, height: '70%' }}
                      resizeMode="contain"
                    />
                  </View>
                )}
              />
            </Animated.View>
          </Modal>
        </>
      )}

      {/* Vendor Reply */}
      {review.vendorReply ? (
        <View className="rounded-xl bg-gray-50 p-3">
          <Text className="text-[10px] text-gray-400">
            {new Date(review.vendorReply.createdAt).toLocaleDateString('vi-VN')}
          </Text>
          <View className="mb-1.5 flex-row items-center gap-1.5">
            <Ionicons
              name="storefront-outline"
              size={14}
              color={COLORS.primaryLight}
            />
            <Text className="text-sm font-bold text-primary-light">
              {review.vendorName ?? review.vendorReply.repliedBy}
            </Text>
          </View>
          <Text className="text-base leading-4 text-gray-600">
            {review.vendorReply.content}
          </Text>
        </View>
      ) : null}
    </View>
  );
};

export default ReviewCard;
