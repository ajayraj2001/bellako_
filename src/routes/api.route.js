const adminRoute = require('./admin.route');
const userRoute = require('./user.route');

const apiRoute = require('express').Router();

apiRoute.use('/admin', adminRoute);
apiRoute.use('/user', userRoute);

module.exports = apiRoute;
