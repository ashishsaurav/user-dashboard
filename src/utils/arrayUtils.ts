export const reorderArray = <T>(
  array: T[],
  fromIndex: number,
  toIndex: number
): T[] => {
  const result = [...array];
  const [removed] = result.splice(fromIndex, 1);
  result.splice(toIndex, 0, removed);
  return result;
};

export const moveItemBetweenArrays = <T>(
  sourceArray: T[],
  targetArray: T[],
  item: T,
  targetIndex?: number
): { source: T[]; target: T[] } => {
  const source = sourceArray.filter((i) => i !== item);
  const target = [...targetArray];

  if (targetIndex !== undefined && targetIndex >= 0) {
    target.splice(targetIndex, 0, item);
  } else {
    target.push(item);
  }

  return { source, target };
};

export const sortByOrder = <T extends { order?: number }>(items: T[]): T[] => {
  return [...items].sort((a, b) => (a.order || 0) - (b.order || 0));
};

export const findById = <T extends { id: string }>(
  items: T[],
  id: string
): T | undefined => {
  return items.find((item) => item.id === id);
};

export const filterByIds = <T extends { id: string }>(
  items: T[],
  ids: string[]
): T[] => {
  return ids.map((id) => items.find((item) => item.id === id)).filter(Boolean) as T[];
};
