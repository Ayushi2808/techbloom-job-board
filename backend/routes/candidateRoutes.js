
const express = require("express");
const router = express.Router();

const {
    registerCandidate,
    getCandidateById,
    updateCandidate
} = require("../controllers/candidateController");

router.post("/register", registerCandidate);
router.get("/:id", getCandidateById);
router.put("/:id", updateCandidate);

module.exports = router;
