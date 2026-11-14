
const express = require("express");
const router = express.Router();

const {
    applyForJob,
    getApplicationsByCandidate,
    getApplicantsByJob,
    updateApplicationStatus
} = require("../controllers/applicationController");

// Apply for a job
router.post("/jobs/:jobId/apply", applyForJob);

// Get applications submitted by a candidate
router.get("/candidate/:candidateId", getApplicationsByCandidate);

// Get all applicants for a job
router.get("/jobs/:jobId/applicants", getApplicantsByJob);

router.put("/:applicationId/status", updateApplicationStatus);

module.exports = router;
