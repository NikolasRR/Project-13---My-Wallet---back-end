

async function tokenValidation (req, res, next) {
    const token = req.headers.authorization;
    if (!token) {
        return res.sendStatus(422);
    }

    next();
}

export default tokenValidation;