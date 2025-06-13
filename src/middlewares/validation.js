// ===== src/middlewares/validation.js =====
const Joi = require('joi');
const ResponseHandler = require('../utils/responseHandler');
const pick = require('../utils/pick');

const validate = (schema) => (req, res, next) => {
    const validSchema = pick(schema, ['params', 'query', 'body']);
    const object = pick(req, Object.keys(validSchema));
    const { value, error } = Joi.compile(validSchema)
        .prefs({ errors: { label: 'key' } })
        .validate(object);

    if (error) {
        const errorMessage = error.details.map((details) => details.message).join(', ');
        return ResponseHandler.validationError(res, error.details);
    }

    Object.assign(req, value);
    return next();
};

module.exports = { validate };