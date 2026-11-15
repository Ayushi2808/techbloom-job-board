const bcrypt = require("bcrypt");
const jwt = require("jsonwebtoken");

// Employer login
const loginEmployer = async (req, res) => {
    try {
        const { email, password } = req.body;

        // Validate required fields
        if (!email?.trim() || !password) {
            return res.status(400).json({
                success: false,
                message: "Email and password are required"
            });
        }

        // Check employer configuration
        if (
            !process.env.EMPLOYER_EMAIL ||
            !process.env.EMPLOYER_PASSWORD_HASH ||
            !process.env.JWT_SECRET
        ) {
            return res.status(500).json({
                success: false,
                message: "Employer authentication is not configured"
            });
        }

        // Check employer email
        if (
            email.trim().toLowerCase() !==
            process.env.EMPLOYER_EMAIL.trim().toLowerCase()
        ) {
            return res.status(401).json({
                success: false,
                message: "Invalid email or password"
            });
        }

        // Verify employer password
        const passwordMatch = await bcrypt.compare(
            password,
            process.env.EMPLOYER_PASSWORD_HASH
        );

        if (!passwordMatch) {
            return res.status(401).json({
                success: false,
                message: "Invalid email or password"
            });
        }

        // Generate employer JWT
        const token = jwt.sign(
            {
                role: "employer",
                email: process.env.EMPLOYER_EMAIL
            },
            process.env.JWT_SECRET,
            { expiresIn: "1d" }
        );

        res.status(200).json({
            success: true,
            message: "Employer login successful",
            token,
            employer: {
                email: process.env.EMPLOYER_EMAIL,
                role: "employer"
            }
        });

    } catch (error) {
        console.error("Employer login error:", error.message);

        res.status(500).json({
            success: false,
            message: "Employer login failed"
        });
    }
};

module.exports = { loginEmployer };