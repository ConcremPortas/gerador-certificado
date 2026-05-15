import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom'
import { AuthProvider } from './contexts/AuthContext'
import Login from './pages/Login'
import AppLayout from './components/layout/AppLayout'
import { Certificados } from './pages/Certificados'
import Usuarios from './pages/Usuarios'

export default function App() {
  return (
    <BrowserRouter>
      <AuthProvider>
        <Routes>
          <Route path="/login" element={<Login />} />
          <Route element={<AppLayout />}>
            <Route path="/" element={<Navigate to="/certificados" replace />} />
            <Route path="/certificados" element={<Certificados />} />
            <Route path="/usuarios" element={<Usuarios />} />
          </Route>
          <Route path="*" element={<Navigate to="/certificados" replace />} />
        </Routes>
      </AuthProvider>
    </BrowserRouter>
  )
}
