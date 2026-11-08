# CamoCode

CamoCode is a visual ciphertext tool created by James Michael Moore. It renders text, Markdown, and LaTeX as a page, encrypts the rendered bitmap, and displays the authenticated ciphertext as a black-and-white PNG.

## Editions

### v20 — Standalone CamoCode

The standalone text, equation, and document-page edition. It uses browser Web Crypto AES-256-GCM and does not include OptiCipher.

Open `v20/index.html` in a modern browser or serve the folder from a local web server.

### v21 — CamoCode with OptiCipher plugin

Includes the standalone CamoCode document workflow plus a local OptiCipher companion for full-color image encryption and decryption.

On Windows, double-click `v21/Launch CamoCode v21.cmd`. The launcher checks the Python dependencies, starts the private local server, and opens the app. The server binds only to `127.0.0.1`.

## Security status

This is an educational proof of concept, not independently audited production security software. Do not describe it as unbreakable. Preserve exported ciphertext PNGs exactly; resizing, cropping, filtering, screenshots, or lossy conversion can prevent authentication and recovery. Back up every important key or passphrase securely.

## Copyright and licenses

CamoCode is Copyright © 2026 James Michael Moore and released under the MIT License. Each edition contains its own `LICENSE` file.

CamoCode v21 bundles the MIT-licensed [OptiCipher](https://github.com/bio-colab/OptiCipher) project. **Copyright © 2025 OptiCipher contributors.** Its source, original license, and README are preserved in `v21/opticipher_vendor/`, with an additional notice in `v21/THIRD_PARTY_NOTICES.md`.

KaTeX and html2canvas retain their respective bundled license notices.
