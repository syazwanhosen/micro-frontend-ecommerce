import { useEffect, useState } from 'react';
import { cartStore } from '@mfe/shared';

/** Subscribes this micro frontend to the window-level cart singleton. */
export function useCart() {
  const [state, setState] = useState(cartStore.getSnapshot);
  useEffect(() => cartStore.subscribe(setState), []);
  return state;
}
