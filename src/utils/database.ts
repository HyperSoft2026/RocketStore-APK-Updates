/**
 * RocketStore PostgreSQL Configuration Helper
 * Safe connection handling for Clever Cloud PostgreSQL Add-on
 *
 * Clever Cloud injects the following environment variables when an add-on is attached:
 * - POSTGRESQL_ADDON_URI: full postgresql connection string
 * - POSTGRESQL_ADDON_HOST, POSTGRESQL_ADDON_PORT, POSTGRESQL_ADDON_DB, etc.
 *
 * IMPORTANT: No secrets or credentials are hardcoded here.
 */

export interface DbConnectionConfig {
  connectionUri: string | null;
  isConfigured: boolean;
  maskedUri: string | null;
}

export function getPostgresConfig(): DbConnectionConfig {
  const uri = process.env.POSTGRESQL_ADDON_URI || process.env.DATABASE_URL || null;

  if (!uri) {
    return {
      connectionUri: null,
      isConfigured: false,
      maskedUri: null,
    };
  }

  // Mask credentials for safe logging or status checks
  let masked = uri;
  try {
    const parsed = new URL(uri);
    if (parsed.password) {
      parsed.password = '****';
    }
    masked = parsed.toString();
  } catch {
    masked = '[CONFIGURED]';
  }

  return {
    connectionUri: uri,
    isConfigured: true,
    maskedUri: masked,
  };
}
