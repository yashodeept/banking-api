const { execSync } = require("child_process");

function getStagedFiles() {
  try {
    const output = execSync("git diff --cached --name-only", {
      encoding: "utf8",
    });
    return output
      .split("\n")
      .map((f) => f.trim())
      .filter(Boolean);
  } catch (error) {
    console.error("Error running git command:", error.message);
    process.exit(1);
  }
}

function getStagedDiff() {
  try {
    // Only get the added lines of staged changes to analyze what is new
    return execSync("git diff --cached -U0", { encoding: "utf8" });
  } catch (error) {
    console.error("Error getting git diff:", error.message);
    process.exit(1);
  }
}

function run() {
  const files = getStagedFiles();

  if (files.length === 0) {
    // No files staged
    process.exit(0);
  }

  // If README.md is already staged/modified, we are good!
  if (files.includes("README.md")) {
    console.log("✅ README.md is staged for commit.");
    process.exit(0);
  }

  // Check if any significant files are changed
  const codePatterns = [
    /^src\/routes\//,
    /^src\/controllers\//,
    /^src\/models\//,
    /^src\/services\//,
    /^src\/config\//,
    /^prisma\/schema\.prisma$/,
  ];

  const codeFilesChanged = files.filter((file) =>
    codePatterns.some((pattern) => pattern.test(file)),
  );

  if (codeFilesChanged.length === 0) {
    // No core code files changed (only tests, formatting, package.json, etc.)
    process.exit(0);
  }

  // Analyze the diff of staged changes to see if they introduce new features
  const diff = getStagedDiff();
  const diffLines = diff.split("\n");

  let requiresReadme = false;
  const reasons = [];

  // Patterns that genuinely introduce new implementations or public surface changes
  const checkRules = [
    {
      pattern: /^\+\s*(model|enum)\s+\w+/,
      reason: "New database models or enums added to schema.prisma",
    },
    {
      pattern: /^\+\s*(router|app)\.(get|post|put|delete|patch|use)\s*\(/,
      reason: "New API endpoints or routes defined",
    },
    {
      pattern:
        /^\+\s*(module\.exports|export\s+default|export\s+(const|class|function))\s+/,
      reason: "New public exports, classes, or helper functions introduced",
    },
    {
      pattern: /^\+\s*process\.env\.\w+/,
      reason: "New environment variables referenced",
    },
  ];

  for (const line of diffLines) {
    for (const rule of checkRules) {
      if (rule.pattern.test(line)) {
        requiresReadme = true;
        if (!reasons.includes(rule.reason)) {
          reasons.push(rule.reason);
        }
      }
    }
  }

  if (requiresReadme) {
    console.error(
      "\n============================================================",
    );
    console.error("⚠️  README UPDATE REQUIRED");
    console.error(
      "============================================================",
    );
    console.error(
      "You are committing new code implementations that require documentation:",
    );
    reasons.forEach((r) => console.error(` - ${r}`));
    console.error("\nStaged files with significant changes:");
    codeFilesChanged.forEach((f) => console.error(` - ${f}`));
    console.error(
      "\n💡 Please update README.md to document these changes, stage it, and commit again.",
    );
    console.error(
      "💡 To bypass this check temporarily, commit with: git commit --no-verify",
    );
    console.error(
      "============================================================\n",
    );
    process.exit(1);
  }

  // Code files changed but none matched the "genuinely requires documentation" rules (e.g. minor refactoring)
  process.exit(0);
}

run();
