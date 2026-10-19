import React from "react"
import { AlertTriangle, Home, ArrowLeft } from "lucide-react"

export function NotFoundPage({ onNavigate }) {
  return (
    <div className="min-h-[70vh] flex items-center justify-center px-4 py-16">
      <div className="max-w-md w-full text-center space-y-6 bg-white dark:bg-slate-900/80 p-8 rounded-2xl border border-slate-200 dark:border-white/10 shadow-lg">
        <div className="inline-flex items-center justify-center w-16 h-16 rounded-2xl bg-amber-50 dark:bg-amber-950/40 border border-amber-200 dark:border-amber-800 text-amber-600 dark:text-amber-400">
          <AlertTriangle className="w-8 h-8" />
        </div>

        <div className="space-y-2">
          <span className="text-xs font-bold uppercase tracking-wider text-amber-600 dark:text-amber-400">
            HTTP 404 — Page Not Found
          </span>
          <h1 className="text-2xl font-bold font-heading text-slate-900 dark:text-white">
            Looking for something?
          </h1>
          <p className="text-xs text-slate-500 dark:text-slate-400">
            The URL path you requested does not exist or has moved. Please verify the web address or navigate using the links below.
          </p>
        </div>

        <div className="pt-2 flex flex-col sm:flex-row gap-3 justify-center">
          <button
            onClick={() => onNavigate ? onNavigate("/candidate") : window.location.assign("/candidate")}
            className="inline-flex items-center justify-center gap-2 px-4 py-2.5 rounded-xl border border-slate-200 dark:border-white/10 hover:bg-slate-50 dark:hover:bg-slate-800 text-xs font-semibold text-slate-700 dark:text-slate-200 transition-colors cursor-pointer"
          >
            <ArrowLeft className="w-4 h-4" />
            Candidate Portal
          </button>
          <button
            onClick={() => onNavigate ? onNavigate("/recruiter") : window.location.assign("/recruiter")}
            className="inline-flex items-center justify-center gap-2 px-4 py-2.5 rounded-xl bg-indigo-600 hover:bg-indigo-500 text-xs font-semibold text-white shadow-sm transition-colors cursor-pointer"
          >
            <Home className="w-4 h-4" />
            Recruiter Studio
          </button>
        </div>
      </div>
    </div>
  )
}
