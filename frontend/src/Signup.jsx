import { useState } from 'react'
import { supabase } from './services/supabase'

function Signup({ onSignup }) {
  const [fullName, setFullName] = useState('')
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [role, setRole] = useState('student')
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')
  const [success, setSuccess] = useState('')

  async function handleSignup(e) {
    e.preventDefault()

    setLoading(true)
    setError('')
    setSuccess('')

    const { data, error } = await supabase.auth.signUp({
      email,
      password,
      options: {
        data: {
          full_name: fullName,
          role: role,
        },
      },
    })

    if (error) {
      setError(error.message)
      setLoading(false)
      return
    }

    if (!data.session) {
      setSuccess(
        'Account created! Please check your email to verify your account.'
      )

      setLoading(false)
      return
    }

    const { data: profile, error: profileError } = await supabase
      .from('profiles')
      .select('*')
      .eq('id', data.user.id)
      .single()

    if (profileError) {
      setError(profileError.message)
      setLoading(false)
      return
    }

    onSignup(profile)

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
          Create your account
        </p>

        <h2>Get Started 🚀</h2>

        {error && (
          <div className="auth-error">
            {error}
          </div>
        )}

        {success && (
          <div className="auth-success">
            {success}
          </div>
        )}

        <form onSubmit={handleSignup}>

          <div className="form-group">
            <label>Full Name</label>

            <input
              type="text"
              value={fullName}
              onChange={(e) => setFullName(e.target.value)}
              placeholder="Enter your full name"
              required
            />
          </div>

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
              placeholder="Create a password"
              minLength="6"
              required
            />
          </div>

          <div className="role-selector">

            <label>Create account as</label>

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
            {loading ? 'Creating Account...' : 'Create Account'}
          </button>

        </form>

        <p className="auth-switch">
          Already have an account?{' '}
          <button
            type="button"
            onClick={() => window.dispatchEvent(
              new Event('showLogin')
            )}
          >
            Login
          </button>
        </p>

      </div>
    </div>
  )
}

export default Signup