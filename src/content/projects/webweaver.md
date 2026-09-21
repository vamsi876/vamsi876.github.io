---
title: WebWeaver
oneLiner: async Python web-crawling library, published on PyPI
kind: Open source
status: published
created: 2024-09-01
stack:
  - Python
  - asyncio
  - aiohttp
thumb: ../../assets/projects/webweaver-1.png
images:
  - ../../assets/projects/webweaver-1.png
demo: https://pypi.org/project/webweaver/
---

WebWeaver is an async web-crawling library I co-authored during my graduate work at Indiana State University, published on PyPI in September 2024. It's built on asyncio and aiohttp, with robots.txt compliance, URL deduplication, and both BFS and recursive crawl modes.

It wasn't a toy — it was the ingestion layer for a real problem. Campus data-privacy rules prohibited external API calls, so we built our RAG knowledge assistant on self-hosted models and needed our own corpus. WebWeaver crawled 40,000+ university URLs, which we distilled into the 8,000-document policy corpus backing the Pinecone-backed assistant.

The design tension was politeness versus throughput: a crawler fast enough to chew through tens of thousands of pages without hammering any single host, which is where the async concurrency model and per-domain rate awareness earn their keep.
