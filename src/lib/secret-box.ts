import "server-only";

import { createCipheriv, createDecipheriv, randomBytes } from "node:crypto";

// Symmetric encryption for third-party credentials held on a teammate's behalf.
//
// A Twilio auth token is not a password to be hashed — the server has to read it
// back to sign requests. So it is encrypted rather than digested, and the key
// lives in the environment rather than the database: a dump of the leads table
// should not also hand over the ability to place calls billed to someone's card.

export class SecretBoxKeyError extends Error {
  constructor(message: string) {
    super(message);
    this.name = "SecretBoxKeyError";
  }
}

// Versioned so the format can change later without guessing at old rows.
const PREFIX = "v1";
const ALGORITHM = "aes-256-gcm";
const IV_BYTES = 12;

function readKey() {
  const raw = process.env.CREDENTIAL_ENCRYPTION_KEY?.trim();
  if (!raw) {
    throw new SecretBoxKeyError(
      "CREDENTIAL_ENCRYPTION_KEY is not set. Generate one with: openssl rand -hex 32",
    );
  }

  // Hex is what the documented `openssl rand -hex 32` produces; base64 is
  // accepted because secret managers hand it back that way.
  const key = /^[0-9a-f]{64}$/i.test(raw) ? Buffer.from(raw, "hex") : Buffer.from(raw, "base64");

  if (key.length !== 32) {
    throw new SecretBoxKeyError(
      "CREDENTIAL_ENCRYPTION_KEY must decode to 32 bytes. Generate one with: openssl rand -hex 32",
    );
  }

  return key;
}

/** Whether credentials can be stored at all. Screens check this before offering the form. */
export function secretBoxReady() {
  try {
    readKey();
    return true;
  } catch {
    return false;
  }
}

export function encryptSecret(plaintext: string) {
  const iv = randomBytes(IV_BYTES);
  const cipher = createCipheriv(ALGORITHM, readKey(), iv);
  const ciphertext = Buffer.concat([cipher.update(plaintext, "utf8"), cipher.final()]);
  const tag = cipher.getAuthTag();

  return [PREFIX, iv.toString("base64"), tag.toString("base64"), ciphertext.toString("base64")].join(".");
}

/**
 * Returns null rather than throwing when a value can't be read back — a rotated
 * key should surface as "reconnect your account", not a 500 on every dial.
 */
export function decryptSecret(payload: string): string | null {
  const parts = payload.split(".");
  if (parts.length !== 4 || parts[0] !== PREFIX) return null;

  try {
    const decipher = createDecipheriv(ALGORITHM, readKey(), Buffer.from(parts[1], "base64"));
    decipher.setAuthTag(Buffer.from(parts[2], "base64"));
    return Buffer.concat([decipher.update(Buffer.from(parts[3], "base64")), decipher.final()]).toString("utf8");
  } catch {
    return null;
  }
}

/** Last four characters, for showing which credential is stored without revealing it. */
export function secretHint(value: string) {
  return value.length <= 4 ? "••••" : `••••${value.slice(-4)}`;
}
