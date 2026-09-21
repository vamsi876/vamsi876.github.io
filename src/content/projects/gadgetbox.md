---
title: GadgetBox
oneLiner: cross-platform system-tray app bundling 12 developer utilities
kind: Open source
status: published
created: 2026-02-01
stack:
  - Python
  - pystray
  - tkinter
thumb: ../../assets/projects/gadgetbox-1.png
images:
  - ../../assets/projects/gadgetbox-1.png
demo: https://pypi.org/project/gadgetbox/
---

GadgetBox is a cross-platform system-tray app that bundles 12 developer utilities into one quiet resident: JSON formatter, JWT decoder, UUID generator, Base64 encode/decode, hashing, a regex tester, and more. Published on PyPI in February 2026.

The feature that makes it stick is clipboard auto-detection — copy a JWT and the decoder surfaces itself; copy a blob of JSON and the formatter is already open. It removes the round-trip to a browser tab (and the quiet risk of pasting secrets into a random website) for the dozen little transformations developers do fifty times a day.

Built with pystray and tkinter so it runs anywhere Python does. Small, dependency-light, and deliberately boring in the best way: a tool that disappears into the workflow.
