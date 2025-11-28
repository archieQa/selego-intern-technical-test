const axios = require("axios");
const Project = require("../models/project");

async function sendBudgetAlert(project, totalSpent, overAmount, percentage) {
  if (!project) return console.error("❌ sendBudgetAlert: Project is not defined");

  const apiKey = process.env.BREVO_KEY;
  if (!apiKey) return console.warn("Email service not configured (missing BREVO_KEY)");

  try {
    // Fetch project with populated users
    const fullProject = await Project.findById(project._id).populate("users", "email name");
    if (!fullProject?.users?.length) return;

    const recipients = fullProject.users.map((u) => ({ email: u.email, name: u.name || u.email }));
    console.log("Recipients for email:", recipients);

    const emailData = {
      sender: { name: "Budget Tracker", email: "luarsarsi@gmail.com" },
      to: recipients,
      subject: `⚠️ Budget Alert: ${project.name} is Over Budget`,
      htmlContent: `
        <h2 style="color: #ef4444;">⚠️ Budget Alert</h2>
        <p>Your project <strong>${project.name}</strong> has exceeded its budget.</p>
        <p><strong>Budget:</strong> $${project.budget.toFixed(2)}</p>
        <p><strong>Total Spent:</strong> $${totalSpent.toFixed(2)}</p>
        <p style="color: #ef4444;"><strong>Over Budget By:</strong> $${overAmount.toFixed(2)}</p>
        <p><strong>Budget Used:</strong> ${percentage}%</p>
        <p>This is an automated alert from your Budget Tracker system.</p>
      `,
    };

    const response = await axios.post("https://api.brevo.com/v3/smtp/email", emailData, {
      headers: {
        accept: "application/json",
        "api-key": apiKey,
        "content-type": "application/json",
      },
    });

    console.log("✅ Budget alert email sent successfully:", response.data);
    return response.data;
  } catch (error) {
    console.error("❌ Failed to send budget alert email:", error.response?.data || error.message);
  }
}

module.exports = { sendBudgetAlert };
