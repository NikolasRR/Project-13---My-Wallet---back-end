async function allowCookies (req, res, next) {

    res.append("Access-Control-Allow-Credentials", true);

    next();
}

export default allowCookies;