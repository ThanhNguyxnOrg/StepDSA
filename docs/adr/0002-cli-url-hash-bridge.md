# ADR 0002: CLI to Web URL Hash Bridge, Transient Trace Loader, and Payload Safety Gate

- **Status:** Accepted
- **Date:** 2026-10-01
- **Deciders:** Antigravity & User

---

## 1. Context

StepDSA features a local CLI (`stepdsa`) allowing developers to trace arbitrary algorithms offline on their local machines. To preserve StepDSA's 100% serverless, zero-backend static architecture (hosted on GitHub Pages), we need a seamless way for the CLI to transport the generated trace snapshot into the user's browser without requiring a remote database, cloud storage, or running a local HTTP server daemon.

However, browser address bars and HTTP clients have URL length constraints (Chrome/Edge reliably support up to ~64KB in URL hash fragments).

---

## 2. Decision

We establish the **URL Hash Transient Bridge** with three architectural components:

1. **`lz-string` URI-Safe Compression:**
   - The CLI serializes the `ExecutionSnapshot` into JSON and compresses it using `lz-string`'s `compressToEncodedURIComponent`.
   - The compressed string is appended as a URL hash fragment: `https://ThanhNguyxnOrg.github.io/StepDSA/#trace=<compressed_data>`.
   - Hashes are never transmitted to web servers via HTTP headers, preserving 100% privacy and zero server logs.

2. **Web App Transient Trace Loading & Visual Session Badge:**
   - On page mount (`useEffect` in `App.tsx`), if `window.location.hash` begins with `#trace=`, the web app decompresses the payload, adapts it via `adaptTraceSnapshotToModule`, and automatically mounts the visualization.
   - Immediately after mounting, `window.history.replaceState` cleans the URL hash to prevent accidental reloads.
   - A distinct visual status badge (`CLI Session Active: <filename>`) is rendered to reassure the developer that their local code snapshot is actively being visualized.

3. **Payload Safety Gate (Threshold: 60KB):**
   - If the compressed payload exceeds 60,000 bytes (~60KB), the CLI halts browser auto-launch to avoid browser URL truncation bugs.
   - The CLI automatically saves `<basename>.stepdsa.json` in the current working directory and prints a clear guide to drag-and-drop the file into StepDSA Developer Studio.

4. **Developer Mode Flag (`--dev`):**
   - By default, `stepdsa run` targets production GitHub Pages. Passing `--dev` or `--local` directs the URL to `http://localhost:5173/`, streamlining local development and testing.

---

## 3. Consequences

### Positive
- **Zero Backend Required:** No servers, no authentication, no database storage costs.
- **Universal Zero-Setup:** Any developer running `npx stepdsa run solution.stepdsa` instantly sees their visualization in their browser with zero configuration.
- **Data Privacy:** User source code and execution memory stay strictly inside the local client environment.
- **Fail-Safe Reliability:** The 60KB payload gate prevents browser crashes on large iterations.

### Negative / Trade-offs
- Very large algorithm executions (>1,000 frames) cannot fit into the URL hash and must use the fallback drag-and-drop workflow.
