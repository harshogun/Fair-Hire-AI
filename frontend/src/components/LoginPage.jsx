import React, { useState } from "react"
import { ShieldCheck, Lock, Mail, Eye, EyeOff, Loader2, AlertCircle, ArrowRight, CheckCircle2 } from "lucide-react"
import { Button } from "./ui/button"
import { loginRecruiter } from "../services/api"

export function LoginPage({ onLoginSuccess, onNavigatePublic }) {
  const [email, setEmail] = useState("")
  const [password, setPassword] = useState("")
  const [showPassword, setShowPassword] = useState(false)
  const [isLoading, setIsLoading] = useState(false)
  const [errorMessage, setErrorMessage] = useState(null)

  const handleSubmit = async (e) => {
    e.preventDefault()
    if (!email.trim() || !password) {
      setErrorMessage("Please enter both email and password.")
      return
    }

    setIsLoading(true)
    setErrorMessage(null)

    try {
      const data = await loginRecruiter(email, password)
      if (onLoginSuccess) {
        onLoginSuccess(data)
      }
    } catch (err) {
      const msg = err.message || "Failed to authenticate."
      if (msg.includes("401") || msg.toLowerCase().includes("invalid")) {
        setErrorMessage("Invalid email or password. Please verify your recruiter credentials.")
      } else if (msg.toLowerCase().includes("failed to fetch") || msg.toLowerCase().includes("connect")) {
        setErrorMessage("Authentication service is temporarily unreachable. Please check your connection and try again.")
      } else {
        setErrorMessage(msg)
      }
    } finally {
      setIsLoading(false)
    }
  }

  return (
    <div className="min-h-[calc(100vh-8rem)] flex items-center justify-center px-4 py-12">
      <div className="w-full max-w-md space-y-6">
        
        {/* Header / Brand Logo */}
        <div className="text-center space-y-3">
          <div className="inline-flex items-center justify-center w-14 h-14 rounded-2xl bg-gradient-to-tr from-indigo-600 to-indigo-500 text-white shadow-lg shadow-indigo-500/25 ring-4 ring-indigo-500/10">
            <ShieldCheck className="w-8 h-8" />
          </div>

          <div className="space-y-1">
            <div className="flex items-center justify-center gap-2">
              <h1 className="text-2xl font-bold tracking-tight text-slate-900 dark:text-white font-heading">
                FairHire AI
              </h1>
              <span className="text-[10px] font-mono font-bold bg-indigo-50 dark:bg-indigo-950/60 text-indigo-600 dark:text-indigo-400 border border-indigo-200 dark:border-indigo-800 px-2 py-0.5 rounded-md">
                Recruiter Portal
              </span>
            </div>
            <p className="text-xs font-medium text-indigo-600 dark:text-indigo-400 tracking-wide uppercase">
              Algorithmic Fairness in Resume Screening & Talent Acquisition
            </p>
            <p className="text-xs text-slate-500 dark:text-slate-400 max-w-sm mx-auto pt-1">
              Sign in with your department credentials to manage requisitions, evaluate candidate pools, and run deterministic matching.
            </p>
          </div>
        </div>

        {/* Login Card */}
        <div className="bg-white dark:bg-slate-900/90 rounded-2xl border border-slate-200 dark:border-white/10 shadow-xl shadow-slate-200/50 dark:shadow-black/40 p-7 backdrop-blur-xl">
          <form onSubmit={handleSubmit} className="space-y-5">
            
            {/* Error Notification Banner */}
            {errorMessage && (
              <div 
                id="login-error-alert"
                className="p-3.5 rounded-xl bg-rose-50 dark:bg-rose-950/50 border border-rose-200 dark:border-rose-900/60 text-rose-700 dark:text-rose-300 text-xs flex items-start gap-2.5 animate-in fade-in duration-150"
              >
                <AlertCircle className="w-4 h-4 shrink-0 text-rose-500 mt-0.5" />
                <div className="flex-1 font-medium">{errorMessage}</div>
              </div>
            )}

            {/* Email Field */}
            <div className="space-y-1.5">
              <label 
                htmlFor="recruiter-email"
                className="block text-xs font-semibold text-slate-700 dark:text-slate-300"
              >
                Recruiter Work Email
              </label>
              <div className="relative">
                <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-slate-400 dark:text-slate-500">
                  <Mail className="w-4 h-4" />
                </div>
                <input
                  id="recruiter-email"
                  type="email"
                  value={email}
                  onChange={(e) => {
                    setEmail(e.target.value)
                    if (errorMessage) setErrorMessage(null)
                  }}
                  placeholder="recruiter@fairhire.ai"
                  required
                  autoComplete="username"
                  className="w-full pl-10 pr-4 py-2.5 rounded-xl border border-slate-200 dark:border-white/10 bg-slate-50/50 dark:bg-slate-950/50 text-slate-900 dark:text-white placeholder:text-slate-400 dark:placeholder:text-slate-600 text-xs focus:outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-600 dark:focus:border-indigo-500 transition-all font-mono"
                />
              </div>
            </div>

            {/* Password Field */}
            <div className="space-y-1.5">
              <div className="flex items-center justify-between">
                <label 
                  htmlFor="recruiter-password"
                  className="block text-xs font-semibold text-slate-700 dark:text-slate-300"
                >
                  Password
                </label>
              </div>
              <div className="relative">
                <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-slate-400 dark:text-slate-500">
                  <Lock className="w-4 h-4" />
                </div>
                <input
                  id="recruiter-password"
                  type={showPassword ? "text" : "password"}
                  value={password}
                  onChange={(e) => {
                    setPassword(e.target.value)
                    if (errorMessage) setErrorMessage(null)
                  }}
                  placeholder="••••••••••••"
                  required
                  autoComplete="current-password"
                  className="w-full pl-10 pr-11 py-2.5 rounded-xl border border-slate-200 dark:border-white/10 bg-slate-50/50 dark:bg-slate-950/50 text-slate-900 dark:text-white placeholder:text-slate-400 dark:placeholder:text-slate-600 text-xs focus:outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-600 dark:focus:border-indigo-500 transition-all font-mono"
                />
                <button
                  type="button"
                  id="toggle-password-visibility"
                  onClick={() => setShowPassword(prev => !prev)}
                  className="absolute inset-y-0 right-0 pr-3.5 flex items-center text-slate-400 hover:text-slate-600 dark:text-slate-500 dark:hover:text-slate-300 transition-colors cursor-pointer"
                  title={showPassword ? "Hide password" : "Show password"}
                  aria-label={showPassword ? "Hide password" : "Show password"}
                >
                  {showPassword ? (
                    <EyeOff className="w-4 h-4" />
                  ) : (
                    <Eye className="w-4 h-4" />
                  )}
                </button>
              </div>
            </div>

            {/* Demo Presentation Guidance Note */}
            <div className="p-3 rounded-xl bg-slate-50 dark:bg-white/[0.02] border border-slate-200 dark:border-white/[0.06] text-[11px] text-slate-600 dark:text-slate-400 space-y-1">
              <div className="flex items-center gap-1.5 font-semibold text-slate-700 dark:text-slate-300">
                <CheckCircle2 className="w-3.5 h-3.5 text-indigo-500 shrink-0" />
                <span>Demo Authentication</span>
              </div>
              <p className="text-[10px] leading-relaxed text-slate-500 dark:text-slate-400">
                Sign in using your authorized recruiter account (e.g. <span className="font-mono text-indigo-600 dark:text-indigo-400">recruiter@fairhire.ai</span>). Passwords are never displayed publicly.
              </p>
            </div>

            {/* Submit CTA */}
            <Button
              type="submit"
              id="submit-login-button"
              disabled={isLoading || !email.trim() || !password}
              className="w-full h-11 rounded-xl text-xs font-semibold flex items-center justify-center gap-2 shadow-md shadow-indigo-600/20"
            >
              {isLoading ? (
                <>
                  <Loader2 className="w-4 h-4 animate-spin text-white" />
                  <span>Authenticating Session...</span>
                </>
              ) : (
                <>
                  <span>Sign In to Recruiter Workspace</span>
                  <ArrowRight className="w-4 h-4" />
                </>
              )}
            </Button>
          </form>

          {/* Quick link to Candidate Portal or public view */}
          {onNavigatePublic && (
            <div className="mt-5 pt-4 border-t border-slate-100 dark:border-white/[0.06] text-center">
              <button
                type="button"
                onClick={() => onNavigatePublic("candidate")}
                className="text-[11px] font-medium text-slate-500 hover:text-indigo-600 dark:text-slate-400 dark:hover:text-indigo-400 transition-colors"
              >
                Candidate self-screening? Go to Candidate Portal →
              </button>
            </div>
          )}
        </div>

        {/* Security Feature Pillars */}
        <div className="grid grid-cols-3 gap-2 text-center pt-2">
          <div className="p-2 rounded-xl bg-slate-100/60 dark:bg-white/[0.02] border border-slate-200/60 dark:border-white/[0.05]">
            <div className="text-[10px] font-bold text-slate-700 dark:text-slate-300">JWT Bearer</div>
            <div className="text-[9px] text-slate-400 dark:text-slate-500">Stateless Auth</div>
          </div>
          <div className="p-2 rounded-xl bg-slate-100/60 dark:bg-white/[0.02] border border-slate-200/60 dark:border-white/[0.05]">
            <div className="text-[10px] font-bold text-slate-700 dark:text-slate-300">Dept Isolation</div>
            <div className="text-[9px] text-slate-400 dark:text-slate-500">Fail-Closed Boundary</div>
          </div>
          <div className="p-2 rounded-xl bg-slate-100/60 dark:bg-white/[0.02] border border-slate-200/60 dark:border-white/[0.05]">
            <div className="text-[10px] font-bold text-slate-700 dark:text-slate-300">Phase 4 Engine</div>
            <div className="text-[9px] text-slate-400 dark:text-slate-500">Deterministic Match</div>
          </div>
        </div>

      </div>
    </div>
  )
}
