// User schema.
// - Password hashed in a pre-save hook (Mongoose 8 style: async, no `next`).
// - toJSON() strips password from any serialized user.
// - unique: true on email creates a MongoDB unique index automatically.
// - 'role' and 'accountStatus' are enums so typos can't slip in.

import mongoose from "mongoose";
import bcrypt from "bcrypt";

const SALT_ROUNDS = 12;

const userSchema = new mongoose.Schema(
  {
    name: {
      type: String,
      required: [true, "Name is required."],
      trim: true,
      minlength: [2, "Name must be at least 2 characters."],
      maxlength: [60, "Name must be at most 60 characters."],
    },
    email: {
      type: String,
      required: [true, "Email is required."],
      unique: true,
      lowercase: true,
      trim: true,
      match: [
        /^[^\s@]+@[^\s@]+\.[^\s@]+$/,
        "Please provide a valid email address.",
      ],
    },
    password: {
      type: String,
      required: [true, "Password is required."],
      minlength: [8, "Password must be at least 8 characters."],
      select: false, // never returned by default; must be explicitly requested with .select("+password")
    },
    phone: {
      type: String,
      trim: true,
      default: "",
    },
    profileImage: {
      type: String,
      default: "",
    },
    role: {
      type: String,
      enum: ["customer", "admin"],
      default: "customer",
    },
    accountStatus: {
      type: String,
      enum: ["active", "suspended", "pending"],
      default: "active",
    },
    isVerified: {
      type: Boolean,
      default: false,
    },
  },
  { timestamps: true } // adds createdAt / updatedAt
);

// ---- Pre-save hook: hash password if it changed ----
// Mongoose 8: async pre-save hooks no longer receive `next`.
// Throw on error; return normally on success.
userSchema.pre("save", async function () {
  if (!this.isModified("password")) return;
  const salt = await bcrypt.genSalt(SALT_ROUNDS);
  this.password = await bcrypt.hash(this.password, salt);
});

// ---- Instance method: verify a plaintext password against the stored hash ----
userSchema.methods.comparePassword = function (plainPassword) {
  return bcrypt.compare(plainPassword, this.password);
};

// ---- Strip password from any JSON serialization ----
userSchema.methods.toJSON = function () {
  const obj = this.toObject({ virtuals: false });
  delete obj.password;
  return obj;
};

const User = mongoose.model("User", userSchema);

export default User;