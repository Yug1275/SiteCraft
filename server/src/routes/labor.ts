import { Router } from 'express';
import { getLabor, createLabor, updateLabor, deleteLabor } from '../controllers/laborController';

const router = Router();

router.get('/', getLabor);
router.post('/', createLabor);
router.put('/:id', updateLabor);
router.delete('/:id', deleteLabor);

export default router;
