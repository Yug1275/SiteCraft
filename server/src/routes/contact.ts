import { Router } from 'express';
import { submitContact, getContactMessages } from '../controllers/contactController';

const router = Router();

router.get('/', getContactMessages);
router.post('/', submitContact);

export default router;
