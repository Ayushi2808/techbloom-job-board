
const express = require("express");
const router = express.Router();

const {
    applyForJob,
    getApplicationsByCandidate,
    getApplicantsByJob,
    updateApplicationStatus
} = require("../controllers/applicationController");
const { authenticateCandidate } = require("../middleware/authMiddleware");
const { authenticateEmployer } = require("../middleware/authMiddleware");

// Apply for a job
router.post(
    "/jobs/:jobId/apply",
    authenticateCandidate,
    applyForJob
);

// Get applications submitted by a candidate
router.get(
    "/candidate/:candidateId",
    authenticateCandidate,
    getApplicationsByCandidate
);

router.get(
    "/jobs/:jobId/applicants",
    authenticateEmployer,
    getApplicantsByJob
);

router.put(
    "/:applicationId/status",
    authenticateEmployer,
    updateApplicationStatus
);
module.exports = router;
