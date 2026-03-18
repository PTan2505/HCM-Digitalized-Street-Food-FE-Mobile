import axios from 'axios';

const API_KEY = process.env.EXPO_PUBLIC_OPENMAP_API_KEY ?? '';
const BASE = 'https://mapapis.openmap.vn/v1';

// ── Types ──

export interface AutocompletePrediction {
  description: string;
  placeId: string;
  mainText: string;
  secondaryText: string;
}

export interface ReverseGeocodeResult {
  address: string;
  formattedAddress: string;
  name: string;
  lat: number;
  lng: number;
}

export interface ForwardGeocodeResult {
  address: string;
  lat: number;
  lng: number;
}

export interface PlaceDetailResult {
  formattedAddress: string;
  name: string;
  lat: number;
  lng: number;
}

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

// ── Place Detail (place_id → coordinates + address) ──

export const getPlaceDetail = async (
  placeId: string
): Promise<PlaceDetailResult | null> => {
  const params = new URLSearchParams({
    ids: placeId,
    format: 'google',
    admin_v2: 'true',
    apikey: API_KEY,
  });

  try {
    const res = await axios.get(`${BASE}/place?${params.toString()}`);
    const data = res.data as {
      status: string;
      result?: {
        formatted_address: string;
        name: string;
        geometry: { location: { lat: number; lng: number } };
      };
    };

    if (data.status !== 'OK' || !data.result) return null;

    const r = data.result;
    return {
      formattedAddress: r.formatted_address,
      name: r.name,
      lat: r.geometry.location.lat,
      lng: r.geometry.location.lng,
    };
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

// ── Place Detail OSM format (coordinates → structured address) ──

export interface PlaceOSMResult {
  shortAddress: string;
  locality: string;
  region: string;
  lat: number;
  lng: number;
}

interface PlaceOSMFeature {
  geometry: { coordinates: [number, number]; type: string };
  properties: {
    short_address?: string;
    locality?: string;
    region?: string;
    label?: string;
    [key: string]: unknown;
  };
}

export const getPlaceOSM = async (
  lat: number,
  lng: number
): Promise<PlaceOSMResult | null> => {
  const params = new URLSearchParams({
    latlng: `${lat},${lng}`,
    apikey: API_KEY,
  });

  try {
    const res = await axios.get(`${BASE}/place?${params.toString()}`);
    const data = res.data as {
      errors: unknown;
      features?: PlaceOSMFeature[];
      type: string;
    };

    const feature = data.features?.[0];
    if (!feature) return null;

    const props = feature.properties;
    return {
      shortAddress: props.short_address ?? props.label ?? '',
      locality: props.locality ?? '',
      region: props.region ?? '',
      lat: feature.geometry.coordinates[1],
      lng: feature.geometry.coordinates[0],
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
        geometry: { location: { lat: number; lng: number } };
      }>;
    };

    if (data.status !== 'OK' || !data.results?.[0]) return null;

    const r = data.results[0];
    return {
      address: r.address,
      formattedAddress: r.formatted_address,
      name: r.name,
      lat: r.geometry.location.lat,
      lng: r.geometry.location.lng,
    };
  } catch {
    return null;
  }
};
