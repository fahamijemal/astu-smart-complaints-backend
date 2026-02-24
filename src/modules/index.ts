import { Router } from 'express';

// Feature routes — imported progressively as each module is built
// Routes will be registered here as each module is added
const router = Router();

// Placeholder for health — real routes come in Stage 2
router.get('/', (_req, res) => {
    res.json({ message: 'ASTU Complaint API is running' });
});

export default router;
