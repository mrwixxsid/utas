# UTAS (University Timetable Automation System)

---

## 🚀 Project Description

**UTAS (University Timetable Automation System)** is a comprehensive web application designed to **automate the university scheduling process**. It is a high-utility system that manages complex scheduling logic while providing a simple, secure, and personalized user experience through **role-based access** for all university stakeholders: Administrators, Teachers, and Students.

The application is built on **React.js** and leverages a modern architecture to ensure separation of concerns, data consistency, and a highly responsive user interface.

---

## ✨ Core Features & Functionality

UTAS is built around a powerful, modular architecture, with capabilities tailored to each user role.

| Feature Category | Description | Key User Roles |
| :--- | :--- | :--- |
| **Timetable Automation** | The core **Timetable Generation Engine** processes all university entities (Courses, Teachers, Rooms, Batches) and complex constraints to **generate an optimized, conflict-free routine**. | **Admin** |
| **Role-Based Access** | Users are authenticated and authorized to access specific dashboards. Each user is instantly directed to a control center with tools relevant only to their role. | **Admin, Teacher, Student** |
| **Entity Management** | Comprehensive tools for creating, updating, and deleting core university resources. | **Admin** |
| **Schedule Visualization** | The **Timetable Grid Visualization** component converts raw schedule data into an easy-to-read, week-based visual grid, displaying class details (Course, Room, Teacher). | **Admin, Teacher, Student** |
| **Teacher Workflow** | Teachers can view their personal schedule and utilize interactive features (e.g., drag-and-drop) to **initiate class swap requests**. | **Teacher** |

---

## 🧱 Architectural Overview

The project is structured into distinct, interconnected layers to maximize maintainability and scalability.

| Component | Role in the System | Analogy |
| :--- | :--- | :--- |
| **Authentication & Authorization System** | Verifies user identity and assigns permissions, ensuring only authorized users access specific routes (via `ProtectedRoute` component). | The University Security Guard |
| **Firestore Data Access Layer (DAL)** | Centralizes all database read/write logic, standardizing data fetching and shielding the UI components from direct database details. | The Central Librarian |
| **Timetable Generation Engine** | The core business logic that takes input data, applies constraints, and algorithmically produces the final timetable array. | The Complex Puzzle Solver |
| **UI Component Library (Shadcn/UI)** | Provides a set of high-quality, pre-styled, and accessible React components (Buttons, Cards, Dialogs) for a consistent user experience. | The Standardized Building Blocks |

---

## 🛠️ Simple Installation Process (React App)

This project, being a modern React application, follows a standard installation procedure, assuming **Node.js** and **npm/yarn** are installed on the local system.

```bash
# 1. Clone the repository
git clone <repository-url>
cd utas

# 2. Install dependencies
# Using npm:
npm install

# OR using yarn:
# yarn install

# 3. Configure Environment Variables
# Create a .env file in the root directory and add Firebase/Firestore configurations
# Example:
# REACT_APP_FIREBASE_API_KEY=your_key
# REACT_APP_FIREBASE_PROJECT_ID=your_id
# ... (all config details required by src/lib/firebase.js)

# 4. Start the application
npm run dev 
# The application will typically start on http://localhost:3000
