# Store-rating-app

A full-stack web application designed for discovering retail stores and submitting customer ratings. The platform incorporates a single authentication system with role-based access control for System Administrators, Store Owners, and Normal Users.

---

## 1. Project Directory Structure

```
project/
├── backend/
│   ├── src/
│   │   ├── config/
│   │   │   └── db.js                 # PostgreSQL connection pool and query helper
│   │   ├── controllers/
│   │   │   ├── adminController.js    # Store & user management, platform statistics
│   │   │   ├── authController.js     # User registration, authentication, password update
│   │   │   ├── ownerController.js    # Store owner dashboard and customer rating queries
│   │   │   ├── ratingController.js   # Rating submission, updates, and store averages
│   │   │   └── storeController.js    # Public/user store browsing, search, and sorting
│   │   ├── middleware/
│   │   │   ├── authMiddleware.js     # JWT token verification and user attachment
│   │   │   ├── errorMiddleware.js    # Centralized Express error & 404 handlers
│   │   │   └── roleMiddleware.js     # Role-based route authorization checks
│   │   ├── migrations/
│   │   │   └── schema.sql            # PostgreSQL database schema and index definitions
│   │   ├── routes/
│   │   │   ├── adminRoutes.js        # Admin endpoints (/api/admin/*)
│   │   │   ├── authRoutes.js         # Authentication endpoints (/api/auth/*)
│   │   │   ├── ownerRoutes.js        # Store owner endpoints (/api/owner/*)
│   │   │   ├── ratingRoutes.js       # Rating submission endpoints (/api/ratings/*)
│   │   │   └── storeRoutes.js        # Store directory endpoints (/api/stores/*)
│   │   ├── utils/
│   │   │   ├── seedData.js           # Database initialization and sample data
│   │   │   └── validators.js         # Input validation (name, email, password, address)
│   │   └── server.js                 # Express server configuration, middleware, and static serving
│   ├── tests/
│   │   └── run_tests.js              # Integration test suite covering all roles and workflows
│   ├── .env                          # Local environment variables
│   ├── .env.example                  # Environment configuration template
│   └── package.json                  # Backend dependencies and run scripts
│
├── frontend/
│   ├── public/
│   │   ├── favicon.svg               # Application favicon
│   │   └── icons.svg                 # UI icon definitions
│   ├── src/
│   │   ├── api/
│   │   │   └── client.js             # Fetch wrapper with JWT injection and error parsing
│   │   ├── assets/
│   │   │   └── hero.png              # UI illustration asset
│   │   ├── components/
│   │   │   ├── ChangePasswordModal.jsx # Password update modal with live rule validation
│   │   │   ├── CreateStoreModal.jsx    # Modal for creating stores and assigning owners
│   │   │   ├── CreateUserModal.jsx     # Modal for creating accounts with assigned roles
│   │   │   ├── Modal.jsx               # Reusable dialog backdrop and container
│   │   │   ├── Navbar.jsx              # Navigation header with role badge & user actions
│   │   │   ├── RatingModal.jsx         # Interactive star submission & modification modal
│   │   │   ├── StarRating.jsx          # Reusable 1-5 star display and input component
│   │   │   └── UserDetailsModal.jsx    # Detailed user profile inspector with owner stores
│   │   ├── context/
│   │   │   ├── AuthContext.jsx         # Session state, login, logout, and token handling
│   │   │   └── ToastContext.jsx        # Notification dispatch and auto-dismissing alerts
│   │   ├── pages/
│   │   │   ├── AdminDashboardPage.jsx  # Metrics overview, stores table, users table
│   │   │   ├── LoginPage.jsx           # Unified credentials form with quick test logins
│   │   │   ├── OwnerDashboardPage.jsx  # Store overview, average scores, customer rating log
│   │   │   ├── RegisterPage.jsx        # Public customer signup with field validation
│   │   │   └── StoreListPage.jsx       # Store catalog, search, sorting, and user ratings
│   │   ├── App.jsx                   # View routing, navigation bar, and modal management
│   │   ├── index.css                 # Enterprise design system, variables, tables, cards
│   │   └── main.jsx                  # React application entry point
│   ├── index.html                    # Single-page HTML shell
│   ├── package.json                  # Frontend dependencies and build scripts
│   ├── README.md                     # Frontend client documentation
│   └── vite.config.js                # Vite build and development configuration
│
└── README.md                         # Main documentation
```

---

## 2. Architecture & Data Flow

### Authentication & Authorization Flow
1. **Sign-In**: Users log in through `POST /api/auth/login`. The server verifies the password using `bcrypt` and generates a signed JWT containing `userId`, `email`, and `role`.
2. **Client Storage**: The token and user profile are saved in `localStorage`. All outgoing requests via `apiRequest()` automatically attach the `Authorization: Bearer <token>` header.
3. **Route Protection**:
   - `authMiddleware.js`: Decodes and verifies the JWT against the database.
   - `roleMiddleware.js`: Restricts endpoints by role (`ADMIN`, `STORE_OWNER`, `USER`). Non-matching roles receive a `403 Forbidden` response.

### Role Capabilities
- **Administrator (`ADMIN`)**:
  - Full system oversight: total users count, store count, ratings count.
  - Create and manage stores, with the option to link stores to registered store owners.
  - Create and manage user accounts with any role.
  - Search, filter (name, email, address, role), and sort users and stores with pagination.
- **Store Owner (`STORE_OWNER`)**:
  - View performance metrics for stores assigned to them.
  - View individual customer ratings submitted for their stores (customer name, email, rating value, timestamp).
  - Strict data isolation: cannot view ratings or data of stores belonging to other owners.
- **Normal User (`USER`)**:
  - Public registration with client- and server-validated input constraints.
  - Search registered stores by name or address.
  - Sort store catalog by name, overall rating, or address.
  - Submit a 1-5 star rating or modify their existing rating for any store.

---

## 3. Database Schema

### `users` Table
| Column | Type | Constraints | Description |
| :--- | :--- | :--- | :--- |
| `id` | SERIAL | PRIMARY KEY | Unique user identifier |
| `name` | VARCHAR(60) | NOT NULL, CHECK (len 20..60) | Full name of the user |
| `email` | VARCHAR(255) | NOT NULL, UNIQUE | User email address |
| `address` | VARCHAR(400) | NOT NULL, CHECK (len <= 400) | Physical address |
| `password_hash`| VARCHAR(255) | NOT NULL | Bcrypt hashed password |
| `role` | VARCHAR(20) | NOT NULL, CHECK (role IN (...)) | Role: ADMIN, USER, STORE_OWNER |
| `created_at` | TIMESTAMPTZ | NOT NULL, DEFAULT NOW() | Account creation timestamp |
| `updated_at` | TIMESTAMPTZ | NOT NULL, DEFAULT NOW() | Last update timestamp |

### `stores` Table
| Column | Type | Constraints | Description |
| :--- | :--- | :--- | :--- |
| `id` | SERIAL | PRIMARY KEY | Unique store identifier |
| `name` | VARCHAR(60) | NOT NULL, CHECK (len 20..60) | Store business name |
| `email` | VARCHAR(255) | NOT NULL, UNIQUE | Official store email |
| `address` | VARCHAR(400) | NOT NULL, CHECK (len <= 400) | Physical location address |
| `owner_id` | INTEGER | REFERENCES users(id) ON DELETE SET NULL | Assigned store owner |
| `created_at` | TIMESTAMPTZ | NOT NULL, DEFAULT NOW() | Store registration timestamp |
| `updated_at` | TIMESTAMPTZ | NOT NULL, DEFAULT NOW() | Last update timestamp |

### `ratings` Table
| Column | Type | Constraints | Description |
| :--- | :--- | :--- | :--- |
| `id` | SERIAL | PRIMARY KEY | Unique rating record ID |
| `user_id` | INTEGER | REFERENCES users(id) ON DELETE CASCADE | Customer who rated |
| `store_id` | INTEGER | REFERENCES stores(id) ON DELETE CASCADE | Store being evaluated |
| `rating` | INTEGER | NOT NULL, CHECK (rating 1..5) | Rating score (1 to 5) |
| `created_at` | TIMESTAMPTZ | NOT NULL, DEFAULT NOW() | Submission timestamp |
| `updated_at` | TIMESTAMPTZ | NOT NULL, DEFAULT NOW() | Last modified timestamp |
| *Constraint* | UNIQUE (`user_id`, `store_id`) | Ensures 1 rating per user per store |

---

## 4. API Specification

| Method | Endpoint | Access | Description |
| :--- | :--- | :--- | :--- |
| `GET` | `/api/health` | Public | System and database health status |
| `POST` | `/api/auth/register` | Public | Register new customer account |
| `POST` | `/api/auth/login` | Public | Unified login for all roles |
| `POST` | `/api/auth/logout` | Authenticated | Terminate session |
| `GET` | `/api/auth/me` | Authenticated | Retrieve current user profile |
| `PUT` | `/api/auth/change-password` | Authenticated | Update account password |
| `GET` | `/api/stores` | Public / Optional Auth | List stores with overall rating and user's rating |
| `GET` | `/api/stores/:id` | Public / Optional Auth | Get individual store details |
| `POST` | `/api/ratings` | Authenticated (USER) | Submit or update store rating |
| `PUT` | `/api/ratings/:storeId` | Authenticated (USER) | Modify existing rating |
| `GET` | `/api/owner/stores` | STORE_OWNER | Get stores owned by current user |
| `GET` | `/api/owner/stores/:storeId/ratings` | STORE_OWNER | Get customer ratings for owned store |
| `GET` | `/api/admin/dashboard` | ADMIN | Aggregate counts for dashboard |
| `GET` | `/api/admin/stores` | ADMIN | Filter, search, and sort stores |
| `POST` | `/api/admin/stores` | ADMIN | Create new store |
| `GET` | `/api/admin/users` | ADMIN | Filter, search, and sort users |
| `POST` | `/api/admin/users` | ADMIN | Create user of any role |
| `GET` | `/api/admin/users/:id` | ADMIN | Inspect user details & linked stores |

---

## 5. Setup & Running Locally

### Prerequisites
- Node.js (v18+)
- PostgreSQL 16

### 1. Database Setup
```bash
# Initialize schema:
psql -U postgres -d store_rating_db -f backend/src/migrations/schema.sql
```

### 2. Backend Setup
```bash
cd backend
npm install
npm run seed     # Populate initial test data
npm start        # Start Express server on http://localhost:5000
```

### 3. Frontend Setup
```bash
cd frontend
npm install
npm run dev      # Start Vite development server on http://127.0.0.1:5173
```

*(Note: The Express backend also serves the built React application directly at `http://localhost:5000`)*

---

## 6. Testing

Run the automated integration test suite:

```bash
cd backend
npm test
```
