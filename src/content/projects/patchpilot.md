---
title: PatchPilot
oneLiner: an AI reviewer that reads every pull request and keeps one summary comment updated
kind: Web app
status: in progress
created: 2026-09-21
stack:
  - FastAPI
  - Next.js
  - Anthropic API
  - GitHub Apps
thumb: ../../assets/projects/patchpilot-1.png
images:
  - ../../assets/projects/patchpilot-1.png
repo: https://github.com/vamsi876/patchpilot
---

PatchPilot is an AI code reviewer for GitHub pull requests, built as a production-oriented full-stack project: a FastAPI backend, a Next.js dashboard, and Anthropic's API doing the review work, wired together through a GitHub App.

When a PR is opened or updated, the backend verifies the webhook signature (HMAC-SHA256), deduplicates the delivery, fetches the PR metadata and raw diff, and runs one structured review against the diff. It then publishes a single summary comment — tagged so every later push updates the same comment instead of spamming the thread. The dashboard streams review progress live.

Phase 1 is a deliberately thin vertical slice: one review pass, in-memory state, no persistence. The roadmap is the interesting part — retrieval over the repo with pgvector for context-aware reviews, Temporal for durable review pipelines, and Redis/Postgres for state and caching.
