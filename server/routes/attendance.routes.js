
const express = require("express");
const router = express.Router();
const authenticateJWT = require("../middleware/auth.middleware");
const requireRole = require("../middleware/role.middleware");
const { pool } = require("../utils/db");


// POST /attendance/check-in
router.post("/check-in", authenticateJWT, async (req, res) => {
	const userId = req.user.userId;
	const today = new Date().toISOString().slice(0, 10);
	const checkInTime = new Date();
	try {
		const [existing] = await pool.query(
			"SELECT id FROM attendance WHERE userId = ? AND date = ?",
			[userId, today]
		);
		if (existing.length) {
			return res.status(400).json({ error: "Already checked in today" });
		}
		const [result] = await pool.query(
			"INSERT INTO attendance (userId, date, checkInTime, status) VALUES (?, ?, ?, 'PRESENT')",
			[userId, today, checkInTime]
		);
		res.status(201).json({
			message: "Checked in",
			entry: {
				id: result.insertId,
				userId,
				date: today,
				checkInTime: checkInTime.toISOString(),
				checkOutTime: null,
				status: "PRESENT",
			},
		});
	} catch (err) {
		res.status(500).json({ error: "Failed to check in" });
	}
});


// POST /attendance/check-out
router.post("/check-out", authenticateJWT, async (req, res) => {
	const userId = req.user.userId;
	const today = new Date().toISOString().slice(0, 10);
	const checkOutTime = new Date();
	try {
		const [existing] = await pool.query(
			"SELECT * FROM attendance WHERE userId = ? AND date = ?",
			[userId, today]
		);
		const entry = existing[0];
		if (!entry) {
			return res.status(400).json({ error: "No check-in found for today" });
		}
		if (entry.checkOutTime) {
			return res.status(400).json({ error: "Already checked out today" });
		}
		await pool.query(
			"UPDATE attendance SET checkOutTime = ? WHERE id = ?",
			[checkOutTime, entry.id]
		);
		res.json({
			message: "Checked out",
			entry: {
				...entry,
				checkOutTime: checkOutTime.toISOString(),
			},
		});
	} catch (err) {
		res.status(500).json({ error: "Failed to check out" });
	}
});


// GET /attendance/me
router.get("/me", authenticateJWT, async (req, res) => {
	try {
		const [rows] = await pool.query(
			"SELECT * FROM attendance WHERE userId = ? ORDER BY date DESC",
			[req.user.userId]
		);
		const normalized = rows.map((r) => ({
			...r,
			date: r.date instanceof Date ? r.date.toISOString().slice(0, 10) : r.date,
			checkInTime: r.checkInTime instanceof Date ? r.checkInTime.toISOString() : r.checkInTime,
			checkOutTime: r.checkOutTime instanceof Date ? r.checkOutTime.toISOString() : r.checkOutTime,
		}));
		res.json(normalized);
	} catch (err) {
		res.status(500).json({ error: "Failed to load attendance" });
	}
});


// GET /attendance/all (admin/demo view)
router.get("/all", authenticateJWT, requireRole("ADMIN"), async (_req, res) => {
	try {
		const [rows] = await pool.query(
			`SELECT a.*, u.id AS userId, u.name, u.email, u.role AS userRole, u.position
			 FROM attendance a
			 JOIN users u ON u.id = a.userId
			 ORDER BY a.date DESC`
		);
		const enriched = rows.map((r) => ({
			id: r.id,
			userId: r.userId,
			date: r.date instanceof Date ? r.date.toISOString().slice(0, 10) : r.date,
			checkInTime: r.checkInTime instanceof Date ? r.checkInTime.toISOString() : r.checkInTime,
			checkOutTime: r.checkOutTime instanceof Date ? r.checkOutTime.toISOString() : r.checkOutTime,
			status: r.status,
			user: {
				id: r.userId,
				name: r.name,
				email: r.email,
				role: r.userRole,
				position: r.position,
			},
		}));
		res.json(enriched);
	} catch (err) {
		res.status(500).json({ error: "Failed to load attendance" });
	}
});

module.exports = router;
