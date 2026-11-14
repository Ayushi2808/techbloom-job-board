const db = require("../config/db");

// Add tags to a job
const addTagsToJob = async (req, res) => {
    let connection;

    try {
        const jobId = Number(req.params.id);
        const { tag_ids } = req.body;

        // Validate job ID
        if (!Number.isInteger(jobId) || jobId <= 0) {
            return res.status(400).json({
                success: false,
                message: "Invalid job ID"
            });
        }

        // Validate tag IDs
        if (
            !Array.isArray(tag_ids) ||
            tag_ids.length === 0 ||
            !tag_ids.every(id => Number.isInteger(id) && id > 0)
        ) {
            return res.status(400).json({
                success: false,
                message: "Provide a non-empty array of valid tag IDs"
            });
        }

        // Remove duplicate IDs from the request
        const uniqueTagIds = [...new Set(tag_ids)];

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

        // Check whether all tags exist
        const placeholders = uniqueTagIds.map(() => "?").join(",");

        const [tags] = await db.query(
            `SELECT tag_id FROM tags WHERE tag_id IN (${placeholders})`,
            uniqueTagIds
        );

        if (tags.length !== uniqueTagIds.length) {
            return res.status(404).json({
                success: false,
                message: "One or more tag IDs do not exist"
            });
        }

        // Insert job-tag relationships
        connection = await db.getConnection();
        await connection.beginTransaction();

        const values = uniqueTagIds.map(tagId => [jobId, tagId]);

        const [result] = await connection.query(
            `INSERT IGNORE INTO job_tags (job_id, tag_id)
             VALUES ${values.map(() => "(?, ?)").join(", ")}`,
            values.flat()
        );

        await connection.commit();

        res.status(201).json({
            success: true,
            message: "Tags assigned to job successfully",
            job_id: jobId,
            tags_added: result.affectedRows
        });

    } catch (error) {
        if (connection) {
            await connection.rollback();
        }

        console.error("Error assigning tags:", error.message);

        res.status(500).json({
            success: false,
            message: "Failed to assign tags to job"
        });

    } finally {
        if (connection) {
            connection.release();
        }
    }
};

// Get all tags assigned to a job
const getTagsByJob = async (req, res) => {
    try {
        const { id } = req.params;

        const [jobs] = await db.query(
            "SELECT job_id FROM jobs WHERE job_id = ?",
            [id]
        );

        if (jobs.length === 0) {
            return res.status(404).json({
                success: false,
                message: "Job not found"
            });
        }

        const [tags] = await db.query(
            `SELECT t.tag_id, t.tag_name
             FROM tags t
             INNER JOIN job_tags jt
             ON t.tag_id = jt.tag_id
             WHERE jt.job_id = ?
             ORDER BY t.tag_name ASC`,
            [id]
        );

        res.status(200).json({
            success: true,
            job_id: Number(id),
            count: tags.length,
            data: tags
        });

    } catch (error) {
        console.error("Error fetching job tags:", error.message);

        res.status(500).json({
            success: false,
            message: "Failed to fetch job tags"
        });
    }
};


const handleJobSubmit = async (e) => {
  e.preventDefault()

  try {
    setJobPostLoading(true)
    setJobPostError('')
    setJobPostSuccess('')

    const jobResponse = await fetch('http://localhost:5000/api/jobs', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({
        ...newJob,
        salary_min: newJob.salary_min ? Number(newJob.salary_min) : null,
        salary_max: newJob.salary_max ? Number(newJob.salary_max) : null
      })
    })

    const jobResult = await jobResponse.json()

    if (!jobResponse.ok) {
      throw new Error(jobResult.message || 'Failed to create job')
    }

    const createdJobId = jobResult.job_id || jobResult.data?.job_id

    if (!createdJobId) {
      throw new Error('Job created, but its ID was not returned by the server')
    }

    if (selectedJobTags.length > 0) {
      const tagResponse = await fetch(
        `http://localhost:5000/api/jobs/${createdJobId}/tags`,
        {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json'
          },
          body: JSON.stringify({
            tag_ids: selectedJobTags
          })
        }
      )

      const tagResult = await tagResponse.json()

      if (!tagResponse.ok) {
        throw new Error(tagResult.message || 'Job created, but tags could not be assigned')
      }
    }

    setJobPostSuccess('Job posted successfully!')

    setNewJob({
      title: '',
      company_name: '',
      location: '',
      employment_type: 'Internship',
      work_mode: 'remote',
      salary_min: '',
      salary_max: '',
      description: '',
      requirements: ''
    })

    setSelectedJobTags([])

  } catch (err) {
    setJobPostError(err.message)
  } finally {
    setJobPostLoading(false)
  }
}


module.exports = {
    addTagsToJob,
    getTagsByJob
};
