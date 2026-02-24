import { Router } from 'express';
import { AuthController } from './auth.controller';
import { authenticate } from '../../middleware/auth.middleware';
import { validate } from '../../middleware/validate.middleware';
import { authRateLimit } from '../../middleware/rateLimit.middleware';
import { registerSchema, loginSchema, changePasswordSchema, refreshSchema } from './auth.schema';

const router: Router = Router();

router.post('/register', authRateLimit, validate(registerSchema), AuthController.register);
router.post('/login', authRateLimit, validate(loginSchema), AuthController.login);
router.post('/refresh', validate(refreshSchema), AuthController.refresh);
router.post('/logout', authenticate, AuthController.logout);
router.get('/me', authenticate, AuthController.me);
router.patch('/change-password', authenticate, validate(changePasswordSchema), AuthController.changePassword);

export default router;
