/**
 * Array utility functions for common operations
 */

/**
 * Toggle an item in an array (add if not present, remove if present)
 */
export const toggleItem = <T>(array: T[], item: T): T[] => {
  const index = array.indexOf(item);
  if (index === -1) {
    return [...array, item];
  }
  return array.filter((_, i) => i !== index);
};

/**
 * Move an item from one index to another
 */
export const moveItem = <T>(array: T[], fromIndex: number, toIndex: number): T[] => {
  const newArray = [...array];
  const [removed] = newArray.splice(fromIndex, 1);
  newArray.splice(toIndex, 0, removed);
  return newArray;
};

/**
 * Remove item at index
 */
export const removeAt = <T>(array: T[], index: number): T[] => {
  return array.filter((_, i) => i !== index);
};

/**
 * Insert item at index
 */
export const insertAt = <T>(array: T[], index: number, item: T): T[] => {
  const newArray = [...array];
  newArray.splice(index, 0, item);
  return newArray;
};

/**
 * Update item at index
 */
export const updateAt = <T>(array: T[], index: number, item: T): T[] => {
  const newArray = [...array];
  newArray[index] = item;
  return newArray;
};

/**
 * Find and update item by ID
 */
export const updateById = <T extends { id: string }>(
  array: T[],
  id: string,
  updates: Partial<T>
): T[] => {
  return array.map((item) => (item.id === id ? { ...item, ...updates } : item));
};

/**
 * Find and remove item by ID
 */
export const removeById = <T extends { id: string }>(array: T[], id: string): T[] => {
  return array.filter((item) => item.id !== id);
};

/**
 * Sort array by property
 */
export const sortBy = <T>(
  array: T[],
  key: keyof T,
  order: "asc" | "desc" = "asc"
): T[] => {
  return [...array].sort((a, b) => {
    const aVal = a[key];
    const bVal = b[key];
    
    if (aVal < bVal) return order === "asc" ? -1 : 1;
    if (aVal > bVal) return order === "asc" ? 1 : -1;
    return 0;
  });
};

/**
 * Group array by property
 */
export const groupBy = <T>(array: T[], key: keyof T): Record<string, T[]> => {
  return array.reduce((groups, item) => {
    const groupKey = String(item[key]);
    if (!groups[groupKey]) {
      groups[groupKey] = [];
    }
    groups[groupKey].push(item);
    return groups;
  }, {} as Record<string, T[]>);
};

/**
 * Get unique values from array
 */
export const unique = <T>(array: T[]): T[] => {
  return Array.from(new Set(array));
};

/**
 * Get unique by property
 */
export const uniqueBy = <T>(array: T[], key: keyof T): T[] => {
  const seen = new Set();
  return array.filter((item) => {
    const value = item[key];
    if (seen.has(value)) {
      return false;
    }
    seen.add(value);
    return true;
  });
};

/**
 * Chunk array into smaller arrays
 */
export const chunk = <T>(array: T[], size: number): T[][] => {
  const chunks: T[][] = [];
  for (let i = 0; i < array.length; i += size) {
    chunks.push(array.slice(i, i + size));
  }
  return chunks;
};

/**
 * Flatten nested arrays
 */
export const flatten = <T>(array: (T | T[])[]): T[] => {
  return array.reduce<T[]>((flat, item) => {
    return flat.concat(Array.isArray(item) ? flatten(item) : item);
  }, []);
};

/**
 * Check if arrays are equal
 */
export const areEqual = <T>(a: T[], b: T[]): boolean => {
  if (a.length !== b.length) return false;
  return a.every((item, index) => item === b[index]);
};

/**
 * Get difference between two arrays
 */
export const difference = <T>(a: T[], b: T[]): T[] => {
  return a.filter((item) => !b.includes(item));
};

/**
 * Get intersection of two arrays
 */
export const intersection = <T>(a: T[], b: T[]): T[] => {
  return a.filter((item) => b.includes(item));
};
