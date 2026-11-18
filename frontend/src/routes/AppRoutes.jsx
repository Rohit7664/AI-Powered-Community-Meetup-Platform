import React from 'react';
import { Routes, Route, Navigate } from 'react-router-dom';
import AppLayout from '../components/layout/AppLayout';
import { ProtectedRoute, PublicOnlyRoute } from './ProtectedRoute';

import LandingPage from '../pages/LandingPage';
import LoginPage from '../pages/LoginPage';
import RegisterPage from '../pages/RegisterPage';
import OnboardingPage from '../pages/OnboardingPage';
import DashboardPage from '../pages/DashboardPage';
import ExplorePage from '../pages/ExplorePage';
import MyGroupsPage from '../pages/MyGroupsPage';
import InvitationsPage from '../pages/InvitationsPage';
import GroupDetailsPage from '../pages/GroupDetailsPage';
import ActivitiesPage from '../pages/ActivitiesPage';
import ProfilePage from '../pages/ProfilePage';
import SettingsPage from '../pages/SettingsPage';

const AppRoutes = () => {
  return (
    <Routes>
      <Route element={<AppLayout />}>
        {/* Public Routes */}
        <Route path="/" element={<LandingPage />} />
        <Route path="/explore" element={<ExplorePage />} />

        {/* Auth Routes (Guest only) */}
        <Route element={<PublicOnlyRoute />}>
          <Route path="/login" element={<LoginPage />} />
          <Route path="/register" element={<RegisterPage />} />
        </Route>

        {/* Onboarding Route (Authenticated) */}
        <Route path="/onboarding" element={<OnboardingPage />} />

        {/* Protected Authenticated Routes */}
        <Route element={<ProtectedRoute />}>
          <Route path="/dashboard" element={<DashboardPage />} />
          <Route path="/my-groups" element={<MyGroupsPage />} />
          <Route path="/invitations" element={<InvitationsPage />} />
          <Route path="/groups/:id" element={<GroupDetailsPage />} />
          <Route path="/activities" element={<ActivitiesPage />} />
          <Route path="/profile" element={<ProfilePage />} />
          <Route path="/settings" element={<SettingsPage />} />
        </Route>

        {/* Fallback */}
        <Route path="*" element={<Navigate to="/" replace />} />
      </Route>
    </Routes>
  );
};

export default AppRoutes;
