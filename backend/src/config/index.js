import dotenv from "dotenv";

dotenv.config();

function required(name) {
  const value = process.env[name];
  if (value === undefined || value === "") {
    throw new Error(
      `[config] Missing required environment variable: ${name}. ` +
        `Check your .env file (see .env.example).`
    );
  }
  return value;
}

function optional(name, fallback = "") {
  return process.env[name] ?? fallback;
}

const config = {
  env: required("NODE_ENV"),
  port: Number(required("PORT")),
  clientUrl: required("CLIENT_URL"),

  mongoUri: optional("MONGO_URI"),
  jwtSecret: required("JWT_SECRET"),
  jwtExpiresIn: optional("JWT_EXPIRES_IN", "7d"),

  smtpHost: required("SMTP_HOST"),
  smtpPort: Number(required("SMTP_PORT")),
  smtpUser: required("SMTP_USER"),
  smtpPass: required("SMTP_PASS"),
  emailFrom: required("EMAIL_FROM"),

  adminSecret: required("ADMIN_SECRET"),

  isDev: process.env.NODE_ENV === "development",
  isProd: process.env.NODE_ENV === "production",
};

if (Number.isNaN(config.port)) {
  throw new Error(`[config] PORT must be a number. Received: ${process.env.PORT}`);
}

export default config;