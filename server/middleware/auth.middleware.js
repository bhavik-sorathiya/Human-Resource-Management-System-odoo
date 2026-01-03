const jwt = require('jsonwebtoken');
const JWT_SECRET = process.env.JWT_SECRET || 'devsecret';

function authenticateJWT(req, res, next) {
	const authHeader = req.headers['authorization'];
	if (!authHeader || !authHeader.startsWith('Bearer ')) {
		return res.status(401).json({ error: 'Missing or invalid Authorization header' });
	}
	const token = authHeader.split(' ')[1];
	jwt.verify(token, JWT_SECRET, (err, decoded) => {
		if (err) {
			return res.status(401).json({ error: 'Invalid or expired token' });
		}
		req.user = { userId: decoded.userId, role: decoded.role };
		next();
	});
}

module.exports = authenticateJWT;
