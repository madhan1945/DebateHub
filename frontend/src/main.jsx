import React from 'react';
import { createRoot } from 'react-dom/client';
import { BrowserRouter, Navigate, Outlet, Route, Routes } from 'react-router-dom';
import RootLayout from '../app/layout';
import AuthLayout from '../app/auth/layout';
import HomePage from '../app/page';
import AboutPage from '../app/about/page';
import AdminPage from '../app/admin/page';
import ForgotPasswordPage from '../app/auth/forgot-password/page';
import LoginPage from '../app/auth/login/page';
import RegisterPage from '../app/auth/register/page';
import BlogPage from '../app/blog/page';
import CareersPage from '../app/careers/page';
import DebatesPage from '../app/debates/page';
import CreateDebatePage from '../app/debates/create/page';
import DebateDetailPage from '../app/debates/[id]/page';
import GuidelinesPage from '../app/guidelines/page';
import HelpPage from '../app/help/page';
import LeaderboardPage from '../app/leaderboard/page';
import NotificationsPage from '../app/notifications/page';
import PressPage from '../app/press/page';
import PrivacyPage from '../app/privacy/page';
import ProfilePage from '../app/profile/[username]/page';
import SearchPage from '../app/search/page';
import SettingsPage from '../app/settings/page';
import SubscriptionPage from '../app/subscription/page';
import TermsPage from '../app/terms/page';

function AuthRouteShell() {
  return (
    <AuthLayout>
      <Outlet />
    </AuthLayout>
  );
}

function AppRoutes() {
  return (
    <RootLayout>
      <Routes>
        <Route path="/" element={<HomePage />} />
        <Route path="/about" element={<AboutPage />} />
        <Route path="/admin" element={<AdminPage />} />
        <Route path="/auth" element={<AuthRouteShell />}>
          <Route index element={<Navigate to="/auth/login" replace />} />
          <Route path="forgot-password" element={<ForgotPasswordPage />} />
          <Route path="login" element={<LoginPage />} />
          <Route path="register" element={<RegisterPage />} />
        </Route>
        <Route path="/blog" element={<BlogPage />} />
        <Route path="/careers" element={<CareersPage />} />
        <Route path="/debates" element={<DebatesPage />} />
        <Route path="/debates/create" element={<CreateDebatePage />} />
        <Route path="/debates/:id" element={<DebateDetailPage />} />
        <Route path="/guidelines" element={<GuidelinesPage />} />
        <Route path="/help" element={<HelpPage />} />
        <Route path="/leaderboard" element={<LeaderboardPage />} />
        <Route path="/notifications" element={<NotificationsPage />} />
        <Route path="/press" element={<PressPage />} />
        <Route path="/privacy" element={<PrivacyPage />} />
        <Route path="/profile/:username" element={<ProfilePage />} />
        <Route path="/search" element={<SearchPage />} />
        <Route path="/settings" element={<SettingsPage />} />
        <Route path="/subscription" element={<SubscriptionPage />} />
        <Route path="/terms" element={<TermsPage />} />
        <Route path="*" element={<Navigate to="/" replace />} />
      </Routes>
    </RootLayout>
  );
}

createRoot(document.getElementById('root')).render(
  <React.StrictMode>
    <BrowserRouter>
      <AppRoutes />
    </BrowserRouter>
  </React.StrictMode>
);
