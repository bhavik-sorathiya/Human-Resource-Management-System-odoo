const express = require("express");
const router = express.Router();
const bcrypt = require("bcryptjs");
const jwt = require("jsonwebtoken");
const { pool } = require("../utils/db");

const JWT_SECRET = process.env.JWT_SECRET || "devsecret";

// POST /auth/login
router.post("/login", async (req, res) => {
	const { email, password } = req.body;
	if (!email || !password) {
		return res.status(400).json({ error: "Email and password are required" });
	}
	const [rows] = await pool.query("SELECT * FROM users WHERE email = ?", [email]);
	const user = rows[0];
	if (!user) {
		return res.status(401).json({ error: "Invalid credentials" });
	}
	const match = await bcrypt.compare(password, user.password);
	if (!match) {
		return res.status(401).json({ error: "Invalid credentials" });
	}
	const token = jwt.sign({ userId: user.id, role: user.role }, JWT_SECRET, { expiresIn: "1d" });
	res.json({ token });
});

// POST /auth/register
router.post("/register", async (req, res) => {
	const { name, email, password, role = "ADMIN", companyName, phone } = req.body;
	if (!name || !email || !password) {
		return res.status(400).json({ error: "name, email, and password are required" });
	}
	const [existing] = await pool.query("SELECT id FROM users WHERE email = ?", [email]);
	if (existing.length) {
		return res.status(409).json({ error: "Email already registered" });
	}
	const hashedPassword = await bcrypt.hash(password, 10);
	const [result] = await pool.query(
		`INSERT INTO users (name, email, password, role, companyName, phone) VALUES (?, ?, ?, ?, ?, ?)`,
		[name, email, hashedPassword, role.toUpperCase(), companyName || null, phone || null]
	);

	// optionally create company entry
	if (companyName) {
		await pool.query(
			`INSERT IGNORE INTO companies (name, ownerUserId) VALUES (?, ?)`
			, [companyName, result.insertId]
		);
	}

	res.status(201).json({ message: "User registered" });
});

module.exports = router;
