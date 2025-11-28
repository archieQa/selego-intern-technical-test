const Expense = require("../models/expense");
const { generateBudgetFeedback } = require("../services/aiService");
const User = require("../models/user");

async function getProjectWithExpenses(project) {
  const expenses = await Expense.find({ projectId: project._id }).sort({ createdAt: -1 });
  const totalSpent = expenses.reduce((sum, e) => sum + e.amount, 0);
  let budgetFeedback = "";
  try {
    budgetFeedback = await generateBudgetFeedback(project, expenses);
  } catch (err) {
    console.warn("AI feedback failed:", err.message);
  }
  return {
    ...project.toObject(),
    expenses,
    totalSpent,
    overBudget: totalSpent > project.budget,
    budgetFeedback,
  };
}

async function findOrCreateUserByEmail(email) {
  let user = await User.findOne({ email });
  if (!user) user = await User.create({ email, name: email.split("@")[0] });
  return user;
}

async function addUserToProject(project, user) {
  if (project.users.some((u) => u._id.equals(user._id))) return null;
  project.users.push(user._id);
  await project.save();
  await project.populate("users", "name email");
  return project.users;
}

module.exports = {
  getProjectWithExpenses,
  findOrCreateUserByEmail,
  addUserToProject,
};
