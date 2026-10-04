# High Performance Cache Manager

A high-performance caching library for Node.js applications, supporting Multi-tier Caching (In-Memory LRU + Redis Cluster). Designed for production workloads requiring sub-millisecond read latency, automatic failover, and full TypeScript support.

---

## Table of Contents

1. [Features](#features)
2. [Installation](#installation)
3. [Quick Start](#quick-start)
4. [Configuration](#configuration)
5. [Performance Benchmarks](#performance-benchmarks)
6. [API Reference](#api-reference)
7. [Error Handling](#error-handling)
8. [Troubleshooting](#troubleshooting)
9. [Contributing](#contributing)

---

## Features

- **Multi-tier Caching**: Combines L1 (In-Memory LRU cache, latency < 1ms) and L2 (Redis Cluster, latency < 5ms).
- **Auto Cache Invalidation**: Supports TTL-based expiry and Pub/Sub invalidation in real time.
- **Type Safety**: Full TypeScript definitions with `strict: true`.
- **High Availability**: Redis Cluster with automatic failover and replication factor of 2.
- **Observability**: Built-in Prometheus metrics endpoint at `/metrics` (opt-in via `enableMetrics: true`).
- **Graceful Degradation**: Falls back to L2 (Redis) automatically when L1 is full; falls back to the database when both cache layers miss.

---

## Installation

```bash
npm install @company/cache-manager
```

**Prerequisites:**

| Dependency | Minimum Version |
| :--- | :--- |
| Node.js | >= 18.0.0 |
| Redis | >= 7.0 |

---

## Quick Start

```typescript
import { CacheManager, CacheError } from '@company/cache-manager';

const cache = new CacheManager({
  ttlSeconds: 300,
  redisUrl: process.env.REDIS_URL, // e.g. redis://localhost:6379
  maxMemoryItems: 1000,
});

// Set a value
await cache.set('user:1001', { name: 'Alice' });

// Get a value with type safety
const user = await cache.get<{ name: string }>('user:1001');
console.log(user?.name); // 'Alice'

// Delete a single key
await cache.delete('user:1001');

// Invalidate all keys matching a pattern
await cache.invalidatePattern('user:*');
```

---

## Configuration

| Option | Type | Default | Description |
| :--- | :--- | :--- | :--- |
| `ttlSeconds` | `number` | `300` | Time-to-live in seconds for each cache entry. |
| `redisUrl` | `string` | **required** | Redis connection URL (e.g., `redis://localhost:6379`). |
| `maxMemoryItems` | `number` | `1000` | Maximum number of items in the L1 in-memory LRU cache. |
| `enableMetrics` | `boolean` | `false` | Enables Prometheus metrics endpoint at `/metrics`. |
| `connectTimeoutMs` | `number` | `2000` | Redis connection timeout in milliseconds. |
| `retryAttempts` | `number` | `3` | Number of reconnection attempts before marking Redis as unavailable. |

---

## Performance Benchmarks

Measured on a 4-core, 16 GB RAM machine using `autocannon` with 100 concurrent connections over 30 seconds.

| Operation | Max Throughput (RPS) | P95 Latency | P99 Latency |
| :--- | :---: | :---: | :---: |
| Memory Get (L1 Hit) | 100,000 | 0.2 ms | 0.5 ms |
| Redis Get (L2 Hit) | 15,000 | 2.1 ms | 4.8 ms |
| Cache Miss (DB fallback) | 5,000 | 12.0 ms | 18.3 ms |
| Pattern Invalidation | 8,000 | 3.5 ms | 6.2 ms |

> **Note:** Benchmarks were conducted with Redis 7.2 in standalone mode on localhost. Cluster mode adds ~0.5ms round-trip overhead.

---

## API Reference

### `cache.set(key, value, options?)`

Stores a value in both L1 and L2 cache layers.

**Parameters:**

| Parameter | Type | Required | Description |
| :--- | :--- | :---: | :--- |
| `key` | `string` | ? | Unique cache key. |
| `value` | `unknown` | ? | Value to store. Must be JSON-serializable. |
| `options.ttlSeconds` | `number` | ? | Overrides the global `ttlSeconds` for this entry only. |

**Returns:** `Promise<void>`

---

### `cache.get<T>(key)`

Retrieves a value from cache. Checks L1 first; falls back to L2 on miss.

**Parameters:**

| Parameter | Type | Required | Description |
| :--- | :--- | :---: | :--- |
| `key` | `string` | ? | Cache key to retrieve. |

**Returns:** `Promise<T | null>` — returns `null` if the key is not found or has expired.

---

### `cache.delete(key)`

Removes a key from both L1 and L2 cache layers atomically.

**Returns:** `Promise<void>`

---

### `cache.invalidatePattern(pattern)`

Invalidates all keys matching a glob pattern (e.g., `user:*`). Uses Redis `SCAN` to avoid blocking the event loop.

**Returns:** `Promise<number>` — the count of invalidated keys.

---

## Error Handling

All methods throw a `CacheError` on unrecoverable failures. Always wrap cache operations in a `try/catch` to prevent cache outages from impacting application availability.

```typescript
import { CacheManager, CacheError, CacheErrorCode } from '@company/cache-manager';

const cache = new CacheManager({ redisUrl: process.env.REDIS_URL });

try {
  const data = await cache.get<User>('user:1001');
  if (data === null) {
    // Cache miss: fetch from database and repopulate
    const user = await db.findUser(1001);
    await cache.set('user:1001', user, { ttlSeconds: 600 });
  }
} catch (err) {
  if (err instanceof CacheError) {
    if (err.code === CacheErrorCode.CONNECTION_FAILED) {
      // Redis is unavailable — degrade gracefully, serve from DB
      console.warn('Cache unavailable, falling back to database:', err.message);
    } else {
      throw err; // Re-throw unexpected errors
    }
  }
}
```

**Error Codes:**

| Code | Description |
| :--- | :--- |
| `CONNECTION_FAILED` | Unable to establish a connection to Redis. |
| `SERIALIZATION_ERROR` | Value is not JSON-serializable. |
| `TIMEOUT` | Operation exceeded `connectTimeoutMs`. |

---

## Troubleshooting

### Redis connection refused

Ensure the `REDIS_URL` environment variable is correctly set and Redis is running:

```bash
redis-cli -u "$REDIS_URL" ping
# Expected output: PONG
```

### High cache miss rate

Check that `ttlSeconds` is not set too low. Monitor the `cache_miss_total` Prometheus metric at `/metrics` to diagnose patterns.

### L1 evictions increasing

Increase `maxMemoryItems` if your working set exceeds the current limit. Monitor `cache_l1_eviction_total` to track eviction frequency.

---

## Contributing

1. Fork the repository and create a feature branch: `git checkout -b feat/your-feature`.
2. Commit your changes following [Conventional Commits](https://www.conventionalcommits.org/).
3. Open a Pull Request against `main` and fill in the PR template.
4. Ensure all tests pass and coverage stays above 80%: `npm test`.
5. Run the linter before submitting: `npm run lint`.

---

## License

[MIT](LICENSE) © Company Inc.
