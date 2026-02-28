import bcrypt from 'bcryptjs';
import { db } from '../config/database';
import { logger } from '../utils/logger';

async function seed() {
  logger.info('Seeding database...');

  // Departments
  await db.query(`
    INSERT INTO departments (name, description, head_email) VALUES
      ('IT Department', 'Handles internet, computer lab, and network issues', 'it@astu.edu.et'),
      ('Dormitory Office', 'Manages dormitory maintenance and facilities', 'dorm@astu.edu.et'),
      ('Facilities Management', 'Classroom and campus facility repairs', 'facilities@astu.edu.et'),
      ('Academic Affairs', 'Academic and administrative complaints', 'academic@astu.edu.et')
    ON CONFLICT DO NOTHING
  `);

  const deptRows = await db.query<{ id: string; name: string }>(`SELECT id, name FROM departments`);
  const deptMap = Object.fromEntries(deptRows.rows.map((d) => [d.name, d.id]));

  // Categories
  const categoryData = [
    ['Internet Connectivity', 'WiFi or LAN issues', deptMap['IT Department']],
    ['Computer Lab Equipment', 'Lab computer hardware/software problems', deptMap['IT Department']],
    ['Dormitory Maintenance', 'Room repairs, plumbing, electrical', deptMap['Dormitory Office']],
    ['Dormitory Hygiene', 'Cleaning and sanitation issues', deptMap['Dormitory Office']],
    ['Classroom Damage', 'Broken chairs, projectors, boards', deptMap['Facilities Management']],
    ['Library Issues', 'Library resources and facilities', deptMap['Facilities Management']],
    ['Academic Complaint', 'Course, grading, or administrative issue', deptMap['Academic Affairs']],
  ];

  for (const [name, description, departmentId] of categoryData) {
    await db.query(
      `INSERT INTO categories (name, description, department_id) VALUES ($1, $2, $3) ON CONFLICT DO NOTHING`,
      [name, description, departmentId],
    );
  }

  // Admin user
  const adminHash = await bcrypt.hash('Admin@ASTU2026', 12);
  await db.query(`
    INSERT INTO users (full_name, university_id, email, password_hash, role, email_verified)
    VALUES ('System Administrator', 'ADM-001', 'admin@astu.edu.et', $1, 'admin', true)
    ON CONFLICT (email) DO NOTHING
  `, [adminHash]);

  // Staff user
  const staffHash = await bcrypt.hash('Staff@ASTU2026', 12);
  const itDeptId = deptMap['IT Department'];
  await db.query(`
    INSERT INTO users (full_name, university_id, email, password_hash, role, department_id, email_verified)
    VALUES ('IT Staff Member', 'STF-001', 'it.staff@astu.edu.et', $1, 'staff', $2, true)
    ON CONFLICT (email) DO NOTHING
  `, [staffHash, itDeptId]);

  // Student user
  const studentHash = await bcrypt.hash('Student@ASTU2026', 12);
  await db.query(`
    INSERT INTO users (full_name, university_id, email, password_hash, role, email_verified)
    VALUES ('Test Student', 'UGR/12345/15', 'student@astu.edu.et', $1, 'student', true)
    ON CONFLICT (email) DO NOTHING
  `, [studentHash]);

  logger.info('Seed completed. Default credentials:');
  logger.info('  Admin:   admin@astu.edu.et / Admin@ASTU2026');
  logger.info('  Staff:   it.staff@astu.edu.et / Staff@ASTU2026');
  logger.info('  Student: student@astu.edu.et / Student@ASTU2026');
  await db.end();
}

seed().catch((e) => { logger.error(e); process.exit(1); });
