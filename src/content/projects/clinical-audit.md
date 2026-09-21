---
title: Clinical audit platform
oneLiner: HIPAA-aligned LLM platform running a 120-question clinical audit protocol in production
kind: LLM platform
status: work
created: 2025-07-01
stack:
  - Python
  - Anthropic API
  - GCP
  - PostgreSQL
  - React
  - GraphQL
thumb: ../../assets/projects/clinical-audit-1.png
images:
  - ../../assets/projects/clinical-audit-1.png
---

A work project at AI Data Management, where I'm the founding engineer. The platform runs a 120-question clinical audit protocol across six question-type handlers, with every LLM response validated against a JSON schema before it goes anywhere.

The headline numbers: audit throughput tripled from 10 to 30+ audits per day, holding 94% agreement against a physician-reviewed gold standard. Under the hood, it's a study in operating LLM systems inside a regulated environment — HIPAA technical safeguards at the application layer (access control, audit logging, encryption in transit and at rest), delegated scope-limited authorization (Azure AD SSO, RBAC across eight roles, Postgres Row-Level Security with JWT claims propagated into database sessions so authorization is enforced in exactly one layer), and production LLM ops: concurrency management inside Anthropic API rate limits, prompt caching on shared protocol prefixes, and human-in-the-loop review queues that keep every model decision traceable to a reviewer.

Data lands through idempotent ELT on GCP — Google Batch jobs, Terraform-provisioned, EHR extracts upserted on encounter IDs so retries and partial failures never duplicate records. The product surface is a React frontend over a PostGraphile GraphQL API on Postgres.
