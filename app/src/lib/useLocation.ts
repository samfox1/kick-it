import * as Location from 'expo-location';
import { useCallback, useEffect, useState } from 'react';

import type { Coord } from '@/domain/geo';

export type LocationState = 'checking' | 'granted' | 'denied';

/**
 * Tracks foreground location permission and, once granted, the user's coordinates.
 * `coords` is null until permission is granted and a fix is obtained. Kick It uses this to
 * compute how far each spot is — see the Explore/Spots screens.
 */
export function useLocationPermission() {
  const [state, setState] = useState<LocationState>('checking');
  const [coords, setCoords] = useState<Coord | null>(null);

  const check = useCallback(async () => {
    const { status } = await Location.getForegroundPermissionsAsync();
    setState(status === Location.PermissionStatus.GRANTED ? 'granted' : 'denied');
  }, []);

  const request = useCallback(async () => {
    const { status } = await Location.requestForegroundPermissionsAsync();
    setState(status === Location.PermissionStatus.GRANTED ? 'granted' : 'denied');
  }, []);

  useEffect(() => {
    void check();
  }, [check]);

  // Fetch a position once permission is granted.
  useEffect(() => {
    if (state !== 'granted') return;
    let active = true;
    Location.getCurrentPositionAsync({})
      .then((p) => {
        if (active) setCoords({ lat: p.coords.latitude, lng: p.coords.longitude });
      })
      .catch(() => {});
    return () => {
      active = false;
    };
  }, [state]);

  return { state, request, coords };
}
