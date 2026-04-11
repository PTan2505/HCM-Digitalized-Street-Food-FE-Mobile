import AppLogo from '@assets/logos/lowcaLogo.svg';
import { COLORS } from '@constants/colors';
import { Ionicons } from '@expo/vector-icons';
import type { ActiveBranch } from '@features/home/types/branch';
import type { JSX } from 'react';
import { Image, Text, View } from 'react-native';

interface ShareCardProps {
  branch: ActiveBranch;
  displayName: string;
  thumbnailUrl?: string;
}

const StarRating = ({ rating }: { rating: number }): JSX.Element => {
  const stars = [1, 2, 3, 4, 5];
  return (
    <View style={{ flexDirection: 'row', gap: 2, alignItems: 'center' }}>
      {stars.map((s) => (
        <Ionicons
          key={s}
          name={s <= Math.round(rating) ? 'star' : 'star-outline'}
          size={14}
          color="#FFD700"
        />
      ))}
      <Text
        style={{
          color: '#fff',
          fontSize: 13,
          marginLeft: 4,
          fontWeight: '600',
        }}
      >
        {rating.toFixed(1)}
      </Text>
    </View>
  );
};

const ShareCard = ({
  branch,
  displayName,
  thumbnailUrl,
}: ShareCardProps): JSX.Element => {
  const address = [branch.addressDetail, branch.ward, branch.city]
    .filter(Boolean)
    .join(', ');

  return (
    <View
      style={{
        width: 320,
        borderRadius: 20,
        overflow: 'hidden',
        backgroundColor: '#1a1a1a',
      }}
    >
      {/* Hero image */}
      {thumbnailUrl ? (
        <Image
          source={{ uri: thumbnailUrl }}
          style={{ width: 320, height: 200 }}
          resizeMode="cover"
        />
      ) : (
        <View style={{ width: 320, height: 200, backgroundColor: '#2a2a2a' }} />
      )}

      {/* Gradient overlay + info */}
      <View
        style={{
          position: 'absolute',
          bottom: 0,
          left: 0,
          right: 0,
          top: 80,
          padding: 16,
          justifyContent: 'flex-end',
          backgroundColor: 'rgba(0,0,0,0.55)',
        }}
      >
        <Text
          style={{
            color: '#fff',
            fontSize: 20,
            fontWeight: '700',
            marginBottom: 4,
          }}
          numberOfLines={2}
        >
          {displayName}
        </Text>

        <StarRating rating={branch.avgRating} />

        <View
          style={{
            flexDirection: 'row',
            alignItems: 'flex-start',
            marginTop: 8,
            gap: 4,
          }}
        >
          <Ionicons
            name="location-outline"
            size={14}
            color="#ccc"
            style={{ marginTop: 1 }}
          />
          <Text
            style={{ color: '#ccc', fontSize: 12, flex: 1, lineHeight: 18 }}
            numberOfLines={2}
          >
            {address}
          </Text>
        </View>
      </View>

      {/* Footer branding */}
      <View
        style={{
          backgroundColor: '#111',
          flexDirection: 'row',
          alignItems: 'center',
          justifyContent: 'space-between',
          paddingHorizontal: 16,
          paddingVertical: 12,
        }}
      >
        <View style={{ flexDirection: 'row', alignItems: 'center', gap: 8 }}>
          <AppLogo width={28} height={28} />
          <Text style={{ color: '#fff', fontSize: 14, fontWeight: '600' }}>
            Lowca
          </Text>
        </View>
        <Text style={{ color: COLORS.primary, fontSize: 11 }}>
          lowca://restaurant/{branch.branchId}
        </Text>
      </View>
    </View>
  );
};

export default ShareCard;
