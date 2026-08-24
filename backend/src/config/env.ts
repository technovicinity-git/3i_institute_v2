import { z } from "zod";
import dotenv from "dotenv";

const envSchema = z.object({
  NODE_ENV: z
    .enum(["development", "production", "test"])
    .default("development"),
  PORT: z.coerce.number().int().positive().default(4000),

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

  // AWS SES
  AWS_ACCESS_KEY_ID: z.string(),
  AWS_SECRET_ACCESS_KEY: z.string(),
  AWS_SES_REGION: z.string().default("ap-southeast-2"),
  MAIL_FROM: z.string().email(),

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

  CLOUDINARY_CLOUD_NAME: z.string(),
  CLOUDINARY_API_KEY: z.string(),
  CLOUDINARY_API_SECRET: z.string(),
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
