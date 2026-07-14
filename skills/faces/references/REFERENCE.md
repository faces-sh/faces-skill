# Full command reference

```
faces auth:login        --email  --password
faces auth:logout
faces auth:register     --email  --password  --username  [--plan free|connect]  [--invite-key]   # username: lowercase, numbers, dashes only
faces auth:whoami
faces auth:refresh
faces auth:connect      openai   # device-code flow: prints a code + URL, polls until approved
faces auth:disconnect   <provider>
faces auth:connections

faces face:create       --name  --alias  [--default-model MODEL]  [--description TEXT]  [--tag TAG...]  [--formula EXPR | --attr KEY=VALUE... --tool NAME...]  [--profile-addendum TEXT | --profile-addendum-file PATH]
faces face:list         [--tag TAG...]  [--team TEAM_ID...]  [--include tags,teams,profile]  [--public]  [--system]  [--from-users USER...]  [--not-from-users USER...]
faces face:get          <alias>  [--include tags,teams,profile]  [--full]
faces face:attributes
faces face:edit       <alias>  [--name]  [--default-model MODEL]  [--description TEXT]  [--tag TAG...]  [--formula EXPR]  [--attr KEY=VALUE]...  [--profile-addendum TEXT | --profile-addendum-file PATH | --clear-profile-addendum]
faces face:delete       <alias>  [--yes]
faces face:stats
faces face:upload       <alias>  --file PATH  [--kind document|thread]  [--perspective first-person|third-person]  [--face-speaker NAME]
faces face:diff         --face ALIAS  --face ALIAS  [--face ALIAS]...
faces face:neighbors    <alias>  [--k N]  [--component face|beta|delta|epsilon]  [--direction nearest|furthest]
                                                       # --direction nearest (default) = most SIMILAR; furthest = most DIFFERENT / unlike / opposite

faces face:tag:list     <alias>
faces face:tag:add      <alias>  --tag TAG  [--tag TAG...]
faces face:tag:set      <alias>  --tag TAG  [--tag TAG...]
faces face:tag:remove   <alias>  <tag>
faces face:tag:all
faces face:teams        <alias>  --team TEAM_ID  [--team TEAM_ID...]

faces chat:chat         <alias | owner:alias>  -m MSG  [--llm MODEL]  [--system]  [--stream]   # owner:alias@model for a published face, e.g. head:logician@gpt-5.4
                        [--max-tokens N]  [--temperature F]  [--file PATH]  [--responses]  [--oauth-only]
faces chat:messages     <alias@model | owner:alias@model | model>  -m MSG  [--system]  [--stream]  [--max-tokens N]  [--oauth-only]
faces chat:responses    <alias@model | owner:alias@model | model>  -m MSG  [--instructions]  [--stream]  [--oauth-only]
faces chat:thread       <alias | owner:alias>  -m MSG  [--llm MODEL]  [--system]  [--file PATH]  [--max-tokens N]  [--temperature F]  [--stream]  [--oauth-only]   # start a new thread
faces chat:thread       --id THREAD_ID  -m MSG  [--max-tokens N]  [--temperature F]  [--stream]  [--oauth-only]                                    # resume a thread
faces chat:thread       --list                                                                                                                    # list saved threads
faces chat:thread       --id THREAD_ID  (--show | --delete)                                                                                        # show transcript / delete

faces compile:import       <alias>  --url YOUTUBE_URL  [--type document|thread]  [--perspective first-person|third-person]  [--face-speaker LABEL]  [--no-wait]
faces compile:upload       <alias>  --file PATH  [--kind document|thread]  [--perspective first-person|third-person]  [--face-speaker NAME]  [--no-wait]

faces compile:doc          <alias>  (--content TEXT | --file PATH)  [--label]  [--perspective first-person|third-person]  [--timeout N]  [--no-wait]
faces compile:doc:create   <alias>  [--label]  (--content TEXT | --file PATH)  [--perspective first-person|third-person]
faces compile:doc:make     <doc_id>  [--timeout N]  [--no-wait]
faces compile:doc:pause    <doc_id>
faces compile:doc:reset    <doc_id>
faces compile:doc:list     <alias>
faces compile:doc:get      <doc_id>
faces compile:doc:edit     <doc_id>  [--label]  [--content TEXT | --file PATH]  [--perspective first-person|third-person]
faces compile:doc:delete   <doc_id>

faces compile:thread:create   <alias>  [--label]  [--oauth-only]
faces compile:thread:list     <alias>
faces compile:thread:get      <thread_id>
faces compile:thread:edit     <thread_id>  [--label TEXT]  [--face-speaker NAME]
faces compile:thread:message  <thread_id>  -m MSG  [--oauth-only]
faces compile:thread:make     <thread_id>  [--timeout N]  [--no-wait]
faces compile:thread:pause    <thread_id>
faces compile:thread:reset    <thread_id>
faces compile:thread:sync     <thread_id>
faces compile:thread:delete   <thread_id>  [--yes]

faces catalog:doctor      [--fix]  [--generate]
faces catalog:list
faces catalog:backup
faces catalog:restore     [FILE]  [--compile]
faces catalog:manyfaced   [--skill NAME]  [--install NAME --skills-dir PATH]  [--refresh]

faces compile:all         [--timeout N]

faces keys:create   --name  [--expires-days N]  [--budget F]  [--face ALIAS]...  [--model NAME]...  [--no-save]
faces keys:list
faces keys:revoke   <key_id>  [--yes]
faces keys:update   <key_id>  [--name]  [--budget F]  [--reset-spent]

faces billing:balance
faces billing:subscription
faces billing:subscription:activate
faces billing:subscription:cancel
faces compile:stats
faces billing:usage      [--group-by api_key|model|llm|date]  [--from DATE]  [--to DATE]
faces billing:topup      --amount F  [--payment-ref REF]
faces billing:card-setup
faces billing:llm-costs  [--provider openai|anthropic|...]

faces team:create       --name  [--description TEXT]  [--protocol TEXT]  [--protocol-file PATH]  [--tag TAG...]
faces team:list
faces team:get          <team_id>
faces team:edit       <team_id>  [--name]  [--description TEXT]  [--protocol TEXT]  [--protocol-file PATH]
faces team:delete       <team_id>  [--yes]
faces team:members      <team_id>
faces team:add          <team_id>  --face ALIAS  [--face ALIAS...]
faces team:remove       <team_id>  <alias>

faces team:tag:list     <team_id>
faces team:tag:add      <team_id>  --tag TAG  [--tag TAG...]
faces team:tag:set      <team_id>  --tag TAG  [--tag TAG...]
faces team:tag:remove   <team_id>  <tag>

faces account:state
faces account:preferences [KEY] [VALUE]

faces config:set    <key> <value>
faces config:show
faces config:clear  [--yes]
```

## Default model (`--default-model`)

The `--default-model` flag on `face:create` and `face:edit` sets the LLM used when no `--llm` override is provided to `chat:chat`. Without a default model, the face inherits the user's account-level default model (set via `account:preferences`).

```bash
faces face:create --name "Ada" --alias ada --default-model gpt-5.4-mini
faces chat:chat ada -m "hello"    # uses gpt-5.4-mini automatically
```

The user's account default model can be viewed and changed with:

```bash
faces account:preferences                            # show current preferences
faces account:preferences default_model gpt-5.4      # set default model
```

New faces inherit the account default model at creation time (one-time copy, not a live link). Changing the account default does not update existing faces.

## Chat auto-routing

`chat:chat` routes each request to the right API endpoint off the model catalog (`GET /v1/models`, cached locally ~1h) — no model name needs to be hardcoded:

| Model class | Endpoint | Response shape |
|-------------|----------|----------------|
| `gpt-5.x` / codex (`gpt-5.2`, `gpt-5.4`, `gpt-5.3-codex`, `gpt-5-nano`, …) | `/v1/responses` | OpenAI Responses (`output` / `output_text`) |
| `claude-*` | `/v1/messages` | Anthropic Messages |
| `gpt-4o`, xai, venice, fireworks | `/v1/chat/completions` | OpenAI ChatCompletion |

For a bare alias (no `@model`) the CLI resolves the face's `default_model` (local catalog, else `GET /v1/faces`) to pick the endpoint. A bare alias only ever resolves **your own** faces; a namespaced `owner:alias` (e.g. `head:logician`) addresses a published face owned by another account — see [System & published faces](#system--published-faces). System faces have no `default_model`, so they always require an explicit `@model`.

**Codex models are free when a ChatGPT account is linked** (Subscription Connect), otherwise billed at the paid API rate — same endpoint and response either way. A connect-plan user with no linked token (and `api_fallback` off) gets a 422 on codex; the CLI then suggests `faces auth:connect openai`.

`--responses` forces the Responses endpoint as an escape hatch; routing is automatic otherwise. In `--json` mode the response includes a `_meta` block with `provider`, `cost_usd`, and `endpoint`.

`chat:messages` (always `/v1/messages`) and `chat:responses` (always `/v1/responses`) remain available for direct, single-endpoint access.

## System & published faces

Besides your own faces, the platform serves a curated set of **system faces** under the `head` account, available to every account. Discover them (and any other public faces) with `face:list`:

| Command | Shows |
|---|---|
| `faces face:list` | your own faces (default — unchanged) |
| `faces face:list --public` | your faces **plus** all published faces from other accounts |
| `faces face:list --system` | only the curated system faces (owned by `head`) |
| `faces face:list --from-users alice,bob` | only published faces from these owners |
| `faces face:list --not-from-users head` | published faces, excluding these owners |

`--from-users` and `--not-from-users` are repeatable / comma-separated and **mutually exclusive**. In `--json`, published faces carry `published: true` and `owned_by` (the owner account). In the human-readable list they render as the chat handle `owner:alias` with a `[public · requires @model]` marker.

**Addressing a published face in chat** uses an `owner:alias` namespace, and the model is **required** (system faces have no `default_model`):

```bash
# System faces — owner:alias@model
faces chat:chat head:logician@gpt-5.4 -m "Is this argument valid?"
faces chat:chat head:judge@claude-sonnet-4-6 -m "Score these two answers."

# Your OWN faces stay bare — a bare alias only ever resolves your own catalog
faces chat:chat logician@gpt-5.4 -m "..."
```

The same `owner:alias@model` handle works on `chat:messages`, `chat:responses`, and `chat:thread`. A bare `head:logician` (no `@model`) is rejected — always pin a model. Billing is unchanged: the **caller** pays inference at normal per-token rates; the face owner is never charged.

## Run-time composite faces

You can chat with a **composite of several faces composed on the fly**, without first persisting it with `face:create --formula`. Put a Face Math formula in the face position (the part left of `@`):

```bash
# Pass-through: type the formula directly where you'd name a face
faces chat:chat "(socrates | nietzsche)@claude-sonnet-4-6" -m "What is virtue?"

# --formula convenience: the CLI assembles (expr)@model for you
faces chat:chat --formula "socrates | nietzsche" --llm claude-sonnet-4-6 -m "What is virtue?"
```

The backend merges the operand faces' knowledge per request — the same merge a persisted composite does, so latency is effectively identical. Works on `chat:chat`, `chat:messages`, and `chat:responses`. Purely additive: single faces (`alias@model`), published faces (`owner:alias@model`), and bare models all behave as before.

Operators (same as persisted composites): `|` union, `&` intersection, `-` difference, `^` symmetric diff. Parentheses group and nest, e.g. `((a | b) & c)@gpt-5.4`.

**Naming.** A run-time composite has no name of its own, so it **takes the name of its first operand** — `(socrates | nietzsche)@model` answers as *Socrates*. The operand order therefore matters for identity, not just for union conflict-resolution. If you want the blend to have its own distinct name, persist it instead with `face:create --alias … --formula …`, which creates the composite as a named face.

Rules the CLI surfaces:

- **An explicit `@model` is required** — a run-time composite has no `default_model`. A bare `(a | b)` is rejected locally with a "specify a model" message before any round-trip; pass `@model` or `--llm`.
- **Operands must be your own, concrete faces.** Unknown/unowned → `404 Composite references unknown or unowned face`. A synthetic/composite operand → `422 Composite operands must be concrete faces, not synthetic` (compose from concrete faces only; no nesting persisted composites). Bad syntax → `422 Composite formula syntax error`.
- **Difference needs spaces:** `a - b` (a dash between alphanumerics, `news-bot`, stays one alias).
- **Aliases starting with a digit can't appear in a formula** (`2pac`) — single-face `2pac@model` still works, only the formula path is limited.
- **No `owner:alias` operands inside a formula yet** — run-time composites are over your own faces only (`(me:a | you:b)` → 422).

Billing is unchanged (the caller pays, the usage ledger records the formula string as the model label). Scoped API keys are enforced **per operand**: a key restricted to specific faces may use a composite only if it can access *every* operand, else a 403 naming the disallowed operand.

The live curated set today is `head:logician`, `head:judge`, `head:stylometrician`, `head:humor-analyst`, `head:affect-reader`, `head:imagination-cartographer`, and `head:voice-synthesizer` — but treat it as **dynamic** and fetch the current list with `faces face:list --system`.

## Multi-turn threads (`chat:thread`)

`chat:chat`, `chat:messages`, and `chat:responses` are stateless — each call is a single turn with no memory. `chat:thread` adds persistent, resumable conversation history so a face remembers earlier turns.

Conversation state is stored **locally** (no server-side session) at `~/.faces/threads/<id>.json` (created `0700`, files `0600`). Each turn the full message history is replayed to the model, so the face stays coherent across many turns. Threads are not part of `catalog:backup`.

```bash
# Start a new thread — needs a face alias. Prints the assistant reply + a thread id.
faces chat:thread socrates -m "What is justice?"
#   …reply…
#   [thread t_abc123  ·  2 turns]

# Resume by id — the face remembers the earlier turns
faces chat:thread --id t_abc123 -m "Say more about that"

# Manage threads
faces chat:thread --list                  # all saved threads, newest first
faces chat:thread --id t_abc123 --show    # full transcript (system + every turn)
faces chat:thread --id t_abc123 --delete  # remove the local thread file
```

**Message input:** provide the user message with `-m/--message` or read it from a file with `--file PATH` (one or the other is required when sending).

**`--llm` and `--system` are start-only.** They are read **only when starting a new thread** and then frozen onto the thread:
- `--llm MODEL` sets the model for the whole thread. Starting with `--llm` pins the model as `alias@MODEL` (e.g. `socrates@claude-haiku-4-5`); without it, the thread uses the face's bare alias and resolves the face's `default_model`. Either way the endpoint is resolved once (via the same [auto-routing](#chat-auto-routing) as `chat:chat`) and **cached on the thread**, so every resume hits the same provider/endpoint.
- `--system TEXT` sets a system prompt stored on the thread and re-sent every turn (as Anthropic `system`, Responses `instructions`, or a Chat Completions `system` message, depending on the routed endpoint).
- Passing `--llm` or `--system` together with `--id` (resume) prints a warning and **ignores them** — the values stored on the thread always win. To change the model or system prompt, start a new thread.

**Per-turn flags** (honored on every send, new or resumed): `--max-tokens N` (Anthropic defaults to 1024 when unset), `--temperature F` (OpenAI / Chat Completions endpoints only — ignored on Anthropic and Responses), `--stream`, and `--oauth-only` (see below).

**`--json` output** returns `{thread_id, model, provider, assistant, turns}`; `--list` returns an array of `{id, face, model, turns, created_at, updated_at}`; `--show` returns the full stored thread object.

## OAuth-only mode (`--oauth-only`) — Subscription Connect only

The `--oauth-only` flag and `api_fallback` preference only apply to **Subscription Connect** users who have linked their ChatGPT account via `faces auth:connect openai`. Pay-per-token users do not use OAuth and these settings have no effect for them.

The `--oauth-only` flag prevents fallback to paid system keys. When set, requests that fail OAuth return a 422 error instead of silently falling back to credits. Available on `chat:chat`, `chat:messages`, `chat:responses`, `chat:thread`, `compile:thread:create`, and `compile:thread:message`.

The account-level equivalent is the `api_fallback` preference. When `api_fallback` is `false` (default for Subscription Connect), all requests behave as if `--oauth-only` is set — OAuth failures return 422 instead of falling back to paid keys. Set it to `true` to allow automatic paid fallback when OAuth fails.

```bash
faces account:preferences api_fallback false    # default: no fallback (Subscription Connect)
faces account:preferences api_fallback true     # allow paid fallback when OAuth fails
```

## Account preferences

Server-side preferences stored on the user's account. Viewed and modified with `account:preferences`:

| Key | Values | Default | Effect |
|---|---|---|---|
| `api_fallback` | `true` / `false` | `false` | When false, OAuth failures return 422 instead of falling back to paid system keys |
| `default_model` | any valid model | `gpt-5.4` | Model inherited by new faces that don't specify `--default-model` |

## Face description (`--description`)

The `--description` flag on `face:create` and `face:edit` sets a plain-text bio stored on the server (max 1500 chars). It is also synced to the local FACE.md catalog.

```bash
faces face:create --name "Ada" --alias ada --description "Theoretical physicist and first-principles thinker"
faces face:edit ada --description "Updated bio"
```

`catalog:doctor --fix` pulls descriptions from the server. `catalog:doctor --generate` creates descriptions via LLM and syncs them back to the server.

## Per-face system prompt (`profile_addendum`)

A face can store an arbitrary system prompt (`profile_addendum`). At inference the backend assembles the instruction stack as **persona profile → profile_addendum → per-request system prompt**, so it's durable, face-level behavior that still leaves room for a per-call `--system`/`--instructions`. Applies on all three endpoints (`chat:chat`, `chat:messages`, `chat:responses`).

```bash
# Set on create (inline or from a file — file is friendlier for long prompts)
faces face:create --name "Support Bot" --alias support-bot --default-model claude-sonnet-4-6 \
  --profile-addendum "Always answer in under 3 sentences. Never promise refunds."
faces face:create --name "Support Bot" --alias support-bot --profile-addendum-file ./prompt.txt

# Replace or clear on an existing face
faces face:edit support-bot --profile-addendum "New instructions."
faces face:edit support-bot --profile-addendum-file ./prompt.txt
faces face:edit support-bot --clear-profile-addendum        # sends "" to remove it

# Inspect (owner only): preview + char count, or the whole prompt
faces face:get support-bot            # profile_addendum (58 chars): Always answer in under 3 sentences…
faces face:get support-bot --full     # dumps the full prompt
```

Rules:
- **Max 100,000 chars** (the CLI also checks locally before sending; over the limit → 422 from the server).
- **`--clear-profile-addendum` sends `""` to remove it**; omitting the flags leaves it unchanged (same semantics as `--description`). `--profile-addendum`, `--profile-addendum-file`, and `--clear-profile-addendum` are mutually exclusive.
- Formatting (blank lines, indentation) is preserved; control chars are stripped and CRLF→LF normalized.
- **Proprietary:** returned only for your **own** faces, never on published/cross-user listings, and not echoed back in chat responses.
- **Composites:** a persisted composite uses its own `profile_addendum`; a run-time composite `(a | b)@model` borrows the **first operand's**. There's no way to pass one inline on a run-time composite — persist it if you need a bespoke prompt.

## Face tags (`--tag`)

Lowercase string labels for organization and search. Max 64 chars, max 32 per face.

```bash
# Set tags on create
faces face:create --name "Ada" --alias ada --tag research --tag physics

# Replace all tags
faces face:tag:set ada --tag research --tag updated

# Add tags (append, idempotent)
faces face:tag:add ada --tag new-tag

# Remove a tag
faces face:tag:remove ada old-tag

# List tags
faces face:tag:list ada

# List all tags across all your faces
faces face:tag:all

# Filter face list by tags (AND logic)
faces face:list --tag research --tag physics

# Filter by team (OR logic, composes with --tag)
faces face:list --team TEAM_ID

# Include extra fields in list/get responses
# tags: tag labels. teams: team memberships. profile: compilation stats.
faces face:list --include tags,teams,profile
faces face:get ada --include tags,teams,profile

# Discover published / system faces (see "System & published faces")
faces face:list --public          # your faces + all published faces
faces face:list --system          # only the curated system faces (owned by head)

# Bulk set a face's team memberships (replaces all)
faces face:teams ada --team TEAM_ID_1 --team TEAM_ID_2
```

## Teams

Named groups of faces with optional description, protocol (mermaid diagram), and tags.

```bash
# Create a team
faces team:create --name "Review Panel" --description "Research critique panel" --tag review

# Add faces
faces team:add TEAM_ID --face alice --face bob

# List teams (personal Guild is filtered out)
faces team:list

# Set protocol (mermaid diagram)
faces team:edit TEAM_ID --protocol-file workflow.mmd

# Manage members
faces team:members TEAM_ID
faces team:remove TEAM_ID alice

# Team tags (same pattern as face tags)
faces team:tag:add TEAM_ID --tag urgent
faces team:tag:list TEAM_ID
```

Teams also have a local TEAM.md representation at `~/.faces/teams/<name>/TEAM.md` with YAML frontmatter (name, description, tags, members as aliases) and the protocol as the markdown body.

## Compiling documents (`compile:doc`)

`compile:doc` is the recommended one-step command for compiling a document into a face. Pass the face alias as the first argument. It handles create → compile (prepare + sync) automatically with real-time progress:

```bash
faces compile:doc alice --file essay.txt
```

Output:
```
Creating document... done (abc123)
Compiling (3 chunks):
  [1/3] ε=3 β=2 δ=1 α=5
  [2/3] ε=5 β=6 δ=2 α=12
  [3/3] ε=8 β=6 δ=5 α=26 (syncing)
Done.
```

For an already-created document, use `compile:doc:make <doc_id>` to compile it.

`--timeout` sets the polling timeout in seconds (default: 600 / 10 minutes).

## Deleting sources

`compile:thread:delete` and `compile:doc:delete` are clean — they remove all
cognitive components (beta, delta, alpha, epsilon) extracted from that source.
The face's profile and component counts update immediately. No re-sync needed.

Do NOT warn users that components may persist after deletion — they don't.

## Catalog

The CLI maintains a local catalog at `~/.faces/catalog/` with a `FACE.md` file per face (YAML frontmatter + markdown notes) and a consolidated `~/.faces/catalog.json` index. The catalog is managed automatically on `face:create`, `face:edit`, and `face:delete`.

- `faces catalog:doctor` — diagnose missing, stale, or orphaned catalog entries
- `faces catalog:doctor --fix` — rebuild catalog from API (syncs FACE.md descriptions/tags/attributes and TEAM.md files)
- `faces catalog:doctor --generate` — fix + generate descriptions via LLM (syncs back to server)
- `faces catalog:backup` — snapshot all faces (with descriptions, tags), teams, documents, and threads to `~/.faces/backups/<timestamp>.json`
- `faces catalog:restore [FILE]` — restore faces, tags, teams, and source material from a backup (defaults to most recent). `--compile` runs `compile:all` after upload.
- `faces catalog:list` — print catalog contents
- `faces compile:all` — compile all uncompiled documents and threads across all faces (one at a time with progress)
- `faces config:set catalog false` — disable catalog management
- `faces config:set catalog_model gpt-5-nano` — set the model used for description generation

## Attributes (`--attr`)

The `--attr KEY=VALUE` flag on `face:create` and `face:edit` sets basic demographic facts on a Face directly, without compiling a document. The flag is repeatable — pass one `--attr` per fact. These facts anchor the persona and improve compilation quality when source material is added later.

**Common attribute keys:**

| Key | Example value |
|---|---|
| `gender` | `female`, `male`, `non-binary` |
| `age` | `34` |
| `location` | `Portland, OR` |
| `occupation` | `nurse practitioner` |
| `education_level` | `master's degree` |
| `religion` | `Buddhist` |
| `ethnicity` | `Korean American` |
| `nationality` | `American` |
| `marital_status` | `married` |

These are the most common keys. Many more are accepted across categories including birth details, family, career, education, housing, and immigration. **Only keys on the accepted list work — unsupported keys are dropped with a warning in the response.** Run `faces face:attributes` for the complete categorized list.

Attributes appear as `attributes` in CLI responses (the API sends `basic_facts` but the CLI renames it).

**Example — create a Face with attributes:**
```bash
faces face:create --name "Maria Chen" --alias maria \
  --attr gender=female --attr age=34 \
  --attr location="Portland, OR" \
  --attr occupation="nurse practitioner" \
  --attr education_level="master's degree" \
  --attr marital_status=married
```

**Example — add facts to an existing Face:**
```bash
faces face:edit maria --attr religion=Buddhist --attr ethnicity="Korean American"
```

> Note: `--attr` cannot be combined with `--formula`. Composite faces inherit their facts from their component faces.

## Global flags

Any command accepts these flags:

```
faces [--base-url URL] [--token JWT] [--api-key KEY] [--json] COMMAND
```

## Environment variables

| Variable | Purpose |
|---|---|
| `FACES_BASE_URL` | Override API base URL (default: `api.faces.sh`) |
| `FACES_TOKEN` | JWT authentication token |
| `FACES_API_KEY` | API key authentication |
