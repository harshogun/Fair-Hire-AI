import React from "react"
import {
  ShieldCheck,
  History,
  Sun,
  Moon,
  Briefcase,
  UserCheck,
  Award,
  User,
  LogOut,
  LogIn
} from "lucide-react"
import { Button } from "./ui/button"

export function Navbar({ 
  currentPath = "/candidate",
  onNavigate,
  activeView, 
  setActiveView, 
  _onNewScreening, 
  theme, 
  toggleTheme,
  isAuthenticated,
  currentUser,
  onLogout
}) {
  const navigate = (path) => {
    if (onNavigate) {
      onNavigate(path)
    } else if (setActiveView) {
      // Fallback mapping for legacy view names
      const viewMap = {
        "/candidate": "candidate",
        "/recruiter": "recruiter",
        "/recruiter/jobs": "recruiter",
        "/recruiter/audit": "history",
        "/admin/research": "admin",
        "/login": "login"
      }
      setActiveView(viewMap[path] || path)
    }
  }

  const isCurrent = (target) => {
    if (currentPath === target) return true
    if (target === "/recruiter" && (currentPath === "/recruiter" || currentPath.startsWith("/recruiter/jobs"))) return true
    if (target === "/recruiter/audit" && (currentPath === "/recruiter/audit" || activeView === "history")) return true
    if (target === "/candidate" && (currentPath === "/candidate" || activeView === "candidate")) return true
    if (target === "/admin/research" && (currentPath === "/admin/research" || activeView === "admin")) return true
    return false
  }

  const isAdminUser = currentUser?.role === "ADMIN"

  return (
    <header className="sticky top-0 z-50 w-full border-b border-slate-200 dark:border-white/[0.08] bg-white/90 dark:bg-[#080c14]/90 backdrop-blur-md transition-colors">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-16 flex items-center justify-between">
        
        {/* Brand Logo */}
        <div 
          onClick={() => navigate(isAuthenticated ? "/recruiter" : "/candidate")}
          className="flex items-center gap-3 cursor-pointer group select-none"
        >
          <div className="w-8 h-8 rounded-lg bg-indigo-600 flex items-center justify-center shadow-sm">
            <ShieldCheck className="w-4 h-4 text-white" />
          </div>

          <div className="flex items-center gap-2">
            <span className="font-heading text-lg font-bold tracking-tight text-slate-900 dark:text-white group-hover:text-indigo-600 dark:group-hover:text-indigo-300 transition-colors">
              FairHire AI
            </span>
            <span className="text-[10px] font-mono font-semibold bg-indigo-50 dark:bg-indigo-950/60 text-indigo-600 dark:text-indigo-300 border border-indigo-200 dark:border-indigo-800 px-2 py-0.5 rounded-md">
              v2.5
            </span>
          </div>
        </div>

        {/* Navigation Links */}
        <nav className="hidden lg:flex items-center gap-5 text-xs font-semibold">
          {isAuthenticated ? (
            <>
              <button
                id="nav-recruiter-btn"
                onClick={() => navigate("/recruiter")}
                className={`transition-colors cursor-pointer py-1 flex items-center gap-1.5 ${
                  isCurrent("/recruiter") 
                    ? "text-indigo-600 dark:text-indigo-400 font-bold border-b-2 border-indigo-600 dark:border-indigo-500" 
                    : "text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white"
                }`}
              >
                <Briefcase className="w-3.5 h-3.5" />
                Recruiter Studio
              </button>

              <button
                id="nav-audit-btn"
                onClick={() => navigate("/recruiter/audit")}
                className={`transition-colors cursor-pointer py-1 flex items-center gap-1.5 ${
                  isCurrent("/recruiter/audit") 
                    ? "text-indigo-600 dark:text-indigo-400 font-bold border-b-2 border-indigo-600 dark:border-indigo-500" 
                    : "text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white"
                }`}
              >
                <History className="w-3.5 h-3.5" />
                Audit Ledger
              </button>

              <button
                id="nav-candidate-btn"
                onClick={() => navigate("/candidate")}
                className={`transition-colors cursor-pointer py-1 flex items-center gap-1.5 ${
                  isCurrent("/candidate") 
                    ? "text-indigo-600 dark:text-indigo-400 font-bold border-b-2 border-indigo-600 dark:border-indigo-500" 
                    : "text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white"
                }`}
              >
                <UserCheck className="w-3.5 h-3.5" />
                <span>Candidate Portal</span>
                {isCurrent("/candidate") && (
                  <span className="text-[9px] font-mono font-medium px-1.5 py-0.5 rounded bg-emerald-100 dark:bg-emerald-950/70 text-emerald-700 dark:text-emerald-300">
                    Public View
                  </span>
                )}
              </button>

              {isAdminUser && (
                <button
                  id="nav-admin-btn"
                  onClick={() => navigate("/admin/research")}
                  className={`transition-colors cursor-pointer py-1 flex items-center gap-1.5 ${
                    isCurrent("/admin/research") 
                      ? "text-indigo-600 dark:text-indigo-400 font-bold border-b-2 border-indigo-600 dark:border-indigo-500" 
                      : "text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white"
                  }`}
                >
                  <Award className="w-3.5 h-3.5" />
                  Research & Admin
                </button>
              )}
            </>
          ) : (
            <button
              id="nav-candidate-public-btn"
              onClick={() => navigate("/candidate")}
              className={`transition-colors cursor-pointer py-1 flex items-center gap-1.5 ${
                isCurrent("/candidate") 
                  ? "text-indigo-600 dark:text-indigo-400 font-bold border-b-2 border-indigo-600 dark:border-indigo-500" 
                  : "text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white"
              }`}
            >
              <UserCheck className="w-3.5 h-3.5" />
              Candidate Portal
            </button>
          )}
        </nav>

        {/* Status, Theme Switcher & Action CTA */}
        <div className="flex items-center gap-3">
          
          {/* Light / Dark Mode Toggle */}
          <button
            type="button"
            onClick={toggleTheme}
            className="p-2 rounded-xl border border-slate-200 dark:border-white/10 bg-white dark:bg-slate-900 text-slate-700 dark:text-slate-300 hover:text-indigo-600 dark:hover:text-white shadow-sm transition-all cursor-pointer"
            title={`Switch to ${theme === "dark" ? "Light" : "Dark"} Mode`}
            aria-label="Toggle theme mode"
          >
            {theme === "dark" ? (
              <Sun className="w-4 h-4 text-amber-400" />
            ) : (
              <Moon className="w-4 h-4 text-indigo-600" />
            )}
          </button>

          <div className="hidden sm:flex items-center gap-2 px-2.5 py-1 rounded-lg border border-slate-200 dark:border-white/[0.08] bg-slate-50 dark:bg-white/[0.02] text-[11px] font-mono text-slate-500 dark:text-slate-400">
            <span className="w-2 h-2 rounded-full bg-emerald-500"></span>
            <span>REST API Active</span>
          </div>

          {isAuthenticated ? (
            <div className="flex items-center gap-2">
              <div className="hidden md:flex items-center gap-1.5 px-2.5 py-1 rounded-lg border border-indigo-200 dark:border-indigo-800/80 bg-indigo-50/80 dark:bg-indigo-950/40 text-[11px] text-indigo-700 dark:text-indigo-300 font-medium">
                <User className="w-3.5 h-3.5 text-indigo-500" />
                <span>{currentUser?.name || "Recruiter"}</span>
                <span className="text-[10px] opacity-75 font-mono">({currentUser?.department || "Engineering"})</span>
                {isAdminUser && (
                  <span className="ml-1 px-1.5 py-0.2 rounded bg-indigo-600 text-white text-[9px] font-bold">
                    ADMIN
                  </span>
                )}
              </div>
              {isCurrent("/candidate") && (
                <Button
                  id="nav-back-to-recruiter-btn"
                  variant="default"
                  size="sm"
                  onClick={() => navigate("/recruiter")}
                  className="hidden sm:flex items-center gap-1.5 text-xs font-semibold h-8 px-2.5 rounded-lg bg-indigo-600 hover:bg-indigo-500 text-white shadow-sm cursor-pointer"
                  title="Switch back to Recruiter Studio"
                >
                  <Briefcase className="w-3.5 h-3.5" />
                  <span>Recruiter Studio</span>
                </Button>
              )}
              <Button
                id="nav-logout-btn"
                variant="outline"
                size="sm"
                onClick={onLogout}
                className="flex items-center gap-1.5 text-xs font-semibold h-8 px-2.5 rounded-lg text-slate-700 dark:text-slate-300 hover:text-rose-600 dark:hover:text-rose-400 hover:border-rose-300 dark:hover:border-rose-800 transition-colors"
                title="Sign Out"
              >
                <LogOut className="w-3.5 h-3.5" />
                <span className="hidden sm:inline">Sign Out</span>
              </Button>
            </div>
          ) : (
            <Button
              id="nav-login-btn"
              variant="default"
              size="sm"
              onClick={() => navigate("/login")}
              className="flex items-center gap-1.5 text-xs font-semibold h-8 px-3 rounded-lg shadow-sm"
            >
              <LogIn className="w-3.5 h-3.5" />
              <span>Recruiter Sign In</span>
            </Button>
          )}

        </div>
      </div>
    </header>
  )
}
