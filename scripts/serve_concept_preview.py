#!/usr/bin/env python3
"""Serve the isolated concept preview with crawler-blocking headers and gzip."""
from http import HTTPStatus
from http.server import SimpleHTTPRequestHandler, ThreadingHTTPServer
from pathlib import Path
import gzip
import io
import os
import re

DIST = Path(__file__).resolve().parents[1] / "dist"
HASHED_ASSET_RE = re.compile(r"\.[0-9a-f]{12}\.(?:css|js)$", re.I)
COMPRESSIBLE = {
    ".css", ".js", ".html", ".json", ".xml", ".txt", ".svg", ".webmanifest"
}


class PreviewHandler(SimpleHTTPRequestHandler):
    protocol_version = "HTTP/1.1"

    def __init__(self, *args, **kwargs):
        super().__init__(*args, directory=str(DIST), **kwargs)

    def _resolved_file(self) -> Path | None:
        path = Path(self.translate_path(self.path))
        if path.is_dir():
            for index in ("index.html", "index.htm"):
                candidate = path / index
                if candidate.is_file():
                    return candidate
            return None
        return path if path.is_file() else None

    def send_head(self):
        target = self._resolved_file()
        accepts_gzip = "gzip" in self.headers.get("Accept-Encoding", "").lower()
        if target and accepts_gzip and target.suffix.lower() in COMPRESSIBLE:
            raw = target.read_bytes()
            compressed = gzip.compress(raw, compresslevel=6, mtime=0)
            self.send_response(HTTPStatus.OK)
            self.send_header("Content-Type", self.guess_type(str(target)))
            self.send_header("Content-Encoding", "gzip")
            self.send_header("Content-Length", str(len(compressed)))
            self.send_header("Last-Modified", self.date_time_string(target.stat().st_mtime))
            return io.BytesIO(compressed)
        return super().send_head()

    def end_headers(self):
        request_path = self.path.split("?", 1)[0]
        self.send_header("X-Robots-Tag", "noindex, nofollow, noarchive")
        self.send_header("X-Content-Type-Options", "nosniff")
        self.send_header("Referrer-Policy", "strict-origin-when-cross-origin")
        self.send_header("X-Frame-Options", "SAMEORIGIN")
        self.send_header("Permissions-Policy", "camera=(), microphone=(), geolocation=()")
        self.send_header("Vary", "Accept-Encoding")
        if HASHED_ASSET_RE.search(request_path):
            self.send_header("Cache-Control", "public, max-age=31536000, immutable")
        elif request_path.startswith("/assets/"):
            self.send_header("Cache-Control", "public, max-age=3600")
        else:
            self.send_header("Cache-Control", "no-cache")
        super().end_headers()


if __name__ == "__main__":
    port = int(os.environ.get("PORT", "10000"))
    ThreadingHTTPServer(("0.0.0.0", port), PreviewHandler).serve_forever()
