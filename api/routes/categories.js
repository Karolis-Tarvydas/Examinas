import express from 'express';
import * as categories from '../controllers/categories.js';
import { isAuth, isAdmin } from '../controllers/auth.js';

const router = express.Router();
router.get('/', categories.list);
router.post('/', isAuth, isAdmin, categories.createValidator(), categories.create);
router.delete('/:id', isAuth, isAdmin, categories.destroyValidator(), categories.destroy);

export default router;