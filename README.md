# Study Planner

Study Planner is a focused task management app for organizing study goals. The current version uses a lightweight Express server to serve a responsive frontend and browser `localStorage` for persistence.

[![Study Planner CI](https://github.com/abjahid525/StudyPlanner/actions/workflows/ci.yml/badge.svg)](https://github.com/abjahid525/StudyPlanner/actions/workflows/ci.yml)

## Features

- Create, edit, delete, and complete tasks
- Search tasks by title or note
- Filter all, active, and completed tasks
- Assign a due date and priority
- Organize tasks by subject
- Sort by creation date, due date, or priority
- Highlight overdue active tasks
- Confirm destructive deletions
- Progress summary with completion percentage
- Track today's and overdue task counts
- Export and import JSON backups
- Switch between light and dark themes
- Browser-local persistence with `localStorage`
- Express health endpoint and automated smoke test

## Technology

- HTML, CSS, and vanilla JavaScript
- Node.js and Express
- Browser `localStorage`
- GitHub Actions

## Run locally

Requirements: Node.js 18 or newer.

```powershell
npm install
npm start
```

Open [http://localhost:3001](http://localhost:3001).

For development with automatic restarts:

```powershell
npm run dev
```

## Verification

Run the same smoke test used by GitHub Actions:

```powershell
npm test
```

The test starts the server on an isolated local port, verifies that `/api/health` returns the expected application status, and confirms that the frontend loads.

## Data and limitations

Tasks and theme preferences are stored only in the current browser's `localStorage`. JSON export/import provides a manual backup, but data is not synchronized between browsers or devices, and clearing browser data removes it. A future version can add authenticated accounts and a database-backed API.
