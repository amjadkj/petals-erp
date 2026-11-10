import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';

export class OffsetPaginationMeta {
  @ApiProperty()
  page!: number;

  @ApiProperty()
  pageSize!: number;

  @ApiPropertyOptional()
  total?: number;

  @ApiProperty()
  hasNext!: boolean;
}

export class CursorPaginationMeta {
  @ApiPropertyOptional()
  nextCursor?: string | null;

  @ApiProperty()
  hasNext!: boolean;
}

export class OffsetPaginatedResponse<T> {
  data!: T[];
  meta!: OffsetPaginationMeta;
}

export class CursorPaginatedResponse<T> {
  data!: T[];
  meta!: CursorPaginationMeta;
}
