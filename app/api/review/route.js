import { NextResponse } from "next/server";

// ── Helpers ──────────────────────────────────────────────────────────────────

function parsePrUrl(url) {
  // Accepts:
  //   https://github.com/owner/repo/pull/123
  //   https://github.com/owner/repo/pulls/123   (common typo)
  const match = url.match(
    /github\.com\/([^/]+)\/([^/]+)\/pulls?\/(\d+)/i
  );
  if (!match) return null;
  return { owner: match[1], repo: match[2], pullNumber: match[3] };
}

async function fetchPrFiles(owner, repo, pullNumber) {
  const url = `https://api.github.com/repos/${owner}/${repo}/pulls/${pullNumber}/files`;
  const res = await fetch(url, {
    headers: {
      Accept: "application/vnd.github+json",
      "X-GitHub-Api-Version": "2022-11-28",
      // If GITHUB_TOKEN is set, use it to avoid rate limits
      ...(process.env.GITHUB_TOKEN
        ? { Authorization: `Bearer ${process.env.GITHUB_TOKEN}` }
        : {}),
    },
  });

  if (!res.ok) {
    const body = await res.text();
    throw new Error(
      `GitHub API error ${res.status}: ${body.slice(0, 200)}`
    );
  }
  return res.json();
}

function buildDiffText(files) {
  if (!files || files.length === 0) return "No changed files found in this PR.";

  return files
    .map((f) => {
      const header = `\n\n=== ${f.status.toUpperCase()}: ${f.filename} (+${f.additions} / -${f.deletions}) ===\n`;
      const patch = f.patch ? f.patch : "(binary or too large to display)";
      return header + patch;
    })
    .join("")
    .slice(0, 28000); // keep prompt within safe token limits
}

const SYSTEM_PROMPT = `You are an expert code reviewer. Analyze this GitHub PR diff and provide a thorough review.

Structure your response EXACTLY in these 5 sections with these exact headings:

📋 SUMMARY
What this PR does — purpose, scope, and what problem it solves.

🐛 BUGS
Any bugs, logic errors, edge cases, or incorrect assumptions. If none, say "No bugs found."

🔒 SECURITY
Security vulnerabilities such as XSS, SQL injection, exposed secrets, insecure dependencies, CSRF, improper auth checks, etc. If none, say "No security issues found."

💡 IMPROVEMENTS
Code quality suggestions: readability, performance, naming, DRY violations, missing tests, error handling gaps, etc.

✅ VERDICT
One of: APPROVE | REQUEST CHANGES | NEEDS DISCUSSION
Followed by a one-line reason.

Be direct, specific, and reference actual file names and line content from the diff when relevant.`;

// ── Route Handler ─────────────────────────────────────────────────────────────

export async function POST(request) {
  try {
    const body = await request.json();
    const { prUrl } = body;

    if (!prUrl || typeof prUrl !== "string") {
      return NextResponse.json(
        { error: "Missing or invalid prUrl in request body." },
        { status: 400 }
      );
    }

    // 1. Parse URL
    const parsed = parsePrUrl(prUrl.trim());
    if (!parsed) {
      return NextResponse.json(
        {
          error:
            "Invalid GitHub PR URL. Expected format: https://github.com/owner/repo/pull/123",
        },
        { status: 400 }
      );
    }
    const { owner, repo, pullNumber } = parsed;

    // 2. Fetch PR diff from GitHub
    let files;
    try {
      files = await fetchPrFiles(owner, repo, pullNumber);
    } catch (err) {
      return NextResponse.json(
        { error: `Could not fetch PR from GitHub: ${err.message}` },
        { status: 502 }
      );
    }

    const diffText = buildDiffText(files);

    // 3. Send to Groq
    const groqKey = process.env.GROQ_API_KEY;
    if (!groqKey) {
      return NextResponse.json(
        { error: "GROQ_API_KEY is not configured on the server." },
        { status: 500 }
      );
    }

    const groqRes = await fetch(
      "https://api.groq.com/openai/v1/chat/completions",
      {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${groqKey}`,
        },
        body: JSON.stringify({
          model: "llama-3.3-70b-versatile",
          messages: [
            { role: "system", content: SYSTEM_PROMPT },
            {
              role: "user",
              content: `Please review this PR:\n\nRepository: ${owner}/${repo}\nPR #${pullNumber}\n\nDiff:\n${diffText}`,
            },
          ],
          temperature: 0.3,
          max_tokens: 2048,
        }),
      }
    );

    if (!groqRes.ok) {
      const errBody = await groqRes.text();
      return NextResponse.json(
        { error: `Groq API error ${groqRes.status}: ${errBody.slice(0, 300)}` },
        { status: 502 }
      );
    }

    const groqData = await groqRes.json();
    const reviewText =
      groqData.choices?.[0]?.message?.content ?? "No review generated.";

    // 4. Parse sections out of the review text
    const sections = parseSections(reviewText);

    return NextResponse.json({
      success: true,
      pr: { owner, repo, pullNumber, filesChanged: files.length },
      review: reviewText,
      sections,
    });
  } catch (err) {
    console.error("[review/route] Unexpected error:", err);
    return NextResponse.json(
      { error: "An unexpected server error occurred." },
      { status: 500 }
    );
  }
}

// ── Section Parser ────────────────────────────────────────────────────────────

function parseSections(text) {
  const sectionDefs = [
    { key: "summary",      emoji: "📋", heading: "SUMMARY" },
    { key: "bugs",         emoji: "🐛", heading: "BUGS" },
    { key: "security",     emoji: "🔒", heading: "SECURITY" },
    { key: "improvements", emoji: "💡", heading: "IMPROVEMENTS" },
    { key: "verdict",      emoji: "✅", heading: "VERDICT" },
  ];

  const result = {};

  sectionDefs.forEach((sec, idx) => {
    // Match from this heading to the next (or end of string)
    const nextHeadings = sectionDefs
      .slice(idx + 1)
      .map((s) => `${s.emoji}\\s*${s.heading}`)
      .join("|");

    const pattern = nextHeadings
      ? new RegExp(
          `${sec.emoji}\\s*${sec.heading}[\\s\\S]*?(?=${nextHeadings}|$)`,
          "i"
        )
      : new RegExp(`${sec.emoji}\\s*${sec.heading}[\\s\\S]*$`, "i");

    const match = text.match(pattern);
    if (match) {
      result[sec.key] = match[0]
        .replace(new RegExp(`^${sec.emoji}\\s*${sec.heading}`, "i"), "")
        .trim();
    } else {
      result[sec.key] = null;
    }
  });

  return result;
}
