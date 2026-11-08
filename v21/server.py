"""Local CamoCode v21 server with the bundled OptiCipher image plugin."""
from __future__ import annotations

import base64
import io
import json
import os
import sys
import threading
import webbrowser
from http.server import SimpleHTTPRequestHandler, ThreadingHTTPServer
from pathlib import Path

import numpy as np
from PIL import Image

ROOT = Path(__file__).resolve().parent
sys.path.insert(0, str(ROOT / "opticipher_vendor"))
from opticipher import DecryptionError, decrypt_image, encrypt_image  # noqa: E402
from opticipher import header, stego  # noqa: E402

HOST, PORT = "127.0.0.1", 8767


class Handler(SimpleHTTPRequestHandler):
    def _json(self, status: int, payload: dict) -> None:
        body = json.dumps(payload).encode("utf-8")
        self.send_response(status)
        self.send_header("Content-Type", "application/json; charset=utf-8")
        self.send_header("Content-Length", str(len(body)))
        self.end_headers()
        self.wfile.write(body)

    def do_POST(self) -> None:
        if self.path not in ("/api/opti/encrypt", "/api/opti/decrypt", "/api/opti/process"):
            self._json(404, {"error": "Unknown plugin endpoint."})
            return
        try:
            length = int(self.headers.get("Content-Length", "0"))
            if length <= 0 or length > 150_000_000:
                raise ValueError("Image request is empty or too large.")
            request = json.loads(self.rfile.read(length))
            passphrase = str(request.get("passphrase", ""))
            if not passphrase:
                raise ValueError("Enter an OptiCipher passphrase.")
            raw = base64.b64decode(request.get("data", ""), validate=True)
            with Image.open(io.BytesIO(raw)) as source:
                mode = "RGBA" if source.mode == "RGBA" or "transparency" in source.info else "RGB"
                pixels = np.asarray(source.convert(mode), dtype=np.uint8)
            encrypted_input = False
            if self.path.endswith("process"):
                try:
                    header.parse(stego.peek_header_bytes(pixels, header.HEADER_SIZE))
                    encrypted_input = True
                except ValueError:
                    encrypted_input = False
            if self.path.endswith("encrypt") or (self.path.endswith("process") and not encrypted_input):
                output = encrypt_image(pixels, passphrase)
                suffix = "-opticipher-encrypted.png"
                action = "encrypted"
            else:
                output = decrypt_image(pixels, passphrase)
                suffix = "-opticipher-decrypted.png"
                action = "decrypted"
            stream = io.BytesIO()
            Image.fromarray(output).save(stream, format="PNG")
            stem = Path(str(request.get("name", "image"))).stem
            self._json(200, {"action": action, "name": stem + suffix, "data": base64.b64encode(stream.getvalue()).decode("ascii")})
        except (ValueError, DecryptionError) as exc:
            self._json(400, {"error": str(exc)})
        except Exception as exc:
            self._json(500, {"error": f"Plugin error: {exc}"})


if __name__ == "__main__":
    os.chdir(ROOT)
    url = f"http://{HOST}:{PORT}/index.html"
    threading.Timer(0.8, lambda: webbrowser.open(url)).start()
    print(f"CamoCode v21: {url}")
    print("Close this window to stop the local plugin server.")
    ThreadingHTTPServer((HOST, PORT), Handler).serve_forever()
