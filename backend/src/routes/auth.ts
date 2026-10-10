import { Router } from 'express';
import {
  register, login, refreshAccessToken, logout, getCurrentUser,
} from '../controllers/auth';
import auth from '../middlewares/auth';
import { validateRegisterBody, validateLoginBody } from '../middlewares/validations';

const router = Router();

router.post('/register', validateRegisterBody, register);
router.post('/login', validateLoginBody, login);
router.get('/token', refreshAccessToken);
router.get('/logout', logout);
router.get('/user', auth, getCurrentUser);

export default router;
