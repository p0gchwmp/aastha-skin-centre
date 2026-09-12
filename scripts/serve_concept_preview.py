#!/usr/bin/env python3
"""Serve the isolated concept preview with crawler-blocking response headers."""
from http.server import SimpleHTTPRequestHandler, ThreadingHTTPServer
from pathlib import Path
import os

DIST = Path(__file__).resolve().parents[1] / "dist"

class PreviewHandler(SimpleHTTPRequestHandler):
    def __init__(self, *args, **kwargs):
        super().__init__(*args, directory=str(DIST), **kwargs)

    def end_headers(self):
        self.send_header("X-Robots-Tag", "noindex, nofollow, noarchive")
        self.send_header("X-Content-Type-Options", "nosniff")
        self.send_header("Referrer-Policy", "strict-origin-when-cross-origin")
        self.send_header("X-Frame-Options", "SAMEORIGIN")
        self.send_header("Permissions-Policy", "camera=(), microphone=(), geolocation=()")
        super().end_headers()

if __name__ == "__main__":
    port = int(os.environ.get("PORT", "10000"))
    ThreadingHTTPServer(("0.0.0.0", port), PreviewHandler).serve_forever()
