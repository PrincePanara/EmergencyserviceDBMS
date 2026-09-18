import React from 'react';
import { BrowserRouter, Navigate, Route, Routes } from 'react-router-dom';
import { AuthProvider } from './contexts/AuthContext';
import { ThemeProvider } from './contexts/ThemeContext';
import { ToastProvider } from './contexts/ToastContext';
import { AppShell } from './components/layout/AppShell';
import { ProtectedRoute } from './components/layout/ProtectedRoute';
import { GuestRoute } from './components/layout/GuestRoute';
import { Login } from './pages/auth/Login';
import { Register } from './pages/auth/Register';
import { ForgotPassword } from './pages/auth/ForgotPassword';
import { UserDashboard } from './pages/user/Dashboard';
import { ReportEmergency } from './pages/user/ReportEmergency';
import { MyEmergencies } from './pages/user/MyEmergencies';
import { UserIncidentDetails } from './pages/user/IncidentDetails';
import { UserNotifications } from './pages/user/Notifications';
import { EmergencyContacts } from './pages/user/EmergencyContacts';
import { UserProfile } from './pages/user/Profile';
import { UserSettings } from './pages/user/Settings';
import { AdminDashboard } from './pages/admin/Dashboard';
import { AdminIncidents } from './pages/admin/Incidents';
import { AdminIncidentDetails } from './pages/admin/IncidentDetails';
import { AdminUsers } from './pages/admin/Users';
import { AdminTeams } from './pages/admin/Teams';
import { AdminVehicles } from './pages/admin/Vehicles';
import { AdminResources } from './pages/admin/Resources';
import { AdminLocations } from './pages/admin/Locations';
import { AdminResponses } from './pages/admin/Responses';
import { AdminNotifications } from './pages/admin/Notifications';
import { AdminAnalytics } from './pages/admin/Analytics';
import { AdminReports } from './pages/admin/Reports';
import { AdminSettings } from './pages/admin/Settings';
import { NotFound } from './pages/NotFound';

export function App() {
  return (
    <ThemeProvider>
      <AuthProvider>
        <ToastProvider>
          <BrowserRouter>
            <Routes>
              <Route path="/" element={<Navigate to="/login" replace />} />
              <Route path="/login" element={<GuestRoute><Login /></GuestRoute>} />
              <Route path="/register" element={<GuestRoute><Register /></GuestRoute>} />
              <Route path="/forgot-password" element={<GuestRoute><ForgotPassword /></GuestRoute>} />

              {/* Citizen experience */}
              <Route
                path="/user"
                element={
                <ProtectedRoute role="user">
                    <AppShell variant="user" />
                  </ProtectedRoute>
                }>
                
                <Route index element={<Navigate to="/user/dashboard" replace />} />
                <Route path="dashboard" element={<UserDashboard />} />
                <Route path="report-emergency" element={<ReportEmergency />} />
                <Route path="incidents" element={<MyEmergencies />} />
                <Route path="incidents/:id" element={<UserIncidentDetails />} />
                <Route path="notifications" element={<UserNotifications />} />
                <Route path="emergency-contacts" element={<EmergencyContacts />} />
                <Route path="profile" element={<UserProfile />} />
                <Route path="settings" element={<UserSettings />} />
              </Route>

              {/* Dispatcher / admin experience */}
              <Route
                path="/admin"
                element={
                <ProtectedRoute role="admin">
                    <AppShell variant="admin" />
                  </ProtectedRoute>
                }>
                
                <Route index element={<Navigate to="/admin/dashboard" replace />} />
                <Route path="dashboard" element={<AdminDashboard />} />
                <Route path="incidents" element={<AdminIncidents />} />
                <Route path="incidents/:id" element={<AdminIncidentDetails />} />
                <Route path="users" element={<AdminUsers />} />
                <Route path="teams" element={<AdminTeams />} />
                <Route path="vehicles" element={<AdminVehicles />} />
                <Route path="resources" element={<AdminResources />} />
                <Route path="locations" element={<AdminLocations />} />
                <Route path="responses" element={<AdminResponses />} />
                <Route path="notifications" element={<AdminNotifications />} />
                <Route path="analytics" element={<AdminAnalytics />} />
                <Route path="reports" element={<AdminReports />} />
                <Route path="settings" element={<AdminSettings />} />
              </Route>

              <Route path="*" element={<NotFound />} />
            </Routes>
          </BrowserRouter>
        </ToastProvider>
      </AuthProvider>
    </ThemeProvider>);

}