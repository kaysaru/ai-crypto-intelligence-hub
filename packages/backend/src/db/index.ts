import { drizzle } from 'drizzle-orm/postgres-js';
import postgres from 'postgres';
import * as schema from './schema';

const connectionString = process.env.DATABASE_URL || 'postgresql://admin:admin123@localhost:5432/crypto_intel';

// Create PostgreSQL connection
export const connection = postgres(connectionString);

// Create Drizzle ORM instance
export const db = drizzle(connection, { schema });

// Export schema for easy access
export * from './schema';
