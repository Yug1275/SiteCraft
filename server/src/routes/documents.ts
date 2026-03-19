import { Router } from 'express';
import { getDocuments, uploadDocument, deleteDocument, upload } from '../controllers/documentController';
import { authenticate } from '../middleware/auth';

const router = Router();

router.use(authenticate);

router.get('/', getDocuments);
router.post('/', upload.single('file'), uploadDocument);
router.delete('/:id', deleteDocument);

export default router;
