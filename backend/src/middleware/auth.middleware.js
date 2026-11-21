// JWT auth middleware + role guard.
// - protect: verifies "Authorization: Bearer <token>", loads user, sets req.user.
// - restrictTo(...roles): must be used after protect; checks req.user.role.

import jwt from "jsonwebtoken";
import config from "../config/index.js";
import User from "../models/User.js";

export async function protect(req, res, next) {
  try {
    const header = req.headers.authorization || "";
    if (!header.startsWith("Bearer ")) {
      return res.status(401).json({ success: false, message: "Not authenticated." });
    }

    const token = header.slice("Bearer ".length).trim();
    if (!token) {
      return res.status(401).json({ success: false, message: "Not authenticated." });
    }

    let decoded;
    try {
      decoded = jwt.verify(token, config.jwtSecret);
    } catch {
      return res.status(401).json({ success: false, message: "Invalid or expired token." });
    }

    const user = await User.findById(decoded.id);
    if (!user) {
      return res.status(401).json({ success: false, message: "User no longer exists." });
    }
    if (user.accountStatus === "suspended") {
      return res.status(403).json({ success: false, message: "Account is suspended." });
    }

    req.user = user; // safe: toJSON strips password on response, but we don't return it here anyway
    next();
  } catch (err) {
    next(err);
  }
}

export function restrictTo(...roles) {
  return (req, res, next) => {
    if (!req.user || !roles.includes(req.user.role)) {
      return res.status(403).json({
        success: false,
        message: "You do not have permission to perform this action.",
      });
    }
    next();
  };
}