const db = require("../config/db");

// Get all tags
const getAllTags = async (req, res) => {
    try {
        const [tags] = await db.query(
            "SELECT * FROM tags ORDER BY tag_name ASC"
        );

        res.status(200).json({
            success: true,
            count: tags.length,
            data: tags
        });

    } catch (error) {
        console.error("Error fetching tags:", error.message);

        res.status(500).json({
            success: false,
            message: "Failed to fetch tags"
        });
    }
};

// Create a new tag
const createTag = async (req, res) => {
    try {
        const { tag_name } = req.body;

        // Validate tag name
        if (!tag_name || !tag_name.trim()) {
            return res.status(400).json({
                success: false,
                message: "Tag name is required"
            });
        }

        const cleanTagName = tag_name.trim();

        // Insert tag into database
        const [result] = await db.query(
            "INSERT INTO tags (tag_name) VALUES (?)",
            [cleanTagName]
        );

        res.status(201).json({
            success: true,
            message: "Tag created successfully",
            tag_id: result.insertId
        });

    } catch (error) {
        if (error.code === "ER_DUP_ENTRY") {
            return res.status(409).json({
                success: false,
                message: "This tag already exists"
            });
        }

        console.error("Error creating tag:", error.message);

        res.status(500).json({
            success: false,
            message: "Failed to create tag"
        });
    }
};

module.exports = {
    getAllTags,
    createTag
};