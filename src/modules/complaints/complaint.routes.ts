import { Router } from 'express';
import { ComplaintController } from './complaint.controller';
import { authenticate } from '../../middleware/auth.middleware';
import { authorize } from '../../middleware/rbac.middleware';
import { validate } from '../../middleware/validate.middleware';
import { complaintRateLimit, fileUploadRateLimit } from '../../middleware/rateLimit.middleware';
import { upload } from '../../middleware/upload.middleware';
import {
    createComplaintSchema,
    updateStatusSchema,
    addRemarkSchema,
    complaintFilterSchema,
} from './complaint.schema';

const router: Router = Router();

router.use(authenticate);

router.post(
    '/',
    authorize('student'),
    complaintRateLimit,
    fileUploadRateLimit,
    upload.array('attachments', 3),
    validate(createComplaintSchema),
    ComplaintController.create,
);

router.get('/', validate(complaintFilterSchema, 'query'), ComplaintController.list);
router.get('/:id', ComplaintController.getById);
router.get('/:id/history', ComplaintController.getHistory);

router.patch(
    '/:id/status',
    authorize('staff', 'admin'),
    validate(updateStatusSchema),
    ComplaintController.updateStatus,
);

router.post(
    '/:id/remarks',
    authorize('staff', 'admin'),
    validate(addRemarkSchema),
    ComplaintController.addRemark,
);

router.delete('/:id', authorize('admin'), ComplaintController.delete);

export default router;
