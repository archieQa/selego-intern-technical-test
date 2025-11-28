echo "# 📊 Budget Tracker Project

![React](https://img.shields.io/badge/React-17.0.2-blue?logo=react)
![Node.js](https://img.shields.io/badge/Node.js-16-green?logo=node.js)
![MongoDB](https://img.shields.io/badge/MongoDB-5.0-green?logo=mongodb)
![Material UI](https://img.shields.io/badge/MUI-5.0-blue?logo=mui)
![License](https://img.shields.io/badge/License-MIT-yellow)

---

## 📝 Overview

A full-stack **Budget Tracker** application where users can:

- Create and manage projects with budgets
- Add, edit, and delete expenses
- Invite users to projects via email
- Receive AI feedback on budget usage

Designed with simplicity, clean code, and practical features in mind.

---

## 🛠 Tech Stack

**Frontend:**

- React.js (JSX)
- Material UI (MUI) components
- react-hot-toast for notifications

**Backend:**

- Node.js + Express
- MongoDB (Mongoose)
- RESTful API design

**External Services:**

- Brevo (email invites)
- OpenRouter API (AI feedback)
- Sentry (error tracking)

---

## ✨ Features

- Flat MongoDB schemas for performance:
  - \`Project\`: name, description, budget, users
  - \`Expense\`: title, amount, category, projectId
  - \`Invite\`: email, token, status, projectId
- CRUD operations for Projects and Expenses
- Invite users by email
- Edit/Delete modals for better UX
- AI-generated budget insights
- Snackbar notifications for actions

---

## 🚀 Installation

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


## Enviroment vars

Follow the .env.example


## How to start 

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

## 📡 API Routes

**Projects**

| Method | Route | Description |
|--------|-------|-------------|
| GET    | /project | List all projects |
| POST   | /project | Create a new project |
| PUT    | /project/:id | Update a project |
| DELETE | /project/:id | Delete a project |

**Expenses**

| Method | Route | Description |
|--------|-------|-------------|
| GET    | /expense?projectId=<id> | List expenses for project |
| POST   | /expense | Create expense |
| PUT    | /expense/:id | Update expense |
| DELETE | /expense/:id | Delete expense |

**Invites**

| Method | Route | Description |
|--------|-------|-------------|
| PUT    | /invite/:projectId | Send invite by email |

**Swagger (optional)**

- Access \`/api-docs\` on backend server to test endpoints

---

## 💡 Decisions & Notes

- Flat MongoDB schemas to avoid nested data and improve performance
- Modals for edit/delete instead of \`confirm()\` for better UX
- AI feedback is minimal but practical: shows budget usage & top expense
- Email invites with Brevo and proper error handling

---

## 🔮 Future Improvements

- Pagination for projects and expenses
- Advanced AI analysis and predictions
- Enhanced error handling for all external services

---

## ✅ How to Test

- Create a project → Add expenses → Invite users → Edit/Delete items
- Observe AI feedback & over-budget notifications
- Verify email invites through Brevo
- Test API responses via Swagger or Postman
" > README.md
