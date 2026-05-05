import { useEffect, useState } from 'react';
import { getOnyixState, subscribeOnyix, type OnyixState } from '@/lib/konsmia/onyix';

export function useOnyix(): OnyixState {
  const [s, setS] = useState<OnyixState>(getOnyixState());
  useEffect(() => subscribeOnyix(setS), []);
  return s;
}