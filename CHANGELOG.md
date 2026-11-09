# saira

## 0.0.7

### Patch Changes

- **Support cache lifetimes longer than 24.8 days.** ([#209](https://github.com/wereHamster/saira/pull/209)) - Previously, when an entry's max-age plus stale-while-revalidate exceeded the maximum delay that setTimeout() supports (about 24.8 days), the evictor timer overflowed and fired immediately, so the entry was evicted right after it was loaded. The evictor now caps the delay and reschedules itself until the entry actually expires.
- **Do not keep the Node.js process alive while entries are cached.** ([#211](https://github.com/wereHamster/saira/pull/211)) - Previously the evictor timer kept the process running until the last cache entry expired, which delayed the exit of scripts, tests, and graceful shutdowns. The timer is now unref'd in Node.js and runtimes that support unref'ing timers (eg. Bun). In other runtimes the behavior is unchanged.
- **Keep revalidated cache entries until they expire.** ([#208](https://github.com/wereHamster/saira/pull/208)) - Previously the evictor could remove a freshly revalidated entry at the time the old entry would have expired. Expired entries are now also evicted in the order they expire, instead of lingering until the entry with the latest expiry time is evicted.

## 0.0.6

### Patch Changes

- **Add explicit types and import conditions to exports** ([#116](https://github.com/wereHamster/saira/pull/116)) - This improves TypeScript IntelliSense and module resolution for modern build tools.

## 0.0.5

### Patch Changes

- **Allow loader to retry on errors.** ([#111](https://github.com/wereHamster/saira/pull/111)) - The default retry policy is "never". However, you can supply a custom retry policy to automatically retry when the loader throws an error. See the 'retryPolicy' field on the 'Option' interface.

## 0.0.3

### Patch Changes

- **Ensure multiple cache entries with same expiry time are evicted properly** ([#14](https://github.com/wereHamster/saira/pull/14)) - Previously the evictor would only evict one cache entry if multiple had the same expiry time.
