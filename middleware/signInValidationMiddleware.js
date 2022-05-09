import joi from "joi";

async function signInValidation (req, res, next) {
    const singinSchema = joi.object({
        email: joi.string().email().required(),
        password: joi.string().required()
    });

    const validation = singinSchema.validate(req.body);
    if (validation.error) return res.sendStatus(422);

    next();
}

export default signInValidation;