TechBloom – Tech Job Board & Candidate Portal
TechBloom is a full-stack job board application that connects employers with candidates. Employers can publish job openings and assign technology tags. Candidates can browse and filter listings, create an account, and submit applications. The application uses a React frontend, an Express REST API, and a MySQL relational database.
Project status: Core candidate and employer authentication, job management, application submission, applicant access controls, and database relationships have been implemented and tested locally. Add the final walkthrough screenshots and deployment URL after those deliverables are ready.

Features
Candidates
- Register with an email address and password.
- Log in and receive a JWT authentication token.
- Browse job listings and view job details.
- Search and filter listings by supported job fields, work mode, and technology tags.
- View and update their own candidate profile.
- Submit an application using their authenticated account.
- View their own application history.
Employers
- Log in using the employer credentials configured in the backend environment.
- Create, update, and delete job listings.
- Assign technology tags to job listings.
- View applicants for a job.
- Update application statuses.
Platform
- Store job listings, candidates, technology tags, and applications in MySQL.
- Model job/tag and candidate/application relationships with foreign keys.
- Prevent duplicate applications for the same candidate and job.
- Protect candidate and employer endpoints with role-specific JWT authentication.
Technology Stack
Layer	Technologies
Frontend	React, Vite, CSS, JavaScript
Backend	Node.js, Express.js
Database	MySQL
Database driver	mysql2
Authentication	JSON Web Tokens (jsonwebtoken), bcrypt password hashing
Configuration and middleware	dotenv, CORS, Express JSON middleware


Project Structure
tech-job-board/
├── backend/
│   ├── config/
│   │   └── db.js
│   ├── controllers/
│   ├── middleware/
│   │   └── authMiddleware.js
│   ├── routes/
│   ├── .env                  # local secrets; do not commit
│   ├── server.js
│   └── package.json
├── frontend/
│   ├── public/
│   ├── src/
│   │   ├── App.jsx
│   │   └── App.css
│   └── package.json
├── .gitignore
└── README.md
Prerequisites
Install the following before running the project:
- Node.js and npm.
- MySQL Server and a MySQL client such as MySQL Workbench.
- Git (to clone the repository).
Installation and Local Setup
1. Clone the repository
git clone https://github.com/Ayushi2808/techbloom-job-board.git
cd techbloom-job-board
2. Create the database
Create the database in MySQL:
CREATE DATABASE techbloom;
Create/import the project tables in the techbloom database before starting the backend. The application uses these five tables:
- jobs
- tags
- job_tags
- candidates
- applications
The local development database used for this project was created in MySQL Workbench. For a reproducible setup on another machine, include and import a schema export (for example, backend/database/techbloom_schema.sql) containing the table definitions, indexes, and foreign keys. Do not assume that creating the database alone creates its tables.
3. Configure the backend
Open a terminal in the project root and run:
cd backend
npm install
Create a file named .env inside backend/ with your own local values:
PORT=5000

DB_HOST=localhost
DB_USER=root
DB_PASSWORD=your_mysql_password
DB_NAME=techbloom
DB_PORT=3306

JWT_SECRET=replace_with_a_long_random_secret

EMPLOYER_EMAIL=employer@techbloom.com
EMPLOYER_PASSWORD_HASH=replace_with_a_bcrypt_hash
Generate a random JWT secret from the backend terminal:
node -p "require('crypto').randomBytes(32).toString('hex')"
Generate the employer password hash with bcrypt. For example, open the Node.js REPL from the backend folder:
node
Then run:
const bcrypt = require('bcrypt')
await bcrypt.hash('choose-a-strong-employer-password', 10)
Copy the generated hash into EMPLOYER_PASSWORD_HASH in .env, then exit the REPL with .exit. Choose your own password; do not use the example password above.

Security: Never commit .env, plaintext passwords, JWT secrets, or password hashes to GitHub. Keep .env in .gitignore.
4. Start the backend
From the backend/ directory:
npm run dev
The backend runs at:
http://localhost:5000
The root route (GET /) returns a simple backend-running message.
5. Start the frontend
Open a second terminal at the project root:
cd frontend
npm install
npm run dev
The Vite development server is available at:
http://localhost:5173
Keep both terminal processes running while using the local application.
Database Model
TechBloom uses five relational tables.
Table	Purpose
jobs	Stores job listings, including title, company, location, work mode, employment type, salary range, description, and requirements.
tags	Stores technology skills/tags such as React, JavaScript, Node.js, and MySQL.
job_tags	Junction table that associates jobs with technology tags.
candidates	Stores candidate account and profile information. Passwords are stored as bcrypt hashes.
applications	Stores applications submitted by candidates for jobs, including cover letter, status, and applied date.


Relationships and foreign keys
Child table and column	References	Relationship
applications.candidate_id	candidates.candidate_id	One candidate can submit multiple applications.
applications.job_id	jobs.job_id	One job can receive multiple applications.
job_tags.job_id	jobs.job_id	A job can have multiple technology tags.
job_tags.tag_id	tags.tag_id	A technology tag can be associated with multiple jobs.


The job_tags junction table implements the many-to-many relationship between jobs and tags. The application-to-candidate and application-to-job foreign keys associate each application with its candidate and job.
API Reference
All endpoints are relative to http://localhost:5000. Protected routes require a JWT in the request header:
Authorization: Bearer <JWT_TOKEN>
Authentication
Method	Endpoint	Access	Purpose
POST	/api/candidates/register	Public	Register a candidate.
POST	/api/candidates/login	Public	Authenticate a candidate and return a candidate JWT.
POST	/api/employer/login	Public	Authenticate the configured employer and return an employer JWT.


Candidate registration accepts full_name, email, and password as required fields. Optional profile fields include phone, location, headline, bio, resume_url, and portfolio_url.

Login requests accept email and password.
Jobs
Method	Endpoint	Access	Purpose
GET	/api/jobs	Public	List jobs; the jobs controller handles supported search and filter inputs.
GET	/api/jobs/:id	Public	Get job details.
POST	/api/jobs	Employer	Create a job listing.
PUT	/api/jobs/:id	Employer	Update a job listing.
DELETE	/api/jobs/:id	Employer	Delete a job listing.
GET	/api/jobs/:id/tags	Public	Get tags assigned to a job.
POST	/api/jobs/:id/tags	Employer	Assign technology tags to a job.


The job creation form sends fields including title, company_name, location, employment_type, work_mode, salary_min, salary_max, description, and requirements.

The tag assignment endpoint accepts a tag_ids array.
Technology Tags
Method	Endpoint	Access	Purpose
GET	/api/tags	Public	List technology tags for browsing and filtering.
POST	/api/tags	Employer	Create a technology tag.


Candidates and Profiles
Method	Endpoint	Access	Purpose
GET	/api/candidates/:id	Candidate (own profile)	Get the authenticated candidate's profile.
PUT	/api/candidates/:id	Candidate (own profile)	Update the authenticated candidate's profile.


The candidate ID in the URL must match the candidate ID in the verified JWT.
Applications
Method	Endpoint	Access	Purpose
POST	/api/applications/jobs/:jobId/apply	Candidate	Submit an application for a job. The candidate ID is taken from the verified JWT, not from the request body.
GET	/api/applications/candidate/:candidateId	Candidate (own applications)	Get the authenticated candidate's application history.
GET	/api/applications/jobs/:jobId/applicants	Employer	Get applicants for a job.
PUT	/api/applications/:applicationId/status	Employer	Update an application's status.


The application submission request accepts a cover_letter field. Candidate identity is derived from the candidate JWT. The application-history endpoint checks that the requested candidate ID matches the authenticated candidate.
Authentication and Authorization
- Candidate passwords are hashed with bcrypt before being stored.
- Candidate and employer login endpoints issue JWTs signed with JWT_SECRET.
- Candidate-protected endpoints require a candidate token and restrict profile/application-history access to that candidate.
- Employer-protected endpoints require an employer token for job management, tag creation/assignment, applicant viewing, and application-status updates.
- The current employer account is configured through EMPLOYER_EMAIL and EMPLOYER_PASSWORD_HASH in the backend environment.
Local Testing Checklist
Use Postman or the frontend to verify the following flows:
- [ ] Register a candidate and log in.
- [ ] Verify that the candidate receives a JWT.
- [ ] Browse jobs and filter listings.
- [ ] Apply for a job while authenticated.
- [ ] Confirm that duplicate applications are rejected.
- [ ] Confirm that a candidate can view only their own profile and application history.
- [ ] Log in as the configured employer.
- [ ] Create a job and assign technology tags.
- [ ] Confirm that a candidate token cannot access employer-only routes.
- [ ] View applicants and update application status using an employer token.
- [ ] Restart the backend and confirm that job/application records remain in MySQL.
- [ ] Test the frontend at desktop and mobile viewport widths.
Screenshots and Walkthrough
Add screenshots to a screenshots/ directory and link them here before submission. Suggested screenshots:
1. TechBloom home page and job directory.
2. Search and filter results.
3. Candidate registration and login.
4. Candidate profile and application modal.
5. Employer login and job posting form.
6. Employer applicant list and application status.
For a local walkthrough, include the backend and frontend start commands from the setup section above. Add the live deployment URL here after deployment:
Live demo: To be added after deployment.
Repository
GitHub – TechBloom Job Board
Notes Before Public Deployment
- Configure CORS to allow only the deployed frontend origin.
- Remove or restrict the development database test endpoint.
- Configure production database credentials and JWT secrets through the hosting provider's environment settings.
- Replace local API URLs in the frontend with a configurable production API base URL.
- Use HTTPS for the deployed frontend and API.
- Never expose employer credentials, password hashes, or JWT secrets in frontend code or public repositories.