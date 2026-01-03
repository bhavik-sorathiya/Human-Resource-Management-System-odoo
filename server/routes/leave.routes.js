const express = require("express");
const path = require("path");
const fs = require("fs");
const multer = require("multer");
const router = express.Router();
const { readJSON, writeJSON } = require("../utils/fileHandler");
const authenticateJWT = require("../middleware/auth.middleware");
const requireRole = require("../middleware/role.middleware");

const LEAVES_PATH = path.join(__dirname, "../data/leaves.json");
const USERS_PATH = path.join(__dirname, "../data/users.json");
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
router.post("/", authenticateJWT, upload.single("attachment"), (req, res) => {
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

	const leaves = readJSON(LEAVES_PATH);
	const attachmentUrl = req.file ? `/uploads/${req.file.filename}` : undefined;
	const newLeave = {
		id: `L-${Date.now()}`,
		userId: req.user.userId,
		startDate,
		endDate,
		type,
		status: "PENDING",
		reason,
		attachmentUrl,
		createdAt: new Date().toISOString(),
	};

	leaves.push(newLeave);
	writeJSON(LEAVES_PATH, leaves);
	return res.status(201).json(newLeave);
});

// GET /leaves (admin) - list all leave requests with user info
router.get("/", authenticateJWT, requireRole("ADMIN"), (req, res) => {
	const leaves = readJSON(LEAVES_PATH);
	const users = readJSON(USERS_PATH);
	const enriched = leaves.map((leave) => {
		const user = users.find((u) => u.id === leave.userId);
		return {
			...leave,
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
	});
	res.json(enriched);
});

// GET /leaves/mine - employee view
router.get("/mine", authenticateJWT, (req, res) => {
	const leaves = readJSON(LEAVES_PATH).filter((l) => l.userId === req.user.userId);
	res.json(leaves);
});

// POST /leaves/:id/approve
router.post("/:id/approve", authenticateJWT, requireRole("ADMIN"), (req, res) => {
	const leaves = readJSON(LEAVES_PATH);
	const leave = leaves.find((l) => l.id === req.params.id);
	if (!leave) return res.status(404).json({ error: "Leave not found" });
	leave.status = "APPROVED";
	writeJSON(LEAVES_PATH, leaves);
	res.json({ message: "Leave approved", leave });
});

// POST /leaves/:id/reject
router.post("/:id/reject", authenticateJWT, requireRole("ADMIN"), (req, res) => {
	const leaves = readJSON(LEAVES_PATH);
	const leave = leaves.find((l) => l.id === req.params.id);
	if (!leave) return res.status(404).json({ error: "Leave not found" });
	leave.status = "REJECTED";
	writeJSON(LEAVES_PATH, leaves);
	res.json({ message: "Leave rejected", leave });
});

module.exports = router;
