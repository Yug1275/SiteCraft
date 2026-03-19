import { Router } from 'express';
import { getMaterials, createMaterial, updateMaterial, deleteMaterial } from '../controllers/materialController';
import { authenticate } from '../middleware/auth';

const router = Router();

router.use(authenticate);

router.get('/', getMaterials);
router.post('/', createMaterial);
router.put('/:id', updateMaterial);
router.delete('/:id', deleteMaterial);

export default router;
