# Emergency Services DBMS

A comprehensive web-based Database Management System for reporting, tracking, and managing emergency incidents. The application provides dedicated interfaces for both citizens and administrators to ensure rapid response and efficient resource allocation during crises.

## 🚀 Features

### Citizen Portal (User)
- **Report Emergencies:** Quickly report incidents (Fire, Medical, Accidents, etc.) with priority levels and location data.
- **Track Incidents:** View the real-time status and timeline of reported emergencies.
- **Emergency Contacts:** Manage a list of personal emergency contacts.
- **Notifications:** Receive real-time alerts when teams are dispatched or statuses change.

### Dispatch Control (Admin)
- **Incident Management:** View, update, and resolve all reported emergencies.
- **Resource Allocation:** Assign specialized teams (Fire, Medical, Police) and vehicles to incidents.
- **Real-time Timeline:** Track the lifecycle of an incident from report to closure.
- **Entity Management:** Manage Teams, Vehicles, Resources, and Locations.
- **Dashboard Analytics:** High-level overview of active incidents and available resources.

## 🛠️ Technology Stack
- **Frontend:** React 18, Vite, TypeScript, Tailwind CSS
- **Routing:** React Router v6
- **Icons:** Lucide React
- **Backend / Database:** Firebase Authentication, Cloud Firestore

## ⚙️ Getting Started

### Prerequisites
Make sure you have [Node.js](https://nodejs.org/) installed on your machine.

### Installation

1. **Clone the repository:**
   ```bash
   git clone https://github.com/PrincePanara/EmergencyserviceDBMS.git
   cd EmergencyserviceDBMS
   ```

2. **Install dependencies:**
   ```bash
   npm install
   ```

3. **Start the development server:**
   ```bash
   npm run dev
   ```

4. **Open in Browser:**
   Navigate to `http://localhost:5173/` (or the port provided in your terminal).

## 🔐 Authentication & Roles

The system uses Firebase Authentication. Roles are stored in the Firestore `users` collection.
- New registrations default to the `user` role (Citizen).
- To access the Admin Dashboard, the user's role must be set to `admin` in the database.

*Note: For testing purposes, you can log in with an admin account if one was created during setup (e.g., `princeyo@gmail.com`).*

## 📁 Project Structure

- `src/components/`: Reusable UI components and layout wrappers.
- `src/contexts/`: React contexts for Authentication, Theming, and Toast notifications.
- `src/pages/`: Page-level components organized by role (`auth/`, `admin/`, `user/`).
- `src/services/`: Services for handling data operations (Auth, Incidents, etc.).
- `src/types/`: TypeScript definitions for domain models.
- `src/lib/`: Library configurations (Firebase).

## 📄 License
This project is open-source and available under the MIT License.
