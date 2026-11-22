import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom'
import LandingPage from './pages/LandingPage.jsx'
import LoginPage from './pages/LoginPage.jsx'
import RegisterPage from './pages/RegisterPage.jsx'
import CandidateDashboard from './pages/candidate/CandidateDashboard.jsx'
import CandidateProfile from './pages/candidate/CandidateProfile.jsx'
import JobSearchPage from './pages/candidate/JobSearchPage.jsx'
import MyApplicationsPage from './pages/candidate/MyApplicationsPage.jsx'
import EmployerDashboard from './pages/employer/EmployerDashboard.jsx'
import EmployerLoginPage from './pages/employer/EmployerLoginPage.jsx'
import VacancyManagementPage from './pages/employer/VacancyManagementPage.jsx'
import ApplicationsPage from './pages/employer/ApplicationsPage.jsx'
import InterviewsPage from './pages/employer/InterviewsPage.jsx'
import CandidateSearchPage from './pages/employer/CandidateSearchPage.jsx'

function ProtectedRoute({ children, role }) {
  const token = localStorage.getItem('token')
  const storedRole = localStorage.getItem('role')
  if (!token) return <Navigate to="/login" replace />
  if (role && storedRole !== role) return <Navigate to="/login" replace />
  return children
}

export default function App() {
  return (
    <BrowserRouter>
      <Routes>
        <Route path="/" element={<LandingPage />} />
        <Route path="/login" element={<LoginPage />} />
        <Route path="/employer/login" element={<EmployerLoginPage />} />
        <Route path="/register" element={<RegisterPage />} />
        <Route path="/candidate/dashboard" element={
          <ProtectedRoute role="CANDIDATE"><CandidateDashboard /></ProtectedRoute>
        } />
        <Route path="/candidate/profile" element={
          <ProtectedRoute role="CANDIDATE"><CandidateProfile /></ProtectedRoute>
        } />
        <Route path="/candidate/jobs" element={
          <ProtectedRoute role="CANDIDATE"><JobSearchPage /></ProtectedRoute>
        } />
        <Route path="/candidate/applications" element={
          <ProtectedRoute role="CANDIDATE"><MyApplicationsPage /></ProtectedRoute>
        } />
        <Route path="/employer/dashboard" element={
          <ProtectedRoute role="EMPLOYER"><EmployerDashboard /></ProtectedRoute>
        } />
        <Route path="/employer/vacancies" element={
          <ProtectedRoute role="EMPLOYER"><VacancyManagementPage /></ProtectedRoute>
        } />
        <Route path="/employer/applications" element={
          <ProtectedRoute role="EMPLOYER"><ApplicationsPage /></ProtectedRoute>
        } />
        <Route path="/employer/interviews" element={
          <ProtectedRoute role="EMPLOYER"><InterviewsPage /></ProtectedRoute>
        } />
        <Route path="/employer/search" element={
          <ProtectedRoute role="EMPLOYER"><CandidateSearchPage /></ProtectedRoute>
        } />
      </Routes>
    </BrowserRouter>
  )
}
