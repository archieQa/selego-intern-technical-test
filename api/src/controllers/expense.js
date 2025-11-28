const express = require("express");
const router = express.Router();
const passport = require("passport");
const Expense = require("../models/expense");
const Project = require("../models/project");
const ERROR_CODES = require("../utils/errorCodes");
const { sendBudgetAlert } = require("../services/overBudgetEmail");
const { categorizeExpense } = require("../services/aiService");
const { getCategory, checkOverBudget } = require("../helpers/expenseHelpers");

/**
 * @swagger
 * tags:
 *   name: Expenses
 *   description: Manage project expenses
 */

// GET all expenses
/**
 * @swagger
 * /expense:
 *   get:
 *     summary: Get all expenses, optionally filtered by projectId
 *     tags: [Expenses]
 *     parameters:
 *       - in: query
 *         name: projectId
 *         schema:
 *           type: string
 *         required: false
 *         description: Filter expenses by project ID
 *     responses:
 *       200:
 *         description: List of expenses
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
 *                     $ref: '#/components/schemas/Expense'
 *       500:
 *         description: Server error
 */
router.get("/", passport.authenticate("user", { session: false, failWithError: true }), async (req, res) => {
  try {
    const { projectId } = req.query;
    const filter = projectId ? { projectId } : {};
    const expenses = await Expense.find(filter).sort({ createdAt: -1 });
    return res.status(200).json({ ok: true, data: expenses });
  } catch (error) {
    console.error(error);
    return res.status(500).json({ ok: false, code: ERROR_CODES.SERVER_ERROR });
  }
});

// GET single expense
/**
 * @swagger
 * /expense/{id}:
 *   get:
 *     summary: Get a single expense by ID
 *     tags: [Expenses]
 *     parameters:
 *       - in: path
 *         name: id
 *         schema:
 *           type: string
 *         required: true
 *         description: Expense ID
 *     responses:
 *       200:
 *         description: Expense details
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Expense'
 *       404:
 *         description: Expense not found
 *       500:
 *         description: Server error
 */
router.get("/:id", passport.authenticate("user", { session: false, failWithError: true }), async (req, res) => {
  try {
    const expense = await Expense.findById(req.params.id);
    if (!expense) return res.status(404).json({ ok: false, code: ERROR_CODES.NOT_FOUND });
    return res.status(200).json({ ok: true, data: expense });
  } catch (error) {
    console.error(error);
    return res.status(500).json({ ok: false, code: ERROR_CODES.SERVER_ERROR });
  }
});

// POST create new expense
/**
 * @swagger
 * /expense:
 *   post:
 *     summary: Create a new expense
 *     tags: [Expenses]
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - projectId
 *               - title
 *               - amount
 *             properties:
 *               projectId:
 *                 type: string
 *                 description: ID of the project
 *               title:
 *                 type: string
 *                 description: Expense title
 *               amount:
 *                 type: number
 *                 description: Expense amount
 *     responses:
 *       200:
 *         description: Expense created
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Expense'
 *       400:
 *         description: Invalid input
 *       404:
 *         description: Project not found
 *       500:
 *         description: Server error
 */
router.post("/", passport.authenticate("user", { session: false, failWithError: true }), async (req, res) => {
  try {
    const { projectId, title, amount } = req.body;
    if (!projectId || !title || amount == null || amount < 0)
      return res.status(400).json({ ok: false, code: ERROR_CODES.INVALID_BODY });

    const project = await Project.findById(projectId);
    if (!project) return res.status(404).json({ ok: false, code: ERROR_CODES.NOT_FOUND });

    const category = await getCategory(title);

    const expense = await Expense.create({ projectId, title, amount, category });

    checkOverBudget(projectId); // async, no await

    return res.status(200).json({ ok: true, data: expense });
  } catch (error) {
    console.error(error);
    return res.status(500).json({ ok: false, code: ERROR_CODES.SERVER_ERROR });
  }
});

// PUT update expense
/**
 * @swagger
 * /expense/{id}:
 *   put:
 *     summary: Update an existing expense
 *     tags: [Expenses]
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *         description: Expense ID
 *     requestBody:
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               title:
 *                 type: string
 *               amount:
 *                 type: number
 *               category:
 *                 type: string
 *     responses:
 *       200:
 *         description: Expense updated
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Expense'
 *       400:
 *         description: Invalid input
 *       404:
 *         description: Expense not found
 *       500:
 *         description: Server error
 */
router.put("/:id", passport.authenticate("user", { session: false, failWithError: true }), async (req, res) => {
  try {
    const expense = await Expense.findById(req.params.id);
    if (!expense) return res.status(404).json({ ok: false, code: ERROR_CODES.NOT_FOUND });

    const { title, amount, category } = req.body;
    if (title) expense.title = title;
    if (amount != null) {
      if (amount < 0) return res.status(400).json({ ok: false, code: ERROR_CODES.INVALID_BODY });
      expense.amount = amount;
    }
    if (category) expense.category = category;

    await expense.save();

    checkOverBudget(expense.projectId);

    return res.status(200).json({ ok: true, data: expense });
  } catch (error) {
    console.error(error);
    return res.status(500).json({ ok: false, code: ERROR_CODES.SERVER_ERROR });
  }
});

// DELETE expense
/**
 * @swagger
 * /expense/{id}:
 *   delete:
 *     summary: Delete an expense
 *     tags: [Expenses]
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *         description: Expense ID
 *     responses:
 *       200:
 *         description: Expense deleted
 *       404:
 *         description: Expense not found
 *       500:
 *         description: Server error
 */
router.delete("/:id", passport.authenticate("user", { session: false, failWithError: true }), async (req, res) => {
  try {
    const expense = await Expense.findByIdAndDelete(req.params.id);
    if (!expense) return res.status(404).json({ ok: false, code: ERROR_CODES.NOT_FOUND });
    return res.status(200).json({ ok: true });
  } catch (error) {
    console.error(error);
    return res.status(500).json({ ok: false, code: ERROR_CODES.SERVER_ERROR });
  }
});

/**
 * @swagger
 * components:
 *   schemas:
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
