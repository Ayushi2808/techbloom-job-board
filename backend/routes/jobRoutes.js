const express = require("express");
const router = express.Router();

const {
    getAllJobs,
    createJob,
    getJobById,
    updateJob,
    deleteJob
} = require("../controllers/jobController");

const { addTagsToJob ,
    getTagsByJob
} = require("../controllers/jobTagController");
const { authenticateEmployer } = require("../middleware/authMiddleware");

router.post("/", authenticateEmployer, createJob);

router.put("/:id", authenticateEmployer, updateJob);

router.delete("/:id", authenticateEmployer, deleteJob);

router.post("/:id/tags", authenticateEmployer, addTagsToJob);
router.get("/", getAllJobs);
router.get("/:id", getJobById);
router.get("/:id/tags", getTagsByJob);

module.exports = router;