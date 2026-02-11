import type { JSX } from 'react';
import { useState, useEffect } from 'react';
import { useTranslation } from 'react-i18next';
import {
  View,
  Text,
  ScrollView,
  Image,
  TouchableOpacity,
  ActivityIndicator,
  type ImageSourcePropType,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import LanguageIdentificationModule from '@modules/language-identification-module';
import TranslationModule from '@modules/translation-module';

export interface Review {
  id: string;
  userName: string;
  date: string;
  rating: number;
  comment: string;
  images: ImageSourcePropType[];
}

interface ReviewCardProps {
  review: Review;
}

const ReviewCard = ({ review }: ReviewCardProps): JSX.Element => {
  const { t, i18n } = useTranslation();
  const [translatedComment, setTranslatedComment] = useState<string | null>(
    null
  );
  const [showTranslation, setShowTranslation] = useState(false);
  const [isTranslating, setIsTranslating] = useState(false);
  const [canTranslate, setCanTranslate] = useState(false);
  const [detectedLanguage, setDetectedLanguage] = useState<string | null>(null);

  const currentLanguage = i18n.language;

  // Check if the comment is in a different language and can be translated
  useEffect(() => {
    const checkLanguage = async (): Promise<void> => {
      try {
        const detected = await LanguageIdentificationModule.identifyLanguage(
          review.comment
        );
        setDetectedLanguage(detected);

        // Show translate button if:
        // - App is in Vietnamese and comment is in English
        // - Or App is in English and comment is in Vietnamese
        if (
          (currentLanguage === 'vi' && detected === 'en') ||
          (currentLanguage === 'en' && detected === 'vi')
        ) {
          setCanTranslate(true);
        } else {
          setCanTranslate(false);
        }
      } catch (error) {
        console.error('Error identifying language:', error);
        setCanTranslate(false);
      }
    };

    checkLanguage();
  }, [review.comment, currentLanguage]);

  // Reset translation when language changes
  useEffect(() => {
    setTranslatedComment(null);
    setShowTranslation(false);
  }, [currentLanguage]);

  const handleTranslate = async (): Promise<void> => {
    if (translatedComment) {
      // Toggle between original and translated
      setShowTranslation(!showTranslation);
      return;
    }

    setIsTranslating(true);
    try {
      const sourceLanguage = detectedLanguage ?? 'en';
      const targetLanguage = currentLanguage;

      const translated = await TranslationModule.translate(
        review.comment,
        sourceLanguage,
        targetLanguage
      );
      setTranslatedComment(translated);
      setShowTranslation(true);
    } catch (error) {
      console.error('Error translating:', error);
    } finally {
      setIsTranslating(false);
    }
  };

  const displayComment = showTranslation ? translatedComment : review.comment;
  const translateButtonText = showTranslation
    ? t('actions.see_original')
    : t('actions.see_translation');

  return (
    <View
      className="mx-2 rounded-2xl bg-white p-4"
      style={{
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.1,
        shadowRadius: 8,
        elevation: 3,
        minHeight: 220,
      }}
    >
      <View className="mb-3 flex-row items-center">
        <View className="mr-3">
          <Ionicons name="person-circle-outline" size={40} color="#ccc" />
        </View>
        <View className="flex-1">
          <Text className="mb-0.5 text-[15px] font-semibold text-black">
            {review.userName || t('user')}
          </Text>
          <Text className="text-xs text-gray-400">{review.date}</Text>
        </View>
        <View className="flex-row items-center gap-1">
          <Text className="text-sm font-semibold text-black">
            {review.rating}
          </Text>
          <Ionicons name="star" size={14} color="#FFA500" />
        </View>
      </View>

      <Text className="mb-1 text-sm leading-5 text-gray-700" numberOfLines={3}>
        {displayComment}
      </Text>

      {/* Translate Button */}
      {canTranslate && (
        <TouchableOpacity
          onPress={handleTranslate}
          disabled={isTranslating}
          className="mb-2 flex-row items-center"
        >
          {isTranslating ? (
            <ActivityIndicator size="small" color="#06AA4C" />
          ) : (
            <>
              <Ionicons name="language-outline" size={14} color="#06AA4C" />
              <Text className="ml-1 text-xs font-medium text-[#06AA4C]">
                {translateButtonText}
              </Text>
            </>
          )}
        </TouchableOpacity>
      )}

      <ScrollView
        horizontal
        showsHorizontalScrollIndicator={false}
        className="flex-row"
      >
        {review.images.map((img, index) => (
          <Image
            key={index}
            source={img}
            className="mr-2 h-20 w-20 rounded-lg"
          />
        ))}
      </ScrollView>
    </View>
  );
};

export default ReviewCard;
