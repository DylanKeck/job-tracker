import "dotenv/config";
import pg from "pg";

export const pool = new pg.Pool({
    connectionString: process.env.DATABASE_URL
});

export async function pingDb() {
    await pool.query("select 1");
}
