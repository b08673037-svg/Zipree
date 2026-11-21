// Generates a human-readable booking reference: ZIP-XXXXXX
// 6 uppercase alphanumeric chars, excluding ambiguous ones (0/O, 1/I).
// Uniqueness is enforced by a unique index on Booking.bookingReference.

import crypto from "crypto";

const ALPHABET = "23456789ABCDEFGHJKLMNPQRSTUVWXYZ";

export default function generateBookingReference() {
  let ref = "ZIP-";
  const bytes = crypto.randomBytes(6);
  for (let i = 0; i < 6; i++) {
    ref += ALPHABET[bytes[i] % ALPHABET.length];
  }
  return ref;
}