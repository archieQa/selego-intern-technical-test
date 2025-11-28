const express = require("express");
const router = express.Router();
const passport = require("passport");
const Expense = require("../models/expense");
const Project = require("../models/project");
const User = require("../models/user");
const { generateBudgetFeedback } = require("../services/aiService");
const { getProjectWithExpenses, findOrCreateUserByEmail, addUserToProject } = require("../helpers/projectHelpers");
const ERROR_CODES = require("../utils/errorCodes");
/**
 * @swagger
 * tags:
 *   name: Projects
 *   description: Project management
 */

/**
 * @swagger
 * /project:
 *   get:
 *     summary: Get all projects with their expenses
 *     tags: [Projects]
 *     responses:
 *       200:
 *         description: List of projects with expenses
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 ok:
 *                   type: boolean
 *                 data:
 *                   type: array
 *                   items:
 *                     type: object
 *                     properties:
 *                       _id:
 *                         type: string
 *                       name:
 *                         type: string
 *                       budget:
 *                         type: number
 *                       description:
 *                         type: string
 *                       expenses:
 *                         type: array
 *                         items:
 *                           $ref: '#/components/schemas/Expense'
 *                       totalSpent:
 *                         type: number
 *                       overBudget:
 *                         type: boolean
 */
// GET all projects with expenses
router.get("/", passport.authenticate("user", { session: false, failWithError: true }), async (req, res) => {
  try {
    const projects = await Project.find({}).sort({ createdAt: -1 });
    const projectsWithExpenses = await Promise.all(projects.map(getProjectWithExpenses));
    return res.status(200).json({ ok: true, data: projectsWithExpenses });
  } catch (err) {
    console.error(err);
    return res.status(500).json({ ok: false, code: ERROR_CODES.SERVER_ERROR });
  }
});

// GET single project by ID
/**
 * @swagger
 * /project/{id}:
 *   get:
 *     summary: Get a single project by ID with AI budget feedback
 *     tags: [Projects]
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *         description: Project ID
 *     responses:
 *       200:
 *         description: Project details with budget feedback
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 ok:
 *                   type: boolean
 *                 data:
 *                   type: object
 *                   properties:
 *                     _id:
 *                       type: string
 *                     name:
 *                       type: string
 *                     budget:
 *                       type: number
 *                     description:
 *                       type: string
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
 *                     budgetFeedback:
 *                       type: string
 */
router.get("/:id", passport.authenticate("user", { session: false, failWithError: true }), async (req, res) => {
  try {
    const project = await Project.findById(req.params.id).populate("users", "name email");
    if (!project) return res.status(404).json({ ok: false, code: ERROR_CODES.NOT_FOUND });

    const expenses = await Expense.find({ projectId: project._id }).sort({ createdAt: -1 });
    let budgetFeedback = "";
    try {
      budgetFeedback = await generateBudgetFeedback(project, expenses);
    } catch (err) {
      console.warn("AI feedback failed:", err.message);
    }
    return res.status(200).json({ ok: true, data: { ...project.toObject(), expenses, budgetFeedback } });
  } catch (err) {
    console.error(err);
    return res.status(500).json({ ok: false, code: ERROR_CODES.SERVER_ERROR });
  }
});

/**
 * @swagger
 * /project/{id}:
 *   put:
 *     summary: Update an existing project
 *     tags: [Projects]
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *         description: Project ID
 *     requestBody:
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               name:
 *                 type: string
 *               budget:
 *                 type: number
 *     responses:
 *       200:
 *         description: Project updated successfully
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Project'
 */
router.put("/:id", passport.authenticate("user", { session: false, failWithError: true }), async (req, res) => {
  try {
    const project = await Project.findById(req.params.id);
    if (!project) return res.status(404).json({ ok: false, code: ERROR_CODES.NOT_FOUND });

    const { name, budget } = req.body;
    if (name) project.name = name;
    if (budget != null && budget >= 0) project.budget = budget;

    await project.save();
    return res.status(200).json({ ok: true, data: project });
  } catch (err) {
    console.error(err);
    return res.status(500).json({ ok: false, code: ERROR_CODES.SERVER_ERROR });
  }
});

// POST create new project
/**
 * @swagger
 * /project:
 *   post:
 *     summary: Create a new project
 *     tags: [Projects]
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - name
 *               - budget
 *               - description
 *             properties:
 *               name:
 *                 type: string
 *               budget:
 *                 type: number
 *               description:
 *                 type: string
 *     responses:
 *       200:
 *         description: Project created successfully
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Project'
 */
router.post("/", passport.authenticate("user", { session: false, failWithError: true }), async (req, res) => {
  try {
    const { name, budget, description } = req.body;
    if (!name || budget == null || budget < 0 || !description)
      return res.status(400).json({ ok: false, code: ERROR_CODES.INVALID_BODY });

    const project = await Project.create({ name, budget, description });
    return res.status(200).json({ ok: true, data: project });
  } catch (err) {
    console.error(err);
    return res.status(500).json({ ok: false, code: ERROR_CODES.SERVER_ERROR });
  }
});

// DELETE project
/**
 * @swagger
 * /project/{id}:
 *   delete:
 *     summary: Delete project and its expenses
 *     tags: [Projects]
 *     parameters:
 *       - in: path
 *         name: id
 *         schema:
 *           type: string
 *         required: true
 *     responses:
 *       200:
 *         description: Project deleted
 */
router.delete("/:id", passport.authenticate("user", { session: false, failWithError: true }), async (req, res) => {
  try {
    const project = await Project.findById(req.params.id);
    if (!project) return res.status(404).json({ ok: false, code: ERROR_CODES.NOT_FOUND });

    await Expense.deleteMany({ projectId: project._id });
    await project.deleteOne();

    return res.status(200).json({ ok: true });
  } catch (err) {
    console.error(err);
    return res.status(500).json({ ok: false, code: ERROR_CODES.SERVER_ERROR });
  }
});

//* Routes for User activity inside the Project *//

// PUT /project/:id/add-user-by-email
/**
 * @swagger
 * /project/{id}/add-user-by-email:
 *   put:
 *     summary: Add a user to a project by email
 *     tags: [Projects]
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *         description: Project ID
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - email
 *             properties:
 *               email:
 *                 type: string
 *                 description: Email of the user to add
 *     responses:
 *       200:
 *         description: User added to project
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 ok:
 *                   type: boolean
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
 */

router.put("/:id/add-user-by-email", async (req, res) => {
  try {
    const { email } = req.body;
    if (!email) return res.status(400).json({ ok: false, code: ERROR_CODES.INVALID_BODY });

    const project = await Project.findById(req.params.id).populate("users", "name email");
    if (!project) return res.status(404).json({ ok: false, code: ERROR_CODES.NOT_FOUND });

    const user = await findOrCreateUserByEmail(email);
    const users = await addUserToProject(project, user);

    if (!users) return res.status(400).json({ ok: false, code: ERROR_CODES.ALREADY_EXISTS });

    return res.status(200).json({ ok: true, data: { users } });
  } catch (err) {
    console.error(err);
    return res.status(500).json({ ok: false, code: ERROR_CODES.SERVER_ERROR });
  }
});

/**
 * @swagger
 * components:
 *   schemas:
 *     Project:
 *       type: object
 *       properties:
 *         _id:
 *           type: string
 *         name:
 *           type: string
 *         budget:
 *           type: number
 *         description:
 *           type: string
 *         createdAt:
 *           type: string
 *           format: date-time
 *         updatedAt:
 *           type: string
 *           format: date-time
 *         users:
 *           type: array
 *           items:
 *             type: object
 *             properties:
 *               _id:
 *                 type: string
 *               name:
 *                 type: string
 *               email:
 *                 type: string
 *     Expense:
 *       type: object
 *       properties:
 *         _id:
 *           type: string
 *         projectId:
 *           type: string
 *         title:
 *           type: string
 *         amount:
 *           type: number
 *         category:
 *           type: string
 *         createdAt:
 *           type: string
 *           format: date-time
 *         updatedAt:
 *           type: string
 *           format: date-time
 */

module.exports = router;
