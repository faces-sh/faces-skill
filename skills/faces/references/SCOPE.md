# Instruction Scope

What the skills in this bundle read, write and run, so you can judge them before using them.

## Network

- **The Faces API.** Every `faces` command sends HTTPS requests to the Faces Platform API (`api.faces.sh` by default, or `FACES_BASE_URL` if set).
- **npm.** `npm install -g faces-cli@latest` and `npm outdated -g faces-cli` reach the public npm registry; `npx skills add` fetches the `skills` installer from it.
- **GitHub.** `/manyface` reads the public `faces-sh/manyfaced` catalog with `curl` and `git clone`, and publishing a skill to it uses `gh` (fork, push, pull request). Filing a bug report ([CONTRIBUTING.md](CONTRIBUTING.md)) uses `gh issue create` against `faces-sh/faces-skill`.
- **Research.** `/facemake` uses the agent's web search and fetch tools to find source material, and `yt-dlp` to download a YouTube video when the server-side import is blocked.

## Files the `faces` CLI writes

All under `~/.faces/`:

| Path | What |
|---|---|
| `config.json` | credentials (JWT, API key), base URL, local settings |
| `catalog.json`, `catalog/<alias>/FACE.md` | the local face catalog, rewritten from the server by face commands and `catalog:doctor --fix` |
| `teams/<team-slug>/TEAM.md` | the local team catalog, written by `team:*` commands and `catalog:doctor --fix` |
| `backups/` | snapshots from `catalog:backup` |
| `threads/` | `chat:thread` conversation history |
| `models-cache.json` | the cached model catalog used for chat routing |
| `manyfaced-index.json` | the cached community catalog index from `catalog:manyfaced` |

`face:avatar:get` writes the image to the path you give it (`--out`), or to the current directory.

## Commands the skills run besides `faces`

| Command | Where | Why |
|---|---|---|
| `npm`, `npx` | every skill's setup; README | install or update the CLI, install the skills |
| `jq`, `sed`, `tr`, `cat`, `ls`, `mkdir`, `mv`, `basename` | throughout | read JSON output, compute a team folder name, write FACE.md and protocol files |
| `yt-dlp`, `ffmpeg` | `/faces`, `/facemake` | download a YouTube video locally and extract its audio when the server cannot fetch it |
| `curl`, `git` | `/manyface` | read and clone the public manyfaced catalog |
| `gh` | `/manyface` publish, CONTRIBUTING.md | fork and open a pull request, file an issue |
| `cp -rn` | `/manyface` install | copy a skill's FACE.md and TEAM.md files into `~/.faces/` without overwriting yours |
| `rm -rf /tmp/manyfaced-install`, `rm -rf /tmp/manyfaced-publish` | `/manyface` | remove its own temporary clones |
| `ln -sfn` | `setup` (manual install) | link each skill folder into the agent's skills directory |

Nothing else is deleted. The skills never run `faces config:clear`.

## Install

The CLI is installed with `npm install -g faces-cli@latest` from the public npm registry (`npmjs.com/package/faces-cli`), published by `sybileak`.

## Credentials

The skills use a JWT (`FACES_TOKEN`) or an API key (`FACES_API_KEY`) to authenticate requests, read from those environment variables or from `~/.faces/config.json`. They are written only to that file, and only when the user runs `faces auth:login`, `faces auth:register`, `faces config:set`, or `faces keys:create` (which saves the new key by default; pass `--no-save` to skip). The skill may ask for an email and password during `auth:login`; these are sent to the Faces API and not stored (only the resulting JWT is saved). Scoped API keys with budget limits and expiry are recommended over long-lived account credentials. Never display a key, token or password: mask it (`sk-faces-...dN`).
