#!/usr/bin/env python3
"""Build the isolated editorial concept preview without changing production rules."""
from scripts import build_static_dist

build_static_dist.PUBLIC_DIRECTORIES.add("concept")

if __name__ == "__main__":
    raise SystemExit(build_static_dist.main())
