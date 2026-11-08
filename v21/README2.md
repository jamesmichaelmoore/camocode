# CamoCode v20 — Technical and Security Summary

## Image format

CamoCode is fixed to a **1224 × 1584 black-and-white page mask** and encrypts one bit per pixel. The exported PNG displays authenticated ciphertext as black-and-white pixels.

There is no visible font boundary to enhance because the glyph bitmap is encrypted before those pixels are drawn. With the correct key, the decoder reverses the encryption exactly. Without that key, properly generated ciphertext is designed to be computationally indistinguishable from random noise.

## Technology name

The established technology is **AES-256-GCM authenticated encryption**. CamoCode adds a custom **visual ciphertext encoding** that maps encrypted bits to black-and-white PNG pixels.

The complete system does not have a single official standard name. A precise description is **AES-256-GCM ciphertext encoded as a monochrome raster image**.

It is not traditional steganography because the image visibly contains random-looking encrypted data. It is also not classical visual cryptography, which normally uses multiple image shares.

## Nonces and key rotation

CamoCode creates a fresh random nonce for every export. Generate another key if the current key or private decoder might have been compromised, or if you deliberately want separate security groups.

The exception is the original hardcoded legacy key. Replace it with a newly generated key before treating the proof of concept as private.

## Browser keyring

The app keeps a **local keyring in this browser’s storage**—not in an assistant’s memory and not inside exported PNGs. It remembers the active key plus earlier keys so old files remain decodable.

Those keys belong specifically to the current browser profile and address (`http://127.0.0.1:8765`). Clearing browser data, changing computers, changing the app address, or using another browser can make the stored keyring unavailable. Always copy important 64-character keys to secure offline storage.

## Legacy key

The **legacy key** is the original fixed 32-byte key hardcoded inside CamoCode so PNGs created by older versions remain decodable. On a fresh v20 installation, it may initially be the active key.

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
