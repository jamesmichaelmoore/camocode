# CamoCode v21 — Complete Documentation

Copyright © 2026 James Michael Moore. CamoCode is released under the MIT License; see `LICENSE`. The bundled OptiCipher plugin retains its separate original copyright and MIT notice.

# Part 1 — Technical and Security Summary

## Image format

CamoCode is fixed to a **1224 × 1584 black-and-white page mask** and encrypts one bit per pixel. The exported PNG displays authenticated ciphertext as black-and-white pixels.

There is no visible font boundary to enhance because the glyph bitmap is encrypted before those pixels are drawn. With the correct key, the decoder reverses the encryption exactly. Without that key, properly generated ciphertext is designed to be computationally indistinguishable from random noise.

## Technology name

The established technology is **AES-256-GCM authenticated encryption**. CamoCode adds a custom **visual ciphertext encoding** that maps encrypted bits to black-and-white PNG pixels.

The complete system does not have a single official standard name. A precise description is **AES-256-GCM ciphertext encoded as a monochrome raster image**.

It is not traditional steganography because the image visibly contains random-looking encrypted data. It is also not classical visual cryptography, which normally uses multiple image shares.

## Comparison with OptiCipher

[OptiCipher](https://github.com/bio-colab/OptiCipher) is very close to what CamoCode eventually became at the conceptual level. Both systems produce a valid noise-looking PNG, preserve enough encrypted information for exact recovery, require a secret, and reject an incorrect secret or damaged ciphertext. Both are best described as research or educational implementations rather than new cryptographic primitives.

The internal methods and intended inputs are different:

### CamoCode v21

- **Primary input:** Text, lightweight Markdown, and LaTeX rendered as a page.
- **Plaintext representation:** Fixed 1224 × 1584 one-bit page bitmap.
- **Main cipher:** AES-256-GCM.
- **Structural transformation:** Encrypts the packed page-mask bits.
- **Value transformation:** AES-GCM ciphertext bits become black or white pixels.
- **Integrity protection:** Built-in 128-bit GCM authentication tag.
- **Secret input:** Random 256-bit key represented by 64 hexadecimal characters.
- **Public per-file data:** Random 96-bit nonce stored in the first 96 pixels.
- **Output appearance:** Fixed-size monochrome noise page.
- **Exact recovery:** Restores the rendered binary page bitmap.

### OptiCipher

- **Primary input:** Existing RGB or RGBA image.
- **Plaintext representation:** Original color pixels.
- **Main cipher:** ChaCha20.
- **Structural transformation:** Fisher–Yates pixel-position permutation.
- **Value transformation:** ChaCha20 changes the color-channel values.
- **Integrity protection:** HMAC-SHA256.
- **Secret input:** Human passphrase processed through PBKDF2-HMAC-SHA256.
- **Public per-file data:** Salt, iteration count, dimensions, and other header data stored in extra rows.
- **Output appearance:** Color noise image related to the source dimensions.
- **Exact recovery:** Restores the original image pixels.

The final visual result is similar, but the masking method is not identical. CamoCode renders the text into a black-and-white bitmap and then AES-256-GCM encrypts the bitmap bits. Its visible “pattern” is ciphertext, not a decorative texture clipped inside letter shapes. OptiCipher starts with an ordinary color image, rearranges pixel positions, and changes every color value with a ChaCha20 keystream. CamoCode therefore uses authenticated bit encryption, while OptiCipher combines color diffusion with spatial scrambling.

Neither final system uses the original Inkscape-style pattern-fill idea in which a precise geometric texture visually hides and later reveals font edges. OptiCipher resembles the final AES/noise-PNG version of CamoCode, not that earlier texture-fill concept. CamoCode remains distinct in its document renderer, fixed one-bit page format, private aligned diagnostic views, and browser key manager; however, the broader idea of displaying reversible encrypted data as image noise already exists.

### Which program should be used?

Use **CamoCode for text, equations, and document pages**. Its interface is specifically designed for typing and formatting text, rendering Markdown and LaTeX, fitting content onto a printable page, managing document-encryption keys, and recovering the rendered page through private diagnostic views.

Use **OptiCipher for ordinary images, full-color artwork, photographs, and high-resolution image files**. OptiCipher can technically perform CamoCode’s broad cryptographic job if text is first rendered or captured as an image, but it does not provide CamoCode’s document-oriented interface. In v21, the bundled OptiCipher Image Plugin provides its image workflow inside the CamoCode sidebar while keeping the OptiCipher passphrase separate from the CamoCode AES keyring.

Choose an image and passphrase, then select **Auto-detect and process image**. CamoCode displays the input and result side by side in the **OptiCipher Image** tab. An ordinary image is encrypted automatically; an OptiCipher PNG is detected from its embedded header and decrypted after its passphrase authenticates. Select **Download result** only when you want to save the displayed output.

## Nonces and key rotation

CamoCode creates a fresh random nonce for every export. Generate another key if the current key or private decoder might have been compromised, or if you deliberately want separate security groups.

The exception is the original hardcoded legacy key. Replace it with a newly generated key before treating the proof of concept as private.

## Browser keyring

The app keeps a **local keyring in this browser’s storage**—not in an assistant’s memory and not inside exported PNGs. It remembers the active key plus earlier keys so old files remain decodable.

Those keys belong specifically to the current browser profile and address (`http://127.0.0.1:8765`). Clearing browser data, changing computers, changing the app address, or using another browser can make the stored keyring unavailable. Always copy important 64-character keys to secure offline storage.

## Legacy key

The **legacy key** is the original fixed 32-byte key hardcoded inside CamoCode so PNGs created by older versions remain decodable. On a fresh v21 installation, it may initially be the active key.

Select **Generate and activate new key** before creating important PNGs. New exports will use that newly generated random key. The legacy key remains available only for decoding older images, and those older images should not be considered secure if anyone obtains the program’s source code.

## Practical security

It is **practically infeasible to break by attacking AES-256-GCM directly** when the 64-character key is genuinely random, secret, and safely stored. It is not literally unbreakable.

The realistic attacks are stealing the key or private program, accessing browser storage, installing malware, capturing the screen, obtaining plaintext before encryption, or exploiting an undiscovered implementation mistake. Because the initial legacy key is hardcoded in the source, generate a new key before relying on the app for privacy. With a fresh key and a protected private decoder, brute-forcing the PNG is not a realistic attack.

## Decoding a PNG

In the private decoder, paste the original **64-character key** into **Restore or activate an existing key**, activate it, select the matching encoded PNG, and then select **Decode PNG automatically**.

The app will reveal the page only if the key matches and the PNG has not been resized, cropped, converted, filtered, recolored, or otherwise altered. The fingerprint alone cannot decode it.

## Active key fingerprint

The **active key fingerprint** is a short identifier for the current encryption key. CamoCode hashes the 32-byte private key with SHA-256 and displays the first 16 hexadecimal characters in groups.

The fingerprint lets you confirm that two private copies use the same key without displaying the key itself. It cannot decrypt messages; the complete 64-character key is still required.

---

# Part 2 — Complete App Guide and Instructions

## Project status

Within its intended scope, v21 is a complete working proof-of-concept: it renders text/Markdown/LaTeX, encrypts the page with AES-256-GCM, exports one PNG, manages keys, authenticates imported PNGs, restores the page exactly, and includes an OptiCipher companion for color images. I wouldn’t call it production-grade security software until it receives independent review, removes the legacy key, improves secure key storage, and adds automated tests—but the app itself is functional for demonstration and experimentation.

## Overview

CamoCode turns one 8.5 × 11 inch page of rendered writing into a lossless black-and-white PNG containing AES-256-GCM ciphertext. A page may contain plain text, lightweight Markdown, inline LaTeX (`$...$`), and display LaTeX (`$$...$$`). The private decoder authenticates the PNG and restores the exact binary page mask.

CamoCode uses a fixed **1224 × 1584 black-and-white page mask**, equivalent to US Letter portrait at 144 pixels per inch, and encrypts one bit per pixel. The writing area is centered between equal 108-pixel (0.75-inch) margins on all four sides. Ordinary text wraps inside that area, and oversized display equations are reduced only as much as needed to remain inside the left and right margins. The app encrypts one page at a time and blocks export when rendered content overflows the page.

## Detailed step-by-step instructions

### A. Prepare the private app

1. Open CamoCode v21 using **Launch CamoCode v21.cmd**.
2. Find **Private Key Management** in the left sidebar.
3. If the active key is the original legacy key, select **Generate and activate new key** before creating anything intended to remain private.
4. Select **Show key** and copy the complete 64-character key to secure offline storage.
5. Record the shorter active-key fingerprint as a convenient identifier. Remember that the fingerprint cannot decrypt a PNG.
6. Keep the private app, browser profile, and complete keys away from anyone who should not be able to decode the pages.

### B. Create and export an encrypted page

1. Enter the message in **Page source**.
2. Use ordinary text or the supported lightweight Markdown and LaTeX syntax.
3. Select the desired font, weight, and body size.
4. Wait for the live page to finish rendering and encrypting.
5. Confirm that the status says the content fits on one page. If it reports overflow, shorten the source or reduce the body size.
6. Use the **Reveal** tab privately if you need to confirm the rendered plaintext page before export.
7. Return to **Encoded**. This is the only public/sendable view.
8. Select **Create fresh encryption & export page PNG**.
9. CamoCode creates a fresh random nonce, encrypts the page again, and downloads `camocode-v21-letter-page.png`.
10. Send only that exported PNG. Do not send **Encoded (Text)**, **Internal**, **Cropped**, **Reveal**, **Algorithm**, the private app, or the 64-character key through the same public channel.

### C. Decode an encrypted PNG

1. Open a private copy of CamoCode v21 using its launcher.
2. Confirm that the required key appears in **Saved key manager**. Compare its fingerprint with your records.
3. If the key is missing, paste its complete 64-character value into **Add an existing key**.
4. Select **Add and activate entered key**.
5. Under **Private Decode**, choose the original encoded PNG.
6. Select **Decode PNG automatically**.
7. CamoCode reads the public nonce, tries the saved keys, verifies the AES-GCM authentication tag, and opens **Reveal** when a matching key succeeds.
8. If decoding fails, confirm that the complete key is correct and that the PNG was not resized, cropped, converted, filtered, recolored, screenshotted, or changed to JPEG.

### D. Add, activate, and remove saved keys

1. To add a key, paste exactly 64 hexadecimal characters into **Add an existing key** and select **Add and activate entered key**.
2. To switch keys, find the desired fingerprint under **Saved key manager** and select **Activate**.
3. New exports always use the currently active key.
4. Imported PNGs are tested against the active key and the other saved keys until one authenticates successfully.
5. To remove a key from this browser, select **Remove** beside its fingerprint and approve the warning.
6. The final remaining key cannot be removed. Add another key first if you need to remove the current final key.
7. Removing a key does not alter PNGs that were encrypted with it. Those PNGs become undecodable in that browser unless the removed 64-character key is added again.
8. Save every needed key offline before removing it.

### E. Test incorrect-key rejection correctly

Because CamoCode tries every retained key, merely activating an incorrect key does not prove rejection when the correct key is still saved. For a valid test:

1. Back up every important key first.
2. Add a random incorrect 64-character key.
3. Remove all saved keys that could correctly decrypt the test PNG, leaving the incorrect key available.
4. Import the test PNG and select **Decode PNG automatically**.
5. The app should report that no retained key authenticated the PNG.
6. Add the correct 64-character key again and repeat the decode. The original page should then be restored exactly.

### F. Preserve the ciphertext file

1. Keep the exported PNG lossless and unchanged.
2. Transfer it as a file rather than through a service that may resize or recompress images.
3. Do not crop it, edit it, take a screenshot of it, convert it to JPEG, or apply filters.
4. Keep the matching key backed up separately from the PNG.

## Standard workflow

1. Enter one page of text and equations.
2. Confirm that the status says the content fits on one page.
3. Select **Create fresh encryption & export page PNG**.
4. Send the resulting single PNG to the private decoder operator.
5. In the private decoder, activate the original 64-character key.
6. Select the matching encoded PNG.
7. Select **Decode PNG automatically**.

The page will be revealed only if the key matches and the PNG has not been resized, cropped, converted, filtered, recolored, or otherwise altered. The key fingerprint alone cannot decrypt it.

## How the encryption works

The Web Crypto API is built into modern browsers. CamoCode converts the rendered binary page mask into bytes, generates a fresh random 96-bit nonce, and encrypts the mask using AES-256-GCM and the private 256-bit key. AES produces ciphertext bytes that CamoCode displays as black-or-white pixels.

```text
first 96 pixels = public random nonce
remaining pixels = encrypted page-mask bits + 128-bit authentication tag
```

The nonce is public and is not the key. The decoder extracts it from the first 96 pixels and combines it with the private key to decrypt and authenticate the rest of the PNG. Every export receives a new random nonce and therefore a new ciphertext pattern.

The exported PNG displays authenticated ciphertext as black-and-white pixels. There is no visible font boundary to enhance because the glyph bitmap is encrypted before those pixels are drawn. With the correct key, the decoder reverses the encryption exactly. Without that key, properly generated AES ciphertext is designed to be computationally indistinguishable from random data.

## Technical name

The established cryptographic technology is **AES-256-GCM authenticated encryption**. CamoCode adds a custom **visual ciphertext encoding** that maps encrypted bits to black-and-white PNG pixels.

The complete system does not have one official standard name. A precise description is **AES-256-GCM ciphertext encoded as a monochrome raster image**.

It is not traditional steganography because the image visibly contains random-looking encrypted data rather than concealing the existence of data inside an ordinary picture. It is also not classical visual cryptography, which normally divides an image into multiple shares that are combined visually.

## Private key management

The private sidebar displays the active 256-bit key as 64 hexadecimal characters and a shorter SHA-256 fingerprint. The key can be revealed, copied, restored from a saved value, or replaced with a newly generated cryptographically random key.

Generating or adding a key retains previous keys in the browser keyring. The saved-key manager lists each key by fingerprint and lets you activate or remove individual keys. Imported PNGs are tried against the active key and retained older keys until AES-GCM authentication succeeds. This allows older messages to remain decodable after key rotation. Removal requires confirmation, and the final remaining key cannot be removed. Save a key offline before removing it if an older PNG may require it.

One strong random 256-bit key may encrypt many pages because CamoCode generates a fresh random 96-bit nonce for every export. Generate another key if the current key or private decoder might have been compromised, or when separate recipients, projects, or security groups should not share access.

## Active key fingerprint

The **active key fingerprint** is only a short identifier for the current encryption key. CamoCode hashes the 32-byte private key with SHA-256 and displays the first 16 hexadecimal characters in groups.

The fingerprint lets you confirm that two private copies use the same key without displaying the complete key. It cannot decrypt messages; the full 64-character private key is still required.

## Browser keyring and backups

The app keeps a **local keyring in this browser’s storage**—not in an assistant’s memory and not inside exported PNGs. It remembers the active key plus earlier keys so old files remain decodable.

Browser local storage is convenience storage, not a hardened secret vault. The stored keys belong to the current browser profile and web origin. In the current local setup, that origin is `http://127.0.0.1:8765`. Clearing site data, changing computers, changing browsers, changing the app address, or opening the app under a different origin can make that keyring unavailable.

Copy every important 64-character key to secure offline storage. Copying the v21 folder does not automatically transfer browser-local keys to another computer or browser profile. Activate the saved key manually in the other private copy. Anyone possessing the complete key can decrypt matching PNGs.

## Legacy key

The **legacy key** is the original fixed 32-byte key hardcoded inside CamoCode so PNGs created by older versions remain decodable. On a fresh v21 installation, it may initially be the active key.

Select **Generate and activate new key** before creating important PNGs. New exports will use the newly generated random key. The legacy key remains in the browser keyring for decoding older images, but legacy-key images should not be considered secure if anyone obtains the program source.

## Private visual diagnostics

The encrypted page remains a complete ciphertext field. In the private **Encoded (Text)** view, the red overlay aligns with the exact ciphertext positions changed by the page mask. Switching between **Encoded (Text)** and **Internal** leaves every non-message pixel unchanged.

The **Cropped** view places three synchronized crops on one page:

- The full encoded-noise background with authenticated text highlighted red.
- The encoded pattern clipped inside the text.
- The internal pattern clipped inside the text.

**Cropped**, **Encoded (Text)**, **Internal**, **Reveal**, and **Algorithm** are private diagnostics. They are not included in the exported public PNG and should not be sent with it.

## Pixel-exact zoom

The paper viewer supports 25% through 1000% zoom. At 100%, one canvas pixel maps to one CSS pixel. At 200%, 300%, and other whole multiples, each source pixel appears as an evenly sized block.

Fractional magnifications such as 125% or 150% must distribute source pixels unevenly across screen pixels. This can make random noise appear to change density even though the underlying PNG data remains unchanged. Keep browser zoom at 100% and use the in-app **Paper zoom** control when inspecting ciphertext pixels.

## Fonts, Markdown, and LaTeX

The selected font changes the original page’s appearance, but the receiver does not need the font, Markdown, LaTeX, or source text. CamoCode renders everything—including equations—to pixels before encryption. Decoding restores those pixels rather than typesetting the source again. Math uses the bundled KaTeX fonts.

Supported page source includes:

- Headings beginning with `#`, `##`, or `###`.
- `**bold**`, `*italic*`, and inline `` `code` ``.
- Bulleted and numbered lists.
- Block quotes beginning with `>`.
- Inline LaTeX between `$` delimiters.
- Display LaTeX between `$$` delimiters.

This is intentionally a lightweight Markdown parser, not full Obsidian compatibility. Embedded images, plugins, wiki links, tables, and arbitrary HTML are not rendered.

## Practical security

It is **practically infeasible to break by attacking AES-256-GCM directly** when the 64-character key is genuinely random, secret, and safely stored. It is not literally unbreakable.

Realistic attacks include stealing the key or private program, accessing browser storage, using malware, capturing the screen, obtaining plaintext before encryption, or exploiting an undiscovered implementation mistake. With a fresh random key and a protected private decoder, brute-forcing the PNG is not a realistic attack.

Security boundaries include:

- Keep the decoder and its active key private.
- Generate a fresh key instead of relying on the hardcoded legacy key.
- Preserve the exact lossless PNG. Resizing, cropping, filtering, recoloring, screenshots, or JPEG conversion invalidate authentication.
- The browser source contains the legacy key, while newly generated keys are stored in browser local storage. Distributing the source exposes the legacy key; access to the private browser profile or computer may expose generated keys.
- AES-GCM is established cryptography, but this custom pixel-container format has not received independent security review.
- Encryption conceals the rendered page but does not prove who created the message unless key custody and the private computer are also controlled.

## If a private key is compromised

Select **Generate and activate new key** immediately. CamoCode creates a new random 32-byte value and makes it active while retaining previous keys for old-page recovery. PNGs exported afterward use the new key, so the compromised key cannot decrypt future pages.

Changing the key cannot retroactively protect old PNGs. Anyone who copied an old PNG and its compromised key can still decrypt that page. Important older pages must be decrypted in a trusted environment and exported again under the new key.

## Color and high-resolution images

The CamoCode text format encrypts a fixed 1224 × 1584 one-bit page mask. The bundled OptiCipher plugin handles arbitrary full-color and high-resolution images separately.

A future version could encrypt the original JPEG or PNG file bytes with AES-256-GCM and map the resulting ciphertext bytes across the red, green, and blue channels of a generated noise image. Decryption could then restore the original color file exactly.

For efficiency, the original compressed JPEG or PNG bytes should be encrypted before they are mapped into RGB pixels. Encrypted noise does not compress well, so the visual ciphertext PNG may still be substantially larger than the original, particularly for high-resolution photographs. Conventional encrypted files or archives are generally more practical when a visible noise image is not part of the goal.

## Bundled components

- KaTeX 0.16.25 renders LaTeX locally.
- html2canvas 1.4.1 converts the rendered page into the bitmap mask.
- Their license files are included under `vendor/`.

No network connection is required after the folder has been installed.

## OptiCipher copyright and license

CamoCode v21 bundles the OptiCipher image-encryption plugin from [bio-colab/OptiCipher](https://github.com/bio-colab/OptiCipher).

**Copyright © 2025 OptiCipher contributors.** OptiCipher is used under the MIT License. Its original source, README, copyright notice, permission notice, and warranty disclaimer are preserved under `opticipher_vendor/`. The complete third-party notice is also reproduced in `THIRD_PARTY_NOTICES.md`.
