import { db } from '../../config/database';
import { JwtPayload, ComplaintStatus } from '../../types';

export const AnalyticsService = {
    async getDashboardStats(user: JwtPayload) {
        const params: unknown[] = [];
        let where = '';

        if (user.role === 'student') {
            params.push(user.userId);
            where = `WHERE submitted_by = $1`;
        } else if (user.role === 'staff') {
            const deptResult = await db.query(`SELECT department_id FROM users WHERE id = $1`, [user.userId]);
            if (deptResult.rows[0]?.department_id) {
                params.push(deptResult.rows[0].department_id);
                where = `WHERE department_id = $1`;
            } else {
                where = `WHERE 1=0`; // safety fallback
            }
        }

        const statsResult = await db.query(`
      SELECT 
        COUNT(*) as total,
        COUNT(*) FILTER (WHERE status = 'open') as open,
        COUNT(*) FILTER (WHERE status = 'in_progress') as in_progress,
        COUNT(*) FILTER (WHERE status = 'resolved') as resolved,
        COUNT(*) FILTER (WHERE status = 'closed') as closed,
        COUNT(*) FILTER (WHERE status = 'reopened') as reopened
      FROM complaints
      ${where}
    `, params);

        return {
            total: parseInt(statsResult.rows[0].total, 10),
            byStatus: {
                open: parseInt(statsResult.rows[0].open, 10),
                in_progress: parseInt(statsResult.rows[0].in_progress, 10),
                resolved: parseInt(statsResult.rows[0].resolved, 10),
                closed: parseInt(statsResult.rows[0].closed, 10),
                reopened: parseInt(statsResult.rows[0].reopened, 10),
            }
        };
    },

    async getSystemReport() {
        // Admin only - global overview by department
        const result = await db.query(`
      SELECT 
        d.name as department,
        COUNT(c.id) as total_complaints,
        COUNT(c.id) FILTER (WHERE c.status = 'resolved' OR c.status = 'closed') as resolved_complaints,
        ROUND(
          AVG(
            EXTRACT(EPOCH FROM (c.resolved_at - c.created_at))/3600
          ) FILTER (WHERE c.resolved_at IS NOT NULL)
        ) as avg_resolution_hours
      FROM departments d
      LEFT JOIN complaints c ON c.department_id = d.id
      GROUP BY d.name
      ORDER BY total_complaints DESC
    `);

        return result.rows;
    }
};
