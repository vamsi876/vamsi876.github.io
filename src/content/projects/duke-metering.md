---
title: Smart-meter data services
oneLiner: metering and billing data platform for 10,000+ daily active users at Duke Energy
kind: Data platform
status: work
created: 2022-01-01
stack:
  - REST
  - Kafka
  - Redis
  - PostgreSQL
  - D3.js
thumb: ../../assets/projects/duke-metering-1.png
images:
  - ../../assets/projects/duke-metering-1.png
---

Work from my time at Cognizant, building full-stack services for Duke Energy's customer platform. I built and tested REST API endpoints serving metering, billing, and account data from Oracle and SAP systems to a high-traffic customer self-service platform used by 10,000+ daily active users.

The latency story: p95 response times dropped from 2.5 seconds to under 1 second through composite indexing, restructured joins, and eliminated N+1 patterns on multi-million-row smart-meter (AMI) tables — targeted queries got 30% faster — plus Redis read-through caching (15-minute TTL) and connection pooling on the hottest endpoints to absorb peak traffic.

On the product surface I built the billing and usage views of the customer portal — usage analytics, billing history, outage status — with D3.js components, held to 85%+ unit and integration test coverage (Jest, React Testing Library). On the event-driven side, I implemented Kafka consumers and message handlers for the outage and billing notification workflows (email and SMS) with idempotent handling — retries are safe, and customers are never double-notified. It's the kind of distributed-systems plumbing that's invisible when it works and catastrophic when it doesn't, which is exactly why the idempotency mattered.
