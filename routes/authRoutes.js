import express from 'express';

import { signIn, signUp } from '../controllers/authController.js';
import sessionRenewer from '../controllers/statusController.js';
import tokenValidation from '../middleware/tokenValidationMiddleware.js';

const authRouter = express.Router();
authRouter.post("/sign-up", signUp);
authRouter.post("/sign-in", signIn);
authRouter.post("/status", tokenValidation, sessionRenewer)

export default authRouter;
