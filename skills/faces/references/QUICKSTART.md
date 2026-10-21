# Quickstart

From zero to a face's first cause and answer. Follow these steps in order.

**Claude Code only:** right after the faces-skill bundle is installed, the slash commands
(`/facemake`, `/facechat`, and so on) are not available until the session restarts. You cannot
restart it yourself, so tell the user: *"Type `/exit`, then run `claude --continue` so the new
skills load and we pick up where we left off."* Other agents load new skills without a restart.

**Website:** https://faces.sh · **API:** https://api.faces.sh (schema:
https://api.faces.sh/openapi.json)

## 1. Install or update the CLI

```bash
npm install -g faces-cli@latest
faces --version
```

The same command installs the CLI or updates it.

## 2. Sign in

Ask the user where they are starting from:

> To use Faces, you need an account. Where are you starting from?
>
> A) I have an account, and I'll log in now
> B) I have an API key, and I'll paste it
> C) I need an account: help me create one here
> D) I'll register at faces.sh myself and come back

**A (log in):**
```bash
faces auth:login --email USER_EMAIL --password 'USER_PASSWORD'
faces auth:whoami
```

**B (API key):**
```bash
faces config:set api_key <key>
faces auth:whoami
```

**C (register here):** ask which plan:

> Faces has three plans. Which fits you?
>
> A) **Free**: add $5 of credit to start, then everything is paid as it goes. No monthly fee.
>    Good for trying it out.
> B) **Connect ($17/month)**: monthly allowances for compiling and for causes, and the
>    Codex-eligible models run on your linked ChatGPT plan. Other models are paid as they go.
> C) **Pro ($49/month)**: Connect with larger allowances.

Then register:

```bash
# Free
RESULT=$(faces auth:register --email USER_EMAIL --password 'USER_PASSWORD' --username USERNAME --json)
echo "$RESULT" | jq -r '.checkout_url'

# Connect or Pro
RESULT=$(faces auth:register --email USER_EMAIL --password 'USER_PASSWORD' --username USERNAME --plan connect --json)   # or --plan pro
echo "$RESULT" | jq -r '.checkout_url'
```

The username is 1 to 32 characters: a lowercase letter, then lowercase letters, numbers or
underscores. The password needs 8 to 64 characters with an uppercase letter, a lowercase letter
and a digit. If the checkout link could not be fetched, `checkout_url` is missing and
`checkout_error` says why.

Ask the human to open the checkout URL in their browser and pay. When they confirm:

```bash
faces billing:balance --json | jq '.is_active'
```

`true`: carry on. `false`: the payment may not have gone through; ask them to try the link again.

**D (register themselves):** ask them to register at [faces.sh](https://faces.sh) and come back
with login details or an API key.

## 3. Create a face

Every account already has a face of its own, aliased **`me`**. To build the user's own face,
compile into `me` rather than creating another (see
[REFERENCE.md → The `me` face](REFERENCE.md#the-me-face)), and use `me` wherever this guide says
`alice`.

For anyone else, create a face with a few basic facts. `age`, `gender` and `location` take a
plain value; `identity`, `education`, `occupation`, `religion`, `family`, `relationships`,
`health`, `languages` and `background` take a short sentence. Those twelve are the only keys:
any other is a `422` naming it, and nothing in that request is saved. `faces face:attributes`
lists them.

```bash
faces face:create --name "Alice Smith" --alias alice \
  --default-model gpt-5.4-mini \
  --attr gender=woman --attr age=29 \
  --attr location="Brooklyn, NY" \
  --attr occupation="Works as a product designer at a fintech startup." \
  --attr education="Studied design at RISD." \
  --json
```

Keep the **alias** (`alice`): every command after this takes it.

## 4. Add source material

> **Thread or document? Decide this first.** Any source with more than one speaker (an
> interview, podcast, conversation, Q&A, panel) is a **thread**: it keeps who said what, and
> `--face-speaker` names the face's own lines. Only single-voice material (an essay, article,
> solo talk, the person's own writing) is a **document**. Compiling a multi-speaker source as a
> document reads every speaker as the face, so if two or more people are talking, it is a
> thread.

> **By them or about them? Always pass `--perspective`.** `compile:doc` and
> `compile:doc:create` default to `first-person`; `compile:upload` and `compile:import` default
> to `third-person`. Say it every time. `first-person` is the subject's own words: essays,
> letters, interview answers, talks. `third-person` is material *about* them: a biography, an
> encyclopedia article, a news profile.

> **Every document needs a `--medium`**, one of `email`, `text message`, `social post`,
> `essay`, `academic paper`, `blog post`, `legal document`, `thread reply`, `conversation`,
> `lecture`, `other`. Ask the user if you do not know; never guess.

Pick whatever the user has:

**A local file (text, PDF, Word):**
```bash
# By the subject
DOC_ID=$(faces compile:upload alice --file /path/to/document.pdf --kind document --medium essay --perspective first-person --no-wait --json | jq -r '.document_id // .id')
# About the subject
DOC_ID=$(faces compile:upload alice --file /path/to/profile.pdf --kind document --medium essay --perspective third-person --no-wait --json | jq -r '.document_id // .id')
```

**A YouTube video, one speaker:**
```bash
IMPORT=$(faces compile:import alice \
  --url "https://www.youtube.com/watch?v=VIDEO_ID" \
  --type document --medium lecture --perspective first-person --no-wait --json)
DOC_ID=$(echo "$IMPORT" | jq -r '.document_id // .doc_id // .id')
```

**A YouTube video, several speakers:**
```bash
IMPORT=$(faces compile:import alice \
  --url "https://www.youtube.com/watch?v=VIDEO_ID" \
  --type thread --no-wait --json)
THREAD_ID=$(echo "$IMPORT" | jq -r '.thread_id // .id')
# When transcription finishes, check the speakers and map the face's:
# faces compile:thread:get "$THREAD_ID"
# faces compile:thread:edit "$THREAD_ID" --face-speaker "A"
```

**Text in hand:**
```bash
DOC_ID=$(faces compile:doc:create alice --label "Notes" --medium essay --perspective first-person --content "Text here..." --json | jq -r '.document_id')
```

## 5. Compile

```bash
faces compile:doc:make "$DOC_ID" --no-wait --json
faces compile:thread:make "$THREAD_ID" --no-wait --json
```

Or create and compile a text document in one step:

```bash
faces compile:doc alice --file essay.txt --medium essay --perspective first-person --no-wait --json
```

Poll: `faces compile:doc:get DOC_ID --status-only --json | jq '{status, progress, finishing}'`
(or `compile:thread:get`). `status` runs `queued`, `compiling`, `compiled` (or `paused`,
`failed`), and `progress` goes from 0 to 1. For everything at once: `faces compile:status`.
Always poll with `--status-only`, which leaves the text out.

## 6. Chat

`chat:chat` routes each model to its endpoint. With a `--default-model` on the face, no `--llm`
is needed.

```bash
faces chat:chat alice -m "What matters most to you?"                          # on the face's default model
faces chat:chat alice --llm claude-sonnet-4-6 -m "What matters most to you?"  # another model
faces causes alice -m "What matters most to you?"                            # the cause alone
```

Every answer comes with the face's **cause**: the principal *why* behind it (`--show-cause`
prints it too). `faces causes` returns the cause alone, with no model answering, and is billed
for the cause only.

## 7. Check it worked

```bash
faces face:sources alice
faces face:sources alice --json | jq '[.documents[], .threads[]] | map({label, status, synced})'
```

Every source should read `synced` (`"synced": true` in `--json`). `queued` or `compiling` is
not done yet; `not compiled` was never started; `cannot compile: ...` says why it never will.
The face is ready once a source reads `synced`.

## What's next

- **Add more material:** repeat steps 4 and 5. Each compile adds to the face.
- **More faces:** repeat steps 3 to 5.
- **Compare faces:** `faces face:diff --face alice --face bob`
- **Compose faces:** `faces face:create --name "Alice and Bob" --alias alice-and-bob --formula "alice | bob"`
- **Ask what a face would decide:** `faces decide alice --state "..." --question "..."` (see
  [REFERENCE.md → Decisions](REFERENCE.md#decisions-decide))
- **Compare causes:** get each face's cause on the same question with `faces causes <alias>
  -m '<question>'`, then give both to a model with no face:
  `faces chat:messages claude-sonnet-4-6 -m 'Alice: <cause>. Bob: <cause>. Compare them.'`
  (a model with no face works with `chat:messages` and `chat:responses`)
- **Connect ChatGPT** (Connect or Pro): `faces auth:connect openai`. See [OAUTH.md](OAUTH.md).
- **An API key:** `faces keys:create --name "my-key"` for programmatic access. See
  [AUTH.md](AUTH.md).
