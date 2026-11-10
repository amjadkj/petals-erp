import { BadRequestException } from '@nestjs/common';

/**
 * Validates and returns a Prisma `orderBy` array from a user-supplied sort string.
 *
 * @param sortParam  - User input, e.g. "name" or "-createdAt" (prefix `-` = desc)
 * @param whitelist  - Allowed field names (no prefix)
 * @param tiebreaker - Stable tiebreaker field (default "id")
 * @returns Prisma-compatible orderBy array, e.g. [{ createdAt: 'desc' }, { id: 'asc' }]
 *
 * @example
 *   buildOrderBy('-createdAt', ['name', 'createdAt', 'status']);
 *   // => [{ createdAt: 'desc' }, { id: 'asc' }]
 */
export function buildOrderBy(
  sortParam: string | undefined,
  whitelist: readonly string[],
  tiebreaker: string = 'id',
): Record<string, 'asc' | 'desc'>[] {
  if (!sortParam) {
    // Default: newest first
    return [{ createdAt: 'desc' as const }, { [tiebreaker]: 'asc' as const }];
  }

  const desc = sortParam.startsWith('-');
  const field = desc ? sortParam.slice(1) : sortParam;

  if (!whitelist.includes(field)) {
    throw new BadRequestException(
      `Invalid sort field "${field}". Allowed: ${whitelist.join(', ')}`,
    );
  }

  const direction = desc ? 'desc' : 'asc';
  const orderBy: Record<string, 'asc' | 'desc'>[] = [
    { [field]: direction },
  ];

  // Add tiebreaker if the sorted field isn't the tiebreaker itself
  if (field !== tiebreaker) {
    orderBy.push({ [tiebreaker]: 'asc' });
  }

  return orderBy;
}

/**
 * Builds Prisma skip/take from offset pagination params.
 */
export function buildOffsetPagination(page: number = 1, pageSize: number = 20) {
  const p = page > 0 ? page : 1;
  const ps = pageSize > 0 ? pageSize : 20;
  return {
    skip: (p - 1) * ps,
    take: ps,
  };
}

/**
 * Builds Prisma cursor/take from cursor pagination params.
 * Returns skip:1 + cursor when a cursor is provided (skip the cursor row itself).
 */
export function buildCursorPagination(cursor: string | undefined, limit: number = 20) {
  const l = limit > 0 ? limit : 20;
  if (cursor) {
    return {
      skip: 1,
      take: l,
      cursor: { id: cursor },
    };
  }
  return { take: l };
}

/**
 * Builds offset pagination meta from count and params.
 */
export function buildOffsetMeta(total: number, page: number = 1, pageSize: number = 20) {
  const p = page > 0 ? page : 1;
  const ps = pageSize > 0 ? pageSize : 20;
  return {
    page: p,
    pageSize: ps,
    total,
    hasNext: p * ps < total,
  };
}

/**
 * Builds cursor pagination meta from the results.
 * Call with the fetched items; returns nextCursor (last item's id) and hasNext.
 */
export function buildCursorMeta<T extends { id: string }>(
  items: T[],
  limit: number,
): { nextCursor: string | null; hasNext: boolean } {
  const hasNext = items.length === limit;
  const nextCursor = hasNext && items.length > 0
    ? items[items.length - 1].id
    : null;
  return { nextCursor, hasNext };
}

