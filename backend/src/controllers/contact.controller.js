import Contact from "../models/Contact.js";
import { validateEmail } from "../utils/validators.js";

// POST /api/contact
export async function submitContactForm(req, res, next) {
  try {
    const { name, email, phone, subject, message } = req.body || {};

    // 1. Basic Validation
    if (!name || !email || !subject || !message) {
      return res.status(400).json({ success: false, message: "Please fill in all required fields." });
    }

    const emailError = validateEmail(email);
    if (emailError) {
      return res.status(400).json({ success: false, message: emailError });
    }

    if (message.length > 2000) {
      return res.status(400).json({ success: false, message: "Message cannot exceed 2000 characters." });
    }

    // 2. Save to DB
    const contact = await Contact.create({
      name,
      email,
      phone: phone || "",
      subject,
      message,
    });

    return res.status(201).json({
      success: true,
      message: "Your message has been received. Our team will be in touch shortly.",
      contactId: contact._id,
    });
  } catch (err) {
    next(err);
  }
}