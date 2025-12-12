import express from 'express';
import * as events from '../controllers/events.js';
import { isAuth, isAdmin } from '../controllers/auth.js';

const router = express.Router();

// Viešieji routai (be autentifikacijos)
router.get('/public', events.publicList);

// Apsaugoti routai (reikia prisijungti)
router.get('/', isAuth, events.list);
router.post('/', isAuth, events.createValidator(), events.create);
router.delete('/:id', isAuth, events.destroyValidator(), events.destroy);

// Tik administratoriui
router.post('/:id/approve', isAuth, isAdmin, events.approveValidator(), events.approve);

export default router;
