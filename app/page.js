import Link from "next/link";
import Logo from "@/components/Logo";
import {
  Search,
  Zap,
  Users,
  Shield,
  ArrowRight,
  GitBranch,
  Star,
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

// ── Main page ─────────────────────────────────────────────────────────────────

const features = [
  {
    icon: <Zap size={28} color={accentMint} />,
    title: "Instant AI Review",
    description:
      "Get comprehensive code analysis powered by cutting-edge AI models in seconds. Catch bugs, anti-patterns, and performance bottlenecks before they ship.",
    tag: "Fast",
  },
  {
    icon: <Users size={28} color={accentMint} />,
    title: "Real-time Collaboration",
    description:
      "Comment, discuss, and resolve issues alongside your team in a shared live session. No context switching — everything happens inside DevLens AI.",
    tag: "Team",
  },
  {
    icon: <Shield size={28} color={accentMint} />,
    title: "Security Analysis",
    description:
      "Automatically detect OWASP vulnerabilities, secret leaks, and dependency risks. Ship with confidence knowing every PR is security-scanned.",
    tag: "Secure",
  },
];

export default function Home() {
  return (
    <div style={gradientBg} className="font-sans text-white overflow-x-hidden">

      {/* ── Animated background orbs ── */}
      <div className="fixed inset-0 pointer-events-none overflow-hidden">
        <div className="absolute rounded-full opacity-20 blur-3xl animate-pulse"
          style={{ width: 600, height: 600, top: "-15%", left: "-10%",
            background: "radial-gradient(circle, #FF6B6B 0%, transparent 70%)", animationDuration: "6s" }} />
        <div className="absolute rounded-full opacity-15 blur-3xl animate-pulse"
          style={{ width: 500, height: 500, bottom: "-10%", right: "-5%",
            background: "radial-gradient(circle, #4ECDC4 0%, transparent 70%)", animationDuration: "8s", animationDelay: "2s" }} />
        <div className="absolute rounded-full opacity-10 blur-3xl animate-pulse"
          style={{ width: 400, height: 400, top: "40%", left: "40%",
            background: "radial-gradient(circle, #a78bfa 0%, transparent 70%)", animationDuration: "10s", animationDelay: "4s" }} />
      </div>

      {/* ── Navbar ── */}
      <nav className="sticky top-0 z-50 px-6 py-4"
        style={{ ...glassmorphism, borderLeft: "none", borderRight: "none", borderTop: "none" }}>
        <div className="max-w-6xl mx-auto flex items-center justify-between">
          <Logo />
          <div className="hidden md:flex items-center gap-8 text-sm font-medium text-slate-300">
            <a href="#features" className="hover:text-white transition-colors duration-200">Features</a>
            <a href="#" className="hover:text-white transition-colors duration-200">Docs</a>
            <a href="#" className="hover:text-white transition-colors duration-200">Pricing</a>
          </div>
          <Link href="/sign-in" className="flex items-center gap-2 px-5 py-2 rounded-xl text-sm font-semibold transition-all duration-200 hover:scale-105 active:scale-95"
            style={{ background: `linear-gradient(135deg, ${accentCoral}, #ff8e53)`, boxShadow: `0 0 20px rgba(255,107,107,0.35)` }}>
            <GitBranch size={16} />Sign In
          </Link>
        </div>
      </nav>

      {/* ── Hero ── */}
      <section className="relative max-w-6xl mx-auto px-6 pt-24 pb-10 text-center">

        {/* Badge */}
        <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full mb-8 text-xs font-semibold tracking-widest uppercase"
          style={{ background: "rgba(78,205,196,0.12)", border: `1px solid rgba(78,205,196,0.35)`, color: accentMint }}>
          <Star size={12} fill={accentMint} color={accentMint} />
          AI-Powered Code Review
          <Star size={12} fill={accentMint} color={accentMint} />
        </div>

        {/* Heading */}
        <h1 className="text-5xl md:text-7xl font-extrabold leading-tight tracking-tight mb-6">
          Review PRs{" "}
          <span className="relative inline-block" style={{
            background: `linear-gradient(90deg, ${accentCoral}, #ff8e53, #ffd93d)`,
            WebkitBackgroundClip: "text", WebkitTextFillColor: "transparent",
          }}>smarter,</span>
          <br />
          <span className="text-white">together.</span>
        </h1>

        {/* Subheading */}
        <p className="text-lg md:text-xl max-w-2xl mx-auto mb-12 leading-relaxed" style={{ color: "#CBD5E1" }}>
          Paste any GitHub Pull Request URL and let DevLens AI instantly surface bugs, security issues,
          and improvement suggestions — while your whole team collaborates in real time.
        </p>

        {/* CTA replacing input */}
        <div className="flex flex-col sm:flex-row items-center justify-center gap-4">
          <Link href="/sign-up" className="flex items-center justify-center gap-2 px-8 py-4 rounded-xl font-bold text-base transition-all duration-200 hover:scale-105 active:scale-95"
            style={{ background: `linear-gradient(135deg, ${accentCoral}, #ff8e53)`, boxShadow: `0 0 32px rgba(255,107,107,0.55)` }}>
            Get Started Free <ArrowRight size={18} />
          </Link>
          <a href="#features" className="flex items-center justify-center gap-2 px-8 py-4 rounded-xl font-bold text-base transition-all duration-200 hover:bg-white/10"
            style={{ border: "1px solid rgba(255,255,255,0.2)" }}>
            Learn More
          </a>
        </div>
        <p className="text-sm mt-6 text-center" style={{ color: "#64748b" }}>
          Free for public repos · No install required
        </p>

        {/* Social proof */}
        <div className="mt-16 flex items-center justify-center gap-6 flex-wrap">
          {["2,400+ PRs analyzed", "98% accuracy", "SOC 2 Type II"].map((item) => (
            <div key={item} className="flex items-center gap-2 text-sm" style={{ color: "#94a3b8" }}>
              <div className="w-1.5 h-1.5 rounded-full" style={{ background: accentMint }} />
              {item}
            </div>
          ))}
        </div>
      </section>

      {/* ── Features ── */}
      <section id="features" className="max-w-6xl mx-auto px-6 py-20">
        <div className="text-center mb-14">
          <p className="text-xs font-semibold uppercase tracking-widest mb-3" style={{ color: accentMint }}>
            Why DevLens AI
          </p>
          <h2 className="text-3xl md:text-5xl font-bold tracking-tight">
            Everything your team needs to{" "}
            <span style={{ color: accentCoral }}>ship faster</span>
          </h2>
          <p className="mt-4 text-base md:text-lg max-w-xl mx-auto" style={{ color: "#CBD5E1" }}>
            One platform that combines AI intelligence with human collaboration to make every code review count.
          </p>
        </div>

        <div className="grid md:grid-cols-3 gap-6">
          {features.map((f, i) => (
            <div key={i}
              className="rounded-2xl p-6 flex flex-col gap-4 group transition-all duration-300 hover:-translate-y-2 cursor-default"
              style={{ ...glassmorphism, boxShadow: "0 8px 32px rgba(0,0,0,0.25)" }}>
              <div className="w-14 h-14 rounded-xl flex items-center justify-center transition-transform duration-300 group-hover:scale-110"
                style={{ background: "rgba(78,205,196,0.12)", border: "1px solid rgba(78,205,196,0.2)" }}>
                {f.icon}
              </div>
              <span className="self-start text-xs font-semibold px-3 py-1 rounded-full uppercase tracking-wider"
                style={{ background: "rgba(255,107,107,0.12)", color: accentCoral, border: `1px solid rgba(255,107,107,0.25)` }}>
                {f.tag}
              </span>
              <h3 className="text-xl font-bold text-white">{f.title}</h3>
              <p className="text-sm leading-relaxed flex-1" style={{ color: "#CBD5E1" }}>{f.description}</p>
              <div className="flex items-center gap-1 text-sm font-semibold mt-2 transition-all duration-200 group-hover:gap-2"
                style={{ color: accentMint }}>
                Learn more <ArrowRight size={14} />
              </div>
            </div>
          ))}
        </div>
      </section>

      {/* ── CTA Banner ── */}
      <section className="max-w-6xl mx-auto px-6 py-10">
        <div className="rounded-2xl p-10 text-center relative overflow-hidden"
          style={{ background: `linear-gradient(135deg, rgba(255,107,107,0.15) 0%, rgba(78,205,196,0.1) 100%)`,
            border: "1px solid rgba(255,107,107,0.25)" }}>
          <div className="absolute inset-0 opacity-30 pointer-events-none"
            style={{ background: "radial-gradient(ellipse at center, rgba(255,107,107,0.25) 0%, transparent 70%)" }} />
          <h2 className="text-3xl md:text-4xl font-bold mb-3 relative">Start reviewing smarter today</h2>
          <p className="mb-8 relative" style={{ color: "#CBD5E1" }}>
            Join thousands of developers who ship with confidence.
          </p>
          <Link href="/sign-up" className="inline-flex items-center gap-2 px-8 py-3.5 rounded-xl font-bold text-base transition-all duration-200 hover:scale-105 active:scale-95 relative"
            style={{ background: `linear-gradient(135deg, ${accentCoral}, #ff8e53)`, boxShadow: `0 0 32px rgba(255,107,107,0.55)` }}>
            <GitBranch size={18} />
            Connect GitHub Free
          </Link>
        </div>
      </section>

      {/* ── Footer ── */}
      <footer className="mt-10 px-6 py-8" style={{ borderTop: "1px solid rgba(255,255,255,0.07)" }}>
        <div className="max-w-6xl mx-auto flex flex-col md:flex-row items-center justify-between gap-4 text-sm" style={{ color: "#64748b" }}>
          <Logo textClassName="text-base" iconSize={20} />
          <p>© {new Date().getFullYear()} DevLens AI · Built with ❤️ for developers</p>
          <div className="flex gap-6">
            {["Privacy", "Terms", "Status"].map((link) => (
              <a key={link} href="#" className="hover:text-white transition-colors duration-200">{link}</a>
            ))}
          </div>
        </div>
      </footer>

    </div>
  );
}
