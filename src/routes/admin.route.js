const express = require("express");
const adminRoute = express.Router();

const { authenticateAdmin } = require("../middlewares");

// Import the separate route files
const authRoutes = require("./adminRoutes/authRoute");

// Use the routes
adminRoute.use("/auth", authRoutes);

module.exports = adminRoute;
