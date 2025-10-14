"use client"

import React from "react"
import { useNavigate } from 'react-router-dom'

export function SignIn({ onAuthSuccess }: { onAuthSuccess?: (token?: string) => void }) {
  const navigate = useNavigate()
  console.log('[SignIn] mounted')
  const [email, setEmail] = React.useState("")
  const [password, setPassword] = React.useState("")
  const [loading, setLoading] = React.useState(false)
  const [error, setError] = React.useState<string | null>(null)
  const [success, setSuccess] = React.useState<string | null>(null)
  

  async function onSubmit(e: React.FormEvent) {
    e.preventDefault()
    setError(null)
    setSuccess(null)
    console.log('[SignIn] onSubmit email=', email)

    if (!email || !password) {
      setError("Please enter both email and password.")
      return
    }
    setLoading(true)

    try {
      const res = await fetch('/api/auth/login', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email, password })
      })

      const data = await res.json().catch(() => ({}))
      if (!res.ok) {
        setError(data.error || data.message || 'Invalid credentials. Please try again.')
        return
      }

      const token = data.token
      if (!token) {
        setError('Login succeeded but token was not returned by server.')
        return
      }

      setSuccess('Signed in successfully.')
      console.log('[SignIn] success - calling onAuthSuccess with token=', token)
      onAuthSuccess?.(token)
      navigate('/')
    } catch (err: any) {
      console.error('SignIn error', err)
      setError('Invalid credentials. Please try again.')
    } finally {
      setLoading(false)
    }
  }

  return (
    <main className=" h-screen bg-indigo-950 flex items-center justify-center text-foreground px-4">
      <section
        className="w-full max-w-md rounded-lg border border-border bg-card shadow-sm"
        aria-labelledby="signin-title"
      >
        <header className="px-6 pt-6">
          <h1 id="signin-title" className="text-2xl font-semibold text-pretty">
            Sign in
          </h1>
          <p className="mt-1 text-sm text-muted-foreground">Use your email and password to sign in.</p>
        </header>

        <form onSubmit={onSubmit} className="px-6 py-6 space-y-4">
          <div className="space-y-2">
            <label htmlFor="email" className="text-sm font-medium">
              Email
            </label>
            <input
              id="email"
              type="email"
              autoComplete="email"
              required
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              className="block w-full rounded-md border border-border bg-background px-3 py-2 text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-ring focus:ring-offset-2 focus:ring-offset-background"
              placeholder="you@example.com"
              aria-required="true"
            />
          </div>

          <div className="space-y-2">
            <label htmlFor="password" className="text-sm font-medium">
              Password
            </label>
            <input
              id="password"
              type="password"
              autoComplete="current-password"
              required
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              className="block w-full rounded-md border border-border bg-background px-3 py-2 text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-ring focus:ring-offset-2 focus:ring-offset-background"
              placeholder="Enter your password"
              aria-required="true"
            />
          </div>

          {error && (
            <p role="alert" className="text-sm text-destructive">
              {error}
            </p>
          )}

          {success && (
            <p role="status" className="text-sm text-green-600">
              {success}
            </p>
          )}

          <button
            type="submit"
            disabled={loading}
            className="w-full rounded-md bg-primary px-4 py-2 font-medium text-primary-foreground transition-opacity hover:opacity-90 focus:outline-none focus:ring-2 focus:ring-ring focus:ring-offset-2 focus:ring-offset-background disabled:cursor-not-allowed disabled:opacity-50"
          >
            {loading ? "Please wait..." : "Sign in"}
          </button>

          <p className="text-center text-sm text-muted-foreground">
            Don't have an account?{" "}
            <a className="font-medium text-indigo-900 underline-offset-4 hover:underline" href="/sign-up">
              Sign up
            </a>
          </p>
        </form>
      </section>
    </main>
  )
}
