# Interviews

An interview is a question-and-answer conversation in which someone answers as the face. Their
answers become source material for the face. It is the most accessible way to build a face: no
documents are needed.

There are two modes. Mode 2 (you, the agent, as interviewer) is recommended with this skill,
because you have the conversation's context and can ask better, more targeted questions.

## Mode 1: Built-in interviewer

Faces asks the questions. Good for a guided, hands-off session.

```bash
# 1. Start: returns the thread id and the opening question
RESULT=$(faces compile:thread:create alias --label "Interview" --json)
THREAD_ID=$(echo "$RESULT" | jq -r '.thread_id // .id')
# Show the question to the user

# 2. Loop: send the user's answer, get the next question
RESULT=$(faces compile:thread:message "$THREAD_ID" -m "user's answer" --json)
# Show the next question. Repeat until the user is done.

# 3. Compile
faces compile:thread:make "$THREAD_ID" --no-wait --json
```

Each `compile:thread:message` stores the answer and returns the next question, and bills for
the question it writes. On Connect and Pro with ChatGPT linked the questions run on the
ChatGPT plan; otherwise they are paid from credits. `--oauth-only` refuses the credits route.
A `402` with `needs_oauth` or `needs_credits` says which is missing.

A fresh interview holds only the opening question, so it cannot be compiled
(`no_user_messages`) until the first answer arrives.

## Mode 2: Agent as interviewer (recommended)

You run the interview yourself, with no Faces calls while you talk. Tailor the questions to what
the user wants the face for, follow up on interesting answers, and skip what does not matter.

**Step 1: Conduct the interview.** Ask, listen, follow up.

**Step 2: Write the transcript** as a text file, one turn per line, `Speaker: message`:

```
Agent: Tell me about yourself.
Johnny: I grew up in a small town in Alabama...
Agent: What shaped your worldview?
Johnny: Reading philosophy as a teenager changed everything.
```

**Step 3: Upload, check, compile.**

```bash
THREAD_ID=$(faces compile:upload alias --file transcript.txt --kind thread \
  --face-speaker "Johnny" --json | jq -r '.thread_id // .id')
faces compile:thread:get "$THREAD_ID"     # check the speaker mapping first
faces compile:thread:make "$THREAD_ID" --no-wait --json
```

`--face-speaker` names the speaker who **is** the face; their lines become `role=user` and
everyone else's `role=assistant`. Only the face's own lines count toward it. Always pass it.

**Labels:** for a text transcript, use the speaker name from the file (`--face-speaker
"Johnny"`). For audio or video, speakers are transcribed as `A`, `B`, `C`: use the label
(`--face-speaker B`). The match is case-insensitive but exact. If the upload warns
`face_speaker_not_found`, the name matched nobody and the face has no lines of its own:
upload again with a name that appears in the file.

## Tips

- **Several interviews:** compile each into the same face. Each one adds to it.
- **Depth:** aim for at least 5 to 10 substantive exchanges. Longer interviews make better
  faces.
- **Resuming a built-in interview:** read it with `faces compile:thread:get THREAD_ID` and carry
  on with `compile:thread:message`.
- **A growing conversation:** send the whole transcript again with `compile:thread:replace
  THREAD_ID --file transcript.txt --face-speaker NAME`, then `compile:thread:make`, rather than
  uploading each new stretch as another thread.
- **Polling:** `faces compile:thread:get THREAD_ID --status-only --json | jq '{status,
  progress, finishing, stall_reason}'`. Read `finishing` first: while it is `true` the server
  is still working, retries included, so show progress and offer nothing. Only once it is
  `false` is `failed` final, and `stall_reason` says why. Never start a second compile of a
  source that is still finishing.
