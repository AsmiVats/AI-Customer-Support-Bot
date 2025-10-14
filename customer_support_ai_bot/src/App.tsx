
import React from 'react'
import { BrowserRouter, Routes, Route } from 'react-router-dom'

import SupportChat from './pages/SupportChat'
import { SignIn } from './pages/Signin'
import { SignUp } from './pages/Signup'
import ProtectedRoute from './Auth'

function App() {
  

  return (
    <BrowserRouter>
      <Routes>
        <Route path="/sign-in" element={<SignIn  />} />
        <Route path="/sign-up" element={<SignUp  />} />
        <Route
          path="/"
          element={
            <ProtectedRoute>
              <SupportChat />
            </ProtectedRoute>
          }
        />
      </Routes>
    </BrowserRouter>
  )
}

export default App

