---
title: Clinical audit platform
oneLiner: HIPAA-aligned LLM platform running a 120-question clinical audit protocol in production
kind: LLM platform
status: work
created: 2025-07-01
stack:
  - Python
  - Anthropic API
  - Azure Functions
  - SQL Server
  - GraphQL
  - React
thumb: ../../assets/projects/clinical-audit-1.png
images:
  - ../../assets/projects/clinical-audit-1.png
---

A work project at AI Data Management, where I'm the founding engineer and sole engineer on client-facing products — owning them from discovery through production incident response. The platform runs a 120+ question clinical audit protocol across six question-type handlers, with every LLM response validated against a JSON schema before it goes anywhere.

The headline numbers: physician throughput tripled from 10 to 30+ audits per day, holding 94% agreement against a physician-reviewed gold standard. Under the hood, it's a study in operating LLM systems inside a regulated environment — HIPAA technical safeguards at the application layer, delegated scope-limited authorization (centralized RBAC across eight roles, database-enforced Row-Level Security, JWT-verified serverless endpoints, Azure AD SSO, so every request proves who it acts on behalf of and what that principal can do), and production LLM ops: retrieval and context management over EHR records, concurrency management inside Anthropic API rate limits, prompt caching on shared protocol prefixes, per-user rate limiting, response caching, and human-in-the-loop review queues that keep every model decision traceable to a reviewer.

The platform itself is multi-tenant: a GraphQL API over Postgres with serverless functions, a React frontend, and GitHub Actions CI/CD deploying to Vercel and AWS — consolidating HR/ATS, CRM, email, LMS, and e-commerce behind those eight roles. Data lands through idempotent ELT — hourly batch jobs with concurrency control moving regulated data out of a third-party EHR into SQL Server on Azure, with structured logging and failure alerting, so retries and partial failures never duplicate records.
