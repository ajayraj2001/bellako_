const express = require("express");
const userRoute = express.Router();

// Import the separate route files
const authRoutes = require("./userRoutes/authRoute");

// Use the routes
userRoute.use("/auth", authRoutes); // For authentication routes

module.exports = userRoute;