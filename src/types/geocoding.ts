/**
 * Autocomplete prediction result from geocoding API
 */
export interface AutocompletePrediction {
  description: string;
  placeId: string;
  mainText: string;
  secondaryText: string;
}

/**
 * Reverse geocoding result (coordinate to address)
 */
export interface ReverseGeocodeResult {
  address: string;
  formattedAddress: string;
  name: string;
  placeId: string;
  lat: number;
  lng: number;
}

/**
 * Forward geocoding result (address to coordinate)
 */
export interface ForwardGeocodeResult {
  address: string;
  lat: number;
  lng: number;
}

/**
 * Detailed place information
 */
export interface PlaceDetailResult {
  formattedAddress: string;
  name: string;
  addressDetail: string;
  ward: string;
  city: string;
  lat: number;
  lng: number;
}
