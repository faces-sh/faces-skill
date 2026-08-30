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
faces face:list         [--has-style]  [--tag TAG...]  [--team TEAM_ID...]  [--include tags,teams,profile]  [--public]  [--shared]  [--system]  [--from-users USER...]  [--not-from-users USER...]
                                                       # --public = open to everybody; --shared = shared with YOU. Independent, and they
                                                       # compose. A face reachable both directly and via a workspace appears ONCE with
                                                       # both routes — never deduplicate. Faces you do not own print as owner:alias.
faces face:get          <alias | owner:alias>  [--include tags,teams,profile]  [--full]
                                                       # prints `style: installed` when the face has a captured style
                                                       # a published or shared face resolves under owner:alias, the same address chat
                                                       # uses, and prints an `access:` line saying you do not own it.
faces face:attributes
faces face:edit       <alias>  [--name]  [--default-model MODEL]  [--description TEXT]  [--tag TAG...]  [--formula EXPR]  [--attr KEY=VALUE]...  [--tool NAME...]  [--profile-addendum TEXT | --profile-addendum-file PATH | --clear-profile-addendum]
faces face:delete       <alias>  [--yes]
faces face:lock         <alias>              # freeze the face (read-only)
faces face:unlock       <alias>              # unfreeze the face (writable)
faces face:share        <alias>  (--list | --add ACCOUNT... | --with ACCOUNT... | --none)  [--yes]
faces face:unshare      <alias>  (--from ACCOUNT... | --all)  [--yes]
                                                       # --add keeps the current list; --with REPLACES it and refuses without --yes when
                                                       # that would drop someone. Accounts are usernames or emails, mixed freely; the
                                                       # stored list is canonical USERNAMES, so revoke by username even if you shared by
                                                       # email. Read the current list with --list (or shared_with on face:get).
                                                       # Sharing grants CHAT ONLY — not documents, compiling, re-sharing, or the addendum.
faces face:publish      <alias>  --yes        # every account can chat it; a global override on top of sharing
faces face:unpublish    <alias>
faces face:sources      <alias>  [--type doc|thread]
                                                       # every source in the face, docs and threads in one table: label, tokens, status,
                                                       # medium, updated. Exits 4 for a face that does not exist, which is a DIFFERENT
                                                       # answer from a face with no sources (exit 0). Never prints content and never
                                                       # truncates. --json carries a stable id per row for later delete/recompile.
faces face:stats
faces face:diff         --face ALIAS  --face ALIAS  [--face ALIAS]...
faces face:neighbors    <alias>  [--k N]  [--component face|POSITION]  [--direction nearest|furthest]
                                                       # --component: `face` (default) ranks on overall similarity; a position (e.g. 1)
                                                       # ranks on one component. Which positions are comparable varies per face — pick a
                                                       # wrong one and the error names the valid ones. A face with nothing at that position
                                                       # reports "no data" and exits 0, matching the null at the same index in face:diff.
                                                       # --direction nearest (default) = most SIMILAR; furthest = most DIFFERENT / unlike / opposite

faces face:tag:list     <alias>
faces face:tag:add      <alias>  --tag TAG  [--tag TAG...]
faces face:tag:set      <alias>  --tag TAG  [--tag TAG...]
faces face:tag:remove   <alias>  <tag>
faces face:tag:all
faces face:teams        <alias>  --team TEAM_ID  [--team TEAM_ID...]

faces chat:chat         <[+]alias | owner:alias>  -m MSG  [--llm MODEL]  [--system]  [--stream]  [--medium KIND]  [--best-of N]   # owner:alias@model for a published face, e.g. head:socrates@gpt-5.4
                                                       # PREFIX THE ALIAS WITH + to answer in the style the face captured. Without it
                                                       # the face uses its ordinary voice; both are valid and the caller chooses per
                                                       # request. --medium selects WHICH captured style, since a face holds one per
                                                       # medium. + on a face with no style is a 409, not a fallback. Check
                                                       # `deepself` (face:list --has-style) or drop the +.
                                                       # --best-of N (1-5) writes N replies and serves the closest to the style.
                                                       # It multiplies the cost by N, needs a + alias, and cannot be streamed.
                        [--max-tokens N]  [--temperature F]  [--file PATH]  [--responses]  [--oauth-only]
                                                       # --medium declares WHAT THE WRITING IS so the reply is shaped for the occasion:
                                                       # email, text message, social post, essay, academic paper, blog post,
                                                       # legal document, thread reply, conversation (dialogue: transcripts,
                                                       # interviews, calls), lecture (sustained speech nobody interrupts: talks,
                                                       # sermons, keynotes). Synonyms fold: transcript/interview/call -> conversation,
                                                       # talk/sermon/keynote/speech -> lecture. It is NOT tone or style.
                                                       # OMIT IT IF YOU DO NOT KNOW — never infer it from the text. A wrong
                                                       # declaration is worse than none, because a declaration is trusted.
                                                       # Chat ignores an unknown value; compile rejects it with a 422.
faces chat:messages     <alias@model | owner:alias@model | model>  -m MSG  [--system]  [--stream]  [--max-tokens N]  [--medium KIND]  [--oauth-only]
faces chat:responses    <alias@model | owner:alias@model | model>  -m MSG  [--instructions]  [--stream]  [--medium KIND]  [--oauth-only]
faces chat:thread       <alias | owner:alias>  -m MSG  [--llm MODEL]  [--system]  [--file PATH]  [--max-tokens N]  [--temperature F]  [--stream]  [--medium KIND]  [--oauth-only]   # start a new thread
                                                       # --medium is per REQUEST, not per thread: send it on each turn you want shaped.
faces chat:thread       --id THREAD_ID  -m MSG  [--max-tokens N]  [--temperature F]  [--stream]  [--oauth-only]                                    # resume a thread
faces chat:thread       --list                                                                                                                    # list saved threads
faces chat:thread       --id THREAD_ID  (--show | --delete)                                                                                        # show transcript / delete

faces compile:import       <alias>  --url YOUTUBE_URL  [--type document|thread]  [--perspective first-person|third-person]  [--face-speaker LABEL]  [--no-wait]
faces compile:upload       <alias>  --file PATH  [--kind document|thread]  [--medium KIND]  [--perspective first-person|third-person]  [--face-speaker NAME]  [--no-wait]
                                                       # Accepts text, PDF, Word (.docx), audio and video. Text is extracted server-side.
                                                       # Legacy .doc is refused (400) — save it as .docx first. A .docx with no text 422s:
                                                       # images and text boxes are not read, only document text.

faces compile:doc          <alias>  (--content TEXT | --file PATH...)  [--medium KIND]  [--label]  [--perspective first-person|third-person]  [--timeout N]  [--no-wait]
                                                       # --file is repeatable: each file becomes its OWN document (not concatenated).
                                                       # Returns {"documents":[{file, document_id}...]} in input order; a bad file is
                                                       # reported in place and the rest still compile. --label is single-document only.
                                                       # Text only — for PDF, Word (.docx), audio or video use compile:upload.
                                                       # --medium on compile:upload applies to --kind document only.
faces compile:doc:create   <alias>  [--label]  (--content TEXT | --file PATH)  [--medium KIND]  [--perspective first-person|third-person]
faces compile:doc:make     <doc_id>  [--timeout N]  [--no-wait]
faces compile:doc:pause    <doc_id>  [--no-wait]  [--timeout N]
faces compile:doc:reset    <doc_id>  [--yes]
faces compile:doc:list     <alias>  [--verbose]
                                                       # document text is omitted unless --verbose (--json always includes it)
faces compile:doc:get      <doc_id>
faces compile:doc:edit     <doc_id>  [--label]  [--content TEXT | --file PATH]  [--medium KIND]  [--perspective first-person|third-person]
faces compile:doc:delete   <doc_id>

faces compile:thread:create   <alias>  [--label]  [--oauth-only]
faces compile:thread:list     <alias>
faces compile:thread:get      <thread_id>
faces compile:thread:edit     <thread_id>  [--label TEXT]  [--medium KIND | --clear-medium]  [--face-speaker NAME]
                                                       # --medium corrects what a thread is READ as, and sticks. Use it on an imported
                                                       # corpus room whose messages declared nothing (it shows as medium `unknown`,
                                                       # which is not a medium and contributes no style). --clear-medium removes the
                                                       # correction. What the corpus arrived as is never overwritten.
faces compile:thread:message  <thread_id>  -m MSG  [--oauth-only]
faces compile:thread:make     <thread_id>  [--timeout N]  [--no-wait]
faces compile:thread:pause    <thread_id>  [--no-wait]  [--timeout N]
faces compile:thread:reset    <thread_id>  [--yes]
faces compile:thread:sync     <thread_id>
faces compile:thread:delete   <thread_id>  [--yes]

faces style:upload      <alias>  <file>  [--type email_jsonl|thread_json]  [--messages-per-room N]  [--strict]
                                                       # load a corpus of the person's OWN writing (mail export, message archive).
                                                       # Stores only: nothing is compiled and nothing is billed. Invalid rows are
                                                       # skipped and reported; --strict refuses the whole file instead.
faces style:make        <alias>  (--all | --source ID[:MEDIUM]...)  [--medium KIND]  [--model MODEL]  [--allow-paid]  [--no-compile]  [--best-of N]  [--timeout N]  [--no-wait]
                                                       # capture how the face writes and install it. --all takes every document and
                                                       # every imported corpus room; live threads still compiling are skipped and
                                                       # named. Each medium is analysed separately, so an essay never teaches a rule
                                                       # about email. A source that does not declare a medium is REFUSED, not
                                                       # guessed — declare it with --medium (all) or --source ID:MEDIUM (one).
faces style:status      [JOB_ID]  [--face ALIAS]  [--limit N]  [--wait]  [--timeout N]
                                                       # read one build, or list a face's builds. Listing is how you recover a job id.
faces style:versions    <alias>                        # what has been captured, per medium, and which is in use. SEVERAL can be in
                                                       # use at once — one per medium — and version numbers restart per medium.
                                                       # REVERTABLE says whether style:revert would succeed. Exits 4 for no such
                                                       # face; a face with no style yet exits 0 and says so.
faces style:revert      <alias>  [--medium KIND]  --yes # toggle between the two versions kept for a medium: running it again returns
                                                       # to where you started. A face holds one style PER MEDIUM, so --medium is
                                                       # required once it has more than one (see style:versions). Requires --yes.
faces style:delete      <alias>  [--yes]               # forget the captured style. NEVER deletes documents, threads or uploaded
                                                       # material — the style can be captured again without re-uploading. To
                                                       # delete source text use compile:doc:delete / compile:thread:delete.

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
faces billing:subscription:activate  [--plan connect]
faces billing:subscription:cancel    [--yes]
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
faces team:members      <team_id>                      # FACE / STATUS / ID. A member you do not own can become unreachable when its
                                                       # owner revokes access or deletes it; it stays LISTED with the reason rather
                                                       # than vanishing, so the team never silently changes shape. "access was
                                                       # revoked" can be undone by the owner; "the face was deleted" cannot.
faces team:add          <team_id>  --face ALIAS | owner:alias  [--face ...]
                                                       # Any face you can reach may join: your own, a published one, or one shared
                                                       # with you. Name someone else's as owner:alias, the same address chat uses.
                                                       # Never create a copy of a face to put it in a team — a copy is a different
                                                       # face with different compiled material that then drifts from the original.
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

For a bare alias (no `@model`) the CLI resolves the face's `default_model` (local catalog, else `GET /v1/faces`) to pick the endpoint. A bare alias only ever resolves **your own** faces; a namespaced `owner:alias` (e.g. `head:socrates`) addresses a published face owned by another account — see [System & published faces](#system--published-faces). System faces have no `default_model`, so they always require an explicit `@model`.

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
faces chat:chat head:socrates@gpt-5.4 -m "Is this argument valid?"

# Your OWN faces stay bare — a bare alias only ever resolves your own catalog
faces chat:chat logician@gpt-5.4 -m "..."
```

The same `owner:alias@model` handle works on `chat:messages`, `chat:responses`, and `chat:thread`. A bare `head:socrates` (no `@model`) is rejected — always pin a model. Billing is unchanged: the **caller** pays inference at normal per-token rates; the face owner is never charged.

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

The curated set is **dynamic** — faces are added and retired without notice, so never hardcode it or copy a list from documentation. Read the current set with `faces face:list --system`.

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

# A face you do not own joins by its owner:alias address, the same one chat uses
faces team:add TEAM_ID --face head:socrates

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
  [1/3] 11 components
  [2/3] 25 components
  [3/3] 45 components (syncing)
Done.
```

For an already-created document, use `compile:doc:make <doc_id>` to compile it.

`--timeout` sets the polling timeout in seconds (default: 600 / 10 minutes).

**`--perspective` — by them or about them?** Defaults to `first-person`, which
treats the source as the subject's *own voice*. Use `first-person` for the
person's own words (essays, letters, interview answers, talks). Set
`--perspective third-person` for material *about* the person — a biography, an
encyclopedia/Wikipedia article, a news profile, anyone else's writing about them.
Omitting the flag on about-them material silently compiles it as if the subject
wrote it and corrupts the face. Applies to every compile path that accepts it
(`compile:doc`, `compile:doc:create`, `compile:import`, `compile:upload`,
`compile:doc:edit`).

## Style: how a face writes (`style:*`)

*Requires faces-cli 1.8.0 or newer.*

Compiling and style capture are two different acts on the same face. **Compile teaches a
face what it knows. Style teaches it how it sounds.** You can do either without the other,
and most faces only ever need compiling.

Style is worth capturing when the face is a real person whose own writing you have — their
mail, their messages, their essays. It is learned from first-person material only: writing
*about* someone teaches the wrong writer.

```bash
# 1. Load material. Stores only — nothing is compiled, nothing is billed.
faces style:upload alice ./mail.jsonl

# 2. Capture. --all takes every document and every imported corpus room.
faces style:make alice --all --medium email

# 3. Check what happened
faces style:versions alice
faces chat:chat alice -m "Write a short reply declining the meeting."
```

**Using a captured style.** Capturing does not apply it. Prefix the alias with `+`:

```bash
faces style:make alice --all --medium email
faces chat:chat +alice -m "Reply to the note below." --medium email   # captured style
faces chat:chat alice  -m "Reply to the note below."                  # ordinary voice
```

`--medium` selects which captured style, since a face holds one per medium. A `+` on a
face with no style is a **409, not a fallback** — check first with `face:list --has-style`,
or drop the `+`. `--best-of N` (1-5) writes N replies and serves the one closest to the
style; it multiplies cost by N and cannot be streamed.

**Which faces have a style.** `face:list` marks them `[style]` and `--has-style` filters to
them; `face:get` prints `style: installed`. In `--json` the field is `deepself`, a list
(today only `["style"]`) or `null`. This is the cheap bulk answer — no per-face call.

```bash
faces face:list --has-style
faces face:list --json | jq '[.data[] | select(.deepself) | .alias]'
```

**Correcting a thread's medium.** An imported corpus room whose messages declared nothing
shows as `unknown`. That is not a medium and contributes **no style**, which is
deliberate: no style beats the wrong style. Correct it, and the correction sticks:

```bash
faces compile:thread:edit THREAD_ID --medium lecture
faces compile:thread:edit THREAD_ID --clear-medium
```

What the corpus arrived as is kept underneath and never overwritten.

**Declare the medium.** Each medium is analysed on its own, so an essay never teaches a
rule about email. A source that does not say what it is gets refused rather than guessed:

```bash
faces style:make alice --all --medium email               # fills in ONLY where nothing is declared
faces style:make alice --source "$DOC_ID:essay"           # one source, one medium
faces compile:doc:edit DOC_ID --medium essay              # record it on the document itself
```

`--medium` does not override a source that already declares one; it only fills the gaps.
To change what a document says it is, edit the document.

> **Quote `--source ID:MEDIUM` when the id is a shell variable.** In zsh, `$DOC_ID:essay`
> is parsed as a history modifier and silently becomes `ssay`. Write `"$DOC_ID:essay"` or
> `${DOC_ID}:essay`.

A wrong declaration is worse than a missing one. A mislabelled source teaches the wrong
voice for that medium and nothing afterwards says it happened.

**Cost.** The analyst model runs the whole capture, which makes it the most expensive call
in the product. The default model runs on your own linked ChatGPT account and costs
nothing. A model that would bill is **refused**, not warned about:

```bash
faces style:make alice --all --medium email --model gpt-5.6-luna
# Error: 'gpt-5.6-luna' is not on the free tier, so this build would bill you.
```

If a capture fails on authentication, the ChatGPT link has expired. Reconnect it with
`faces auth:connect openai` — do not switch to a paid model, which turns a fixable login
into a permanent bill. Pass `--allow-paid` only when you mean to pay.

**One style per medium.** A face does not have "a style", it has one per medium. An email
style and an essay style are separate and do not replace each other, so `style:versions`
can show several in use at once and version numbers restart per medium:

```bash
faces style:versions alice
# MEDIUM  VERSION  IN USE  REVERTABLE  MODEL          CAPTURED
# essay   2        yes     yes         gpt-5.6-terra  2026-08-27 20:21:54
# email   1        yes     -           gpt-5.6-terra  2026-08-27 20:23:26
```

**Undoing.** `style:revert` toggles between the two versions kept for a medium — running
it again returns to where you started. Name which style with `--medium` once the face has
more than one. It requires `--yes` because it changes how the face writes the moment it
runs.

```bash
faces style:versions alice                        # REVERTABLE says whether it will work
faces style:revert alice --medium essay --yes
```

**Deleting.** `style:delete` forgets the captured style and nothing else. Documents,
threads and uploaded material are always kept, so the style can be captured again without
re-uploading:

```bash
faces style:delete alice --yes
```

It cannot delete source text. To remove that, use the commands that own it —
`compile:doc:delete` and `compile:thread:delete` — where deleting is the point of the call
rather than a side effect.

**Long builds.** A capture is asynchronous. `style:make` blocks and prints progress;
`--no-wait` returns a job id instead. If you lose the id, list the face's builds:

```bash
faces style:make alice --all --medium email --no-wait
faces style:status --face alice        # recover the job id
faces style:status JOB_ID --wait
```


## Deleting sources

`compile:thread:delete` and `compile:doc:delete` are clean — they remove all
cognitive components extracted from that source.
The face's profile and component counts update immediately. No re-sync needed.

Do NOT warn users that components may persist after deletion — they don't.

## Read-only sources

Documents and threads carry a `read_only` flag. When an item is frozen,
`compile:doc:list`/`:get` and `compile:thread:list`/`:get` print a bare
`read only` line; nothing is printed when it's writable (there is no
`read_only: false`). Look for the literal `read only` marker to know an item is
frozen.

Frozen items are readable and can still be deleted, but any write —
`compile:doc:edit`, `compile:thread:edit`, `compile:thread:message`, etc. — is
refused:

```
Error (409): This document is read-only and cannot be edited.
```

Threads phrase it `This corpus is read-only…`. On a 409, don't retry the write —
surface that the item is frozen. Today only style **corpus** uploads
(`style:upload`) produce locked threads; nothing locks individual documents. There is no per-item toggle
for these; to freeze or thaw a whole face, use `face:lock` / `face:unlock` (see
**Face locking** below).

## Face locking

A whole face can be frozen with `face:lock <alias>` and thawed with
`face:unlock <alias>`. A locked face still reads and chats normally — it just
can't be changed.

While locked, any mutating call against the face or anything it owns — editing
the face, its documents/threads, uploads/imports, style capture, and
deleting the face — is refused with HTTP `409` (message contains `read-only`).
Don't retry; `face:unlock` first. The lock covers the face's captured style as
well, so a face and its style freeze and thaw together.

Reads, listing, and chat are unaffected. To recognize a locked face: `face:get`
shows a bare `read only` line and `face:list` shows a `[read only]` marker
(nothing shown when unlocked).

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
