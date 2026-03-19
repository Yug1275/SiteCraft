import { Router } from 'express';
import { getLabor, createLabor, updateLabor, deleteLabor } from '../controllers/laborController';
import { authenticate } from '../middleware/auth';

const router = Router();

router.use(authenticate);

router.get('/', getLabor);
router.post('/', createLabor);
router.put('/:id', updateLabor);
router.delete('/:id', deleteLabor);

export default router;
