import { Response } from 'express';
import { AuthRequest } from '../../types';
import { ComplaintService } from './complaint.service';
import { sendSuccess } from '../../utils/response';

export const ComplaintController = {
    async create(req: AuthRequest, res: Response) {
        const complaint = await ComplaintService.create({
            ...req.body,
            submittedBy: req.user!.userId,
            files: req.files as Express.Multer.File[] | undefined,
        });
        return sendSuccess(res, complaint, 'Complaint submitted successfully', 201);
    },

    async list(req: AuthRequest, res: Response) {
        const result = await ComplaintService.findAll(req.user!, req.query as any);
        return res.json({ success: true, data: result.data, pagination: result.pagination });
    },

    async getById(req: AuthRequest, res: Response) {
        const complaint = await ComplaintService.findById(req.params.id as string, req.user!.userId, req.user!.role);
        return sendSuccess(res, complaint);
    },

    async updateStatus(req: AuthRequest, res: Response) {
        const complaint = await ComplaintService.updateStatus(
            req.params.id as string,
            req.body.status,
            req.user!,
            req.body.note,
        );
        return sendSuccess(res, complaint, 'Status updated successfully');
    },

    async addRemark(req: AuthRequest, res: Response) {
        const remark = await ComplaintService.addRemark(
            req.params.id as string,
            req.user!.userId,
            req.user!.role,
            req.body.content,
        );
        return sendSuccess(res, remark, 'Remark added', 201);
    },

    async getHistory(req: AuthRequest, res: Response) {
        const history = await ComplaintService.getHistory(req.params.id as string, req.user!.userId, req.user!.role);
        return sendSuccess(res, history);
    },

    async delete(req: AuthRequest, res: Response) {
        await ComplaintService.deleteComplaint(req.params.id as string);
        return sendSuccess(res, null, 'Complaint deleted');
    },
};
