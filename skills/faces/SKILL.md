---
name: faces
description: >
  Use this skill whenever someone wants an AI that thinks, decides or writes like a
  specific person or point of view. Faces are causal models compiled from a person's
  own texts (essays, emails, interviews, videos); a face returns a cause that steers
  any model. This includes: a face of a real person, a public figure, a type of
  person or a digital twin; customer panels or focus groups you can question and
  poll; distinct, consistent points of view for agents in a multi-agent system;
  replacing a long SOUL.md or system prompt; writing in someone's own voice from
  their emails or messages; asking what a person would decide; comparing faces or
  composing them with boolean set algebra; sharing a face through scoped API keys.
  Also trigger when the user mentions Faces, faces.sh, the `faces` CLI, causes or
  causal models. Use even if Faces is not yet installed: the skill covers setup. Do
  NOT use for fine-tuning models, RAG or retrieval systems, fiction writing, or
  thematic analysis of transcripts.
compatibility: Requires the faces CLI (npm install -g faces-cli@latest) and internet access to api.faces.sh.
---

# Faces Skill

Faces are **causal models**. A face is compiled from an author's own texts (documents,
interviews, conversation transcripts). When prompted, it returns a **cause**: the principal
*why* that would motivate that author's response in the given context. The cause steers
whichever model answers, so an agent keeps a consistent, specific point of view however long it
runs. Faces can be chatted with, asked for decisions, compared, and composed.

This skill and its references are the documentation: start with
[references/QUICKSTART.md](references/QUICKSTART.md) and
[references/REFERENCE.md](references/REFERENCE.md). The live API schema is at
https://api.faces.sh/openapi.json.

Use `--json` when you need values from a command's output, or **`--toon`**, which carries the
same fields in fewer tokens and is the better choice when the output goes into a model's
context.

**When the CLI says it may be out of date, update it.** A refusal that ends `Your faces-cli (X)
may be out of date. Update with npm install -g faces-cli and try again.` means the API has moved
under this version. Update, then retry; do not work around it.

## Current config
!`faces config:show 2>/dev/null || echo "(no config saved)"`

## Anything compiling right now
!`faces compile:status 2>/dev/null || echo "(not signed in)"`

## Setup

```bash
faces --version 2>/dev/null || echo "NOT_INSTALLED"
LATEST=$(npm outdated -g faces-cli --json 2>/dev/null | jq -r '.["faces-cli"].latest // empty')
[ -n "$LATEST" ] && echo "UPDATE_AVAILABLE: $LATEST"
faces auth:whoami --json 2>/dev/null
echo "EXIT:$?"
[ -f ~/.faces/config.json ] && echo "HAS_CONFIG" || echo "NO_CONFIG"
```

If `NOT_INSTALLED` (the auth check then prints `EXIT:127`): run `npm install -g
faces-cli@latest` and run setup again.

If `UPDATE_AVAILABLE`: run `npm install -g faces-cli@latest`, and tell the user you are
updating so the commands below match. Once auth triage reaches `EXIT:0`, run
`faces catalog:doctor --fix` to bring the local FACE.md and TEAM.md files up to date. Before
sign-in it fails with "Authentication required"; that is not a broken update.

**Auth triage:**

- `EXIT:0`: signed in. Proceed.
- `EXIT:127`: the CLI is not installed. Install it as above first.
- `EXIT:1` + `HAS_CONFIG`: a returning user. Read the whoami output to see what failed, explain
  it, and help fix it. Do NOT walk through QUICKSTART or ask about plans.
- `EXIT:1` + `NO_CONFIG`: a new user. See [references/QUICKSTART.md](references/QUICKSTART.md).

**Secret hygiene:** never display API keys, tokens or passwords from config files. Mask them
(`sk-faces-...dN`).

Never run `faces config:clear` (it wipes everything, with no recovery).

## Core workflows

### 1. Create a face

Every account already has a face of its own, aliased **`me`**. To build the user's own face,
compile into `me` rather than creating another. See
[REFERENCE.md → The `me` face](references/REFERENCE.md#the-me-face).

`face:create` takes **no source material**: it makes an empty face, and sources attach
afterwards (step 2).

```bash
faces face:create --name "Name" --alias slug --default-model MODEL \
  --description "Plain-text bio" \
  --specialty "what this face is known for" \
  --attr gender=man --attr age=34 --attr location="Portland, OR" \
  --attr occupation="Works as a nurse practitioner at a county clinic." \
  --tag research --tag physics
```

- `--description` is a bio of up to 1,500 characters; `--specialty` the one line a card shows
  under the name (80 characters). Both are metadata, editable with `face:edit`; an empty string
  clears the specialty.
- `--tag` adds lowercase labels (repeatable, at most 32 per face).
- `--attr` takes **twelve keys and no others**. Three take a bare value: `age` (`"45"`),
  `gender` (`"woman"`), `location` (`"Lisbon, Portugal"`). Nine take a short sentence:
  `identity`, `education`, `occupation`, `religion`, `family`, `relationships`, `health`,
  `languages`, `background`. Any other key is a `422` naming it, and **nothing in that request
  is saved**: fix the key and send it all again. `faces face:attributes` lists them.
- **`--profile-addendum "…"`** (or `--profile-addendum-file path.txt`, up to 100,000
  characters) stores a system prompt fragment sent with every chat request to this face,
  alongside any per-request `--system`. Use it for durable rules: tone, format, hard
  constraints. Edit with `face:edit --profile-addendum …`, remove with `face:edit
  --clear-profile-addendum`. Only the owner can read it through the API, but a determined
  caller can get the model to reveal it: never put anything there the face's users shouldn't see.

### 2. Add source material

> **Document or thread? Decide this first.** A **document** is the face's own writing: an
> essay, letter, paper, book, poem or notes. It has one author, and every word in it is read as
> the face's. An **interview, transcript, dialogue, podcast, Q&A, panel or any other exchange
> between speakers is a thread**: upload it with `--kind thread` (`--type thread` on
> `compile:import`) and `--face-speaker` naming the face, so only the face's turns are used. A
> labelled dialogue uploaded as a document is read as entirely the face's own words, other
> speakers included, and the upload comes back with a `looks_like_transcript` warning. Writing *about* the face by someone else (a biography, a profile) can
> still be a document, with `--perspective third-person`.

> **Check the speaker mapping of every thread with `compile:thread:get` before you compile
> it**, text transcripts as much as audio and video. See **Verify speaker attribution** below.

> **By them or about them? Always pass `--perspective`.** `compile:doc` and
> `compile:doc:create` default to `first-person`; `compile:upload` and `compile:import` default
> to `third-person`. So say it on every call.
> - **First-person**: the person's own words: essays, letters, interview answers, talks, notes.
>   Above all on `compile:upload` and `compile:import`, or their own PDF is read as writing
>   *about* them and never goes into a style.
> - **Third-person**: material *about* them: a biography, an encyclopedia article, a news
>   profile, anyone else's writing about them. Above all on `compile:doc`, or it is read as if
>   the subject wrote it.

**Interview** (no documents needed; the best way to build a face from scratch): run a Q&A
with the user, save the transcript, upload and compile. See
[references/INTERVIEWS.md](references/INTERVIEWS.md).

**Document (the face's own writing):**
```bash
# Text the subject wrote that you already have (a draft, notes, anything not on disk).
# Pass it verbatim: do NOT retype or summarise it. A transcript in hand is NOT a document:
# save it as "Speaker: text" lines and upload it as a thread (see "A local file" below).
faces compile:doc alias --content "<text>" --label "Notes" --medium essay --perspective first-person --no-wait --json
# By the subject (their own essay or notes)
faces compile:doc alias --file document.txt --medium essay --perspective first-person --no-wait --json
# Several at once: --file is repeatable and each file becomes its own document.
# Returns {"documents":[{file, document_id}...]} in input order. One --medium applies to all.
faces compile:doc alias --file a.txt --file b.txt --file c.txt --medium essay --perspective first-person --no-wait --json
# About the subject (biography, encyclopedia article, news profile): third-person
faces compile:doc alias --file biography.txt --medium essay --perspective third-person --no-wait --json
# compile:doc takes TEXT only. For PDF, Word (.docx), audio or video use compile:upload.
```

**Every document declares a `--medium`, and you must not guess it.** The server will not save a
document without one, and never infers it. Eleven values, spelled exactly:

`academic paper`, `blog post`, `conversation`, `email`, `essay`, `lecture`, `legal document`,
`other`, `social post`, `text message`, `thread reply`.

Any other word is a `422` naming the eleven. `conversation` is the face speaking informally on
their own (a voice memo, dictation); a conversation with anyone else is a thread, not a
document. `lecture` is prepared speech nobody interrupts (a talk, a sermon, a
keynote). **`other`** is for writing in none of the named forms, and it compiles; it is not a
way to avoid asking. A letter, a diary entry and a memo have rules of their own, and filing them
under `other` is the same mistake as filing them under `essay`. **Where the user has not said,
ask**: it is one question with an obvious answer. Do not infer it from the filename or the
text. A medium can be changed later (`compile:doc:edit <id> --medium <medium>`), never cleared.

A source that cannot be compiled says why in `compile_blocked_reason` (and a `/make` refusal
carries the same code in `error_code`). Branch on the code:

| code | what happened | what to tell the user |
|---|---|---|
| `empty` | no text to compile | add content first |
| `too_short` | under `compile_min_words` (50) words | add text, or merge it into a longer source |
| `no_user_messages` | nothing the subject wrote | a fresh interview holds only the opening question; it becomes compilable on the first answer |
| `corpus_thread` | uploaded material for a style | build a style from it with `faces style:make`, or upload the same material with `--kind thread` to compile it |

Treat an unknown code as "cannot be compiled". The set grows.

**YouTube, one speaker → document:**
```bash
faces compile:import alias --url "URL" --type document --medium lecture --perspective first-person --no-wait --json
# A talk nobody interrupts is a lecture; ask if it is something else.
```

**YouTube, several speakers → thread:**
```bash
faces compile:import alias --url "URL" --type thread --no-wait --json
# When transcription finishes, check the speakers and map the face's:
faces compile:thread:get THREAD_ID
faces compile:thread:edit THREAD_ID --face-speaker "A"
faces compile:thread:make THREAD_ID --no-wait --json
```

**A local file (text, PDF, Word .docx, audio, video):**
```bash
# Document. compile:upload defaults to third-person: pass first-person for the subject's own writing.
DOC_ID=$(faces compile:upload alias --file report.pdf --kind document --medium <medium> --perspective first-person --no-wait --json | jq -r '.document_id // .id')
faces compile:doc:make "$DOC_ID" --no-wait --json

# Thread from a text transcript (you know the speakers: pass --face-speaker)
THREAD_ID=$(faces compile:upload alias --file transcript.txt --kind thread --face-speaker "Name" --no-wait --json | jq -r '.thread_id // .id')
faces compile:thread:get "$THREAD_ID"   # ALWAYS check the mapping first
faces compile:thread:make "$THREAD_ID" --no-wait --json

# Thread from audio or video: do NOT pass --face-speaker at upload
THREAD_ID=$(faces compile:upload alias --file recording.mp4 --kind thread --no-wait --json | jq -r '.thread_id // .id')
faces compile:thread:get "$THREAD_ID" --status-only --json | jq '{status}'   # wait for "not_compiled"
faces compile:thread:get "$THREAD_ID"
faces compile:thread:edit "$THREAD_ID" --face-speaker "B"
faces compile:thread:make "$THREAD_ID" --no-wait --json
```

**Compiling can fill in attributes.** Biographical details in a source (age, location,
occupation and so on) can update the face's attributes. A value you set yourself replaces the
current one, and a later compile can still refine it, so check them after a big upload.

**Always use `--no-wait`** for compiles and uploads. Each runs on its own on the server: upload
every source, start every compile, then poll at the end.

**A compile may have a scheduled start.** `/make` answers with `starts_at`: the time the
compile will start, or `null` when it starts at once (once it has started, `starts_at` is when it
did). Until then it is `queued` and starts on its own, so say when it starts and do not treat the
wait as a stall. `--rush` (on `compile:doc`, `compile:doc:make`, `compile:thread:make` and
`compile:all`) starts it now at the rush rate, and the answer says `rush: true`. Quote the rates
from `faces compile:stats` or `GET /v1/rates`, and use `--rush` only when the user wants the
compile now and accepts that rate. `--rush` on `compile:doc:make` or `compile:thread:make` also
works on a compile that is already queued: it starts now, billed as any rush. While a compile is
queued, its status carries `rush_premium_usd`, what a rush would cost now from credit. Once a
compile has started it is too late: `409 compile_already_started`, and nothing changes. Where a
compile starts at once anyway, `--rush` changes nothing and costs nothing extra.

**Poll with `--status-only`**, which leaves the text out of every tick:
```bash
faces compile:thread:get ID --status-only --json | jq '{status, progress, finishing}'
faces compile:doc:get ID --status-only --json | jq '{status, progress, finishing}'
```

**To ask whether anything is still compiling, use `faces compile:status`**: the whole account
in one small call.

```bash
faces compile:status                 # what is in flight, grouped by face
faces compile:status --json          # sources_active is the field to branch on
faces compile:status --watch         # poll until the account is quiet, then exit
```

A compile started in an earlier turn, or by the user on another machine, is otherwise
invisible: check before reporting work finished.

- **`sources_active: 0` means nothing is RUNNING, not nothing is outstanding.** Queued and
  retrying sources count; paused ones do not. They are listed apart in `paused`, with the
  command that resumes each, and `--watch` does not wait for them.
- **Branch on `measurable` before reporting a percentage.** While a face or the account cannot
  be measured (during a transcription, for one), `progress` is `null`: say "working". A `queued`
  source has progress 0 and is waiting, not stuck: say "queued", never "0%".

| Status | Meaning | Action |
|---|---|---|
| `not_compiled` | Never compiled (or transcription finished) | `compile:doc:make` or `compile:thread:make` |
| `transcribing` | Audio or video being transcribed | Keep polling. If it ends `failed`, upload the file (or import the URL) again |
| `queued` | Waiting behind the face's other sources, for its scheduled start (`starts_at`), or about to resume by itself | Keep polling; say "queued", with the start time when `starts_at` is set |
| `compiling` | Running; `progress` says how far | Keep polling |
| `compiled` | Done; `progress` is 1 | Finished. For a document, its writing style catches up within about a minute; do not wait for it |
| `paused` | Paused; nothing moves until it is resumed | Resume with `compile:*:make`, or `compile:*:reset` |
| `failed` | Ended without success | Read `finishing` first: `true` means the server is still on it, so wait. Otherwise `stall_reason` and `error_code` say why |

Treat a status not in this table as `compiling`. `/make` is the only compile call. A second
`/make` of an unchanged, compiled source is a `409 already_compiled`, and nothing is charged; to
compile it again, edit it or `compile:*:reset` it first.

**If YouTube blocks the download** ("Sign in to confirm you're not a bot"): download it locally
with yt-dlp, extract and compress the audio with ffmpeg, and upload that. Keep files under
100MB; for recordings over an hour, use mono 48kbps:
```bash
yt-dlp --cookies-from-browser chrome -o episode.mp4 "https://youtube.com/watch?v=VIDEO_ID"
ffmpeg -i episode.mp4 -vn -ac 1 -b:a 48k episode.mp3
THREAD_ID=$(faces compile:upload alias --file episode.mp3 --kind thread --no-wait --json | jq -r '.thread_id // .id')
# Wait for transcription, then check, remap, compile:
faces compile:thread:get "$THREAD_ID"
faces compile:thread:edit "$THREAD_ID" --face-speaker "A"
faces compile:thread:make "$THREAD_ID" --no-wait --json
```
Use `--kind document --medium lecture` only when the face is the sole speaker.

**`--face-speaker` labels:**
- Audio or video: speakers are transcribed as `A`, `B`, `C`; use the label (`--face-speaker B`).
- Text transcripts: use the speaker name as it appears in the file (`--face-speaker Ada`).
- The match is case-insensitive but exact. If the upload warns `face_speaker_not_found`, the
  name matched nobody and the face has no lines of its own: upload again with a name in the
  file. `unattributed_lines` are lines before the first `Speaker:` prefix, and are not in the
  thread.

**Verify speaker attribution (every thread, before `compile:thread:make`).** Run
`compile:thread:get <thread_id>` and confirm:

1. **Roles are right**: the face's own speaker is `role=user`; everyone else (interviewer,
   host, other guests) is `role=assistant`.
2. **Spot-check**: a few turns (first, middle, last) where `user` is really the subject
   speaking. A smell test is enough; you do not need to read every line.
3. **Fix and check again if wrong**: `faces compile:thread:edit <thread_id> --face-speaker …`,
   then `compile:thread:get` again. Compile only once the mapping is right.

**Read-only documents and threads.** Some come back with `read_only: true` (threads made by
`style:upload`, for one). They can be read and deleted, but a write to their **content**
(`compile:thread:message`, `compile:thread:replace`, a content edit) is a `409`: say it is
read-only rather than retrying. Their label and medium can still be changed with
`compile:thread:edit --label`, `--medium` and `--clear-medium`. To freeze or thaw a whole face,
use `face:lock` / `face:unlock`.

### 3. Build a style (optional)

Every source has a medium. A **style build** reads a face's own writing in one medium and
installs a style for it, so the face writes better in that medium. A face holds a separate style
per medium. Most faces only need compiling; build a style when the face is a real person and you
have their own writing: mail, messages, essays. Writing *about* someone never goes into a style.

```bash
# Load a corpus of their own writing. Stores only: nothing compiled, nothing billed.
faces style:upload alias ./mail.jsonl

# Find the threads it made, then build from them by id.
faces face:sources alias --type thread --json | jq -r '.threads[] | "\(.id)  \(.medium)  \(.label)"'
faces style:make alias --source THREAD_ID_1 --source THREAD_ID_2 --no-wait --json
faces style:status --face alias          # find the job id if you lose it
```

**The corpus file is one JSON object per line, one message each.** Each needs `author` (`self`
when the face's subject wrote it, `other` when someone else did), `sender`, `date` (ISO-8601)
and its text in `plaintextBody`, `htmlBody` or `snippet`. `kind`, if present, must be one of
the eleven media. Upload **one medium per file**: a file that mixes media makes threads with no
medium, which no style can be built from until one is set with `faces compile:thread:edit
THREAD_ID --medium <medium>`.

```json
{"author": "self", "sender": "alice@example.com", "date": "2026-03-14T09:12:00Z", "kind": "email", "snippet": "Friday works. I'll bring the draft and we can cut it down together."}
```

**`--all` takes everything ready on the face, interview threads included.** With `--medium`,
any source that declares no medium of its own is stamped with it, so on a face that also has an
interview, `style:make alias --all --medium email` builds an email style partly from the
interview. Use `--all` only when every source is the subject's own writing in one medium.
Otherwise name the sources: `faces face:sources alias`, then `--source ID` (or
`--source "ID:MEDIUM"`) for each.

**Declare the medium.** `--medium` fills in only where a source declares none, and never
overrides one that does. A source with no medium is refused, not guessed. **Quote `"ID:MEDIUM"`
when the id is a shell variable**: in zsh `$DOC_ID:essay` silently becomes `ssay`.

**Cost.** On Connect or Pro with a linked ChatGPT account, a build runs there at no charge.
Anywhere else (Free, or Connect or Pro with no ChatGPT linked) it is charged to credits at the
build model's listed price, so the CLI asks for `--allow-paid`: pass it only when the user has
said they want to pay. Without it, a build that cannot run on a linked ChatGPT account is
refused (`409 chatgpt_not_linked`) and nothing starts. With it, a build credit cannot cover is
refused up front (`402 insufficient_credit_for_style_build`, with `estimated_usd` and
`balance_usd`), and nothing is charged. `--model` is used only on the ChatGPT link; a build
charged to credits runs on the default build model. If a build fails on the ChatGPT link
(`CHATGPT_AUTH`), the link has expired: `faces auth:connect openai`, then build again.

**Building does not apply it.** Pass `--style <medium>` on a chat command. Style applies only
on the chat commands; `faces causes` and `faces decide` do not use it:

```bash
faces chat:chat alias -m "Reply to the note below." --style email
```

A style adds roughly 2,000 to 3,500 input tokens to each request that uses it. A medium the
face has no style for is a `400` naming the ones it has. `--medium <medium>` is different: it
says what the reply is, needs no build, and is never refused. Every face carries `styles`, the
media it has a built style for: `face:get` prints them and `face:list --has-style` filters to
faces with any. Read it before offering `--style`.

A face holds one style per medium, and version numbers count per medium:

```bash
faces style:versions alias                      # REVERTABLE says whether revert will work
faces style:revert alias --medium essay --yes   # a toggle: run it again to return
faces style:delete alias --medium email --yes   # forget one medium's style; sources are kept
```

**Styles also build themselves.** Once a face has enough of its **own** writing in a medium
(10,000 words for essay, academic paper, blog post and legal document; 15,000 for the rest), a
build runs for that medium without being asked, and again at 2x and 3x the threshold. It
installs at once, and `style:revert` undoes it. It is **on by default on Connect and Pro** and
**off by default on Free**. Each automatic build is paid like any build: at no charge on a
linked ChatGPT account, otherwise **charged to credits**. One that credit cannot cover is not
started; it shows as a failed build with `insufficient_credit_for_style_build` and is tried again
later. `faces style:status --face alias` marks these `BY auto`. Change it only when the user
asks:

```bash
faces account:preferences                                # auto_style: on/off, and why
faces account:preferences auto_style off                 # stop future automatic builds
faces account:preferences auto_style default             # back to the plan's default
faces account:preferences auto_style on --allow-paid     # needed unless ChatGPT is linked on Connect or Pro
faces account:preferences auto_style_thresholds "email=25000,essay=default"
```

**One build per face and medium at a time.** A second is a `409 build_in_progress` naming the
running job: follow it with `faces style:status JOB_ID --wait`. A finished build can report that
it **left out third-person documents** or rests on a **thin sample** for a medium; it installed
anyway, so pass that on to the user.

See [REFERENCE.md → Style](references/REFERENCE.md#style-how-a-face-writes-style).

### 4. Chat

```bash
faces chat:chat alias -m "message"                     # on the face's default model
faces chat:chat alias --llm claude-sonnet-4-6 -m "…"   # on another model
faces chat:chat alias -m "…" --show-cause              # also print the cause, to stderr
faces causes alias -m "…"                              # the cause alone: no model answers
```

**Every answer from a face comes with its cause**: the principal *why* behind the face's
response in this context. `--show-cause` prints it to stderr ahead of the answer (stdout stays
the answer). `faces causes` (or `chat:chat --cause-only`) asks for the cause alone (the Causes
API, `POST /v1/causes`): no model is called and only the cause is charged. Use it to bring one
face's view into another prompt, or to steer your own model or pipeline. It also takes a
situation (`--state`) with questions, for one cause per question.

In `--json` the cause is marked as the face's: `message.cause` on chat completions, the
`reasoning` item with id `rs_faces_…` on responses, the `thinking` block with signature
`faces-reasoning` on messages. A model's own reasoning is separate: never present it as the
face's cause, and never present the cause as what the face said.

**Routing.** `chat:chat` sends each model to its endpoint in the model catalog. ChatGPT-eligible
models (`codex_eligible: true` in `GET /v1/models`) go to `/v1/responses`, where on Connect and
Pro with ChatGPT linked they run on the ChatGPT plan; every other model is paid from credits at
the model's listed price plus 5%. Read `codex_eligible` from the catalog (`faces models:list
--chatgpt`) rather than keeping a list.
`chat:messages` and `chat:responses` call one endpoint directly and need the model named
(`alias@model`). See [REFERENCE.md → Chat routing](references/REFERENCE.md#chat-routing).

In `--json`, `_meta` carries `provider` (the model's lab), `billing` (`oauth`: it ran on the
linked ChatGPT plan; `credits`: paid from the balance) and `cost_usd`. **Branch on `billing`**,
never on `provider`. Branch on a refusal's status and `error_code`, never on its message text.
Connect and Pro users can add `--oauth-only` so the model's part is never paid from credits: a
request the ChatGPT route cannot serve is refused (`422 oauth_only_unavailable`) instead.

**Supplying the cause yourself:** `--cause "TEXT"` (or `--cause-file PATH`) gives the face its
cause for this turn, and the model answers on it. No cause is generated, so **none is charged**
(only the answering model is), and it is faster. It needs a model named. Use it when you or the
user already know how the face reads the moment.

**Streaming.** Every `chat:*` command streams by default, and a streamed request waits for the
cause however long it takes. `--no-stream` and `--json` wait for the answer too: a slow one is
held open, and a refusal after that point is still reported with its real status and code. Do not add
your own retry loop.

Refusals of a face chat end "Nothing was charged.":

| code | meaning | do |
|---|---|---|
| `409` | The face has nothing compiled (asked for its cause) | Compile a source into it (for a composite, into each face); do not retry |
| `422` | No message in the conversation for the face to answer | Fix the request; do not retry |
| `503` | The cause failed | Retry |
| `503` | The model failed or is unavailable (`retryable` says whether to ask again) | Retry when `retryable` is true; when false, use another model |
| `504` | The face did not finish within 300 seconds | Retry |

A refusal can also arrive **inside** a stream that already started `200`: the CLI prints it and
exits non-zero. A face with nothing compiled still answers a chat, from its name, profile
addendum and attributes, with no cause.

**Calling the API yourself instead of the CLI?** Set a timeout of at least 300 seconds for any
request with a face. Not streamed, a response with `X-Faces-Held: 1` can carry an `error` in
its `200` body, so check for it before reading the answer. A hand-written SSE reader must skip lines
starting with `:` (keep-alives) and treat an error event as a failure. See
[REFERENCE.md → Streaming](references/REFERENCE.md#streaming-face-chats).

**Conversations.** `chat:chat` is a single turn. For a conversation, use `chat:thread`: the
history is kept locally and resumed by id (`--id`); set the model and system prompt when
starting. See [REFERENCE.md](references/REFERENCE.md#multi-turn-threads-chatthread).

**Sessions and compaction.** For a long conversation, open a session with the face, attach each
turn, and compact it: the compaction is a summary of the face's position over the session, and
a later request that names it reads the summary in place of the history you no longer send.

```bash
faces session:create alias                               # prints the session id (fs_...)
faces chat:chat alias -m "…" --session fs_...            # each turn joins the session
faces session:compact fs_...                             # prints a compaction id (fcmp_...)
faces chat:chat alias -m "…" --compaction fcmp_...       # reads the summary instead of the history
```

`--session` and `--compaction` work on every `chat:*` command, `faces causes` and
`faces decide`. Turns cost
what they cost without a session; compacting is billed at the cause rate. Sessions expire 30
days after their last turn. See
[REFERENCE.md → Sessions](references/REFERENCE.md#sessions-and-compaction).

**System and published faces:** every account can chat with a curated set of faces under the
`head` account, and with any face published or shared with it, as `owner:alias@model`, for
example `faces chat:chat head:socrates@gpt-5.6-terra -m "…"`. List them with
`faces face:list --system` (`--public` for every published face, `--shared` for those shared
with you). A bare alias only ever resolves your own faces. The caller pays for the answer; the
owner is never charged. See
[REFERENCE.md](references/REFERENCE.md#system--published-faces).

**What it would decide, not what it would say:** `faces decide` asks a face typed questions
about a situation and returns numbers: yes or no (`noul`), a pick between options (`choice`), or
a place on a graded scale (`score`). Use it when you need a number to branch on: routing,
simulations, a panel of faces voting.

```bash
faces decide alias --state "A colleague asks you to sign a grant proposal you have not read, due in an hour." \
  --question "Does the speaker sign?" \
  --option yes="signs it as asked" --option no="declines to sign" --option later="asks for time to read it first" --json
# {"model": "alias@jev-1.13.0", "answers": {"answer": {"type": "choice", "choice": "no", "confidence": 0.98,
#   "probabilities": {"yes": 0.0, "no": 0.99, "later": 0.01}}}, "usage": {...}, "cause": "...", "causes": {"answer": "..."}}
faces decide alias --state-file situation.txt --question "Is the speaker irritated?"            # noul
faces decide alias --state-file situation.txt --question "How firm is the reply?" --level yields --level hedges --level firm   # score
faces decide alias --state-file situation.txt --questions-file questions.json --json   # up to 10 questions with a face
faces decide --baseline --model clef-flash --state-file situation.txt --questions-file questions.json --json
faces decide alias --state-file situation.txt          # no questions: the face's cause alone
```

The type follows from the flags: `--option` makes a choice, `--level` a score, neither a noul.
Make option descriptions specific and mutually exclusive. The face's cause for each question
guides a **decision model** (`--model`: `jev-latest`, `clef`, `clef-flash`, or OpenAI's `gpt-6-luna` with
`--format openai`; `faces models:list --kind decision`), which gives the
numbers; `--baseline` asks the decision model alone, the number to compare a face's answer
against. `causes` holds one cause per question. `--format openai` uses OpenAI's Decisions format
instead of TypeSafe's System One. Images aren't supported in decisions or with a face; send
the situation as text. A face's answer takes 10 to 20 seconds and a slow one is held
open, so allow at least 300 seconds. The cause counts
against a Connect or Pro allowance (or is paid on Free), and the decision model is **always paid
from credits**, on every plan: with no credit it is a `402`. See
[REFERENCE.md → Decisions](references/REFERENCE.md#decisions-decide).

**Run-time composites:** put a formula where the face goes to chat with a blend of faces, with no
create step: `faces chat:chat "(alice | bob)@claude-sonnet-4-6" -m "…"` (or `--formula "alice |
bob" --llm …`). See [§5](#5-compare--compose).

### 5. Compare & compose

```bash
faces face:diff --face alice --face bob               # one overall similarity score per pair, -1 to 1
faces face:neighbors alias --k 3                       # the 3 most SIMILAR faces (nearest, the default)
faces face:neighbors alias --k 3 --direction furthest # the 3 most DIFFERENT faces
faces face:create --name "Alice and Bob" --alias alice-and-bob --formula "alice | bob"   # persist a composite
```

For "who is most **different / unlike / opposite**", add `--direction furthest`. Both commands
refuse a face with nothing compiled. Similarity runs from -1 to 1. `face:neighbors` on a face that
is not yours (`owner:alias`) reports it rounded to one decimal place, such as `0.8`, and rows with the same rounded score are
listed by owner, then alias. Between your own faces, scores and order are exact.

Composites are **boolean set algebra** over faces: `|` union, `&` intersection, `-`
difference, `^` symmetric difference, with parentheses to group. A formula whose result is
empty is a `422 empty_composite` ("the intersection between these two faces is null"): show the
message and pick a formula whose result is not empty.

**A formula on a face with sources of its own is refused.** Setting `--formula` on a face with
compiled sources, or one another composite uses, is a `409`: make a new composite with
`face:create --formula` instead.

**Compose on the fly, without persisting:** put the formula where the face goes. An answer needs
an explicit `@model` (a run-time composite has no default model); its cause alone does not:

```bash
faces chat:chat "(alice | bob)@claude-sonnet-4-6" -m "What should we do?"
faces chat:chat --formula "alice | bob" --llm claude-sonnet-4-6 -m "What should we do?"
```

A run-time composite **answers under the name of its first operand** (`(alice | bob)` answers as
alice); use `face:create --formula` for a reusable face with its own name. See
[REFERENCE.md](references/REFERENCE.md#run-time-composite-faces).

### 6. Benchmark (optional)

`faces benchmark:start` puts a face you own against a reference model, round after round, on the
face's own writing, and reports which sounds more like the person. The face needs something
compiled and a built style. It is paid from credits, so always price it first:

```bash
faces benchmark:start alias --dry-run                         # an estimate; starts nothing
faces benchmark:start alias --rounds 50 --max-spend 5 --wait  # --max-spend is a hard ceiling
faces benchmark:get RUN_ID
```

Report a `winner` only when `ci95.resolved` is `true`. See
[REFERENCE.md → Benchmark](references/REFERENCE.md#benchmark-benchmark).

### 7. Pictures (optional)

A face can have a picture: generated from the face, or one you upload.

```bash
faces face:avatar:list alias                    # versions, which is served, which are stale
faces face:avatar:get alias                     # FREE. Writes the image and says what arrived
faces face:avatar:get alias --size lg --format svg --out ./face.svg
faces face:avatar:upload alias --file photo.png # your own picture. Free; replaces any earlier upload
faces face:avatar:delete alias --yes            # removes only the UPLOAD; generated versions stay
```

**Generating one can cost money, so never run it unless the user has said they want to pay:**
`faces face:avatar:make alias --allow-paid`. Without the flag nothing is sent. Reading is always
free, so check `face:avatar:list` before offering to make one.

A **stale** version no longer matches the face after later compiles: a reason to regenerate only
if the picture matters, and it costs again. An uploaded picture and a generated avatar are
separate: `--prefer uploaded` serves the upload when there is one and falls back to the
generated avatar; `organic` (the default) serves the generated one.

`faces face:list --include avatar` marks each face's avatar state, and `--include owner_follow`
whether you follow the account that published it.

### 8. Groups

Named groups of faces, with an optional description, protocol (a mermaid diagram) and tags:
```bash
GROUP=$(faces group:create --name "Review Panel" --description "Research critique" --tag review --json)
GROUP_ID=$(echo "$GROUP" | jq -r '.id')
faces group:add $GROUP_ID --face alice --face bob          # owner:alias for a face you do not own
faces group:edit $GROUP_ID --protocol-file workflow.mmd    # the diagram alone, never TEAM.md itself
faces group:list
faces group:members $GROUP_ID
```

Each group has a local TEAM.md at `~/.faces/teams/<slug>/TEAM.md`, where `<slug>` is the name
lowercased with each run of other characters turned into `-` ("Review Panel" is
`review-panel`). It has YAML frontmatter (id, name, description, tags, members) and the protocol
as the body. To push a protocol edited there, strip the frontmatter first: `sed '1,/^---$/d'
TEAM.md > protocol.md`, then `group:edit --protocol-file protocol.md`.

### 9. Backup & restore

```bash
faces catalog:backup                     # → ~/.faces/backups/<timestamp>.json
faces catalog:restore                    # the newest backup: faces, groups, source material
faces catalog:restore --compile          # restore, then compile everything
faces catalog:restore /path/to/file.json
faces compile:all                        # compile every uncompiled document and thread
```

### 10. Account preferences

```bash
faces account:preferences                                # show
faces account:preferences default_model gpt-5.4-mini     # the model new faces inherit
faces account:preferences api_fallback true              # allow credits when ChatGPT or an allowance refuses
faces account:preferences auto_style off                 # stop automatic style builds
```

Do not turn automatic style builds on unless the user asked: off a linked ChatGPT account on
Connect or Pro, each one is charged to credits.

## Important: never run `config:clear`

`faces config:clear` wipes all stored credentials (API key, JWT, base URL) with no recovery.
Never use it to troubleshoot. If auth fails, check `faces config:show` and fix the one value
with `faces config:set`.

## Common errors

| Error | Fix |
|---|---|
| `faces: command not found` | `npm install -g faces-cli@latest` |
| `may be out of date` | `npm install -g faces-cli@latest`, then retry |
| `401 Unauthorized` | `faces auth:login`, or check `FACES_API_KEY` with `faces config:show` |
| status `transcribing` | Audio or video being transcribed: poll with `compile:thread:get ID --status-only --json` |
| status `queued` or `compiling` | Poll with `compile:*:get ID --status-only --json`, or `compile:status` for everything |
| `409 already_compiled` | Compiled and unchanged; nothing was charged. Edit it or `compile:*:reset` it to compile again |
| status `failed` | If `finishing` is `true` the server is still on it: wait and offer nothing. Otherwise `stall_reason` says why; do not re-run without fixing it |
| `402 insufficient_credit_for_rush` | A `--rush` compile that a plan's allowance covers still pays the rush premium from credit, and there is not enough. `rush_premium_usd` is the amount. Nothing was queued. Top up (`faces billing:topup --amount <USD>`), or compile without `--rush` to start at the scheduled time |
| `402` | No credit. `faces billing:balance --json`, then `faces billing:topup --amount <USD>` (min $1; `--card pm_…` for a card other than the default; with no card, `faces billing:card-setup` first). Connect and Pro still need credit for the answering model and for `decide`. See [BILLING.md](references/BILLING.md) |
| `422 oauth_rejected` | Connect and Pro: ChatGPT refused and fallback is off. `faces account:preferences api_fallback true` (top up first if needed). See [OAUTH.md](references/OAUTH.md) |
| `429` naming an allowance | A Connect or Pro allowance (causes over 5 hours, the week or the month, or compiling) is used up and `api_fallback` is off. Show the message as it is. Wait, or, if the user agrees to pay, `faces account:preferences api_fallback true`. `faces billing:subscription` shows every meter |
| `429 Rate limit: N requests per minute` | The account's per-minute limit. Nothing was charged. The CLI waits `Retry-After` once; refused again, wait the seconds named. Never retry in a loop: parallel agents share one account's limit |
| `422 oauth_only_unavailable` | The ChatGPT route cannot serve this request (always on Free; on Connect or Pro when the model or link cannot). Nothing was charged. Drop `--oauth-only` to pay from credits |
| `409 duplicate_topup` | The same top-up went through moments ago; nothing was charged this time. Check `faces billing:balance` first; repeat only if the user confirms, with `--allow-duplicate` |
| `409 cancellation_pending` | A plan change while the plan is set to cancel; nothing was charged. `faces billing:subscription:activate` first |
| `409 chatgpt_not_linked` | A style build without `--allow-paid` that cannot run on a linked ChatGPT account (none is linked, or `--model` cannot run there). Nothing was started. `faces auth:connect openai` on Connect or Pro, or `--allow-paid` if the user agrees to pay from credits |
| `402 insufficient_credit_for_style_build` | A style build charged to credits, and the balance cannot cover it. `estimated_usd` is the most it is expected to cost, `balance_usd` the balance. Nothing was started or charged. Top up (`faces billing:topup --amount <USD>`), or link ChatGPT on Connect or Pro |
| `409 compile_already_started` | `--rush` on a compile that has already started. It carries on as it is; nothing was charged |
| `409 build_in_progress` | A style build for that face and medium is running. `faces style:status JOB_ID --wait`; do not start another |
| `422 empty_composite` | The formula's result is empty. Show the message; use a formula whose result is not empty |
| `503 oauth_incomplete` | ChatGPT stopped its reply partway, twice. Nothing was charged; retry |
| `404` on a session or compaction | Unknown, expired, closed, or another face's. Nothing was charged. Open a new session |
| `422` on a thread import | Retry with `--type document` |
| `409` read-only on edit | The content is read-only. Do not retry; say so. It can still be read or deleted, and `compile:thread:edit --label/--medium/--clear-medium` still work |
| A compile you want to stop | `compile:thread:pause ID` or `compile:doc:pause ID`, then wait for `status: "paused"` (the CLI waits unless `--no-wait`). Resume with `compile:*:make ID`, or `compile:*:reset ID` to withdraw it from the face while keeping the source |

## Related skills

- `/facemake`: guided face creation (interview, research, sketch, compile)
- `/facechat`: chat with any face or team in your catalog
- `/faceteam`: compose faces into teams with collaboration protocols
- `/manyface`: turn a skill into one where each step is run by the right face

## Filesystem

```
~/.faces/
  config.json           # credentials, base_url, local settings
  catalog.json          # auto-generated index
  catalog/<alias>/      # one FACE.md per face
  backups/              # timestamped JSON backups (faces and groups)
  teams/<team-slug>/    # one TEAM.md per group, in a folder named by a slug of the group name
  threads/              # chat:thread conversation history
  models-cache.json     # cached model catalog for chat routing
```

## FACE.md schema

**The CLI owns the frontmatter; you own the body.** `face:create`, `face:edit`, the
`face:tag:*` commands, `catalog:restore` and `catalog:doctor --fix` all rewrite the frontmatter
from the server and keep only the keys below; any other key is dropped. A frontmatter without
both `name` and `alias` cannot be read, so the CLI writes a new block on top. The markdown body
after the frontmatter is kept as it is: put recipe notes, queued sources and anything else of
yours there, and `catalog:doctor --fix` is safe to run.

Fields the CLI writes:
```yaml
---
name: Ada Lovelace
description: Mathematician and first computer programmer
alias: ada
default_model: gpt-5.4-mini
attributes:
  gender: female
  age: 34
  occupation: mathematician
tags: [research, mathematics]
formula: null
compiled_tokens: 47200
---
```

`compiled_tokens` is the source tokens currently compiled into the face. To know
whether a face is compiled, ask the server: `faces face:sources <alias>` (a source reading
`synced` has compiled).

The API calls attributes `basic_facts`; the CLI shows them as `attributes` everywhere.

## TEAM.md schema

```yaml
---
id: 6c5f0e35-322b-4f25-af33-089e2a739b5c
name: Review Panel
description: Research critique panel
tags: [review, research]
members: [ada, einstein, skeptic]
---
```

The body after the frontmatter is the protocol (usually a mermaid diagram). Written by
`group:create`, updated by `group:edit`, `group:add` and `group:remove`, synced from the server by
`catalog:doctor --fix`. If `members:` holds ids rather than aliases, read the aliases with
`faces group:members GROUP_ID`, or run `faces catalog:doctor --fix`.

## References

- [QUICKSTART.md](references/QUICKSTART.md): first-time setup, end to end
- [REFERENCE.md](references/REFERENCE.md): every command
- [AUTH.md](references/AUTH.md): registration, login, API keys, plans
- [INTERVIEWS.md](references/INTERVIEWS.md): interview workflows
- [CONCEPTS.md](references/CONCEPTS.md): causal models, causes, composites, style
- [USE_CASES.md](references/USE_CASES.md): example applications
- Accepted `--attr` keys: run `faces face:attributes`
- [OAUTH.md](references/OAUTH.md): linking ChatGPT
- [SCOPE.md](references/SCOPE.md): what the skills read, write and run
- [BILLING.md](references/BILLING.md): balance, top-ups, cards, prices
- [CONTRIBUTING.md](references/CONTRIBUTING.md): file bug reports with `gh issue create`
