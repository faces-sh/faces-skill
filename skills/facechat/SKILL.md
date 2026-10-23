---
name: facechat
description: >
  Chat with any face in your catalog. Invoke as /facechat <alias> <message>
  to send a message directly (e.g. /facechat socrates How are you?),
  /facechat <alias> to start a conversation, or /facechat with no argument
  to browse your catalog and pick a face. Trigger when the user says "chat
  with a face", "talk to <name>", "ask <name>", or wants to have a
  conversation with a compiled face. Also trigger on /facechat.
allowed-tools:
  - Bash
  - Read
  - Grep
  - Glob
  - AskUserQuestion
  - WebSearch
  - WebFetch
---

# /facechat: Chat with a Face

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

- `EXIT:0` -> authenticated. Proceed.
- `EXIT:127` -> the CLI is not installed. Install it as above and re-run, before anything else.
- `EXIT:1` + `HAS_CONFIG` -> returning user. Read the whoami output to
  understand what failed. Present the diagnosis and help them fix it. Do NOT
  walk through QUICKSTART or ask about plans.
- `EXIT:1` + `NO_CONFIG` -> new user. Ask the user:

  > You're not logged into Faces, and I don't see any prior config on this
  > machine. Do you already have an account?
  >
  > A) I have an account, and I'll log in now
  > B) I have an API key, and I'll paste it
  > C) No account: help me set one up here
  > D) No account: I'll register at faces.sh myself and come back

  If A: have the user run `faces auth:login --email YOUR_EMAIL --password 'YOUR_PASSWORD'`
  If B: have the user run `faces config:set api_key <key>`, verify with `faces auth:whoami`
  If C: walk through [QUICKSTART.md](../faces/references/QUICKSTART.md)
  If D: tell them to come back with login credentials or an API key

**Secret hygiene:** Never display API keys, tokens, or passwords from config
files. Always mask them (e.g. `sk-faces-...dN`).

---

## Parse arguments

The argument string after `/facechat` is parsed as: first word is the alias,
everything after it is the message. Examples:

- `/facechat socrates How are you?`: alias=`socrates`, message=`How are you?`
- `/facechat socrates`: alias=`socrates`, no message
- `/facechat`: no alias, no message (browse the catalog)

## Resolve the target

The alias can name a **face** or a **team** (several faces with a collaboration
protocol). Check both.

**If alias provided** (`/facechat socrates` or `/facechat socrates How are you?`):

```bash
# Check face first, then team
faces face:get $ALIAS --json 2>/dev/null
echo "---TEAM_CHECK---"
faces group:list --json 2>/dev/null | jq -r '.[] | select(.name == "'$ALIAS'") | .id'
# Local teams live under a slug of the name ("Review Panel" -> review-panel)
SLUG=$(echo "$ALIAS" | tr '[:upper:]' '[:lower:]' | sed -E 's/[^a-z0-9]+/-/g; s/^-+|-+$//g')
ls ~/.faces/teams/$SLUG/TEAM.md 2>/dev/null
```

- A face found: single-face chat (see **Chat** below).
- A team found (by name in `group:list`, or a local TEAM.md): team chat (see **Team Chat** below).
- Both found: the face wins (teams should have distinct names).
- If neither found, check for close matches:

```bash
cat ~/.faces/catalog.json | jq -r '.[].alias'
faces group:list --json 2>/dev/null | jq -r '.[].name'
ls ~/.faces/teams/ 2>/dev/null
```

Suggest the closest match or offer to create the face with `/facemake` or team
with `/faceteam`.

**If no alias provided** (`/facechat`):

List both faces and teams:

```bash
faces face:list --json 2>/dev/null
echo "---TEAMS---"
ls ~/.faces/teams/ 2>/dev/null
```

Present as a numbered list showing alias, name/description, and whether it's
a face or team. Ask the user:

> **Your catalog.** Who do you want to chat with?
>
> **Faces:**
> [numbered list of faces]
>
> **Teams:**
> [numbered list of teams]
>
> Pick a number, or type a name/alias.

## Chat

Once the face is resolved, start a **thread** so the face remembers the
conversation across turns (`chat:chat` is stateless and forgets each turn):

```bash
faces chat:thread ALIAS -m "MESSAGE" --json
```

Keep the `thread_id` from the response: every follow-up uses it.

If the user didn't include a message with the alias, ask what they want to
discuss. Ask the user:

> **Chatting with NAME.** What would you like to ask or discuss?

### Conversation loop

After each response from the face, the user can:
- Send another message (continue the conversation)
- Type `/facechat` again to switch to a different face
- Move on to other work

For follow-up messages in the same conversation, resume the same thread by id so
the face keeps full context:

```bash
faces chat:thread --id THREAD_ID -m "MESSAGE"
```

Start a fresh thread (omit `--id`, pass the alias) when switching faces or when
the user clearly begins a new topic.

### Model override

If the user wants a different model than the face's default, pass `--llm` **when
starting the thread** (it's frozen for the life of the thread; start a new
thread to change it):

```bash
faces chat:thread ALIAS -m "MESSAGE" --llm MODEL
```

### Bringing in another face

To bring another face's view into the conversation, get its cause on the
question (the principal *why* behind its response) with
`faces causes OTHER -m "QUESTION"`, and include it in the message.

### Long conversations

For a long conversation, keep the cost of each turn down with a session: open
one with `faces session:create ALIAS`, pass `--session SESSION_ID` on each turn,
and when it grows, `faces session:compact SESSION_ID` and continue with
`--compaction COMPACTION_ID`. See the `/faces` skill's REFERENCE.md, "Sessions
and compaction".

## Team Chat

When the target is a team, read the TEAM.md and execute the mermaid protocol
diagram mechanically.

### Load the protocol

```bash
cat ~/.faces/teams/$SLUG/TEAM.md
```

Parse the YAML frontmatter for the `members:` list (the faces on the team).
Then parse the mermaid flowchart: this is the entire execution spec, round
limits included.

If `members:` holds ids rather than aliases, read the aliases with
`faces group:members GROUP_ID`, or run `faces catalog:doctor --fix` to rewrite
the file.

### Walk the graph

The mermaid diagram uses three shapes. Each has one rule:

- `(alias)` **rounded rectangle**: call the face:
  `faces chat:chat alias -m "INPUT"` where INPUT is the concatenated output
  from all incoming edges. Format each input clearly:
  ```
  [from Query]: <the user's original message>
  [from face-a]: <face-a's response>
  ```
  A member you do not own is `owner:alias` and needs a model named:
  `faces chat:chat owner:alias@MODEL -m "INPUT"`.
- `[text]` **sharp rectangle**: you (the orchestrating agent) carry out the
  instruction described in the text. The text IS the instruction.
- `{text}` **diamond**: you evaluate the condition described in the text
  and follow the matching outgoing edge. The text IS the condition.

**Edge rule:** an edge from A to B means B receives A's output. If B has
three incoming edges, B gets all three outputs as input. No implicit context:
if there is no edge, that data does not flow.

**Entry/exit:** the graph starts at the `[Query]` node (the user's message)
and ends at the `[Response]` node (what you show the user).

### Execution loop

1. Start at `[Query]`: seed it with the user's message.
2. Follow outgoing edges. For each node you reach:
   - `(face)`: call `faces chat:chat` with the concatenated inputs.
   - `[instruction]`: carry out the instruction yourself.
   - `{condition}`: evaluate and branch.
3. If an edge loops back (e.g. round-robin), increment the round counter.
   Stop where the diamond's condition says to (e.g. "or this is round 3"). If
   the diagram names no limit, stop after 3 rounds.
4. When you reach `[Response]`, present the final output to the user.

### Presenting team responses

Show each face's contribution with attribution so the user sees who said what:

> **skeptic:** [response]
>
> **builder:** [response]
>
> **strategist:** [response]
>
> **[Tally/Decision/Final node label]:** [final output]

For pipeline protocols where each face refines the previous output, show only
the final face's response unless the user asks to see the full chain.

### Follow-up messages

For follow-ups in a team conversation, re-run the full protocol with the new
message. Each run is independent: the protocol starts fresh each time.
The user can reference prior responses in their follow-up message naturally.

## Related skills

- `/facemake`: guided face creation
- `/faces`: the core CLI for every platform operation
- `/faceteam`: compose faces into teams
