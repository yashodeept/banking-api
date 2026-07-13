const express = require("express");
const { z } = require("zod");
const jwt = require("jsonwebtoken");
const validate = require("../middlewares/validate");
const { protect, JWT_SECRET } = require("../middlewares/auth");

const router = express.Router();

// Define input validation schemas
const registerSchema = {
  body: z.object({
    name: z.string().min(2, "Name must be at least 2 characters"),
    email: z.string().email("Invalid email address"),
    password: z.string().min(6, "Password must be at least 6 characters"),
  }),
};

const loginSchema = {
  body: z.object({
    email: z.string().email("Invalid email address"),
    password: z.string().min(6, "Password must be at least 6 characters"),
  }),
};

/**
 * @openapi
 * /api/v1/auth/register:
 *   post:
 *     summary: Register a new user
 *     tags: [Authentication]
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - name
 *               - email
 *               - password
 *             properties:
 *               name:
 *                 type: string
 *                 example: John Doe
 *               email:
 *                 type: string
 *                 format: email
 *                 example: john@example.com
 *               password:
 *                 type: string
 *                 format: password
 *                 example: securepassword123
 *     responses:
 *       201:
 *         description: User registered successfully.
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 status:
 *                   type: string
 *                   example: success
 *                 token:
 *                   type: string
 *                 data:
 *                   type: object
 *                   properties:
 *                     user:
 *                       type: object
 *                       properties:
 *                         id:
 *                           type: string
 *                         name:
 *                           type: string
 *                         email:
 *                           type: string
 */
router.post("/register", validate(registerSchema), (req, res) => {
  const { name, email } = req.body;
  const userId = "user_" + Math.random().toString(36).substr(2, 9);

  const token = jwt.sign({ id: userId, email, role: "user" }, JWT_SECRET, {
    expiresIn: "1d",
  });

  res.status(201).json({
    status: "success",
    token,
    data: {
      user: { id: userId, name, email },
    },
  });
});

/**
 * @openapi
 * /api/v1/auth/login:
 *   post:
 *     summary: Log in user
 *     tags: [Authentication]
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - email
 *               - password
 *             properties:
 *               email:
 *                 type: string
 *                 format: email
 *                 example: john@example.com
 *               password:
 *                 type: string
 *                 format: password
 *                 example: securepassword123
 *     responses:
 *       200:
 *         description: User logged in successfully.
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 status:
 *                   type: string
 *                   example: success
 *                 token:
 *                   type: string
 */
router.post("/login", validate(loginSchema), (req, res) => {
  const { email } = req.body;
  const userId = "user_mock_12345";

  const token = jwt.sign({ id: userId, email, role: "user" }, JWT_SECRET, {
    expiresIn: "1d",
  });

  res.status(200).json({
    status: "success",
    token,
  });
});

/**
 * @openapi
 * /api/v1/auth/me:
 *   get:
 *     summary: Get logged-in user profile
 *     tags: [Authentication]
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: Current user profile details.
 */
router.get("/me", protect, (req, res) => {
  res.status(200).json({
    status: "success",
    data: {
      user: req.user,
    },
  });
});

module.exports = router;
