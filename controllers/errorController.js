exports.triggerError = (req, res, next) => {
    const error = new Error("This is an intentional server error.");
    error.status = 'Server Error';
    next(error);
};