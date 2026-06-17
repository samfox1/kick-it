import * as Location from 'expo-location';
import { useCallback, useEffect, useState } from 'react';

export type LocationState = 'checking' | 'granted' | 'denied';

/**
 * Tracks foreground location permission. Checks on mount; `request()` prompts the user.
 * Kick It uses location to show only spots within reach — see the Explore screen.
 */
export function useLocationPermission() {
  const [state, setState] = useState<LocationState>('checking');

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

  return { state, request };
}
