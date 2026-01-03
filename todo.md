# AI TODO – Phase 3: Backend Core Implementation (Dayflow HRMS)

## READ THIS FIRST (MANDATORY)
You are now implementing **Phase 3: Backend Core** of the Dayflow HRMS MVP.

You MUST:
- Follow tasks strictly in order
- Complete one task fully before moving to the next
- Implement only what is specified
- Keep everything MVP-level and simple
- Assume localhost environment
- Use JSON files as temporary database
- Use JWT for authentication

Do NOT:
- Add new features
- Change architecture
- Build frontend
- Optimize or refactor unless required for correctness

---

## GLOBAL TECH CONSTRAINTS

- Backend: Node.js + Express
- Auth: JWT
- Storage: JSON files
- Environment: Localhost only
- No database (MySQL will be added later)

---

## PROJECT STRUCTURE (MANDATORY)

Create and follow this structure:


/server
├── index.js
├── routes/
│ ├── auth.routes.js
│ ├── user.routes.js
│ ├── attendance.routes.js
│ ├── leave.routes.js
│ └── admin.routes.js
├── middleware/
│ ├── auth.middleware.js
│ └── role.middleware.js
├── utils/
│ └── fileHandler.js
└── data/
├── users.json
├── attendance.json
└── leaves.json

---

## TASK ORDER (DO NOT CHANGE)

You MUST complete tasks in this exact order.

---

## TASK 1: Express Server Setup

- Initialize Node.js project
- Install required dependencies:
  - express
  - jsonwebtoken
  - bcrypt
  - cors
- Create Express app
- Enable JSON body parsing
- Enable CORS
- Start server on localhost port
- Add basic global error handler

✅ DONE WHEN:
- Server starts without errors
- Health route returns response

---

## TASK 2: JSON File Handler Utility

- Create reusable utility functions:
  - readJSON(filePath)
  - writeJSON(filePath, data)
- Handle cases:
  - File does not exist
  - Empty file
- Ensure data persistence

✅ DONE WHEN:
- JSON files are safely read and written

---

## TASK 3: User Registration API

- Create route `POST /auth/register`
- Accept:
  - name
  - email
  - password
  - role (EMPLOYEE or ADMIN)
- Hash password using bcrypt
- Prevent duplicate email registration
- Store user in `users.json`
- Generate unique user ID

✅ DONE WHEN:
- User is saved with hashed password
- Duplicate email is rejected

---

## TASK 4: User Login API

- Create route `POST /auth/login`
- Validate credentials
- Compare hashed passwords
- Generate JWT on success
- JWT payload must include:
  - userId
  - role

✅ DONE WHEN:
- JWT token returned on valid login

---

## TASK 5: JWT Authentication Middleware

- Read JWT from Authorization header
- Verify token
- Extract userId and role
- Attach user info to request object
- Reject invalid or missing tokens

✅ DONE WHEN:
- Protected routes work correctly

---

## TASK 6: Role-Based Authorization Middleware

- Create middleware to allow:
  - EMPLOYEE
  - ADMIN
- Restrict admin-only routes
- Prevent employees from accessing admin APIs

✅ DONE WHEN:
- Role enforcement works reliably

---

## TASK 7: Get Logged-In User Profile

- Create route `GET /users/me`
- Use JWT userId
- Return only own user data
- Exclude password hash

✅ DONE WHEN:
- Correct profile returned for logged-in user

---

## TASK 8: Update User Profile

- Create route `PUT /users/me`
- Allow update of limited fields only:
  - name
- Disallow:
  - role changes
  - password changes
- Persist updates in `users.json`

✅ DONE WHEN:
- Profile updates saved correctly

---

## TASK 9: Employee Check-In API

- Create route `POST /attendance/check-in`
- Allow EMPLOYEE role only
- Allow one check-in per day
- Store:
  - userId
  - date
  - check-in time
  - status

✅ DONE WHEN:
- Attendance record created

---

## TASK 10: Employee Check-Out API

- Create route `POST /attendance/check-out`
- Allow EMPLOYEE role only
- Update same-day attendance record
- Store check-out time
- Update attendance status

✅ DONE WHEN:
- Attendance record updated correctly

---

## TASK 11: View Attendance (Employee)

- Create route `GET /attendance/me`
- Return only logged-in employee records

✅ DONE WHEN:
- Employee sees only own attendance

---

## TASK 12: View Attendance (Admin)

- Create route `GET /attendance/all`
- Allow ADMIN role only
- Return all attendance records

✅ DONE WHEN:
- Admin sees all attendance

---

## TASK 13: Apply Leave API

- Create route `POST /leaves/apply`
- Allow EMPLOYEE role only
- Accept:
  - leave type
  - start date
  - end date
  - reason
- Set status to PENDING
- Save in `leaves.json`

✅ DONE WHEN:
- Leave request stored successfully

---

## TASK 14: View Leave Status (Employee)

- Create route `GET /leaves/me`
- Return only logged-in employee leave requests

✅ DONE WHEN:
- Employee sees own leave requests

---

## TASK 15: View Leave Requests (Admin)

- Create route `GET /leaves/all`
- Allow ADMIN role only
- Return all leave requests

✅ DONE WHEN:
- Admin sees all leave requests

---

## TASK 16: Approve / Reject Leave

- Create route `PUT /leaves/:id`
- Allow ADMIN role only
- Update:
  - status (APPROVED / REJECTED)
  - admin comment
- Persist changes

✅ DONE WHEN:
- Leave status updates correctly

---

## TASK 17: Admin Employee List

- Create route `GET /admin/employees`
- Allow ADMIN role only
- Return list of all users
- Exclude password hashes

✅ DONE WHEN:
- Admin can view employee list

---

## VALIDATION RULES (MANDATORY)

After EACH task:
- Server must run without crashing
- Endpoint must be testable via Postman / curl
- JSON files must reflect changes
- No TODO comments allowed

---

## STOP CONDITION

When all tasks are completed:
- STOP execution
- Do NOT build frontend
- Do NOT refactor
- Wait for next instruction


<!-- # AI TODO – Phase 2 Execution Contract (Dayflow HRMS)

## READ THIS FIRST (MANDATORY)
You are implementing a hackathon MVP of **Dayflow – Human Resource Management System**.

You must:
- Follow tasks **in order**
- Implement **only what is written**
- Avoid adding new features
- Keep everything MVP-simple
- Assume JSON files are temporary DB
- Assume localhost only

Do NOT redesign architecture or scope.

---

## GLOBAL CONSTRAINTS (NON-NEGOTIABLE)

- Backend: Node.js + Express
- Authentication: JWT
- Data Storage: JSON files
- Database migration will happen later
- Frontend will be built AFTER backend
- No styling, no optimization, no scalability work

---

## DATA STORAGE RULES

Create a `/data` directory with the following files:
- `users.json`
- `attendance.json`
- `leaves.json`

Each file must behave like a database table:
- Read file → modify data → write file
- Do not keep data only in memory
- Use consistent data structure

---

## TASK ORDER (DO NOT CHANGE)

You MUST complete tasks in this exact order.

---

## TASK 1: Backend Server Setup

- Initialize an Express server
- Enable JSON body parsing
- Add basic error handling middleware
- Server must run on localhost

✅ Output: Server starts without errors

---

## TASK 2: JSON Data Utility Layer

- Create utility functions to:
  - Read JSON files
  - Write JSON files safely
- Handle empty or missing files gracefully

✅ Output: Reusable file read/write helpers

---

## TASK 3: User Registration API

- Create `POST /auth/register`
- Accept: name, email, password, role
- Hash password before saving
- Store user in `users.json`
- Prevent duplicate email registration

✅ Output: User stored in JSON with hashed password

---

## TASK 4: User Login API

- Create `POST /auth/login`
- Validate email & password
- Generate JWT on success
- Include user ID and role in JWT payload

✅ Output: JWT token returned on valid login

---

## TASK 5: JWT Authentication Middleware

- Verify JWT from Authorization header
- Extract user ID and role
- Attach user info to request object
- Reject invalid or missing tokens

✅ Output: Protected routes work correctly

---

## TASK 6: Role-Based Access Middleware

- Allow access based on role:
  - EMPLOYEE
  - ADMIN
- Prevent employees from accessing admin routes

✅ Output: Role enforcement works

---

## TASK 7: Fetch Logged-In User Profile

- Create `GET /users/me`
- Use JWT data to identify user
- Return only own profile data

✅ Output: Correct user profile returned

---

## TASK 8: Update User Profile

- Create `PUT /users/me`
- Allow update of limited fields only
- Prevent role or password changes

✅ Output: Profile updates saved in JSON

---

## TASK 9: Employee Check-In API

- Create `POST /attendance/check-in`
- Allow only employees
- Prevent multiple check-ins on same day
- Store date and check-in time

✅ Output: Attendance entry created

---

## TASK 10: Employee Check-Out API

- Create `POST /attendance/check-out`
- Allow only employees
- Update existing attendance record
- Store check-out time and status

✅ Output: Attendance updated correctly

---

## TASK 11: View Attendance (Employee)

- Create `GET /attendance/me`
- Return only logged-in employee records

✅ Output: Employee sees own attendance

---

## TASK 12: View Attendance (Admin)

- Create `GET /attendance/all`
- Allow admin access only
- Return all attendance records

✅ Output: Admin sees all attendance

---

## TASK 13: Apply Leave API

- Create `POST /leaves/apply`
- Allow only employees
- Accept leave type, date range, reason
- Set status as PENDING

✅ Output: Leave request stored

---

## TASK 14: View Leave Status (Employee)

- Create `GET /leaves/me`
- Return employee’s own leave requests

✅ Output: Employee sees leave status

---

## TASK 15: View Leave Requests (Admin)

- Create `GET /leaves/all`
- Allow admin access only
- Return all leave requests

✅ Output: Admin sees all leave requests

---

## TASK 16: Approve / Reject Leave

- Create `PUT /leaves/:id`
- Allow admin only
- Update leave status and comment

✅ Output: Leave status updated

---

## TASK 17: Admin Employee List

- Create `GET /admin/employees`
- Allow admin only
- Return list of all users

✅ Output: Admin sees employee list

---

## VALIDATION RULES

For each task:
- Code must run on localhost
- No TODO comments allowed
- Errors must be handled minimally
- JSON file must reflect changes

If any rule fails, fix before moving on.

---

## STOP CONDITION

When all tasks are completed:
- Do NOT start frontend
- Do NOT refactor
- Do NOT optimize
- Wait for next instruction -->
