## Project Structure

```text
RoadMatrix
│
├── app/                     # React.js Application
│
├── backend/
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
│
└── docs/
```

## Git Branches

* `main` → Production
* `feature/<module-name>` → Feature Development

Examples:

```text
feature/frontend
feature/auth-service
feature/company-service
feature/fleet-service
feature/driver-service
feature/trip-service
```

## Team Rules

* Don't push directly to `main`.
* Always create a feature branch before starting work.
* Test your code before pushing.
* Keep commit messages meaningful.
* Follow the project structure while developing.
