import { BadRequestException } from '@nestjs/common';
import {
  buildOrderBy,
  buildOffsetPagination,
  buildCursorPagination,
  buildOffsetMeta,
  buildCursorMeta,
} from './pagination.helper';

describe('Pagination Helpers', () => {
  describe('buildOrderBy', () => {
    const whitelist = ['name', 'createdAt', 'status'];

    it('should return default ordering when sortParam is not provided', () => {
      const result = buildOrderBy(undefined, whitelist);
      expect(result).toEqual([{ createdAt: 'desc' }, { id: 'asc' }]);
    });

    it('should build ascending order for valid whitelisted field', () => {
      const result = buildOrderBy('name', whitelist);
      expect(result).toEqual([{ name: 'asc' }, { id: 'asc' }]);
    });

    it('should build descending order when prefixed with minus (-)', () => {
      const result = buildOrderBy('-status', whitelist);
      expect(result).toEqual([{ status: 'desc' }, { id: 'asc' }]);
    });

    it('should throw BadRequestException for unwhitelisted field', () => {
      expect(() => buildOrderBy('passwordHash', whitelist)).toThrow(BadRequestException);
      expect(() => buildOrderBy('-invalidField', whitelist)).toThrow(
        /Invalid sort field "invalidField"/,
      );
    });

    it('should not duplicate id if id is the sort field', () => {
      const result = buildOrderBy('id', ['id', 'name'], 'id');
      expect(result).toEqual([{ id: 'asc' }]);
    });
  });

  describe('buildOffsetPagination', () => {
    it('should calculate skip and take correctly', () => {
      expect(buildOffsetPagination(1, 20)).toEqual({ skip: 0, take: 20 });
      expect(buildOffsetPagination(2, 20)).toEqual({ skip: 20, take: 20 });
      expect(buildOffsetPagination(5, 10)).toEqual({ skip: 40, take: 10 });
    });
  });

  describe('buildCursorPagination', () => {
    it('should return take without skip/cursor when no cursor provided', () => {
      expect(buildCursorPagination(undefined, 25)).toEqual({ take: 25 });
    });

    it('should return skip: 1, take, and cursor when cursor is provided', () => {
      const cursor = 'c0a80101-0000-0000-0000-000000000001';
      expect(buildCursorPagination(cursor, 25)).toEqual({
        skip: 1,
        take: 25,
        cursor: { id: cursor },
      });
    });
  });

  describe('buildOffsetMeta', () => {
    it('should calculate hasNext as true when more items exist', () => {
      const meta = buildOffsetMeta(100, 1, 20);
      expect(meta).toEqual({
        page: 1,
        pageSize: 20,
        total: 100,
        hasNext: true,
      });
    });

    it('should calculate hasNext as false on the last page', () => {
      const meta = buildOffsetMeta(100, 5, 20);
      expect(meta).toEqual({
        page: 5,
        pageSize: 20,
        total: 100,
        hasNext: false,
      });
    });

    it('should calculate hasNext as false when total < pageSize', () => {
      const meta = buildOffsetMeta(15, 1, 20);
      expect(meta).toEqual({
        page: 1,
        pageSize: 20,
        total: 15,
        hasNext: false,
      });
    });
  });

  describe('buildCursorMeta', () => {
    it('should return nextCursor and hasNext=true when items length equals limit', () => {
      const items = [{ id: '1' }, { id: '2' }, { id: '3' }];
      const meta = buildCursorMeta(items, 3);
      expect(meta).toEqual({
        nextCursor: '3',
        hasNext: true,
      });
    });

    it('should return null nextCursor and hasNext=false when items length is less than limit', () => {
      const items = [{ id: '1' }, { id: '2' }];
      const meta = buildCursorMeta(items, 3);
      expect(meta).toEqual({
        nextCursor: null,
        hasNext: false,
      });
    });

    it('should return null nextCursor and hasNext=false for empty list', () => {
      const meta = buildCursorMeta([], 10);
      expect(meta).toEqual({
        nextCursor: null,
        hasNext: false,
      });
    });
  });
});

