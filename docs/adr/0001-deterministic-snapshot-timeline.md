# Deterministic Snapshot Timeline for Algorithm Stepping

We chose a client-side deterministic snapshot generator over imperative `await sleep(ms)` animation loops. The algorithm runs to completion synchronously and emits an immutable array of `ExecutionFrame` records before rendering begins.

This enables instantaneous scrubbing, zero-latency reverse stepping (undo/rewind), timeline milestone markers, variable playback speeds without timing drift, and zero backend execution dependency.
