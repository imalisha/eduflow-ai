import { useEffect, useState } from 'react'
import { supabase } from './services/supabase'
import './App.css'

function App() {
  const [showForm, setShowForm] = useState(false)
  const [assignments, setAssignments] = useState([])

  const [title, setTitle] = useState('')
  const [subject, setSubject] = useState('')
  const [description, setDescription] = useState('')
  const [dueDate, setDueDate] = useState('')

  const [loading, setLoading] = useState(false)
  const [deletingId, setDeletingId] = useState(null)
  const [editingId, setEditingId] = useState(null)

  useEffect(() => {
    fetchAssignments()
  }, [])

  async function fetchAssignments() {
    const { data, error } = await supabase
      .from('assignments')
      .select('*')
      .order('created_at', { ascending: false })

    if (error) {
      console.error('Error loading assignments:', error)
      alert('Failed to load assignments: ' + error.message)
      return
    }

    setAssignments(data || [])
  }

  async function handleSubmit(e) {
    e.preventDefault()

    if (!title.trim() || !subject.trim()) {
      alert('Please enter a title and subject.')
      return
    }

    setLoading(true)

    if (editingId) {
      const { data, error } = await supabase
        .from('assignments')
        .update({
          title: title.trim(),
          subject: subject.trim(),
          description: description.trim(),
          due_date: dueDate || null,
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

    setLoading(false)
  }

  function handleEdit(assignment) {
    setEditingId(assignment.id)
    setTitle(assignment.title || '')
    setSubject(assignment.subject || '')
    setDescription(assignment.description || '')
    setDueDate(assignment.due_date || '')
    setShowForm(true)

    window.scrollTo({
      top: 0,
      behavior: 'smooth',
    })
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
    setEditingId(null)
    setShowForm(false)
  }

  const totalAssignments = assignments.length

  const upcomingAssignments = assignments.filter((assignment) => {
    if (!assignment.due_date) return false

    const today = new Date()
    today.setHours(0, 0, 0, 0)

    const due = new Date(assignment.due_date)
    due.setHours(0, 0, 0, 0)

    return due >= today
  }).length

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

        <section className="stats-grid">
          <div className="stat-card">
            <div className="stat-icon">📚</div>
            <div>
              <p>Total Assignments</p>
              <h3>{totalAssignments}</h3>
            </div>
          </div>

          <div className="stat-card">
            <div className="stat-icon">📅</div>
            <div>
              <p>Upcoming Assignments</p>
              <h3>{upcomingAssignments}</h3>
            </div>
          </div>
        </section>

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
                  disabled={loading}
                >
                  {loading
                    ? 'Saving...'
                    : editingId
                      ? 'Update Assignment'
                      : 'Save Assignment'}
                </button>
              </div>
            </form>
          </section>
        )}

        <section className="assignments-section">
          <div className="section-header">
            <div>
              <p className="eyebrow">YOUR WORK</p>
              <h2>Recent Assignments</h2>
            </div>

            <span className="assignment-count">
              {totalAssignments}{' '}
              {totalAssignments === 1 ? 'Assignment' : 'Assignments'}
            </span>
          </div>

          {assignments.length === 0 ? (
            <div className="empty-state">
              <div className="empty-icon">📚</div>
              <h3>No assignments yet</h3>
              <p>Create your first assignment to get started.</p>

              <button
                className="primary-button"
                onClick={() => setShowForm(true)}
              >
                + Create Assignment
              </button>
            </div>
          ) : (
            <div className="assignment-list">
              {assignments.map((assignment) => (
                <article className="assignment-card" key={assignment.id}>
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
                        {assignment.description || 'No description provided.'}
                      </p>

                      <div className="assignment-meta">
                        <span>
                          📅{' '}
                          {assignment.due_date
                            ? `Due: ${assignment.due_date}`
                            : 'No due date'}
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

      <footer>
        <p>© 2026 EduFlow AI • Teacher Dashboard</p>
      </footer>
    </div>
  )
}

export default App