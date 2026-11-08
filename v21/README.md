# CamoCode v20

CamoCode turns one 8.5 × 11 inch page of rendered writing into a lossless black-and-white PNG containing AES-256-GCM ciphertext. The page may contain plain text, lightweight Markdown, inline LaTeX (`$...$`), and display LaTeX (`$$...$$`). The private decoder authenticates the PNG and restores the exact binary page mask.

The encoder uses a 1224 × 1584 pixel canvas, equivalent to US Letter portrait at 144 pixels per inch. The writing area is centered between equal 108-pixel (0.75-inch) margins on all four sides. Ordinary text wraps inside that area, and oversized display equations are reduced only as much as needed to stay within the left and right margins. It encrypts one page at a time and blocks export when the rendered content overflows that page.

## Private key management

The private sidebar displays the active 256-bit key as 64 hexadecimal characters and a shorter SHA-256 fingerprint. The key can be revealed, copied, restored from a saved value, or replaced with a newly generated cryptographically random key.

The **active key fingerprint** is only a short identifier for the current encryption key. CamoCode hashes the 32-byte private key with SHA-256 and displays the first 16 hexadecimal characters in groups. This lets you confirm that two private copies use the same key without displaying the complete key. The fingerprint cannot decrypt a message; the full 64-character private key is still required.

Generating or adding a key retains previous keys in the browser keyring. The saved-key manager lists every key by fingerprint and lets you activate or remove individual keys. Imported PNGs are tried against the active key and retained older keys, allowing old messages to remain decodable after rotation. Removal requires confirmation, and the final remaining key cannot be removed. Save a key offline before removing it if any older PNG may require it.

Browser local storage is convenience storage, not a hardened secret vault. Copy each important key to secure offline storage. A copied v20 folder does not automatically carry browser-local keys to another computer or browser profile; activate the saved 64-character key there. Anyone possessing the key can decrypt matching PNGs.

## Private visual diagnostics

The encrypted page remains a complete ciphertext field. In the private **Encoded (Text)** view, the red overlay now aligns with the exact ciphertext positions changed by the page mask. Switching between **Encoded (Text)** and **Internal** therefore leaves every non-message pixel unchanged.

The **Cropped** view places three synchronized crops on one page: the full encoded-noise background with authenticated text highlighted red, the encoded pattern clipped inside the text, and the internal pattern clipped inside the text. Cropped, Encoded (Text), Internal, Reveal, and Algorithm are private diagnostics and are not part of the exported public PNG.

## Pixel-exact zoom

The paper viewer supports 25% through 1000% zoom. At 100%, one canvas pixel maps to one CSS pixel; 200%, 300%, and other whole multiples show each source pixel as an evenly sized block. Fractional magnifications such as 125% or 150% must distribute source pixels unevenly across screen pixels and can make random noise appear to change density even though the underlying PNG data is unchanged. Keep browser zoom at 100% and use the in-app Paper zoom control when inspecting ciphertext pixels.

## Does the font matter?

The selected text font changes the original page’s appearance, but the receiver does not need the font, Markdown, LaTeX, or source text. CamoCode renders everything—including equations—to pixels before encryption. Decoding restores those pixels rather than typesetting the source again. Math uses the bundled KaTeX fonts.

## Supported page source

- Headings beginning with `#`, `##`, or `###`
- `**bold**`, `*italic*`, and inline `` `code` ``
- Bulleted and numbered lists
- Block quotes beginning with `>`
- Inline LaTeX between `$` delimiters
- Display LaTeX between `$$` delimiters

This is intentionally a lightweight Markdown parser, not full Obsidian compatibility. Embedded images, plugins, wiki links, tables, and arbitrary HTML are not rendered.

## Workflow

1. Enter one page of text and equations.
2. Check that the status says the content fits on one page.
3. Select **Create fresh encryption & export page PNG**.
4. Send the resulting single PNG to the private decoder operator.
5. Load it into the private copy of CamoCode and select **Decode PNG automatically**.

## How the encryption works

The Web Crypto API is built into modern browsers. CamoCode converts the rendered binary page mask into bytes, generates a fresh random 96-bit nonce, and encrypts the mask using AES-256-GCM and the decoder’s private 256-bit key. AES produces ciphertext bytes that CamoCode displays as black-or-white pixels.

```text
first 96 pixels = public nonce
remaining pixels = encrypted page-mask bits + 128-bit authentication tag
```

The nonce is public and is not the key. The decoder extracts it from the first 96 pixels and combines it with its private master key to decrypt and authenticate the rest of the PNG. Every export receives a new nonce and therefore a new ciphertext pattern.

The rendered text becomes invisible because the exported black-and-white pixels represent encrypted page-mask bits, not partially visible letter pixels. There is no public font boundary for contrast enhancement to recover. With the correct key, authenticated decryption restores the original page bitmap exactly; without the key, properly generated AES ciphertext is designed to be computationally indistinguishable from random data.

## Technical name

The standard cryptographic technology is **AES-256-GCM authenticated encryption**. CamoCode adds a custom **visual ciphertext encoding** that maps encrypted bits to black-and-white PNG pixels. A precise description of the complete proof of concept is **AES-256-GCM ciphertext encoded as a monochrome raster image**.

This is not traditional steganography because the image visibly contains random-looking encrypted data rather than concealing the existence of data inside an ordinary picture. It is also not classical visual cryptography, which normally divides an image into multiple shares that are combined visually.

## Key lifetime and the legacy key

One strong random 256-bit key may encrypt many pages. CamoCode generates a fresh random 96-bit nonce for every export, so a new key is not required for every message. Generate a replacement key when the active key or private decoder may have been compromised, or when separate recipients or projects should not share access.

The **legacy key** is the original fixed key retained in the source code so pages produced by older versions remain decodable. On a fresh installation it may initially be active. Generate and activate a new random key before creating material that is intended to remain private. New exports then use the new key, while the legacy key remains in the browser keyring only for older pages. Legacy-key pages are not secure against anyone who obtains the program source.

The keyring is stored in browser local storage, not in exported PNGs and not in an assistant's memory. It belongs to the current browser profile and web origin. Clearing site data, changing browsers or computers, or opening the app under a different address can make that stored keyring unavailable. Important 64-character keys must therefore be copied to secure offline storage.

To decode on another private copy, activate the original 64-character key, select the unmodified encoded PNG, and choose **Decode PNG automatically**. The shorter fingerprint can confirm which key is active, but it cannot decrypt anything.

## Color and high-resolution images

The current v20 format encrypts a fixed 1224 × 1584 one-bit page mask. It does not preserve arbitrary full-color or high-resolution photographs. A future version could encrypt the original JPEG or PNG file bytes with AES-256-GCM and map the resulting ciphertext bytes across the red, green, and blue channels of a generated noise image. Decryption could then restore the original file exactly.

For efficiency, the original compressed JPEG or PNG bytes should be encrypted before they are mapped into RGB pixels. Encrypted noise does not compress well, so the visual ciphertext PNG may still be substantially larger than the original—particularly for high-resolution photographs. Conventional encrypted files or archives are generally more practical when a visible noise image is not part of the goal.

## Security boundaries

- Keep the decoder and its internal master key private.
- Preserve the exact lossless PNG. Resizing, cropping, filtering, recoloring, screenshots, and JPEG conversion invalidate authentication.
- The browser source contains the legacy key, while newly generated active keys are kept in browser local storage. Distributing the source exposes the legacy key; access to the private browser profile or computer may expose generated keys.
- AES-GCM is established cryptography, but the custom pixel-container format has not received independent security review.
- Encryption conceals the rendered page, but it does not prove who created the message unless key custody and the private computer are also controlled.

## If the private key is compromised

Use **Generate and activate new key** immediately. CamoCode creates a new random 32-byte value and makes it active while retaining previous keys for old-page recovery. PNGs exported afterward use the new key, so the old key cannot decrypt future pages.

Changing the key does not retroactively protect old PNGs. Anyone who copied an old PNG and the compromised key can still decrypt it. Important older pages must be decrypted in a trusted environment and exported again under the new key.

## Bundled components

- KaTeX 0.16.25 renders LaTeX locally.
- html2canvas 1.4.1 converts the rendered page into the bitmap mask.
- Their license files are included under `vendor/`.

No network connection is required after the folder has been installed.

Within its intended scope, v20 is a complete working proof-of-concept: it renders text/Markdown/LaTeX, encrypts the page with AES-256-GCM, exports one PNG, manages keys, authenticates imported PNGs, and restores the page exactly. I wouldn’t call it production-grade security software until it receives independent review, removes the legacy key, improves secure key storage, and adds automated tests—but the app itself is functional and complete for demonstration and experimentation.
