import { useEffect, useMemo, useState } from 'react'
import { supabase } from './services/supabase'
import './App.css'

// ==========================================
// LOGIN / SIGNUP PAGE
// ==========================================

function LoginPage({ onLogin }) {
  const [fullName, setFullName] = useState('')
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [role, setRole] = useState('student')

  const [isSignup, setIsSignup] = useState(false)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')
  const [success, setSuccess] = useState('')

  async function handleAuth(e) {
    e.preventDefault()

    setLoading(true)
    setError('')
    setSuccess('')

    const cleanName = fullName.trim()
    const cleanEmail = email.trim().toLowerCase()

    // =========================
    // SIGN UP
    // =========================

    if (isSignup) {
      if (!cleanName) {
        setError('Please enter your full name.')
        setLoading(false)
        return
      }

      if (!cleanEmail) {
        setError('Please enter your email address.')
        setLoading(false)
        return
      }

      if (!password || password.length < 6) {
        setError('Password must be at least 6 characters.')
        setLoading(false)
        return
      }

      const { data, error: signupError } =
        await supabase.auth.signUp({
          email: cleanEmail,
          password: password,
          options: {
            data: {
              full_name: cleanName,
              role: role,
            },
          },
        })

      if (signupError) {
        console.error('Signup error:', signupError)

        setError(signupError.message)

        setLoading(false)
        return
      }

      if (!data.user) {
        setError('Account could not be created.')
        setLoading(false)
        return
      }

      // Email confirmation may be enabled in Supabase
      if (!data.session) {
        setSuccess(
          'Account created successfully! Please confirm your email, then login.'
        )

        setIsSignup(false)
        setFullName('')
        setPassword('')

        setLoading(false)
        return
      }

      // If email confirmation is disabled,
      // login immediately
      await onLogin()

      setLoading(false)
      return
    }

    // =========================
    // LOGIN
    // =========================

    if (!cleanEmail) {
      setError('Please enter your email address.')
      setLoading(false)
      return
    }

    if (!password) {
      setError('Please enter your password.')
      setLoading(false)
      return
    }

    const { error: loginError } =
      await supabase.auth.signInWithPassword({
        email: cleanEmail,
        password: password,
      })

    if (loginError) {
      console.error('Login error:', loginError)

      setError(loginError.message)

      setLoading(false)
      return
    }

    await onLogin()

    setLoading(false)
  }

  return (
    <div className="auth-page">
      <div className="auth-card">

        {/* LOGO */}

        <div className="auth-logo">
          <div className="auth-brand-icon">E</div>

          <div className="auth-brand-text">
            <h1>EduFlow AI</h1>
            <p>Education Management Platform</p>
          </div>
        </div>

        {/* HEADING */}

        <div className="auth-heading">

          <p className="eyebrow">
            {isSignup ? 'CREATE ACCOUNT' : 'EDUFLOW AI'}
          </p>

          <h2>
            {isSignup
              ? 'Create Your Account'
              : 'Welcome Back 👋'}
          </h2>

          <p>
            {isSignup
              ? 'Create your EduFlow AI account to continue.'
              : 'Login to access your dashboard.'}
          </p>

        </div>

        {/* ERROR */}

        {error && (
          <div className="auth-error">
            {error}
          </div>
        )}

        {/* SUCCESS */}

        {success && (
          <div className="auth-success">
            {success}
          </div>
        )}

        {/* FORM */}

        <form onSubmit={handleAuth}>

          {/* FULL NAME */}

          {isSignup && (
            <div className="form-group">

              <label>Full Name</label>

              <input
                type="text"
                value={fullName}
                onChange={(e) =>
                  setFullName(e.target.value)
                }
                placeholder="Enter your full name"
                required
              />

            </div>
          )}

          {/* ROLE */}

          {isSignup && (
            <div className="form-group">

              <label>Account Type</label>

              <select
                value={role}
                onChange={(e) =>
                  setRole(e.target.value)
                }
                required
              >
                <option value="student">
                  Student
                </option>

                <option value="teacher">
                  Teacher
                </option>
              </select>

            </div>
          )}

          {/* EMAIL */}

          <div className="form-group">

            <label>Email</label>

            <input
              type="email"
              value={email}
              onChange={(e) =>
                setEmail(e.target.value)
              }
              placeholder="you@example.com"
              required
            />

          </div>

          {/* PASSWORD */}

          <div className="form-group">

            <label>Password</label>

            <input
              type="password"
              value={password}
              onChange={(e) =>
                setPassword(e.target.value)
              }
              placeholder="Enter your password"
              minLength={6}
              required
            />

          </div>

          {/* SUBMIT */}

          <button
            type="submit"
            className="primary-button auth-button"
            disabled={loading}
          >
            {loading
              ? 'Please wait...'
              : isSignup
                ? 'Create Account'
                : 'Login'}
          </button>

        </form>

        {/* SWITCH */}

        <div className="auth-switch">

          {isSignup
            ? 'Already have an account?'
            : "Don't have an account?"}

          <button
            type="button"
            onClick={() => {
              setIsSignup(!isSignup)
              setError('')
              setSuccess('')
            }}
          >
            {isSignup
              ? ' Login'
              : ' Sign Up'}
          </button>

        </div>

      </div>
    </div>
  )
}


// ==========================================
// STUDENT DASHBOARD
// ==========================================

function StudentDashboard({
  userName,
  userEmail,
  userRole,
  studentAssignments,
  studentSubmissions,
  studentLoading,
  studentError,
  selectedAssignment,
  setSelectedAssignment,
  studentAnswer,
  setStudentAnswer,
  submittingAssignment,
  handleStudentSubmit,
  handleLogout,
}) {
  return (
    <div className="app">

      <header className="topbar">

        <div className="brand">

          <div className="brand-icon">
            E
          </div>

          <div>
            <h1>EduFlow AI</h1>
            <span>Education Management Platform</span>
          </div>

        </div>

        <div className="dashboard-actions">

          <div className="dashboard-label">
            <span className="status-dot"></span>
            Student Dashboard
          </div>

          <ProfileMenu
            userName={userName}
            userEmail={userEmail}
            userRole={userRole}
            handleLogout={handleLogout}
          />

        </div>

      </header>

      <main className="container">

        {/* WELCOME */}

        <section className="welcome-section">

          <div>

            <p className="eyebrow">
              STUDENT PORTAL
            </p>

            <h2>
              Welcome back, {userName} 👋
            </h2>

            <p className="welcome-text">
              View your assignments and submit your answers.
            </p>

          </div>

        </section>


        {/* ASSIGNMENTS */}

        <section className="assignments-section">

          <div className="section-header">

            <div>
              <p className="eyebrow">
                AVAILABLE WORK
              </p>

              <h2>
                My Assignments
              </h2>
            </div>

            <span className="assignment-count">
              {studentAssignments.length}{' '}
              {studentAssignments.length === 1
                ? 'Assignment'
                : 'Assignments'}
            </span>

          </div>


          {studentLoading ? (

            <div className="state-card">

              <div className="loading-spinner"></div>

              <h3>
                Loading assignments...
              </h3>

              <p>
                Please wait while we load your assignments.
              </p>

            </div>

          ) : studentError ? (

            <div className="state-card error-state">

              <div className="state-icon">
                ⚠️
              </div>

              <h3>
                Unable to load assignments
              </h3>

              <p>
                {studentError}
              </p>

            </div>

          ) : studentAssignments.length === 0 ? (

            <div className="empty-state">

              <div className="empty-icon">
                📚
              </div>

              <h3>
                No assignments available
              </h3>

              <p>
                Your teacher has not published any assignments yet.
              </p>

            </div>

          ) : (

            <div className="assignment-list">

              {studentAssignments.map((assignment) => {

                const existingSubmission =
                  studentSubmissions.find(
                    (submission) =>
                      submission.assignment_id === assignment.id
                  )

                return (
                  <article
                    className="assignment-card"
                    key={assignment.id}
                  >

                    <div className="assignment-main">

                      <div className="assignment-icon">
                        📝
                      </div>

                      <div className="assignment-content">

                        <div className="title-row">

                          <h3>
                            {assignment.title}
                          </h3>

                          <span className="subject-badge">
                            {assignment.subject}
                          </span>

                        </div>

                        <p className="assignment-description">
                          {assignment.description ||
                            'No description provided.'}
                        </p>

                        <div className="assignment-meta">

                          <span>
                            🎯 {assignment.maximum_marks || 100} Marks
                          </span>

                          <span>
                            📅{' '}
                            {assignment.due_date
                              ? `Due: ${assignment.due_date}`
                              : 'No due date'}
                          </span>

                          {existingSubmission && (
                            <span
                              className={`status-badge ${
                                existingSubmission.status?.toLowerCase()
                              }`}
                            >
                              {existingSubmission.status}
                            </span>
                          )}

                        </div>

                      </div>

                    </div>


                    <div className="assignment-actions">

                      {existingSubmission ? (

                        <span>
                          {existingSubmission.status === 'Graded'
                            ? `Score: ${existingSubmission.marks_obtained} / ${
                                assignment.maximum_marks || 100
                              }`
                            : existingSubmission.status === 'Processing'
                              ? '🤖 Processing...'
                              : 'Submitted'}
                        </span>

                      ) : (

                        <button
                          className="primary-button"
                          onClick={() => {
                            setSelectedAssignment(assignment)
                            setStudentAnswer('')
                          }}
                        >
                          Submit Assignment →
                        </button>

                      )}

                    </div>

                  </article>
                )
              })}

            </div>

          )}

        </section>


        {/* SUBMIT FORM */}

        {selectedAssignment && (

          <section className="form-card">

            <div className="form-header">

              <div>

                <p className="eyebrow">
                  SUBMISSION
                </p>

                <h2>
                  {selectedAssignment.title}
                </h2>

              </div>

              <button
                className="close-button"
                onClick={() => {
                  setSelectedAssignment(null)
                  setStudentAnswer('')
                }}
              >
                ×
              </button>

            </div>


            <form onSubmit={handleStudentSubmit}>

              <div className="form-group">

                <label>
                  Your Answer
                </label>

                <textarea
                  value={studentAnswer}
                  onChange={(e) =>
                    setStudentAnswer(e.target.value)
                  }
                  placeholder="Write your answer here..."
                  rows="10"
                  required
                />

              </div>


              <div className="form-actions">

                <button
                  type="button"
                  className="secondary-button"
                  onClick={() => {
                    setSelectedAssignment(null)
                    setStudentAnswer('')
                  }}
                >
                  Cancel
                </button>

                <button
                  type="submit"
                  className="primary-button"
                  disabled={submittingAssignment}
                >
                  {submittingAssignment
                    ? 'Submitting...'
                    : 'Submit Assignment 🚀'}
                </button>

              </div>

            </form>

          </section>

        )}

      </main>


      <footer>

        <p>
          © 2026 EduFlow AI • Student Dashboard
        </p>

      </footer>

    </div>
  )
}


// ==========================================
// APP
// ==========================================

function App() {

  const [session, setSession] = useState(null)
  const [userRole, setUserRole] = useState(null)
  const [userName, setUserName] = useState('')
  const [userEmail, setUserEmail] = useState('')
  const [authLoading, setAuthLoading] = useState(true)

  const [showForm, setShowForm] = useState(false)

  const [assignments, setAssignments] = useState([])
  const [submissions, setSubmissions] = useState([])
  const [studentAssignments, setStudentAssignments] = useState([])
  const [studentSubmissions, setStudentSubmissions] = useState([])

  const [studentLoading, setStudentLoading] = useState(true)
  const [studentError, setStudentError] = useState('')

  const [selectedAssignment, setSelectedAssignment] = useState(null)
  const [studentAnswer, setStudentAnswer] = useState('')
  const [submittingAssignment, setSubmittingAssignment] = useState(false)

  const [submissionsLoading, setSubmissionsLoading] = useState(true)
  const [submissionsError, setSubmissionsError] = useState('')

  const [selectedSubmission, setSelectedSubmission] = useState(null)
  const [showSubmission, setShowSubmission] = useState(false)

  const [marks, setMarks] = useState('')
  const [feedback, setFeedback] = useState('')
  const [grading, setGrading] = useState(false)

  const [title, setTitle] = useState('')
  const [subject, setSubject] = useState('')
  const [description, setDescription] = useState('')
  const [dueDate, setDueDate] = useState('')
  const [maximumMarks, setMaximumMarks] = useState(100)
  const [status, setStatus] = useState('Draft')

  const [loading, setLoading] = useState(true)
  const [saving, setSaving] = useState(false)
  const [deletingId, setDeletingId] = useState(null)
  const [editingId, setEditingId] = useState(null)

  const [error, setError] = useState('')
  const [searchTerm, setSearchTerm] = useState('')
  const [filter, setFilter] = useState('all')


  // ==========================================
  // AUTH STATE
  // ==========================================

  useEffect(() => {

    checkUser()

    const {
      data: { subscription },
    } = supabase.auth.onAuthStateChange(
      (_event, currentSession) => {

        setSession(currentSession)
        setUserEmail(currentSession.user.email || '')

        if (!currentSession) {

          setUserRole(null)
          setUserName('')
          setUserEmail('')
          setAuthLoading(false)

        }

      }
    )

    return () => {
      subscription.unsubscribe()
    }

  }, [])


  // ==========================================
  // LOAD DATA BASED ON ROLE
  // ==========================================

  useEffect(() => {

    if (!session || !userRole) {
      return
    }

    if (userRole === 'teacher') {

      fetchAssignments()
      fetchSubmissions()

    }

    if (userRole === 'student') {

      fetchStudentAssignments()
      fetchStudentSubmissions()

    }

  }, [session, userRole])


  // ==========================================
  // CHECK USER
  // ==========================================

  async function checkUser() {

    setAuthLoading(true)

    const {
      data: { session: currentSession },
    } = await supabase.auth.getSession()

    if (!currentSession) {

      setSession(null)
      setUserRole(null)
      setUserName('')
      setAuthLoading(false)

      return
    }

    setSession(currentSession)

    const {
      data: profile,
      error,
    } = await supabase
      .from('profiles')
      .select('role, full_name')
      .eq('id', currentSession.user.id)
      .single()

    if (error) {

      console.error(
        'Error loading profile:',
        error
      )

      setUserRole(null)

      setUserName(
        currentSession.user.user_metadata?.full_name ||
        currentSession.user.email?.split('@')[0] ||
        'User'
      )

      setAuthLoading(false)

      return
    }

    setUserRole(profile?.role || null)

    setUserName(
      profile?.full_name ||
      currentSession.user.user_metadata?.full_name ||
      currentSession.user.email?.split('@')[0] ||
      'User'
    )

    setAuthLoading(false)
  }

  // ==========================================
// PROFILE MENU
// ==========================================

function ProfileMenu({
  userName,
  userEmail,
  userRole,
  handleLogout,
}) {
  const [showProfile, setShowProfile] = useState(false)

  const avatarLetter =
    userName?.trim()?.charAt(0)?.toUpperCase() || 'U'

  return (
    <div className="profile-menu-wrapper">

      {/* AVATAR */}

      <button
        className="profile-avatar-button"
        onClick={() =>
          setShowProfile((current) => !current)
        }
        aria-label="Open profile menu"
      >
        <div className="profile-avatar">
          {avatarLetter}
        </div>

        <span className="profile-chevron">
          {showProfile ? '▲' : '▼'}
        </span>
      </button>


      {/* PROFILE POPUP */}

      {showProfile && (

        <div className="profile-popup">

          {/* PROFILE HEADER */}

          <div className="profile-popup-header">

            <div className="profile-popup-avatar">
              {avatarLetter}
            </div>

            <div className="profile-popup-user">

              <strong>
                {userName || 'User'}
              </strong>

              <span>
                {userEmail || 'No email'}
              </span>

            </div>

          </div>


          {/* DIVIDER */}

          <div className="profile-divider"></div>


          {/* PROFILE INFO */}

          <div className="profile-info">

            <div className="profile-info-row">

              <span className="profile-info-icon">
                👤
              </span>

              <div>
                <small>Name</small>
                <strong>
                  {userName || 'User'}
                </strong>
              </div>

            </div>


            <div className="profile-info-row">

              <span className="profile-info-icon">
                ✉️
              </span>

              <div>
                <small>Email</small>
                <strong>
                  {userEmail || 'No email'}
                </strong>
              </div>

            </div>


            <div className="profile-info-row">

              <span className="profile-info-icon">
                🎓
              </span>

              <div>
                <small>Account Type</small>
                <strong>
                  {userRole === 'teacher'
                    ? 'Teacher'
                    : 'Student'}
                </strong>
              </div>

            </div>

          </div>


          {/* DIVIDER */}

          <div className="profile-divider"></div>


          {/* LOGOUT */}

          <button
            className="profile-logout-button"
            onClick={handleLogout}
          >
            <span>🚪</span>
            Logout
          </button>

        </div>

      )}

    </div>
  )
}


  // ==========================================
  // TEACHER: FETCH ASSIGNMENTS
  // ==========================================

  async function fetchAssignments() {

    setLoading(true)
    setError('')

    const {
      data,
      error,
    } = await supabase
      .from('assignments')
      .select('*')
      .order('created_at', {
        ascending: false,
      })

    if (error) {

      console.error(
        'Error loading assignments:',
        error
      )

      setError(error.message)
      setLoading(false)

      return
    }

    setAssignments(data || [])
    setLoading(false)
  }


  // ==========================================
  // STUDENT: FETCH PUBLISHED ASSIGNMENTS
  // ==========================================

  async function fetchStudentAssignments() {

    setStudentLoading(true)
    setStudentError('')

    const {
      data,
      error,
    } = await supabase
      .from('assignments')
      .select('*')
      .eq('status', 'Published')
      .order('created_at', {
        ascending: false,
      })

    if (error) {

      console.error(
        'Error loading student assignments:',
        error
      )

      setStudentError(error.message)
      setStudentLoading(false)

      return
    }

    setStudentAssignments(data || [])
    setStudentLoading(false)
  }


  // ==========================================
  // STUDENT: FETCH OWN SUBMISSIONS
  // ==========================================

  async function fetchStudentSubmissions() {

    if (!session?.user?.id) {
      return
    }

    const {
      data,
      error,
    } = await supabase
      .from('submissions')
      .select(`
        *,
        assignments (
          title,
          subject,
          maximum_marks
        )
      `)
      .eq('student_id', session.user.id)
      .order('submitted_date', {
        ascending: false,
      })

    if (error) {

      console.error(
        'Error loading student submissions:',
        error
      )

      return
    }

    setStudentSubmissions(data || [])
  }


  // ==========================================
  // STUDENT: SUBMIT ASSIGNMENT
  // ==========================================

  async function handleStudentSubmit(e) {

    e.preventDefault()

    if (!selectedAssignment) {
      return
    }

    if (!studentAnswer.trim()) {

      alert(
        'Please write your answer before submitting.'
      )

      return
    }

    if (!session?.user?.id) {

      alert(
        'You must be logged in to submit an assignment.'
      )

      return
    }

    setSubmittingAssignment(true)

    const {
      data,
      error,
    } = await supabase
      .from('submissions')
      .insert([
        {
          assignment_id: selectedAssignment.id,
          student_id: session.user.id,
          student_name: userName,
          submission_text: studentAnswer.trim(),
          submitted_date: new Date().toISOString(),
          marks_obtained: null,
          feedback: null,
          status: 'Processing',
        },
      ])
      .select(`
        *,
        assignments (
          title,
          subject,
          maximum_marks
        )
      `)
      .single()

    if (error) {

      console.error(
        'Error submitting assignment:',
        error
      )

      alert(
        'Failed to submit assignment: ' +
        error.message
      )

      setSubmittingAssignment(false)

      return
    }

    setStudentSubmissions((current) => [
      data,
      ...current,
    ])

    setStudentAnswer('')
    setSelectedAssignment(null)

    alert(
      'Assignment submitted successfully! 🚀'
    )

    setSubmittingAssignment(false)
  }


  // ==========================================
  // TEACHER: FETCH ALL STUDENT SUBMISSIONS
  // ==========================================

  async function fetchSubmissions() {

    setSubmissionsLoading(true)
    setSubmissionsError('')

    const {
      data,
      error,
    } = await supabase
      .from('submissions')
      .select(`
        *,
        assignments (
          title,
          subject,
          maximum_marks
        )
      `)
      .order('submitted_date', {
        ascending: false,
      })

    if (error) {

      console.error(
        'Error loading submissions:',
        error
      )

      setSubmissionsError(error.message)
      setSubmissionsLoading(false)

      return
    }

    console.log(
      'All student submissions loaded:',
      data
    )

    setSubmissions(data || [])
    setSubmissionsLoading(false)
  }


  // ==========================================
  // CREATE / UPDATE ASSIGNMENT
  // ==========================================

  async function handleSubmit(e) {

    e.preventDefault()

    if (!title.trim() || !subject.trim()) {

      alert(
        'Please enter a title and subject.'
      )

      return
    }

    setSaving(true)

    if (editingId) {

      const {
        data,
        error,
      } = await supabase
        .from('assignments')
        .update({
          title: title.trim(),
          subject: subject.trim(),
          description: description.trim(),
          due_date: dueDate || null,
          maximum_marks: Number(maximumMarks),
          status: status,
        })
        .eq('id', editingId)
        .select()

      if (error) {

        console.error(
          'Error updating assignment:',
          error
        )

        alert(
          'Failed to update assignment: ' +
          error.message
        )

      } else {

        setAssignments((current) =>
          current.map((assignment) =>
            assignment.id === editingId
              ? data[0]
              : assignment
          )
        )

        alert(
          'Assignment updated successfully! ✏️'
        )

        clearForm()
      }

    } else {

      const {
        data,
        error,
      } = await supabase
        .from('assignments')
        .insert([
          {
            title: title.trim(),
            subject: subject.trim(),
            description: description.trim(),
            due_date: dueDate || null,
            maximum_marks: Number(maximumMarks),
            status: status,
          },
        ])
        .select()

      if (error) {

        console.error(
          'Error creating assignment:',
          error
        )

        alert(
          'Failed to create assignment: ' +
          error.message
        )

      } else {

        setAssignments((current) => [
          data[0],
          ...current,
        ])

        alert(
          'Assignment created successfully! 🎉'
        )

        clearForm()
      }
    }

    setSaving(false)
  }


  // ==========================================
  // EDIT ASSIGNMENT
  // ==========================================

  function handleEdit(assignment) {

    setEditingId(assignment.id)

    setTitle(
      assignment.title || ''
    )

    setSubject(
      assignment.subject || ''
    )

    setDescription(
      assignment.description || ''
    )

    setDueDate(
      assignment.due_date || ''
    )

    setMaximumMarks(
      assignment.maximum_marks || 100
    )

    setStatus(
      assignment.status || 'Draft'
    )

    setShowForm(true)
  }


  // ==========================================
  // DELETE ASSIGNMENT
  // ==========================================

  async function handleDelete(id) {

    const confirmed =
      window.confirm(
        'Are you sure you want to delete this assignment?'
      )

    if (!confirmed) {
      return
    }

    setDeletingId(id)

    const {
      error,
    } = await supabase
      .from('assignments')
      .delete()
      .eq('id', id)

    if (error) {

      console.error(
        'Error deleting assignment:',
        error
      )

      alert(
        'Failed to delete assignment: ' +
        error.message
      )

    } else {

      setAssignments((current) =>
        current.filter(
          (assignment) =>
            assignment.id !== id
        )
      )

      alert(
        'Assignment deleted successfully! 🗑️'
      )
    }

    setDeletingId(null)
  }


  // ==========================================
  // CLEAR FORM
  // ==========================================

  function clearForm() {

    setTitle('')
    setSubject('')
    setDescription('')
    setDueDate('')
    setMaximumMarks(100)
    setStatus('Draft')
    setEditingId(null)
    setShowForm(false)
  }


  // ==========================================
  // DATE FILTERS
  // ==========================================

  function isUpcoming(assignment) {

    if (!assignment.due_date) {
      return false
    }

    const today = new Date()

    today.setHours(
      0,
      0,
      0,
      0
    )

    const due = new Date(
      assignment.due_date
    )

    due.setHours(
      0,
      0,
      0,
      0
    )

    return due >= today
  }


  function isPast(assignment) {

    if (!assignment.due_date) {
      return false
    }

    const today = new Date()

    today.setHours(
      0,
      0,
      0,
      0
    )

    const due = new Date(
      assignment.due_date
    )

    due.setHours(
      0,
      0,
      0,
      0
    )

    return due < today
  }


  // ==========================================
  // STATISTICS
  // ==========================================

  const totalAssignments =
    assignments.length

  const publishedAssignments =
    assignments.filter(
      (assignment) =>
        assignment.status === 'Published'
    ).length

  const draftAssignments =
    assignments.filter(
      (assignment) =>
        assignment.status === 'Draft'
    ).length

  const completedAssignments =
    assignments.filter(
      (assignment) =>
        assignment.status === 'Completed'
    ).length

  const upcomingAssignments =
    assignments.filter(
      isUpcoming
    ).length


  // ==========================================
  // FILTERED ASSIGNMENTS
  // ==========================================

  const filteredAssignments =
    useMemo(() => {

      const search =
        searchTerm
          .toLowerCase()
          .trim()

      return assignments.filter(
        (assignment) => {

          const matchesSearch =
            !search ||
            assignment.title
              ?.toLowerCase()
              .includes(search) ||
            assignment.subject
              ?.toLowerCase()
              .includes(search) ||
            assignment.description
              ?.toLowerCase()
              .includes(search)

          let matchesFilter = true

          if (
            filter === 'upcoming'
          ) {
            matchesFilter =
              isUpcoming(assignment)
          }

          if (
            filter === 'past'
          ) {
            matchesFilter =
              isPast(assignment)
          }

          return (
            matchesSearch &&
            matchesFilter
          )
        }
      )

    }, [
      assignments,
      searchTerm,
      filter,
    ])


  // ==========================================
  // VIEW SUBMISSION
  // ==========================================

  function handleViewSubmission(
    submission
  ) {

    setSelectedSubmission(
      submission
    )

    setMarks(
      submission.marks_obtained !== null
        ? submission.marks_obtained
        : ''
    )

    setFeedback(
      submission.feedback || ''
    )

    setShowSubmission(true)

    window.scrollTo({
      top: 0,
      behavior: 'smooth',
    })
  }


  // ==========================================
  // SAVE MANUAL GRADE
  // ==========================================

  async function handleSaveGrade() {

    if (!selectedSubmission) {
      return
    }

    const maximumMarks =
      selectedSubmission.assignments
        ?.maximum_marks || 100

    const numericMarks =
      Number(marks)

    if (
      marks === '' ||
      Number.isNaN(numericMarks)
    ) {

      alert(
        'Please enter marks.'
      )

      return
    }

    if (
      numericMarks < 0 ||
      numericMarks > maximumMarks
    ) {

      alert(
        `Marks must be between 0 and ${maximumMarks}.`
      )

      return
    }

    setGrading(true)

    const {
      data,
      error,
    } = await supabase
      .from('submissions')
      .update({
        marks_obtained:
          numericMarks,
        feedback:
          feedback.trim(),
        status:
          'Graded',
      })
      .eq(
        'id',
        selectedSubmission.id
      )
      .select('*')

    if (error) {

      console.error(
        'Error saving grade:',
        error
      )

      alert(
        'Failed to save grade: ' +
        error.message
      )

      setGrading(false)

      return
    }

    const updatedSubmission = {
      ...selectedSubmission,
      ...data[0],
    }

    setSelectedSubmission(
      updatedSubmission
    )

    setSubmissions(
      (current) =>
        current.map(
          (submission) =>
            submission.id ===
            updatedSubmission.id
              ? {
                  ...submission,
                  ...data[0],
                }
              : submission
        )
    )

    alert(
      'Grade saved successfully! ✅'
    )

    setGrading(false)
  }


  // ==========================================
  // AI GRADING
  // ==========================================

  async function handleAIGrade() {

    if (!selectedSubmission) {
      return
    }

    if (
      selectedSubmission.status ===
      'Processing'
    ) {
      return
    }

    const confirmed =
      window.confirm(
        'Send this submission for AI grading?'
      )

    if (!confirmed) {
      return
    }

    setGrading(true)

    const {
      data,
      error,
    } = await supabase
      .from('submissions')
      .update({
        status: 'Processing',
      })
      .eq(
        'id',
        selectedSubmission.id
      )
      .select('*')

    if (error) {

      console.error(
        'Error starting AI grading:',
        error
      )

      alert(
        'Failed to start AI grading: ' +
        error.message
      )

      setGrading(false)

      return
    }

    console.log(
      'AI grading update result:',
      data
    )

    if (
      !data ||
      data.length === 0
    ) {

      console.error(
        'No submission was updated.'
      )

      alert(
        'The submission was not updated. Please check your Supabase RLS policy.'
      )

      setGrading(false)

      return
    }

    const updatedSubmission = {
      ...selectedSubmission,
      ...data[0],
    }

    setSelectedSubmission(
      updatedSubmission
    )

    setSubmissions(
      (current) =>
        current.map(
          (submission) =>
            submission.id ===
            updatedSubmission.id
              ? {
                  ...submission,
                  ...data[0],
                }
              : submission
        )
    )

    alert(
      'Submission sent for AI grading! 🤖'
    )

    setGrading(false)
  }


  // ==========================================
  // LOGOUT
  // ==========================================

  async function handleLogout() {

    await supabase.auth.signOut()

    setSession(null)
    setUserRole(null)
    setUserName('')
    setUserEmail('')

    setAssignments([])
    setSubmissions([])

    setStudentAssignments([])
    setStudentSubmissions([])
  }


  // ==========================================
  // AUTH LOADING
  // ==========================================

  if (authLoading) {

    return (
      <div className="auth-loading">

        <div className="brand-icon">
          E
        </div>

        <h3>
          Loading EduFlow AI...
        </h3>

      </div>
    )
  }


  // ==========================================
  // NOT LOGGED IN
  // ==========================================

  if (!session) {

    return (
      <LoginPage
        onLogin={checkUser}
      />
    )
  }


  // ==========================================
  // STUDENT DASHBOARD
  // ==========================================

  if (userRole === 'student') {

    return (
      <StudentDashboard
        userName={userName}
        userEmail={userEmail}
        userRole={userRole}

        studentAssignments={
          studentAssignments
        }

        studentSubmissions={
          studentSubmissions
        }

        studentLoading={
          studentLoading
        }

        studentError={
          studentError
        }

        selectedAssignment={
          selectedAssignment
        }

        setSelectedAssignment={
          setSelectedAssignment
        }

        studentAnswer={
          studentAnswer
        }

        setStudentAnswer={
          setStudentAnswer
        }

        submittingAssignment={
          submittingAssignment
        }

        handleStudentSubmit={
          handleStudentSubmit
        }

        handleLogout={
          handleLogout
        }
      />
    )
  }


  // ==========================================
  // TEACHER DASHBOARD
  // ==========================================

  return (
    <div className="app">

      {/* ======================================
          TEACHER TOPBAR
      ====================================== */}

      <header className="topbar">

        <div className="brand">

          <div className="brand-icon">
            E
          </div>

          <div>

            <h1>
              EduFlow AI
            </h1>

            <span>
              Education Management Platform
            </span>

          </div>

        </div>


        <div className="dashboard-actions">

          <div className="dashboard-label">

            <span className="status-dot"></span>

            Teacher Dashboard

          </div>


          <ProfileMenu
            userName={userName}
            userEmail={userEmail}
            userRole={userRole}
            handleLogout={handleLogout}
          />

        </div>

      </header>


      <main className="container">

        {/* ======================================
            WELCOME
        ====================================== */}

        <section className="welcome-section">

          <div>

            <p className="eyebrow">
              TEACHER PORTAL
            </p>

            <h2>
              Welcome back, {userName} 👋
            </h2>

            <p className="welcome-text">
              Create and manage your assignments from one place.
            </p>

          </div>


          <button
            className="primary-button"
            onClick={() => {

              if (showForm) {

                clearForm()

              } else {

                setShowForm(true)

              }

            }}
          >

            <span>
              {showForm ? '×' : '+'}
            </span>

            {showForm
              ? 'Cancel'
              : 'Create Assignment'}

          </button>

        </section>


        {/* ======================================
            STATISTICS
        ====================================== */}

        <section className="stats-grid">

          <div className="stat-card">

            <div className="stat-icon">
              📚
            </div>

            <div>

              <p>
                Total Assignments
              </p>

              <h3>
                {totalAssignments}
              </h3>

            </div>

          </div>


          <div className="stat-card">

            <div className="stat-icon">
              🚀
            </div>

            <div>

              <p>
                Published
              </p>

              <h3>
                {publishedAssignments}
              </h3>

            </div>

          </div>


          <div className="stat-card">

            <div className="stat-icon">
              📝
            </div>

            <div>

              <p>
                Drafts
              </p>

              <h3>
                {draftAssignments}
              </h3>

            </div>

          </div>


          <div className="stat-card">

            <div className="stat-icon">
              📅
            </div>

            <div>

              <p>
                Upcoming
              </p>

              <h3>
                {upcomingAssignments}
              </h3>

            </div>

          </div>


          <div className="stat-card">

            <div className="stat-icon">
              ✅
            </div>

            <div>

              <p>
                Completed
              </p>

              <h3>
                {completedAssignments}
              </h3>

            </div>

          </div>

        </section>


        {/* ======================================
            CREATE / EDIT ASSIGNMENT
        ====================================== */}

        {showForm && (

          <section className="form-card">

            <div className="form-header">

              <div>

                <p className="eyebrow">

                  {editingId
                    ? 'UPDATE'
                    : 'NEW ASSIGNMENT'}

                </p>

                <h2>

                  {editingId
                    ? 'Edit Assignment'
                    : 'Create Assignment'}

                </h2>

              </div>


              <button
                className="close-button"
                onClick={clearForm}
              >
                ×
              </button>

            </div>


            <form
              onSubmit={handleSubmit}
            >

              <div className="form-grid">

                <div className="form-group">

                  <label>
                    Assignment Title *
                  </label>

                  <input
                    type="text"
                    value={title}
                    onChange={(e) =>
                      setTitle(e.target.value)
                    }
                    placeholder="Introduction to Python"
                  />

                </div>


                <div className="form-group">

                  <label>
                    Subject *
                  </label>

                  <input
                    type="text"
                    value={subject}
                    onChange={(e) =>
                      setSubject(e.target.value)
                    }
                    placeholder="Programming"
                  />

                </div>


                <div className="form-group full-width">

                  <label>
                    Description
                  </label>

                  <textarea
                    value={description}
                    onChange={(e) =>
                      setDescription(
                        e.target.value
                      )
                    }
                    placeholder="Explain variables, data types, and conditional statements."
                    rows="5"
                  />

                </div>


                <div className="form-group">

                  <label>
                    Due Date
                  </label>

                  <input
                    type="date"
                    value={dueDate}
                    onChange={(e) =>
                      setDueDate(
                        e.target.value
                      )
                    }
                  />

                </div>


                <div className="form-group">

                  <label>
                    Maximum Marks
                  </label>

                  <input
                    type="number"
                    min="1"
                    value={maximumMarks}
                    onChange={(e) =>
                      setMaximumMarks(
                        e.target.value
                      )
                    }
                  />

                </div>


                <div className="form-group">

                  <label>
                    Status
                  </label>

                  <select
                    value={status}
                    onChange={(e) =>
                      setStatus(
                        e.target.value
                      )
                    }
                  >

                    <option value="Draft">
                      Draft
                    </option>

                    <option value="Published">
                      Published
                    </option>

                    <option value="Completed">
                      Completed
                    </option>

                  </select>

                </div>

              </div>


              <div className="form-actions">

                <button
                  type="button"
                  className="secondary-button"
                  onClick={clearForm}
                >
                  Cancel
                </button>


                <button
                  type="submit"
                  className="primary-button"
                  disabled={saving}
                >

                  {saving
                    ? 'Saving...'
                    : editingId
                      ? 'Update Assignment'
                      : 'Save Assignment'}

                </button>

              </div>

            </form>

          </section>

        )}


        {/* ======================================
            RECENT ASSIGNMENTS
        ====================================== */}

        <section className="assignments-section">

          <div className="section-header">

            <div>

              <p className="eyebrow">
                YOUR WORK
              </p>

              <h2>
                Recent Assignments
              </h2>

            </div>


            <span className="assignment-count">

              {filteredAssignments.length}{' '}

              {filteredAssignments.length === 1
                ? 'Assignment'
                : 'Assignments'}

            </span>

          </div>


          {/* SEARCH / FILTER */}

          <div className="assignment-tools">

            <div className="search-box">

              <span>
                🔍
              </span>

              <input
                type="text"
                value={searchTerm}
                onChange={(e) =>
                  setSearchTerm(
                    e.target.value
                  )
                }
                placeholder="Search assignments..."
              />

              {searchTerm && (

                <button
                  className="clear-search"
                  onClick={() =>
                    setSearchTerm('')
                  }
                >
                  ×
                </button>

              )}

            </div>


            <div className="filter-buttons">

              <button
                className={
                  filter === 'all'
                    ? 'active-filter'
                    : ''
                }
                onClick={() =>
                  setFilter('all')
                }
              >
                All
              </button>


              <button
                className={
                  filter === 'upcoming'
                    ? 'active-filter'
                    : ''
                }
                onClick={() =>
                  setFilter('upcoming')
                }
              >
                Upcoming
              </button>


              <button
                className={
                  filter === 'past'
                    ? 'active-filter'
                    : ''
                }
                onClick={() =>
                  setFilter('past')
                }
              >
                Past
              </button>

            </div>

          </div>


          {/* ASSIGNMENT STATES */}

          {loading ? (

            <div className="state-card">

              <div className="loading-spinner"></div>

              <h3>
                Loading assignments...
              </h3>

              <p>
                Please wait while we load your assignments.
              </p>

            </div>

          ) : error ? (

            <div className="state-card error-state">

              <div className="state-icon">
                ⚠️
              </div>

              <h3>
                Unable to load assignments
              </h3>

              <p>
                {error}
              </p>

              <button
                className="primary-button"
                onClick={fetchAssignments}
              >
                🔄 Try Again
              </button>

            </div>

          ) : filteredAssignments.length === 0 ? (

            <div className="empty-state">

              <div className="empty-icon">

                {searchTerm ||
                filter !== 'all'
                  ? '🔍'
                  : '📚'}

              </div>

              <h3>

                {searchTerm ||
                filter !== 'all'
                  ? 'No matching assignments'
                  : 'No assignments yet'}

              </h3>

              <p>

                {searchTerm ||
                filter !== 'all'
                  ? 'Try changing your search or filter.'
                  : 'Create your first assignment to get started.'}

              </p>


              {!searchTerm &&
                filter === 'all' && (

                  <button
                    className="primary-button"
                    onClick={() =>
                      setShowForm(true)
                    }
                  >
                    + Create Assignment
                  </button>

                )}

            </div>

          ) : (

            <div className="assignment-list">

              {filteredAssignments.map(
                (assignment) => (

                  <article
                    className="assignment-card"
                    key={assignment.id}
                  >

                    <div className="assignment-main">

                      <div className="assignment-icon">
                        📝
                      </div>


                      <div className="assignment-content">

                        <div className="title-row">

                          <h3>
                            {assignment.title}
                          </h3>

                          <span className="subject-badge">
                            {assignment.subject}
                          </span>

                        </div>


                        <p className="assignment-description">

                          {assignment.description ||
                            'No description provided.'}

                        </p>


                        <div className="assignment-meta">

                          <span>

                            📅{' '}

                            {assignment.due_date
                              ? `Due: ${assignment.due_date}`
                              : 'No due date'}

                          </span>


                          {assignment.due_date && (

                            <span
                              className={
                                isUpcoming(
                                  assignment
                                )
                                  ? 'date-status upcoming'
                                  : 'date-status past'
                              }
                            >

                              {isUpcoming(
                                assignment
                              )
                                ? 'Upcoming'
                                : 'Past Due'}

                            </span>

                          )}


                          <span>

                            🎯{' '}

                            {assignment.maximum_marks ||
                              100}{' '}

                            Marks

                          </span>


                          <span
                            className={`status-badge ${
                              assignment.status?.toLowerCase()
                            }`}
                          >

                            {assignment.status ||
                              'Draft'}

                          </span>

                        </div>

                      </div>

                    </div>


                    <div className="assignment-actions">

                      <button
                        className="edit-button"
                        onClick={() =>
                          handleEdit(
                            assignment
                          )
                        }
                      >
                        Edit
                      </button>


                      <button
                        className="delete-button"
                        onClick={() =>
                          handleDelete(
                            assignment.id
                          )
                        }
                        disabled={
                          deletingId ===
                          assignment.id
                        }
                      >

                        {deletingId ===
                        assignment.id
                          ? 'Deleting...'
                          : 'Delete'}

                      </button>

                    </div>

                  </article>

                )
              )}

            </div>

          )}

        </section>


        {/* ======================================
            STUDENT SUBMISSIONS
            THIS IS NOW INSIDE TEACHER DASHBOARD
        ====================================== */}

        <section className="submissions-section">

          <div className="section-header submissions-header">

            <div>

              <p className="eyebrow">
                STUDENT WORK
              </p>

              <h2>
                Student Submissions
              </h2>

              <p className="section-description">
                Review, grade, and manage student assignment submissions.
              </p>

            </div>


            <div className="submission-total">

              <span>
                {submissions.length}
              </span>

              <small>
                {submissions.length === 1
                  ? 'Submission'
                  : 'Submissions'}
              </small>

            </div>

          </div>


          {/* LOADING */}

          {submissionsLoading ? (

            <div className="state-card">

              <div className="loading-spinner"></div>

              <h3>
                Loading submissions...
              </h3>

              <p>
                Please wait while we load student submissions.
              </p>

            </div>

          ) : submissionsError ? (

            /* ERROR */

            <div className="state-card error-state">

              <div className="state-icon">
                ⚠️
              </div>

              <h3>
                Unable to load submissions
              </h3>

              <p>
                {submissionsError}
              </p>


              <button
                className="primary-button"
                onClick={fetchSubmissions}
              >
                🔄 Try Again
              </button>

            </div>

          ) : submissions.length === 0 ? (

            /* EMPTY */

            <div className="empty-state">

              <div className="empty-icon">
                📨
              </div>

              <h3>
                No submissions yet
              </h3>

              <p>
                Student submissions will appear here once students submit their assignments.
              </p>

            </div>

          ) : (

            /* TABLE */

            <div className="submissions-table-card">

              {/* TABLE HEADER */}

              <div className="submission-table-header">

                <div>
                  STUDENT
                </div>

                <div>
                  ASSIGNMENT
                </div>

                <div>
                  SUBMITTED
                </div>

                <div>
                  STATUS
                </div>

                <div>
                  SCORE
                </div>

                <div>
                  ACTION
                </div>

              </div>


              {/* TABLE BODY */}

              <div className="submission-table-body">

                {submissions.map(
                  (submission) => {

                    const submissionMaximumMarks =
                      submission.assignments
                        ?.maximum_marks ||
                      100

                    return (

                      <article
                        className="submission-row"
                        key={submission.id}
                      >

                        {/* STUDENT */}

                        <div className="submission-student">

                          <div className="submission-student-avatar">

                            {submission.student_name
                              ? submission.student_name
                                  .charAt(0)
                                  .toUpperCase()
                              : 'S'}

                          </div>


                          <div>

                            <strong>

                              {submission.student_name ||
                                'Unknown Student'}

                            </strong>

                            <span>
                              Student
                            </span>

                          </div>

                        </div>


                        {/* ASSIGNMENT */}

                        <div className="submission-assignment-cell">

                          <strong>

                            {submission.assignments
                              ?.title ||
                              'Unknown Assignment'}

                          </strong>

                          <span>

                            {submission.assignments
                              ?.subject ||
                              'Unknown Subject'}

                          </span>

                        </div>


                        {/* DATE */}

                        <div className="submission-date-cell">

                          {submission.submitted_date ? (

                            <>

                              <strong>

                                {new Date(
                                  submission.submitted_date
                                ).toLocaleDateString(
                                  undefined,
                                  {
                                    month: 'short',
                                    day: 'numeric',
                                    year: 'numeric',
                                  }
                                )}

                              </strong>


                              <span>

                                {new Date(
                                  submission.submitted_date
                                ).toLocaleTimeString(
                                  [],
                                  {
                                    hour: '2-digit',
                                    minute: '2-digit',
                                  }
                                )}

                              </span>

                            </>

                          ) : (

                            <span>
                              No date
                            </span>

                          )}

                        </div>


                        {/* STATUS */}

                        <div className="submission-status-cell">

                          <span
                            className={`submission-status ${
                              submission.status?.toLowerCase() ||
                              'submitted'
                            }`}
                          >

                            <span className="submission-status-dot"></span>

                            {submission.status ||
                              'Submitted'}

                          </span>

                        </div>


                        {/* SCORE */}

                        <div className="submission-score-cell">

                          {submission.marks_obtained !== null &&
                          submission.marks_obtained !== undefined ? (

                            <>

                              <strong>

                                {submission.marks_obtained}

                              </strong>

                              <span>

                                /{' '}

                                {submissionMaximumMarks}

                              </span>

                            </>

                          ) : (

                            <span className="not-graded">
                              —
                            </span>

                          )}

                        </div>


                        {/* ACTION */}

                        <div className="submission-action-cell">

                          <button
                            className="view-submission-button"
                            onClick={() =>
                              handleViewSubmission(
                                submission
                              )
                            }
                          >

                            View

                            <span>
                              →
                            </span>

                          </button>

                        </div>

                      </article>

                    )
                  }
                )}

              </div>

            </div>

          )}

        </section>

      </main>


      {/* ======================================
          SUBMISSION REVIEW MODAL
      ====================================== */}

      {showSubmission &&
        selectedSubmission && (

          <div
            className="submission-modal-overlay"
            onClick={() => {

              setShowSubmission(false)
              setSelectedSubmission(null)

            }}
          >

            <div
              className="submission-modal"
              onClick={(e) =>
                e.stopPropagation()
              }
            >

              {/* MODAL HEADER */}

              <div className="submission-modal-header">

                <div>

                  <p className="eyebrow">
                    SUBMISSION REVIEW
                  </p>


                  <div className="student-heading">

                    <div className="student-avatar">

                      {selectedSubmission.student_name
                        ?.charAt(0)
                        .toUpperCase()}

                    </div>


                    <div>

                      <h2>
                        {selectedSubmission.student_name}
                      </h2>

                      <p>

                        {selectedSubmission.assignments
                          ?.title ||
                          'Assignment'}

                      </p>

                    </div>

                  </div>

                </div>


                <button
                  className="modal-close-button"
                  onClick={() => {

                    setShowSubmission(false)
                    setSelectedSubmission(null)

                  }}
                >
                  ×
                </button>

              </div>


              {/* SUBMISSION INFORMATION */}

              <div className="submission-info-grid">

                <div className="submission-info-item">

                  <span>
                    Assignment
                  </span>

                  <strong>

                    {selectedSubmission.assignments
                      ?.title ||
                      'Unknown Assignment'}

                  </strong>

                </div>


                <div className="submission-info-item">

                  <span>
                    Subject
                  </span>

                  <strong>

                    {selectedSubmission.assignments
                      ?.subject ||
                      'Unknown Subject'}

                  </strong>

                </div>


                <div className="submission-info-item">

                  <span>
                    Maximum Marks
                  </span>

                  <strong>

                    {selectedSubmission.assignments
                      ?.maximum_marks ||
                      100}

                  </strong>

                </div>


                <div className="submission-info-item">

                  <span>
                    Submitted
                  </span>

                  <strong>

                    {selectedSubmission.submitted_date
                      ? new Date(
                          selectedSubmission.submitted_date
                        ).toLocaleString()
                      : 'No date'}

                  </strong>

                </div>

              </div>


              {/* CURRENT STATUS */}

              <div className="review-status-bar">

                <div>

                  <span className="status-label">
                    STATUS
                  </span>


                  <span
                    className={`review-status ${
                      selectedSubmission.status?.toLowerCase() ||
                      'submitted'
                    }`}
                  >

                    {selectedSubmission.status ===
                    'Graded'
                      ? '✓ Graded'
                      : selectedSubmission.status ===
                          'Processing'
                        ? '🤖 Processing'
                        : '● Awaiting Grade'}

                  </span>

                </div>


                {selectedSubmission.marks_obtained !==
                  null && (

                  <div className="current-score">

                    <span>
                      Score
                    </span>

                    <strong>

                      {selectedSubmission.marks_obtained}

                      {' / '}

                      {selectedSubmission.assignments
                        ?.maximum_marks ||
                        100}

                    </strong>

                  </div>

                )}

              </div>


              {/* STUDENT ANSWER */}

              <div className="answer-section">

                <div className="review-section-heading">

                  <div>

                    <span className="section-number">
                      01
                    </span>

                    <div>

                      <h3>
                        Student Answer
                      </h3>

                      <p>
                        Review the submitted response
                      </p>

                    </div>

                  </div>

                </div>


                <div className="student-answer-box">

                  <p>

                    {selectedSubmission.submission_text ||
                      'No submission text provided.'}

                  </p>

                </div>

              </div>


              {/* GRADING */}

              <div className="grading-section-modern">

                <div className="review-section-heading">

                  <div>

                    <span className="section-number">
                      02
                    </span>

                    <div>

                      <h3>
                        Grade Submission
                      </h3>

                      <p>
                        Provide marks and feedback
                      </p>

                    </div>

                  </div>

                </div>


                <div className="grading-grid">

                  {/* MARKS */}

                  <div className="marks-card">

                    <label>
                      Marks
                    </label>


                    <div className="marks-input-wrapper">

                      <input
                        type="number"
                        min="0"
                        max={
                          selectedSubmission
                            .assignments
                            ?.maximum_marks ||
                          100
                        }
                        value={marks}
                        onChange={(e) =>
                          setMarks(
                            e.target.value
                          )
                        }
                        placeholder="0"
                      />


                      <span>

                        /

                        {' '}

                        {selectedSubmission
                          .assignments
                          ?.maximum_marks ||
                          100}

                      </span>

                    </div>


                    <small>

                      Enter a score between 0 and{' '}

                      {selectedSubmission
                        .assignments
                        ?.maximum_marks ||
                        100}

                    </small>

                  </div>


                  {/* FEEDBACK */}

                  <div className="feedback-card">

                    <label>
                      Teacher Feedback
                    </label>


                    <textarea
                      value={feedback}
                      onChange={(e) =>
                        setFeedback(
                          e.target.value
                        )
                      }
                      placeholder="Write constructive feedback for the student..."
                      rows="4"
                    />

                  </div>

                </div>


                {/* ACTIONS */}

                <div className="grading-actions">

                  <button
                    className="secondary-button"
                    onClick={() => {

                      setShowSubmission(false)
                      setSelectedSubmission(null)

                    }}
                  >
                    Cancel
                  </button>


                  <button
                    className="secondary-button"
                    onClick={handleAIGrade}
                    disabled={
                      grading ||
                      selectedSubmission.status ===
                        'Processing'
                    }
                  >

                    {selectedSubmission.status ===
                    'Processing'
                      ? '🤖 AI Grading...'
                      : '🤖 Grade with AI'}

                  </button>


                  <button
                    className="primary-button save-grade-button"
                    onClick={
                      handleSaveGrade
                    }
                    disabled={grading}
                  >

                    {grading
                      ? 'Saving Grade...'
                      : 'Save Grade ✓'}

                  </button>

                </div>

              </div>

            </div>

          </div>

        )}


      {/* ======================================
          FOOTER
      ====================================== */}

      <footer>

        <p>
          © 2026 EduFlow AI • Teacher Dashboard
        </p>

      </footer>

    </div>
  )
}

export default App