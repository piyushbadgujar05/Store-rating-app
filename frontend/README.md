# Store Rating Platform — Frontend Client

Single-page web application built with React and Vite. It interfaces with the Express REST API backend and provides role-based interfaces for Administrators, Store Owners, and Normal Users.

## Architecture & Structure

```
frontend/
├── public/
│   ├── favicon.svg               # Application icon
│   └── icons.svg                 # SVG definitions
├── src/
│   ├── api/
│   │   └── client.js             # API client with token management and unified error handling
│   ├── assets/
│   │   └── hero.png              # UI graphics
│   ├── components/
│   │   ├── ChangePasswordModal.jsx # Password change dialog with validation checks
│   │   ├── CreateStoreModal.jsx    # Store creation and owner assignment dialog
│   │   ├── CreateUserModal.jsx     # User registration dialog for administrators
│   │   ├── Modal.jsx               # Generic accessible modal dialog wrapper
│   │   ├── Navbar.jsx              # Navigation header with role badge and logout action
│   │   ├── RatingModal.jsx         # 1-to-5 star evaluation dialog
│   │   ├── StarRating.jsx          # Reusable star rating selector and viewer
│   │   └── UserDetailsModal.jsx    # User inspector displaying profile and linked stores
│   ├── context/
│   │   ├── AuthContext.jsx         # Global authentication state, JWT storage, and role helper
│   │   └── ToastContext.jsx        # Notification alert dispatch provider
│   ├── pages/
│   │   ├── AdminDashboardPage.jsx  # Admin portal: platform stats, stores table, users table
│   │   ├── LoginPage.jsx           # Unified authentication page with test accounts
│   │   ├── OwnerDashboardPage.jsx  # Owner portal: store summary and customer evaluations
│   │   ├── RegisterPage.jsx        # Public user signup form
│   │   └── StoreListPage.jsx       # Public/user store directory, search, and rating actions
│   ├── App.jsx                   # Root application router and layout manager
│   ├── index.css                 # Styling system, responsive grids, and components
│   └── main.jsx                  # Application entry point
├── index.html                    # Root HTML document
├── package.json                  # Scripts and dependencies
└── vite.config.js                # Build configuration
```

## Running the Frontend

```bash
# Install dependencies
npm install

# Start Vite dev server
npm run dev

# Build production bundle
npm run build
```
