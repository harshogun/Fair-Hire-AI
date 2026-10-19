/**
 * FairHire AI URL Routing Utility
 * Pure JavaScript helper functions for HTML5 History API route parsing and access control.
 */

export function parseRoute(pathname) {
  const cleanPath = pathname && pathname.length > 1 && pathname.endsWith("/") 
    ? pathname.slice(0, -1) 
    : (pathname || "/")

  if (cleanPath === "" || cleanPath === "/") {
    return { name: "root" }
  }
  if (cleanPath === "/login") {
    return { name: "login" }
  }
  if (cleanPath === "/candidate") {
    return { name: "candidate" }
  }
  if (cleanPath === "/candidate/results") {
    return { name: "candidate-results" }
  }
  if (cleanPath === "/recruiter") {
    return { name: "recruiter" }
  }
  if (cleanPath === "/recruiter/jobs") {
    return { name: "recruiter-jobs" }
  }
  const jobMatch = cleanPath.match(/^\/recruiter\/jobs\/(\d+)$/)
  if (jobMatch) {
    return { name: "recruiter-job-detail", jobId: jobMatch[1] }
  }
  if (cleanPath === "/recruiter/audit") {
    return { name: "recruiter-audit" }
  }
  if (cleanPath === "/history") {
    return { name: "history-redirect" }
  }
  if (cleanPath === "/admin/research") {
    return { name: "admin-research" }
  }
  if (cleanPath === "/admin/experiments") {
    return { name: "admin-experiments" }
  }
  if (cleanPath === "/architecture") {
    return { name: "architecture" }
  }
  if (cleanPath === "/studio") {
    return { name: "studio" }
  }
  if (cleanPath === "/results") {
    return { name: "results" }
  }
  return { name: "not-found", path: cleanPath }
}

export function isProtectedRoute(routeName) {
  return [
    "recruiter",
    "recruiter-jobs",
    "recruiter-job-detail",
    "recruiter-audit",
    "admin-research",
    "admin-experiments",
    "studio",
    "results"
  ].includes(routeName)
}
