# SFDC Log Observable - Frontend

A real-time monitoring dashboard for Salesforce logs and system events. This frontend application provides a user-friendly interface to visualize and manage log tracking across your Salesforce environment.

## Layout
![App Logo](./src/assets/hero.png)

### Dashboard Screenshots
![Apex Logs Database](./src/assets/Screenshot%202026-05-24%20at%2009.47.58.png)
![Active Apex Classes](./src/assets/Screenshot%202026-05-24%20at%2009.48.27.png)
![Debug Levels](./src/assets/Screenshot%202026-05-24%20at%2009.48.38.png)

## Core Features

- **Real-time Log Feed**: Visualize incoming Salesforce logs as they are generated.
- **Trace Management**: Manage and monitor `TraceFlags` directly from the dashboard.
- **Active Resource Monitoring**: Track active users, classes, and triggers being logged.
- **Deep Inspection**: Review detailed log metadata and bodies for rapid debugging.

## Tech Stack

- **React** with **TypeScript**
- **Vite** for fast development and building
- **React Router** for navigation
- **Vanilla CSS** for styling

## Getting Started

### Prerequisites

- Node.js (Latest LTS recommended)
- Access to the SFDC Log Observable Backend

### Installation

1. Navigate to the `frontend` directory:
   ```bash
   cd frontend
   ```
2. Install dependencies:
   ```bash
   npm install
   ```
3. Start the development server:
   ```bash
   npm run dev
   ```

## License

MIT License

Copyright (c) 2026 Ichwan Sholihin

## Changelog

See [CHANGELOG.md](./CHANGELOG.md) for a history of changes.

Permission is hereby granted, free of charge, to any person obtaining a copy
of this software and associated documentation files (the "Software"), to deal
in the Software without restriction, including without limitation the rights
to use, copy, modify, merge, publish, distribute, sublicense, and/or sell
copies of the Software, and to permit persons to whom the Software is
furnished to do so, subject to the following conditions:

The above copyright notice and this permission notice shall be included in all
copies or substantial portions of the Software.

THE SOFTWARE IS PROVIDED "AS IS", WITHOUT WARRANTY OF ANY KIND, EXPRESS OR
IMPLIED, INCLUDING BUT NOT LIMITED TO THE WARRANTIES OF MERCHANTABILITY,
FITNESS FOR A PARTICULAR PURPOSE AND NONINFRINGEMENT. IN NO EVENT SHALL THE
AUTHORS OR COPYRIGHT HOLDERS BE LIABLE FOR ANY CLAIM, DAMAGES OR OTHER
LIABILITY, WHETHER IN AN ACTION OF CONTRACT, TORT OR OTHERWISE, ARISING FROM, OUT OF OR IN CONNECTION WITH THE SOFTWARE OR THE USE OR OTHER DEALINGS IN THE SOFTWARE.

---
*Maintained by Ichwan Sholihin.*
