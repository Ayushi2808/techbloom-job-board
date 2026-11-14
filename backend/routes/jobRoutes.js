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

router.get("/", getAllJobs);
router.post("/", createJob);
router.get("/:id", getJobById);
router.put("/:id", updateJob);
router.delete("/:id", deleteJob);
router.get("/:id/tags", getTagsByJob);

// Assign tags to a job
router.post("/:id/tags", addTagsToJob);

module.exports = router;