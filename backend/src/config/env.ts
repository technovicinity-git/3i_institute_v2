import { z } from "zod";
import dotenv from "dotenv";

// Treats `KEY=` (empty) in .env as unset.
const emptyAsUndefined = <T extends z.ZodType>(schema: T) =>
  z.preprocess((value) => (value === "" ? undefined : value), schema);

const envSchema = z.object({
  NODE_ENV: z
    .enum(["development", "production", "test"])
    .default("development"),
  PORT: z.coerce.number().int().positive().default(4000),

  // Reverse proxies (load balancer, nginx, Cloudflare...) in front of the API.
  // Without this, every request seems to come from the proxy's IP, so all
  // users share one rate limit. Set it to the number of proxies (usually 1)
  // or to their addresses ("loopback", "10.0.0.0/8"). Leave unset when the
  // API is reached directly: trusting X-Forwarded-For then would let clients
  // fake their IP and dodge rate limits.
  TRUST_PROXY: emptyAsUndefined(
    z
      .string()
      .optional()
      .transform((value) =>
        value === undefined
          ? undefined
          : /^\d+$/.test(value)
            ? Number(value)
            : value,
      ),
  ),

  // Database
  DATABASE_URL: z.string().url(),

  // JWT
  JWT_ACCESS_SECRET: z.string().min(32),
  JWT_REFRESH_SECRET: z.string().min(32),
  JWT_ACCESS_EXPIRY: z.string().default("15m"),
  JWT_REFRESH_EXPIRY: z.string().default("7d"),

  // Redis
  REDIS_URL: z.string().url().default("redis://localhost:6379"),

  // Stripe
  STRIPE_SECRET_KEY: z.string(),
  STRIPE_WEBHOOK_SECRET: z.string(),

  // Bunny Stream
  BUNNY_API_KEY: z.string(),
  BUNNY_LIBRARY_ID: z.string(),
  BUNNY_CDN_HOSTNAME: z.string(),

  // Email (Resend). Without an API key, emails are logged instead of sent.
  RESEND_API_KEY: emptyAsUndefined(z.string().optional()),
  MAIL_FROM: z.string().email(),
  MAIL_FROM_NAME: z.string().default("3i Institute"),
  MAIL_REPLY_TO: emptyAsUndefined(z.string().email().optional()),
  EMAIL_ENABLED: z
    .enum(["true", "false"])
    .default("true")
    .transform((value) => value === "true"),

  // DigitalOcean Spaces
  SPACES_ENDPOINT: z.string(),
  SPACES_REGION: z.string(),
  SPACES_BUCKET: z.string(),
  SPACES_ACCESS_KEY: z.string(),
  SPACES_SECRET_KEY: z.string(),

  // Frontend URL (for CORS and email links)
  FRONTEND_URL: z.string().url().default("http://localhost:3000"),

  // Pwned Passwords (k-anonymity endpoint)
  PWNED_API_URL: z
    .string()
    .url()
    .default("https://api.pwnedpasswords.com/range"),

  // Stripe Price IDs
  STRIPE_MONTHLY_PRICE_ID: z.string().default("price_monthly"),
  STRIPE_ANNUAL_PRICE_ID: z.string().default("price_annual"),

  APPLE_CLIENT_ID: z.string(),
  GOOGLE_CLIENT_ID: z.string(),
  // Extra OAuth client IDs whose Google ID tokens are accepted, comma-separated.
  // The iOS app's tokens are issued to its own iOS client ID, not the web one.
  GOOGLE_MOBILE_CLIENT_IDS: z.string().default(""),

  CLOUDINARY_CLOUD_NAME: z.string(),
  CLOUDINARY_API_KEY: z.string(),
  CLOUDINARY_API_SECRET: z.string(),

  // Firebase Admin (FCM push). Set one of these; push is disabled when
  // neither is present. Never commit the service-account file.
  //   FIREBASE_SERVICE_ACCOUNT_PATH   path to the JSON key file (local dev)
  //   FIREBASE_SERVICE_ACCOUNT_BASE64 base64 of the JSON key (hosted envs)
  FIREBASE_SERVICE_ACCOUNT_PATH: z.string().optional(),
  FIREBASE_SERVICE_ACCOUNT_BASE64: z.string().optional(),
});

type Env = z.infer<typeof envSchema>;
function loadEnv(): Env {
  if (process.env["NODE_ENV"] !== "production") {
    dotenv.config();
  }

  const parsed = envSchema.safeParse(process.env);

  if (!parsed.success) {
    console.error("❌ Invalid environment variables:");
    console.error(parsed.error.flatten().fieldErrors);
    process.exit(1);
  }

  return parsed.data;
}

const env: Env = loadEnv();

export { env };
export type { Env };
