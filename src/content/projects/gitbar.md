---
title: GitBar
oneLiner: macOS menubar Git dashboard — PRs, issues, and CI status across GitHub, GitLab, and Bitbucket
kind: Open source
status: published
created: 2026-03-01
stack:
  - Python
  - PyObjC
  - REST APIs
thumb: ../../assets/projects/gitbar-1.png
images:
  - ../../assets/projects/gitbar-1.png
demo: https://pypi.org/project/gitbar/
---

GitBar is a multi-repo Git dashboard that lives in the macOS menubar — pull requests, issues, CI status, and local repo health at a glance, without opening a browser or a terminal. Published on PyPI in March 2026.

It aggregates across GitHub, GitLab, and Bitbucket through their REST APIs, so a morning check is one click instead of a dozen tabs. The macOS integration is native via PyObjC rather than a cross-platform tray shim, which is what keeps it feeling like it belongs in the menubar: lightweight, instant, and quiet until something needs attention.

The interesting engineering is in the polling model — keeping state fresh across three providers with different rate limits and webhook capabilities, without turning the menubar into a battery drain. It's the same "boring infrastructure that has to be right" instinct as the rest of my work, just pointed at my own workflow for once.
