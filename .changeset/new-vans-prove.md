---
"saira": patch
---

Allow loader to retry on errors.

The default retry policy is "never".
However, you can supply a custom retry policy to automatically retry when the loader throws an error.
See the 'retryPolicy' field on the 'Option' interface.
