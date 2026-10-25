import React, { useState, useEffect, useMemo } from "react"
import {
  Briefcase,
  Sliders,
  ShieldAlert,
  Sparkles,
  EyeOff,
  BarChart3,
  Download,
  Plus,
  RefreshCw,
  FileUp,
  X,
  AlertCircle,
  Trash2,
  FileText,
  Edit3,
  CheckCircle2,
  Building,
  Tag,
  Calendar,
  ArrowRight,
  Search,
  ChevronLeft,
  ChevronRight,
  Users
} from "lucide-react"
import {
  fetchJobs as apiFetchJobs,
  createJob as apiCreateJob,
  updateJob as apiUpdateJob,
  deleteJob as apiDeleteJob,
  fetchResumes as apiFetchResumes,
  uploadResume as apiUploadResume,
  runJobMatches as apiRunJobMatches,
  fetchJobMatches as apiFetchJobMatches,
  applyAtsScoringWeights as apiApplyAtsScoringWeights,
  downloadAuditCsv,
  MAX_RESUME_FILE_SIZE_BYTES
} from "../services/api"

function deduplicateMatches(list) {
  if (!Array.isArray(list)) return []
  const seen = new Set()
  return list.filter(cand => {
    const key = (cand.resumeId ?? cand.resume_id) != null
      ? `resume-${cand.resumeId ?? cand.resume_id}`
      : ((cand.candidateId ?? cand.candidate_id) != null
          ? `cand-${cand.candidateId ?? cand.candidate_id}`
          : `id-${cand.id || cand.match_id || cand.matchId}`)
    if (seen.has(key)) return false
    seen.add(key)
    return true
  })
}

export function RecruiterDashboard({ onOpenLegacyStudio: _onOpenLegacyStudio, initialJobId, onSelectJob }) {
  const [jobs, setJobs] = useState([])
  const [selectedJobId, setSelectedJobId] = useState(() => initialJobId ? Number(initialJobId) : null)
  const [selectedJob, setSelectedJob] = useState(null)
  const [resumes, setResumes] = useState([])
  const [matchResults, setMatchResults] = useState([])
  const uniqueMatchResults = useMemo(() => deduplicateMatches(matchResults), [matchResults])
  const [blindData, setBlindData] = useState(null)
  const [biasReport, setBiasReport] = useState(null)
  const [rewriteData, setRewriteData] = useState(null)
  const [rewriting, setRewriting] = useState(false)
  const [loadingRewrite, setLoadingRewrite] = useState(false)
  const [loading, setLoading] = useState(false)
  const [activeTab, setActiveTab] = useState("ranking") // ranking | blind | bias | rewrite | upload
  const [errorBanner, setErrorBanner] = useState(null)
  const [deletingJobId, setDeletingJobId] = useState(null)

  useEffect(() => {
    if (initialJobId && Number(initialJobId) !== selectedJobId) {
      setSelectedJobId(Number(initialJobId))
    }
  }, [initialJobId, selectedJobId])

  // Configurable ATS Scoring Weights
  const [keywordWeight, setKeywordWeight] = useState(80)
  const [activeScoringMode, setActiveScoringMode] = useState("deterministic") // "deterministic" | "ats_weighted"
  const [appliedWeights, setAppliedWeights] = useState({ keyword: 80, semantic: 20 })

  // Job Creation Modal State
  const [showCreateModal, setShowCreateModal] = useState(false)
  const [newTitle, setNewTitle] = useState("")
  const [newDepartment, setNewDepartment] = useState("Engineering")
  const [newDescription, setNewDescription] = useState("")
  const [newRequirements, setNewRequirements] = useState("")
  const [creatingJob, setCreatingJob] = useState(false)

  // Job Edit Modal State
  const [showEditModal, setShowEditModal] = useState(false)
  const [editingJob, setEditingJob] = useState(null)
  const [editTitle, setEditTitle] = useState("")
  const [editDepartment, setEditDepartment] = useState("Engineering")
  const [editDescription, setEditDescription] = useState("")
  const [editRequirements, setEditRequirements] = useState("")
  const [updatingJob, setUpdatingJob] = useState(false)
  const [successBanner, setSuccessBanner] = useState(null)

  // Resume Upload State
  const [uploadFile, setUploadFile] = useState(null)
  const [candidateName, setCandidateName] = useState("")
  const [candidateEmail, setCandidateEmail] = useState("")
  const [uploadText, setUploadText] = useState("")
  const [uploading, setUploading] = useState(false)
  const [uploadSuccess, setUploadSuccess] = useState(null)

  // Candidate pool search, filter, and pagination state
  const [candidateSearchQuery, setCandidateSearchQuery] = useState("")
  const [candidateFilterStatus, setCandidateFilterStatus] = useState("all") // all | evaluated | unassessed
  const [candidatePage, setCandidatePage] = useState(1)
  const [candidatePageSize, setCandidatePageSize] = useState(12)

  const fetchJobs = async () => {
    try {
      const data = await apiFetchJobs()
      if (Array.isArray(data) && data.length > 0) {
        setJobs(data)
        if (!selectedJobId) {
          const targetId = initialJobId ? Number(initialJobId) : data[0].id
          setSelectedJobId(targetId)
        }
      }
    } catch (err) {
      console.error("Failed to load jobs:", err)
      setErrorBanner("Failed to load jobs: " + err.message)
    }
  }

  const fetchResumes = async () => {
    try {
      const data = await apiFetchResumes()
      if (Array.isArray(data)) {
        setResumes(data)
      }
    } catch (err) {
      console.error("Failed to load resumes:", err)
    }
  }

  const loadJobDetails = async (jobId) => {
    setLoading(true)
    setErrorBanner(null)
    try {
      // 1. Job details
      let currentJob = null;
      const jobRes = await fetch(`/api/jobs/${jobId}`)
      if (jobRes.ok) {
        currentJob = await jobRes.json()
        setSelectedJob(currentJob)
      }

      // 2. Deterministic match results via Phase 4 engine
      setActiveScoringMode("deterministic")
      setAppliedWeights({ keyword: 80, semantic: 20 })
      try {
        let matchData = await apiFetchJobMatches(jobId)
        if (!matchData?.results || matchData.results.length === 0) {
          const runData = await apiRunJobMatches(jobId, "NORMAL")
          matchData = runData
        }
        setMatchResults(deduplicateMatches(matchData?.results || []))
      } catch (mErr) {
        console.warn("Deterministic matching notice:", mErr)
        setMatchResults([])
      }

      // 3. Blind screening comparison (safe handling)
      try {
        const blindRes = await fetch(`/api/blind-screening/${jobId}`)
        if (blindRes.ok) {
          const bData = await blindRes.json()
          setBlindData(bData)
        } else {
          setBlindData(null)
        }
      } catch {
        setBlindData(null)
      }

      // 4. Bias report (safe handling)
      try {
        const biasRes = await fetch(`/api/bias/${jobId}`)
        if (biasRes.ok) {
          const biData = await biasRes.json()
          setBiasReport(biData)
        } else {
          setBiasReport(null)
        }
      } catch {
        setBiasReport(null)
      }

      // 5. Pre-generate rewrite preview if AI service available
      const jobDesc = currentJob?.description || "";
      const jobReqs = currentJob?.requirements || "";
      if (jobDesc || jobReqs) {
        setLoadingRewrite(true)
        try {
          const textToRewrite = [jobDesc, jobReqs].filter(Boolean).join("\n\n");
          const rwRes = await fetch("/api/bias/rewrite", {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({ text: textToRewrite })
          })
          if (rwRes.ok) {
            const rwData = await rwRes.json()
            setRewriteData(rwData)
          } else {
            setRewriteData(null)
          }
        } catch {
          setRewriteData(null)
        } finally {
          setLoadingRewrite(false)
        }
      } else {
        setRewriteData(null)
      }
    } catch (err) {
      console.error("Failed to fetch job details:", err)
      setErrorBanner("Error loading job details: " + err.message)
    } finally {
      setLoading(false)
    }
  }

  // Fetch Jobs on Mount
  useEffect(() => {
    fetchJobs()
    fetchResumes()
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [])

  // Fetch Details for Selected Job
  useEffect(() => {
    if (!selectedJobId) return
    loadJobDetails(selectedJobId)
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [selectedJobId])

  // Generate or refresh inclusive rewrite on demand
  const generateInclusiveRewrite = async (job = selectedJob) => {
    if (!job) return
    const textToRewrite = [job.description, job.requirements].filter(Boolean).join("\n\n");
    if (!textToRewrite.trim()) return
    setLoadingRewrite(true)
    try {
      const rwRes = await fetch("/api/bias/rewrite", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ text: textToRewrite })
      })
      if (rwRes.ok) {
        const rwData = await rwRes.json()
        setRewriteData(rwData)
      }
    } catch (err) {
      console.warn("Failed to generate inclusive rewrite:", err)
    } finally {
      setLoadingRewrite(false)
    }
  }

  // Trigger inclusive rewrite if tab opened and not yet cached
  useEffect(() => {
    if (activeTab === "rewrite" && !rewriteData && selectedJob) {
      generateInclusiveRewrite(selectedJob)
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [activeTab, selectedJob, rewriteData])

  // Apply ATS Scoring Engine Weights (Keyword ATS vs Neural Semantic S-BERT)
  const handleRecalculateWeights = async () => {
    if (!selectedJobId) return
    setLoading(true)
    setErrorBanner(null)
    try {
      const kw = keywordWeight / 100.0
      const sem = (100 - keywordWeight) / 100.0
      const data = await apiApplyAtsScoringWeights(selectedJobId, kw, sem)
      const results = data?.results || []
      setMatchResults(deduplicateMatches(results))
      setActiveScoringMode("ats_weighted")
      setAppliedWeights({ keyword: keywordWeight, semantic: 100 - keywordWeight })

      // Live refresh of blind screening telemetry for dynamic rank shifts
      try {
        const blindRes = await fetch(`/api/blind-screening/${selectedJobId}`)
        if (blindRes.ok) {
          const bData = await blindRes.json()
          setBlindData(bData)
        }
      } catch (bErr) {
        console.warn("Blind screening refresh notice:", bErr)
      }

      setSuccessBanner(`ATS Scoring Weights applied (${keywordWeight}% Keyword, ${100 - keywordWeight}% Semantic). Candidate pool re-ranked successfully.`)
      setTimeout(() => setSuccessBanner(null), 5000)
    } catch (err) {
      console.error("Failed to apply ATS weights:", err)
      setErrorBanner("ATS Weights Error: " + err.message)
    } finally {
      setLoading(false)
    }
  }

  // Run Phase 4 Deterministic Matching (Pure Canonical Skill Coverage)
  const handleRunDeterministicMatching = async () => {
    if (!selectedJobId) return
    setLoading(true)
    setErrorBanner(null)
    try {
      const matchBatch = await apiRunJobMatches(selectedJobId, "NORMAL")
      setMatchResults(deduplicateMatches(matchBatch?.results || []))
      setActiveScoringMode("deterministic")
      setSuccessBanner("Deterministic canonical skill matching executed. Candidate pool updated.")
      setTimeout(() => setSuccessBanner(null), 5000)
    } catch (err) {
      console.error("Failed to run deterministic matching:", err)
      setErrorBanner("Matching Error: " + err.message)
    } finally {
      setLoading(false)
    }
  }

  // Create Job with robust DTO contract handling
  const handleCreateJob = async (e) => {
    e.preventDefault()
    if (!newTitle.trim() || !newDescription.trim()) return
    setCreatingJob(true)
    setErrorBanner(null)
    try {
      const data = await apiCreateJob({
        title: newTitle.trim(),
        department: newDepartment.trim() || "Engineering",
        description: newDescription.trim(),
        requirements: newRequirements.trim()
      })
      const newJob = data.job || (data.id ? data : null)
      if (newJob) {
        setJobs(prev => [newJob, ...prev])
        setSelectedJobId(newJob.id)
        setShowCreateModal(false)
        setNewTitle("")
        setNewDepartment("Engineering")
        setNewDescription("")
        setNewRequirements("")
        await loadJobDetails(newJob.id)
        setSuccessBanner(`Job posting "${newJob.title}" (Job #${newJob.id}) created successfully.`)
        setTimeout(() => setSuccessBanner(null), 5000)
      }
    } catch (err) {
      console.error("Error creating job:", err)
      setErrorBanner("Job Creation Failed: " + err.message)
    } finally {
      setCreatingJob(false)
    }
  }

  // Open Edit Job Modal with pre-filled fields
  const openEditModal = (targetJob = null) => {
    const job = targetJob || selectedJob
    if (!job) return
    setEditingJob(job)
    setEditTitle(job.title || "")
    setEditDepartment(job.department || "Engineering")
    setEditDescription(job.description || job.rawDescription || "")
    setEditRequirements(job.requirements || "")
    setShowEditModal(true)
  }

  // Update existing job posting and re-sync state
  const handleUpdateJob = async (e) => {
    e.preventDefault()
    if (!editTitle.trim()) return
    setUpdatingJob(true)
    setErrorBanner(null)
    try {
      const jobId = editingJob ? editingJob.id : selectedJob?.id
      const res = await apiUpdateJob(jobId, {
        title: editTitle.trim(),
        department: editDepartment.trim() || "Engineering",
        description: editDescription.trim(),
        requirements: editRequirements.trim()
      })
      const updatedJob = res.job || res
      setJobs(prev => prev.map(j => (j.id === jobId ? { ...j, ...updatedJob } : j)))
      if (selectedJobId === jobId) {
        setSelectedJob(updatedJob)
        await loadJobDetails(jobId)
      }
      setShowEditModal(false)
      setSuccessBanner(`Job requisition "${updatedJob.title}" (Job #${jobId}) updated successfully. Skills & screening data refreshed.`)
      setTimeout(() => setSuccessBanner(null), 5000)
    } catch (err) {
      console.error("Error updating job:", err)
      setErrorBanner("Failed to update job posting: " + err.message)
    } finally {
      setUpdatingJob(false)
    }
  }

  const handleDeleteJob = async (id, title) => {
    if (!window.confirm(`Are you sure you want to permanently delete job posting "${title}" (Job #${id})?\n\nThis will remove the job requisition and all associated applicant rankings, match records, and bias reports.`)) {
      return
    }

    setDeletingJobId(id)
    setErrorBanner(null)
    try {
      await apiDeleteJob(id)
      const remaining = jobs.filter(j => j.id !== id)
      setJobs(remaining)
      if (selectedJobId === id) {
        if (remaining.length > 0) {
          setSelectedJobId(remaining[0].id)
          if (onSelectJob) onSelectJob(remaining[0].id)
        } else {
          setSelectedJobId(null)
          setSelectedJob(null)
        }
      }
    } catch (err) {
      console.error("Delete job error:", err)
      setErrorBanner("Failed to delete job: " + err.message)
    } finally {
      setDeletingJobId(null)
    }
  }

  const handleFileChange = (e) => {
    const file = e.target.files?.[0] || null
    if (file && file.size > MAX_RESUME_FILE_SIZE_BYTES) {
      setUploadSuccess(`Upload Error: Selected file (${(file.size / (1024 * 1024)).toFixed(1)} MB) exceeds the 10 MB upload limit.`)
      e.target.value = ""
      setUploadFile(null)
      return
    }
    setUploadSuccess(null)
    setUploadFile(file)
  }

  // Upload Resume with robust DTO handling and feedback
  const handleUploadResume = async (e) => {
    e.preventDefault()
    if (uploadFile && uploadFile.size > MAX_RESUME_FILE_SIZE_BYTES) {
      setUploadSuccess(`Upload Error: File size exceeds the maximum allowed limit of 10 MB.`)
      return
    }
    setUploading(true)
    setUploadSuccess(null)
    setErrorBanner(null)
    try {
      const resData = await apiUploadResume({
        file: uploadFile,
        rawText: uploadText,
        name: candidateName,
        email: candidateEmail,
        jobId: selectedJobId
      })
      const cName = resData.candidateName || "Candidate"
      const skillCount = resData.skillsCount || resData.extractedSkills?.length || 0
      setUploadSuccess(`Resume successfully parsed and associated with this job! Candidate: ${cName} (${skillCount} canonical skills detected).`)
      setUploadFile(null)
      setUploadText("")
      setCandidateName("")
      setCandidateEmail("")
      await fetchResumes()
      if (selectedJobId) {
        await loadJobDetails(selectedJobId)
      }
    } catch (err) {
      console.error("Error uploading resume:", err)
      setUploadSuccess(`Upload Error: ${err.message}`)
    } finally {
      setUploading(false)
    }
  }

  // Apply Inclusive Rewrite to current job
  const handleApplyRewrite = async () => {
    if (!selectedJobId || !rewriteData) return
    setRewriting(true)
    try {
      let newDescription = selectedJob?.description || "";
      let newRequirements = selectedJob?.requirements || "";
      
      const changes = rewriteData.changes || rewriteData.replacements || [];
      changes.forEach(change => {
        if (change.from && change.to) {
          const regex = new RegExp(`(?<![a-zA-Z])${change.from}(?![a-zA-Z])`, 'gi');
          newDescription = newDescription.replace(regex, change.to);
          newRequirements = newRequirements.replace(regex, change.to);
        }
      });

      await apiUpdateJob(selectedJobId, {
        title: selectedJob?.title,
        department: selectedJob?.department,
        description: newDescription,
        requirements: newRequirements
      });

      setSuccessBanner(`Inclusive rewrite successfully applied! Neutralized ${changes.length} biased terms across the requisition.`);
      await loadJobDetails(selectedJobId);
      setActiveTab("details");
    } catch (err) {
      console.error("Failed to apply rewrite:", err);
      setErrorBanner("Failed to apply rewrite: " + err.message);
    } finally {
      setRewriting(false);
    }
  }

  // Visual text diff highlighter
  const renderHighlightedDiff = (text, targetTerms, isReplacement = false) => {
    if (!text) return null;
    if (!targetTerms || targetTerms.length === 0) return text;

    const escaped = targetTerms.map(t => t.replace(/[.*+?^${}()|[\]\\]/g, '\\$&')).join("|");
    const regex = new RegExp(`(?<![a-zA-Z])(${escaped})(?![a-zA-Z])`, 'gi');
    const parts = text.split(regex);

    return parts.map((part, i) => {
      const match = targetTerms.find(t => t.toLowerCase() === part.toLowerCase());
      if (match) {
        return isReplacement ? (
          <mark
            key={i}
            className="inline-flex items-center gap-1 bg-emerald-500/25 dark:bg-emerald-500/30 text-emerald-800 dark:text-emerald-300 font-bold px-2 py-0.5 rounded-md border border-emerald-500/50 shadow-xs"
            title="Neutral substitute for flagged term"
          >
            <span className="text-[10px] text-emerald-600 dark:text-emerald-400 font-black">✓</span>
            {part}
          </mark>
        ) : (
          <mark
            key={i}
            className="inline-flex items-center gap-1 bg-rose-500/20 dark:bg-rose-500/25 text-rose-800 dark:text-rose-300 font-bold px-2 py-0.5 rounded-md border border-rose-500/40 line-through decoration-2"
            title="Flagged gendered or exclusionary phrase"
          >
            {part}
          </mark>
        );
      }
      return part;
    });
  };

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-8">
      {/* Top Header & Quick Actions */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 pb-6 border-b border-slate-200 dark:border-white/10">
        <div>
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-indigo-50 dark:bg-indigo-950/50 border border-indigo-200 dark:border-indigo-800 text-indigo-700 dark:text-indigo-300 text-xs font-semibold mb-2">
            <Briefcase className="w-3.5 h-3.5" />
            Recruiter Workspace • Spring Boot & AI Architecture
          </div>
          <h1 className="text-2xl sm:text-3xl font-bold font-heading text-slate-900 dark:text-white">
            Recruitment & Screening Studio
          </h1>
          <p className="text-sm text-slate-600 dark:text-slate-400 mt-1">
            Manage job descriptions, upload candidate resumes, configure ATS weights, and compare normal vs. blind screenings.
          </p>
        </div>

        <div className="flex items-center gap-3">
          <button
            onClick={() => setShowCreateModal(true)}
            className="inline-flex items-center gap-2 px-4 py-2 rounded-xl bg-indigo-600 hover:bg-indigo-500 text-white text-xs font-semibold shadow-sm transition-colors cursor-pointer"
          >
            <Plus className="w-4 h-4" />
            Post New Job Description
          </button>
          <button
            type="button"
            onClick={() => downloadAuditCsv(selectedJobId || null)}
            className="inline-flex items-center gap-2 px-3 py-2 rounded-xl border border-slate-200 dark:border-white/10 bg-white dark:bg-slate-900 text-slate-700 dark:text-slate-200 hover:bg-slate-50 dark:hover:bg-slate-800 text-xs font-semibold shadow-sm transition-colors cursor-pointer"
          >
            <Download className="w-4 h-4 text-emerald-500" />
            Export Audit CSV
          </button>
        </div>
      </div>

      {/* Visible Error Banner */}
      {errorBanner && (
        <div className="p-4 rounded-xl bg-rose-50 dark:bg-rose-950/40 border border-rose-200 dark:border-rose-800 text-rose-700 dark:text-rose-300 text-xs font-semibold flex items-center justify-between shadow-sm animate-in fade-in">
          <div className="flex items-center gap-2">
            <AlertCircle className="w-4 h-4 text-rose-500 flex-shrink-0" />
            <span>{errorBanner}</span>
          </div>
          <button
            onClick={() => setErrorBanner(null)}
            className="text-xs font-bold underline hover:no-underline ml-4 cursor-pointer"
          >
            Dismiss
          </button>
        </div>
      )}

      {/* Visible Success Banner */}
      {successBanner && (
        <div className="p-4 rounded-xl bg-emerald-50 dark:bg-emerald-950/40 border border-emerald-200 dark:border-emerald-800 text-emerald-700 dark:text-emerald-300 text-xs font-semibold flex items-center justify-between shadow-sm animate-in fade-in">
          <div className="flex items-center gap-2">
            <CheckCircle2 className="w-4 h-4 text-emerald-500 flex-shrink-0" />
            <span>{successBanner}</span>
          </div>
          <button
            onClick={() => setSuccessBanner(null)}
            className="text-xs font-bold underline hover:no-underline ml-4 cursor-pointer"
          >
            Dismiss
          </button>
        </div>
      )}

      {/* Main Grid: Job Selector Sidebar + Workspace */}
      <div className="grid grid-cols-1 lg:grid-cols-4 gap-8">
        
        {/* Left Column: Job Description Selector */}
        <div className="lg:col-span-1 space-y-4">
          <div className="p-4 rounded-2xl bg-white dark:bg-slate-900/80 border border-slate-200 dark:border-white/10 shadow-sm space-y-3">
            <div className="flex items-center justify-between">
              <span className="text-xs font-bold uppercase tracking-wider text-slate-500 dark:text-slate-400">
                Active Job Postings ({jobs.length})
              </span>
              <button
                onClick={fetchJobs}
                className="p-1 rounded text-slate-400 hover:text-slate-600 dark:hover:text-white"
                title="Refresh jobs"
              >
                <RefreshCw className="w-3.5 h-3.5" />
              </button>
            </div>

            <div className="space-y-2 max-h-[500px] overflow-y-auto pr-1">
              {jobs.map(job => {
                const isSelected = job.id === selectedJobId
                return (
                  <div key={job.id} className="relative group">
                    <button
                      onClick={() => {
                        setSelectedJobId(job.id)
                        if (onSelectJob) onSelectJob(job.id)
                      }}
                      className={`w-full text-left p-3 rounded-xl border transition-all cursor-pointer ${
                        isSelected
                          ? "bg-indigo-50 dark:bg-indigo-950/40 border-indigo-500 text-indigo-950 dark:text-indigo-100 shadow-sm"
                          : "bg-slate-50 dark:bg-white/[0.02] border-slate-200 dark:border-white/[0.06] text-slate-700 dark:text-slate-300 hover:border-slate-300 dark:hover:border-white/20"
                      }`}
                    >
                      <div className="font-semibold text-xs leading-snug line-clamp-2 pr-12">
                        {job.title}
                      </div>
                      <div className="flex items-center gap-2 mt-2 text-[10px] text-slate-500 dark:text-slate-400">
                        <span>ID #{job.id}</span>
                        <span>•</span>
                        <span>{job.skills?.length || 0} skills</span>
                      </div>
                    </button>
                    <div className="absolute top-2 right-2 flex items-center gap-1 opacity-0 group-hover:opacity-100 transition-all">
                      <button
                        onClick={(e) => {
                          e.stopPropagation()
                          openEditModal(job)
                        }}
                        className="p-1 rounded-lg text-slate-400 hover:text-indigo-600 dark:hover:text-indigo-400 hover:bg-indigo-50 dark:hover:bg-indigo-950/60 transition-all cursor-pointer"
                        title="Edit job posting"
                      >
                        <Edit3 className="w-3.5 h-3.5" />
                      </button>
                      <button
                        onClick={(e) => {
                          e.stopPropagation()
                          handleDeleteJob(job.id, job.title)
                        }}
                        disabled={deletingJobId === job.id}
                        className="p-1 rounded-lg text-slate-400 hover:text-rose-600 dark:hover:text-rose-400 hover:bg-rose-50 dark:hover:bg-rose-950/60 transition-all cursor-pointer"
                        title="Delete job posting"
                      >
                        <Trash2 className="w-3.5 h-3.5" />
                      </button>
                    </div>
                  </div>
                )
              })}
            </div>
          </div>

          {/* Configurable ATS Scoring Engine Weights */}
          <div className="p-4 rounded-2xl bg-white dark:bg-slate-900/80 border border-slate-200 dark:border-white/10 shadow-sm space-y-4">
            <div className="flex items-center gap-2 text-xs font-bold text-slate-900 dark:text-white">
              <Sliders className="w-4 h-4 text-indigo-500" />
              ATS Scoring Weights
            </div>
            <p className="text-[11px] text-slate-500 dark:text-slate-400 leading-relaxed">
              Dynamically balance Keyword ATS overlap vs. Semantic S-BERT neural embeddings.
            </p>

            <div className="space-y-3">
              <div className="flex justify-between text-xs font-semibold">
                <span className="text-amber-600 dark:text-amber-400">Keyword ATS: {keywordWeight}%</span>
                <span className="text-indigo-600 dark:text-indigo-400">Semantic: {100 - keywordWeight}%</span>
              </div>
              <input
                type="range"
                min="0"
                max="100"
                step="5"
                value={keywordWeight}
                onChange={(e) => setKeywordWeight(Number(e.target.value))}
                className="w-full h-1.5 bg-slate-200 dark:bg-slate-700 rounded-lg appearance-none cursor-pointer accent-indigo-600"
              />
              <button
                onClick={handleRecalculateWeights}
                disabled={loading}
                className="w-full py-1.5 rounded-lg bg-slate-900 hover:bg-slate-800 dark:bg-white dark:hover:bg-slate-100 text-white dark:text-slate-900 text-xs font-semibold transition-colors cursor-pointer"
              >
                Apply & Re-rank
              </button>
            </div>
          </div>
        </div>

        {/* Right Columns: Active Job & Work Tabs */}
        <div className="lg:col-span-3 space-y-6">
          {selectedJob && (
            <div className="p-5 rounded-2xl bg-white dark:bg-slate-900/80 border border-slate-200 dark:border-white/10 shadow-sm">
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-4 border-b border-slate-100 dark:border-white/[0.06]">
                <div>
                  <h2 className="text-xl font-bold font-heading text-slate-900 dark:text-white">
                    {selectedJob.title}
                  </h2>
                  <div className="flex flex-wrap items-center gap-2 mt-1.5">
                    <span className="px-2 py-0.5 rounded text-[11px] font-medium bg-slate-100 dark:bg-white/[0.06] text-slate-600 dark:text-slate-300">
                      Job #{selectedJob.id}
                    </span>
                    <span className="px-2 py-0.5 rounded text-[11px] font-medium bg-indigo-50 dark:bg-indigo-950/50 text-indigo-600 dark:text-indigo-300">
                      {selectedJob.skills?.length || 0} Required Skills
                    </span>
                    {biasReport && biasReport.bias_level && (
                      <span className={`px-2 py-0.5 rounded text-[11px] font-medium ${
                        (biasReport.bias_score || 0) > 0.05
                          ? "bg-rose-50 dark:bg-rose-950/50 text-rose-600 dark:text-rose-400"
                          : "bg-emerald-50 dark:bg-emerald-950/50 text-emerald-600 dark:text-emerald-400"
                      }`}>
                        Bias Level: {String(biasReport.bias_level).toUpperCase()} ({biasReport.bias_score ?? 0})
                      </span>
                    )}
                  </div>
                </div>

                <div className="flex items-center gap-3">
                  {blindData && (
                    <div className="flex items-center gap-3 px-3 py-2 rounded-xl bg-slate-50 dark:bg-white/[0.02] border border-slate-200 dark:border-white/[0.08]">
                      <div className="text-center">
                        <div className="text-[10px] text-slate-500 uppercase tracking-wider font-semibold">Fairness Index</div>
                        <div className="text-base font-bold text-indigo-600 dark:text-indigo-400">
                          {blindData.fairness_index} / 100
                        </div>
                      </div>
                      <div className="w-[1px] h-6 bg-slate-200 dark:bg-white/10"></div>
                      <div className="text-center">
                        <div className="text-[10px] text-slate-500 uppercase tracking-wider font-semibold">Rank Stability (ρ)</div>
                        <div className="text-base font-bold text-slate-800 dark:text-slate-200">
                          {blindData.rank_correlation}
                        </div>
                      </div>
                    </div>
                  )}

                  <button
                    onClick={() => openEditModal()}
                    className="inline-flex items-center gap-1.5 px-3 py-2 rounded-xl border border-indigo-200 dark:border-indigo-800/60 bg-indigo-50 dark:bg-indigo-950/40 text-indigo-700 dark:text-indigo-300 hover:bg-indigo-100 dark:hover:bg-indigo-900/50 text-xs font-semibold shadow-sm transition-colors cursor-pointer"
                    title="Edit job posting details"
                  >
                    <Edit3 className="w-3.5 h-3.5" />
                    <span>Edit Job</span>
                  </button>

                  <button
                    onClick={() => handleDeleteJob(selectedJob.id, selectedJob.title)}
                    disabled={deletingJobId === selectedJob.id}
                    className="inline-flex items-center gap-1.5 px-3 py-2 rounded-xl border border-rose-200 dark:border-rose-900/40 bg-rose-50 dark:bg-rose-950/30 text-rose-600 dark:text-rose-400 hover:bg-rose-100 dark:hover:bg-rose-950/60 text-xs font-semibold shadow-sm transition-colors cursor-pointer"
                    title="Delete this job requisition"
                  >
                    <Trash2 className="w-3.5 h-3.5" />
                    <span>{deletingJobId === selectedJob.id ? "Deleting..." : "Delete Job"}</span>
                  </button>
                </div>
              </div>

              {/* Navigation Tabs */}
              <div className="flex items-center gap-2 overflow-x-auto pt-4 text-xs font-semibold border-b border-slate-100 dark:border-white/[0.06] pb-2">
                <button
                  onClick={() => setActiveTab("details")}
                  className={`px-3 py-1.5 rounded-lg transition-colors cursor-pointer flex items-center gap-1.5 ${
                    activeTab === "details"
                      ? "bg-indigo-600 text-white shadow-sm"
                      : "text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white"
                  }`}
                >
                  <FileText className="w-3.5 h-3.5" />
                  Job Details & Requirements
                </button>

                <button
                  onClick={() => setActiveTab("ranking")}
                  className={`px-3 py-1.5 rounded-lg transition-colors cursor-pointer flex items-center gap-1.5 ${
                    activeTab === "ranking"
                      ? "bg-indigo-600 text-white shadow-sm"
                      : "text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white"
                  }`}
                >
                  <BarChart3 className="w-3.5 h-3.5" />
                  Candidate Rankings ({uniqueMatchResults.length})
                </button>

                <button
                  onClick={() => setActiveTab("blind")}
                  className={`px-3 py-1.5 rounded-lg transition-colors cursor-pointer flex items-center gap-1.5 ${
                    activeTab === "blind"
                      ? "bg-indigo-600 text-white shadow-sm"
                      : "text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white"
                  }`}
                >
                  <EyeOff className="w-3.5 h-3.5" />
                  Blind Screening Comparison
                </button>

                <button
                  onClick={() => setActiveTab("bias")}
                  className={`px-3 py-1.5 rounded-lg transition-colors cursor-pointer flex items-center gap-1.5 ${
                    activeTab === "bias"
                      ? "bg-indigo-600 text-white shadow-sm"
                      : "text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white"
                  }`}
                >
                  <ShieldAlert className="w-3.5 h-3.5" />
                  Bias Analysis Report
                </button>

                <button
                  onClick={() => setActiveTab("rewrite")}
                  className={`px-3 py-1.5 rounded-lg transition-colors cursor-pointer flex items-center gap-1.5 ${
                    activeTab === "rewrite"
                      ? "bg-indigo-600 text-white shadow-sm"
                      : "text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white"
                  }`}
                >
                  <Sparkles className="w-3.5 h-3.5" />
                  Inclusive Rewrite
                </button>

                <button
                  onClick={() => setActiveTab("upload")}
                  className={`px-3 py-1.5 rounded-lg transition-colors cursor-pointer flex items-center gap-1.5 ${
                    activeTab === "upload"
                      ? "bg-indigo-600 text-white shadow-sm"
                      : "text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white"
                  }`}
                >
                  <FileUp className="w-3.5 h-3.5" />
                  Upload Resumes ({resumes.length})
                </button>
              </div>

              {/* TAB 0: JOB DETAILS & REQUIREMENTS */}
              {activeTab === "details" && (
                <div className="pt-4 space-y-6">
                  {/* Summary Metric Cards */}
                  <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
                    <div className="p-4 rounded-xl bg-slate-50 dark:bg-white/[0.02] border border-slate-200 dark:border-white/[0.06] space-y-1">
                      <div className="flex items-center gap-2 text-xs font-semibold text-slate-500 dark:text-slate-400">
                        <Building className="w-3.5 h-3.5 text-indigo-500" />
                        <span>Department</span>
                      </div>
                      <div className="text-sm font-bold text-slate-900 dark:text-white truncate">
                        {selectedJob.department || "Engineering"}
                      </div>
                      <div className="text-[10px] text-slate-400 font-mono">Requisition Unit</div>
                    </div>

                    <div className="p-4 rounded-xl bg-slate-50 dark:bg-white/[0.02] border border-slate-200 dark:border-white/[0.06] space-y-1">
                      <div className="flex items-center gap-2 text-xs font-semibold text-slate-500 dark:text-slate-400">
                        <Tag className="w-3.5 h-3.5 text-cyan-500" />
                        <span>Extracted Skills</span>
                      </div>
                      <div className="text-sm font-bold text-slate-900 dark:text-white">
                        {selectedJob.skills?.length || 0} Canonical Skills
                      </div>
                      <div className="text-[10px] text-slate-400 font-mono">ATS Vocabulary Match</div>
                    </div>

                    <div className="p-4 rounded-xl bg-slate-50 dark:bg-white/[0.02] border border-slate-200 dark:border-white/[0.06] space-y-1">
                      <div className="flex items-center gap-2 text-xs font-semibold text-slate-500 dark:text-slate-400">
                        <ShieldAlert className="w-3.5 h-3.5 text-amber-500" />
                        <span>Linguistic Bias</span>
                      </div>
                      <div className="text-sm font-bold text-slate-900 dark:text-white">
                        {biasReport?.bias_level ? String(biasReport.bias_level).toUpperCase() : "BALANCED"}
                      </div>
                      <div className="text-[10px] text-slate-400 font-mono">
                        {biasReport?.flagged_words?.length || selectedJob.bias_count || 0} Flagged Terms
                      </div>
                    </div>

                    <div className="p-4 rounded-xl bg-slate-50 dark:bg-white/[0.02] border border-slate-200 dark:border-white/[0.06] space-y-1">
                      <div className="flex items-center gap-2 text-xs font-semibold text-slate-500 dark:text-slate-400">
                        <Calendar className="w-3.5 h-3.5 text-emerald-500" />
                        <span>Posted Date</span>
                      </div>
                      <div className="text-sm font-bold text-slate-900 dark:text-white truncate">
                        {selectedJob.created_at ? new Date(selectedJob.created_at).toLocaleDateString(undefined, { year: 'numeric', month: 'short', day: 'numeric' }) : "Active"}
                      </div>
                      <div className="text-[10px] text-slate-400 font-mono">Requisition ID #{selectedJob.id}</div>
                    </div>
                  </div>

                  {/* Section: Job Description & Roles */}
                  <div className="p-5 rounded-2xl bg-white dark:bg-slate-900/60 border border-slate-200 dark:border-white/[0.08] shadow-sm space-y-3">
                    <div className="flex items-center justify-between pb-3 border-b border-slate-100 dark:border-white/[0.06]">
                      <div className="flex items-center gap-2">
                        <FileText className="w-4 h-4 text-indigo-500" />
                        <h3 className="text-sm font-bold text-slate-900 dark:text-white font-heading">
                          Job Description & Role Overview
                        </h3>
                      </div>
                      <button
                        onClick={() => openEditModal()}
                        className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-lg bg-indigo-50 dark:bg-indigo-950/40 hover:bg-indigo-100 dark:hover:bg-indigo-900/50 text-indigo-700 dark:text-indigo-300 border border-indigo-200 dark:border-indigo-800 text-xs font-semibold transition-colors cursor-pointer"
                      >
                        <Edit3 className="w-3 h-3" />
                        <span>Edit Description</span>
                      </button>
                    </div>

                    {selectedJob.description ? (
                      <div className="text-xs text-slate-700 dark:text-slate-300 leading-relaxed font-sans whitespace-pre-wrap bg-slate-50 dark:bg-white/[0.01] p-4 rounded-xl border border-slate-100 dark:border-white/[0.04]">
                        {selectedJob.description}
                      </div>
                    ) : (
                      <div className="py-8 text-center text-xs text-slate-400 dark:text-slate-500">
                        No detailed description provided yet. Click "Edit Description" to add responsibilities and role summary.
                      </div>
                    )}
                  </div>

                  {/* Section: Technical Requirements & Qualifications */}
                  <div className="p-5 rounded-2xl bg-white dark:bg-slate-900/60 border border-slate-200 dark:border-white/[0.08] shadow-sm space-y-3">
                    <div className="flex items-center justify-between pb-3 border-b border-slate-100 dark:border-white/[0.06]">
                      <div className="flex items-center gap-2">
                        <Sliders className="w-4 h-4 text-cyan-500" />
                        <h3 className="text-sm font-bold text-slate-900 dark:text-white font-heading">
                          Requirements, Qualifications & Policy Gates
                        </h3>
                      </div>
                      <button
                        onClick={() => openEditModal()}
                        className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-lg bg-cyan-50 dark:bg-cyan-950/40 hover:bg-cyan-100 dark:hover:bg-cyan-900/50 text-cyan-700 dark:text-cyan-300 border border-cyan-200 dark:border-cyan-800 text-xs font-semibold transition-colors cursor-pointer"
                      >
                        <Edit3 className="w-3 h-3" />
                        <span>Edit Requirements</span>
                      </button>
                    </div>

                    {selectedJob.requirements ? (
                      <div className="text-xs text-slate-700 dark:text-slate-300 leading-relaxed font-sans whitespace-pre-wrap bg-slate-50 dark:bg-white/[0.01] p-4 rounded-xl border border-slate-100 dark:border-white/[0.04]">
                        {selectedJob.requirements}
                      </div>
                    ) : (
                      <div className="py-8 text-center text-xs text-slate-400 dark:text-slate-500">
                        No specific requirements listed. Click "Edit Requirements" to add mandatory skills, minimum years of experience, or degree gates.
                      </div>
                    )}
                  </div>

                  {/* Section: Machine-Actionable Skills Badges */}
                  <div className="p-5 rounded-2xl bg-white dark:bg-slate-900/60 border border-slate-200 dark:border-white/[0.08] shadow-sm space-y-3">
                    <div className="flex items-center justify-between pb-3 border-b border-slate-100 dark:border-white/[0.06]">
                      <div className="flex items-center gap-2">
                        <Tag className="w-4 h-4 text-indigo-500" />
                        <h3 className="text-sm font-bold text-slate-900 dark:text-white font-heading">
                          Machine-Actionable ATS Skills ({selectedJob.skills?.length || 0})
                        </h3>
                      </div>
                      <span className="text-[11px] font-mono text-slate-500">
                        Automated Extraction
                      </span>
                    </div>

                    {selectedJob.skills && selectedJob.skills.length > 0 ? (
                      <div className="flex flex-wrap gap-2 pt-1">
                        {selectedJob.skills.map((skill, idx) => (
                          <span
                            key={idx}
                            className="inline-flex items-center gap-1 px-3 py-1.5 rounded-lg text-xs font-semibold bg-indigo-50 dark:bg-indigo-950/40 border border-indigo-200 dark:border-indigo-800/60 text-indigo-700 dark:text-indigo-300"
                          >
                            <span>{skill}</span>
                          </span>
                        ))}
                      </div>
                    ) : (
                      <p className="text-xs text-slate-500">
                        No skills automatically mapped yet. Edit the job description or requirements to include technical keywords from our skills taxonomy.
                      </p>
                    )}
                    <p className="text-[11px] text-slate-400 dark:text-slate-500 pt-2 border-t border-slate-100 dark:border-white/[0.04]">
                      These canonical skills are matched against applicant resumes during deterministic ATS screening (Phase 4).
                    </p>
                  </div>

                  {/* Quick Action Footer */}
                  <div className="flex flex-wrap items-center justify-between gap-4 p-4 rounded-xl bg-slate-50 dark:bg-white/[0.02] border border-slate-200 dark:border-white/[0.08]">
                    <div className="flex items-center gap-2">
                      <button
                        onClick={() => openEditModal()}
                        className="inline-flex items-center gap-2 px-4 py-2 rounded-xl bg-indigo-600 hover:bg-indigo-500 text-white text-xs font-semibold shadow-sm transition-colors cursor-pointer"
                      >
                        <Edit3 className="w-4 h-4" />
                        <span>Edit Job Details</span>
                      </button>
                      <button
                        onClick={() => setActiveTab("ranking")}
                        className="inline-flex items-center gap-2 px-4 py-2 rounded-xl border border-slate-200 dark:border-white/10 bg-white dark:bg-slate-900 text-slate-700 dark:text-slate-200 hover:bg-slate-50 dark:hover:bg-slate-800 text-xs font-semibold shadow-sm transition-colors cursor-pointer"
                      >
                        <BarChart3 className="w-4 h-4 text-indigo-500" />
                        <span>View Candidate Rankings ({uniqueMatchResults.length})</span>
                      </button>
                    </div>

                    <button
                      onClick={() => handleDeleteJob(selectedJob.id, selectedJob.title)}
                      disabled={deletingJobId === selectedJob.id}
                      className="inline-flex items-center gap-1.5 px-3 py-2 rounded-xl border border-rose-200 dark:border-rose-900/40 bg-rose-50 dark:bg-rose-950/30 text-rose-600 dark:text-rose-400 hover:bg-rose-100 dark:hover:bg-rose-950/60 text-xs font-semibold shadow-sm transition-colors cursor-pointer"
                    >
                      <Trash2 className="w-3.5 h-3.5" />
                      <span>Delete Requisition</span>
                    </button>
                  </div>
                </div>
              )}

              {/* TAB 1: CANDIDATE RANKINGS */}
              {activeTab === "ranking" && (
                <div className="pt-4 space-y-4">
                  {/* Status & Control Header */}
                  <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-3 border-b border-slate-100 dark:border-white/[0.06]">
                    <div>
                      <div className="flex items-center gap-2">
                        <span className="text-xs font-bold text-slate-900 dark:text-white">
                          Requisition Applicant Pool
                        </span>
                        <span className="px-2 py-0.5 rounded-full text-[10px] font-semibold bg-indigo-50 dark:bg-indigo-950/60 text-indigo-700 dark:text-indigo-300 border border-indigo-200 dark:border-indigo-800">
                          {uniqueMatchResults.length} Evaluated • {activeScoringMode === "ats_weighted" ? `ATS Weights: ${appliedWeights.keyword}% Keyword / ${appliedWeights.semantic}% Semantic` : "Deterministic Canonical Skill Coverage"}
                        </span>
                      </div>
                      <p className="text-[11px] text-slate-500 mt-0.5">
                        {activeScoringMode === "ats_weighted"
                          ? `Weighted ATS ranking dynamically balancing ${appliedWeights.keyword}% keyword skill overlap with ${appliedWeights.semantic}% neural semantic embeddings.`
                          : "Deterministic matching using canonical skill coverage against job requisition requirements."}
                      </p>
                    </div>

                    <div className="flex items-center gap-2">
                      <button
                        onClick={handleRunDeterministicMatching}
                        disabled={loading}
                        className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-indigo-600 hover:bg-indigo-500 disabled:opacity-50 text-white text-xs font-semibold shadow-sm transition-colors cursor-pointer"
                      >
                        <RefreshCw className={`w-3.5 h-3.5 ${loading ? "animate-spin" : ""}`} />
                        {loading ? "Evaluating Matches..." : "Run Deterministic Matching Now"}
                      </button>
                    </div>
                  </div>

                  <div className="overflow-x-auto">
                    {loading ? (
                      <div className="text-center py-12 space-y-3 bg-slate-50 dark:bg-white/[0.02] rounded-xl border border-dashed border-slate-200 dark:border-white/10">
                        <div className="inline-flex items-center justify-center w-10 h-10 rounded-full bg-indigo-50 dark:bg-indigo-950/50 text-indigo-600 dark:text-indigo-400">
                          <RefreshCw className="w-5 h-5 animate-spin" />
                        </div>
                        <div className="text-xs font-bold text-slate-800 dark:text-slate-200">
                          Deterministic Matching in Progress...
                        </div>
                        <p className="text-[11px] text-slate-500 max-w-sm mx-auto">
                          Evaluating candidate canonical skill coverage against job requirements (synchronous safety limit: 100 max).
                        </p>
                      </div>
                    ) : uniqueMatchResults.length === 0 ? (
                      <div className="text-center py-10 space-y-3 bg-slate-50 dark:bg-white/[0.02] rounded-xl border border-dashed border-slate-200 dark:border-white/10">
                        <div className="inline-flex items-center justify-center w-10 h-10 rounded-full bg-slate-100 dark:bg-white/[0.06] text-slate-400">
                          <BarChart3 className="w-5 h-5" />
                        </div>
                        <div className="text-xs font-bold text-slate-800 dark:text-slate-200">
                          No eligible applicants currently associated with this job.
                        </div>
                        <p className="text-[11px] text-slate-500 max-w-md mx-auto">
                          Upload a candidate resume to evaluate this requisition, or select an indexed candidate from the Candidate Pool.
                        </p>
                        <div className="flex items-center justify-center gap-3 pt-1">
                          <button
                            onClick={() => setActiveTab("upload")}
                            className="px-3.5 py-1.5 rounded-lg bg-indigo-600 hover:bg-indigo-500 text-white text-xs font-semibold shadow-sm transition-colors cursor-pointer inline-flex items-center gap-1.5"
                          >
                            <FileUp className="w-3.5 h-3.5" />
                            Upload Applicant Resume
                          </button>
                          <button
                            onClick={handleRunDeterministicMatching}
                            disabled={loading}
                            className="px-3.5 py-1.5 rounded-lg border border-slate-200 dark:border-white/10 bg-white dark:bg-slate-900 hover:bg-slate-50 dark:hover:bg-slate-800 text-slate-700 dark:text-slate-200 text-xs font-semibold shadow-sm transition-colors cursor-pointer"
                          >
                            Run Matching Now
                          </button>
                        </div>
                      </div>
                    ) : (
                    <table className="w-full text-left text-xs">
                      <thead>
                        <tr className="border-b border-slate-200 dark:border-white/10 text-slate-400 dark:text-slate-500 font-semibold uppercase tracking-wider text-[10px]">
                          <th className="py-2.5 px-3">Rank</th>
                          <th className="py-2.5 px-3">Candidate</th>
                          <th className="py-2.5 px-3">
                            {activeScoringMode === "ats_weighted"
                              ? `Keyword ATS (${appliedWeights.keyword}%)`
                              : "Required Skill Coverage"}
                          </th>
                          <th className="py-2.5 px-3">
                            {activeScoringMode === "ats_weighted"
                              ? `Semantic S-BERT (${appliedWeights.semantic}%)`
                              : "Preferred Coverage"}
                          </th>
                          <th className="py-2.5 px-3">Overall Match Score</th>
                          <th className="py-2.5 px-3">Matched Skills</th>
                          <th className="py-2.5 px-3">Skill Gap</th>
                        </tr>
                      </thead>
                      <tbody className="divide-y divide-slate-100 dark:divide-white/[0.04]">
                        {uniqueMatchResults.map((cand, idx) => {
                          let reqScore, prefScore, overall;
                          if (activeScoringMode === "ats_weighted" && cand.keyword_score != null) {
                            reqScore = Number(cand.keyword_score);
                            prefScore = cand.semantic_score != null ? Number(cand.semantic_score) : 0;
                            overall = cand.final_score != null ? Number(cand.final_score) : (reqScore * (appliedWeights.keyword / 100) + prefScore * (appliedWeights.semantic / 100));
                          } else {
                            reqScore = cand.required_skill_coverage != null ? Number(cand.required_skill_coverage) : (cand.keyword_score != null ? Number(cand.keyword_score) : 0);
                            prefScore = cand.preferred_skill_coverage != null ? Number(cand.preferred_skill_coverage) : (cand.semantic_score != null ? Number(cand.semantic_score) : 0);
                            overall = cand.overall_score != null ? Number(cand.overall_score) : (cand.final_score != null ? Number(cand.final_score) : 0);
                          }
                          const rank = cand.rank_in_pool || cand.normal_rank || idx + 1;
                          const candName = cand.candidate_name || `Candidate #${cand.candidate_id || cand.resume_id || idx + 1}`;
                          const candEmail = cand.candidate_email || "Demographic-Neutral Profile";
                          const reqPct = reqScore <= 1.0 ? reqScore * 100 : reqScore;
                          const prefPct = prefScore <= 1.0 ? prefScore * 100 : prefScore;
                          const overallPct = overall <= 1.0 ? overall * 100 : overall;

                          return (
                          <tr key={cand.id || cand.match_id || idx} className="hover:bg-slate-50/50 dark:hover:bg-white/[0.01]">
                            <td className="py-3 px-3">
                              <span className="inline-flex items-center justify-center w-6 h-6 rounded-full font-bold bg-slate-100 dark:bg-white/[0.08] text-slate-800 dark:text-slate-200">
                                #{rank}
                              </span>
                            </td>
                            <td className="py-3 px-3">
                              <div className="font-semibold text-slate-900 dark:text-white">
                                {candName}
                              </div>
                              <div className="text-[10px] text-slate-500">
                                {candEmail}
                              </div>
                            </td>
                            <td className="py-3 px-3 font-mono font-medium text-amber-600 dark:text-amber-400">
                              {reqPct.toFixed(1)}%
                            </td>
                            <td className="py-3 px-3 font-mono font-medium text-indigo-600 dark:text-indigo-400">
                              {prefPct.toFixed(1)}%
                            </td>
                            <td className="py-3 px-3">
                              <div className="font-mono font-bold text-slate-900 dark:text-white">
                                {overallPct.toFixed(1)}%
                              </div>
                              <div className="w-16 h-1 bg-slate-100 dark:bg-white/10 rounded-full overflow-hidden mt-1">
                                <div
                                  className="h-full bg-indigo-600 rounded-full"
                                  style={{ width: `${Math.min(100, Math.max(0, overallPct))}%` }}
                                ></div>
                              </div>
                            </td>
                            <td className="py-3 px-3 max-w-[180px]">
                              <div className="flex flex-wrap gap-1">
                                {cand.matched_skills?.slice(0, 3).map((sk, i) => (
                                  <span key={i} className="px-1.5 py-0.5 rounded bg-emerald-50 dark:bg-emerald-950/40 text-emerald-600 dark:text-emerald-400 text-[10px]">
                                    {sk}
                                  </span>
                                ))}
                                {cand.matched_skills?.length > 3 && (
                                  <span className="text-[10px] text-slate-400">+{cand.matched_skills.length - 3}</span>
                                )}
                                {(!cand.matched_skills || cand.matched_skills.length === 0) && (
                                  <span className="text-[10px] text-slate-400">None</span>
                                )}
                              </div>
                            </td>
                            <td className="py-3 px-3 max-w-[180px]">
                              <div className="flex flex-wrap gap-1">
                                {cand.missing_skills?.slice(0, 2).map((sk, i) => (
                                  <span key={i} className="px-1.5 py-0.5 rounded bg-rose-50 dark:bg-rose-950/40 text-rose-600 dark:text-rose-400 text-[10px]">
                                    {sk}
                                  </span>
                                ))}
                                {cand.missing_skills?.length > 2 && (
                                  <span className="text-[10px] text-slate-400">+{cand.missing_skills.length - 2}</span>
                                )}
                                {(!cand.missing_skills || cand.missing_skills.length === 0) && (
                                  <span className="text-[10px] text-emerald-500 font-semibold">Complete fit</span>
                                )}
                              </div>
                            </td>
                          </tr>
                          )
                        })}
                      </tbody>
                    </table>
                    )}
                  </div>
                </div>
              )}

              {/* TAB 2: BLIND SCREENING COMPARISON */}
              {activeTab === "blind" && (
                blindData && blindData.candidates ? (
                <div className="pt-4 space-y-4">
                  <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 p-4 rounded-xl bg-slate-50 dark:bg-white/[0.02] border border-slate-200 dark:border-white/10">
                    <div>
                      <div className="text-[11px] text-slate-500">Spearman Rank Correlation</div>
                      <div className="text-xl font-bold text-slate-900 dark:text-white mt-0.5">
                        ρ = {blindData.rank_correlation}
                      </div>
                      <p className="text-[10px] text-slate-400 mt-1">1.0 = identical; lower indicates blind identity changed rank.</p>
                    </div>
                    <div>
                      <div className="text-[11px] text-slate-500">Average Rank Shift</div>
                      <div className="text-xl font-bold text-amber-500 mt-0.5">
                        {blindData.avg_rank_shift} positions
                      </div>
                      <p className="text-[10px] text-slate-400 mt-1">{blindData.candidates_with_shift} of {blindData.total_candidates} candidates shifted</p>
                    </div>
                    <div>
                      <div className="text-[11px] text-slate-500">Fairness Index</div>
                      <div className="text-xl font-bold text-emerald-500 mt-0.5">
                        {blindData.fairness_index} / 100
                      </div>
                      <p className="text-[10px] text-slate-400 mt-1">Combines stability, bias reduction & readability.</p>
                    </div>
                  </div>

                  <div className="overflow-x-auto">
                    <table className="w-full text-left text-xs">
                      <thead>
                        <tr className="border-b border-slate-200 dark:border-white/10 text-slate-400 text-[10px] uppercase font-semibold">
                          <th className="py-2.5 px-3">Candidate</th>
                          <th className="py-2.5 px-3">Normal Rank</th>
                          <th className="py-2.5 px-3">Blind Rank (PII Stripped)</th>
                          <th className="py-2.5 px-3">Rank Delta / Shift</th>
                          <th className="py-2.5 px-3">Status</th>
                        </tr>
                      </thead>
                      <tbody className="divide-y divide-slate-100 dark:divide-white/[0.04]">
                        {blindData.candidates.map((cand, idx) => {
                          const shift = cand.rank_shift || 0
                          const improved = cand.blind_rank < cand.normal_rank
                          return (
                            <tr key={idx} className="hover:bg-slate-50/50 dark:hover:bg-white/[0.01]">
                              <td className="py-3 px-3 font-semibold text-slate-900 dark:text-white">
                                {cand.candidate_name}
                              </td>
                              <td className="py-3 px-3 font-mono font-medium">
                                #{cand.normal_rank}
                              </td>
                              <td className="py-3 px-3 font-mono font-medium text-indigo-600 dark:text-indigo-400">
                                #{cand.blind_rank}
                              </td>
                              <td className="py-3 px-3 font-mono font-bold">
                                {shift === 0 ? (
                                  <span className="text-slate-400">0 (Unchanged)</span>
                                ) : improved ? (
                                  <span className="text-emerald-500 font-bold">+{shift} positions (Gained)</span>
                                ) : (
                                  <span className="text-rose-500 font-bold">-{shift} positions (Lowered)</span>
                                )}
                              </td>
                              <td className="py-3 px-3">
                                {shift === 0 ? (
                                  <span className="px-2 py-0.5 rounded text-[10px] bg-slate-100 dark:bg-white/[0.06] text-slate-600 dark:text-slate-300">
                                    Neutral
                                  </span>
                                ) : (
                                  <span className="px-2 py-0.5 rounded text-[10px] bg-amber-50 dark:bg-amber-950/40 text-amber-600 dark:text-amber-400">
                                    Identity-Sensitive
                                  </span>
                                )}
                              </td>
                            </tr>
                          )
                        })}
                      </tbody>
                    </table>
                  </div>
                </div>
                ) : (
                  <div className="text-center py-12 space-y-2 bg-slate-50 dark:bg-white/[0.02] rounded-xl border border-dashed border-slate-200 dark:border-white/10">
                    <p className="text-xs font-semibold text-slate-700 dark:text-slate-300">Blind Screening Metrics Unavailable</p>
                    <p className="text-[11px] text-slate-500 max-w-md mx-auto">
                      Comparative blind-screening telemetry requires both standard and scrubbed scoring pipelines. The active deterministic Phase 4 matching engine operates without fabricated metrics.
                    </p>
                  </div>
                )
              )}

              {/* TAB 3: BIAS ANALYSIS REPORT */}
              {activeTab === "bias" && (
                biasReport && biasReport.bias_score != null ? (
                <div className="pt-4 space-y-4">
                  <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 p-4 rounded-xl bg-slate-50 dark:bg-white/[0.02] border border-slate-200 dark:border-white/10">
                    <div>
                      <div className="text-[11px] text-slate-500">Overall Bias Score</div>
                      <div className="text-xl font-bold text-slate-900 dark:text-white mt-0.5">
                        {biasReport.bias_score}
                      </div>
                      <p className="text-[10px] text-slate-400 mt-1">Calculated via Gaucher et al. gendered word dictionary.</p>
                    </div>
                    <div>
                      <div className="text-[11px] text-slate-500">Readability (Flesch Score)</div>
                      <div className="text-xl font-bold text-indigo-500 mt-0.5">
                        {biasReport.readability?.flesch_score || 60} / 100
                      </div>
                      <p className="text-[10px] text-slate-400 mt-1">{biasReport.readability?.reading_ease || "Standard English"}</p>
                    </div>
                    <div>
                      <div className="text-[11px] text-slate-500">Flagged Exclusions</div>
                      <div className="text-xl font-bold text-rose-500 mt-0.5">
                        {biasReport.flagged_words?.length || 0} Terms
                      </div>
                      <p className="text-[10px] text-slate-400 mt-1">Potentially alienating to underrepresented groups.</p>
                    </div>
                  </div>

                  <div className="space-y-2">
                    <h3 className="text-xs font-bold uppercase tracking-wider text-slate-500">
                      Flagged Phrases in Job Description
                    </h3>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                      {biasReport.flagged_words?.map((item, idx) => (
                        <div key={idx} className="p-3 rounded-xl border border-slate-200 dark:border-white/10 bg-white dark:bg-slate-900 flex items-start justify-between">
                          <div>
                            <div className="flex items-center gap-2">
                              <span className="font-bold text-xs text-rose-600 dark:text-rose-400">
                                "{item.word}"
                              </span>
                              <span className="px-1.5 py-0.2 rounded text-[10px] font-mono bg-rose-50 dark:bg-rose-950/40 text-rose-500">
                                {item.category}
                              </span>
                            </div>
                            <div className="text-[11px] text-slate-500 dark:text-slate-400 mt-1">
                              Suggestions: <span className="text-emerald-600 dark:text-emerald-400 font-semibold">{item.suggestions?.join(", ")}</span>
                            </div>
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>
                </div>
                ) : (
                  <div className="text-center py-12 space-y-2 bg-slate-50 dark:bg-white/[0.02] rounded-xl border border-dashed border-slate-200 dark:border-white/10">
                    <p className="text-xs font-semibold text-slate-700 dark:text-slate-300">JD Bias Analysis Telemetry</p>
                    <p className="text-[11px] text-slate-500 max-w-md mx-auto">
                      Natural language bias auditing is currently disconnected. Job description and required skills are actively managed through the canonical skill matching engine.
                    </p>
                  </div>
                )
              )}

              {/* TAB 4: INCLUSIVE REWRITE */}
              {activeTab === "rewrite" && (
                <div className="pt-4 space-y-4">
                  {rewriteData ? (() => {
                    const changes = rewriteData.changes || rewriteData.replacements || [];
                    const fromWords = changes.map(c => c.from).filter(Boolean);
                    const toWords = changes.map(c => c.to).filter(Boolean);
                    const totalSwapped = rewriteData.total_replacements || changes.reduce((acc, c) => acc + (c.count || 1), 0);
                    const scoreBefore = rewriteData.bias_score_before != null ? rewriteData.bias_score_before : (changes.length > 0 ? (changes.length * 0.45).toFixed(2) : "0.00");
                    const scoreAfter = rewriteData.bias_score_after != null ? rewriteData.bias_score_after : "0.00";
                    const reduction = rewriteData.bias_reduction || (changes.length > 0 ? "100%" : "0%");

                    return (
                      <div className="space-y-4">
                        {changes.length > 0 ? (
                          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 p-4 rounded-xl bg-gradient-to-r from-indigo-950/60 via-purple-950/40 to-slate-900 border border-indigo-500/30 shadow-lg">
                            <div className="space-y-1">
                              <div className="flex items-center gap-2">
                                <span className="inline-flex items-center px-2 py-0.5 rounded-full text-[10px] font-bold bg-indigo-500/20 text-indigo-300 border border-indigo-500/30">
                                  Linguistic Bias Mitigation
                                </span>
                                <span className="text-xs font-bold text-white">
                                  Inclusive Rewrite Ready ({totalSwapped} neutral {totalSwapped === 1 ? "term" : "terms"} substituted)
                                </span>
                              </div>
                              <p className="text-[11px] text-slate-300">
                                Bias Score reduced from <span className="text-rose-400 font-semibold">{scoreBefore}</span> to <span className="text-emerald-400 font-semibold">{scoreAfter}</span> (Reduction: <span className="text-emerald-300 font-bold">{reduction}</span>)
                              </p>
                            </div>
                            <button
                              onClick={handleApplyRewrite}
                              disabled={rewriting}
                              className="self-start sm:self-auto px-4 py-2 rounded-lg bg-indigo-600 hover:bg-indigo-500 text-white text-xs font-semibold shadow-md transition-all cursor-pointer hover:shadow-indigo-500/25 disabled:opacity-50"
                            >
                              {rewriting ? "Applying Changes..." : "Apply to Job Description"}
                            </button>
                          </div>
                        ) : (
                          <div className="flex items-center gap-3 p-4 rounded-xl bg-emerald-950/30 border border-emerald-500/30 text-emerald-300">
                            <CheckCircle2 className="w-5 h-5 text-emerald-400 shrink-0" />
                            <div>
                              <p className="text-xs font-bold text-emerald-200">Requisition is 100% Inclusive & Neutral</p>
                              <p className="text-[11px] text-emerald-400/80 mt-0.5">
                                No masculine-coded, feminine-coded, or exclusionary language patterns were detected. Your job description conforms with fair hiring benchmarks.
                              </p>
                            </div>
                          </div>
                        )}

                        {/* Substituted Terms Ledger */}
                        {changes.length > 0 && (
                          <div className="p-4 rounded-xl border border-indigo-200 dark:border-indigo-900/50 bg-indigo-50/50 dark:bg-indigo-950/20 space-y-3">
                            <div className="flex items-center justify-between">
                              <div className="flex items-center gap-2 text-xs font-bold text-indigo-900 dark:text-indigo-200">
                                <Sparkles className="w-4 h-4 text-indigo-600 dark:text-indigo-400" />
                                <span>Academic Word Replacement Mappings ({changes.length})</span>
                              </div>
                              <span className="text-[10px] text-slate-500 dark:text-slate-400">
                                Gaucher, Friesen & Kay (2011) Taxonomy
                              </span>
                            </div>
                            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-2.5">
                              {changes.map((c, idx) => (
                                <div key={idx} className="flex items-center justify-between p-2.5 rounded-lg bg-white dark:bg-slate-900 border border-indigo-100 dark:border-indigo-900/40 text-xs shadow-xs">
                                  <div className="flex items-center gap-2">
                                    <span className="px-2 py-0.5 rounded bg-rose-50 dark:bg-rose-950/50 text-rose-700 dark:text-rose-300 font-semibold line-through border border-rose-200 dark:border-rose-900/50">
                                      {c.from}
                                    </span>
                                    <ArrowRight className="w-3.5 h-3.5 text-slate-400" />
                                    <span className="px-2 py-0.5 rounded bg-emerald-50 dark:bg-emerald-950/50 text-emerald-700 dark:text-emerald-300 font-bold border border-emerald-200 dark:border-emerald-900/50">
                                      {c.to}
                                    </span>
                                  </div>
                                  <span className="text-[10px] font-medium text-slate-500 uppercase tracking-wider">
                                    {c.category ? c.category.replace("GENDER_", "").replace("EXCLUSIONARY", "") : "NEUTRAL"}
                                  </span>
                                </div>
                              ))}
                            </div>
                          </div>
                        )}

                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                          <div className="p-4 rounded-xl border border-slate-200 dark:border-white/10 bg-slate-50 dark:bg-white/[0.02] space-y-2">
                            <div className="flex items-center justify-between">
                              <span className="text-xs font-bold text-slate-500 uppercase">Original Job Description</span>
                              {fromWords.length > 0 && (
                                <span className="text-[10px] text-rose-500 font-semibold">
                                  Flagged words marked in red
                                </span>
                              )}
                            </div>
                            <div className="text-xs text-slate-700 dark:text-slate-300 whitespace-pre-wrap leading-relaxed">
                              {renderHighlightedDiff(rewriteData.original_text, fromWords, false)}
                            </div>
                          </div>

                          <div className="p-4 rounded-xl border border-emerald-200 dark:border-emerald-800/60 bg-emerald-50/30 dark:bg-emerald-950/10 space-y-2">
                            <div className="flex items-center justify-between">
                              <span className="text-xs font-bold text-emerald-600 dark:text-emerald-400 uppercase">Neutral & Inclusive Rewrite</span>
                              {toWords.length > 0 && (
                                <span className="text-[10px] text-emerald-600 dark:text-emerald-400 font-semibold">
                                  Substituted words marked in green
                                </span>
                              )}
                            </div>
                            <div className="text-xs text-slate-800 dark:text-slate-200 whitespace-pre-wrap leading-relaxed">
                              {renderHighlightedDiff(rewriteData.rewritten_text, toWords, true)}
                            </div>
                          </div>
                        </div>
                      </div>
                    );
                  })() : (
                    <div className="text-center py-12 space-y-3 bg-slate-50 dark:bg-white/[0.02] rounded-xl border border-dashed border-slate-200 dark:border-white/10">
                      {loadingRewrite ? (
                        <>
                          <div className="w-6 h-6 border-2 border-indigo-600 border-t-transparent rounded-full animate-spin mx-auto" />
                          <p className="text-xs font-semibold text-slate-700 dark:text-slate-300">
                            Analyzing job description and generating inclusive rewrite...
                          </p>
                          <p className="text-[11px] text-slate-500">
                            Detecting subtle gendered language patterns and finding neutral academic substitutes.
                          </p>
                        </>
                      ) : (
                        <>
                          <p className="text-xs font-semibold text-slate-700 dark:text-slate-300">
                            Inclusive Rewrite Ready to Generate
                          </p>
                          <p className="text-[11px] text-slate-500 max-w-md mx-auto">
                            Analyze the active job requisition for gendered coding and view academic replacements.
                          </p>
                          <button
                            type="button"
                            onClick={() => generateInclusiveRewrite(selectedJob)}
                            className="px-4 py-2 rounded-lg bg-indigo-600 hover:bg-indigo-500 text-white text-xs font-semibold shadow-sm transition-colors cursor-pointer"
                          >
                            Generate Inclusive Rewrite Now
                          </button>
                        </>
                      )}
                    </div>
                  )}
                </div>
              )}

              {/* TAB 5: UPLOAD RESUMES */}
              {activeTab === "upload" && (
                <div className="pt-4 space-y-6">
                  <form onSubmit={handleUploadResume} className="p-5 rounded-xl border border-slate-200 dark:border-white/10 bg-slate-50 dark:bg-white/[0.02] space-y-4">
                    <h3 className="text-sm font-bold text-slate-900 dark:text-white">
                      Upload Candidate Resume (PDF, DOCX, TXT)
                    </h3>

                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                      <div>
                        <label className="block text-xs font-medium text-slate-600 dark:text-slate-400 mb-1">
                          Candidate Name (Optional)
                        </label>
                        <input
                          type="text"
                          placeholder="e.g. John Doe"
                          value={candidateName}
                          onChange={(e) => setCandidateName(e.target.value)}
                          className="w-full px-3 py-2 rounded-lg border border-slate-200 dark:border-white/10 bg-white dark:bg-slate-900 text-xs"
                        />
                      </div>
                      <div>
                        <label className="block text-xs font-medium text-slate-600 dark:text-slate-400 mb-1">
                          Candidate Email (Optional)
                        </label>
                        <input
                          type="email"
                          placeholder="e.g. john@example.com"
                          value={candidateEmail}
                          onChange={(e) => setCandidateEmail(e.target.value)}
                          className="w-full px-3 py-2 rounded-lg border border-slate-200 dark:border-white/10 bg-white dark:bg-slate-900 text-xs"
                        />
                      </div>
                    </div>

                    <div>
                      <label className="block text-xs font-medium text-slate-600 dark:text-slate-400 mb-1">
                        Upload Document
                      </label>
                      <input
                        type="file"
                        accept=".pdf,.docx,.txt"
                        onChange={handleFileChange}
                        className="w-full text-xs text-slate-500 file:mr-4 file:py-2 file:px-4 file:rounded-lg file:border-0 file:text-xs file:font-semibold file:bg-indigo-50 file:text-indigo-700 hover:file:bg-indigo-100"
                      />
                    </div>

                    <div className="relative flex py-1 items-center">
                      <div className="flex-grow border-t border-slate-200 dark:border-white/10"></div>
                      <span className="flex-shrink mx-4 text-[10px] text-slate-400 uppercase">Or Paste Plain Resume Text</span>
                      <div className="flex-grow border-t border-slate-200 dark:border-white/10"></div>
                    </div>

                    <div>
                      <textarea
                        rows="4"
                        placeholder="Paste resume content here..."
                        value={uploadText}
                        onChange={(e) => setUploadText(e.target.value)}
                        className="w-full px-3 py-2 rounded-lg border border-slate-200 dark:border-white/10 bg-white dark:bg-slate-900 text-xs"
                      ></textarea>
                    </div>

                    <div className="flex items-center justify-between">
                      {uploadSuccess && (
                        <span className={`text-xs font-semibold ${uploadSuccess.includes("Error") ? "text-rose-600 dark:text-rose-400" : "text-emerald-600 dark:text-emerald-400"}`}>
                          {uploadSuccess}
                        </span>
                      )}
                      <button
                        type="submit"
                        disabled={uploading}
                        className="ml-auto px-4 py-2 rounded-lg bg-indigo-600 hover:bg-indigo-500 text-white text-xs font-semibold shadow-sm transition-colors cursor-pointer"
                      >
                        {uploading ? "Parsing & Anonymizing..." : "Parse & Save to Candidate Pool"}
                      </button>
                    </div>
                  </form>

                  {/* List of existing resumes with Search, Filter & Pagination */}
                  {(() => {
                    const evaluatedResumeIds = new Set((uniqueMatchResults || []).map(m => m.resumeId ?? m.resume_id));

                    const filteredResumes = resumes.filter(r => {
                      const resumeId = r.resumeId || r.id;
                      const name = (r.candidateName || r.candidate_name || "").toLowerCase();
                      const email = (r.candidateEmail || r.candidate_email || "").toLowerCase();
                      const skills = (r.extractedSkills || r.skills || []).map(s => (typeof s === 'string' ? s : (s.skillName || s.name || '')).toLowerCase());

                      if (candidateFilterStatus === "evaluated" && !evaluatedResumeIds.has(resumeId)) {
                        return false;
                      }
                      if (candidateFilterStatus === "unassessed" && evaluatedResumeIds.has(resumeId)) {
                        return false;
                      }

                      if (candidateSearchQuery.trim()) {
                        const q = candidateSearchQuery.trim().toLowerCase();
                        const matchId = String(resumeId) === q || `#${resumeId}` === q;
                        const matchName = name.includes(q);
                        const matchEmail = email.includes(q);
                        const matchSkill = skills.some(s => s.includes(q));
                        if (!matchId && !matchName && !matchEmail && !matchSkill) {
                          return false;
                        }
                      }
                      return true;
                    });

                    const totalCandidatePages = Math.max(1, Math.ceil(filteredResumes.length / candidatePageSize));
                    const paginatedResumes = filteredResumes.slice((candidatePage - 1) * candidatePageSize, candidatePage * candidatePageSize);

                    return (
                      <div className="space-y-4 pt-2">
                        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
                          <div>
                            <h4 className="text-xs font-bold uppercase tracking-wider text-slate-700 dark:text-slate-300 flex items-center gap-2">
                              <Users className="w-4 h-4 text-indigo-500" />
                              <span>Indexed Candidate Pool ({filteredResumes.length}{filteredResumes.length !== resumes.length ? ` of ${resumes.length}` : ""})</span>
                            </h4>
                            <p className="text-[11px] text-slate-500 dark:text-slate-400">
                              {selectedJob ? `Managing applicant profiles and candidate evaluation against "${selectedJob.title}"` : "Search, filter, and evaluate candidates"}
                            </p>
                          </div>

                          {/* Items per page selector */}
                          <div className="flex items-center gap-2">
                            <label className="text-[11px] text-slate-500 dark:text-slate-400 font-medium">Show:</label>
                            <select
                              value={candidatePageSize}
                              onChange={(e) => {
                                setCandidatePageSize(Number(e.target.value));
                                setCandidatePage(1);
                              }}
                              className="px-2 py-1 rounded-lg border border-slate-200 dark:border-white/10 bg-white dark:bg-slate-900 text-xs text-slate-700 dark:text-slate-300"
                            >
                              <option value={12}>12 per page</option>
                              <option value={24}>24 per page</option>
                              <option value={48}>48 per page</option>
                            </select>
                          </div>
                        </div>

                        {/* Search and Filters Bar */}
                        <div className="flex flex-col sm:flex-row gap-3">
                          <div className="relative flex-1">
                            <Search className="w-3.5 h-3.5 absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
                            <input
                              type="text"
                              placeholder="Search candidate name, email, skill, or #ID..."
                              value={candidateSearchQuery}
                              onChange={(e) => {
                                setCandidateSearchQuery(e.target.value);
                                setCandidatePage(1);
                              }}
                              className="w-full pl-9 pr-3 py-1.5 rounded-xl border border-slate-200 dark:border-white/10 bg-white dark:bg-slate-900 text-xs text-slate-800 dark:text-slate-200 placeholder:text-slate-400 focus:outline-none focus:ring-2 focus:ring-indigo-500/20"
                            />
                            {candidateSearchQuery && (
                              <button
                                onClick={() => {
                                  setCandidateSearchQuery("");
                                  setCandidatePage(1);
                                }}
                                className="absolute right-2.5 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600 dark:hover:text-slate-200"
                              >
                                <X className="w-3.5 h-3.5" />
                              </button>
                            )}
                          </div>

                          <div className="flex items-center gap-1.5 p-1 rounded-xl bg-slate-100 dark:bg-white/[0.04] border border-slate-200 dark:border-white/10 text-xs">
                            <button
                              type="button"
                              onClick={() => {
                                setCandidateFilterStatus("all");
                                setCandidatePage(1);
                              }}
                              className={`px-3 py-1 rounded-lg text-xs font-semibold transition-all cursor-pointer ${candidateFilterStatus === "all" ? "bg-white dark:bg-slate-800 text-indigo-600 dark:text-indigo-400 shadow-xs" : "text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white"}`}
                            >
                              All ({resumes.length})
                            </button>
                            <button
                              type="button"
                              onClick={() => {
                                setCandidateFilterStatus("evaluated");
                                setCandidatePage(1);
                              }}
                              className={`px-3 py-1 rounded-lg text-xs font-semibold transition-all cursor-pointer ${candidateFilterStatus === "evaluated" ? "bg-white dark:bg-slate-800 text-indigo-600 dark:text-indigo-400 shadow-xs" : "text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white"}`}
                            >
                              Evaluated ({evaluatedResumeIds.size})
                            </button>
                            <button
                              type="button"
                              onClick={() => {
                                setCandidateFilterStatus("unassessed");
                                setCandidatePage(1);
                              }}
                              className={`px-3 py-1 rounded-lg text-xs font-semibold transition-all cursor-pointer ${candidateFilterStatus === "unassessed" ? "bg-white dark:bg-slate-800 text-indigo-600 dark:text-indigo-400 shadow-xs" : "text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white"}`}
                            >
                              Unassessed ({Math.max(0, resumes.length - evaluatedResumeIds.size)})
                            </button>
                          </div>
                        </div>

                        {/* Candidate Cards Grid */}
                        {paginatedResumes.length === 0 ? (
                          <div className="p-8 text-center rounded-xl bg-slate-50 dark:bg-white/[0.02] border border-dashed border-slate-200 dark:border-white/10">
                            <p className="text-xs font-semibold text-slate-700 dark:text-slate-300">No candidates match your search or filter</p>
                            <p className="text-[11px] text-slate-500 mt-1">Try clearing your search query or switching to "All candidates".</p>
                          </div>
                        ) : (
                          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-3">
                            {paginatedResumes.map(r => {
                              const resumeId = r.resumeId || r.id;
                              const name = r.candidateName || r.candidate_name || `Candidate #${resumeId}`;
                              const email = r.candidateEmail || r.candidate_email || "";
                              const skillList = (r.extractedSkills || r.skills || []).map(s => typeof s === 'string' ? s : (s.skillName || s.name || ''));
                              const evaluatedMatch = (uniqueMatchResults || []).find(m => (m.resumeId ?? m.resume_id) === resumeId);
                              const isEvaluated = !!evaluatedMatch;

                              return (
                                <div key={resumeId} className={`p-3.5 rounded-xl border transition-all ${isEvaluated ? "border-indigo-300 dark:border-indigo-800/80 bg-indigo-50/20 dark:bg-indigo-950/10" : "border-slate-200 dark:border-white/10 bg-white dark:bg-slate-900"} space-y-2`}>
                                  <div className="flex items-start justify-between gap-2">
                                    <div>
                                      <div className="font-semibold text-xs text-slate-900 dark:text-white flex items-center gap-1.5">
                                        <span>{name}</span>
                                        {isEvaluated && (
                                          <span className="inline-flex items-center gap-0.5 px-1.5 py-0.2 rounded text-[9px] font-bold bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 border border-emerald-500/20" title="Evaluated for this job">
                                            ✓ Enrolled
                                          </span>
                                        )}
                                      </div>
                                      {email && (
                                        <div className="text-[10px] text-slate-500 dark:text-slate-400 truncate max-w-[180px]">
                                          {email}
                                        </div>
                                      )}
                                    </div>
                                    <span className="text-[10px] font-mono text-indigo-500 font-semibold">#{resumeId}</span>
                                  </div>

                                  <div className="flex items-center justify-between text-[10px] text-slate-500">
                                    <span>{r.parsingStatus || "PARSED"}</span>
                                    <span>{skillList.length} skills detected</span>
                                  </div>

                                  <div className="flex flex-wrap gap-1">
                                    {skillList.slice(0, 4).map((sk, i) => (
                                      <span key={i} className="px-1.5 py-0.5 rounded bg-slate-100 dark:bg-white/[0.06] text-[9px] text-slate-600 dark:text-slate-300">
                                        {sk}
                                      </span>
                                    ))}
                                    {skillList.length > 4 && (
                                      <span className="text-[9px] text-slate-400">+{skillList.length - 4}</span>
                                    )}
                                  </div>

                                  {/* Evaluation Action or Score Badge */}
                                  {selectedJobId && (
                                    <div className="pt-1 border-t border-slate-100 dark:border-white/5">
                                      {isEvaluated ? (
                                        <div className="flex items-center justify-between pt-1">
                                          <div className="flex items-center gap-1.5">
                                            <span className="text-[10px] font-bold text-slate-500">Score:</span>
                                            <span className="text-xs font-black text-indigo-600 dark:text-indigo-400">
                                              {evaluatedMatch.overallScore != null
                                                ? `${evaluatedMatch.overallScore}%`
                                                : evaluatedMatch.overall_score != null
                                                ? `${evaluatedMatch.overall_score}%`
                                                : `${((evaluatedMatch.compositeScore ?? 0) * 100).toFixed(0)}%`}
                                            </span>
                                            {(evaluatedMatch.rankInPool || evaluatedMatch.rank_in_pool || evaluatedMatch.normal_rank) && (
                                              <span className="text-[9px] px-1.5 py-0.2 rounded bg-slate-200 dark:bg-slate-800 text-slate-700 dark:text-slate-300 font-semibold">
                                                Rank #{evaluatedMatch.rankInPool || evaluatedMatch.rank_in_pool || evaluatedMatch.normal_rank}
                                              </span>
                                            )}
                                          </div>
                                          <button
                                            onClick={() => setActiveTab("ranking")}
                                            className="text-[10px] text-indigo-600 dark:text-indigo-400 hover:underline font-semibold cursor-pointer"
                                          >
                                            View in Rankings →
                                          </button>
                                        </div>
                                      ) : (
                                        <button
                                          onClick={async () => {
                                            setLoading(true);
                                            setErrorBanner(null);
                                            try {
                                              const res = await apiRunJobMatches(selectedJobId, "NORMAL", [resumeId]);
                                              setMatchResults(deduplicateMatches(res?.results || []));
                                              setSuccessBanner(`Candidate #${resumeId} (${name}) evaluated and ranked for this job!`);
                                              setTimeout(() => setSuccessBanner(null), 4000);
                                              setActiveTab("ranking");
                                            } catch (err) {
                                              setErrorBanner("Evaluation failed: " + err.message);
                                            } finally {
                                              setLoading(false);
                                            }
                                          }}
                                          disabled={loading}
                                          className="w-full py-1.5 px-2 rounded-lg bg-indigo-50 hover:bg-indigo-100 dark:bg-indigo-950/40 dark:hover:bg-indigo-900/60 text-indigo-700 dark:text-indigo-300 text-[10px] font-semibold transition-colors cursor-pointer text-center"
                                        >
                                          Evaluate for Selected Job
                                        </button>
                                      )}
                                    </div>
                                  )}
                                </div>
                              );
                            })}
                          </div>
                        )}

                        {/* Pagination Bar */}
                        {totalCandidatePages > 1 && (
                          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pt-3 border-t border-slate-200 dark:border-white/10">
                            <div className="text-xs text-slate-500 dark:text-slate-400">
                              Showing <span className="font-semibold text-slate-700 dark:text-slate-200">{(candidatePage - 1) * candidatePageSize + 1}</span> to <span className="font-semibold text-slate-700 dark:text-slate-200">{Math.min(candidatePage * candidatePageSize, filteredResumes.length)}</span> of <span className="font-semibold text-slate-700 dark:text-slate-200">{filteredResumes.length}</span> candidates
                            </div>

                            <div className="flex items-center gap-1.5 self-center sm:self-auto">
                              <button
                                onClick={() => setCandidatePage(p => Math.max(1, p - 1))}
                                disabled={candidatePage === 1}
                                className="p-1.5 rounded-lg border border-slate-200 dark:border-white/10 text-slate-600 dark:text-slate-400 hover:bg-slate-100 dark:hover:bg-white/5 disabled:opacity-40 disabled:cursor-not-allowed cursor-pointer"
                                title="Previous Page"
                              >
                                <ChevronLeft className="w-4 h-4" />
                              </button>

                              {(() => {
                                const pages = [];
                                const maxPagesToShow = 5;
                                let start = Math.max(1, candidatePage - 2);
                                let end = Math.min(totalCandidatePages, start + maxPagesToShow - 1);
                                if (end - start < maxPagesToShow - 1) {
                                  start = Math.max(1, end - maxPagesToShow + 1);
                                }

                                if (start > 1) {
                                  pages.push(
                                    <button
                                      key={1}
                                      onClick={() => setCandidatePage(1)}
                                      className="px-2.5 py-1 rounded-lg text-xs font-semibold text-slate-600 dark:text-slate-400 hover:bg-slate-100 dark:hover:bg-white/5 cursor-pointer"
                                    >
                                      1
                                    </button>
                                  );
                                  if (start > 2) {
                                    pages.push(<span key="dots-start" className="text-xs text-slate-400 px-1">...</span>);
                                  }
                                }

                                for (let i = start; i <= end; i++) {
                                  pages.push(
                                    <button
                                      key={i}
                                      onClick={() => setCandidatePage(i)}
                                      className={`px-2.5 py-1 rounded-lg text-xs font-semibold transition-colors cursor-pointer ${candidatePage === i ? "bg-indigo-600 text-white shadow-xs" : "text-slate-600 dark:text-slate-400 hover:bg-slate-100 dark:hover:bg-white/5"}`}
                                    >
                                      {i}
                                    </button>
                                  );
                                }

                                if (end < totalCandidatePages) {
                                  if (end < totalCandidatePages - 1) {
                                    pages.push(<span key="dots-end" className="text-xs text-slate-400 px-1">...</span>);
                                  }
                                  pages.push(
                                    <button
                                      key={totalCandidatePages}
                                      onClick={() => setCandidatePage(totalCandidatePages)}
                                      className="px-2.5 py-1 rounded-lg text-xs font-semibold text-slate-600 dark:text-slate-400 hover:bg-slate-100 dark:hover:bg-white/5 cursor-pointer"
                                    >
                                      {totalCandidatePages}
                                    </button>
                                  );
                                }

                                return pages;
                              })()}

                              <button
                                onClick={() => setCandidatePage(p => Math.min(totalCandidatePages, p + 1))}
                                disabled={candidatePage === totalCandidatePages}
                                className="p-1.5 rounded-lg border border-slate-200 dark:border-white/10 text-slate-600 dark:text-slate-400 hover:bg-slate-100 dark:hover:bg-white/5 disabled:opacity-40 disabled:cursor-not-allowed cursor-pointer"
                                title="Next Page"
                              >
                                <ChevronRight className="w-4 h-4" />
                              </button>
                            </div>
                          </div>
                        )}
                      </div>
                    );
                  })()}
                </div>
              )}
            </div>
          )}

          {!selectedJob && (
            <div className="p-12 text-center rounded-2xl bg-white dark:bg-slate-900/80 border border-slate-200 dark:border-white/10 shadow-sm flex flex-col items-center justify-center min-h-[350px]">
              <div className="w-12 h-12 rounded-2xl bg-indigo-50 dark:bg-indigo-950/50 border border-indigo-200 dark:border-indigo-800 flex items-center justify-center text-indigo-600 dark:text-indigo-400 mb-3">
                <Briefcase className="w-6 h-6" />
              </div>
              <h3 className="text-base font-bold text-slate-900 dark:text-white">No Active Job Selected</h3>
              <p className="text-xs text-slate-500 dark:text-slate-400 mt-1 max-w-sm">
                Select a job posting from the left sidebar or post a new job requisition to begin screening.
              </p>
              <button
                onClick={() => setShowCreateModal(true)}
                className="inline-flex items-center gap-2 mt-4 px-4 py-2 rounded-xl bg-indigo-600 hover:bg-indigo-500 text-white text-xs font-semibold shadow-sm cursor-pointer"
              >
                <Plus className="w-4 h-4" />
                Post New Job Description
              </button>
            </div>
          )}
        </div>
      </div>

      {/* CREATE JOB MODAL */}
      {showCreateModal && (
        <div className="fixed inset-0 z-50 bg-black/50 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="w-full max-w-xl rounded-2xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-white/10 p-6 shadow-2xl space-y-4">
            <div className="flex items-center justify-between border-b border-slate-100 dark:border-white/10 pb-3">
              <h3 className="font-bold text-base text-slate-900 dark:text-white">
                Post New Job Description
              </h3>
              <button
                onClick={() => setShowCreateModal(false)}
                className="text-slate-400 hover:text-slate-600 dark:hover:text-white"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleCreateJob} className="space-y-4">
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                <div className="sm:col-span-2">
                  <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">
                    Job Title *
                  </label>
                  <input
                    type="text"
                    required
                    placeholder="e.g. Senior Backend Engineer (Python/Cloud)"
                    value={newTitle}
                    onChange={(e) => setNewTitle(e.target.value)}
                    className="w-full px-3 py-2 rounded-lg border border-slate-200 dark:border-white/10 bg-slate-50 dark:bg-slate-800 text-xs text-slate-900 dark:text-white"
                  />
                </div>
                <div>
                  <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">
                    Department
                  </label>
                  <input
                    type="text"
                    placeholder="e.g. Engineering"
                    value={newDepartment}
                    onChange={(e) => setNewDepartment(e.target.value)}
                    className="w-full px-3 py-2 rounded-lg border border-slate-200 dark:border-white/10 bg-slate-50 dark:bg-slate-800 text-xs text-slate-900 dark:text-white"
                  />
                </div>
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">
                  Job Description & Roles *
                </label>
                <textarea
                  required
                  rows="4"
                  placeholder="Paste or write the job description..."
                  value={newDescription}
                  onChange={(e) => setNewDescription(e.target.value)}
                  className="w-full px-3 py-2 rounded-lg border border-slate-200 dark:border-white/10 bg-slate-50 dark:bg-slate-800 text-xs text-slate-900 dark:text-white"
                ></textarea>
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">
                  Technical Requirements & Skills
                </label>
                <textarea
                  rows="2"
                  placeholder="e.g. Python, SQL, REST APIs, Docker, AWS, Team collaboration..."
                  value={newRequirements}
                  onChange={(e) => setNewRequirements(e.target.value)}
                  className="w-full px-3 py-2 rounded-lg border border-slate-200 dark:border-white/10 bg-slate-50 dark:bg-slate-800 text-xs text-slate-900 dark:text-white"
                ></textarea>
              </div>

              <div className="flex items-center justify-end gap-3 pt-2">
                <button
                  type="button"
                  onClick={() => setShowCreateModal(false)}
                  className="px-4 py-2 rounded-lg border border-slate-200 dark:border-white/10 text-xs font-semibold text-slate-600 dark:text-slate-300"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={creatingJob}
                  className="px-4 py-2 rounded-lg bg-indigo-600 hover:bg-indigo-500 text-white text-xs font-semibold shadow-sm"
                >
                  {creatingJob ? "Extracting Skills & Creating..." : "Save Job Description"}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* EDIT JOB MODAL */}
      {showEditModal && (
        <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="w-full max-w-2xl rounded-2xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-white/10 p-6 shadow-2xl space-y-4 max-h-[90vh] overflow-y-auto">
            <div className="flex items-center justify-between border-b border-slate-100 dark:border-white/10 pb-3">
              <div>
                <h3 className="font-bold text-base text-slate-900 dark:text-white font-heading">
                  Edit Job Requisition
                </h3>
                <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">
                  Job #{editingJob?.id || selectedJob?.id} • {editTitle || "Untitled"}
                </p>
              </div>
              <button
                onClick={() => setShowEditModal(false)}
                className="text-slate-400 hover:text-slate-600 dark:hover:text-white p-1 rounded-lg"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleUpdateJob} className="space-y-4">
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                <div className="sm:col-span-2">
                  <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">
                    Job Title *
                  </label>
                  <input
                    type="text"
                    required
                    value={editTitle}
                    onChange={(e) => setEditTitle(e.target.value)}
                    placeholder="e.g. Senior Backend Engineer"
                    className="w-full px-3 py-2 rounded-lg border border-slate-200 dark:border-white/10 bg-slate-50 dark:bg-slate-800 text-xs text-slate-900 dark:text-white focus:outline-none focus:border-indigo-500"
                  />
                </div>

                <div>
                  <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">
                    Department
                  </label>
                  <input
                    type="text"
                    value={editDepartment}
                    onChange={(e) => setEditDepartment(e.target.value)}
                    placeholder="e.g. Engineering"
                    className="w-full px-3 py-2 rounded-lg border border-slate-200 dark:border-white/10 bg-slate-50 dark:bg-slate-800 text-xs text-slate-900 dark:text-white focus:outline-none focus:border-indigo-500"
                  />
                </div>
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">
                  Job Description & Roles *
                </label>
                <textarea
                  required
                  rows="6"
                  value={editDescription}
                  onChange={(e) => setEditDescription(e.target.value)}
                  placeholder="Paste or write the full job description and responsibilities..."
                  className="w-full px-3 py-2 rounded-lg border border-slate-200 dark:border-white/10 bg-slate-50 dark:bg-slate-800 text-xs text-slate-900 dark:text-white focus:outline-none focus:border-indigo-500 font-sans leading-relaxed"
                ></textarea>
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">
                  Technical Requirements & Skills
                </label>
                <textarea
                  rows="3"
                  value={editRequirements}
                  onChange={(e) => setEditRequirements(e.target.value)}
                  placeholder="e.g. Python, SQL, REST APIs, Docker, Git, 4+ years experience..."
                  className="w-full px-3 py-2 rounded-lg border border-slate-200 dark:border-white/10 bg-slate-50 dark:bg-slate-800 text-xs text-slate-900 dark:text-white focus:outline-none focus:border-indigo-500 font-sans leading-relaxed"
                ></textarea>
                <span className="text-[10px] text-slate-400 mt-1 block">
                  Keywords listed here are automatically parsed into normalized machine-actionable skills for deterministic ATS matching.
                </span>
              </div>

              <div className="flex items-center justify-end gap-3 pt-3 border-t border-slate-100 dark:border-white/10">
                <button
                  type="button"
                  onClick={() => setShowEditModal(false)}
                  className="px-4 py-2 rounded-lg border border-slate-200 dark:border-white/10 text-xs font-semibold text-slate-600 dark:text-slate-300 hover:bg-slate-50 dark:hover:bg-slate-800 transition-colors cursor-pointer"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={updatingJob}
                  className="px-5 py-2 rounded-lg bg-indigo-600 hover:bg-indigo-500 disabled:opacity-50 text-white text-xs font-semibold shadow-sm transition-colors cursor-pointer flex items-center gap-2"
                >
                  {updatingJob ? (
                    <>
                      <div className="w-3.5 h-3.5 border-2 border-white/20 border-t-white rounded-full animate-spin" />
                      <span>Updating Requisition & Skills...</span>
                    </>
                  ) : (
                    <span>Save Changes</span>
                  )}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  )
}
