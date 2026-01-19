import "dotenv/config";
import { Pool, type PoolClient } from "pg";

// 環境変数のバリデーション
const requiredEnvVars = [
  "DATABASE_HOST",
  "DATABASE_PORT",
  "DATABASE_USER",
  "DATABASE_PASSWORD",
  "DATABASE_NAME",
];

const missingEnvVars = requiredEnvVars.filter((key) => !process.env[key]);

if (missingEnvVars.length > 0) {
  console.error(
    "❌ Missing required environment variables:",
    missingEnvVars.join(", "),
  );
  console.error("Environment variables present:", Object.keys(process.env));
  throw new Error(
    `Missing required environment variables: ${missingEnvVars.join(", ")}`,
  );
}

const pool = new Pool({
  host: process.env.DATABASE_HOST,
  user: process.env.DATABASE_USER,
  password: process.env.DATABASE_PASSWORD,
  database: process.env.DATABASE_NAME,
  port: Number(process.env.DATABASE_PORT) || 5432,

  // Connection pool settings
  max: 20,
  idleTimeoutMillis: 30000,
  connectionTimeoutMillis: 2000,
});

// Error handler for idle clients
pool.on("error", (err, client) => {
  console.error("Unexpected error on idle client", err);
  process.exit(-1);
});

/**
 * Execute a single query
 */
export const query = async (text: string, params?: unknown[]) => {
  const start = Date.now();
  try {
    const res = await pool.query(text, params);
    const duration = Date.now() - start;
    console.log("executed query", { text, duration, rows: res.rowCount });
    return res;
  } catch (error) {
    console.error("Query error:", { text, error });
    throw error;
  }
};

/**
 * Get a client for transactions
 */
export const getClient = async (): Promise<PoolClient> => {
  const client = await pool.connect();
  const originalQuery = client.query.bind(client) as typeof client.query;
  const timeout = setTimeout(() => {
    console.error("A client has been checked out for more than 5 seconds!");
  }, 5000);

  client.query = function (...args: Parameters<typeof originalQuery>) {
    clearTimeout(timeout);
    return originalQuery(...args);
  } as typeof client.query;

  const originalRelease = client.release.bind(client);
  client.release = (error?: Error | boolean) => {
    clearTimeout(timeout);
    return originalRelease(error);
  };

  return client;
};

/**
 * Cleanup pool on app shutdown
 */
export const end = () => pool.end();
