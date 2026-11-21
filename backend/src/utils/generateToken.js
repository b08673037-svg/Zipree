// Signs a JWT for a user. Payload kept minimal: only id and role.
// Never put password, email, or PII in the token — it's readable by anyone.

import jwt from "jsonwebtoken";
import config from "../config/index.js";

export default function generateToken(user) {
  return jwt.sign(
    { id: user._id.toString(), role: user.role },
    config.jwtSecret,
    { expiresIn: config.jwtExpiresIn }
  );
}