"use client";

import { useSyncExternalStore } from "react";

const subscribe = () => () => {};
const getSnapshot = () => true;
const getServerSnapshot = () => false;

/**
 * True only after hydration.
 *
 * Several v2 surfaces read `localStorage`-persisted zustand stores (the cart),
 * whose contents cannot exist during SSR. Rendering the server value and then
 * the real one is a hydration mismatch, so those bits wait for this.
 *
 * `useSyncExternalStore` rather than `useState` + `useEffect`: it gives React
 * an explicit server snapshot instead of triggering a second render pass.
 */
export function useIsClient(): boolean {
  return useSyncExternalStore(subscribe, getSnapshot, getServerSnapshot);
}
