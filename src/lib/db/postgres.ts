import { neon } from '@neondatabase/serverless';

const databaseUrl = process.env.DATABASE_URL || process.env.POSTGRES_URL || '';

export const isPostgresConfigured = Boolean(databaseUrl && databaseUrl.trim().length > 0);

export const sql = isPostgresConfigured ? neon(databaseUrl) : null;

