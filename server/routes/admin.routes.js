const express = require("express");
const bcrypt = require("bcryptjs");
const router = express.Router();
const authenticateJWT = require("../middleware/auth.middleware");
const requireRole = require("../middleware/role.middleware");
const { pool } = require("../utils/db");

// POST /admin/users - create employee (admin only)
router.post("/users", authenticateJWT, requireRole("ADMIN"), async (req, res) => {
	const { name, email, password, position = "Employee" } = req.body || {};
	if (!name || !email || !password) {
		return res.status(400).json({ error: "name, email, and password are required" });
	}

	const [existing] = await pool.query("SELECT id FROM users WHERE email = ?", [email]);
	if (existing.length) {
		return res.status(409).json({ error: "Email already registered" });
	}

	const hashedPassword = await bcrypt.hash(password, 10);
	const [result] = await pool.query(
		`INSERT INTO users (name, email, password, role, position) VALUES (?, ?, ?, 'EMPLOYEE', ?)`,
		[name, email, hashedPassword, position]
	);

	return res.status(201).json({ id: result.insertId, name, email, role: "EMPLOYEE", position });
});

module.exports = router;
