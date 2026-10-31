import { useState, useEffect } from 'react'
import { Routes, Route, Navigate } from 'react-router-dom'
import { useAuth } from './context/AuthContext'
import Layout from './components/Layout'
import AuthPage from './pages/AuthPage'
import UpdatesPage from './pages/UpdatesPage'
import QuizzesPage from './pages/QuizzesPage'
import CommunityPage from './pages/CommunityPage'
import LeaderboardPage from './pages/LeaderboardPage'
import ProfilePage from './pages/ProfilePage'
import AboutPage from './pages/AboutPage'
import AdminPage from './pages/AdminPage'
import PrivacyPage from './pages/PrivacyPage'
import TermsPage from './pages/TermsPage'
import ContactPage from './pages/ContactPage'
import LoadingScreen from './components/LoadingScreen'

const MIN_SPLASH_MS = 2500

function ProtectedRoute({ children }: { children: React.ReactNode }) {
  const { session, loading, profile } = useAuth()
  if (loading) return <LoadingScreen />
  if (!session) return <Navigate to="/auth" replace />
  if (session && !profile) return <Navigate to="/auth?complete=1" replace />
  return <>{children}</>
}

function AdminRoute({ children }: { children: React.ReactNode }) {
  const { isAdmin, loading } = useAuth()
  if (loading) return <LoadingScreen />
  if (!isAdmin) return <Navigate to="/" replace />
  return <>{children}</>
}

export default function App() {
  const { loading: authLoading } = useAuth()
  const [splashDone, setSplashDone] = useState(false)

  useEffect(() => {
    const t = setTimeout(() => setSplashDone(true), MIN_SPLASH_MS)
    return () => clearTimeout(t)
  }, [])

  // Show splash until BOTH: min time passed AND auth finished loading
  if (!splashDone || authLoading) {
    return <LoadingScreen />
  }

  return (
    <Routes>
      <Route path="/auth" element={<AuthPage />} />
      <Route path="/privacy" element={<PrivacyPage />} />
      <Route path="/terms" element={<TermsPage />} />
      <Route path="/contact" element={<ContactPage />} />

      <Route
        path="/"
        element={
          <ProtectedRoute>
            <Layout />
          </ProtectedRoute>
        }
      >
        <Route index element={<UpdatesPage />} />
        <Route path="quizzes" element={<QuizzesPage />} />
        <Route path="community" element={<CommunityPage />} />
        <Route path="leaderboard" element={<LeaderboardPage />} />
        <Route path="profile" element={<ProfilePage />} />
        <Route path="about" element={<AboutPage />} />
        <Route
          path="admin"
          element={
            <AdminRoute>
              <AdminPage />
            </AdminRoute>
          }
        />
      </Route>

      <Route path="*" element={<Navigate to="/" replace />} />
    </Routes>
  )
}
