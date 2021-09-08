const baseErrorHandler = (err, req, res, next) => {
    const error = {
        code: 400,
        type: err.type || 'unknown',
        message: err.message || 'unknown error occured'
    };
    res.status(400).send(error);
}

module.exports = baseErrorHandler;
