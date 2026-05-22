#!/usr/bin/env node
/**
 * faces-skill compiler
 *
 * Compiles canonical SKILL.md files into agent-specific variants.
 *
 * Usage:
 *   npx skills add faces-sh/faces-skill                    # default (Claude Code)
 *   npx skills add faces-sh/faces-skill --target hermes    # Hermes Agent
 *   node bin/compile.js --target hermes                    # direct invocation
 *
 * Supported targets:
 *   claude-code  (default) — Claude Code / Cursor / Gemini CLI
 *   hermes       — Hermes Agent (Nous Research)
 */

const fs = require("fs");
const path = require("path");
const os = require("os");

const TARGETS = {
  "claude-code": {
    label: "Claude Code",
    skillsDir: path.join(os.homedir(), ".claude", "skills"),
    ext: ".md",
    transform: (content, _skillName) => content, // canonical format, no changes
  },
  hermes: {
    label: "Hermes Agent",
    skillsDir: path.join(os.homedir(), ".hermes", "skills", "faces"),
    ext: ".md",
    transform: transformForHermes,
  },
};

// ---------------------------------------------------------------------------
// Hermes transform
// ---------------------------------------------------------------------------

function transformForHermes(content, skillName) {
  let out = content;

  // 1. Rewrite frontmatter allowed-tools block
  out = out.replace(
    /^allowed-tools:[\s\S]*?(?=\n---|\n#)/m,
    [
      "# Hermes tool mapping:",
      "#   Bash/Grep/Glob/Read  → terminal / read_file / search_files",
      "#   Write/Edit           → write_file / patch",
      "#   WebSearch/WebFetch   → web_search / web_extract (via Tavily)",
      "#   AskUserQuestion      → clarify (built-in Hermes tool)",
    ].join("\n")
  );

  // 2. Replace AskUserQuestion instructions with clarify equivalents
  // Pattern: "Use AskUserQuestion:" → "Use clarify:"
  out = out.replace(/\bUse AskUserQuestion:/g, "Use clarify:");
  out = out.replace(/\buse AskUserQuestion\b/g, "use clarify");
  out = out.replace(/\bAskUserQuestion\b/g, "clarify");

  // 3. Replace Bash tool references in prose
  out = out.replace(/`! /g, "`terminal: ");

  // 4. Rewrite install path references from ~/.claude/skills to ~/.hermes/skills/faces
  out = out.replace(/~\/.claude\/skills/g, "~/.hermes/skills/faces");

  // 5. Rewrite manyface catalog install block (mode 3) to use Hermes path
  out = out.replace(
    /cp -r manyfaced-<name> ~\/.claude\/skills\/manyfaced-<name>/g,
    "cp -r manyfaced-<name> ~/.hermes/skills/faces/manyfaced-<name>"
  );

  // 6. Add Hermes-specific preamble note after the first --- block
  const hermesNote = `\n> **Hermes note:** This skill was compiled for [Hermes Agent](https://hermes-agent.nousresearch.com).\n> \`AskUserQuestion\` calls use Hermes's \`clarify\` tool. Shell commands run via \`terminal\`.\n> Web search and page fetch use the configured Tavily/Exa provider.\n`;
  out = out.replace(/^(---\n[\s\S]*?---\n)/, `$1${hermesNote}`);

  return out;
}

// ---------------------------------------------------------------------------
// CLI
// ---------------------------------------------------------------------------

function parseArgs(argv) {
  const args = { target: "claude-code", dryRun: false, outDir: null };
  for (let i = 2; i < argv.length; i++) {
    if (argv[i] === "--target" && argv[i + 1]) args.target = argv[++i];
    if (argv[i] === "--dry-run") args.dryRun = true;
    if (argv[i] === "--out" && argv[i + 1]) args.outDir = argv[++i];
  }
  return args;
}

function main() {
  const args = parseArgs(process.argv);
  const target = TARGETS[args.target];

  if (!target) {
    console.error(
      `Unknown target: ${args.target}\nSupported: ${Object.keys(TARGETS).join(", ")}`
    );
    process.exit(1);
  }

  const repoDir = path.resolve(__dirname, "..");
  const skillsSrc = path.join(repoDir, "skills");
  const outBase = args.outDir || target.skillsDir;

  console.log(`\nCompiling faces-skill for ${target.label}`);
  console.log(`  Source: ${skillsSrc}`);
  console.log(`  Output: ${outBase}\n`);

  const skillDirs = fs
    .readdirSync(skillsSrc)
    .filter((d) => fs.statSync(path.join(skillsSrc, d)).isDirectory());

  for (const skillName of skillDirs) {
    const srcFile = path.join(skillsSrc, skillName, "SKILL.md");
    if (!fs.existsSync(srcFile)) continue;

    const raw = fs.readFileSync(srcFile, "utf8");
    const compiled = target.transform(raw, skillName);

    const outDir = path.join(outBase, skillName);
    const outFile = path.join(outDir, "SKILL.md");

    if (args.dryRun) {
      console.log(`[dry-run] Would write: ${outFile}`);
      continue;
    }

    fs.mkdirSync(outDir, { recursive: true });
    fs.writeFileSync(outFile, compiled, "utf8");
    console.log(`  ✓ ${skillName} → ${outFile}`);

    // Copy references/ dir if present
    const refsSrc = path.join(skillsSrc, skillName, "references");
    if (fs.existsSync(refsSrc)) {
      const refsDst = path.join(outDir, "references");
      fs.mkdirSync(refsDst, { recursive: true });
      for (const f of fs.readdirSync(refsSrc)) {
        fs.copyFileSync(path.join(refsSrc, f), path.join(refsDst, f));
      }
      console.log(`    + references/`);
    }
  }

  if (!args.dryRun) {
    console.log(`\nDone. Skills installed to: ${outBase}`);
    if (args.target === "claude-code") {
      console.log(
        "Restart Claude Code (/exit then relaunch) to load new slash commands."
      );
    } else if (args.target === "hermes") {
      console.log(
        "Skills are ready. Hermes loads them automatically — no restart needed."
      );
    }
  }
}

main();
