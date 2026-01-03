const express = require("express");
const path = require("path");
const fs = require("fs");
const multer = require("multer");
const router = express.Router();
const authenticateJWT = require("../middleware/auth.middleware");
const requireRole = require("../middleware/role.middleware");
const { pool } = require("../utils/db");

const UPLOADS_DIR = path.join(__dirname, "../uploads");

if (!fs.existsSync(UPLOADS_DIR)) {
	fs.mkdirSync(UPLOADS_DIR, { recursive: true });
}

const storage = multer.diskStorage({
	destination: (_req, _file, cb) => cb(null, UPLOADS_DIR),
	filename: (_req, file, cb) => {
		const ext = path.extname(file.originalname);
		const base = path.basename(file.originalname, ext).replace(/\s+/g, "_");
		cb(null, `${Date.now()}-${base}${ext}`);
	},
});

const upload = multer({ storage });

// POST /leaves - create leave request (employee or admin)
router.post("/", authenticateJWT, upload.single("attachment"), async (req, res) => {
	const { startDate, endDate, type, reason = "" } = req.body || {};
	if (!startDate || !endDate || !type) {
		return res.status(400).json({ error: "startDate, endDate, and type are required" });
	}

	const start = new Date(startDate);
	const end = new Date(endDate);
	if (Number.isNaN(start.getTime()) || Number.isNaN(end.getTime())) {
		return res.status(400).json({ error: "Invalid date format" });
	}
	if (end < start) {
		return res.status(400).json({ error: "endDate cannot be before startDate" });
	}

	const attachmentUrl = req.file ? `/uploads/${req.file.filename}` : undefined;

	try {
		const [result] = await pool.query(
			`INSERT INTO leaves (userId, startDate, endDate, type, status, reason, attachmentUrl) VALUES (?, ?, ?, ?, 'PENDING', ?, ?)`
			, [req.user.userId, startDate, endDate, type, reason, attachmentUrl]
		);
		return res.status(201).json({
			id: result.insertId,
			userId: req.user.userId,
			startDate,
			endDate,
			type,
			status: "PENDING",
			reason,
			attachmentUrl,
			createdAt: new Date().toISOString(),
		});
	} catch (err) {
		return res.status(500).json({ error: "Failed to create leave" });
	}
});

// GET /leaves (admin) - list all leave requests with user info
router.get("/", authenticateJWT, requireRole("ADMIN"), async (_req, res) => {
	try {
		const [rows] = await pool.query(
			`SELECT l.*, u.name, u.email, u.role AS userRole, u.position, u.id AS userId
			 FROM leaves l JOIN users u ON u.id = l.userId
			 ORDER BY l.createdAt DESC`
		);
		const enriched = rows.map((leave) => ({
			...leave,
			startDate: leave.startDate instanceof Date ? leave.startDate.toISOString().slice(0, 10) : leave.startDate,
			endDate: leave.endDate instanceof Date ? leave.endDate.toISOString().slice(0, 10) : leave.endDate,
			createdAt: leave.createdAt instanceof Date ? leave.createdAt.toISOString() : leave.createdAt,
			user: {
				id: leave.userId,
				name: leave.name,
				email: leave.email,
				role: leave.userRole,
				position: leave.position,
			},
		}));
		res.json(enriched);
	} catch (err) {
		res.status(500).json({ error: "Failed to load leaves" });
	}
});

// GET /leaves/mine - employee view
router.get("/mine", authenticateJWT, async (req, res) => {
	try {
		const [rows] = await pool.query(
			"SELECT * FROM leaves WHERE userId = ? ORDER BY createdAt DESC",
			[req.user.userId]
		);
		const normalized = rows.map((leave) => ({
			...leave,
			startDate: leave.startDate instanceof Date ? leave.startDate.toISOString().slice(0, 10) : leave.startDate,
			endDate: leave.endDate instanceof Date ? leave.endDate.toISOString().slice(0, 10) : leave.endDate,
			createdAt: leave.createdAt instanceof Date ? leave.createdAt.toISOString() : leave.createdAt,
		}));
		res.json(normalized);
	} catch (err) {
		res.status(500).json({ error: "Failed to load leaves" });
	}
});

// POST /leaves/:id/approve
router.post("/:id/approve", authenticateJWT, requireRole("ADMIN"), async (req, res) => {
	try {
		const [result] = await pool.query("UPDATE leaves SET status = 'APPROVED' WHERE id = ?", [req.params.id]);
		if (!result.affectedRows) return res.status(404).json({ error: "Leave not found" });
		res.json({ message: "Leave approved" });
	} catch (err) {
		res.status(500).json({ error: "Failed to update leave" });
	}
});

// POST /leaves/:id/reject
router.post("/:id/reject", authenticateJWT, requireRole("ADMIN"), async (req, res) => {
	try {
		const [result] = await pool.query("UPDATE leaves SET status = 'REJECTED' WHERE id = ?", [req.params.id]);
		if (!result.affectedRows) return res.status(404).json({ error: "Leave not found" });
		res.json({ message: "Leave rejected" });
	} catch (err) {
		res.status(500).json({ error: "Failed to update leave" });
	}
});

module.exports = router;
