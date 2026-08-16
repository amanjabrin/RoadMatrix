# RoadMatrix Team GitHub Collaboration Guide

This guide explains how a **3-member development team** can share and push the RoadMatrix codebase to GitHub using feature branches, ensuring that everyone makes **multiple small, incremental, descriptive commits** to establish a realistic development contribution history.

---

## 1. Project Structure

Ensure all team members follow the standard workspace directory structure:

```text
RoadMatrix/
├── app/                     # React.js Frontend Application
├── backend/                 # Spring Boot Microservices
│   ├── api-gateway/
│   ├── service-registry/
│   ├── config-server/
│   ├── auth-service/
│   ├── company-service/
│   ├── fleet-service/
│   ├── driver-service/
│   ├── trip-service/
│   ├── maintenance-service/
│   ├── expense-service/
│   ├── notification-service/
│   └── report-service/
└── docs/                    # Documentation files
```

---

## 2. Git Branching Strategy & Team Rules

### Branching Strategy
- **`main`** &rarr; Production (Stable, never push directly here).
- **`feature/<module-name>`** &rarr; Feature Development branches.
  - Examples: `feature/frontend`, `feature/service-registry`, `feature/fleet-service`, `feature/driver-service`, `feature/trip-service`.

### Team Rules
1. ⚠️ **Do not push directly to the `main` branch.**
2. 🌿 **Always create a feature branch before starting work.**
3. 🧪 **Test your code locally before pushing changes.**
4. 📝 **Keep commit messages meaningful and structured.**
5. 📂 **Maintain the project folder structure at all times.**

---

## 3. Feature & Ownership Division

To divide contributions equally, developers are assigned end-to-end features (backend service + frontend screen):

| Developer | Assigned Scope (Backend + Frontend Pages) | Assigned Feature Branches |
| :--- | :--- | :--- |
| **Developer A** | **Infrastructure & Fleet Feature**<br>- `backend/service-registry`<br>- `backend/config-server`<br>- `backend/api-gateway`<br>- `backend/fleet-service`<br>- `app/...` (Vehicle Registry & Dashboard UI) | `feature/service-registry`<br>`feature/config-server`<br>`feature/api-gateway`<br>`feature/fleet-service`<br>`feature/frontend-fleet` |
| **Developer B** | **Auth, Drivers & Expense Features**<br>- `backend/auth-service`<br>- `backend/driver-service`<br>- `backend/expense-service`<br>- `app/...` (Login, Drivers & Expenses UI) | `feature/auth-service`<br>`feature/driver-service`<br>`feature/expense-service`<br>`feature/frontend-drivers`<br>`feature/frontend-expenses` |
| **Developer C** | **Company, Trips, Maintenance & Reports**<br>- `backend/company-service`<br>- `backend/trip-service`<br>- `backend/maintenance-service`<br>- `backend/notification-service`<br>- `backend/report-service`<br>- `app/...` (Trip Dispatcher, Maintenance & Analytics UI) | `feature/company-service`<br>`feature/trip-service`<br>`feature/maintenance-service`<br>`feature/report-service`<br>`feature/frontend-trips` |

---

## 4. Granular Commit History Plan

### Developer A (Infrastructure & Fleet)
- **Commit A1**: `chore: initialize repository and add base configuration files`
- **Commit A2**: `feat(infra): add Eureka Service Registry and Config Server local setups`
- **Commit A3**: `feat(infra): add API Gateway with service routing and CORS headers`
- **Commit A4**: `feat(fleet): implement fleet-service backend vehicle JPA controllers`
- **Commit A5**: `feat(fleet): add database seeder for fleet-service PostgreSQL database`
- **Commit A6**: `feat(frontend): create base UI layout, navigation, and dashboard shell`
- **Commit A7**: `feat(frontend): integrate Vehicle Registry screen with fleet-service API`

### Developer B (Auth, Drivers & Expenses)
- **Commit B1**: `feat(auth): implement auth-service JWT utility and backend user databases`
- **Commit B2**: `feat(auth-ui): create login screen, forgot password forms, and AuthContext`
- **Commit B3**: `feat(driver): implement driver-service profiles and category tracking`
- **Commit B4**: `feat(driver-ui): create Drivers directory UI and registry interface`
- **Commit B5**: `feat(expense): implement expense-service backend database structure`
- **Commit B6**: `feat(expense): add expense-service fuel logs seeder`
- **Commit B7**: `feat(expense-ui): create Expenses log registry and fuel efficiency dashboard`
- **Commit B8**: `refactor: clean up frontend auth and driver typescript compiler checks`

### Developer C (Company, Trips, Maintenance & Reports)
- **Commit C1**: `feat(company): implement company-service multi-tenant branch profiles`
- **Commit C2**: `feat(trip): implement trip-service dispatcher and LoadBalanced status sync`
- **Commit C3**: `feat(trip-ui): create Trip Dispatcher registry interface and dispatch workflow`
- **Commit C4**: `feat(maintenance): implement maintenance-service service logs scheduler`
- **Commit C5**: `feat(maintenance-ui): create Maintenance scheduler logs and service alerts UI`
- **Commit C6**: `feat(notification): add notification-service alert routing and audit logs`
- **Commit C7**: `feat(report): add report-service analytics aggregation endpoints`
- **Commit C8**: `feat(report-ui): create Analytics dashboard panels and Recharts charts integration`
- **Commit C9**: `refactor: perform project build checks and finalize collaboration guides`

---

## 5. Step-by-Step GitHub Execution Plan

### Step 1: Base Configuration Setup (Developer A)
Developer A initializes the repository locally on the main machine and pushes the base structures directly to `main` to create the project trunk:

1. Initialize git and configure remote repository:
   ```bash
   git init
   git remote add origin https://github.com/your-username/RoadMatrix.git
   ```

2. Add `.gitignore` at the root of the project:
   ```text
   # Node / Frontend
   app/node_modules/
   app/dist/
   
   # Java / Maven Target files
   backend/**/target/
   *.class
   
   # Local Environment credentials
   .env
   .DS_Store
   ```

3. Commit and push the baseline files:
   ```bash
   git add .gitignore pom.xml .env COLLABORATION_GUIDE.md COLLABORATION_GUIDE.html
   git commit -m "chore: initial project configuration and collaboration guide"
   git branch -M main
   git push -u origin main
   ```

---

### Step 2: Push Infrastructure & Fleet Features on Branches (Developer A)
Developer A works on feature branches, pushes them, and merges them to `main`:

```bash
# === DEVELOP INFRASTRUCTURE ===
git checkout -b feature/api-gateway
git add backend/service-registry/ backend/config-server/ backend/api-gateway/
git commit -m "feat(infra): add service-registry, config-server, and api-gateway configurations"
git push origin feature/api-gateway

# Merge feature/api-gateway to main local & push
git checkout main
git merge feature/api-gateway
git push origin main

# === DEVELOP FLEET FEATURES ===
git checkout -b feature/fleet-service
git add backend/fleet-service/
git commit -m "feat(fleet): implement fleet-service backend vehicle JPA controllers and database seeder"
git add app/src/components/ app/src/pages/VehicleRegistry.tsx app/src/pages/Dashboard.tsx app/package.json app/tsconfig.json app/vite.config.ts app/index.html app/postcss.config.js app/tailwind.config.js
git commit -m "feat(frontend): create base UI layout, navigation, and vehicle registry integration"
git push origin feature/fleet-service

# Merge feature/fleet-service to main local & push
git checkout main
git merge feature/fleet-service
git push origin main
```

---

### Step 3: Commit and Push Auth, Drivers & Expenses on Branches (Developer B)
Developer B clones the repo, works on local feature branches, and merges them to `main`:

1. Clone and pull:
   ```bash
   git clone https://github.com/your-username/RoadMatrix.git
   cd RoadMatrix
   ```
2. Copy files for assigned features (`backend/auth-service`, `backend/driver-service`, `backend/expense-service` and frontend counterparts) into the clone.
3. Commit and push on feature branches:
   ```bash
   # === DEVELOP AUTHENTICATION ===
   git checkout -b feature/auth-service
   git add backend/auth-service/ app/src/pages/Login.tsx app/src/pages/ForgotPassword.tsx app/src/pages/ResetPassword.tsx app/src/context/
   git commit -m "feat(auth): implement auth-service JWT token utilities and login screen"
   git push origin feature/auth-service
   
   # Merge to main (always rebase to keep history linear!)
   git checkout main
   git pull origin main --rebase
   git merge feature/auth-service
   git push origin main

   # === DEVELOP DRIVER FEATURES ===
   git checkout -b feature/driver-service
   git add backend/driver-service/ app/src/pages/Drivers.tsx
   git commit -m "feat(driver): implement driver-service profiles and frontend drivers registry"
   git push origin feature/driver-service
   
   git checkout main
   git pull origin main --rebase
   git merge feature/driver-service
   git push origin main

   # === DEVELOP EXPENSE FEATURES ===
   git checkout -b feature/expense-service
   git add backend/expense-service/ app/src/pages/Expenses.tsx app/src/lib/api.ts
   git commit -m "feat(expense): implement expense-service fuel logs database and frontend Expenses screen"
   git push origin feature/expense-service
   
   git checkout main
   git pull origin main --rebase
   git merge feature/expense-service
   git push origin main
   ```

---

### Step 4: Commit and Push Company, Trips, Maintenance & Reports on Branches (Developer C)
Developer C clones the repo, copies feature folders, commits on branches, and pushes:

1. Clone and pull:
   ```bash
   git clone https://github.com/your-username/RoadMatrix.git
   cd RoadMatrix
   ```
2. Copy files for assigned features (`backend/company-service`, `backend/trip-service`, `backend/maintenance-service`, `backend/notification-service`, `backend/report-service` and frontend counterparts).
3. Commit and push on feature branches:
   ```bash
   # === DEVELOP COMPANY & TRIP ===
   git checkout -b feature/trip-service
   git add backend/company-service/ backend/trip-service/ app/src/pages/TripDispatcher.tsx
   git commit -m "feat(trip): implement trip-service dispatcher database and frontend Trip Dispatcher"
   git push origin feature/trip-service
   
   git checkout main
   git pull origin main --rebase
   git merge feature/trip-service
   git push origin main

   # === DEVELOP MAINTENANCE ===
   git checkout -b feature/maintenance-service
   git add backend/maintenance-service/ app/src/pages/Maintenance.tsx
   git commit -m "feat(maintenance): add maintenance-service logs and frontend Maintenance log schedule"
   git push origin feature/maintenance-service
   
   git checkout main
   git pull origin main --rebase
   git merge feature/maintenance-service
   git push origin main

   # === DEVELOP NOTIFICATION, REPORT & ANALYTICS ===
   git checkout -b feature/report-service
   git add backend/notification-service/ backend/report-service/ app/src/pages/Analytics.tsx app/src/pages/Settings.tsx
   git commit -m "feat(analytics): add report-service analytics and frontend Analytics panel"
   git push origin feature/report-service
   
   git checkout main
   git pull origin main --rebase
   git merge feature/report-service
   git push origin main
   ```
