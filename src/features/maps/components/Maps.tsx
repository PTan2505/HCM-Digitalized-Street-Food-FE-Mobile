import mapStyle from '@features/maps/assets/mapStyle.json';
import MOCK_VENDORS from '@features/maps/constants/mockData';
import React, { JSX } from 'react';
import { StyleSheet, View } from 'react-native';
import MapView, { Marker, PROVIDER_GOOGLE } from 'react-native-maps';

const INITIAL_REGION = {
  latitude: 10.8231,
  longitude: 106.6297,
  latitudeDelta: 0.0922,
  longitudeDelta: 0.0421,
};

interface MapsProps {
  mapRef: React.RefObject<MapView | null>;
  selectedVendorId: string | null;
  onMarkerPress: (vendorId: string) => void;
}

export const Maps = ({
  mapRef,
  selectedVendorId,
  onMarkerPress,
}: MapsProps): JSX.Element => {
  return (
    <View className="flex-1">
      <MapView
        customMapStyle={mapStyle}
        ref={mapRef}
        style={StyleSheet.absoluteFillObject}
        provider={PROVIDER_GOOGLE}
        initialRegion={INITIAL_REGION}
        showsUserLocation
      >
        {MOCK_VENDORS.map((vendor) => (
          <Marker
            key={vendor.vendorId}
            coordinate={{ latitude: vendor.lat, longitude: vendor.long }}
            title={vendor.name}
            description={vendor.addressDetail}
            pinColor={selectedVendorId === vendor.vendorId ? '#a1d973' : 'red'}
            onPress={() => onMarkerPress(vendor.vendorId)}
          />
        ))}
      </MapView>
    </View>
  );
};
