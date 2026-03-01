import { Response } from 'express';
import { AuthRequest } from '../../types';
import { AdminService } from './admin.service';
import { sendSuccess } from '../../utils/response';

export const AdminController = {
    async listUsers(req: AuthRequest, res: Response) {
        const { page, limit, search } = req.query as { page?: string; limit?: string; search?: string };
        const result = await AdminService.listUsers(Number(page ?? 1), Number(limit ?? 20), search);
        return res.json({ success: true, ...result });
    },

    async createStaff(req: AuthRequest, res: Response) {
        const staff = await AdminService.createStaff(req.body);
        return sendSuccess(res, staff, 'Staff account created', 201);
    },

    async updateRole(req: AuthRequest, res: Response) {
        const user = await AdminService.updateRole(req.params.id, req.body.role);
        return sendSuccess(res, user, 'Role updated');
    },

    async deactivate(req: AuthRequest, res: Response) {
        await AdminService.deactivateUser(req.params.id);
        return sendSuccess(res, null, 'Account deactivated');
    },

    async activate(req: AuthRequest, res: Response) {
        await AdminService.activateUser(req.params.id);
        return sendSuccess(res, null, 'Account activated');
    },

    async listCategories(_req: AuthRequest, res: Response) {
        const cats = await AdminService.listCategories();
        return sendSuccess(res, cats);
    },

    async createCategory(req: AuthRequest, res: Response) {
        const cat = await AdminService.createCategory(req.body.name, req.body.description, req.body.department_id);
        return sendSuccess(res, cat, 'Category created', 201);
    },

    async updateCategory(req: AuthRequest, res: Response) {
        const cat = await AdminService.updateCategory(req.params.id, req.body);
        return sendSuccess(res, cat, 'Category updated');
    },

    async listDepartments(_req: AuthRequest, res: Response) {
        const depts = await AdminService.listDepartments();
        return sendSuccess(res, depts);
    },
};
