
const db = require("../config/db");

// Apply for a job
const applyForJob = async (req, res) => {
    try {
        const candidateId = Number(req.user.candidateId);
        const jobId = Number(req.params.jobId);
        const { cover_letter } = req.body;

        // Validate candidate ID
        if (!Number.isInteger(candidateId) || candidateId <= 0) {
            return res.status(400).json({
                success: false,
                message: "Valid candidate ID is required"
            });
        }

        // Validate job ID
        if (!Number.isInteger(jobId) || jobId <= 0) {
            return res.status(400).json({
                success: false,
                message: "Invalid job ID"
            });
        }

        // Check whether candidate exists
        const [candidates] = await db.query(
            "SELECT candidate_id FROM candidates WHERE candidate_id = ?",
            [candidateId]
        );

        if (candidates.length === 0) {
            return res.status(404).json({
                success: false,
                message: "Candidate not found"
            });
        }

        // Check whether job exists and is open
        const [jobs] = await db.query(
            "SELECT job_id FROM jobs WHERE job_id = ? AND status = 'open'",
            [jobId]
        );

        if (jobs.length === 0) {
            return res.status(404).json({
                success: false,
                message: "Job not found or is no longer open"
            });
        }

        // Insert application
        const [result] = await db.query(
            `INSERT INTO applications
             (candidate_id, job_id, cover_letter)
             VALUES (?, ?, ?)`,
            [candidateId, jobId, cover_letter || null]
        );

        res.status(201).json({
            success: true,
            message: "Job application submitted successfully",
            application_id: result.insertId
        });

    } catch (error) {
        // Handle duplicate application
        if (error.code === "ER_DUP_ENTRY") {
            return res.status(409).json({
                success: false,
                message: "You have already applied for this job"
            });
        }

        console.error("Error applying for job:", error.message);

        res.status(500).json({
            success: false,
            message: "Failed to submit job application"
        });
    }
};


const getApplicationsByCandidate = async (req, res) => {
    try {
        const candidateId = Number(req.user.candidateId);
        const requestedCandidateId = Number(req.params.candidateId);

        // Check application history ownership
if (requestedCandidateId !== candidateId) {
    return res.status(403).json({
        success: false,
        message: "You can only view your own applications"
    });
}
        if (!Number.isInteger(candidateId) || candidateId <= 0) {
            return res.status(400).json({
                success: false,
                message: "Invalid candidate ID"
            });
        }

        // Check whether candidate exists
        const [candidates] = await db.query(
            "SELECT candidate_id FROM candidates WHERE candidate_id = ?",
            [candidateId]
        );

        if (candidates.length === 0) {
            return res.status(404).json({
                success: false,
                message: "Candidate not found"
            });
        }

        // Fetch candidate's applications with job details
        const [applications] = await db.query(
            `SELECT
                a.application_id,
                a.candidate_id,
                a.job_id,
                a.cover_letter,
                a.status,
                a.applied_at,
                j.title,
                j.company_name,
                j.location,
                j.work_mode,
                j.employment_type
             FROM applications a
             INNER JOIN jobs j ON a.job_id = j.job_id
             WHERE a.candidate_id = ?
             ORDER BY a.applied_at DESC`,
            [candidateId]
        );

        res.status(200).json({
            success: true,
            count: applications.length,
            data: applications
        });

    } catch (error) {
        console.error("Error fetching candidate applications:", error.message);

        res.status(500).json({
            success: false,
            message: "Failed to fetch candidate applications"
        });
    }
};


const getApplicantsByJob = async (req, res) => {
    try {
        const jobId = Number(req.params.jobId);

        if (!Number.isInteger(jobId) || jobId <= 0) {
            return res.status(400).json({
                success: false,
                message: "Invalid job ID"
            });
        }

        // Check whether job exists
        const [jobs] = await db.query(
            "SELECT job_id FROM jobs WHERE job_id = ?",
            [jobId]
        );

        if (jobs.length === 0) {
            return res.status(404).json({
                success: false,
                message: "Job not found"
            });
        }

        // Fetch applicants with their application details
        const [applicants] = await db.query(
            `SELECT
                a.application_id,
                a.candidate_id,
                a.job_id,
                a.cover_letter,
                a.status,
                a.applied_at,
                c.full_name,
                c.email,
                c.phone,
                c.location,
                c.headline,
                c.bio,
                c.resume_url,
                c.portfolio_url
             FROM applications a
             INNER JOIN candidates c
             ON a.candidate_id = c.candidate_id
             WHERE a.job_id = ?
             ORDER BY a.applied_at DESC`,
            [jobId]
        );

        res.status(200).json({
            success: true,
            count: applicants.length,
            data: applicants
        });

    } catch (error) {
        console.error("Error fetching job applicants:", error.message);

        res.status(500).json({
            success: false,
            message: "Failed to fetch job applicants"
        });
    }
};


const updateApplicationStatus = async (req, res) => {
    try {
        const applicationId = Number(req.params.applicationId);
        const { status } = req.body;

        if (!Number.isInteger(applicationId) || applicationId <= 0) {
            return res.status(400).json({
                success: false,
                message: "Invalid application ID"
            });
        }

        const validStatuses = [
            "pending",
            "shortlisted",
            "rejected",
            "accepted"
        ];

        if (
            typeof status !== "string" ||
            !validStatuses.includes(status.toLowerCase())
        ) {
            return res.status(400).json({
                success: false,
                message: "Invalid status. Use pending, shortlisted, rejected, or accepted"
            });
        }

        const [applications] = await db.query(
            "SELECT application_id FROM applications WHERE application_id = ?",
            [applicationId]
        );

        if (applications.length === 0) {
            return res.status(404).json({
                success: false,
                message: "Application not found"
            });
        }

        await db.query(
            "UPDATE applications SET status = ? WHERE application_id = ?",
            [status.toLowerCase(), applicationId]
        );

        res.status(200).json({
            success: true,
            message: "Application status updated successfully",
            application_id: applicationId,
            status: status.toLowerCase()
        });

    } catch (error) {
        console.error("Error updating application status:", error.message);

        res.status(500).json({
            success: false,
            message: "Failed to update application status"
        });
    }
};


module.exports = {
    applyForJob,
    getApplicationsByCandidate,
    getApplicantsByJob,
    updateApplicationStatus
};
