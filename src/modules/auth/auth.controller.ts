import { Request, Response } from 'express';
import { AuthService } from './auth.service';
import { sendSuccess, sendError } from '../../utils/response';
import { AuthRequest } from '../../types';

export const AuthController = {
    async register(req: Request, res: Response) {
        const user = await AuthService.register(req.body);
        return sendSuccess(res, user, 'Registration successful', 201);
    },

    async login(req: Request, res: Response) {
        const result = await AuthService.login(req.body.email, req.body.password);
        return sendSuccess(res, result, 'Login successful');
    },

    async refresh(req: Request, res: Response) {
        const { refresh_token } = req.body;
        const tokens = await AuthService.refreshToken(refresh_token);
        return sendSuccess(res, tokens, 'Token refreshed');
    },

    async logout(req: AuthRequest, res: Response) {
        const { refresh_token } = req.body;
        if (!refresh_token) {
            return sendError(res, 400, 'MISSING_TOKEN', 'refresh_token is required in request body');
        }
        await AuthService.logout(refresh_token);
        return sendSuccess(res, null, 'Logged out successfully');
    },

    async me(req: AuthRequest, res: Response) {
        const profile = await AuthService.getProfile(req.user!.userId);
        return sendSuccess(res, profile);
    },

    async changePassword(req: AuthRequest, res: Response) {
        await AuthService.changePassword(
            req.user!.userId,
            req.body.current_password,
            req.body.new_password,
        );
        return sendSuccess(res, null, 'Password changed successfully');
    },
};
