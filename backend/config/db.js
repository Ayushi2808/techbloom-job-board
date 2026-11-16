
require("dotenv").config();
const mysql = require("mysql2/promise");
const fs = require("fs");
const path = require("path");

// Use Render environment variable if available,
// otherwise load the local certificate file.
const ca = process.env.TIDB_CA_CERT_BASE64
    ? Buffer.from(process.env.TIDB_CA_CERT_BASE64, "base64")
    : fs.readFileSync(
        path.join(__dirname, "../certs/certificate.pem")
    );

const pool = mysql.createPool({
    host: process.env.DB_HOST,
    user: process.env.DB_USER,
    password: process.env.DB_PASSWORD,
    database: process.env.DB_NAME,
    port: Number(process.env.DB_PORT),

    ssl: {
        ca: ca,
        rejectUnauthorized: true
    },

    waitForConnections: true,
    connectionLimit: 10,
    queueLimit: 0
});

module.exports = pool;


