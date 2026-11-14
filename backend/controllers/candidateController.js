
const db = require("../config/db");
const bcrypt = require("bcrypt");

// Register a new candidate
const registerCandidate = async (req, res) => {
    try {
        const {
            full_name,
            email,
            password,
            phone,
            location,
            headline,
            bio,
            resume_url,
            portfolio_url
        } = req.body;

        // Validate required fields
        if (
            !full_name?.trim() ||
            !email?.trim() ||
            !password
        ) {
            return res.status(400).json({
                success: false,
                message: "Full name, email, and password are required"
            });
        }

        // Validate email format
        const emailPattern = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

        if (!emailPattern.test(email.trim())) {
            return res.status(400).json({
                success: false,
                message: "Please provide a valid email address"
            });
        }

        // Validate password length
        if (password.length < 8) {
            return res.status(400).json({
                success: false,
                message: "Password must be at least 8 characters long"
            });
        }

        // Check whether email already exists
        const [existingCandidates] = await db.query(
            "SELECT candidate_id FROM candidates WHERE email = ?",
            [email.trim().toLowerCase()]
        );

        if (existingCandidates.length > 0) {
            return res.status(409).json({
                success: false,
                message: "Email is already registered"
            });
        }

        // Hash the password
        const passwordHash = await bcrypt.hash(password, 10);

        // Insert candidate into database
        const [result] = await db.query(
            `INSERT INTO candidates
            (full_name, email, password_hash, phone, location,
             headline, bio, resume_url, portfolio_url)
            VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)`,
            [
                full_name.trim(),
                email.trim().toLowerCase(),
                passwordHash,
                phone || null,
                location || null,
                headline || null,
                bio || null,
                resume_url || null,
                portfolio_url || null
            ]
        );

        res.status(201).json({
            success: true,
            message: "Candidate registered successfully",
            candidate_id: result.insertId
        });

    } catch (error) {
        if (error.code === "ER_DUP_ENTRY") {
            return res.status(409).json({
                success: false,
                message: "Email is already registered"
            });
        }

        console.error("Candidate registration error:", error.message);

        res.status(500).json({
            success: false,
            message: "Failed to register candidate"
        });
    }
};


// Get candidate by ID
const getCandidateById = async (req, res) => {
    try {
        const candidateId = Number(req.params.id);

        if (!Number.isInteger(candidateId) || candidateId <= 0) {
            return res.status(400).json({
                success: false,
                message: "Invalid candidate ID"
            });
        }

        const [candidates] = await db.query(
            `SELECT
                candidate_id,
                full_name,
                email,
                phone,
                location,
                headline,
                bio,
                resume_url,
                portfolio_url,
                created_at,
                updated_at
             FROM candidates
             WHERE candidate_id = ?`,
            [candidateId]
        );

        if (candidates.length === 0) {
            return res.status(404).json({
                success: false,
                message: "Candidate not found"
            });
        }

        res.status(200).json({
            success: true,
            data: candidates[0]
        });

    } catch (error) {
        console.error("Error fetching candidate:", error.message);

        res.status(500).json({
            success: false,
            message: "Failed to fetch candidate"
        });
    }
};


const updateCandidate = async (req, res) => {
    try {
        const candidateId = Number(req.params.id);

        if (!Number.isInteger(candidateId) || candidateId <= 0) {
            return res.status(400).json({
                success: false,
                message: "Invalid candidate ID"
            });
        }

        const {
            full_name,
            email,
            phone,
            location,
            headline,
            bio,
            resume_url,
            portfolio_url
        } = req.body;

        if (!full_name?.trim() || !email?.trim()) {
            return res.status(400).json({
                success: false,
                message: "Full name and email are required"
            });
        }

        const emailPattern = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

        if (!emailPattern.test(email.trim())) {
            return res.status(400).json({
                success: false,
                message: "Please provide a valid email address"
            });
        }

        const [existing] = await db.query(
            "SELECT candidate_id FROM candidates WHERE candidate_id = ?",
            [candidateId]
        );

        if (existing.length === 0) {
            return res.status(404).json({
                success: false,
                message: "Candidate not found"
            });
        }

        const [duplicateEmail] = await db.query(
            `SELECT candidate_id FROM candidates
             WHERE email = ? AND candidate_id != ?`,
            [email.trim().toLowerCase(), candidateId]
        );

        if (duplicateEmail.length > 0) {
            return res.status(409).json({
                success: false,
                message: "Email is already registered"
            });
        }

        await db.query(
            `UPDATE candidates SET
                full_name = ?,
                email = ?,
                phone = ?,
                location = ?,
                headline = ?,
                bio = ?,
                resume_url = ?,
                portfolio_url = ?
             WHERE candidate_id = ?`,
            [
                full_name.trim(),
                email.trim().toLowerCase(),
                phone || null,
                location || null,
                headline || null,
                bio || null,
                resume_url || null,
                portfolio_url || null,
                candidateId
            ]
        );

        res.status(200).json({
            success: true,
            message: "Candidate profile updated successfully"
        });

    } catch (error) {
        if (error.code === "ER_DUP_ENTRY") {
            return res.status(409).json({
                success: false,
                message: "Email is already registered"
            });
        }

        console.error("Error updating candidate:", error.message);

        res.status(500).json({
            success: false,
            message: "Failed to update candidate profile"
        });
    }
};


module.exports = {
    registerCandidate,
    getCandidateById,
    updateCandidate
};
