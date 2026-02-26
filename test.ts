import { Request } from 'express';
export interface AuthRequest<P = Record<string, string>> extends Request<P> {
    user?: any;
}
const req: AuthRequest = {} as any;
const id: string = req.params.id;
