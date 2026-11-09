---
"saira": patch
---

Keep revalidated cache entries until they expire.

Previously the evictor could remove a freshly revalidated entry at the time the old entry would have expired.
Expired entries are now also evicted in the order they expire, instead of lingering until the entry with the latest expiry time is evicted.
