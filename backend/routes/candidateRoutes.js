
const express = require("express");
const router = express.Router();

const {
    registerCandidate,
    loginCandidate,
    getCandidateById,
    updateCandidate
} = require("../controllers/candidateController");
const { authenticateCandidate } = require("../middleware/authMiddleware");

router.post("/register", registerCandidate);
router.post("/login", loginCandidate);
router.get("/:id", authenticateCandidate, getCandidateById);
router.put("/:id", authenticateCandidate, updateCandidate);


module.exports = router;
