const express = require("express");
const router = express.Router();
const bcrypt = require("bcryptjs");
const jwt = require("jsonwebtoken");
const path = require("path");
const { readJSON, writeJSON } = require("../utils/fileHandler");

const JWT_SECRET = process.env.JWT_SECRET || "devsecret";
const USERS_PATH = path.join(__dirname, "../data/users.json");
const COMPANIES_PATH = path.join(__dirname, "../data/companies.json");

// POST /auth/login
router.post("/login", async (req, res) => {
	const { email, password } = req.body;
	if (!email || !password) {
		return res.status(400).json({ error: "Email and password are required" });
	}
	const users = readJSON(USERS_PATH);
	const user = users.find((u) => u.email === email);
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
		role: role.toUpperCase(),
		companyName: companyName || null,
		phone: phone || null,
	};
	users.push(newUser);
	writeJSON(USERS_PATH, users);

	// optionally create company entry
	if (companyName) {
		const companies = readJSON(COMPANIES_PATH);
		const exists = companies.find((c) => c.name.toLowerCase() === companyName.toLowerCase());
		if (!exists) {
			companies.push({
				id: `C-${Date.now()}`,
				name: companyName,
				ownerUserId: newUser.id,
				createdAt: new Date().toISOString(),
			});
			writeJSON(COMPANIES_PATH, companies);
		}
	}

	res.status(201).json({ message: "User registered" });
});

module.exports = router;
