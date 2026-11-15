
const db = require("../config/db");

// Get all open jobs

const getAllJobs = async (req, res) => {
    try {
        const { search, location, work_mode, tag_ids } = req.query;

        let query = `
            SELECT DISTINCT j.*
            FROM jobs j
        `;

        const conditions = ["j.status = 'open'"];
        const values = [];

        // Search by job title or company
        // Search by job title, company, description or requirements
if (search && search.trim()) {
    conditions.push(
        "(j.title LIKE ? OR j.company_name LIKE ? OR j.description LIKE ? OR j.requirements LIKE ?)"
    );

    const searchValue = `%${search.trim()}%`;
    values.push(searchValue, searchValue, searchValue, searchValue);
}

        // Filter by location
        if (location && location.trim()) {
            conditions.push("j.location LIKE ?");
            values.push(`%${location.trim()}%`);
        }

        // Filter by work mode
        if (work_mode) {
            const validModes = ["remote", "hybrid", "onsite"];

            if (!validModes.includes(work_mode.toLowerCase())) {
                return res.status(400).json({
                    success: false,
                    message: "Invalid work mode"
                });
            }

            conditions.push("LOWER(j.work_mode) = ?");
            values.push(work_mode.toLowerCase());
        }

        // Filter by technology tags
        if (tag_ids) {
            const ids = tag_ids.split(",").map(Number);

            if (
                ids.length === 0 ||
                !ids.every(id => Number.isInteger(id) && id > 0)
            ) {
                return res.status(400).json({
                    success: false,
                    message: "Invalid tag IDs"
                });
            }

            const uniqueIds = [...new Set(ids)];
            const placeholders = uniqueIds.map(() => "?").join(",");

            query += `
                INNER JOIN job_tags jt
                ON j.job_id = jt.job_id
            `;

            conditions.push(
                `jt.tag_id IN (${placeholders})`
            );

            values.push(...uniqueIds);
        }

        query += `
            WHERE ${conditions.join(" AND ")}
            ORDER BY j.created_at DESC
        `;

        const [jobs] = await db.query(query, values);

        res.status(200).json({
            success: true,
            count: jobs.length,
            data: jobs
        });

    } catch (error) {
        console.error("Error fetching jobs:", error.message);

        res.status(500).json({
            success: false,
            message: "Failed to fetch jobs"
        });
    }
};


const createJob = async (req, res) => {
    try {
        const {
            title,
            company_name,
            location,
            employment_type,
            work_mode = "onsite",
            description,
            requirements,
            salary_min,
            salary_max,
            application_deadline
        } = req.body;

        // Validate required fields
        if (!title || !company_name || !employment_type || !description) {
            return res.status(400).json({
                success: false,
                message: "Title, company name, employment type and description are required"
            });
        }

        // Validate work mode
        const allowedModes = ["remote", "hybrid", "onsite"];

        if (!allowedModes.includes(work_mode.toLowerCase())) {
            return res.status(400).json({
                success: false,
                message: "Work mode must be remote, hybrid or onsite"
            });
        }

        // Validate salary values
        const min = salary_min == null ? null : Number(salary_min);
        const max = salary_max == null ? null : Number(salary_max);

        if (
            (min !== null && (!Number.isFinite(min) || min < 0)) ||
            (max !== null && (!Number.isFinite(max) || max < 0))
        ) {
            return res.status(400).json({
                success: false,
                message: "Salary must be a valid non-negative number"
            });
        }

        if (min !== null && max !== null && min > max) {
            return res.status(400).json({
                success: false,
                message: "Minimum salary cannot exceed maximum salary"
            });
        }

        const sql = `
            INSERT INTO jobs
            (
                title,
                company_name,
                location,
                employment_type,
                work_mode,
                description,
                requirements,
                salary_min,
                salary_max,
                application_deadline
            )
            VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
        `;

        const values = [
            title.trim(),
            company_name.trim(),
            location || null,
            employment_type.trim(),
            work_mode.toLowerCase(),
            description.trim(),
            requirements || null,
            min,
            max,
            application_deadline || null
        ];

        const [result] = await db.query(sql, values);

        res.status(201).json({
            success: true,
            message: "Job created successfully",
            job_id: result.insertId
        });

    } catch (error) {
        console.error("Error creating job:", error.message);

        res.status(500).json({
            success: false,
            message: "Failed to create job"
        });
    }
};


const getJobById = async (req, res) => {
    try {
        const { id } = req.params;

        const [jobs] = await db.query(
            `SELECT *
             FROM jobs
             WHERE job_id = ?`,
            [id]
        );

        if (jobs.length === 0) {
            return res.status(404).json({
                success: false,
                message: "Job not found"
            });
        }

        res.status(200).json({
            success: true,
            data: jobs[0]
        });

    } catch (error) {
        console.error("Error fetching job:", error.message);

        res.status(500).json({
            success: false,
            message: "Failed to fetch job"
        });
    }
};


const updateJob = async (req, res) => {
    try {
        const { id } = req.params;

        const {
            title,
            company_name,
            location,
            employment_type,
            work_mode,
            description,
            requirements,
            salary_min,
            salary_max,
            application_deadline
        } = req.body;

        // Check whether the job exists
        const [existingJobs] = await db.query(
            "SELECT * FROM jobs WHERE job_id = ?",
            [id]
        );

        if (existingJobs.length === 0) {
            return res.status(404).json({
                success: false,
                message: "Job not found"
            });
        }

        // Validate required fields
        if (
            !title?.trim() ||
            !company_name?.trim() ||
            !employment_type?.trim() ||
            !description?.trim()
        ) {
            return res.status(400).json({
                success: false,
                message: "Required fields cannot be empty"
            });
        }

        // Validate work mode
        const allowedModes = ["remote", "hybrid", "onsite"];

        if (
            typeof work_mode !== "string" ||
            !allowedModes.includes(work_mode.toLowerCase())
        ) {
            return res.status(400).json({
                success: false,
                message: "Invalid work mode"
            });
        }

        // Validate salary
        const min = salary_min == null ? null : Number(salary_min);
        const max = salary_max == null ? null : Number(salary_max);

        if (
            (min !== null && (!Number.isFinite(min) || min < 0)) ||
            (max !== null && (!Number.isFinite(max) || max < 0))
        ) {
            return res.status(400).json({
                success: false,
                message: "Invalid salary values"
            });
        }

        if (min !== null && max !== null && min > max) {
            return res.status(400).json({
                success: false,
                message: "Minimum salary cannot exceed maximum salary"
            });
        }

        const sql = `
            UPDATE jobs
            SET
                title = ?,
                company_name = ?,
                location = ?,
                employment_type = ?,
                work_mode = ?,
                description = ?,
                requirements = ?,
                salary_min = ?,
                salary_max = ?,
                application_deadline = ?
            WHERE job_id = ?
        `;

        const values = [
            title.trim(),
            company_name.trim(),
            location || null,
            employment_type.trim(),
            work_mode.toLowerCase(),
            description.trim(),
            requirements || null,
            min,
            max,
            application_deadline || null,
            id
        ];

        await db.query(sql, values);

        res.status(200).json({
            success: true,
            message: "Job updated successfully"
        });

    } catch (error) {
        console.error("Error updating job:", error.message);

        res.status(500).json({
            success: false,
            message: "Failed to update job"
        });
    }
};


const deleteJob = async (req, res) => {
    try {
        const { id } = req.params;

        const [result] = await db.query(
            "DELETE FROM jobs WHERE job_id = ?",
            [id]
        );

        if (result.affectedRows === 0) {
            return res.status(404).json({
                success: false,
                message: "Job not found"
            });
        }

        res.status(200).json({
            success: true,
            message: "Job deleted successfully"
        });

    } catch (error) {
        console.error("Error deleting job:", error.message);

        res.status(500).json({
            success: false,
            message: "Failed to delete job"
        });
    }
};

module.exports = {
    getAllJobs,
    createJob,
    getJobById,
    updateJob,
    deleteJob
};

