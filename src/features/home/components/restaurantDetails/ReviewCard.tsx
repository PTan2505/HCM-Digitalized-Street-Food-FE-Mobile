import { Ionicons } from '@expo/vector-icons';
import type { JSX } from 'react';
import { useRef, useState } from 'react';
import { useTranslation } from 'react-i18next';
import {
  Alert,
  Image,
  Modal,
  Pressable,
  ScrollView,
  Text,
  TouchableOpacity,
  View,
} from 'react-native';

export interface ReviewTag {
  id: number;
  name: string;
}

export interface Review {
  id: string;
  feedbackId: number;
  userName: string;
  avatar?: string;
  date: string;
  time: string;
  rating: number;
  comment: string;
  imageUris: string[];
  tags: ReviewTag[];
  isOwn: boolean;
}

interface ReviewCardProps {
  review: Review;
  onEdit?: () => void;
  onDelete?: (feedbackId: number) => void;
}

const ReviewCard = ({
  review,
  onEdit,
  onDelete,
}: ReviewCardProps): JSX.Element => {
  const { t } = useTranslation();
  const [showMenu, setShowMenu] = useState(false);
  const [menuPosition, setMenuPosition] = useState({ x: 0, y: 0 });
  const buttonRef = useRef<View>(null);

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

  const handleDelete = (): void => {
    setShowMenu(false);
    Alert.alert('Xoá đánh giá', 'Bạn có chắc muốn xoá đánh giá này?', [
      { text: 'Huỷ', style: 'cancel' },
      {
        text: 'Xoá',
        style: 'destructive',
        onPress: (): void => onDelete?.(review.feedbackId),
      },
    ]);
  };

  const handleEdit = (): void => {
    setShowMenu(false);
    onEdit?.();
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
        borderColor: review.isOwn ? '#9FD356' : 'transparent',
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
          <View className="flex-row items-center gap-1.5">
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
          </View>
          <Text className="text-xs text-gray-400">{review.date}</Text>
        </View>

        {/* Rating + own actions */}
        <View className="items-end gap-1.5">
          {review.isOwn && (
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
                        className="flex-row items-center gap-3 border-b border-gray-100 px-4 py-3"
                      >
                        <Ionicons
                          name="pencil-outline"
                          size={18}
                          color="#6B7280"
                        />
                        <Text className="text-sm font-medium text-gray-700">
                          Chỉnh sửa
                        </Text>
                      </TouchableOpacity>

                      {/* Delete Option */}
                      <TouchableOpacity
                        onPress={handleDelete}
                        className="flex-row items-center gap-3 px-4 py-3"
                      >
                        <Ionicons
                          name="trash-outline"
                          size={18}
                          color="#EF4444"
                        />
                        <Text className="text-sm font-medium text-red-500">
                          Xoá
                        </Text>
                      </TouchableOpacity>
                    </View>
                  </View>
                </View>
              </Modal>
            </View>
          )}
        </View>
      </View>

      {/* Stars */}
      <View className="mb-2 flex-row items-center gap-1">{renderStars()}</View>

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
      <Text className="mb-3 text-sm leading-5 text-gray-700">
        {review.comment}
      </Text>

      {/* Images */}
      {review.imageUris.length > 0 && (
        <ScrollView
          horizontal
          showsHorizontalScrollIndicator={false}
          className="flex-row"
        >
          {review.imageUris.map((uri, index) => (
            <Image
              key={index}
              source={{ uri }}
              className="mr-2 h-20 w-20 rounded-xl"
            />
          ))}
        </ScrollView>
      )}
    </View>
  );
};

export default ReviewCard;
