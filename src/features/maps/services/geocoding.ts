import type {
  AutocompletePrediction,
  ForwardGeocodeResult,
  PlaceDetailResult,
  ReverseGeocodeResult,
} from '@custom-types/geocoding';
import axios from 'axios';

export type {
  AutocompletePrediction,
  ForwardGeocodeResult,
  PlaceDetailResult,
  ReverseGeocodeResult,
};

const API_KEY = process.env.EXPO_PUBLIC_OPENMAP_API_KEY ?? '';
const BASE = 'https://mapapis.openmap.vn/v1';

// ── Autocomplete ──

export const searchAddress = async (
  input: string,
  location?: { lat: number; lng: number }
): Promise<AutocompletePrediction[]> => {
  if (!input.trim()) return [];

  const params = new URLSearchParams({
    input,
    admin_v2: 'true',
    apikey: API_KEY,
  });
  if (location) {
    params.set('location', `${location.lat},${location.lng}`);
    params.set('radius', '50');
  }

  try {
    const res = await axios.get(`${BASE}/autocomplete?${params.toString()}`);
    const data = res.data as {
      status: string;
      predictions?: Array<{
        description: string;
        place_id: string;
        structured_formatting?: {
          main_text: string;
          secondary_text: string;
        };
      }>;
    };

    if (data.status !== 'OK' || !data.predictions) return [];

    return data.predictions.map((p) => ({
      description: p.description,
      placeId: p.place_id,
      mainText: p.structured_formatting?.main_text ?? p.description,
      secondaryText: p.structured_formatting?.secondary_text ?? '',
    }));
  } catch {
    return [];
  }
};

// ── Shared: parse OSM FeatureCollection response from /place ──

type PlaceFeatureCollection = {
  errors: string | null;
  features?: Array<{
    type: 'Feature';
    geometry: { coordinates: [number, number]; type: 'Point' };
    properties: {
      name?: string | null;
      housenumber?: string | null;
      street?: string | null;
      short_address?: string | null;
      postalcode?: string | null;
      label?: string | null;
      country?: string | null;
      country_code?: string | null;
      category?: string[];
      website?: string | null;
      opening_hours?: number[][][];
      phone?: string | null;
      region?: string | null;
      county?: string | null;
      locality?: string | null;
      distance?: number | null;
      id?: string;
      continent?: string | null;
      source?: string | null;
    };
  }>;
  bbox: number[];
  type: 'FeatureCollection';
};

const parsePlaceFeature = (
  data: PlaceFeatureCollection
): PlaceDetailResult | null => {
  const feature = data.features?.[0];
  if (!feature) return null;
  const props = feature.properties;
  return {
    formattedAddress: props.label ?? props.short_address ?? '',
    name: props.name ?? '',
    addressDetail: `${props.housenumber ?? ''} ${props.street ?? ''}`.trim(),
    ward: props.locality ?? '',
    city: props.region ?? '',
    lat: feature.geometry.coordinates[1],
    lng: feature.geometry.coordinates[0],
  };
};

// ── Place Detail (place_id → coordinates + address) ──

export const getPlaceDetail = async (
  placeId: string
): Promise<PlaceDetailResult | null> => {
  const params = new URLSearchParams({
    ids: placeId,
    admin_v2: 'true',
    apikey: API_KEY,
  });

  try {
    const res = await axios.get(`${BASE}/place?${params.toString()}`);
    return parsePlaceFeature(res.data as PlaceFeatureCollection);
  } catch {
    return null;
  }
};

// ── Forward Geocode (address → coordinates) ──

export const forwardGeocode = async (
  address: string
): Promise<ForwardGeocodeResult | null> => {
  const params = new URLSearchParams({
    address,
    admin_v2: 'true', // Ưu tiên kết quả có admin info (quận/huyện) để tăng độ chính xác
    apikey: API_KEY,
  });

  try {
    const res = await axios.get(`${BASE}/geocode/forward?${params.toString()}`);
    const data = res.data as {
      status: string;
      results?: Array<{
        formatted_address: string;
        geometry: { location: { lat: number; lng: number } };
      }>;
    };

    if (data.status !== 'OK' || !data.results?.[0]) return null;

    const r = data.results[0];
    return {
      address: r.formatted_address,
      lat: r.geometry.location.lat,
      lng: r.geometry.location.lng,
    };
  } catch {
    return null;
  }
};

// ── Reverse Geocode (coordinates → address) ──

export const reverseGeocode = async (
  lat: number,
  lng: number
): Promise<ReverseGeocodeResult | null> => {
  const params = new URLSearchParams({
    latlng: `${lat},${lng}`,
    admin_v2: 'true',
    apikey: API_KEY,
  });

  try {
    const res = await axios.get(`${BASE}/geocode/reverse?${params.toString()}`);
    const data = res.data as {
      status: string;
      results?: Array<{
        address: string;
        formatted_address: string;
        name: string;
        place_id: string;
        geometry: { location: { lat: number; lng: number } };
      }>;
    };

    if (data.status !== 'OK' || !data.results?.[0]) return null;

    const r = data.results[0];
    return {
      address: r.address,
      formattedAddress: r.formatted_address,
      name: r.name,
      placeId: r.place_id,
      lat: r.geometry.location.lat,
      lng: r.geometry.location.lng,
    };
  } catch {
    return null;
  }
};
