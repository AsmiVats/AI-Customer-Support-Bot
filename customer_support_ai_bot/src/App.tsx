
import React from 'react'
import { BrowserRouter, Routes, Route } from 'react-router-dom'

import SupportChat from './pages/SupportChat'
import { SignIn } from './pages/Signin'
import { SignUp } from './pages/Signup'
import ProtectedRoute from './Auth'

function App() {
  const FORCE_AUTH_FOR_DEV = true

  const [isAuthenticated, setIsAuthenticated] = React.useState<boolean>(() => {
    if (FORCE_AUTH_FOR_DEV) {
      console.log('[App][DEV] FORCING authentication for development')
      return true
    }
    try {
      const token = localStorage.getItem('auth_token')
      console.log('[App] init - localStorage auth_token:', token)
      return Boolean(token)
    } catch (e) {
      return false
    }
  })

  const handleAuthSuccess = (token?: string) => {
    console.log('[App] handleAuthSuccess, token:', token)
    try {
      if (token) localStorage.setItem('auth_token', token)
      else localStorage.setItem('auth_token', '1')
    } catch (e) {
      console.log('[App] localStorage not available', e)
    }
    setIsAuthenticated(true)
  }

  return (
    <BrowserRouter>
      <Routes>
        <Route path="/sign-in" element={<SignIn onAuthSuccess={handleAuthSuccess} />} />
        <Route path="/sign-up" element={<SignUp onAuthSuccess={handleAuthSuccess} />} />
        <Route
          path="/"
          element={
            <ProtectedRoute isAuthenticated={isAuthenticated}>
              <SupportChat />
            </ProtectedRoute>
          }
        />
      </Routes>
    </BrowserRouter>
  )
}

export default App

