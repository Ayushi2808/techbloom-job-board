
import { useEffect, useState } from 'react'
import './App.css'

function App() {
  const [jobs, setJobs] = useState([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')
  const [searchTerm, setSearchTerm] = useState('')
  const [workMode, setWorkMode] = useState('')
  const [tags, setTags] = useState([])
  const [selectedTag, setSelectedTag] = useState('')
  const [selectedJob, setSelectedJob] = useState(null)
  const [applicant, setApplicant] = useState({
  full_name: '',
  email: '',
  password: '',
  resume_url: '',
  portfolio_url: '',
  cover_letter: ''
})

const [applicationLoading, setApplicationLoading] = useState(false)
const [applicationError, setApplicationError] = useState('')
const [applicationSuccess, setApplicationSuccess] = useState('')
const [showJobForm, setShowJobForm] = useState(false)

const [newJob, setNewJob] = useState({
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

const [selectedJobTags, setSelectedJobTags] = useState([])
const [jobPostLoading, setJobPostLoading] = useState(false)
const [jobPostError, setJobPostError] = useState('')
const [jobPostSuccess, setJobPostSuccess] = useState('')

  // Fetch jobs whenever search or work mode changes
  useEffect(() => {
    const fetchJobs = async () => {
      try {
        setLoading(true)
        setError('')

        const params = new URLSearchParams()

        if (searchTerm.trim()) {
          params.append('search', searchTerm.trim())
        }

        if (workMode) {
          params.append('work_mode', workMode)
        }

        if (selectedTag) {
  params.append('tag_ids', selectedTag)
}

        const response = await fetch(
          `http://localhost:5000/api/jobs?${params.toString()}`
        )

        if (!response.ok) {
          throw new Error('Failed to fetch jobs')
        }

        const result = await response.json()
        setJobs(result.data)
      } catch (err) {
        setError(err.message)
      } finally {
        setLoading(false)
      }
    }

    fetchJobs()
  }, [searchTerm, workMode, selectedTag])

  useEffect(() => {
  const fetchTags = async () => {
    try {
      const response = await fetch('http://localhost:5000/api/tags')

      if (!response.ok) {
        throw new Error('Failed to fetch tags')
      }

      const result = await response.json()
      setTags(result.data)
    } catch (err) {
      console.error(err.message)
    }
  }

  fetchTags()
}, [])

  // Scroll to job listings when the hero search button is clicked
  const handleSearch = () => {
    document.getElementById('jobs')?.scrollIntoView({
      behavior: 'smooth'
    })
  }

  const handleApplicationSubmit = async (e) => {
  e.preventDefault()

  if (!selectedJob) return

  try {
    setApplicationLoading(true)
    setApplicationError('')
    setApplicationSuccess('')

    // Register candidate
    const registerResponse = await fetch(
      'http://localhost:5000/api/candidates/register',
      {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          full_name: applicant.full_name,
          email: applicant.email,
          password: applicant.password,
          resume_url: applicant.resume_url,
          portfolio_url: applicant.portfolio_url
        })
      }
    )

    const registerResult = await registerResponse.json()

    if (!registerResponse.ok) {
      throw new Error(registerResult.message || 'Candidate registration failed')
    }

    // Submit application using the returned candidate ID
    const applicationResponse = await fetch(
      `http://localhost:5000/api/applications/jobs/${selectedJob.job_id}/apply`,
      {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          candidate_id: registerResult.candidate_id,
          cover_letter: applicant.cover_letter
        })
      }
    )

    const applicationResult = await applicationResponse.json()

    if (!applicationResponse.ok) {
      throw new Error(applicationResult.message || 'Application failed')
    }

    setApplicationSuccess('Your application was submitted successfully!')

  } catch (err) {
    setApplicationError(err.message)
  } finally {
    setApplicationLoading(false)
  }
}

const handleJobInputChange = (e) => {
  const { name, value } = e.target

  setNewJob((prev) => ({
    ...prev,
    [name]: value
  }))
}

const handleJobTagChange = (e) => {
  const tagId = Number(e.target.value)

  setSelectedJobTags((prev) =>
    prev.includes(tagId)
      ? prev.filter((id) => id !== tagId)
      : [...prev, tagId]
  )
}


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

    const createdJobId =
      jobResult.job_id || jobResult.data?.job_id

    if (!createdJobId) {
      throw new Error('Job ID was not returned by the server')
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
        throw new Error(tagResult.message || 'Failed to assign tags')
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

  return (
    <div className="app">

      {/* Navbar */}
      <nav className="navbar">
        <div className="logo">
          Tech<span>Bloom</span>
        </div>

        <div className="nav-links">
          <a href="#home">Home</a>
          <a href="#jobs">Find Jobs</a>
          <a href="#employers">For Employers</a>
        </div>

        <div className="nav-actions">
          <button className="login-btn">Log In</button>
          <button className="signup-btn">Sign Up</button>
        </div>
      </nav>

      {/* Hero Section */}
      <section className="hero-section" id="home">
        <div className="hero-content">
          <span className="hero-label">
            ✦ YOUR NEXT OPPORTUNITY STARTS HERE
          </span>

          <h1>
            Grow Your Career.
            <br />
            Find Your <span>Dream Job.</span>
          </h1>

          <p>
            Explore exciting opportunities in technology.
            Connect with companies and take the next step
            in your professional journey.
          </p>

          <div className="search-box">
            <input
              type="text"
              placeholder="Job title, company or skill"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
            />

            <button type="button" onClick={handleSearch}>
              Search Jobs
            </button>
          </div>

          <div className="hero-stats">
            <div>
              <strong>Explore</strong>
              <span>New Opportunities</span>
            </div>

            <div>
              <strong>Discover</strong>
              <span>Top Companies</span>
            </div>

            <div>
              <strong>Build</strong>
              <span>Your Career</span>
            </div>
          </div>
        </div>

        <div className="hero-decoration">
          <div className="decoration-card">
            <span>✿</span>
            <h3>Your future is growing.</h3>
            <p>Find opportunities that match your skills.</p>
          </div>
        </div>
      </section>

      {/* Jobs Section */}
      <section className="jobs-section" id="jobs">
        <div className="section-heading">
          <span>EXPLORE OPPORTUNITIES</span>
          <h2>Find Your Next Opportunity</h2>
          <p>Discover jobs that match your skills and interests.</p>
        </div>

        {/* Job Filters */}
        <div className="job-filters">
          <input
            type="text"
            placeholder="Search by job title or company..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
          />

          <select
            value={workMode}
            onChange={(e) => setWorkMode(e.target.value)}
          >
            <option value="">All Work Modes</option>
            <option value="remote">Remote</option>
            <option value="hybrid">Hybrid</option>
            <option value="onsite">Onsite</option>
          </select>
          <select
  value={selectedTag}
  onChange={(e) => setSelectedTag(e.target.value)}
>
  <option value="">All Technologies</option>

  {tags.map((tag) => (
    <option key={tag.tag_id} value={tag.tag_id}>
      {tag.tag_name}
    </option>
  ))}
</select>
        </div>

        {/* Loading and Error Messages */}
        {loading && <p>Loading jobs...</p>}

        {error && <p>{error}</p>}

        {!loading && !error && jobs.length === 0 && (
          <p>No jobs available right now.</p>
        )}

        {/* Job Cards */}
        {!loading && !error && jobs.length > 0 && (
          <div className="jobs-container">
            {jobs.map((job) => (
              <div className="job-card" key={job.job_id}>
                <div className="job-top">
                  <span className="job-type">
                    {job.employment_type}
                  </span>

                  <span className="job-mode">
                    {job.work_mode}
                  </span>
                </div>

                <h3>{job.title}</h3>

                <p className="company-name">
                  {job.company_name}
                </p>

                <p className="job-location">
                  📍 {job.location}
                </p>

                <p>{job.description}</p>

                <div className="job-tags">
                  {(job.requirements || '')
                    .split(',')
                    .filter((tag) => tag.trim())
                    .map((tag, index) => (
                      <span key={index}>
                        {tag.trim()}
                      </span>
                    ))}
                </div>

                <div className="job-bottom">
                  <span>Explore this role</span>
                  <button
  type="button"
  onClick={() => setSelectedJob(job)}
>
  View Details
</button>
                </div>
              </div>
            ))}
          </div>
        )}
      </section>

      {/* Employer Job Posting Section */}
      <section className="jobs-section" id="employers">
        <div className="section-heading">
          <span>FOR EMPLOYERS</span>
          <h2>Post Your Next Opportunity</h2>
          <p>Find talented candidates for your team.</p>
        </div>

        {!showJobForm && (
          <button
            className="signup-btn"
            onClick={() => setShowJobForm(true)}
          >
            Post a Job
          </button>
        )}

        {showJobForm && (
          <form onSubmit={handleJobSubmit} className="application-form">

            <h3>Create a Job Listing</h3>

            <input
              type="text"
              name="title"
              placeholder="Job Title"
              value={newJob.title}
              onChange={handleJobInputChange}
              required
            />

            <input
              type="text"
              name="company_name"
              placeholder="Company Name"
              value={newJob.company_name}
              onChange={handleJobInputChange}
              required
            />

            <input
              type="text"
              name="location"
              placeholder="Job Location"
              value={newJob.location}
              onChange={handleJobInputChange}
              required
            />

            <select
              name="employment_type"
              value={newJob.employment_type}
              onChange={handleJobInputChange}
              required
            >
              <option value="Internship">Internship</option>
              <option value="Full-time">Full-time</option>
              <option value="Part-time">Part-time</option>
              <option value="Contract">Contract</option>
            </select>

            <select
              name="work_mode"
              value={newJob.work_mode}
              onChange={handleJobInputChange}
              required
            >
              <option value="remote">Remote</option>
              <option value="hybrid">Hybrid</option>
              <option value="onsite">Onsite</option>
            </select>

            <input
              type="number"
              name="salary_min"
              placeholder="Minimum Salary"
              min="0"
              value={newJob.salary_min}
              onChange={handleJobInputChange}
            />

            <input
              type="number"
              name="salary_max"
              placeholder="Maximum Salary"
              min="0"
              value={newJob.salary_max}
              onChange={handleJobInputChange}
            />

            <textarea
              name="description"
              placeholder="Job Description"
              value={newJob.description}
              onChange={handleJobInputChange}
              required
            />

            <textarea
              name="requirements"
              placeholder="Job Requirements"
              value={newJob.requirements}
              onChange={handleJobInputChange}
              required
            />

            <h4>Select Technology Tags</h4>

            <div className="job-tags">
              {tags.map((tag) => (
                <label key={tag.tag_id}>
                  <input
                    type="checkbox"
                    value={tag.tag_id}
                    checked={selectedJobTags.includes(tag.tag_id)}
                    onChange={handleJobTagChange}
                  />
                  {tag.tag_name}
                </label>
              ))}
            </div>

            {jobPostError && (
              <p className="form-error">{jobPostError}</p>
            )}

            {jobPostSuccess && (
              <p className="form-success">{jobPostSuccess}</p>
            )}

            <button type="submit" disabled={jobPostLoading}>
              {jobPostLoading ? 'Posting...' : 'Publish Job'}
            </button>

            <button
              type="button"
              onClick={() => setShowJobForm(false)}
            >
              Cancel
            </button>

          </form>
        )}
      </section>

      {selectedJob && (
  <div className="modal-overlay">
    <div className="job-details-modal">

      <button
        className="modal-close"
        onClick={() => setSelectedJob(null)}
      >
        ×
      </button>

      <form onSubmit={handleApplicationSubmit} className="application-form">

  <h3>Apply for this Position</h3>

  <input
    type="text"
    placeholder="Full Name"
    required
    value={applicant.full_name}
    onChange={(e) =>
      setApplicant({ ...applicant, full_name: e.target.value })
    }
  />

  <input
    type="email"
    placeholder="Email Address"
    required
    value={applicant.email}
    onChange={(e) =>
      setApplicant({ ...applicant, email: e.target.value })
    }
  />

  <input
    type="password"
    placeholder="Create Password (minimum 8 characters)"
    required
    minLength={8}
    value={applicant.password}
    onChange={(e) =>
      setApplicant({ ...applicant, password: e.target.value })
    }
  />

  <input
    type="url"
    placeholder="Resume URL"
    value={applicant.resume_url}
    onChange={(e) =>
      setApplicant({ ...applicant, resume_url: e.target.value })
    }
  />

  <input
    type="url"
    placeholder="Portfolio URL"
    value={applicant.portfolio_url}
    onChange={(e) =>
      setApplicant({ ...applicant, portfolio_url: e.target.value })
    }
  />

  <textarea
    placeholder="Cover Letter (optional)"
    value={applicant.cover_letter}
    onChange={(e) =>
      setApplicant({ ...applicant, cover_letter: e.target.value })
    }
  />

  {applicationError && <p className="form-error">{applicationError}</p>}

  {applicationSuccess && (
    <p className="form-success">{applicationSuccess}</p>
  )}

  <button type="submit" disabled={applicationLoading}>
    {applicationLoading ? 'Submitting...' : 'Submit Application'}
  </button>

</form>

      <span className="job-type">
        {selectedJob.employment_type}
      </span>

      <h2>{selectedJob.title}</h2>

      <h3>{selectedJob.company_name}</h3>

      <p>📍 {selectedJob.location}</p>

      <p>Work Mode: {selectedJob.work_mode}</p>

      <h3>About the Role</h3>
      <p>{selectedJob.description}</p>

      <h3>Requirements</h3>
      <p>{selectedJob.requirements}</p>

      <h3>Salary Range</h3>
      <p>
        ₹{selectedJob.salary_min} – ₹{selectedJob.salary_max}
      </p>

      <button
        className="signup-btn"
        onClick={() => setSelectedJob(null)}
      >
        Close
      </button>

    </div>
  </div>
)}

    </div>
  )
}

export default App
