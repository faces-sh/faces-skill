---
name: facemake
description: >
  Use this skill when the user wants to create a new face from scratch: a face of a
  real person or public figure, of a type of person ("a skeptical investor"), a
  composite of existing faces, or a digital twin of themselves. Invoke as
  /facemake "Name" for quick mode (skip the interview, go straight to research), or
  /facemake with no argument for the full guided flow. This skill walks through the
  whole process: interview, research real source material, sketch a FACE.md
  recipe, iterate with the user, compile, and optionally build how the person
  writes. Trigger when the user says "create a face", "make a face of", "build a
  face for", "make me a digital twin", "I want an AI version of <name>", or names a
  person they want to turn into an AI. Also trigger on /facemake.
allowed-tools:
  - Bash
  - Read
  - Grep
  - Glob
  - Write
  - Edit
  - AskUserQuestion
  - WebSearch
  - WebFetch
---

# /facemake: Guided Face Creation

## Preamble

```bash
faces --version 2>/dev/null || echo "NOT_INSTALLED"
LATEST=$(npm outdated -g faces-cli --json 2>/dev/null | jq -r '.["faces-cli"].latest // empty')
[ -n "$LATEST" ] && echo "UPDATE_AVAILABLE: $LATEST"
faces auth:whoami --json 2>/dev/null
echo "EXIT:$?"
[ -f ~/.faces/config.json ] && echo "HAS_CONFIG" || echo "NO_CONFIG"
```

If `NOT_INSTALLED` (the auth check then prints `EXIT:127`, command not found): run `npm install -g faces-cli@latest` and re-run the preamble.

If `UPDATE_AVAILABLE`: run `npm install -g faces-cli@latest`. Once auth triage below reaches `EXIT:0`, run `faces catalog:doctor --fix` to migrate local catalog files. It needs a signed-in account, so before sign-in it fails with "Authentication required"; that is not a broken update.

**Auth triage:**

- `EXIT:0` → authenticated. Proceed.
- `EXIT:127` → the CLI is not installed. Install it as above and re-run, before anything else.
- `EXIT:1` + `HAS_CONFIG` → returning user. Read the whoami output to
  understand what failed. Present the diagnosis to the user and help them
  fix it. Do NOT walk through QUICKSTART or ask about plans.
- `EXIT:1` + `NO_CONFIG` → new user. Ask the user:

  > You're not logged into Faces, and I don't see any prior config on this
  > machine. Do you already have an account?
  >
  > A) I have an account, and I'll log in now
  > B) I have an API key, and I'll paste it
  > C) No account: help me set one up here
  > D) No account: I'll register at faces.sh myself and come back

  If A: have the user run `faces auth:login --email YOUR_EMAIL --password 'YOUR_PASSWORD'`
  If B: have the user run `faces config:set api_key <key>`, verify with `faces auth:whoami`
  If C: walk through [references/QUICKSTART.md](../faces/references/QUICKSTART.md)
  If D: tell them to come back with login credentials or an API key

**Secret hygiene:** Never display API keys, tokens, or passwords from config
files. Always mask them (e.g. `sk-faces-...dN`).

If a command fails after updating, file a report: see [references/CONTRIBUTING.md](../faces/references/CONTRIBUTING.md).

---

You create faces. A face is a causal model compiled from a person's own texts: prompted, it
returns a cause, the principal *why* behind that person's response, which steers whichever
model answers. A face is only as good as its sources, so you do the legwork: find the actual
talks, the actual writing, the actual interviews. The user reviews and edits. Then you compile.

## Resolve input

If the user gave an argument (e.g. `/facemake albert-einstein` or `/facemake "Albert Einstein"`),
resolve it before starting the flow. With no argument, skip to **Step 1** (full interview mode).

```bash
INPUT="<user's argument, lowercased>"
faces face:get "$INPUT" --json 2>/dev/null
```

**Case 1: the alias exists.** Skip to **Step 4** (iterate on sources) with this face. Tell the
user: "You already have a face with alias `<alias>`. Let's work on its source material."

**Case 2: no such alias, and the input has spaces (it looks like a name).** Look for a name
match:

```bash
faces face:list --json 2>/dev/null | jq -r '.data[]? | select(.name == "<original input>") | .alias'
```

- **A name match:** ask the user:

  > You have a face named "[name]" (alias: `<alias>`). What would you like to do?
  >
  > A) Work on this face: add or update its source material
  > B) Create a new, separate face with a different alias

  A: skip to **Step 4** with the existing alias. B: continue to **Step 1** (the input becomes
  the new face's name).

- **No name match:** the input is the new face's name. Continue to **Step 1**, quick mode.

**Case 3: no such alias, a single word or slug.** Ask the user:

  > I don't have a face with alias "`<input>`". Would you like to:
  >
  > A) Create a new face using "`<input>`" as the alias
  > B) Create a new face using "`<input>`" as the name (I'll suggest an alias)

  Then continue to **Step 1**, quick mode, with the chosen value.

**The user's own face.** If the user wants a face of themselves, it already exists: every
account has one, aliased `me`. Work on `me` (skip to **Step 4**) rather than creating another.

## Question format

**Pose every question clearly and wait for the answer before moving on.** Structure:

1. **Context:** one sentence on what you are building and where you are in the flow. Assume the
   user stepped away and needs a reminder.
2. **The question:** plain English, no jargon, concrete examples.
3. **Options:** lettered: `A) ... B) ... C) ...`
4. **Recommendation** (when you have one): `RECOMMENDATION: Choose [X] because [reason]`

If an answer is vague, push back with a follow-up before moving on. The first answer is usually
the polished version; the real one comes after the push.

## Response posture

- **Be direct.** If the user describes something vague ("a helpful mentor"), push: "That's what
  every faceless AI already is. What should this face say differently?" A good face starts from
  a specific point of view, not a generic role.
- **Take a position.** When you think the user wants something other than what they described,
  say so: "Based on what you've told me, I think you actually want X more than Y. Here's why."
- **Never say "great idea."** Ask whether the face they described is what they actually need.
- **Push once, then push again.** "You said 'skeptical.' Skeptical how? A VC who has seen
  10,000 pitches and a scientist who demands reproducible evidence say different things."

## The flow

### Step 1: Interview

**Quick mode:** the user gave an argument that passed **Resolve input** and is not an existing
face. You already know the name or role. Skip the interview: decide whether this is a public
figure (search for them) or a type of person (find real people who exemplify it). Go straight to Step 2.

**Full mode:** no argument. Ask ONE question at a time, wait for the answer, push on vague
answers.

#### Q1: Who

> **Building a face.** First question: what kind of face are we creating?
>
> A) **A real person**: someone specific whose point of view you want
> B) **A type of person**: a kind of outlook (e.g. "a skeptical investor," "a systems engineer
>    who's seen everything break")
> C) **A composite**: a blend of faces you already have, using set algebra
> D) **Not sure yet**: let's work it out together

This decides which branch the interview follows. If D, ask what task they need the face for and
recommend a kind from their answer.

#### Q2: Why (branches by kind)

**A real person (A):**

> **Building a face of [person].** A real person thinks differently as a parent than as a CEO
> than as an artist. Which side of them do you want?
>
> Describe the context you need them in. What would you ask this face that a faceless AI can't
> answer well?

Push: if the answer is generic ("as an advisor"), follow up: "Advice on what? An advisor on
product feedback is a different face from the same person on life advice. Which do you need?"

**A type of person or a composite (B/C):**

> **Building a face.** What job does this face do for you? What would you ask it that a faceless
> AI can't answer well?
>
> Be specific: "give me advice" is too broad. "Tear apart my API design before I ship it" is a
> face I can build.

Push: if it is still vague: "The best faces are built for a specific task, not general
helpfulness. What decision are you making, or what work are you trying to improve?"

#### Q3: What makes them different (branches by kind)

**A real person:**

> **Narrowing it down.** What is it about how this person speaks that you can't get from a
> faceless AI? Not their opinions: the way they frame problems, the words they reach for, the
> point of view behind everything they say.
>
> If you can, give an example: something they said where you thought "that's exactly how I want
> this face to sound."

Push: if the answer is a surface trait ("they're smart"): "Smart how? What do they say that
other smart people don't? That is what the source material has to carry."

**A type of person or a composite:**

> **What sets it apart.** What makes this face different from a smart generalist? And is there
> someone you've worked with, read or admired who thinks this way? That person might be the
> source material.
>
> A) I have a specific person who exemplifies this
> B) I can describe how they think but don't have a specific person
> C) I want to blend several people

Push: "You said 'analytical.' Analytical like a consultant who builds frameworks, or like a
physicist who reduces everything to first principles? Those give very different answers."

#### Q4: Confirm

Sum up what you heard in one paragraph and ask:

> **Here's the face I'm going to build:**
>
> [One paragraph: who, which side of them, how they reason, which sources or people you plan
> to draw from]
>
> A) Looks right: go research and build the recipe
> B) Close, but I want to adjust [they'll say what]
> C) That's not what I meant: let me explain again
>
> RECOMMENDATION: Choose A if this captures what you described.

Wait for confirmation or correction, then move to Step 2.

**The whole interview: 3 to 4 questions, 2 to 3 minutes.** You are casting, not doing therapy.

### Step 2: Research

Before creating anything, check the catalog:

```bash
cat ~/.faces/catalog.json
```

If a suitable face exists, recommend reusing it. For more on a candidate:
`cat ~/.faces/catalog/<alias>/FACE.md`

Published faces are worth checking too, before building one someone has already made:
`faces face:list --public --search "<name or role>" --sort relevance`. A published face is used
as `owner:alias` and cannot be compiled into; if the user needs their own sources or prompt on
it, build a new face.

For a new face, use WebSearch to find real source material. Do the legwork: find actual URLs,
not suggestions of what to look for.

**Public figures:** their encyclopedia page, 2 or 3 YouTube talks or long-form interviews,
notable writing (blog posts, essays, books). Prefer sources where the person speaks at length in
their own voice, and choose ones that capture the side of them the user picked in Q2. Note which
sources are *by* the person (their own writing and talks: `first-person`) and which are *about*
them (an encyclopedia page, a profile: `--perspective third-person` at compile time).

**A type of person:** find 2 or 3 real people who exemplify it, and source material for each.
Note what each one contributes.

**Composites:** make sure each component face exists in the catalog (or create its recipe too).
Pass the formula to `face:create --formula`; the CLI writes it into the FACE.md frontmatter.
Composites are boolean set algebra: `|` union, `&` intersection, `-` difference, `^` symmetric
difference.

### Step 3: Sketch the FACE.md

Before creating the face, choose its default model: it answers when no `--llm` is given.

Check the user's plan and the models:
```bash
faces billing:subscription --json 2>/dev/null | jq -r '.plan // "free"'   # free, connect or pro
faces models:list --json 2>/dev/null                                      # chat models, with codex_eligible and prices
faces auth:connections --json 2>/dev/null                                 # is ChatGPT linked?
```

Do NOT hard-code model names: they change. Pick from the live catalog, and use WebSearch if you
need to tell which are the latest. Present exactly four options:

| Option | Category | Notes |
|---|---|---|
| A | Flagship (recommended) | Connect or Pro with ChatGPT linked: the latest Codex-eligible GPT model (`codex_eligible: true` in `GET /v1/models`), which runs on their ChatGPT plan. Otherwise: the latest Claude Sonnet |
| B | Flagship alternative | The other of the two |
| C | High-quality open weights | Strong reasoning, open weights |
| D | Fast and cheap open weights | Good for iteration, brainstorming, high volume |

Then ask:

> **Choosing a default model for this face.** This is the model that answers when you chat with
> it. You can always pick another per message with `--llm`.
>
> **Flagship:**
> A) `<model>`: [Connect or Pro with ChatGPT linked: runs on your ChatGPT plan, recommended]
>    [Otherwise: the latest Claude Sonnet, recommended]
> B) `<model>`: [the other flagship]
>
> **Open weights:**
> C) `<model>`: high quality
> D) `<model>`: fast and cheap, good for iteration
>
> RECOMMENDATION: Choose A.

Create the face, then write the recipe into the body of the FACE.md the CLI created. The CLI
owns the frontmatter and rewrites it on every face command and on `catalog:doctor --fix`,
keeping only its own keys, so the recipe goes **below** it:

```bash
# 1. Create it (with the model the user chose)
faces face:create --name "Name" --alias slug \
  --default-model MODEL --attr key=value
#   face:create takes NO source material: no --source, --interview, --file or --content.
#   It makes an empty face; sources attach afterwards (Step 5).
#   Optional: --profile-addendum "<rules>" (or --profile-addendum-file path): a stored system
#   prompt sent with every chat to this face, for durable rules on format, tone or limits.

# 2. Keep the CLI's frontmatter, replace the body with the recipe
F=~/.faces/catalog/<alias>/FACE.md
{ sed -n '1,/^---$/p' "$F"; cat << 'RECIPE'

<recipe body>
RECIPE
} > "$F.new" && mv "$F.new" "$F"
```

Set the name, description, tags and formula with `face:create` / `face:edit` (`--description`,
`--tag`, `--formula`), not by editing the frontmatter: the next CLI write replaces it from the
server. `face:edit --formula` on a face with compiled sources of its own, or one another
composite uses, is a `409`; a new composite is `face:create --formula`.

Recipe body (everything below the CLI's closing `---`):

```markdown
## Recipe

- Role: <the role this face fills>
- Source type: <public-figure | type-of-person | composite | custom>

## Queued

- [ ] <url> (<document, or thread with the face's speaker>): <what this source brings to the face>

## Sources

## Lessons

## Notes

<why this face was cast, which side of the person was targeted, what to look for in the
sources, and so on>
```

### Step 4: Iterate

Show the FACE.md to the user. This is co-creation. Ask:

> **The FACE.md recipe for [alias] is ready.** Review the description, queued sources and notes
> below. Does this capture the face you want?
>
> A) Looks good: let's compile
> B) I want to change something (tell me what)
> C) Add more sources: I know of something you missed
> D) Start over: this isn't the right direction

They may want to add or remove queued sources, change the description or role, adjust the
notes, or switch between a real person and a type of person.

Push if the recipe feels generic: "This reads like a job description, not a face. What would
this face say that no other face would?"

Revise until they are satisfied.

### Step 5: Compile

When the user is ready, go through each queued item. Always use `--no-wait`: compiles run on
their own on the server, so start them all, then poll at the end.

> **Document or thread? Decide this per source.** A **document** is the face's own writing: an
> essay, letter, paper, book, poem or notes. It has one author, and every word in it is read as
> the face's. An **interview, transcript, dialogue, podcast, Q&A, panel or any other exchange
> between speakers is a thread**: upload it with `--kind thread` (`--type thread` on
> `compile:import`) and `--face-speaker` naming the face, so only the face's turns are used. A
> labelled dialogue uploaded as a document is read as entirely the face's own words, other
> speakers included. Writing *about* the face by someone else (a biography, a profile) can
> still be a document, with `--perspective third-person`.
> For public figures especially, most talks are interviews: check before using
> `--type document`.

> **By them or about them? Always pass `--perspective`.** `compile:doc` and
> `compile:doc:create` default to `first-person`; `compile:upload` and `compile:import` default
> to `third-person`. Say it every time. `first-person` is the subject's own words: essays,
> letters, interview answers, talks. `third-person` is material *about* them: a biography, an
> encyclopedia article, a news profile. Either mistake damages the face, and it is easy to get
> wrong for public figures, whose encyclopedia page is often the first source.

```bash
# YouTube, a solo talk (single voice). For an interview or podcast use --type thread.
faces compile:import <alias> --url "<youtube-url>" --type document --medium lecture \
  --perspective first-person --no-wait --json

# If YouTube blocks it: download, extract and compress the audio (<100MB), upload
yt-dlp --cookies-from-browser chrome -o video.mp4 "<youtube-url>"
ffmpeg -i video.mp4 -vn -ac 1 -b:a 48k audio.mp3
THREAD_ID=$(faces compile:upload <alias> --file audio.mp3 --kind thread \
  --no-wait --json | jq -r '.thread_id // .id')
faces compile:thread:get "$THREAD_ID" --status-only --json | jq '{status}'   # wait for "not_compiled"
faces compile:thread:get "$THREAD_ID"                                         # check the speakers
faces compile:thread:edit "$THREAD_ID" --face-speaker "B"
faces compile:thread:make "$THREAD_ID" --no-wait --json

# Text the subject wrote that you already have (a draft, notes, anything not on disk).
# Pass it verbatim: do NOT retype or summarise it.
faces compile:doc <alias> --content "<text>" --label "<name>" --medium <medium> --perspective first-person --no-wait --json
# A transcript or interview as text (on disk, or saved as "Speaker: text" lines): a thread
THREAD_ID=$(faces compile:upload <alias> --file <path> --kind thread --face-speaker "<name in file>" \
  --no-wait --json | jq -r '.thread_id // .id')
faces compile:thread:get "$THREAD_ID"                                         # check the speakers
# A local text file, by the subject
faces compile:doc <alias> --file <path> --medium <medium> --perspective first-person --no-wait --json
# Several at once: --file is repeatable, each becomes its own document. One --medium applies to all.
faces compile:doc <alias> --file a.txt --file b.txt --file c.txt --medium essay --perspective first-person --no-wait --json
# A local text file about the subject (biography, encyclopedia article, news profile)
faces compile:doc <alias> --file <path> --medium <medium> --perspective third-person --no-wait --json
# PDF, Word (.docx), audio or video: compile:upload (compile:doc takes text only)
faces compile:upload <alias> --file <path> --kind document --medium <medium> --perspective first-person --no-wait --json

# Interview (you as the interviewer): see ../faces/references/INTERVIEWS.md
```

**`--medium` is required on every document, and must not be guessed.** The server never infers
one. Eleven values, spelled exactly: `academic paper`, `blog post`, `conversation`, `email`,
`essay`, `lecture`, `legal document`, `other`, `social post`, `text message`, `thread reply`.
Any other word is a `422`.

**Ask the user which it is** when they have not said. One question, an obvious answer. Do not
infer it from the filename.

**`other` is for writing in none of those forms**: a few paragraphs that are not an email, an
essay, a lecture or a legal document. It compiles. Reach for it when nothing fits, never to skip
asking, and do not file a letter or a memo there: those have rules of their own.

Poll one source: `faces compile:thread:get ID --status-only --json | jq '{status, progress}'`

**Poll the whole set with one call instead.** This step starts several compiles at once, so the
question is "are they all done":

```bash
faces compile:status --json | jq '{sources_active, measurable, progress}'
faces compile:status --watch      # blocks until the account is quiet, then exits
```

When reporting back:

- **`sources_active: 0` means nothing is running, not nothing is outstanding.** Paused sources
  are not counted; they are listed apart in `paused`, each with its `alias`. Read that list
  before saying everything finished.
- **No percentage while `measurable` is false.** Its `progress` is `null` then (during a
  transcription, for one): say "working".
- **Queued is waiting, not stuck.** A face's sources wait their turn, reading `queued` with
  progress 0: say "queued", never "0%".

For audio and video sources, always review the transcript with the user before compiling:
transcription quality varies and speaker labels may need correcting.

**Read the upload's warnings.** A thread upload reports `warnings`:

- `face_speaker_not_found`: the `--face-speaker` name matched nobody in the file, so the face
  has **no lines of its own**. Upload again with a name that appears in the file; the warning
  lists the speakers it found.
- `unattributed_lines`: lines before the first `Speaker:` prefix. They are not in the thread.

The upload succeeds either way, so the warnings are the only sign of a broken import.

After each compile, update the FACE.md body: tick the box in Queued, and add an entry to Sources
with its token count and notes. Whether a face is compiled is the server's answer, not the
file's: `faces face:sources <alias>` (a source reading `synced` has compiled).

### Step 6 (optional): Build how the person writes

If the face is a real person and you have their own writing in a medium (mail, messages,
essays), offer to build a style for that medium so the face writes better in it. A face holds a
separate style per medium, and writing *about* the person never goes into one.

```bash
faces style:make <alias> --source DOC_OR_THREAD_ID --source "OTHER_ID:essay" --no-wait --json
faces style:status --face <alias>
```

On Connect or Pro with a linked ChatGPT account a build runs there at no charge. Anywhere else
it is charged to credits, so it needs `--allow-paid`: pass it only if the user agrees to pay.
Building does not apply it: chat with `--style <medium>`. See the `/faces` skill's REFERENCE.md, "Style".

### Step 7: Done

Tell the user the face is ready. They can chat with it with `/facechat <alias>` from anywhere,
or `/facechat` to browse their catalog and pick one.
