import { useState } from 'react'
import { Link, useNavigate, useLocation, Navigate } from 'react-router-dom'
import { useAuth } from '../../context/AuthContext'
import { ROLE_HOME } from '../../components/layout/ProtectedRoute'
import Button from '../../components/ui/Button'
import Input from '../../components/ui/Input'
import Alert from '../../components/ui/Alert'

export default function Login() {
  const { login, isAuthenticated, user } = useAuth()
  const navigate = useNavigate()
  const location = useLocation()

  const [form, setForm] = useState({ email: '', password: '' })
  const [errors, setErrors] = useState({})
  const [apiError, setApiError] = useState('')
  const [loading, setLoading] = useState(false)

  // If already logged in, redirect to their dashboard
  if (isAuthenticated && user) {
    return <Navigate to={ROLE_HOME[user.role]} replace />
  }

  const validate = () => {
    const errs = {}
    if (!form.email.trim()) errs.email = 'Email is required'
    if (!form.password) errs.password = 'Password is required'
    return errs
  }

  const handleChange = (e) => {
    setForm({ ...form, [e.target.name]: e.target.value })
    if (errors[e.target.name]) setErrors({ ...errors, [e.target.name]: '' })
    setApiError('')
  }

  const handleSubmit = async (e) => {
    e.preventDefault()
    const errs = validate()
    if (Object.keys(errs).length > 0) return setErrors(errs)

    setLoading(true)
    try {
      const loggedInUser = await login(form.email, form.password)
      // Go back to where they were trying to go, or their dashboard
      const from = location.state?.from?.pathname || ROLE_HOME[loggedInUser.role]
      navigate(from, { replace: true })
    } catch (err) {
      setApiError(err.response?.data?.message || 'Login failed. Check your credentials.')
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="min-h-screen bg-gray-50 flex items-center justify-center px-4 py-12">
      <div className="w-full max-w-md">

        <div className="text-center mb-8">
          <div className="w-12 h-12 bg-blue-600 rounded-xl flex items-center justify-center mx-auto mb-4">
            <span className="text-white font-bold text-xl">T</span>
          </div>
          <h1 className="text-2xl font-bold text-gray-900">Welcome back</h1>
          <p className="text-gray-500 text-sm mt-1">Sign in to your Teyzix account</p>
        </div>

        <div className="bg-white rounded-2xl shadow-sm border border-gray-200 p-8">

          <Alert type="error" message={apiError} />

          <form onSubmit={handleSubmit} className="space-y-4 mt-2">
            <Input
              label="Email Address"
              name="email"
              type="email"
              placeholder="you@example.com"
              value={form.email}
              onChange={handleChange}
              error={errors.email}
              autoComplete="email"
            />
            <Input
              label="Password"
              name="password"
              type="password"
              placeholder="Your password"
              value={form.password}
              onChange={handleChange}
              error={errors.password}
              autoComplete="current-password"
            />

            <Button type="submit" className="w-full mt-2" size="lg" loading={loading}>
              Sign In
            </Button>
          </form>

          {/* Quick test logins — remove before submission */}
          <div className="mt-6 p-3 bg-gray-50 rounded-lg border border-dashed border-gray-300">
            <p className="text-xs text-gray-500 font-medium mb-2">Dev shortcuts:</p>
            <div className="flex flex-col gap-1">
              {[
                { role: 'Customer', email: 'adaeze@test.com' },
                { role: 'Provider', email: 'emeka@test.com' },
              ].map(({ role, email }) => (
                <button
                  key={role}
                  type="button"
                  onClick={() => setForm({ email, password: 'password123' })}
                  className="text-xs text-left text-blue-600 hover:underline"
                >
                  Fill {role} credentials
                </button>
              ))}
            </div>
          </div>

          <p className="text-center text-sm text-gray-500 mt-6">
            Don't have an account?{' '}
            <Link to="/register" className="text-blue-600 font-medium hover:underline">
              Sign up
            </Link>
          </p>
        </div>
      </div>
    </div>
  )
}   