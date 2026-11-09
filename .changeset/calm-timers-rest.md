---
"saira": patch
---

Do not keep the Node.js process alive while entries are cached.

Previously the evictor timer kept the process running until the last cache entry expired, which delayed the exit of scripts, tests, and graceful shutdowns.
The timer is now unref'd in Node.js and runtimes that support unref'ing timers (eg. Bun).
In other runtimes the behavior is unchanged.
