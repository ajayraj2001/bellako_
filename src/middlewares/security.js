// ===== src/middlewares/security.js =====
const helmet = require('helmet');
const mongoSanitize = require('express-mongo-sanitize');
const xss = require('xss-clean');
const hpp = require('hpp');

const securityMiddlewares = [
    helmet(),
    mongoSanitize(),
    xss(),
    hpp()
];

module.exports = securityMiddlewares;