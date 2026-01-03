
const express = require("express");
const router = express.Router();
const authenticateJWT = require("../middleware/auth.middleware");
const { pool } = require("../utils/db");

// GET /users/me
router.get("/me", authenticateJWT, (req, res) => {
	pool.query("SELECT id, name, email, role, position, companyName, phone FROM users WHERE id = ?", [req.user.userId])
		.then(([rows]) => {
			const user = rows[0];
			if (!user) return res.status(404).json({ error: "User not found" });
			return res.json(user);
		})
		.catch(() => res.status(500).json({ error: "Failed to fetch user" }));
});

module.exports = router;
