// helpers/expenseHelpers.js
const Expense = require("../models/expense");
const Project = require("../models/project");
const { sendBudgetAlert } = require("../services/overBudgetEmail");
const { categorizeExpense } = require("../services/aiService");

async function getCategory(title) {
  try {
    const category = await categorizeExpense(title);
    return category || "Other";
  } catch {
    return "Other";
  }
}

async function checkOverBudget(projectId) {
  const project = await Project.findById(projectId);
  if (!project) return;

  const allExpenses = await Expense.find({ projectId });
  const totalSpent = allExpenses.reduce((sum, e) => sum + e.amount, 0);

  if (totalSpent > project.budget) {
    const overAmount = totalSpent - project.budget;
    const percentage = ((totalSpent / project.budget) * 100).toFixed(2);
    sendBudgetAlert(project, totalSpent, overAmount, percentage).catch(console.error);
  }
}

module.exports = { getCategory, checkOverBudget };
