# saira

## 0.0.5

### Patch Changes

- **Allow loader to retry on errors.** ([#111](https://github.com/wereHamster/saira/pull/111)) - The default retry policy is "never". However, you can supply a custom retry policy to automatically retry when the loader throws an error. See the 'retryPolicy' field on the 'Option' interface.

## 0.0.3

### Patch Changes

- **Ensure multiple cache entries with same expiry time are evicted properly** ([#14](https://github.com/wereHamster/saira/pull/14)) - Previously the evictor would only evict one cache entry if multiple had the same expiry time.
