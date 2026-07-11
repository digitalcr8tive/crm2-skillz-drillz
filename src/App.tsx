import { Navigate, Route, Routes } from 'react-router-dom'
import { HomePage } from './pages/HomePage'
import { SignupPage } from './pages/SignupPage'
import { LoginPage } from './pages/LoginPage'
import { PortalPage } from './pages/PortalPage'
import { MerchPage } from './pages/MerchPage'
import { AboutPage } from './pages/AboutPage'
import { TrainingPage } from './pages/TrainingPage'

export default function App() {
  return (
    <Routes>
      <Route path="/" element={<HomePage />} />
      <Route path="/about" element={<AboutPage />} />
      <Route path="/training" element={<TrainingPage />} />
      <Route path="/signup" element={<SignupPage />} />
      <Route path="/login" element={<LoginPage />} />
      <Route path="/portal" element={<PortalPage />} />
      <Route path="/merch" element={<MerchPage />} />
      <Route path="*" element={<Navigate to="/" replace />} />
    </Routes>
  )
}
