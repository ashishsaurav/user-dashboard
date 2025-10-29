import { useRef } from "react";

/**
 * Returns a stable array reference that only changes when item IDs change
 * Prevents unnecessary re-renders when API returns new array objects with same data
 */
export function useStableArray<T extends { id: string }>(array: T[]): T[] {
  const ref = useRef<T[]>(array);

  // Check if array content actually changed (by IDs)
  const idsChanged =
    array.length !== ref.current.length ||
    array.some((item, i) => item.id !== ref.current[i]?.id);

  if (idsChanged) {
    console.log(
      "📊 Array IDs changed, updating reference:",
      array.length,
      "items"
    );
    ref.current = array;
  } else {
    console.log("✓ Array IDs stable, reusing reference");
  }

  return ref.current;
}

/**
 * Returns a stable value reference that only changes when deep comparison fails
 * Useful for objects and complex values
 */
export function useStableValue<T>(
  value: T,
  compareFn?: (a: T, b: T) => boolean
): T {
  const ref = useRef<T>(value);

  const hasChanged = compareFn
    ? !compareFn(ref.current, value)
    : JSON.stringify(ref.current) !== JSON.stringify(value);

  if (hasChanged) {
    console.log("📊 Value changed, updating reference");
    ref.current = value;
  }

  return ref.current;
}
