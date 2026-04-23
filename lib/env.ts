import { z } from "zod";

const nodeEnvSchema = z.enum(["development", "test", "production"]).default("development");

const serverEnvSchema = z.object({
  NODE_ENV: nodeEnvSchema,
  DATABASE_URL: z.string().min(1, "DATABASE_URL is required").default("postgresql://postgres:postgres@localhost:5432/funbook"),
  AUTH_SECRET: z.string().min(32, "AUTH_SECRET must be at least 32 characters").default("dev-auth-secret-change-me-please-update"),
  EMAIL_PROVIDER: z.string().default("mock"),
  EMAIL_FROM: z.email().optional(),
  SMTP_HOST: z.string().optional(),
  SMTP_PORT: z.coerce.number().int().positive().optional(),
  SMTP_USER: z.string().optional(),
  SMTP_PASSWORD: z.string().optional(),
  STORAGE_PROVIDER: z.string().default("local"),
  STORAGE_BUCKET: z.string().optional(),
  STORAGE_REGION: z.string().optional(),
  STORAGE_ACCESS_KEY: z.string().optional(),
  STORAGE_SECRET_KEY: z.string().optional(),
  PAYMENT_PROVIDER: z.string().default("mock"),
  PAYMENT_API_KEY: z.string().optional(),
  PAYMENT_WEBHOOK_SECRET: z.string().optional(),
  MOCK_PAYMENT_SUCCESS_RATE: z.string().optional(),
  MONITORING_DSN: z.string().optional(),
  MAINTENANCE_MODE: z
    .string()
    .optional()
    .transform((value) => value === "true"),
  APP_LOG_LEVEL: z.enum(["debug", "info", "warn", "error"]).default("info"),
});

const clientEnvSchema = z.object({
  NEXT_PUBLIC_APP_URL: z.url().default("http://localhost:3000"),
  NEXT_PUBLIC_SUPPORT_WHATSAPP: z.string().optional(),
});

function formatValidationErrors(error: z.ZodError) {
  return error.issues.map((issue) => `${issue.path.join(".")}: ${issue.message}`).join("; ");
}

function assertProductionSafety(serverEnv: z.infer<typeof serverEnvSchema>, clientEnv: z.infer<typeof clientEnvSchema>) {
  const shouldEnforce = serverEnv.NODE_ENV === "production" && process.env.ENFORCE_STRICT_ENV === "true";

  if (!shouldEnforce) {
    return;
  }

  const violations: string[] = [];

  if (serverEnv.AUTH_SECRET === "dev-auth-secret-change-me-please-update") {
    violations.push("AUTH_SECRET cannot use the development default in production");
  }

  if (serverEnv.DATABASE_URL.includes("localhost") || serverEnv.DATABASE_URL.includes("postgres:postgres")) {
    violations.push("DATABASE_URL must target a managed/secure production database");
  }

  if (!clientEnv.NEXT_PUBLIC_APP_URL.startsWith("https://")) {
    violations.push("NEXT_PUBLIC_APP_URL must use https in production");
  }

  if (violations.length > 0) {
    throw new Error(`Unsafe production environment configuration: ${violations.join("; ")}`);
  }
}

function getServerEnv() {
  const parsed = serverEnvSchema.safeParse(process.env);

  if (!parsed.success) {
    throw new Error(`Invalid server environment variables: ${formatValidationErrors(parsed.error)}`);
  }

  return parsed.data;
}

function getClientEnv() {
  const parsed = clientEnvSchema.safeParse(process.env);

  if (!parsed.success) {
    throw new Error(`Invalid public environment variables: ${formatValidationErrors(parsed.error)}`);
  }

  return parsed.data;
}

const serverEnv = getServerEnv();
const clientEnv = getClientEnv();

assertProductionSafety(serverEnv, clientEnv);

export const env = {
  ...serverEnv,
  ...clientEnv,
  isProduction: serverEnv.NODE_ENV === "production",
  isDevelopment: serverEnv.NODE_ENV === "development",
  isTest: serverEnv.NODE_ENV === "test",
} as const;

export type AppEnv = typeof env;
