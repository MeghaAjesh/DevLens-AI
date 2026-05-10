"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { createClient } from "@/lib/supabase";
import Logo from "@/components/Logo";
import {
  Search,
  ArrowRight,
  GitPullRequest,
  Loader2,
  AlertCircle,
  CheckCircle2,
  XCircle,
  MessageSquare,
  ChevronDown,
  ChevronUp,
  FileCode,
  LogOut,
  Folder,
} from "lucide-react";

// ── Design tokens ─────────────────────────────────────────────────────────────

const gradientBg = {
  background: "linear-gradient(135deg, #0f0c29 0%, #302b63 50%, #24243e 100%)",
  minHeight: "100vh",
};

const glassmorphism = {
  background: "rgba(255,255,255,0.05)",
  backdropFilter: "blur(16px)",
  WebkitBackdropFilter: "blur(16px)",
  border: "1px solid rgba(255,255,255,0.10)",
};

const accentCoral = "#FF6B6B";
const accentMint = "#4ECDC4";

// ── Sub-components ────────────────────────────────────────────────────────────

function ReviewSection({ emoji, title, content, color, borderLeftColor }) {
  const [open, setOpen] = useState(true);
  if (!content) return null;
  return (
    <div
      className="rounded-xl overflow-hidden"
      style={{ border: `1px solid ${color}22`, ...(borderLeftColor ? { borderLeft: `4px solid ${borderLeftColor}` } : {}) }}
    >
      <button
        onClick={() => setOpen((o) => !o)}
        className="w-full flex items-center justify-between px-5 py-3 text-left transition-colors duration-200"
        style={{ background: `${color}11` }}
      >
        <span className="flex items-center gap-2 font-semibold text-sm" style={{ color }}>
          <span className="text-lg">{emoji}</span>
          {title}
        </span>
        {open ? <ChevronUp size={16} color="#94a3b8" /> : <ChevronDown size={16} color="#94a3b8" />}
      </button>
      {open && (
        <div
          className="px-5 py-4 text-sm leading-relaxed whitespace-pre-wrap"
          style={{ color: "#CBD5E1", background: "rgba(0,0,0,0.15)" }}
        >
          {content}
        </div>
      )}
    </div>
  );
}

function VerdictBadge({ verdict }) {
  if (!verdict) return null;
  const upper = verdict.toUpperCase();
  const isApprove = upper.includes("APPROVE");
  const isRequest = upper.includes("REQUEST");
  const color = isApprove ? accentMint : isRequest ? accentCoral : "#fbbf24";
  const Icon = isApprove ? CheckCircle2 : isRequest ? XCircle : MessageSquare;
  const label = isApprove
    ? "APPROVE"
    : isRequest
    ? "REQUEST CHANGES"
    : "NEEDS DISCUSSION";

  return (
    <div
      className="inline-flex items-center gap-2 px-4 py-2 rounded-xl text-sm font-bold"
      style={{
        background: `${color}18`,
        border: `1px solid ${color}44`,
        color,
      }}
    >
      <Icon size={16} />
      {label}
    </div>
  );
}

function ReviewCard({ data }) {
  const { pr, sections } = data;

  return (
    <div
      className="rounded-2xl overflow-hidden mt-8"
      style={{
        ...glassmorphism,
        boxShadow: "0 24px 48px rgba(0,0,0,0.4)",
        border: `1px solid rgba(78,205,196,0.25)`,
      }}
    >
      {/* Header */}
      <div
        className="px-6 py-5 flex flex-col sm:flex-row sm:items-center gap-3 justify-between"
        style={{
          background: "linear-gradient(90deg, rgba(78,205,196,0.08), rgba(255,107,107,0.06))",
          borderBottom: "1px solid rgba(255,255,255,0.07)",
        }}
      >
        <div className="flex items-center gap-3">
          <div
            className="w-10 h-10 rounded-xl flex items-center justify-center"
            style={{ background: "rgba(78,205,196,0.12)", border: `1px solid rgba(78,205,196,0.25)` }}
          >
            <FileCode size={20} color={accentMint} />
          </div>
          <div>
            <p className="font-bold text-white text-sm">
              {pr.owner}/{pr.repo} — PR #{pr.pullNumber}
            </p>
            <p className="text-xs mt-0.5" style={{ color: "#64748b" }}>
              {pr.filesChanged} file{pr.filesChanged !== 1 ? "s" : ""} analyzed · powered by LLaMA 3.3 70B
            </p>
          </div>
        </div>
        <VerdictBadge verdict={sections?.verdict} />
      </div>

      {/* Sections */}
      <div className="p-6 flex flex-col gap-4">
        <ReviewSection emoji="📋" title="SUMMARY"      content={sections?.summary}      color={accentMint} />
        <ReviewSection emoji="🐛" title="BUGS"         content={sections?.bugs}         color="#f87171" />
        <ReviewSection emoji="🔒" title="SECURITY"     content={sections?.security}     color="#fbbf24" />
        <ReviewSection emoji="💡" title="IMPROVEMENTS" content={sections?.improvements} color="#a78bfa" />
        {/* Verdict detail */}
        {sections?.verdict && (
          <div
            className="rounded-xl px-5 py-4 text-sm leading-relaxed whitespace-pre-wrap"
            style={{
              background: "rgba(0,0,0,0.2)",
              border: "1px solid rgba(255,255,255,0.06)",
              color: "#CBD5E1",
            }}
          >
            <span className="font-semibold text-white">✅ VERDICT &nbsp;</span>
            {sections.verdict}
          </div>
        )}
      </div>
    </div>
  );
}

// ── Dashboard Client ──────────────────────────────────────────────────────────

function CircularProgress({ score }) {
  const radius = 36;
  const circumference = 2 * Math.PI * radius;
  // Ensure score is within 0-100
  const validScore = Math.max(0, Math.min(100, Number(score) || 0));
  const strokeDashoffset = circumference - (validScore / 100) * circumference;

  return (
    <div className="relative inline-flex items-center justify-center">
      <svg className="transform -rotate-90 w-24 h-24">
        <circle
          cx="48"
          cy="48"
          r={radius}
          stroke="#334155"
          strokeWidth="8"
          fill="transparent"
        />
        <circle
          cx="48"
          cy="48"
          r={radius}
          stroke={accentCoral}
          strokeWidth="8"
          fill="transparent"
          strokeDasharray={circumference}
          strokeDashoffset={strokeDashoffset}
          strokeLinecap="round"
          className="transition-all duration-1000 ease-out"
        />
      </svg>
      <span className="absolute text-2xl font-bold text-white">{validScore}</span>
    </div>
  );
}

function AuditCard({ data }) {
  const { repo, scannedFiles, audit } = data;

  return (
    <div
      className="rounded-2xl overflow-hidden mt-8"
      style={{
        ...glassmorphism,
        boxShadow: "0 24px 48px rgba(0,0,0,0.4)",
        border: `1px solid rgba(255,107,107,0.25)`,
      }}
    >
      <div
        className="px-6 py-5 flex flex-col sm:flex-row sm:items-center gap-6 justify-between"
        style={{
          background: "linear-gradient(90deg, rgba(255,107,107,0.08), rgba(78,205,196,0.06))",
          borderBottom: "1px solid rgba(255,255,255,0.07)",
        }}
      >
        <div className="flex items-center gap-3">
          <div
            className="w-10 h-10 rounded-xl flex items-center justify-center"
            style={{ background: "rgba(255,107,107,0.12)", border: `1px solid rgba(255,107,107,0.25)` }}
          >
            <Folder size={20} color={accentCoral} />
          </div>
          <div>
            <p className="font-bold text-white text-sm">
              {repo.owner}/{repo.repo}
            </p>
            <p className="text-xs mt-0.5" style={{ color: "#64748b" }}>
              {scannedFiles.length} file{scannedFiles.length !== 1 ? "s" : ""} scanned · powered by LLaMA 3.3 70B
            </p>
          </div>
        </div>
        <div className="flex flex-col items-center">
          <p className="text-xs font-bold text-slate-400 mb-1 uppercase tracking-wider">Health Score</p>
          <CircularProgress score={audit?.score} />
        </div>
      </div>

      <div className="p-6 flex flex-col gap-4">
        <ReviewSection emoji="📝" title="OVERVIEW" content={audit?.overview} color={accentMint} borderLeftColor="#a855f7" />
        <ReviewSection emoji="🚨" title="CRITICAL ISSUES" content={audit?.critical_issues} color="#f87171" borderLeftColor="#ef4444" />
        <ReviewSection emoji="🔒" title="SECURITY VULNERABILITIES" content={audit?.security_vulnerabilities} color="#fbbf24" borderLeftColor="#f97316" />
        <ReviewSection emoji="🛠️" title="CODE QUALITY" content={audit?.code_quality} color="#60a5fa" borderLeftColor="#3b82f6" />
        <ReviewSection emoji="✨" title="QUICK WINS" content={audit?.quick_wins} color="#34d399" borderLeftColor="#22c55e" />

        {scannedFiles && scannedFiles.length > 0 && (
          <div className="mt-4 pt-4 border-t border-white/10">
            <p className="text-xs font-semibold text-slate-400 mb-3 uppercase tracking-wider">Files Scanned</p>
            <div className="flex flex-wrap gap-2">
              {scannedFiles.map((f, i) => (
                <span key={i} className="text-xs px-2 py-1 rounded bg-white/5 border border-white/10 text-slate-300">
                  {f}
                </span>
              ))}
            </div>
          </div>
        )}
      </div>
    </div>
  );
}

export default function DashboardClient({ user }) {
  const router = useRouter();
  const supabase = createClient();

  const [activeTab, setActiveTab] = useState("pr");

  const [prUrl, setPrUrl] = useState("");
  const [loading, setLoading] = useState(false);
  const [result, setResult] = useState(null);
  const [error, setError] = useState(null);

  const [repoUrl, setRepoUrl] = useState("");
  const [auditLoading, setAuditLoading] = useState(false);
  const [auditResult, setAuditResult] = useState(null);
  const [auditError, setAuditError] = useState(null);

  async function handleSignOut() {
    await supabase.auth.signOut();
    router.push("/");
    router.refresh();
  }

  async function handleAnalyze() {
    if (!prUrl.trim()) {
      setError("Please enter a GitHub PR URL.");
      return;
    }
    setError(null);
    setResult(null);
    setLoading(true);

    try {
      const res = await fetch("/api/review", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ prUrl: prUrl.trim() }),
      });
      const data = await res.json();

      if (!res.ok || !data.success) {
        setError(data.error ?? "Something went wrong. Please try again.");
      } else {
        setResult(data);
      }
    } catch {
      setError("Network error — please check your connection and try again.");
    } finally {
      setLoading(false);
    }
  }

  function handleKeyDown(e) {
    if (e.key === "Enter") handleAnalyze();
  }

  async function handleAudit() {
    if (!repoUrl.trim()) {
      setAuditError("Please enter a GitHub repo URL.");
      return;
    }
    setAuditError(null);
    setAuditResult(null);
    setAuditLoading(true);

    try {
      const res = await fetch("/api/audit", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ repoUrl: repoUrl.trim() }),
      });
      const data = await res.json();

      if (!res.ok || !data.success) {
        setAuditError(data.error ?? "Something went wrong. Please try again.");
      } else {
        setAuditResult(data);
      }
    } catch {
      setAuditError("Network error — please check your connection and try again.");
    } finally {
      setAuditLoading(false);
    }
  }

  function handleAuditKeyDown(e) {
    if (e.key === "Enter") handleAudit();
  }

  return (
    <div style={gradientBg} className="font-sans text-white min-h-screen flex flex-col">
      {/* ── Animated background orbs ── */}
      <div className="fixed inset-0 pointer-events-none overflow-hidden">
        <div className="absolute rounded-full opacity-10 blur-3xl animate-pulse"
          style={{ width: 600, height: 600, top: "-15%", left: "-10%",
            background: "radial-gradient(circle, #FF6B6B 0%, transparent 70%)", animationDuration: "6s" }} />
        <div className="absolute rounded-full opacity-10 blur-3xl animate-pulse"
          style={{ width: 500, height: 500, bottom: "-10%", right: "-5%",
            background: "radial-gradient(circle, #4ECDC4 0%, transparent 70%)", animationDuration: "8s", animationDelay: "2s" }} />
      </div>

      {/* ── Navbar ── */}
      <nav className="sticky top-0 z-50 px-6 py-4"
        style={{ ...glassmorphism, borderLeft: "none", borderRight: "none", borderTop: "none" }}>
        <div className="max-w-6xl mx-auto flex items-center justify-between">
          <Logo />
          
          <div className="flex items-center gap-6">
            <span className="hidden md:inline-block text-sm font-medium" style={{ color: "#CBD5E1" }}>
              {user?.email}
            </span>
            <button 
              onClick={handleSignOut}
              className="flex items-center gap-2 px-4 py-2 rounded-xl text-sm font-semibold transition-all duration-200 hover:bg-white/10"
              style={{ border: "1px solid rgba(255,255,255,0.15)" }}>
              <LogOut size={16} color={accentCoral} />
              Sign Out
            </button>
          </div>
        </div>
      </nav>

      {/* ── Main Content ── */}
      <main className="flex-1 relative max-w-4xl mx-auto w-full px-6 py-12">
        <div className="text-center mb-10">
          <h1 className="text-3xl md:text-5xl font-extrabold tracking-tight mb-4">
            Dashboard
          </h1>
          <p className="text-lg mb-8" style={{ color: "#CBD5E1" }}>
            Ready to review your next pull request or audit a codebase?
          </p>

          {/* Tab Switcher */}
          <div className="inline-flex rounded-xl p-1 mb-2" style={{ ...glassmorphism, background: "rgba(0,0,0,0.2)" }}>
            <button
              onClick={() => setActiveTab("pr")}
              className={`px-6 py-2.5 rounded-lg text-sm font-semibold transition-all duration-200 ${
                activeTab === "pr" ? "bg-white/10 text-white shadow-sm" : "text-slate-400 hover:text-slate-200 hover:bg-white/5"
              }`}
              style={activeTab === "pr" ? { borderBottom: `2px solid ${accentMint}` } : { borderBottom: "2px solid transparent" }}
            >
              PR Review
            </button>
            <button
              onClick={() => setActiveTab("audit")}
              className={`px-6 py-2.5 rounded-lg text-sm font-semibold transition-all duration-200 ${
                activeTab === "audit" ? "bg-white/10 text-white shadow-sm" : "text-slate-400 hover:text-slate-200 hover:bg-white/5"
              }`}
              style={activeTab === "audit" ? { borderBottom: `2px solid ${accentCoral}`, color: accentCoral } : { borderBottom: "2px solid transparent" }}
            >
              Repo Audit
            </button>
          </div>
        </div>

        {activeTab === "pr" && (
          <>
            {/* PR Input Card */}
        <div className="max-w-2xl mx-auto rounded-2xl mb-12"
          style={{ background: `linear-gradient(135deg, rgba(255,107,107,0.3), rgba(78,205,196,0.3))`, padding: "1px" }}>
          <div className="rounded-2xl p-6" style={glassmorphism}>
            <p className="text-xs font-semibold uppercase tracking-widest mb-3 text-left" style={{ color: accentMint }}>
              Paste GitHub PR URL
            </p>
            <div className="flex flex-col sm:flex-row gap-3">
              <div className="flex-1 flex items-center gap-3 rounded-xl px-4 py-3"
                style={{ background: "rgba(255,255,255,0.07)", border: "1px solid rgba(255,255,255,0.12)" }}>
                <GitPullRequest size={18} color="#94a3b8" className="shrink-0" />
                <input
                  type="url"
                  id="pr-url-input"
                  placeholder="https://github.com/owner/repo/pull/123"
                  value={prUrl}
                  onChange={(e) => { setPrUrl(e.target.value); setError(null); }}
                  onKeyDown={handleKeyDown}
                  disabled={loading}
                  className="flex-1 bg-transparent outline-none text-sm placeholder-slate-500 text-white disabled:opacity-50"
                />
              </div>
              <button
                id="analyze-pr-btn"
                onClick={handleAnalyze}
                disabled={loading}
                className="flex items-center justify-center gap-2 px-6 py-3 rounded-xl font-semibold text-sm transition-all duration-200 hover:scale-105 active:scale-95 disabled:opacity-60 disabled:cursor-not-allowed disabled:hover:scale-100 whitespace-nowrap"
                style={{ background: `linear-gradient(135deg, ${accentCoral}, #ff8e53)`, boxShadow: `0 0 28px rgba(255,107,107,0.5)` }}>
                {loading
                  ? <><Loader2 size={16} className="animate-spin" /> Analyzing…</>
                  : <><Search size={16} /> Analyze PR <ArrowRight size={16} /></>}
              </button>
            </div>
          </div>
        </div>

        {/* Error message */}
        {error && (
          <div className="max-w-2xl mx-auto mt-4 flex items-start gap-3 rounded-xl px-5 py-4 text-sm text-left"
            style={{ background: "rgba(255,107,107,0.10)", border: "1px solid rgba(255,107,107,0.30)", color: "#fca5a5" }}>
            <AlertCircle size={18} className="shrink-0 mt-0.5" color={accentCoral} />
            <span>{error}</span>
          </div>
        )}

        {/* Loading skeleton */}
        {loading && (
          <div className="max-w-2xl mx-auto mt-8 rounded-2xl p-6 flex flex-col gap-4"
            style={{ ...glassmorphism, border: `1px solid rgba(78,205,196,0.2)` }}>
            <div className="flex items-center gap-3 mb-2">
              <Loader2 size={20} color={accentMint} className="animate-spin shrink-0" />
              <p className="text-sm font-medium" style={{ color: accentMint }}>
                Fetching diff and running AI review…
              </p>
            </div>
            {[80, 60, 90, 50].map((w, i) => (
              <div key={i} className="h-3 rounded-full animate-pulse"
                style={{ width: `${w}%`, background: "rgba(255,255,255,0.08)" }} />
            ))}
          </div>
        )}

        {/* Review result */}
        {result && !loading && (
          <div className="max-w-2xl mx-auto">
            <ReviewCard data={result} />
          </div>
        )}
          </>
        )}

        {activeTab === "audit" && (
          <>
            {/* Repo Audit Input Card */}
            <div className="max-w-2xl mx-auto rounded-2xl mb-12"
              style={{ background: `linear-gradient(135deg, rgba(255,107,107,0.3), rgba(255,142,83,0.3))`, padding: "1px" }}>
              <div className="rounded-2xl p-6" style={glassmorphism}>
                <p className="text-xs font-semibold uppercase tracking-widest mb-3 text-left" style={{ color: accentCoral }}>
                  Paste GitHub Repo URL
                </p>
                <div className="flex flex-col sm:flex-row gap-3">
                  <div className="flex-1 flex items-center gap-3 rounded-xl px-4 py-3"
                    style={{ background: "rgba(255,255,255,0.07)", border: "1px solid rgba(255,255,255,0.12)" }}>
                    <Folder size={18} color="#94a3b8" className="shrink-0" />
                    <input
                      type="url"
                      id="repo-url-input"
                      placeholder="https://github.com/owner/repo"
                      value={repoUrl}
                      onChange={(e) => { setRepoUrl(e.target.value); setAuditError(null); }}
                      onKeyDown={handleAuditKeyDown}
                      disabled={auditLoading}
                      className="flex-1 bg-transparent outline-none text-sm placeholder-slate-500 text-white disabled:opacity-50"
                    />
                  </div>
                  <button
                    id="analyze-repo-btn"
                    onClick={handleAudit}
                    disabled={auditLoading}
                    className="flex items-center justify-center gap-2 px-6 py-3 rounded-xl font-semibold text-sm transition-all duration-200 hover:scale-105 active:scale-95 disabled:opacity-60 disabled:cursor-not-allowed disabled:hover:scale-100 whitespace-nowrap"
                    style={{ background: `linear-gradient(135deg, ${accentCoral}, #ff8e53)`, boxShadow: `0 0 28px rgba(255,107,107,0.5)` }}>
                    {auditLoading
                      ? <><Loader2 size={16} className="animate-spin" /> Auditing…</>
                      : <><Search size={16} /> Audit Codebase <ArrowRight size={16} /></>}
                  </button>
                </div>
              </div>
            </div>

            {/* Error message */}
            {auditError && (
              <div className="max-w-2xl mx-auto mt-4 flex items-start gap-3 rounded-xl px-5 py-4 text-sm text-left"
                style={{ background: "rgba(255,107,107,0.10)", border: "1px solid rgba(255,107,107,0.30)", color: "#fca5a5" }}>
                <AlertCircle size={18} className="shrink-0 mt-0.5" color={accentCoral} />
                <span>{auditError}</span>
              </div>
            )}

            {/* Loading skeleton */}
            {auditLoading && (
              <div className="max-w-2xl mx-auto mt-8 rounded-2xl p-6 flex flex-col gap-4"
                style={{ ...glassmorphism, border: `1px solid rgba(255,107,107,0.2)` }}>
                <div className="flex items-center gap-3 mb-2">
                  <Loader2 size={20} color={accentCoral} className="animate-spin shrink-0" />
                  <p className="text-sm font-medium" style={{ color: accentCoral }}>
                    Fetching repository and running AI audit…
                  </p>
                </div>
                {[80, 60, 90, 50].map((w, i) => (
                  <div key={i} className="h-3 rounded-full animate-pulse"
                    style={{ width: `${w}%`, background: "rgba(255,255,255,0.08)" }} />
                ))}
              </div>
            )}

            {/* Audit result */}
            {auditResult && !auditLoading && (
              <div className="max-w-2xl mx-auto">
                <AuditCard data={auditResult} />
              </div>
            )}
          </>
        )}
      </main>
    </div>
  );
}
