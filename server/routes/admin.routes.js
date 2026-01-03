const express = require("express");
const path = require("path");
const bcrypt = require("bcryptjs");
const router = express.Router();
const authenticateJWT = require("../middleware/auth.middleware");
const requireRole = require("../middleware/role.middleware");
const { readJSON, writeJSON } = require("../utils/fileHandler");

const USERS_PATH = path.join(__dirname, "../data/users.json");

// POST /admin/users - create employee (admin only)
router.post("/users", authenticateJWT, requireRole("ADMIN"), async (req, res) => {
	const { name, email, password, position = "Employee" } = req.body || {};
	if (!name || !email || !password) {
		return res.status(400).json({ error: "name, email, and password are required" });
	}

	const users = readJSON(USERS_PATH);
	if (users.find((u) => u.email === email)) {
		return res.status(409).json({ error: "Email already registered" });
	}

	const hashedPassword = await bcrypt.hash(password, 10);
	const newUser = {
		id: Date.now().toString(),
		name,
		email,
		password: hashedPassword,
		role: "EMPLOYEE",
		position,
	};

	users.push(newUser);
	writeJSON(USERS_PATH, users);

	const { password: _, ...safeUser } = newUser;
	return res.status(201).json(safeUser);
});

module.exports = router;
