import { Pool, type PoolClient } from "pg";

const pool = new Pool({
  host: process.env.DATABASE_HOST || "localhost",
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
export const query = async (text: string, params?: any[]) => {
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
  const originalQuery = (client.query as any).bind(client);
  const timeout = setTimeout(() => {
    console.error("A client has been checked out for more than 5 seconds!");
  }, 5000);

  (client.query as any) = function (...args: any[]) {
    clearTimeout(timeout);
    return originalQuery(...args);
  };

  const originalRelease = (client.release as any).bind(client);
  client.release = function (error?: Error) {
    clearTimeout(timeout);
    return originalRelease(error);
  } as any;

  return client;
};

/**
 * Cleanup pool on app shutdown
 */
export const end = () => pool.end();
