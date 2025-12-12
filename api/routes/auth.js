import express from 'express';
import * as auth from '../controllers/auth.js';

const router = express.Router();
router.post('/register', auth.registerValidator(), auth.register);
router.post('/login', auth.loginValidator(), auth.login);

export default router;