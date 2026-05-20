# Go-Epic Backend 

This is a backend API project for managing coding problems, topics, solutions, and datasets.

The project will be built step-by-step in phases, starting from basic CRUD operations and later adding route parameters, query parameters, pagination, sorting, search, authentication, JWT, middleware, validation, rate limiting, statistics, and advanced routes.

Assignment reference includes CRUD, query params, auth, JWT, middleware, validation, rate limiting, stats, and advanced routes. :contentReference[oaicite:0]{index=0}

---

## Tech Stack

- Node.js
- Express.js
- JavaScript
- JSON
- Postman for API testing

---

## Project Folder Structure

```bash
go-epic-backend/
│
├── server.js
├── package.json
├── package-lock.json
├── .gitignore
├── README.md
│
├── src/
│   ├── config/
│   │   └── db.js
│   │
│   ├── data/
│   │   ├── problems.data.js
│   │   ├── topics.data.js
│   │   ├── solutions.data.js
│   │   └── datasets.data.js
│   │
│   ├── routes/
│   │   ├── problem.routes.js
│   │   ├── topic.routes.js
│   │   ├── solution.routes.js
│   │   ├── dataset.routes.js
│   │   ├── auth.routes.js
│   │   ├── jwt.routes.js
│   │   ├── admin.routes.js
│   │   ├── search.routes.js
│   │   └── stats.routes.js
│   │
│   ├── controllers/
│   │   ├── problem.controller.js
│   │   ├── topic.controller.js
│   │   ├── solution.controller.js
│   │   ├── dataset.controller.js
│   │   ├── auth.controller.js
│   │   ├── jwt.controller.js
│   │   ├── search.controller.js
│   │   └── stats.controller.js
│   │
│   ├── middleware/
│   │   ├── auth.middleware.js
│   │   ├── admin.middleware.js
│   │   ├── error.middleware.js
│   │   ├── validation.middleware.js
│   │   └── rateLimit.middleware.js
│   │
│   ├── utils/
│   │   ├── apiResponse.js
│   │   └── helpers.js
│   │
│   └── app.js

Phase-Wise Development Plan
Phase 1: Basic Server Setup
Create Express server
Create home route
Understand request and response
Phase 2: Basic CRUD Routes

Entities:

Problems
Topics
Solutions
Datasets

CRUD operations:

GET all
GET single
POST create
PUT replace
PATCH update
DELETE remove
Phase 3: Route Parameters

Examples:

GET /problems/:problemId
GET /topics/:topicName
GET /solutions/:solutionId
GET /datasets/:datasetId
Phase 4: Query Parameters

Examples:

GET /problems?difficulty=advanced
GET /problems?topic=concurrency
GET /problems?source=ultimate
GET /problems?keyword=worker
Phase 5: Pagination and Sorting

Examples:

GET /problems?page=1&limit=10
GET /problems?sort=topic
GET /solutions?sort=-difficulty
Phase 6: Search Routes

Examples:

GET /search/problems?q=worker
GET /search/topics?q=concurrency
GET /search/solutions?q=mutex
GET /search/datasets?q=advanced
Phase 7: Authentication

Routes:

POST /auth/register
POST /auth/login
POST /auth/logout
GET /auth/profile
PATCH /auth/profile
Phase 8: JWT Authentication

Routes:

GET /jwt/profile
GET /jwt/dashboard
POST /jwt/generate-token
POST /jwt/verify-token
POST /jwt/refresh-token
Phase 9: Middleware

Middleware will be used for:

Authentication
Admin protection
Error handling
Request validation
Rate limiting
Phase 10: Statistics and Advanced Routes

Examples:

GET /stats/problems
GET /stats/topics
GET /problems/random
GET /topics/popular
GET /health
GET /version

Installation
git clone <your-repo-url>
cd go-epic-backend
npm install
Run Project
node server.js

Server will run on:

http://localhost:5000
Basic Test Route
GET /

Response:

{
  "message": "Go-Epic Backend API is running"
}
Main API Resources
Problems
GET /problems
GET /problems/:problemId
POST /problems
PUT /problems/:problemId
PATCH /problems/:problemId
DELETE /problems/:problemId
Topics
GET /topics
GET /topics/:topicName
POST /topics
PUT /topics/:topicName
PATCH /topics/:topicName
DELETE /topics/:topicName
Solutions
GET /solutions
GET /solutions/:solutionId
POST /solutions
PUT /solutions/:solutionId
PATCH /solutions/:solutionId
DELETE /solutions/:solutionId
Datasets
GET /datasets
GET /datasets/:datasetId
POST /datasets
PUT /datasets/:datasetId
PATCH /datasets/:datasetId
DELETE /datasets/:datasetId
Learning Goal

The goal of this project is not only to complete the assignment, but to properly understand backend development from the basics.

By the end of this project, we will understand:

What is a backend
What is an API
What are routes
What are controllers
What is middleware
What is CRUD
What are route parameters
What are query parameters
What is authentication
What is JWT
What is validation
What is rate limiting
How to structure backend projects properly



Author: Aryan Sabasana