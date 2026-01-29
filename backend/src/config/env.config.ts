import { z } from "zod";

/**
 * Environment Variable Schema
 * Validates all required and optional environment variables at startup
 */
const envSchema = z.object({
  // Database
  DATABASE_URL: z
    .string()
    .min(1, "DATABASE_URL is required")
    .url("DATABASE_URL must be a valid URL"),

  // Authentication
  JWT_SECRET: z
    .string()
    .min(32, "JWT_SECRET must be at least 32 characters for security"),

  // Server
  PORT: z.coerce.number().positive().default(5000),
  NODE_ENV: z
    .enum(["development", "production", "test"])
    .default("development"),

  // CORS
  FRONTEND_URL: z
    .string()
    .min(1, "FRONTEND_URL is required")
    .url("FRONTEND_URL must be a valid URL"),
});

/**
 * Validate and parse environment variables
 * Throws an error if validation fails
 */
const validateEnv = () => {
  try {
    return envSchema.parse(process.env);
  } catch (error) {
    if (error instanceof z.ZodError) {
      const issues = error.issues
        .map((issue) => `  - ${issue.path.join(".")}: ${issue.message}`)
        .join("\n");

      // Use console.error here as logger depends on env config (circular dependency)
      console.error("❌ Invalid environment variables:\n" + issues);
      process.exit(1);
    }
    throw error;
  }
};

/**
 * Typed and validated environment configuration
 */
export const env = validateEnv();

/**
 * Helper to check if running in production
 */
export const isProduction = env.NODE_ENV === "production";

/**
 * Helper to check if running in development
 */
export const isDevelopment = env.NODE_ENV === "development";

/**
 * Helper to check if running in test
 */
export const isTest = env.NODE_ENV === "test";
