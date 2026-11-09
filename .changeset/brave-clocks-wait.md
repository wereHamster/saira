---
"saira": patch
---

Support cache lifetimes longer than 24.8 days.

Previously, when an entry's max-age plus stale-while-revalidate exceeded the maximum delay that setTimeout() supports (about 24.8 days), the evictor timer overflowed and fired immediately, so the entry was evicted right after it was loaded.
The evictor now caps the delay and reschedules itself until the entry actually expires.
