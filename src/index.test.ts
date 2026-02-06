import assert from "node:assert";
import { describe, it } from "node:test";
import { setTimeout } from "node:timers/promises";
import { lookup, newHandle } from "./index.js";

describe("lookup", () => {
  it("should return a cache entry in fresh state on initial lookup", async () => {
    const handle = newHandle<string, unknown>({
      storeKey: (x) => x,
      loader: async () => {
        return {
          value: {},
        };
      },
    });

    const l = await lookup(handle, "key");
    assert.strictEqual(l.state, "Fresh");
  });

  it("should propagate loader rejection on initial lookup", async () => {
    const handle = newHandle<string, unknown>({
      storeKey: (x) => x,
      loader: async () => {
        throw new Error("Failed");
      },
    });

    await assert.rejects(lookup(handle, "key"), /Failed/);
  });

  it("should transition to Stale state after maxAge", async () => {
    const handle = newHandle<string, unknown>({
      storeKey: (x) => x,
      loader: async () => {
        return {
          value: {},
          cacheControl: {
            maxAge: 0,
            staleWhileRevalidate: 5,
          },
        };
      },
    });

    await lookup(handle, "key");
    await setTimeout(2000);
    const l = await lookup(handle, "key");
    assert.strictEqual(l.state, "Stale");
  });

  it.skip("should transition to Expired state after maxAge + staleWhileRevalidate", () => {
    // TODO
  });

  it.skip("should return the stale value if revalidation fails", () => {
    // TODO
  });

  it("should de-duplicate concurrent initial lookups", async () => {
    let counter = 0;
    const handle = newHandle<string, unknown>({
      storeKey: (x) => x,
      loader: async () => {
        await setTimeout(10);
        return {
          value: counter++,
        };
      },
    });

    const [a, b] = await Promise.all([lookup(handle, "key"), lookup(handle, "key")]);
    assert.strictEqual(a.cacheEntry.result.value, 0);
    assert.strictEqual(b.cacheEntry.result.value, 0);
  });

  it.skip("should de-duplicate concurrent lookups during revalidation", () => {
    // TODO
  });

  it("should evict an expired entry", async () => {
    const handle = newHandle<string, unknown>({
      storeKey: (x) => x,
      loader: async () => {
        return {
          value: {},
          cacheControl: {
            maxAge: 1,
          },
        };
      },
    });

    await lookup(handle, "key");
    assert.strictEqual(handle.cache.size, 1);
    await setTimeout(2000);
    assert.strictEqual(handle.cache.size, 0);
  });

  it("should evict multiple expired entries with the same expiry time", async () => {
    const handle = newHandle<string, unknown>({
      storeKey: (x) => x,
      loader: async () => {
        return {
          value: {},
          cacheControl: {
            maxAge: 1,
          },
        };
      },
    });

    await lookup(handle, "key1");
    await lookup(handle, "key2");
    assert.strictEqual(handle.cache.size, 2);
    await setTimeout(2000);
    assert.strictEqual(handle.cache.size, 0);
  });

  it("should evict multiple expired entries with a different expiry times", async () => {
    let counter = 1;
    const handle = newHandle<string, unknown>({
      storeKey: (x) => x,
      loader: async () => {
        return {
          value: {},
          cacheControl: {
            maxAge: counter++,
          },
        };
      },
    });

    await lookup(handle, "key1");
    await lookup(handle, "key2");
    await lookup(handle, "key3");
    assert.strictEqual(handle.cache.size, 3);
    await setTimeout(4000);
    assert.strictEqual(handle.cache.size, 0);
  });

  it.skip("should trigger a new load if looking up an expired entry before eviction", () => {
    // TODO
  });

  it.skip("should handle cache control with only maxAge", () => {
    // TODO
  });

  it.skip("should handle cache control with only staleWhileRevalidate", () => {
    // TODO
  });

  it.skip("should handle cache control with no cacheControl options", () => {
    // TODO
  });

  it.skip("should work correctly with multiple different keys", () => {
    // TODO
  });

  it("should propagate loader error when no retry policy is set", async () => {
    const handle = newHandle<string, unknown>({
      storeKey: (x) => x,
      loader: async () => {
        throw new Error("Loader failed");
      },
    });

    await assert.rejects(lookup(handle, "key"), "Error/Loader failed");
  });

  it("should retry on loader error during initial lookup according to retry policy", async () => {
    let attempt = 1;
    const handle = newHandle<string, unknown>({
      storeKey: (x) => x,
      loader: async () => {
        if (attempt < 3) {
          throw new Error(`Loader failed on attempt ${attempt++}`);
        }

        return {
          value: {},
        };
      },
      retryPolicy: {
        maxAttempts: 5,
        initialBackoff: 100,
        maxBackoff: 1000,
        backoffMultiplier: 1,
        shouldRetry: () => true,
      },
    });

    const result = await lookup(handle, "key");
    assert.strictEqual(result.cacheEntry.kind, "Present");
    assert.strictEqual(attempt, 3);
  });

  it("should retry on loader error during revalidation according to retry policy", async () => {
    let attempt = 1;
    const handle = newHandle<string, unknown>({
      storeKey: (x) => x,
      loader: async () => {
        if (attempt === 1) {
          return {
            value: `Loader attempt ${attempt++}`,
            cacheControl: {
              maxAge: 0,
              staleWhileRevalidate: 5,
            },
          };
        }

        if (attempt < 4) {
          throw new Error(`Loader failed on attempt ${attempt++}`);
        }

        return {
          value: "success",
        };
      },
      retryPolicy: {
        maxAttempts: 5,
        initialBackoff: 100,
        maxBackoff: 1000,
        backoffMultiplier: 1,
        shouldRetry: () => true,
      },
    });

    await lookup(handle, "key");
    await setTimeout(2000);

    await lookup(handle, "key");
    await setTimeout(1000);

    const result = await lookup(handle, "key");
    assert.strictEqual(result.cacheEntry.result.value, "success");
    assert.strictEqual(attempt, 4);
  });
});
