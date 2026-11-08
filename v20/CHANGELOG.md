# Changelog

## v20 — 2026-11-07

- Preserved v19 unchanged and created v20 as a separate version.
- Added a saved-key manager that lists every browser key by SHA-256 fingerprint.
- Added controls to activate any saved key without re-entering its 64-character value.
- Added confirmed removal of individual saved keys from the browser keyring.
- Prevented removal of the final remaining key so the app always has an active encryption key.
- Added v19-keyring migration when v20 is opened under the same browser origin.
- Updated the interface, export filename, README files, and security guidance for v20.

## v19 — 2026-11-07

- Added a private panel that displays the complete active 256-bit key and its SHA-256 fingerprint.
- Added show, hide, and clipboard-copy controls for the active key.
- Added cryptographically random key generation using `crypto.getRandomValues`.
- Added restoration and activation of an existing 64-character hexadecimal key.
- Added a browser-local keyring that retains every previous key rather than deleting it.
- Updated PNG decoding to try the active key and all retained older keys until AES-GCM authentication succeeds.
- Combined three synchronized Cropped views on one page: encoded background with red text, encoded pattern inside text, and internal pattern inside text.
- Reinforced equal 0.75-inch page margins, wrapped long text inside the printable area, and automatically fitted oversized display equations so content cannot drift off the right edge.
- Preserved v18 unchanged and created v19 as a separate version.

## v18 — 2026-09-25

- Added in-app paper zoom from 25% through 1000%, plus Fit and 100% controls.
- Switched canvas enlargement to pixelated rendering for direct inspection of binary ciphertext pixels.
- Added clear PRIVATE labels to every decrypted diagnostic while leaving Encoded as the only public/sendable view.
- Explained that Cropped is readable because it uses the authenticated decrypted glyph mask as its clipping shape.
- Documented browser-resampling artifacts at fractional zoom levels and recommended whole-multiple in-app zoom for pixel inspection.
- Advanced the active folder, interface, documentation, and export filename to v18 without modifying `vh`.

## v17 — 2026-09-25

- Corrected the 128-pixel mask/ciphertext alignment error caused by reserving the authentication-tag space at the beginning of the page mask.
- Aligned page-mask bits directly with ciphertext pixels after the 96-pixel nonce.
- Made the private Internal comparison reuse the public tag pixels so view switching changes only message positions.
- Changed both Cropped diagnostics from rectangular noise fields to patterns clipped strictly inside the recovered text and equation shapes.
- Advanced the active folder, interface, documentation, and export filename to v17 without modifying `vh`.

## v16 — 2026-09-23

- Changed the encrypted canvas from a horizontal text strip to one US Letter portrait page.
- Set the page to 1224 × 1584 pixels, equivalent to 8.5 × 11 inches at 144 pixels per inch.
- Added page margins, automatic wrapping, and an overflow check that prevents clipped exports.
- Added lightweight Markdown rendering for headings, emphasis, code, lists, rules, and block quotes.
- Added inline `$...$` and display `$$...$$` LaTeX equations using locally bundled KaTeX.
- Added local page rasterization so rendered text and mathematics become one binary mask before AES encryption.
- Documented that decoding restores pixels and does not require the original font or LaTeX source.
- Updated the export name, interface text, algorithm display, and bundled dependency notices for v16.

## v15.1 — 2026-09-23

- Documented emergency key rotation, the limits of retroactive protection, re-encryption of important archives, retirement of compromised keys, and key-generation numbering.

## v15 — 2026-09-22

- Added a Cropped tab with isolated Encoded and Internal Pattern crops.
- Automatically finds the recovered text bounding box and adds a 20-pixel margin.
- Updates cropped views for both live text and imported PNGs.
- Displays the exact crop coordinates and dimensions.

## v14 — 2026-09-22

- Added an Encoded (Text) diagnostic between the Encoded and Internal views.
- Preserved the encoded noise while tinting the recovered text region red.
- Added Encoded, Encoded (Text), Internal, Reveal, and Algorithm tabs.
- Added the diagnostic for both live messages and imported PNGs.
- Kept the diagnostic private and excluded it from public PNG exports.

## v13 — 2026-09-22

- Replaced the predictable fixed pattern with AES-256-GCM authenticated encryption.
- Added automatic fresh 96-bit nonce generation for every exported PNG.
- Stored the public nonce as the first 96 binary image pixels, not as metadata.
- Derived a unique internal pattern for each message from the nonce and private master key.
- Added a 128-bit authentication tag so altered or incorrect PNGs fail decoding.
- Preserved the one-PNG/private-decoder workflow with no external key file or parameters.
- Removed manual pattern randomization; secure pattern rotation now happens automatically on export.
- Prevented fixed-pattern comparison and generator-state recovery attacks from v12.

## v12 — 2026-09-22

- Replaced the two-PNG workflow with one encoded PNG and one private decoder.
- Embedded the complete deterministic pattern generator inside the private program.
- Removed key-PNG export and key-PNG import.
- Removed pattern selection and parameter entry from decoding.
- Added automatic internal pattern regeneration based solely on PNG dimensions.
- Added exact XOR recovery from one imported PNG.
- Documented the security consequences of keeping the decoder private and reusing a deterministic pattern.

## v11 — 2026-09-22

- Replaced irreversible texture clipping with exact binary XOR encoding.
- Made the complete pattern PNG the decryption key.
- Added a recommended 50/50 one-time pattern generated with the browser's cryptographically secure random source.
- Changed the public output to a complete camouflage texture with no visible font boundary.
- Added separate exports for the encoded PNG and secret pattern-key PNG.
- Added exact PNG-to-PNG decryption with no OCR, font, parameters, metadata, or grayscale trace.
- Added validation that imported ciphertext and key images have identical dimensions.
- Retained artistic deterministic patterns for experimentation while clearly distinguishing them from the random one-time pattern.
- Updated the live algorithm display, application version, filenames, and documentation.

## v10 — 2026-09-22

- Added a Full Pattern tab showing the complete unmasked binary texture field.
- Added export of the complete pattern as a PNG.
- Added a live algorithm panel containing every current numeric parameter.
- Added the exact executing JavaScript source for coordinate transforms, carrier generation, binary thresholding, font masking, and text clipping.
- Changed the working folder, application title, exports, and launch configuration to v10.

## v9 — 2026-09-22

- Replaced grayscale texture rendering with strict binary black-or-white output.
- Removed the faint full-glyph trace exploited by the v8 threshold attack.
- Replaced texture opacity with binary texture density.
- Changed PNG analysis to extract black texture marks only.
- Added optional morphological gap filling for adversarial testing.
- Documented that exact keyless recovery is no longer guaranteed because white glyph pixels carry no recoverable information.

## v8 — 2026-09-22

- Renamed the active working folder and application from v3 to v8.
- Added direct PNG pixel loading and reconstruction with no key or embedded settings.
- Added automatic background detection from image-corner pixels.
- Added an adjustable recovery threshold and pixel-analysis report.
- Changed the live Reveal pane to use the same pixel-only path as imported PNGs.
- Documented that the faint full-glyph trace makes the current format vulnerable to keyless threshold recovery.

## v3.2.1 — 2026-09-22

- Documented recovery risks, information leakage, lossless-image requirements, key separation, and the danger of key reuse.

## v3.2 — 2026-09-22

- Removed the pattern contrast control and contrast field from new keys.
- Added a sparse, non-repeating Riemann wave field based on logarithmic prime-frequency interference.
- Made the Riemann wave field the default encoding texture.
- Expanded pattern scale from 70 to 250 and changed its default to 112.37.
- Reduced the low-level recovery trace so the underlying glyph silhouette is less visible.
- Updated key randomization for the larger irregular pattern scale.

## v3.1 — 2026-09-22

- Removed the full-canvas pattern backdrop.
- Encoding texture is now clipped directly to the text, matching Inkscape pattern fill behavior.
- Text entered in the message box updates the camouflage pane automatically.
- Replaced carrier subtraction with texture normalization for solid-glyph recovery.
- Changed embedding strength to texture opacity and set the default to 97.5%.

## v3 — 2026-09-22

- Rebuilt encoding around a continuous full-canvas carrier texture.
- Text now creates a low-strength phase disturbance inside normal font glyphs.
- Added hexagon packing, waves, checker, dots, and cross-weave carriers.
- Added fine-grained scale, orientation, offset, contrast, phase, and strength controls.
- Added system font, weight, size, and multiline text controls.
- Added lossless PNG export and a separate message-free JSON pattern key.
- Added local reveal by regenerating and subtracting the original carrier.
- Added import/reveal workflow for an encoded PNG and matching key.
- Preserved v1 and v2 unchanged.
