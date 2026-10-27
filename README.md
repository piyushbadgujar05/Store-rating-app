# Store Rating Web Application

A full-stack web application built with React, Node.js/Express, and PostgreSQL. The platform allows customers to discover stores and submit ratings, gives store owners access to rating summaries and customer submissions for their own businesses, and provides administrators with platform-wide management tools.

All three user roles authenticate through a single unified login page, with access control enforced on the backend via JWT and role-checking middleware.

---

## Tech Stack

- **Frontend**: React 19, Vite, custom Vanilla CSS (responsive layout, dark theme, interactive star ratings, modal dialogs).
- **Backend**: Node.js & Express REST API structured into routes, controllers, middleware, and database access utilities.
- **Database**: PostgreSQL 16 (using the `pg` client pool with parameterized queries).
- **Authentication**: JWT (JSON Web Tokens) and `bcryptjs` for password hashing with salt rounds.

---

## User Roles & What They Can Do

### 1. System Administrator
- **Dashboard Overview**: Displays total platform users (broken down by admin, store owner, and normal user), total registered stores, and total submitted ratings.
- **Store Management**: Create new stores and link them to store owners. Search, filter (by name, email, address), and sort store listings with pagination.
- **User Management**: Create users of any role (Admin, Normal User, Store Owner). Filter and sort user listings.
- **User Inspection**: Inspect individual user details. When viewing a store owner, the system displays their associated stores, average ratings, and total rating counts.

### 2. Normal User (Customer)
- **Registration**: Public signup page that collects name, email, address, and password. The backend strictly assigns the `USER` role to public signups.
- **Store Directory**: Search registered stores by name or address (case-insensitive, partial matching).
- **Ratings**: Submit a 1 to 5 star rating for any store, or update a previously submitted rating. Each user can have at most one rating per store. The user's personal rating is displayed separately from the overall store average.
- **Password & Session**: Update password and log out securely.

### 3. Store Owner
- **Dashboard**: View all stores linked to the owner's account along with current average ratings.
- **Customer Evaluations**: View a table of customer ratings submitted for their stores (customer name, email, rating value, and timestamp).
- **Access Control**: Store owners can only view ratings for their own stores. Requests to view another owner's store return a `403 Forbidden` response.
- **Password & Session**: Update password and log out securely.

---

## Validation Rules

Validation is handled on both the React frontend and Express backend:

| Field | Rule |
| :--- | :--- |
| **Name** | 20 to 60 characters (trimmed of leading/trailing whitespace). |
| **Address** | Maximum 400 characters. |
| **Password** | 8 to 16 characters, containing at least one uppercase letter and at least one special character. |
| **Email** | Valid email syntax; enforced unique in the database. |
| **Rating** | Integer between 1 and 5 inclusive. |

---

## Database Design

The database schema is defined in `backend/src/migrations/schema.sql` and consists of three main tables:

1. **`users`**:
   - `id SERIAL PRIMARY KEY`
   - `name VARCHAR(60)` (with CHECK constraint for 20-60 character length)
   - `email VARCHAR(255) UNIQUE`
   - `address VARCHAR(400)`
   - `password_hash VARCHAR(255)`
   - `role VARCHAR(20)` (CHECK: `ADMIN`, `USER`, `STORE_OWNER`)
   - `created_at`, `updated_at`

2. **`stores`**:
   - `id SERIAL PRIMARY KEY`
   - `name VARCHAR(60)` (with CHECK constraint for 20-60 character length)
   - `email VARCHAR(255) UNIQUE`
   - `address VARCHAR(400)`
   - `owner_id INTEGER REFERENCES users(id) ON DELETE SET NULL`
   - `created_at`, `updated_at`

3. **`ratings`**:
   - `id SERIAL PRIMARY KEY`
   - `user_id INTEGER REFERENCES users(id) ON DELETE CASCADE`
   - `store_id INTEGER REFERENCES stores(id) ON DELETE CASCADE`
   - `rating INTEGER` (CHECK: `rating >= 1 AND rating <= 5`)
   - `CONSTRAINT uq_user_store_rating UNIQUE (user_id, store_id)` ensures at most one rating per user per store.

Indexes are created on `users(email)`, `users(role)`, `stores(name)`, `stores(email)`, `stores(owner_id)`, and `ratings(store_id)` for performant lookups, joins, and sorting.

---

## Local Setup & Running the Project

### Prerequisites
- Node.js (v18+)
- PostgreSQL running locally on port `5432` with user `postgres`

### 1. Database Setup
Create the database and run the schema migration:
```bash
# In psql or your preferred database client:
CREATE DATABASE store_rating_db;

# Run the schema script:
psql -U postgres -d store_rating_db -f backend/src/migrations/schema.sql
```

### 2. Backend Setup
```bash
cd backend
npm install

# Seed the database with initial users, stores, and ratings:
npm run seed

# Start the Express server (runs on http://localhost:5000):
npm start
```

### 3. Frontend Setup
In a separate terminal:
```bash
cd frontend
npm install

# Start the development server (runs on http://localhost:5173):
npm run dev
```

---

## Pre-seeded Accounts for Testing

The seed script creates the following accounts matching the validation rules:

| Role | Email | Password | Name |
| :--- | :--- | :--- | :--- |
| **Admin** | `admin@platform.com` | `AdminPassword123!` | System Administrator Primary |
| **Store Owner** | `owner@applecentral.com` | `OwnerPassword123!` | Alexander Jonathan Montgomery |
| **Store Owner 2** | `owner@organicgrocer.com` | `OwnerPassword123!` | Victoria Beatrice Kensington |
| **Normal User 1** | `user1@example.com` | `UserPassword123!` | Christopher Daniel Lawrence |
| **Normal User 2** | `user2@example.com` | `UserPassword123!` | Elizabeth Katherine Davis Jr. |

*(Note: The login page has quick-fill buttons for Admin, Store Owner, and User to speed up testing.)*

---

## Running the Automated Tests

An integration test suite is located in `backend/tests/run_tests.js`. It tests:
- API health and database connectivity
- Input validation boundaries (short names, missing uppercase/special characters, address limits)
- Admin dashboard metrics, sorting, filtering, and user inspection
- Rating submission, upserting, and out-of-bounds rejection
- Store owner data isolation (ensuring foreign store ratings return 403)
- Role authorization protection on protected endpoints

To run the test suite:
```bash
cd backend
node tests/run_tests.js
```

---

## API Summary

- `POST /api/auth/register` — Register a normal user (always assigns role `USER`)
- `POST /api/auth/login` — Sign in and receive JWT token
- `POST /api/auth/logout` — Logout endpoint
- `GET /api/auth/me` — Get current user's profile
- `PUT /api/auth/change-password` — Change password after verifying current password
- `GET /api/admin/dashboard` — Platform statistics (admin only)
- `GET /api/admin/stores` — Filter, sort, and paginate stores (admin only)
- `POST /api/admin/stores` — Create a store and link owner (admin only)
- `GET /api/admin/users` — Filter, sort, and paginate users (admin only)
- `POST /api/admin/users` — Create user with specified role (admin only)
- `GET /api/admin/users/:id` — User details with store ratings for owners (admin only)
- `GET /api/stores` — Public store listing with overall and personal ratings
- `GET /api/stores/:id` — Single store details
- `POST /api/ratings` — Submit a rating (1-5 stars)
- `PUT /api/ratings/:storeId` — Update existing rating
- `GET /api/owner/stores` — Stores owned by authenticated store owner
- `GET /api/owner/stores/:storeId/ratings` — Customer ratings list for owned store
