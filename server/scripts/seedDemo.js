require('dotenv').config();
const bcrypt = require('bcryptjs');
const { pool, initDb } = require('../utils/db');

async function upsertUser(user) {
  const [existing] = await pool.query('SELECT id FROM users WHERE email = ?', [user.email]);
  if (existing.length) return existing[0].id;
  const hashed = await bcrypt.hash(user.password, 10);
  const [result] = await pool.query(
    `INSERT INTO users (name, email, password, role, position, companyName, phone)
     VALUES (?, ?, ?, ?, ?, ?, ?)`,
    [user.name, user.email, hashed, user.role, user.position || null, user.companyName || null, user.phone || null]
  );
  return result.insertId;
}

async function ensureCompany(name, ownerUserId) {
  const [rows] = await pool.query('SELECT id FROM companies WHERE name = ?', [name]);
  if (rows.length) return rows[0].id;
  const [result] = await pool.query(
    `INSERT INTO companies (name, ownerUserId) VALUES (?, ?)`
    , [name, ownerUserId]
  );
  return result.insertId;
}

async function seedAttendance(userIds) {
  const samples = [
    { userId: userIds.admin, date: '2025-12-15', in: '2025-12-15 09:05:00', out: '2025-12-15 17:25:00' },
    { userId: userIds.manager, date: '2025-12-15', in: '2025-12-15 09:12:00', out: '2025-12-15 18:05:00' },
    { userId: userIds.employee, date: '2025-12-15', in: '2025-12-15 10:02:00', out: '2025-12-15 19:10:00' },
    { userId: userIds.employee, date: '2025-12-16', in: '2025-12-16 09:45:00', out: '2025-12-16 17:55:00' },
  ];
  for (const row of samples) {
    await pool.query(
      `INSERT INTO attendance (userId, date, checkInTime, checkOutTime, status)
       VALUES (?, ?, ?, ?, 'PRESENT')
       ON DUPLICATE KEY UPDATE checkInTime = VALUES(checkInTime), checkOutTime = VALUES(checkOutTime), status = VALUES(status)`
      , [row.userId, row.date, row.in, row.out]
    );
  }
}

async function seedLeaves(userIds) {
  const samples = [
    { userId: userIds.employee, startDate: '2025-12-20', endDate: '2025-12-21', type: 'Casual Leave', reason: 'Family event', status: 'APPROVED' },
    { userId: userIds.manager, startDate: '2026-01-05', endDate: '2026-01-06', type: 'Sick Leave', reason: 'Flu recovery', status: 'PENDING' },
  ];
  for (const row of samples) {
    await pool.query(
      `INSERT INTO leaves (userId, startDate, endDate, type, status, reason)
       VALUES (?, ?, ?, ?, ?, ?)`
      , [row.userId, row.startDate, row.endDate, row.type, row.status, row.reason]
    );
  }
}

(async () => {
  try {
    await initDb();

    const admin = await upsertUser({
      name: 'Ava Chen',
      email: 'admin.demo@hrms.test',
      password: 'DemoAdmin@123',
      role: 'ADMIN',
      position: 'HR Admin',
      companyName: 'Acme Corp',
      phone: '555-1010'
    });

    const manager = await upsertUser({
      name: 'Liam Patel',
      email: 'manager.demo@hrms.test',
      password: 'DemoManager@123',
      role: 'HR_MANAGER',
      position: 'HR Manager',
      companyName: 'Acme Corp',
      phone: '555-2020'
    });

    const employee = await upsertUser({
      name: 'Sofia Reyes',
      email: 'employee.demo@hrms.test',
      password: 'DemoEmployee@123',
      role: 'EMPLOYEE',
      position: 'Software Engineer',
      companyName: 'Acme Corp',
      phone: '555-3030'
    });

    await ensureCompany('Acme Corp', admin);

    await seedAttendance({ admin, manager, employee });
    await seedLeaves({ admin, manager, employee });

    console.log('Demo data seeded.');
    process.exit(0);
  } catch (err) {
    console.error('Seeding failed:', err);
    process.exit(1);
  }
})();
