import type { PickedLocation } from '@features/customer/maps/components/LocationPickerMap';

type Listener = (location: PickedLocation) => void;

const listeners = new Map<string, Listener>();

export const locationPickerBus = {
  subscribe(sessionId: string, listener: Listener): () => void {
    listeners.set(sessionId, listener);
    return (): void => {
      listeners.delete(sessionId);
    };
  },
  emit(sessionId: string, location: PickedLocation): void {
    const listener = listeners.get(sessionId);
    if (listener) listener(location);
  },
};
