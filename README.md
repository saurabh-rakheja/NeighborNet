# Volunteer Management System

A comprehensive system for managing volunteer opportunities, events, and participation.

## Unified User Schema

This system implements a unified approach for users with different capabilities. Instead of having separate collections for different user types (volunteers, NGOs, admins), we use a single User model with fields that can support all types of users.

### Key Features

- **Single User Model**: Volunteers, NGOs, and Administrators are all stored in a single collection
- **Capability-Based Authorization**: Access to features is determined by user capabilities, not just roles
- **Flexible User Profiles**: Users can have both volunteer and NGO capabilities simultaneously
- **Simplified Authentication**: One authentication flow for all user types

### User Capabilities

The system determines a user's capabilities based on their data:

- **Volunteer Capabilities**: A user has volunteer capabilities if they have the volunteer role or possess skills
- **NGO Capabilities**: A user has NGO capabilities if they have the NGO role or have organization information
- **Admin Capabilities**: A user has admin capabilities if they have the admin role

## User Interface

The UI adapts based on the user's capabilities:

- Users with volunteer capabilities see the volunteer dashboard and features
- Users with NGO capabilities see the NGO dashboard and features
- Users with both capabilities see a combined interface with access to both feature sets

## Getting Started

1. Clone the repository
2. Install dependencies:
   ```
   npm install
   cd client && npm install
   ```
3. Configure environment variables
4. Start the development servers:
   ```
   npm run dev
   ```

## License

MIT

## Features

- Volunteer registration and profile management
- Event creation and scheduling
- Shift assignment and tracking
- Hour logging and verification
- Reporting and analytics
- Communication tools
- Administrative dashboard

## Installation and usage

1. Open Volunteer Management Folder

```bash
cd VolunteerManagement
```

### Open two terminal windows:

1. Install dependencies and Start the client:

```bash
cd client
npm install
npm run dev
```

2. Install dependencies and Start the server:

```bash
cd server
npm install
npm run dev
```

## Technologies

- Frontend: React.js
- Backend: Node.js/Express
- Database: MongoDB
- Authentication: JWT
