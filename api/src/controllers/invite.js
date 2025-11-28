const express = require("express");
const router = express.Router();

const Project = require("../models/project");
const User = require("../models/user");
const { sendEmail } = require("../services/brevo");

/**
 * @swagger
 * tags:
 *   name: Invite
 *   description: Invite users to projects
 */

/**
 * @swagger
 * /invite/{projectId}:
 *   put:
 *     summary: Invite one or multiple users to a project by email
 *     tags: [Invite]
 *     parameters:
 *       - in: path
 *         name: projectId
 *         required: true
 *         schema:
 *           type: string
 *         description: ID of the project
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             oneOf:
 *               # Single invite
 *               - type: object
 *                 required:
 *                   - name
 *                   - email
 *                 properties:
 *                   name:
 *                     type: string
 *                     example: "John Doe"
 *                   email:
 *                     type: string
 *                     example: "john@example.com"
 *               # Bulk invite
 *               - type: object
 *                 required:
 *                   - users
 *                 properties:
 *                   users:
 *                     type: array
 *                     items:
 *                       type: object
 *                       required:
 *                         - name
 *                         - email
 *                       properties:
 *                         name:
 *                           type: string
 *                           example: "Jane Smith"
 *                         email:
 *                           type: string
 *                           example: "jane@example.com"
 *     responses:
 *       200:
 *         description: Users invited successfully (or resent)
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 ok:
 *                   type: boolean
 *                   example: true
 *                 data:
 *                   type: object
 *                   properties:
 *                     users:
 *                       type: array
 *                       items:
 *                         type: object
 *                         properties:
 *                           _id:
 *                             type: string
 *                           name:
 *                             type: string
 *                           email:
 *                             type: string
 *                     results:
 *                       type: array
 *                       items:
 *                         type: object
 *                         properties:
 *                           email:
 *                             type: string
 *                           status:
 *                             type: string
 *                             enum: [invited, resent, failed]
 *                             description: Status of the invite
 *       400:
 *         description: Invalid request or missing fields
 *       404:
 *         description: Project not found
 *       500:
 *         description: Server error
 */
router.put("/:projectId", async (req, res) => {
  try {
    const { projectId } = req.params;
    const project = await Project.findById(projectId).populate("users", "name email");
    if (!project) return res.status(404).json({ ok: false, error: "Project not found" });

    // normalize input to array
    let invitees = [];
    if (req.body.users?.length) {
      invitees = req.body.users;
    } else if (req.body.email && req.body.name) {
      invitees = [{ email: req.body.email, name: req.body.name }];
    } else {
      return res.status(400).json({ ok: false, error: "Provide a user or an array of users" });
    }

    const results = [];

    for (const { email, name } of invitees) {
      if (!email || !name) {
        results.push({ email, status: "failed", reason: "Missing name or email" });
        continue;
      }

      let user = await User.findOne({ email });
      if (!user) user = await User.create({ name, email });

      const alreadyInProject = project.users.some((u) => u._id.equals(user._id));
      if (!alreadyInProject) {
        project.users.push(user._id);
      }

      // Send invite email (async)
      sendEmail(
        [{ email, name }],
        `You're invited to project "${project.name}"`,
        `<p>Hello ${name},</p>
         <p>You have been invited to join the project <strong>${project.name}</strong>.</p>
         <p><a href="${process.env.APP_URL}/projects/${project._id}">Click here to join</a></p>`,
      ).catch((err) => console.error("Invite email failed:", err));

      results.push({
        email,
        status: alreadyInProject ? "resent" : "invited",
      });
    }

    await project.save();
    await project.populate("users", "name email");

    return res.status(200).json({ ok: true, data: { users: project.users, results } });
  } catch (error) {
    console.error("Invite Error:", error);
    return res.status(500).json({ ok: false, error: "Server error" });
  }
});

module.exports = router;
