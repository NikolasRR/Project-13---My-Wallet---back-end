import express from 'express';

import authRouter from './authRoutes.js';
import userDataRouter from './userDataRoutes.js';

const router = express.Router();
router.use(authRouter);
router.use(userDataRouter);
export default router;