import { useEffect, useState } from 'react'
import './App.css'
const API_BASE_URL =
  import.meta.env.VITE_API_URL || 'https://techbloom-backend.onrender.com'
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
const [showLogin, setShowLogin] = useState(false)
const [showSignup, setShowSignup] = useState(false)
const [loginEmail, setLoginEmail] = useState('')
const [loginPassword, setLoginPassword] = useState('')
const [loginLoading, setLoginLoading] = useState(false)
const [loginError, setLoginError] = useState('')

const [authToken, setAuthToken] = useState('')
const [loggedInCandidate, setLoggedInCandidate] = useState(null)
const [candidateProfile, setCandidateProfile] = useState(null)
const [showProfileDetails, setShowProfileDetails] = useState(false)
const [signupName, setSignupName] = useState('')
const [signupEmail, setSignupEmail] = useState('')
const [signupPassword, setSignupPassword] = useState('')

const [signupLoading, setSignupLoading] = useState(false)
const [signupError, setSignupError] = useState('')
const [signupSuccess, setSignupSuccess] = useState('')
const [employerToken, setEmployerToken] = useState('')
const [showEmployerLogin, setShowEmployerLogin] = useState(false)

const [employerEmail, setEmployerEmail] = useState('employer@techbloom.com')
const [employerPassword, setEmployerPassword] = useState('')

const [employerLoginError, setEmployerLoginError] = useState('')
const [employerLoginLoading, setEmployerLoginLoading] = useState(false)
useEffect(() => {
  const fetchCandidateProfile = async () => {
    if (!authToken || !loggedInCandidate) return

    try {
      const response = await fetch(
        `${API_BASE_URL}/api/candidates/${loggedInCandidate.candidate_id}`,
        {
          headers: {
            Authorization: `Bearer ${authToken}`
          }
        }
      )

      const result = await response.json()

      if (!response.ok || !result.success) {
        throw new Error(result.message || 'Failed to fetch profile')
      }

      setCandidateProfile(result.data)

    } catch (error) {
      console.error('Profile error:', error.message)
    }
  }

  fetchCandidateProfile()
}, [authToken, loggedInCandidate])
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
          `${API_BASE_URL}/api/jobs?${params.toString()}`
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
      const response = await fetch(`${API_BASE_URL}/api/tags`)

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

  if (!authToken || !loggedInCandidate) {
    setApplicationError('Please log in before applying for a job.')
    return
  }

  try {
    setApplicationLoading(true)
    setApplicationError('')
    setApplicationSuccess('')

    const applicationResponse = await fetch(
  `${API_BASE_URL}/api/applications/jobs/${selectedJob.job_id}/apply`,
  {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'Authorization': `Bearer ${authToken}`
    },
    body: JSON.stringify({
      cover_letter: applicant.cover_letter
    })
  }
)

    const applicationResult = await applicationResponse.json()

    if (!applicationResponse.ok || !applicationResult.success) {
      throw new Error(
        applicationResult.message || 'Application failed'
      )
    }

    setApplicationSuccess(
      'Your application was submitted successfully!'
    )

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

    const jobResponse = await fetch(`${API_BASE_URL}/api/jobs`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${employerToken}`
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
        `${API_BASE_URL}/api/jobs/${createdJobId}/tags`,
        {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${employerToken}`
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
const handleLogin = async (e) => {
  e.preventDefault()

  try {
    setLoginLoading(true)
    setLoginError('')

    const response = await fetch(
      `${API_BASE_URL}/api/candidates/login`,
      {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          email: loginEmail,
          password: loginPassword
        })
      }
    )

    const result = await response.json()

    if (!response.ok || !result.success) {
      throw new Error(result.message || 'Login failed')
    }

    setAuthToken(result.token)
    setLoggedInCandidate(result.candidate)

    setShowLogin(false)
    setLoginEmail('')
    setLoginPassword('')

  } catch (error) {
    setLoginError(error.message)
  } finally {
    setLoginLoading(false)
  }
}

const handleSignup = async (e) => {
  e.preventDefault()

  try {
    setSignupLoading(true)
    setSignupError('')
    setSignupSuccess('')

    const response = await fetch(
      `${API_BASE_URL}/api/candidates/register`,
      {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          full_name: signupName,
          email: signupEmail,
          password: signupPassword
        })
      }
    )

    const result = await response.json()

    if (!response.ok || !result.success) {
      throw new Error(result.message || 'Registration failed')
    }

    setSignupSuccess('Account created successfully! You can now log in.')

    setSignupName('')
    setSignupEmail('')
    setSignupPassword('')

  } catch (error) {
    setSignupError(error.message)
  } finally {
    setSignupLoading(false)
  }
}

const handleEmployerLogin = async (e) => {
  e.preventDefault()

  try {
    setEmployerLoginLoading(true)
    setEmployerLoginError('')

    const response = await fetch(
      `${API_BASE_URL}/api/employer/login`,
      {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          email: employerEmail,
          password: employerPassword
        })
      }
    )

    const result = await response.json()

    if (!response.ok || !result.success) {
      throw new Error(result.message || 'Employer login failed')
    }

    setEmployerToken(result.token)
    setEmployerPassword('')
    setShowEmployerLogin(false)
    setShowJobForm(true)

  } catch (error) {
    setEmployerLoginError(error.message)
  } finally {
    setEmployerLoginLoading(false)
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
  {loggedInCandidate ? (
    <>
      <button
  className="profile-toggle-btn"
  onClick={() => setShowProfileDetails(prev => !prev)}
>
  {loggedInCandidate.full_name}
  <span>⌄</span>
</button>

      <button
        className="login-btn"
        onClick={() => {
          setAuthToken('')
          setLoggedInCandidate(null)
          setCandidateProfile(null)
        }}
      >
        Log Out
      </button>
    </>
  ) : (
    <>
      <button
        className="login-btn"
        onClick={() => setShowLogin(true)}
      >
        Log In
      </button>

      <button
  className="signup-btn"
  onClick={() => setShowSignup(true)}
>
  Sign Up
</button>
    </>
  )}
</div>
      </nav>

      {/* Candidate Profile */}
{showProfileDetails && candidateProfile && (
  <section className="candidate-profile-card">
    <p>My Profile</p>

    <h2>{candidateProfile.full_name}</h2>

    <p>Email: {candidateProfile.email}</p>

    {candidateProfile.phone && (
      <p>Phone: {candidateProfile.phone}</p>
    )}

    {candidateProfile.location && (
      <p>Location: {candidateProfile.location}</p>
    )}

    {candidateProfile.headline && (
      <p>{candidateProfile.headline}</p>
    )}
  </section>
)}

      {/* Login Modal */}
{showLogin && (
  <div className="login-modal-overlay">
    <div className="login-modal">

      <button
        type="button"
        className="login-close-btn"
        onClick={() => {
          setShowLogin(false)
          setLoginError('')
        }}
      >
        ×
      </button>

      <h2>Welcome Back!</h2>
      <p>Log in to your TechBloom account.</p>

      <form onSubmit={handleLogin}>

        <label>Email Address</label>
        <input
          type="email"
          placeholder="Enter your email"
          value={loginEmail}
          onChange={(e) => setLoginEmail(e.target.value)}
          required
        />

        <label>Password</label>
        <input
          type="password"
          placeholder="Enter your password"
          value={loginPassword}
          onChange={(e) => setLoginPassword(e.target.value)}
          required
        />

        {loginError && (
          <p className="login-error">{loginError}</p>
        )}

        <button
          type="submit"
          className="login-submit-btn"
          disabled={loginLoading}
        >
          {loginLoading ? 'Logging in...' : 'Log In'}
        </button>

      </form>
    </div>
  </div>
)}

{/* Signup Modal */}
{showSignup && (
  <div className="login-modal-overlay">
    <div className="login-modal">

      <button
        type="button"
        className="login-close-btn"
        onClick={() => {
          setShowSignup(false)
          setSignupError('')
          setSignupSuccess('')
        }}
      >
        ×
      </button>

      <h2>Create Your Account</h2>
      <p>Join TechBloom and explore new opportunities.</p>

      <form onSubmit={handleSignup}>

        <label>Full Name</label>
        <input
          type="text"
          placeholder="Enter your full name"
          value={signupName}
          onChange={(e) => setSignupName(e.target.value)}
          required
        />

        <label>Email Address</label>
        <input
          type="email"
          placeholder="Enter your email"
          value={signupEmail}
          onChange={(e) => setSignupEmail(e.target.value)}
          required
        />

        <label>Password</label>
        <input
          type="password"
          placeholder="Create a password"
          value={signupPassword}
          onChange={(e) => setSignupPassword(e.target.value)}
          minLength={8}
          required
        />

        {signupError && (
          <p className="login-error">{signupError}</p>
        )}

        {signupSuccess && (
          <p className="signup-success">{signupSuccess}</p>
        )}

        <button
          type="submit"
          className="login-submit-btn"
          disabled={signupLoading}
        >
          {signupLoading ? 'Creating Account...' : 'Sign Up'}
        </button>

      </form>

      <p className="signup-login-text">
        Already have an account?{' '}
        <button
          type="button"
          onClick={() => {
            setShowSignup(false)
            setShowLogin(true)
          }}
        >
          Log In
        </button>
      </p>

    </div>
  </div>
)}

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

        {/* Employer Login Modal */}
{showEmployerLogin && (
  <div className="login-modal-overlay">
    <div className="login-modal">

      <button
        type="button"
        className="login-close-btn"
        onClick={() => {
          setShowEmployerLogin(false)
          setEmployerLoginError('')
          setEmployerPassword('')
        }}
      >
        ×
      </button>

      <h2>Employer Login</h2>
      <p>Log in to manage your job listings.</p>

      <form onSubmit={handleEmployerLogin}>

        <label>Email Address</label>
        <input
          type="email"
          value={employerEmail}
          onChange={(e) => setEmployerEmail(e.target.value)}
          required
        />

        <label>Password</label>
        <input
          type="password"
          placeholder="Enter employer password"
          value={employerPassword}
          onChange={(e) => setEmployerPassword(e.target.value)}
          required
        />

        {employerLoginError && (
          <p className="login-error">
            {employerLoginError}
          </p>
        )}

        <button
          type="submit"
          className="login-submit-btn"
          disabled={employerLoginLoading}
        >
          {employerLoginLoading ? 'Logging in...' : 'Log In'}
        </button>

      </form>
    </div>
  </div>
)}

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

  {candidateProfile && (
  <div className="applicant-profile-summary">

    <h4>Your Application Details</h4>

    <p>
      <strong>Name:</strong> {candidateProfile.full_name}
    </p>

    <p>
      <strong>Email:</strong> {candidateProfile.email}
    </p>

    <p>
      <strong>Resume:</strong>{' '}
      {candidateProfile.resume_url ? (
        <a
          href={candidateProfile.resume_url}
          target="_blank"
          rel="noopener noreferrer"
        >
          View Resume
        </a>
      ) : (
        'Not added to profile'
      )}
    </p>

    <p>
      <strong>Portfolio:</strong>{' '}
      {candidateProfile.portfolio_url ? (
        <a
          href={candidateProfile.portfolio_url}
          target="_blank"
          rel="noopener noreferrer"
        >
          View Portfolio
        </a>
      ) : (
        'Not added to profile'
      )}
    </p>

  </div>
)}

  <textarea
    placeholder="Write your cover letter (optional)"
    value={applicant.cover_letter}
    onChange={(e) =>
      setApplicant({ ...applicant, cover_letter: e.target.value })
    }
  />

  {applicationError && (
    <p className="form-error">{applicationError}</p>
  )}

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
