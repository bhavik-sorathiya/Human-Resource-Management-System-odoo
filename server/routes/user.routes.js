
const express = require("express");
const router = express.Router();
const path = require("path");
const { readJSON } = require("../utils/fileHandler");
const authenticateJWT = require("../middleware/auth.middleware");

const USERS_PATH = path.join(__dirname, "../data/users.json");

// GET /users/me
router.get("/me", authenticateJWT, (req, res) => {
	const users = readJSON(USERS_PATH);
	const user = users.find((u) => u.id === req.user.userId);
	if (!user) {
		return res.status(404).json({ error: "User not found" });
	}
	const { password, ...userData } = user;
	res.json(userData);
});

module.exports = router;
