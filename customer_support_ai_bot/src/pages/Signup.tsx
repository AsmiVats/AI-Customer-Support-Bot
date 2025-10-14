
import { signup } from "@/api/User"
import { useNavigate } from 'react-router-dom'
import  { useState } from "react"

export function SignUp() {
  
  const navigate = useNavigate()
  console.log('[SignUp] mounted')
  
  const [email, setEmail] = useState("")
  const [username, setUsername] = useState("")
  const [password, setPassword] = useState("")
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [success, setSuccess] = useState<string | null>(null)

  async function onSubmit(e: React.FormEvent) {
    e.preventDefault()
    setError(null)
    setSuccess(null)
    console.log('[SignUp] onSubmit email=', email)

    if (!username || !email || !password) {
      setError("Please enter all details.")
      return
    }
    setLoading(true)

    try {
     const res = await signup({ username, email, password });
      console.log('Signup response:', res);
      const data = res.data || {}
      if (!res.ok) {
        setError(data.error || data.message || 'Unable to create account')
        return
      }

      const token = data.token
      setSuccess('Account created successfully.')
      if (token) {
        console.log('[SignUp] success - calling onAuthSuccess with token=', token)
        localStorage.setItem('token',token);
      }
      console.log('[SignUp] navigate to /')
      navigate('/')
    } catch (err: any) {
      setError("Something went wrong. Please try again.")
    } finally {
      setLoading(false)
    }
  }

  return (
    <main className="h-screen bg-indigo-950  flex items-center justify-center text-foreground px-4">
      <section
        className="w-full max-w-md rounded-lg border border-border bg-card shadow-sm"
        aria-labelledby="signup-title"
      >
        <header className="px-6 pt-6">
          <h1 id="signup-title" className="text-2xl font-semibold text-pretty">
            Create an account
          </h1>
          <p className="mt-1 text-sm text-muted-foreground">Create an account.</p>
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
            <label htmlFor="username" className="text-sm font-medium">
              Username
            </label>
            <input
              id="username"
              type="text"
              autoComplete="username"
              required
              value={username}
              onChange={(e) => setUsername(e.target.value)}
              className="block w-full rounded-md border border-border bg-background px-3 py-2 text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-ring focus:ring-offset-2 focus:ring-offset-background"
              placeholder="Enter your username"
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
              autoComplete="new-password"
              required
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              className="block w-full rounded-md border border-border bg-background px-3 py-2 text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-ring focus:ring-offset-2 focus:ring-offset-background"
              placeholder="Enter a strong password"
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
            {loading ? "Please wait..." : "Create account"}
          </button>

          <p className="text-center text-sm text-muted-foreground">
            Already have an account?{" "}
            <a className="font-medium text-indigo-900 underline-offset-4 hover:underline" href="/sign-in">
              Sign in
            </a>
          </p>
        </form>
      </section>
    </main>
  )
}
