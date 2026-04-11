import { useState } from 'react'
import { useNavigate, Link } from 'react-router-dom'
import { useMutation } from '@tanstack/react-query'
import { authAPI } from '../lib/api'
import useAuthStore from '../store/authStore'
import toast from 'react-hot-toast'
import { Zap, Eye, EyeOff, Heart } from 'lucide-react'

export default function LoginPage() {
  const navigate = useNavigate()
  const { setAuth } = useAuthStore()
  const [form, setForm] = useState({ email: '', password: '' })
  const [showPass, setShowPass] = useState(false)

  const mutation = useMutation({
    mutationFn: (data) => authAPI.login(data),
    onSuccess: (res) => {
      const { token, ...user } = res.data
      setAuth(user, token)
      toast.success(`Welcome back, ${user.fullName}!`)
      navigate('/dashboard')
    },
    onError: (err) => toast.error(err.response?.data?.message || 'Invalid credentials'),
  })

  const handleSubmit = (e) => {
    e.preventDefault()
    mutation.mutate(form)
  }

  return (
    <div className="min-h-screen bg-dark-950 flex flex-col items-center justify-center p-4">

      {/* Background glow */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        <div className="absolute top-1/3 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[500px] h-[500px] bg-primary-600/10 rounded-full blur-3xl" />
        <div className="absolute bottom-1/4 right-1/4 w-64 h-64 bg-primary-800/5 rounded-full blur-2xl" />
      </div>

      <div className="relative w-full max-w-md flex-1 flex flex-col justify-center">

        {/* Logo */}
        <div className="flex items-center gap-3 mb-8 justify-center">
          <div className="w-10 h-10 rounded-xl bg-primary-600 flex items-center justify-center shadow-lg shadow-primary-600/30">
            <Zap size={20} className="text-white" />
          </div>
          <div>
            <p className="font-bold text-dark-50 text-xl leading-none">Amdox</p>
            <p className="text-dark-500 text-xs">Task Management</p>
          </div>
        </div>

        {/* Card */}
        <div className="card p-8 shadow-2xl shadow-black/50">
          <div className="mb-6 text-center">
            <h1 className="text-2xl font-bold text-dark-50">Welcome back</h1>
            <p className="text-dark-400 text-sm mt-1">Sign in to your account</p>
          </div>

          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <label className="label">Email address</label>
              <input
                type="email" required
                className="input"
                placeholder="you@company.com"
                value={form.email}
                onChange={e => setForm(f => ({ ...f, email: e.target.value }))}
              />
            </div>
            <div>
              <label className="label">Password</label>
              <div className="relative">
                <input
                  type={showPass ? 'text' : 'password'} required
                  className="input pr-11"
                  placeholder="••••••••"
                  value={form.password}
                  onChange={e => setForm(f => ({ ...f, password: e.target.value }))}
                />
                <button
                  type="button"
                  onClick={() => setShowPass(v => !v)}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-dark-500 hover:text-dark-300 transition-colors">
                  {showPass ? <EyeOff size={16} /> : <Eye size={16} />}
                </button>
              </div>
            </div>

            <button
              type="submit"
              disabled={mutation.isPending}
              className="btn-primary w-full py-3 mt-2 text-base">
              {mutation.isPending ? 'Signing in...' : 'Sign in'}
            </button>
          </form>

          <p className="text-center text-sm text-dark-500 mt-6">
            Don't have an account?{' '}
            <Link to="/register" className="text-primary-400 hover:text-primary-300 font-medium transition-colors">
              Create one
            </Link>
          </p>
        </div>

      </div>

      {/* Footer */}
      <div className="relative pb-6 pt-4">
        <p className="flex items-center gap-1.5 text-xs text-dark-500">
          Made with
          <Heart
            size={13}
            className="text-red-400 fill-red-400 animate-pulse"
          />
          by
          <span className="text-primary-400 font-medium">Vaibhav Rane</span>
        </p>
      </div>

    </div>
  )
}