# Quickstart

End-to-end guide for getting a human from zero to chatting with a Face. Follow these steps in order.

**Important (Claude Code only):** If you just installed the faces-skill bundle in Claude Code, the slash commands (`/facemake`, `/facechat`, etc.) won't be available until the session restarts. You cannot restart it yourself, so tell the user: *"Type `/exit`, then run `claude --continue` so the new skills load and we pick up where we left off."* Other agents load new skills without a restart.

**Website:** https://faces.sh · **API:** api.faces.sh (schema: https://api.faces.sh/openapi.json)

## 1. Install or update the CLI

```bash
npm install -g faces-cli@latest
faces --version
```

The same command installs the CLI fresh or upgrades an existing install to the latest version.

## 2. Get authenticated

Ask the user where they're starting from:

> To use Faces, you need an account. Where are you starting from?
>
> A) I have an account, and I'll log in now
> B) I have an API key, and I'll paste it
> C) I need to create an account: help me here
> D) I'll register at faces.sh myself and come back

**If A (log in):**
```bash
faces auth:login --email USER_EMAIL --password 'USER_PASSWORD'
```
Verify: `faces auth:whoami`

**If B (API key):**
```bash
faces config:set api_key <key>
```
Verify: `faces auth:whoami`

**If C (register here):**

Ask the user which plan they want:

> Faces has three plans. Which fits you better?
>
> A) **Free**: $5 initial spend (added as API credits), then everything pays
>    as it goes. No monthly fee. Good for trying it out.
> B) **Connect ($17/month)**: monthly allowances for compiling and for the
>    face's reasoning, and gpt-5.x chat free on your linked ChatGPT Plus or Pro
>    account. Other models pay as they go.
> C) **Pro ($49/month)**: Connect with larger allowances.

Then register with the chosen plan:

```bash
# Free plan
RESULT=$(faces auth:register --email USER_EMAIL --password 'USER_PASSWORD' --username USERNAME --json)
echo "$RESULT" | jq -r '.checkout_url'

# Connect or Pro plan
RESULT=$(faces auth:register --email USER_EMAIL --password 'USER_PASSWORD' --username USERNAME --plan connect --json)   # or --plan pro
echo "$RESULT" | jq -r '.checkout_url'
```

`--json` returns `status`, `user_id`, `plan`, `amount` and `checkout_url`. If the
checkout link could not be fetched, `checkout_url` is missing and `checkout_error` says why.

Tell the human to open the checkout URL in their browser and complete payment.
Wait for confirmation, then verify:

```bash
faces billing:balance --json | jq '.is_active'
```

If `true`, proceed. If `false`, the payment may not have gone through — ask
them to try the link again.

**If D (register themselves):**

Tell them to register at [faces.sh](https://faces.sh), then come back with
either login credentials or an API key.

## 3. Create a Face

Start by creating the Face with a few basic facts. These anchor the persona and improve compilation quality when source material is added later. `age`, `gender` and `location` take a plain value; `identity`, `education`, `occupation`, `religion`, `family`, `relationships`, `health`, `languages` and `background` take a short sentence. Those twelve are the only keys: any other is a `422` naming it, and nothing in that request is saved. `faces face:attributes` lists them.

```bash
faces face:create --name "Alice Smith" --alias alice \
  --default-model gpt-5.4-mini \
  --attr gender=woman --attr age=29 \
  --attr location="Brooklyn, NY" \
  --attr occupation="Works as a product designer at a fintech startup." \
  --attr education="Studied design at RISD." \
  --json
```

Keep the **alias** (`alias` in the `--json` output, `alice` here): every command after this takes it. The response also has a `uid`, which no command in this guide needs.

## 4. Add source material

> **Thread or document? Decide this first.** Any source with more than one
> speaker (an interview, podcast, conversation, Q&A, panel) is a **thread**: it
> preserves who said what, and you map the target person's own lines with
> `--face-speaker`. Only single-voice material (an essay, article, solo talk, or
> the person's own writing) is a **document**. Compiling a multi-speaker source
> as a document flattens the dialogue into one voice and corrupts the face, so
> when in doubt, if two or more people are talking, it is a thread.

> **By them or about them? Always pass `--perspective`.** The default depends on
> the command: `compile:doc` and `compile:doc:create` (text) default to
> `first-person`, while `compile:upload` and `compile:import` (PDF, Word, audio,
> video, YouTube) default to `third-person`. Say it every time. `first-person` is
> the subject's own words: their essays, letters, interview answers, talks.
> `third-person` is material *about* them: a biography, an encyclopedia/Wikipedia
> article, a news profile. Either mistake corrupts the face: writing about them
> compiled as first-person reads as if they wrote it, and their own PDF uploaded
> without `--perspective first-person` is compiled as writing about them, which
> style capture then refuses.

Pick one or more methods depending on what the human has:

**Local file — single-voice document (text, PDF):**
```bash
# By the subject: pass --perspective first-person (compile:upload defaults to third-person)
# --medium is required: say what the writing is (essay, email, ...), and ask if you do not know
DOC_ID=$(faces compile:upload alice --file /path/to/document.pdf --kind document --medium essay --perspective first-person --no-wait --json | jq -r '.document_id // .id')
# About the subject (biography, Wikipedia, news profile): --perspective third-person
DOC_ID=$(faces compile:upload alice --file /path/to/profile.pdf --kind document --medium essay --perspective third-person --no-wait --json | jq -r '.document_id // .id')
```

**YouTube video (solo speaker):**
```bash
IMPORT=$(faces compile:import alice \
  --url "https://www.youtube.com/watch?v=VIDEO_ID" \
  --type document --medium lecture --perspective first-person --no-wait --json)
DOC_ID=$(echo "$IMPORT" | jq -r '.document_id // .doc_id // .id')
```

**YouTube video (multi-speaker interview):**
```bash
IMPORT=$(faces compile:import alice \
  --url "https://www.youtube.com/watch?v=VIDEO_ID" \
  --type thread --no-wait --json)
THREAD_ID=$(echo "$IMPORT" | jq -r '.thread_id // .id')
# After transcription completes, review and remap speaker:
# faces compile:thread:edit "$THREAD_ID" --face-speaker "A"
```

If `--type thread` fails with 422, retry with `--type document`.

**Raw text:**
```bash
DOC_ID=$(faces compile:doc:create alice --label "Notes" --medium essay --perspective first-person --content "Text here..." --json | jq -r '.document_id')
```

## 5. Compile

For documents (including uploads and YouTube-as-document):

```bash
# Compile an existing document
faces compile:doc:make "$DOC_ID" --no-wait --json
```

Or, if you created the document inline (step 4, "Raw text"), you can create and compile in one step:

```bash
faces compile:doc alice --file essay.txt --medium essay --perspective first-person --no-wait --json
# Poll: faces compile:doc:get DOC_ID --status-only --json | jq '{status, progress}'
```

For threads:

```bash
faces compile:thread:make "$THREAD_ID" --no-wait --json
```

Poll status: `faces compile:thread:get THREAD_ID --status-only --json | jq '{status, progress}'`. `status` runs `queued`, `compiling`, `compiled` (or `paused`, `failed`), and `progress` goes from 0 to 1. Compiling needs faces-cli 1.20.0 or newer.

`--status-only` leaves out the messages. Polling without it pulls the whole thread back
every tick — a few hundred bytes against 120KB in one measurement — and for an agent
that is the transcript landing in context repeatedly.

## 6. Chat

`chat:chat` auto-routes to the correct API based on model provider. If a `--default-model` was set on the face, no `--llm` flag is needed.

```bash
# Uses default model (gpt-5.4-mini set in step 3)
faces chat:chat alice -m "What matters most to you?"

# Override with a specific model
faces chat:chat alice --llm claude-sonnet-4-6 -m "What matters most to you?"
```

## 7. Verify it worked

```bash
faces face:sources alice
faces face:sources alice --json | jq '[.documents[], .threads[]] | map({label, status, synced})'
```

Every source should read `synced` in the STATUS column (`"synced": true` in `--json`). A
source still `queued` or `compiling` is not done yet; `not compiled` means its compile was
never started; `cannot compile: ...` says why it never will. The face is ready once a source
reads `synced`.

Do not use `component_counts` from `face:get` for this. It is a list of numbers, one per
component, and the attributes you set at `face:create` already count, so a face with four
attributes and nothing compiled returns something like `[0, 0, 0, 4, 0, 0]`.

## What's next

- **Add more material** — repeat steps 4–5 to deepen the Face. Each compile adds to the existing knowledge.
- **Create more Faces** — repeat steps 3–5 for each persona.
- **Compare Faces** — `faces face:diff --face alice --face bob`
- **Compose Faces** — `faces face:create --alias alice-and-bob --formula "alice | bob"`
- **Use templates** — reference multiple faces in a single prompt: `faces chat:messages claude-sonnet-4-6 -m 'Compare ${alice} and ${bob}.'` (a bare model works with `chat:messages` and `chat:responses`, not `chat:chat`; see [TEMPLATES.md](TEMPLATES.md))
- **Connect ChatGPT** (Connect or Pro plan) — `faces auth:connect openai` to use select OpenAI models at no extra cost. See [OAUTH.md](OAUTH.md).
- **Create an API key** — `faces keys:create --name "my-key"` for programmatic access. The key is saved to `~/.faces/config.json` automatically; pass `--no-save` to skip. See [AUTH.md](AUTH.md).
