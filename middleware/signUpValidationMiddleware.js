import joi from "joi";

async function signUpValidation (req, res, next) {
    const singupSchema = joi.object({
        name: joi.string().required(),
        email: joi.string().email().required(),
        password: joi.string().required()
    });

    const validation = singupSchema.validate(req.body);
    if (validation.error) return res.sendStatus(422);

    next();
}

export default signUpValidation;