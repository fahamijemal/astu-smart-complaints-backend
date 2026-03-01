import { Router } from 'express';
import { authenticate } from '../../middleware/auth.middleware';
import { authorize } from '../../middleware/rbac.middleware';
import { AdminController } from './admin.controller';

const router: Router = Router();
router.use(authenticate, authorize('admin'));

router.get('/users', AdminController.listUsers);
router.post('/users', AdminController.createStaff);
router.patch('/users/:id/role', AdminController.updateRole);
router.patch('/users/:id/deactivate', AdminController.deactivate);
router.patch('/users/:id/activate', AdminController.activate);

router.get('/categories', AdminController.listCategories);
router.post('/categories', AdminController.createCategory);
router.patch('/categories/:id', AdminController.updateCategory);

router.get('/departments', AdminController.listDepartments);

export default router;
