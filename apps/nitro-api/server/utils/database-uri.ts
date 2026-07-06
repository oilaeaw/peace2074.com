/**
 * Resolves the primary database URI from environment variables.
 * Returns an empty string when running in edge environments (Cloudflare Workers)
 * where a persistent database connection is not available.
 */
export function resolvePrimaryDatabaseUri(): string {
    // Support common env var naming conventions
    return (
        process.env.NITRO_MONGODB_URI ||
        process.env.MONGODB_URI ||
        process.env.NITRO_DATABASE_URL ||
        process.env.DATABASE_URL ||
        process.env.MONGO_URL ||
        ''
    )
}
