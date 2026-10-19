import React, { useState, useEffect } from "react"
import { Navbar } from "./components/Navbar"
import { LandingPage } from "./components/LandingPage"
import { ScreeningStudio } from "./components/ScreeningStudio"
import { ResultsDashboard } from "./components/ResultsDashboard"
import { AuditHistory } from "./components/AuditHistory"
import { RecruiterDashboard } from "./components/RecruiterDashboard"
import { CandidatePortal } from "./components/CandidatePortal"
import { ResearchAdminPortal } from "./components/ResearchAdminPortal"
import { SystemArchitectureViewer } from "./components/SystemArchitectureViewer"
import { LoginPage } from "./components/LoginPage"
import { NotFoundPage } from "./components/NotFoundPage"
import { Footer } from "./components/Footer"
import { getAuthToken, getStoredUser, logoutRecruiter } from "./services/api"

class ErrorBoundary extends React.Component {
  constructor(props) {
    super(props)
    this.state = { hasError: false, error: null }
  }
  static getDerivedStateFromError(error) {
    return { hasError: true, error }
  }
  componentDidCatch(error, errorInfo) {
    console.error("ErrorBoundary caught an error:", error, errorInfo)
  }
  render() {
    if (this.state.hasError) {
      return (
        <div className="max-w-xl mx-auto py-24 px-4 text-center space-y-4">
          <div className="w-12 h-12 rounded-xl bg-rose-500/10 text-rose-500 flex items-center justify-center mx-auto text-xl font-bold">
            !
          </div>
          <h2 className="text-xl font-bold text-slate-900 dark:text-white">Something went wrong</h2>
          <p className="text-sm text-slate-600 dark:text-slate-400">
            {this.state.error?.message || "An unexpected rendering error occurred."}
          </p>
          <button
            onClick={() => {
              this.setState({ hasError: false, error: null })
              window.location.reload()
            }}
            className="px-4 py-2 rounded-xl bg-indigo-600 text-white text-xs font-semibold hover:bg-indigo-500 transition-colors shadow-sm cursor-pointer"
          >
            Reload Application
          </button>
        </div>
      )
    }
    return this.props.children
  }
}

import { parseRoute, isProtectedRoute } from "./utils/router.js"

export function App() {
  const [isAuthenticated, setIsAuthenticated] = useState(() => !!getAuthToken())
  const [currentUser, setCurrentUser] = useState(() => getStoredUser())
  const [currentPath, setCurrentPath] = useState(() => {
    return typeof window !== "undefined" ? window.location.pathname : "/candidate"
  })
  const [currentRunId, setCurrentRunId] = useState(null)
  const [prefilledSampleIndex, setPrefilledSampleIndex] = useState(null)

  // Listen to browser Back/Forward (popstate)
  useEffect(() => {
    const onPopState = () => {
      setCurrentPath(window.location.pathname)
    }
    window.addEventListener("popstate", onPopState)
    return () => window.removeEventListener("popstate", onPopState)
  }, [])

  // Sync auth state on storage changes or custom events
  useEffect(() => {
    const handleAuthChange = () => {
      const token = getAuthToken()
      const user = getStoredUser()
      const authed = !!token
      setIsAuthenticated(authed)
      setCurrentUser(user)
      if (!authed) {
        navigate("/login", { replace: true })
      }
    }
    window.addEventListener("fairhire_auth_state_changed", handleAuthChange)
    return () => window.removeEventListener("fairhire_auth_state_changed", handleAuthChange)
  }, [])

  // Theme Management
  const [theme, setTheme] = useState(() => {
    return localStorage.getItem("fairhire_theme") || "light"
  })

  useEffect(() => {
    const root = document.documentElement
    if (theme === "dark") {
      root.classList.add("dark")
    } else {
      root.classList.remove("dark")
    }
    localStorage.setItem("fairhire_theme", theme)
  }, [theme])

  const toggleTheme = () => {
    setTheme(prev => prev === "dark" ? "light" : "dark")
  }

  // HTML5 History router navigation
  const navigate = (to, { replace = false } = {}) => {
    let target = to
    // Legacy view string translation
    if (to === "login") target = "/login"
    else if (to === "candidate") target = "/candidate"
    else if (to === "recruiter") target = "/recruiter"
    else if (to === "history") target = "/recruiter/audit"
    else if (to === "admin") target = "/admin/research"
    else if (to === "architecture") target = "/architecture"
    else if (to === "studio") target = "/studio"
    else if (to === "results") target = "/results"
    else if (to === "landing") target = "/candidate"

    if (replace) {
      window.history.replaceState({}, "", target)
    } else {
      window.history.pushState({}, "", target)
    }
    setCurrentPath(window.location.pathname)
    window.scrollTo({ top: 0, behavior: "smooth" })
  }

  const currentRoute = parseRoute(currentPath)

  // Route redirects & Protected Route enforcement
  useEffect(() => {
    if (currentRoute.name === "root") {
      navigate(isAuthenticated ? "/recruiter" : "/candidate", { replace: true })
      return
    }
    if (currentRoute.name === "history-redirect") {
      navigate("/recruiter/audit", { replace: true })
      return
    }
    if (currentRoute.name === "admin-experiments") {
      navigate("/admin/research", { replace: true })
      return
    }
    if (isProtectedRoute(currentRoute.name) && !isAuthenticated) {
      const redirectUrl = `/login?redirect=${encodeURIComponent(window.location.pathname + window.location.search)}`
      window.history.replaceState({}, "", redirectUrl)
      setCurrentPath("/login")
    }
  }, [currentPath, isAuthenticated, currentRoute.name])

  const handleLoginSuccess = (authData) => {
    setIsAuthenticated(true)
    const user = authData?.user || getStoredUser()
    setCurrentUser(user)

    const searchParams = new URLSearchParams(window.location.search)
    const redirectTarget = searchParams.get("redirect")
    if (
      redirectTarget && 
      redirectTarget.startsWith("/") && 
      !redirectTarget.startsWith("//") && 
      !redirectTarget.startsWith("/login")
    ) {
      navigate(redirectTarget, { replace: true })
    } else {
      navigate("/recruiter", { replace: true })
    }
  }

  const handleLogout = () => {
    logoutRecruiter()
    setIsAuthenticated(false)
    setCurrentUser(null)
    navigate("/login")
  }

  const handleScreeningComplete = (runId) => {
    setCurrentRunId(runId)
    navigate("/results")
  }

  const handleSelectRun = (runId) => {
    setCurrentRunId(runId)
    navigate("/results")
  }

  return (
    <div className="min-h-screen flex flex-col bg-slate-50 dark:bg-[#080c14] text-slate-800 dark:text-slate-100 transition-colors duration-200">
      <Navbar 
        currentPath={currentPath}
        onNavigate={navigate}
        onNewScreening={() => navigate("/studio")}
        theme={theme}
        toggleTheme={toggleTheme}
        isAuthenticated={isAuthenticated}
        currentUser={currentUser}
        onLogout={handleLogout}
      />

      <main className="flex-1 relative">
        <ErrorBoundary>
          {currentRoute.name === "login" && (
            <LoginPage
              onLoginSuccess={handleLoginSuccess}
              onNavigatePublic={navigate}
            />
          )}

          {(currentRoute.name === "recruiter" || currentRoute.name === "recruiter-jobs") && (
            isAuthenticated ? (
              <RecruiterDashboard
                onOpenLegacyStudio={() => navigate("/studio")}
                onSelectJob={(jobId) => navigate(`/recruiter/jobs/${jobId}`)}
              />
            ) : (
              <LoginPage
                onLoginSuccess={handleLoginSuccess}
                onNavigatePublic={navigate}
              />
            )
          )}

          {currentRoute.name === "recruiter-job-detail" && (
            isAuthenticated ? (
              <RecruiterDashboard
                initialJobId={currentRoute.jobId}
                onOpenLegacyStudio={() => navigate("/studio")}
                onSelectJob={(jobId) => navigate(`/recruiter/jobs/${jobId}`)}
              />
            ) : (
              <LoginPage
                onLoginSuccess={handleLoginSuccess}
                onNavigatePublic={navigate}
              />
            )
          )}

          {(currentRoute.name === "candidate" || currentRoute.name === "candidate-results") && (
            <CandidatePortal onNavigate={navigate} />
          )}

          {currentRoute.name === "recruiter-audit" && (
            isAuthenticated ? (
              <AuditHistory
                onSelectRun={handleSelectRun}
                setActiveView={navigate}
              />
            ) : (
              <LoginPage
                onLoginSuccess={handleLoginSuccess}
                onNavigatePublic={navigate}
              />
            )
          )}

          {currentRoute.name === "admin-research" && (
            isAuthenticated ? (
              <ResearchAdminPortal />
            ) : (
              <LoginPage
                onLoginSuccess={handleLoginSuccess}
                onNavigatePublic={navigate}
              />
            )
          )}

          {currentRoute.name === "architecture" && (
            <SystemArchitectureViewer />
          )}

          {currentRoute.name === "studio" && (
            isAuthenticated ? (
              <ScreeningStudio
                onScreeningComplete={handleScreeningComplete}
                prefilledSampleIndex={prefilledSampleIndex}
              />
            ) : (
              <LoginPage
                onLoginSuccess={handleLoginSuccess}
                onNavigatePublic={navigate}
              />
            )
          )}

          {currentRoute.name === "results" && (
            isAuthenticated ? (
              <ResultsDashboard
                runId={currentRunId}
                setActiveView={navigate}
              />
            ) : (
              <LoginPage
                onLoginSuccess={handleLoginSuccess}
                onNavigatePublic={navigate}
              />
            )
          )}

          {currentRoute.name === "not-found" && (
            <NotFoundPage onNavigate={navigate} />
          )}
        </ErrorBoundary>
      </main>

      <Footer setActiveView={navigate} />
    </div>
  )
}

export default App
