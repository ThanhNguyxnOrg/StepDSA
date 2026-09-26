# Client-First Architecture with GitHub Pages Static Deployment

We chose a 100% client-first Single-Page Application (SPA) architecture deployed to GitHub Pages via automated GitHub Actions. All state generation, algorithm simulation, and timeline rendering occur locally in the user's browser thread or WebWorker.

Learner progress, bookmarks, custom playground inputs, and visual preferences are persisted in `localStorage`. This eliminates backend infrastructure costs, cold-start latency, and deployment complexity while providing instantaneous offline responsiveness.
