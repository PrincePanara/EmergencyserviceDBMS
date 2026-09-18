/** Index a collection by id for O(1) joins between related entities. */
export function indexById<T extends {id: string;}>(items: T[] | null | undefined): Record<string, T> {
  const map: Record<string, T> = {};
  (items ?? []).forEach((item) => {
    map[item.id] = item;
  });
  return map;
}

export const ACTIVE_STATUSES = ['Reported', 'Dispatched', 'Team En Route', 'On Scene'] as const;

export const isActiveStatus = (status: string): boolean =>
(ACTIVE_STATUSES as readonly string[]).includes(status);