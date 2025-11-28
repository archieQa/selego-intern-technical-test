# Budget Tracker Project

## Overview

This project is a full-stack budget tracker application where users can:

- Create and manage projects with budgets
- Add, edit, and delete expenses
- Invite users to projects via email
- Receive AI feedback on budget usage

Built with a focus on simplicity, clean code, and practical features.

---

## Tech Stack

**Frontend:**

- React.js (with JSX)
- MUI (Material UI) for components
- react-hot-toast for notifications

**Backend:**

- Node.js + Express
- MongoDB (Mongoose for ODM)
- REST API with consistent routes

**External Services:**

- Brevo for email invites
- OpenRouter API for simple AI feedback
- Sentry for error tracking

---

## Features

- Flat MongoDB schemas:
  - \`Project\`: name, description, budget, users
  - \`Expense\`: title, amount, category, projectId
  - \`Invite\`: email, token, status, projectId
- CRUD operations for Projects and Expenses
- Invite users by email
- Edit/Delete modals for better UX
- AI-generated budget insights
- Snackbar notifications for actions

---

## Installation

1. Clone the repository:
   \`\`\`bash
   git clone <this.repo>
   cd new-technical-test
   \`\`\`

2. Install dependencies:
   \`\`\`bash
   cd api
   npm install
   cd ../app
   npm install
   \`\`\`

3. Create \`.env\` files in both \`api/\` and \`app/\` folders:

\`\`\`bash

# api/.env

ENVIRONMENT=development
APP_URL=http://localhost:3000
PORT=8080
MONGODB_ENDPOINT=mongodb+srv://<username>:<password>@cluster.mongodb.net/<your-db>
S3_ENDPOINT=<dummy-s3-endpoint>
S3_ACCESSKEYID=<dummy-access-key>
S3_SECRETACCESSKEY=<dummy-secret-key>

BREVO_KEY=<your-brevo-key>
OPENROUTER_API_KEY=<your-openrouter-key>
SENTRY_DNS=<your-sentry-dsn>
\`\`\`

4. Start backend:
   \`\`\`bash
   cd api
   npm run dev
   \`\`\`

5. Start frontend:
   \`\`\`bash
   cd ../app
   npm run dev
   \`\`\`

---

## API Routes

**Projects**

- \`GET /project\` – List all projects
- \`POST /project\` – Create a new project
- \`PUT /project/:id\` – Update a project
- \`DELETE /project/:id\` – Delete a project

**Expenses**

- \`GET /expense?projectId=<id>\` – List expenses for project
- \`POST /expense\` – Create expense
- \`PUT /expense/:id\` – Update expense
- \`DELETE /expense/:id\` – Delete expense

**Invites**

- \`PUT /invite/:projectId\` – Send invite to user by email

**Swagger (optional)**

- Navigate to \`/api-docs\` on backend server to test API endpoints

---

## Decisions & Notes

- Flat MongoDB schemas to avoid nested data and improve performance
- Modals for edit/delete instead of default \`confirm()\` for better UX
- AI feedback is minimal but adds value: shows budget usage and top expense
- Email invites handled via Brevo with proper error handling

---

## Future Improvements

- Pagination for expenses and projects
- More advanced AI analysis and predictions
- Improve error handling for all external services

---

## How to Test

- Add a project → add expenses → invite users → edit/delete items
- Observe AI feedback and over-budget notifications
- Check email invites via Brevo
- Verify API responses via Swagger or Postman
  " > README.md
