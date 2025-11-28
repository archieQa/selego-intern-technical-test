const fetch = require("node-fetch");
const { BREVO_KEY, ENVIRONMENT } = require("../config");

const SENDER_NAME = "Luars";
const SENDER_EMAIL = "luarsarsi@gmail.com";
const SENDER_NAME_SMS = "Qamo";

// Generic API request to Brevo
const api = async (path, options = {}) => {
  if (!BREVO_KEY) return console.log("❌ BREVO_KEY not configured. Mail not sent.", options);

  try {
    const res = await fetch(`https://api.sendinblue.com/v3${path}`, {
      ...options,
      retries: 3,
      retryDelay: 1000,
      retryOn: [502, 503, 504],
      headers: { "api-key": BREVO_KEY, "Content-Type": "application/json", ...(options.headers || {}) },
    });

    const contentType = res.headers.raw()["content-type"];
    if (contentType?.length && contentType[0].includes("application/json")) return await res.json();

    return true; // for 204 responses
  } catch (err) {
    console.error("❌ Brevo API error:", err);
  }
};

// Send transactional SMS
async function sendSMS(phoneNumber, content, tag) {
  try {
    const formattedPhone = phoneNumber
      .replace(/[^0-9]/g, "")
      .replace(/^0([6,7])/, "33$1")
      .replace(/^330/, "33");

    const body = {
      sender: SENDER_NAME_SMS,
      recipient: formattedPhone,
      content,
      type: "transactional",
      tag,
    };

    const sms = await api("/transactionalSMS/sms", { method: "POST", body: JSON.stringify(body) });
    if (!sms || sms?.code) console.error("❌ Error sending SMS:", { sms, body });

    if (ENVIRONMENT !== "production") console.log("SMS sent (dev mode):", body, sms);
  } catch (err) {
    console.error("❌ sendSMS error:", err);
  }
}

// Send transactional email
async function sendEmail(to, subject, htmlContent, { params, attachment, cc, bcc } = {}) {
  try {
    const body = { to, sender: { name: SENDER_NAME, email: SENDER_EMAIL }, subject, htmlContent };

    if (cc?.length) body.cc = cc;
    if (bcc?.length) body.bcc = bcc;
    if (params) body.params = params;
    if (attachment) body.attachment = attachment;

    const mail = await api("/smtp/email", { method: "POST", body: JSON.stringify(body) });
    if (!mail || mail?.code) console.error("❌ Error sending email:", { mail, body });

    if (ENVIRONMENT !== "production") console.log("Email sent (dev mode):", body, mail);
    return mail;
  } catch (err) {
    console.error("❌ sendEmail error:", err);
  }
}

// Send email using a template
async function sendTemplate(templateId, { params, emailTo, cc, bcc, attachment } = {}, { force } = { force: false }) {
  if (!templateId) return console.error("❌ No template ID provided");

  try {
    const body = { templateId: parseInt(templateId) };

    if (emailTo) body.to = emailTo;
    if (cc?.length) body.cc = cc;
    if (bcc?.length) body.bcc = bcc;
    if (params) body.params = params;
    if (attachment) body.attachment = attachment;

    const mail = await api("/smtp/email", { method: "POST", body: JSON.stringify(body) });
    if (!mail || mail?.code) return console.error("❌ Error sending template:", { mail, body });

    if (ENVIRONMENT !== "production" || force) console.log("Template sent:", body, mail);
    return mail;
  } catch (err) {
    console.error("❌ sendTemplate error:", err);
  }
}

module.exports = { api, sendSMS, sendEmail, sendTemplate };
