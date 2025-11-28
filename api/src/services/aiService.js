const axios = require("axios");

const OPENROUTER_API_KEY = process.env.OPENROUTER_KEY;

const validCategories = ["Marketing", "Tech", "HR", "Operations", "Other"];

// Categorize expense with AI
async function categorizeExpense(title) {
  if (!OPENROUTER_API_KEY) return "Other";

  try {
    const prompt = `
You are a strict expense classifier. Only respond with one of these categories: ${validCategories.join(", ")}.
Do NOT write anything else, no explanation, no punctuation, only the category name.

Here are guaranteed examples:
- Facebook Ads => Marketing
- Google Ads Campaign => Marketing
- Laptop => Tech
- Software Subscription => Tech
- Recruitment Fee => HR
- Training Course => HR
- Office Rent => Operations
- Electricity Bill => Operations

Now categorize this expense: "${title}"
`;

    const res = await axios.post(
      "https://openrouter.ai/api/v1/chat/completions",
      {
        model: "gpt-4o-mini",
        messages: [{ role: "user", content: prompt }],
        max_tokens: 50, // increased
        temperature: 0, // deterministic
      },
      {
        headers: {
          Authorization: `Bearer ${OPENROUTER_API_KEY}`,
          "Content-Type": "application/json",
        },
      },
    );

    let category = res.data?.choices?.[0]?.message?.content || "";
    category = category.replace(/[^a-zA-Z]/g, "").trim(); // keep letters only
    category = category.charAt(0).toUpperCase() + category.slice(1).toLowerCase();

    if (!validCategories.includes(category)) category = "Other";

    return category;
  } catch (err) {
    console.warn("AI categorization failed, returning 'Other':", err.message);
    return "Other";
  }
}

// Generate a single-sentence AI-style feedback on project budget
async function generateBudgetFeedback(project, expenses) {
  if (!expenses || !expenses.length) return "No expenses recorded yet.";

  const totalSpent = expenses.reduce((sum, e) => sum + e.amount, 0);
  const highest = expenses.reduce((max, e) => (e.amount > max.amount ? e : max), expenses[0]);
  const percentage = ((totalSpent / project.budget) * 100).toFixed(2); // detailed

  return `It seems you are using ${percentage}% of your budget, mostly on "${highest.title}".`;
}

module.exports = { categorizeExpense, generateBudgetFeedback };
