import joi from "joi";

async function newTransactionValidation (req, res, next) {
    const transactionSchema = joi.object({
        value: joi.number().required(),
        description: joi.string().required()
    });

    const validation = transactionSchema.validate(req.body);
    if (validation.error) res.sendStatus(422);

    next();
}

export default newTransactionValidation;