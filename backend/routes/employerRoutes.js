const express = require("express");
const router = express.Router();

const { loginEmployer } = require("../controllers/employerController");

// Employer login
router.post("/login", loginEmployer);

module.exports = router;