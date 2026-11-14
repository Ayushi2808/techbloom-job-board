
const express = require("express");
const cors = require("cors");
require("dotenv").config();

const db = require("./config/db");

const app = express();
const jobRoutes = require("./routes/jobRoutes");
const tagRoutes = require("./routes/tagRoutes");
const candidateRoutes = require("./routes/candidateRoutes");
const applicationRoutes = require("./routes/applicationRoutes");

// Middleware
app.use(cors());
app.use(express.json());
app.use("/api/jobs", jobRoutes);
app.use("/api/tags", tagRoutes);
app.use("/api/candidates", candidateRoutes);
app.use("/api/applications", applicationRoutes);

// Test route
app.get("/", (req, res) => {
    res.send("TechBloom Backend is Running!");
});

// Test database connection
app.get("/test-db", async (req, res) => {
    try {
        const [result] = await db.query("SELECT 1 AS connected");

        res.json({
            message: "MySQL Connected Successfully!",
            database: process.env.DB_NAME,
            result
        });

    } catch (error) {
        console.error("Database Error:", error.message);

        res.status(500).json({
            message: "Database Connection Failed"
        });
    }
});

// Start server
const PORT = process.env.PORT || 5000;

app.listen(PORT, () => {
    console.log(`TechBloom server running on port ${PORT}`);
});
