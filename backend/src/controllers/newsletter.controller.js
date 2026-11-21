import Subscriber from "../models/Subscriber.js";
import { validateEmail } from "../utils/validators.js";

// POST /api/newsletter/subscribe
export async function subscribe(req, res, next) {
  try {
    const { email } = req.body || {};

    // 1. Validate email
    const error = validateEmail(email);
    if (error) {
      return res.status(400).json({ success: false, message: error });
    }

    const normalizedEmail = email.toLowerCase().trim();

    // 2. Check if already subscribed
    const existing = await Subscriber.findOne({ email: normalizedEmail });
    if (existing) {
      if (existing.status === "active") {
        return res.status(200).json({ success: true, message: "You are already on the list." });
      } else {
        // If they previously unsubscribed, reactivate them
        existing.status = "active";
        await existing.save();
        return res.status(200).json({ success: true, message: "Welcome back to the list." });
      }
    }

    // 3. Create new subscriber
    await Subscriber.create({ email: normalizedEmail });

    return res.status(201).json({
      success: true,
      message: "Successfully joined the ZIPREE journal.",
    });
  } catch (err) {
    next(err);
  }
}