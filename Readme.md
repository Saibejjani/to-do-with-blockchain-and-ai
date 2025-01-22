# Task Management Application Frontend

This repository contains the frontend code for a task management application built with React. It interacts with a separate backend API and integrates user authentication.

## Deployed link

[Deployed Link](https://assignment-frontend-956747381510.asia-south1.run.app/tasks)
-> https://assignment-frontend-956747381510.asia-south1.run.app/tasks

## Features

- **User Interface:** Provides a user-friendly interface for managing tasks.
- **User Authentication:** Handles user login and registration, integrating with the backend authentication flow.
- **Routing:** Uses React Router for navigation between different views (Login, Registration, Task Manager).
- **Protected Routes:** Secures the Task Manager view, ensuring only authenticated users can access it.
- **Context API:** Utilizes React Context for managing application state, specifically for authentication (`AuthContext`) and potentially Web3 integration (`Web3Context` - although its usage isn't demonstrated in the provided code).

## Technologies Used

- **React:** JavaScript library for building user interfaces.
- **React Router:** Library for handling navigation and routing.
- **React Context API:** For managing global state.

## Setup and Running Locally

1. **Install Dependencies:** Navigate to the project directory and install the required Node modules:

```bash
npm install
```

2. **Start Development Server:**

```bash
   npm start
```

This will typically start the development server on http://localhost:3000.

## Project Structure

src/App.jsx: The main application component, sets up routing and context providers.
src/pages: Contains page components (Login, Register, TaskManager).
src/components: Contains reusable components, notably the ProtectedRoute component.
src/contexts: Contains context providers for managing application state (AuthContext, Web3Context).

# Task Management Application Backend

This repository contains the backend code for a task management application. It uses Node.js with Express.js, MongoDB, and incorporates AI features. Authentication is handled via cookies.

## Features

- **User Authentication:** Secure user registration and login with cookie-based authentication.
- **Task Management:** Create, read, update, and delete tasks.
- **AI Integration:** Leverages AI capabilities (specifics not detailed in provided code).
- **CORS Enabled:** Handles Cross-Origin Resource Sharing for communication with a specified frontend application.

## Technologies Used

- **Node.js & Express.js:** Provides the backend runtime and web framework.
- **MongoDB:** NoSQL database for data persistence.
- **Mongoose:** ODM for interacting with MongoDB.
- **Cookie-Parser:** Handles cookies for authentication.
- **dotenv:** Manages environment variables.
- **Cors:** Enables Cross-Origin Resource Sharing.

## Setup and Deployment

This application is designed to be deployed.

1. **Environment Variables:** Ensure the following environment variables are set:

   - `PORT`: The port the application will run on. Defaults to 8080.
   - `MONGO_DB_CONNECTION_URL`: The connection string for your MongoDB instance.

2. **Dependencies:** Install the required dependencies using:

```bash
npm install
```

3. **Running Locally:** Start the development server:

```bash
   npm start
```

**API Endpoints**
Endpoint Method Description Authentication Required

```bash
/user (See userRouter) User-related operations (likely registration, login, etc.) Likely No
/tasks GET, POST, PUT, DELETE Task management operations Yes
/ai (See aiRouter) AI-related functionality Yes
Further Documentation
More detailed documentation on specific API endpoints and AI features would be beneficial.
```
