const express = require("express");
const router = express.Router();

const { 
    getAllTags,
    createTag
} = require("../controllers/tagController");

// GET all tags
router.get("/", getAllTags);

// POST a new tag
router.post("/", createTag);

module.exports = router;
