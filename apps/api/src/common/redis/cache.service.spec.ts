import { CacheService } from './cache.service';

describe('CacheService', () => {
  let cacheService: CacheService;
  let mockRedis: any;

  beforeEach(() => {
    mockRedis = {
      status: 'ready',
      get: jest.fn(),
      set: jest.fn(),
      del: jest.fn(),
      scan: jest.fn(),
    };
    cacheService = new CacheService(mockRedis);
  });

  it('should prefix keys with petals: on get', async () => {
    mockRedis.get.mockResolvedValue(JSON.stringify({ hello: 'world' }));

    const result = await cacheService.get('my-key');

    expect(mockRedis.get).toHaveBeenCalledWith('petals:my-key');
    expect(result).toEqual({ hello: 'world' });
  });

  it('should return null and record miss when key does not exist', async () => {
    mockRedis.get.mockResolvedValue(null);

    const result = await cacheService.get('missing-key');

    expect(result).toBeNull();
    const metrics = cacheService.getMetrics();
    expect(metrics.misses).toBe(1);
    expect(metrics.hits).toBe(0);
  });

  it('should prefix keys and apply TTL on set', async () => {
    mockRedis.set.mockResolvedValue('OK');

    await cacheService.set('user:123', { name: 'Alice' }, 300);

    expect(mockRedis.set).toHaveBeenCalledWith(
      'petals:user:123',
      JSON.stringify({ name: 'Alice' }),
      'EX',
      300,
    );
  });

  it('should return cached value in getOrSet without invoking factory', async () => {
    mockRedis.get.mockResolvedValue(JSON.stringify('cached-value'));
    const factory = jest.fn();

    const result = await cacheService.getOrSet('test-key', 60, factory);

    expect(result).toBe('cached-value');
    expect(factory).not.toHaveBeenCalled();
  });

  it('should invoke factory and cache result when getOrSet misses', async () => {
    mockRedis.get.mockResolvedValue(null);
    mockRedis.set.mockResolvedValue('OK');
    const factory = jest.fn().mockResolvedValue('computed-value');

    const result = await cacheService.getOrSet('test-key', 60, factory);

    expect(result).toBe('computed-value');
    expect(factory).toHaveBeenCalledTimes(1);
    expect(mockRedis.set).toHaveBeenCalledWith(
      'petals:test-key',
      JSON.stringify('computed-value'),
      'EX',
      60,
    );
  });

  it('should delete a specific key with petals: prefix', async () => {
    mockRedis.del.mockResolvedValue(1);

    await cacheService.del('some-key');

    expect(mockRedis.del).toHaveBeenCalledWith('petals:some-key');
  });

  it('should delete all keys matching prefix via SCAN', async () => {
    mockRedis.scan
      .mockResolvedValueOnce(['10', ['petals:permissions:1', 'petals:permissions:2']])
      .mockResolvedValueOnce(['0', ['petals:permissions:3']]);
    mockRedis.del.mockResolvedValue(1);

    const deletedCount = await cacheService.deleteByPrefix('permissions:');

    expect(mockRedis.scan).toHaveBeenCalledTimes(2);
    expect(mockRedis.del).toHaveBeenCalledWith('petals:permissions:1', 'petals:permissions:2');
    expect(mockRedis.del).toHaveBeenCalledWith('petals:permissions:3');
    expect(deletedCount).toBe(3);
  });

  it('should track hits and misses and calculate hit rate correctly', async () => {
    mockRedis.get
      .mockResolvedValueOnce(JSON.stringify('item1'))
      .mockResolvedValueOnce(null)
      .mockResolvedValueOnce(JSON.stringify('item2'));

    await cacheService.get('key1'); // hit
    await cacheService.get('key2'); // miss
    await cacheService.get('key3'); // hit

    const metrics = cacheService.getMetrics();
    expect(metrics.hits).toBe(2);
    expect(metrics.misses).toBe(1);
    expect(metrics.hitRate).toBeCloseTo(2 / 3);

    // Reset check
    const resetMetrics = cacheService.getMetrics();
    expect(resetMetrics.hits).toBe(0);
    expect(resetMetrics.misses).toBe(0);
  });
});
