import { db } from '../../config/database';

export const AnalyticsService = {
  async getSummary() {
    const [statusStats, categoryStats, deptStats, timeStats] = await Promise.all([
      db.query<{ status: string; count: string }>(`
        SELECT status, COUNT(*) as count
        FROM complaints GROUP BY status
      `),
      db.query(`
        SELECT cat.name as category, COUNT(c.id) as count
        FROM complaints c
        JOIN categories cat ON cat.id = c.category_id
        GROUP BY cat.name ORDER BY count DESC LIMIT 10
      `),
      db.query(`
        SELECT d.name as department,
               COUNT(c.id) as total,
               COUNT(CASE WHEN c.status = 'resolved' THEN 1 END) as resolved,
               ROUND(
                 COUNT(CASE WHEN c.status = 'resolved' THEN 1 END)::numeric /
                 NULLIF(COUNT(c.id), 0) * 100, 2
               ) as resolution_rate
        FROM departments d
        LEFT JOIN complaints c ON c.department_id = d.id
        GROUP BY d.id, d.name
        ORDER BY total DESC
      `),
      db.query(`
        SELECT COUNT(*) as total,
               COUNT(CASE WHEN status = 'resolved' THEN 1 END) as resolved,
               ROUND(
                 AVG(CASE WHEN resolved_at IS NOT NULL
                   THEN EXTRACT(EPOCH FROM (resolved_at - created_at)) / 3600 END
                 ), 2
               ) as avg_resolution_hours,
               ROUND(
                 COUNT(CASE WHEN status = 'resolved' THEN 1 END)::numeric /
                 NULLIF(COUNT(*), 0) * 100, 2
               ) as resolution_rate
        FROM complaints
      `),
    ]);

    const statusMap: Record<string, number> = {};
    for (const row of statusStats.rows) statusMap[row.status] = parseInt(row.count);

    return {
      overview: timeStats.rows[0],
      by_status: statusMap,
      top_categories: categoryStats.rows,
      by_department: deptStats.rows,
    };
  },

  async getTimeSeries(period: 'daily' | 'weekly' | 'monthly' = 'daily', days = 30) {
    const groupBy = {
      daily: `DATE_TRUNC('day', created_at)`,
      weekly: `DATE_TRUNC('week', created_at)`,
      monthly: `DATE_TRUNC('month', created_at)`,
    }[period];

    const result = await db.query(`
      SELECT ${groupBy} as period, status, COUNT(*) as count
      FROM complaints
      WHERE created_at >= NOW() - INTERVAL '${days} days'
      GROUP BY ${groupBy}, status
      ORDER BY period ASC
    `);

    return result.rows;
  },
};
