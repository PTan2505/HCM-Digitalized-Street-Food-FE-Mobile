import { Maps } from '@features/maps/components/Maps';
import {
  CARD_SPACING,
  CARD_WIDTH,
  VendorList,
} from '@features/maps/components/VendorList';
import MOCK_VENDORS from '@features/maps/constants/mockData';
import type { JSX } from 'react';
import React, { useRef, useState } from 'react';
import { FlatList, View, ViewToken } from 'react-native';
import MapView from 'react-native-maps';

export const MapScreen = (): JSX.Element => {
  const mapRef = useRef<MapView>(null);
  const flatListRef = useRef<FlatList>(null);
  const [selectedVendorId, setSelectedVendorId] = useState<string | null>(null);
  const isMarkerPressRef = useRef(false);

  const onViewableItemsChanged = useRef(
    ({ viewableItems }: { viewableItems: ViewToken[] }) => {
      if (viewableItems.length > 0) {
        const vendor = viewableItems[0].item;
        setSelectedVendorId(vendor.vendorId);

        // Only animate map if it's not from a marker press
        if (!isMarkerPressRef.current) {
          mapRef.current?.animateToRegion(
            {
              latitude: vendor.lat,
              longitude: vendor.long,
              latitudeDelta: 0.02,
              longitudeDelta: 0.02,
            },
            350
          );
        }
      }
    }
  ).current;

  const viewabilityConfig = useRef({
    itemVisiblePercentThreshold: 50,
  }).current;

  const onMarkerPress = (vendorId: string): void => {
    const index = MOCK_VENDORS.findIndex((v) => v.vendorId === vendorId);
    if (index !== -1) {
      const vendor = MOCK_VENDORS[index];
      setSelectedVendorId(vendorId);

      // Set flag to prevent onViewableItemsChanged from animating the map
      isMarkerPressRef.current = true;

      // Animate map directly to the vendor
      mapRef.current?.animateToRegion(
        {
          latitude: vendor.lat,
          longitude: vendor.long,
          latitudeDelta: 0.02,
          longitudeDelta: 0.02,
        },
        350
      );

      const offset = index * (CARD_WIDTH + CARD_SPACING);
      flatListRef.current?.scrollToOffset({
        offset,
        animated: true,
      });

      // Reset flag after scroll completes
      setTimeout(() => {
        isMarkerPressRef.current = false;
      }, 500);
    }
  };

  return (
    <View className="flex-1">
      <Maps
        mapRef={mapRef}
        selectedVendorId={selectedVendorId}
        onMarkerPress={onMarkerPress}
      />
      <VendorList
        ref={flatListRef}
        selectedVendorId={selectedVendorId}
        onViewableItemsChanged={onViewableItemsChanged}
        viewabilityConfig={viewabilityConfig}
      />
    </View>
  );
};
