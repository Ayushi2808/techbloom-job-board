const express = require("express");
const router = express.Router();

const { 
    getAllTags,
    createTag
} = require("../controllers/tagController");
const { authenticateEmployer } = require("../middleware/authMiddleware");

// GET all tags
router.get("/", getAllTags);

// POST a new tag
router.post("/", authenticateEmployer, createTag);

module.exports = router;
