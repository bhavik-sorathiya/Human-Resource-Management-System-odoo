
const express = require("express");
const router = express.Router();
const path = require("path");
const { readJSON, writeJSON } = require("../utils/fileHandler");

const authenticateJWT = require("../middleware/auth.middleware");
const requireRole = require("../middleware/role.middleware");

const ATTENDANCE_PATH = path.join(__dirname, "../data/attendance.json");
const USERS_PATH = path.join(__dirname, "../data/users.json");


// POST /attendance/check-in
router.post("/check-in", authenticateJWT, (req, res) => {
	const userId = req.user.userId;
	const today = new Date().toISOString().slice(0, 10);
	const attendance = readJSON(ATTENDANCE_PATH);
	if (attendance.find(a => a.userId === userId && a.date === today)) {
		return res.status(400).json({ error: "Already checked in today" });
	}
	const entry = {
		id: Date.now().toString(),
		userId,
		date: today,
		checkInTime: new Date().toISOString(),
		checkOutTime: null,
		status: "PRESENT"
	};
	attendance.push(entry);
	writeJSON(ATTENDANCE_PATH, attendance);
	res.status(201).json({ message: "Checked in", entry });
});


// POST /attendance/check-out
router.post("/check-out", authenticateJWT, (req, res) => {
	const userId = req.user.userId;
	const today = new Date().toISOString().slice(0, 10);
	const attendance = readJSON(ATTENDANCE_PATH);
	const entry = attendance.find(a => a.userId === userId && a.date === today);
	if (!entry) {
		return res.status(400).json({ error: "No check-in found for today" });
	}
	if (entry.checkOutTime) {
		return res.status(400).json({ error: "Already checked out today" });
	}
	entry.checkOutTime = new Date().toISOString();
	writeJSON(ATTENDANCE_PATH, attendance);
	res.json({ message: "Checked out", entry });
});


// GET /attendance/me
router.get("/me", authenticateJWT, (req, res) => {
	const userId = req.user.userId;
	const attendance = readJSON(ATTENDANCE_PATH)
		.filter((a) => a.userId === userId)
		.sort((a, b) => b.date.localeCompare(a.date));
	res.json(attendance);
});


// GET /attendance/all (admin/demo view)
router.get("/all", authenticateJWT, requireRole("ADMIN"), (req, res) => {
	const attendance = readJSON(ATTENDANCE_PATH);
	const users = readJSON(USERS_PATH);
	const enriched = attendance
		.map((entry) => {
			const user = users.find((u) => u.id === entry.userId);
			return {
				...entry,
				user: user
					? {
						id: user.id,
						name: user.name,
						email: user.email,
						role: user.role,
						position: user.position,
					}
					: null,
			};
		})
		.sort((a, b) => b.date.localeCompare(a.date));
	res.json(enriched);
});

module.exports = router;
