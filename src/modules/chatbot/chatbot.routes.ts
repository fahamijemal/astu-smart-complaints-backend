import { Router } from 'express';
import { authenticate } from '../../middleware/auth.middleware';
import { chatbotRateLimit } from '../../middleware/rateLimit.middleware';
import { ChatbotController } from './chatbot.controller';

const router: Router = Router();
router.use(authenticate, chatbotRateLimit);
router.post('/message', ChatbotController.message);
export default router;
