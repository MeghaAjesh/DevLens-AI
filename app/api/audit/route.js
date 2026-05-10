import { NextResponse } from "next/server";

// ── Helpers ──────────────────────────────────────────────────────────────────

function parseRepoUrl(url) {
  // Accepts variants like:
  // https://github.com/owner/repo
  // github.com/owner/repo
  const match = url.match(/github\.com\/([^/]+)\/([^/]+)/i);
  if (!match) return null;
  // Clean up repo name (remove .git or trailing slashes if present)
  const repo = match[2].replace(/\.git$/i, '').split('/')[0];
  return { owner: match[1], repo };
}

const ALLOWED_EXTENSIONS = [
  '.js', '.ts', '.jsx', '.tsx', '.py', '.java', 
  '.go', '.rb', '.php', '.css', '.html'
];

async function fetchRepoTree(owner, repo) {
  const url = `https://api.github.com/repos/${owner}/${repo}/git/trees/HEAD?recursive=1`;
  const res = await fetch(url, {
    headers: {
      Accept: "application/vnd.github+json",
      "X-GitHub-Api-Version": "2022-11-28",
      ...(process.env.GITHUB_TOKEN ? { Authorization: `Bearer ${process.env.GITHUB_TOKEN}` } : {}),
    },
  });

  if (!res.ok) {
    const body = await res.text();
    throw new Error(`GitHub API error ${res.status}: ${body.slice(0, 200)}`);
  }
  return res.json();
}

async function fetchFileContent(owner, repo, path) {
  const url = `https://api.github.com/repos/${owner}/${repo}/contents/${path}`;
  const res = await fetch(url, {
    headers: {
      Accept: "application/vnd.github+json",
      "X-GitHub-Api-Version": "2022-11-28",
      ...(process.env.GITHUB_TOKEN ? { Authorization: `Bearer ${process.env.GITHUB_TOKEN}` } : {}),
    },
  });

  if (!res.ok) {
    return null; // Skip if can't read
  }
  
  const data = await res.json();
  if (data.content) {
    // Base64 decode
    try {
      return Buffer.from(data.content, "base64").toString("utf-8");
    } catch {
      return null;
    }
  }
  return null;
}

const SYSTEM_PROMPT = `You are a senior security and code quality engineer. 
Audit this codebase and provide:
1. OVERVIEW: What this project does
2. CRITICAL ISSUES: Bugs or errors that would break the app
3. SECURITY VULNERABILITIES: XSS, injection, exposed secrets, insecure dependencies etc
4. CODE QUALITY: Anti-patterns, dead code, poor practices
5. QUICK WINS: Top 3 things to fix immediately
6. SCORE: Rate the codebase /100
Be specific, mention file names and line numbers where possible.

Format your response exactly as a JSON object with the following keys:
{
  "overview": "...",
  "critical_issues": "...",
  "security_vulnerabilities": "...",
  "code_quality": "...",
  "quick_wins": "...",
  "score": 85
}
Ensure the score is a number. Return only valid JSON.`;

export async function POST(request) {
  try {
    const body = await request.json();
    const { repoUrl } = body;

    if (!repoUrl || typeof repoUrl !== "string") {
      return NextResponse.json({ error: "Missing or invalid repoUrl in request body." }, { status: 400 });
    }

    const parsed = parseRepoUrl(repoUrl.trim());
    if (!parsed) {
      return NextResponse.json(
        { error: "Invalid GitHub Repo URL. Expected format: https://github.com/owner/repo" },
        { status: 400 }
      );
    }
    const { owner, repo } = parsed;

    // 1. Fetch Tree
    let treeData;
    try {
      treeData = await fetchRepoTree(owner, repo);
    } catch (err) {
      return NextResponse.json({ error: `Could not fetch repo tree: ${err.message}` }, { status: 502 });
    }

    // 2. Filter code files (max 20)
    const files = (treeData.tree || [])
      .filter((item) => item.type === "blob")
      .filter((item) => {
        const extMatch = item.path.match(/\.[^.]+$/);
        if (!extMatch) return false;
        return ALLOWED_EXTENSIONS.includes(extMatch[0].toLowerCase());
      })
      // Some simple heuristics: avoid minified, tests, vendors if possible
      .filter(item => !item.path.includes('node_modules') && !item.path.includes('vendor') && !item.path.includes('.min.'))
      .slice(0, 20);

    if (files.length === 0) {
      return NextResponse.json({ error: "No supported code files found to analyze." }, { status: 400 });
    }

    // 3. Fetch contents
    let promptContent = "Here are the files for analysis:\n\n";
    const scannedFiles = [];

    // Fetch sequentially or parallel. 20 files in parallel might trigger GitHub rate limits without a token,
    // but we'll try Promise.all for speed.
    await Promise.all(
      files.map(async (file) => {
        const content = await fetchFileContent(owner, repo, file.path);
        if (content) {
          scannedFiles.push(file.path);
          // Limit individual file sizes to avoid token explosion
          const truncated = content.slice(0, 15000); 
          promptContent += `\n\n=== FILE: ${file.path} ===\n${truncated}`;
        }
      })
    );

    // 4. Send to Groq
    const groqKey = process.env.GROQ_API_KEY;
    if (!groqKey) {
      return NextResponse.json({ error: "GROQ_API_KEY is not configured on the server." }, { status: 500 });
    }

    const groqRes = await fetch("https://api.groq.com/openai/v1/chat/completions", {
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
            content: `Repository: ${owner}/${repo}\n\n${promptContent.slice(0, 30000)}`, // Hard cap overall tokens to be safe
          },
        ],
        temperature: 0.2,
        response_format: { type: "json_object" }, // LLaMA 3 on Groq supports json mode
      }),
    });

    if (!groqRes.ok) {
      const errBody = await groqRes.text();
      return NextResponse.json({ error: `Groq API error ${groqRes.status}: ${errBody.slice(0, 300)}` }, { status: 502 });
    }

    const groqData = await groqRes.json();
    const rawContent = groqData.choices?.[0]?.message?.content;
    
    let parsedResult;
    try {
      parsedResult = JSON.parse(rawContent || "{}");
    } catch {
      return NextResponse.json({ error: "Failed to parse AI response as JSON." }, { status: 500 });
    }

    return NextResponse.json({
      success: true,
      repo: { owner, repo },
      scannedFiles,
      audit: parsedResult,
    });
  } catch (err) {
    console.error("[audit/route] Unexpected error:", err);
    return NextResponse.json({ error: "An unexpected server error occurred." }, { status: 500 });
  }
}
