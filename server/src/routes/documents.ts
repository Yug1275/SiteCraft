import { Router } from 'express';
import { getDocuments, uploadDocument, deleteDocument, upload } from '../controllers/documentController';

const router = Router();

router.get('/', getDocuments);
router.post('/', upload.single('file'), uploadDocument);
router.delete('/:id', deleteDocument);

export default router;
