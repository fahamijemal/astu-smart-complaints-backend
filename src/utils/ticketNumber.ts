import { db } from '../config/database';

export async function generateTicketNumber(): Promise<string> {
    const year = new Date().getFullYear();
    const result = await db.query<{ count: string }>(
        `SELECT COUNT(*) as count FROM complaints WHERE EXTRACT(YEAR FROM created_at) = $1`,
        [year],
    );
    const count = parseInt(result.rows[0].count, 10) + 1;
    return `ASTU-${year}-${String(count).padStart(5, '0')}`;
}
