import { db } from '../../config/database';
import { generateTicketNumber } from '../../utils/ticketNumber';
import { ComplaintFilters, ComplaintStatus, JwtPayload } from '../../types';
import { NotificationService } from '../notifications/notification.service';
import { EmailService } from '../../services/email.service';
import { AppError } from '../../utils/AppError';

// Allowed status transitions
const STATUS_TRANSITIONS: Record<string, { from: ComplaintStatus[]; allowedRoles: string[] }> = {
    in_progress: { from: ['open', 'reopened'], allowedRoles: ['staff', 'admin'] },
    resolved: { from: ['in_progress'], allowedRoles: ['staff', 'admin'] },
    closed: { from: ['open', 'in_progress', 'resolved'], allowedRoles: ['admin'] },
    reopened: { from: ['resolved', 'closed'], allowedRoles: ['admin'] },
};

export const ComplaintService = {
    async create(data: {
        title: string;
        description: string;
        category_id: string;
        location?: string | null;
        submittedBy: string;
        files?: Express.Multer.File[];
    }) {
        // Validate category
        const catResult = await db.query<{ id: string; department_id: string }>(
            `SELECT id, department_id FROM categories WHERE id = $1 AND is_active = true`,
            [data.category_id],
        );
        if (!catResult.rows[0]) {
            throw AppError.badRequest('Invalid or inactive category', 'INVALID_CATEGORY');
        }

        const { department_id } = catResult.rows[0];
        const ticket_number = await generateTicketNumber();

        const complaint = await db.transaction(async (client) => {
            const result = await client.query<{ id: string; ticket_number: string }>(`
        INSERT INTO complaints (ticket_number, title, description, status, category_id, submitted_by, department_id, location)
        VALUES ($1, $2, $3, 'open', $4, $5, $6, $7)
        RETURNING *
      `, [ticket_number, data.title, data.description, data.category_id, data.submittedBy, department_id, data.location ?? null]);

            const complaint = result.rows[0];

            // Insert attachments
            if (data.files?.length) {
                for (const file of data.files) {
                    await client.query(`
            INSERT INTO complaint_attachments (complaint_id, original_name, stored_name, mime_type, file_size, uploaded_by)
            VALUES ($1, $2, $3, $4, $5, $6)
          `, [complaint.id, file.originalname, file.filename, file.mimetype, file.size, data.submittedBy]);
                }
            }

            // Log history
            await client.query(`
        INSERT INTO complaint_history (complaint_id, changed_by, from_status, to_status, note)
        VALUES ($1, $2, NULL, 'open', 'Complaint submitted')
      `, [complaint.id, data.submittedBy]);

            return complaint;
        });

        // Notify dept staff async
        const staffResult = await db.query<{ id: string }>(
            `SELECT id FROM users WHERE department_id = $1 AND role = 'staff' AND is_active = true`,
            [department_id],
        );
        for (const staff of staffResult.rows) {
            await NotificationService.create({
                userId: staff.id,
                title: 'New Complaint Assigned',
                message: `Ticket ${ticket_number}: ${data.title}`,
                type: 'new_complaint',
                referenceId: complaint.id,
            });
        }

        return this.findById(complaint.id, data.submittedBy, 'student');
    },

    async findAll(user: JwtPayload, filters: ComplaintFilters) {
        const { page = 1, limit = 20, status, category_id, department_id, from, to, sort = 'created_at', order = 'DESC' } = filters;
        const offset = (page - 1) * limit;

        const params: unknown[] = [];
        const conditions: string[] = [];

        // Role-based filtering
        if (user.role === 'student') {
            params.push(user.userId);
            conditions.push(`c.submitted_by = $${params.length}`);
        } else if (user.role === 'staff') {
            // Staff see their department's complaints
            const deptResult = await db.query<{ department_id: string }>(
                `SELECT department_id FROM users WHERE id = $1`, [user.userId],
            );
            if (deptResult.rows[0]?.department_id) {
                params.push(deptResult.rows[0].department_id);
                conditions.push(`c.department_id = $${params.length}`);
            }
        }

        if (status) { params.push(status); conditions.push(`c.status = $${params.length}`); }
        if (category_id) { params.push(category_id); conditions.push(`c.category_id = $${params.length}`); }
        if (department_id && user.role === 'admin') { params.push(department_id); conditions.push(`c.department_id = $${params.length}`); }
        if (from) { params.push(from); conditions.push(`c.created_at >= $${params.length}`); }
        if (to) { params.push(to); conditions.push(`c.created_at <= $${params.length}`); }

        const where = conditions.length ? `WHERE ${conditions.join(' AND ')}` : '';
        const allowedSorts = ['created_at', 'updated_at', 'status'];
        const safeSort = allowedSorts.includes(sort) ? sort : 'created_at';
        const safeOrder = order === 'ASC' ? 'ASC' : 'DESC';

        const countResult = await db.query<{ count: string }>(
            `SELECT COUNT(*) FROM complaints c ${where}`, params,
        );
        const total = parseInt(countResult.rows[0].count, 10);

        params.push(limit, offset);
        const dataResult = await db.query(`
      SELECT c.*, cat.name as category_name, d.name as department_name,
             u.full_name as submitter_name,
             (SELECT COUNT(*) FROM complaint_attachments WHERE complaint_id = c.id) as attachment_count
      FROM complaints c
      LEFT JOIN categories cat ON cat.id = c.category_id
      LEFT JOIN departments d ON d.id = c.department_id
      LEFT JOIN users u ON u.id = c.submitted_by
      ${where}
      ORDER BY c.${safeSort} ${safeOrder}
      LIMIT $${params.length - 1} OFFSET $${params.length}
    `, params);

        return {
            data: dataResult.rows,
            pagination: { page, limit, total, totalPages: Math.ceil(total / limit) },
        };
    },

    async findById(id: string, userId: string, role: string) {
        const result = await db.query<{
            status: ComplaintStatus;
            submitted_by: string;
            department_id: string;
            ticket_number: string;
            submitter_name: string;
            submitter_email: string;
            assignee_name: string | null;
            category_name: string;
            department_name: string;
            attachments?: unknown[];
        }>(`
      SELECT c.*, cat.name as category_name, d.name as department_name,
             u.full_name as submitter_name, u.email as submitter_email,
             a.full_name as assignee_name
      FROM complaints c
      LEFT JOIN categories cat ON cat.id = c.category_id
      LEFT JOIN departments d ON d.id = c.department_id
      LEFT JOIN users u ON u.id = c.submitted_by
      LEFT JOIN users a ON a.id = c.assigned_to
      WHERE c.id = $1
    `, [id]);

        if (!result.rows[0]) {
            throw AppError.notFound('Complaint not found');
        }

        const complaint = result.rows[0];

        // Ownership check for students
        if (role === 'student' && complaint.submitted_by !== userId) {
            throw AppError.forbidden('Access denied');
        }

        // Staff can only see their department's complaints
        if (role === 'staff') {
            const staffDept = await db.query<{ department_id: string }>(
                `SELECT department_id FROM users WHERE id = $1`, [userId],
            );
            if (staffDept.rows[0]?.department_id !== complaint.department_id) {
                throw AppError.forbidden('Access denied');
            }
        }

        // Fetch attachments
        const attachments = await db.query(
            `SELECT id, original_name, mime_type, file_size, created_at FROM complaint_attachments WHERE complaint_id = $1`,
            [id],
        );
        complaint.attachments = attachments.rows;

        return complaint;
    },

    async updateStatus(id: string, newStatus: ComplaintStatus, changedBy: JwtPayload, note?: string) {
        const complaint = await this.findById(id, changedBy.userId, changedBy.role);

        const transition = STATUS_TRANSITIONS[newStatus];
        if (!transition) {
            throw AppError.badRequest(`Invalid target status: ${newStatus}`);
        }

        if (!transition.from.includes(complaint.status)) {
            throw AppError.badRequest(`Cannot transition from '${complaint.status}' to '${newStatus}'`, 'INVALID_TRANSITION');
        }

        if (!transition.allowedRoles.includes(changedBy.role)) {
            throw AppError.forbidden('You are not authorized to make this transition');
        }

        await db.transaction(async (client) => {
            const resolvedAt = newStatus === 'resolved' ? new Date() : null;
            await client.query(
                `UPDATE complaints SET status = $1, resolved_at = COALESCE($2, resolved_at), updated_at = NOW() WHERE id = $3`,
                [newStatus, resolvedAt, id],
            );

            await client.query(`
        INSERT INTO complaint_history (complaint_id, changed_by, from_status, to_status, note)
        VALUES ($1, $2, $3, $4, $5)
      `, [id, changedBy.userId, complaint.status, newStatus, note ?? null]);
        });

        // Notify the student
        if (['in_progress', 'resolved'].includes(newStatus)) {
            await NotificationService.create({
                userId: complaint.submitted_by,
                title: `Complaint ${newStatus === 'in_progress' ? 'In Progress' : 'Resolved'}`,
                message: `Your ticket ${complaint.ticket_number} status is now: ${newStatus}`,
                type: 'status_update',
                referenceId: id,
            });

            // Email async
            EmailService.sendStatusUpdate(
                complaint.submitter_email,
                complaint.submitter_name,
                complaint.ticket_number,
                newStatus,
            ).catch(() => { });
        }

        return this.findById(id, changedBy.userId, changedBy.role);
    },

    async addRemark(complaintId: string, authorId: string, role: string, content: string) {
        // Verify access
        await this.findById(complaintId, authorId, role);

        const result = await db.query(`
      INSERT INTO remarks (complaint_id, author_id, content)
      VALUES ($1, $2, $3)
      RETURNING *, (SELECT full_name FROM users WHERE id = $2) as author_name
    `, [complaintId, authorId, content]);

        return result.rows[0];
    },

    async getHistory(complaintId: string, userId: string, role: string) {
        await this.findById(complaintId, userId, role); // Access check

        const result = await db.query(`
      SELECT ch.*, u.full_name as changed_by_name
      FROM complaint_history ch
      LEFT JOIN users u ON u.id = ch.changed_by
      WHERE ch.complaint_id = $1
      ORDER BY ch.created_at ASC
    `, [complaintId]);

        return result.rows;
    },

    async getRemarks(complaintId: string) {
        const result = await db.query(`
      SELECT r.*, u.full_name as author_name, u.role as author_role
      FROM remarks r
      LEFT JOIN users u ON u.id = r.author_id
      WHERE r.complaint_id = $1
      ORDER BY r.created_at ASC
    `, [complaintId]);
        return result.rows;
    },

    async deleteComplaint(id: string) {
        const result = await db.query(`DELETE FROM complaints WHERE id = $1 RETURNING id`, [id]);
        if (!result.rows[0]) {
            throw AppError.notFound('Complaint not found');
        }
    },
};
