import express from "express";

import { getStatement, postNewTransaction } from "../controllers/userDataController.js";
import tokenValidation from "../middleware/tokenValidationMiddleware.js";
import newTransactionValidation from "../middleware/newTransactionValidationMiddleware.js";

const userDataRouter = express.Router();
userDataRouter.get("/main",tokenValidation, getStatement);
userDataRouter.post("/transaction", tokenValidation, newTransactionValidation, postNewTransaction);

export default userDataRouter;