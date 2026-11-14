# TechBloom – Tech Job Board & Candidate Portal

TechBloom is a full-stack job board application that connects employers and candidates. Employers can post job opportunities with technology tags, while candidates can browse jobs, filter listings, and submit applications.

## Features

### Employer
- Post jobs with title, company name, location, employment type, and work mode.
- Add salary range, job description, and requirements.
- Assign technology tags to job listings.

### Candidate
- Browse available job listings.
- Search jobs by keywords.
- Filter jobs by work mode (Remote/Hybrid).
- Filter jobs by technology tags.
- View job details.
- Submit job applications.

## Technology Stack

**Frontend**
- React
- Vite
- CSS

**Backend**
- Node.js
- Express.js
- MySQL
- mysql2
- dotenv
- CORS

## Project Structure

```text
tech-job-board/
├── backend/
│   ├── config/
│   ├── controllers/
│   ├── routes/
│   ├── server.js
│   └── package.json
├── frontend/
│   ├── public/
│   ├── src/
│   └── package.json
├── .gitignore
└── README.md
```

## Installation and Setup

### 1. Clone the repository

```bash
git clone https://github.com/Ayushi2808/techbloom-job-board.git
cd techbloom-job-board
```

### 2. Backend setup

```bash
cd backend
npm install
```

Create a `.env` file inside the backend folder:

```env
PORT=5000
DB_HOST=localhost
DB_USER=root
DB_PASSWORD=your_mysql_password
DB_NAME=techbloom
DB_PORT=3306
```

Replace the database password with your own MySQL password.

Create the `techbloom` database and its required tables before starting the backend.

Start the backend:

```bash
npm run dev
```

Backend URL: `http://localhost:5000`

### 3. Frontend setup

Open another terminal:

```bash
cd frontend
npm install
npm run dev
```

Frontend URL: `http://localhost:5173`

## API Endpoints

### Jobs

| Method | Endpoint | Purpose |
|---|---|---|
| GET | `/api/jobs` | Get and filter jobs |
| GET | `/api/jobs/:id` | Get job details |
| POST | `/api/jobs` | Create a job |
| PUT | `/api/jobs/:id` | Update a job |
| DELETE | `/api/jobs/:id` | Delete a job |

### Tags

| Method | Endpoint | Purpose |
|---|---|---|
| GET | `/api/tags` | Get all technology tags |
| POST | `/api/tags` | Create a tag |
| POST | `/api/jobs/:id/tags` | Assign tags to a job |
| GET | `/api/jobs/:id/tags` | Get tags assigned to a job |

### Candidates

| Method | Endpoint | Purpose |
|---|---|---|
| POST | `/api/candidates/register` | Register a candidate |
| GET | `/api/candidates/:id` | Get candidate details |
| PUT | `/api/candidates/:id` | Update candidate details |

### Applications

| Method | Endpoint | Purpose |
|---|---|---|
| POST | `/api/applications/jobs/:jobId/apply` | Apply for a job |
| GET | `/api/applications/candidate/:candidateId` | Get candidate applications |
| GET | `/api/applications/jobs/:jobId/applicants` | Get applicants for a job |
| PUT | `/api/applications/:applicationId/status` | Update application status |

## Database Model

The application uses a relational MySQL database with five main tables:

- `jobs` – Stores job listings.
- `tags` – Stores technology tags.
- `job_tags` – Connects jobs and tags through a many-to-many relationship.
- `candidates` – Stores candidate information.
- `applications` – Stores candidate job applications.

### Relationships

- One job can have multiple technology tags.
- One technology tag can belong to multiple jobs.
- One candidate can submit multiple applications.
- One job can receive applications from multiple candidates.

## Future Improvements

- Candidate and employer authentication.
- Candidate dashboard.
- Resume upload.
- Saved jobs.
- Application tracking.
- Admin dashboard.

## Repository

[GitHub – TechBloom Job Board](https://github.com/Ayushi2808/techbloom-job-board)