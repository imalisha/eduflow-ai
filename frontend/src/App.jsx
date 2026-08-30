import { useEffect, useMemo, useState } from 'react'
import { supabase } from './services/supabase'
import './App.css'

function App() {
  const [showForm, setShowForm] = useState(false)
  const [assignments, setAssignments] = useState([])
  const [submissions, setSubmissions] = useState([])
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

  useEffect(() => {
    fetchAssignments()
    fetchSubmissions()
  }, [])

  async function fetchAssignments() {
    setLoading(true)
    setError('')

    const { data, error } = await supabase
      .from('assignments')
      .select('*')
      .order('created_at', { ascending: false })

    if (error) {
      console.error('Error loading assignments:', error)
      setError(error.message)
      setLoading(false)
      return
    }

    setAssignments(data || [])
    setLoading(false)
  }

  async function fetchSubmissions() {
    setSubmissionsLoading(true)
    setSubmissionsError('')

    const { data, error } = await supabase
      .from('submissions')
      .select(`
        *,
        assignments (
          title,
          subject,
          maximum_marks
        )
      `)
      .order('submitted_date', { ascending: false })

    if (error) {
      console.error('Error loading submissions:', error)
      setSubmissionsError(error.message)
      setSubmissionsLoading(false)
      return
    }

    console.log('Submissions loaded:', data)

    setSubmissions(data || [])
    setSubmissionsLoading(false)
  }

  async function handleSubmit(e) {
    e.preventDefault()

    if (!title.trim() || !subject.trim()) {
      alert('Please enter a title and subject.')
      return
    }

    setSaving(true)

    if (editingId) {
      const { data, error } = await supabase
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
        console.error('Error updating assignment:', error)
        alert('Failed to update assignment: ' + error.message)
      } else {
        setAssignments((current) =>
          current.map((assignment) =>
            assignment.id === editingId ? data[0] : assignment
          )
        )

        alert('Assignment updated successfully! ✏️')
        clearForm()
      }
    } else {
      const { data, error } = await supabase
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
        console.error('Error creating assignment:', error)
        alert('Failed to create assignment: ' + error.message)
      } else {
        setAssignments((current) => [data[0], ...current])

        alert('Assignment created successfully! 🎉')
        clearForm()
      }
    }

    setSaving(false)
  }

  function handleEdit(assignment) {
    setEditingId(assignment.id)
    setTitle(assignment.title || '')
    setSubject(assignment.subject || '')
    setDescription(assignment.description || '')
    setDueDate(assignment.due_date || '')
    setMaximumMarks(assignment.maximum_marks || 100)
    setStatus(assignment.status || 'Draft')
    setShowForm(true)

    // window.scrollTo({
    //   top: 0,
    //   behavior: 'smooth',
    // })
  }

  async function handleDelete(id) {
    const confirmed = window.confirm(
      'Are you sure you want to delete this assignment?'
    )

    if (!confirmed) {
      return
    }

    setDeletingId(id)

    const { error } = await supabase
      .from('assignments')
      .delete()
      .eq('id', id)

    if (error) {
      console.error('Error deleting assignment:', error)
      alert('Failed to delete assignment: ' + error.message)
    } else {
      setAssignments((current) =>
        current.filter((assignment) => assignment.id !== id)
      )

      alert('Assignment deleted successfully! 🗑️')
    }

    setDeletingId(null)
  }

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

  function isUpcoming(assignment) {
    if (!assignment.due_date) return false

    const today = new Date()
    today.setHours(0, 0, 0, 0)

    const due = new Date(assignment.due_date)
    due.setHours(0, 0, 0, 0)

    return due >= today
  }

  function isPast(assignment) {
    if (!assignment.due_date) return false

    const today = new Date()
    today.setHours(0, 0, 0, 0)

    const due = new Date(assignment.due_date)
    due.setHours(0, 0, 0, 0)

    return due < today
  }

  const totalAssignments = assignments.length

  const publishedAssignments = assignments.filter(
    (assignment) => assignment.status === 'Published'
  ).length

  const draftAssignments = assignments.filter(
    (assignment) => assignment.status === 'Draft'
  ).length

  const completedAssignments = assignments.filter(
    (assignment) => assignment.status === 'Completed'
  ).length

  const upcomingAssignments = assignments.filter(isUpcoming).length

  const filteredAssignments = useMemo(() => {
    const search = searchTerm.toLowerCase().trim()

    return assignments.filter((assignment) => {
      const matchesSearch =
        !search ||
        assignment.title?.toLowerCase().includes(search) ||
        assignment.subject?.toLowerCase().includes(search) ||
        assignment.description?.toLowerCase().includes(search)

      let matchesFilter = true

      if (filter === 'upcoming') {
        matchesFilter = isUpcoming(assignment)
      }

      if (filter === 'past') {
        matchesFilter = isPast(assignment)
      }

      return matchesSearch && matchesFilter
    })
  }, [assignments, searchTerm, filter])

  function handleViewSubmission(submission) {
    setSelectedSubmission(submission)

    setMarks(
      submission.marks_obtained !== null
        ? submission.marks_obtained
        : ''
    )

    setFeedback(submission.feedback || '')

    setShowSubmission(true)

    window.scrollTo({
      top: 0,
      behavior: 'smooth',
    })
  }
  async function handleSaveGrade() {
    if (!selectedSubmission) {
      return
    }

    const maximumMarks =
      selectedSubmission.assignments?.maximum_marks || 100

    const numericMarks = Number(marks)

    if (marks === '' || Number.isNaN(numericMarks)) {
      alert('Please enter marks.')
      return
    }

    if (numericMarks < 0 || numericMarks > maximumMarks) {
      alert(`Marks must be between 0 and ${maximumMarks}.`)
      return
    }

    setGrading(true)

    const { data, error } = await supabase
      .from('submissions')
      .update({
        marks_obtained: numericMarks,
        feedback: feedback.trim(),
        status: 'Graded',
      })
      .eq('id', selectedSubmission.id)
      .select('*')

    if (error) {
      console.error('Error saving grade:', error)
      alert('Failed to save grade: ' + error.message)
      setGrading(false)
      return
    }

    const updatedSubmission = {
      ...selectedSubmission,
      ...data[0],
    }

    setSelectedSubmission(updatedSubmission)

    setSubmissions((current) =>
      current.map((submission) =>
        submission.id === updatedSubmission.id
          ? {
              ...submission,
              ...data[0],
            }
          : submission
      )
    )

    alert('Grade saved successfully! ✅')

    setGrading(false)
  }

  return (
    <div className="app">
      <header className="topbar">
        <div className="brand">
          <div className="brand-icon">E</div>

          <div>
            <h1>EduFlow AI</h1>
            <span>Education Management Platform</span>
          </div>
        </div>

        <div className="dashboard-label">
          <span className="status-dot"></span>
          Teacher Dashboard
        </div>
      </header>

      <main className="container">
        <section className="welcome-section">
          <div>
            <p className="eyebrow">TEACHER PORTAL</p>

            <h2>Welcome back, Teacher 👋</h2>

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
            <span>{showForm ? '×' : '+'}</span>

            {showForm ? 'Cancel' : 'Create Assignment'}
          </button>
        </section>

        {/* Statistics */}

        <section className="stats-grid">
          <div className="stat-card">
            <div className="stat-icon">📚</div>

            <div>
              <p>Total Assignments</p>
              <h3>{totalAssignments}</h3>
            </div>
          </div>

          <div className="stat-card">
            <div className="stat-icon">🚀</div>

            <div>
              <p>Published</p>
              <h3>{publishedAssignments}</h3>
            </div>
          </div>

          <div className="stat-card">
            <div className="stat-icon">📝</div>

            <div>
              <p>Drafts</p>
              <h3>{draftAssignments}</h3>
            </div>
          </div>

          <div className="stat-card">
            <div className="stat-icon">📅</div>

            <div>
              <p>Upcoming</p>
              <h3>{upcomingAssignments}</h3>
            </div>
          </div>

          <div className="stat-card">
            <div className="stat-icon">✅</div>

            <div>
              <p>Completed</p>
              <h3>{completedAssignments}</h3>
            </div>
          </div>
        </section>

        {/* Create / Edit Form */}

        {showForm && (
          <section className="form-card">
            <div className="form-header">
              <div>
                <p className="eyebrow">
                  {editingId ? 'UPDATE' : 'NEW ASSIGNMENT'}
                </p>

                <h2>
                  {editingId ? 'Edit Assignment' : 'Create Assignment'}
                </h2>
              </div>

              <button className="close-button" onClick={clearForm}>
                ×
              </button>
            </div>

            <form onSubmit={handleSubmit}>
              <div className="form-grid">
                <div className="form-group">
                  <label>Assignment Title *</label>

                  <input
                    type="text"
                    value={title}
                    onChange={(e) => setTitle(e.target.value)}
                    placeholder="Introduction to Python"
                  />
                </div>

                <div className="form-group">
                  <label>Subject *</label>

                  <input
                    type="text"
                    value={subject}
                    onChange={(e) => setSubject(e.target.value)}
                    placeholder="Programming"
                  />
                </div>

                <div className="form-group full-width">
                  <label>Description</label>

                  <textarea
                    value={description}
                    onChange={(e) => setDescription(e.target.value)}
                    placeholder="Explain variables, data types, and conditional statements."
                    rows="5"
                  />
                </div>

                <div className="form-group">
                  <label>Due Date</label>

                  <input
                    type="date"
                    value={dueDate}
                    onChange={(e) => setDueDate(e.target.value)}
                  />
                </div>
                <div className="form-group">
                  <label>Maximum Marks</label>

                  <input
                    type="number"
                    min="1"
                    value={maximumMarks}
                    onChange={(e) => setMaximumMarks(e.target.value)}
                  />
                </div>

                <div className="form-group">
                  <label>Status</label>

                  <select
                    value={status}
                    onChange={(e) => setStatus(e.target.value)}
                  >
                    <option value="Draft">Draft</option>
                    <option value="Published">Published</option>
                    <option value="Completed">Completed</option>
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

        {/* Assignment Section */}

        <section className="assignments-section">
          <div className="section-header">
            <div>
              <p className="eyebrow">YOUR WORK</p>
              <h2>Recent Assignments</h2>
            </div>

            <span className="assignment-count">
              {filteredAssignments.length}{' '}
              {filteredAssignments.length === 1
                ? 'Assignment'
                : 'Assignments'}
            </span>
          </div>

          {/* Search and Filters */}

          <div className="assignment-tools">
            <div className="search-box">
              <span>🔍</span>

              <input
                type="text"
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                placeholder="Search assignments..."
              />

              {searchTerm && (
                <button
                  className="clear-search"
                  onClick={() => setSearchTerm('')}
                >
                  ×
                </button>
              )}
            </div>

            <div className="filter-buttons">
              <button
                className={filter === 'all' ? 'active-filter' : ''}
                onClick={() => setFilter('all')}
              >
                All
              </button>

              <button
                className={filter === 'upcoming' ? 'active-filter' : ''}
                onClick={() => setFilter('upcoming')}
              >
                Upcoming
              </button>

              <button
                className={filter === 'past' ? 'active-filter' : ''}
                onClick={() => setFilter('past')}
              >
                Past
              </button>
            </div>
          </div>

          {/* Loading */}

          {loading ? (
            <div className="state-card">
              <div className="loading-spinner"></div>

              <h3>Loading assignments...</h3>

              <p>Please wait while we load your assignments.</p>
            </div>
          ) : error ? (
            /* Error */

            <div className="state-card error-state">
              <div className="state-icon">⚠️</div>

              <h3>Unable to load assignments</h3>

              <p>{error}</p>

              <button className="primary-button" onClick={fetchAssignments}>
                🔄 Try Again
              </button>
            </div>
          ) : filteredAssignments.length === 0 ? (
            /* No Results */

            <div className="empty-state">
              <div className="empty-icon">
                {searchTerm || filter !== 'all' ? '🔍' : '📚'}
              </div>

              <h3>
                {searchTerm || filter !== 'all'
                  ? 'No matching assignments'
                  : 'No assignments yet'}
              </h3>

              <p>
                {searchTerm || filter !== 'all'
                  ? 'Try changing your search or filter.'
                  : 'Create your first assignment to get started.'}
              </p>

              {!searchTerm && filter === 'all' && (
                <button
                  className="primary-button"
                  onClick={() => setShowForm(true)}
                >
                  + Create Assignment
                </button>
              )}
            </div>
          ) : (
            <div className="assignment-list">
              {filteredAssignments.map((assignment) => (
                <article
                  className="assignment-card"
                  key={assignment.id}
                >
                  <div className="assignment-main">
                    <div className="assignment-icon">📝</div>

                    <div className="assignment-content">
                      <div className="title-row">
                        <h3>{assignment.title}</h3>

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
                              isUpcoming(assignment)
                                ? 'date-status upcoming'
                                : 'date-status past'
                            }
                          >
                            {isUpcoming(assignment)
                              ? 'Upcoming'
                              : 'Past Due'}
                          </span>
                        )}
                        <span>
                          🎯 {assignment.maximum_marks || 100} Marks
                        </span>

                        <span className={`status-badge ${assignment.status?.toLowerCase()}`}>
                          {assignment.status || 'Draft'}
                        </span>
                      </div>
                    </div>
                  </div>

                  <div className="assignment-actions">
                    <button
                      className="edit-button"
                      onClick={() => handleEdit(assignment)}
                    >
                      Edit
                    </button>

                    <button
                      className="delete-button"
                      onClick={() => handleDelete(assignment.id)}
                      disabled={deletingId === assignment.id}
                    >
                      {deletingId === assignment.id
                        ? 'Deleting...'
                        : 'Delete'}
                    </button>
                  </div>
                </article>
              ))}
            </div>
          )}
        </section>
      </main>
      {showSubmission && selectedSubmission && (
  <div
    className="submission-modal-overlay"
    onClick={() => {
      setShowSubmission(false)
      setSelectedSubmission(null)
    }}
  >
    <div
      className="submission-modal"
      onClick={(e) => e.stopPropagation()}
    >
      {/* Modal Header */}

      <div className="submission-modal-header">
        <div>
          <p className="eyebrow">SUBMISSION REVIEW</p>

          <div className="student-heading">
            <div className="student-avatar">
              {selectedSubmission.student_name
                ?.charAt(0)
                .toUpperCase()}
            </div>

            <div>
              <h2>{selectedSubmission.student_name}</h2>

              <p>
                {selectedSubmission.assignments?.title ||
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

      {/* Submission Information */}

      <div className="submission-info-grid">

        <div className="submission-info-item">
          <span>Assignment</span>
          <strong>
            {selectedSubmission.assignments?.title ||
              'Unknown Assignment'}
          </strong>
        </div>

        <div className="submission-info-item">
          <span>Subject</span>
          <strong>
            {selectedSubmission.assignments?.subject ||
              'Unknown Subject'}
          </strong>
        </div>

        <div className="submission-info-item">
          <span>Maximum Marks</span>
          <strong>
            {selectedSubmission.assignments?.maximum_marks || 100}
          </strong>
        </div>

        <div className="submission-info-item">
          <span>Submitted</span>
          <strong>
            {selectedSubmission.submitted_date
              ? new Date(
                  selectedSubmission.submitted_date
                ).toLocaleString()
              : 'No date'}
          </strong>
        </div>

      </div>

      {/* Current Status */}

      <div className="review-status-bar">
        <div>
          <span className="status-label">STATUS</span>

          <span
            className={`review-status ${
              selectedSubmission.marks_obtained !== null
                ? 'graded'
                : 'pending'
            }`}
          >
            {selectedSubmission.marks_obtained !== null
              ? '✓ Graded'
              : '● Awaiting Grade'}
          </span>
        </div>

        {selectedSubmission.marks_obtained !== null && (
          <div className="current-score">
            <span>Score</span>

            <strong>
              {selectedSubmission.marks_obtained}
              {' / '}
              {selectedSubmission.assignments?.maximum_marks || 100}
            </strong>
          </div>
        )}
      </div>

      {/* Student Answer */}

      <div className="answer-section">

        <div className="review-section-heading">
          <div>
            <span className="section-number">01</span>

            <div>
              <h3>Student Answer</h3>
              <p>Review the submitted response</p>
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

      {/* Grading */}

      <div className="grading-section-modern">

        <div className="review-section-heading">
          <div>
            <span className="section-number">02</span>

            <div>
              <h3>Grade Submission</h3>
              <p>Provide marks and feedback</p>
            </div>
          </div>
        </div>

        <div className="grading-grid">

          <div className="marks-card">

            <label>
              Marks
            </label>

            <div className="marks-input-wrapper">

              <input
                type="number"
                min="0"
                max={
                  selectedSubmission.assignments
                    ?.maximum_marks || 100
                }
                value={marks}
                onChange={(e) => setMarks(e.target.value)}
                placeholder="0"
              />

              <span>
                /
                {' '}
                {selectedSubmission.assignments
                  ?.maximum_marks || 100}
              </span>

            </div>

            <small>
              Enter a score between 0 and{' '}
              {selectedSubmission.assignments
                ?.maximum_marks || 100}
            </small>

          </div>

          <div className="feedback-card">

            <label>
              Teacher Feedback
            </label>

            <textarea
              value={feedback}
              onChange={(e) => setFeedback(e.target.value)}
              placeholder="Write constructive feedback for the student..."
              rows="4"
            />

          </div>

        </div>

        {/* Actions */}

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
            className="primary-button save-grade-button"
            onClick={handleSaveGrade}
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
      <section className="submissions-section">
        <div className="section-header">
          <div>
            <p className="eyebrow">STUDENT WORK</p>
            <h2>Student Submissions</h2>
          </div>

          <span className="assignment-count">
            {submissions.length}{' '}
            {submissions.length === 1 ? 'Submission' : 'Submissions'}
          </span>
        </div>

        {submissionsLoading ? (
          <div className="state-card">
            <div className="loading-spinner"></div>
            <h3>Loading submissions...</h3>
            <p>Please wait while we load student submissions.</p>
          </div>
        ) : submissionsError ? (
          <div className="state-card error-state">
            <div className="state-icon">⚠️</div>
            <h3>Unable to load submissions</h3>
            <p>{submissionsError}</p>

            <button
              className="primary-button"
              onClick={fetchSubmissions}
            >
              🔄 Try Again
            </button>
          </div>
        ) : submissions.length === 0 ? (
          <div className="empty-state">
            <div className="empty-icon">📨</div>
            <h3>No submissions yet</h3>
            <p>Student submissions will appear here.</p>
          </div>
        ) : (
          <div className="submission-list">
            {submissions.map((submission) => (
              <article
                className="submission-card"
                key={submission.id}
              >
                <div className="submission-main">
                  <div className="submission-icon">👨‍🎓</div>

                  <div className="submission-content">
                    <div className="title-row">
                      <h3>{submission.student_name}</h3>

                      <span className="subject-badge">
                        {submission.assignments?.subject || 'Unknown Subject'}
                      </span>
                    </div>

                    <p className="submission-assignment">
                      📝 {submission.assignments?.title || 'Unknown Assignment'}
                    </p>

                    <p className="submission-text">
                      {submission.submission_text || 'No submission text.'}
                    </p>

                    <div className="submission-meta">
                      <span>
                        📅 {submission.submitted_date
                          ? new Date(submission.submitted_date).toLocaleDateString()
                          : 'No date'}
                      </span>

                      <span>
                        🎯{' '}
                        {submission.marks_obtained !== null
                          ? `${submission.marks_obtained} / ${submission.assignments?.maximum_marks || 100}`
                          : 'Not Graded'}
                      </span>

                      <span className="status-badge submitted">
                        {submission.status || 'Submitted'}
                      </span>
                    </div>
                  </div>
                </div>

                <div className="submission-actions">
                  <button
                    className="view-submission-button"
                    onClick={() => handleViewSubmission(submission)}
                  >
                    View Submission →
                  </button>
                </div>
              </article>
            ))}
          </div>
        )}
      </section>

      <footer>
        <p>© 2026 EduFlow AI • Teacher Dashboard</p>
      </footer>
    </div>
  )
}

export default App