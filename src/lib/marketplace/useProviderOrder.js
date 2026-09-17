import { useEffect, useState } from 'react';
import { shuffled } from './ordering.mjs';

export function useProviderOrder(records, enabled = true) {
  // SSR and the initial browser render agree. Shuffle once after hydration;
  // changing a filter must not reshuffle the remaining providers.
  const [ordered, setOrdered] = useState(records);
  useEffect(() => {
    setOrdered(enabled ? shuffled(records) : records);
  }, [records, enabled]);
  return ordered;
}
