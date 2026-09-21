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
thumb: ../../assets/projects/duke-metering-1.png
images:
  - ../../assets/projects/duke-metering-1.png
---

Work from my time at Cognizant, building full-stack services for Duke Energy's customer platform. The services I built served metering and billing data to 10,000+ daily active users, backed by multi-million-row smart-meter (AMI) tables.

The latency story: p95 response times dropped from 2.5 seconds to under 1 second through composite indexing and query optimization on those AMI tables, plus Redis read-through caching (15-minute TTL) on the read-heavy metering endpoints to absorb peak traffic.

On the event-driven side, I implemented Kafka consumers for outage and billing notification workflows with idempotent handling — retries are safe, and customers are never double-notified. It's the kind of distributed-systems plumbing that's invisible when it works and catastrophic when it doesn't, which is exactly why the idempotency mattered.
