// ===== src/routes/user.route.js =====
const express = require('express');
const authRoutes = require('./userRoutes/authRoute');
const profileRoutes = require('./userRoutes/profileRoute');

const userRoute = express.Router();

userRoute.use('/auth', authRoutes);
userRoute.use('/profile', profileRoutes);

module.exports = userRoute;
