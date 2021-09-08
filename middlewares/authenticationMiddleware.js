const { getUserById } = require("../data/usersData");

const authenticate = async (req, res, next) => {
    const token = req.headers['x-authrz'];
    if (token) {
        const user = await getUserById(token);
        if (!user || !user.expiration || user.expiration < Date.now()) {
            return res.status(401).send('You are not authenticated and cannot perform this action');
        } else {
            next();
        }
    } else {
        return res.status(401).send('You are not authenticated and cannot perform this action');
    }
}

module.exports = authenticate;
