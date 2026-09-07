import { useState } from 'react'
import { supabase } from './services/supabase'

function Login({ onLogin }) {
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [role, setRole] = useState('teacher')
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')

  async function handleLogin(e) {
    e.preventDefault()

    setLoading(true)
    setError('')

    const { data, error } = await supabase.auth.signInWithPassword({
      email,
      password,
    })

    if (error) {
      setError(error.message)
      setLoading(false)
      return
    }

    const user = data.user

    const { data: profile, error: profileError } = await supabase
      .from('profiles')
      .select('*')
      .eq('id', user.id)
      .single()

    if (profileError) {
      setError(profileError.message)
      setLoading(false)
      return
    }

    if (profile.role !== role) {
      await supabase.auth.signOut()

      setError(
        `This account is registered as ${profile.role}, not ${role}.`
      )

      setLoading(false)
      return
    }

    onLogin(profile)

    setLoading(false)
  }

  return (
    <div className="auth-page">
      <div className="auth-card">

        <div className="auth-logo">
          E
        </div>

        <h1>EduFlow AI</h1>

        <p className="auth-subtitle">
          Education Management Platform
        </p>

        <h2>Welcome Back 👋</h2>

        <p>Login to your account</p>

        {error && (
          <div className="auth-error">
            {error}
          </div>
        )}

        <form onSubmit={handleLogin}>

          <div className="form-group">
            <label>Email</label>

            <input
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder="Enter your email"
              required
            />
          </div>

          <div className="form-group">
            <label>Password</label>

            <input
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              placeholder="Enter your password"
              required
            />
          </div>

          <div className="role-selector">

            <label>Login as</label>

            <div className="role-options">

              <button
                type="button"
                className={
                  role === 'teacher'
                    ? 'role-option active'
                    : 'role-option'
                }
                onClick={() => setRole('teacher')}
              >
                👨‍🏫 Teacher
              </button>

              <button
                type="button"
                className={
                  role === 'student'
                    ? 'role-option active'
                    : 'role-option'
                }
                onClick={() => setRole('student')}
              >
                👨‍🎓 Student
              </button>

            </div>

          </div>

          <button
            type="submit"
            className="primary-button auth-button"
            disabled={loading}
          >
            {loading ? 'Logging in...' : 'Login'}
          </button>

        </form>

        <p className="auth-switch">
          Don't have an account?{' '}
          <button
            type="button"
            onClick={() => window.dispatchEvent(
              new Event('showSignup')
            )}
          >
            Sign Up
          </button>
        </p>

      </div>
    </div>
  )
}

export default Login