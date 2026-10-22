# What Faces is

Faces are **causal models**. A face distills the essence of a particular author from
unstructured source texts: essays, blog posts, emails, letters, interviews, talks. When
prompted, a face returns a **cause**: the principal *why* that would motivate that author's
response in the given context. Causes steer other AIs, so an agent keeps a consistent, specific
point of view however long it runs.

Causes are upstream of reasons. A reason is what you tell a police officer when they ask why
you did not stop at a red light; a cause is how you decided what to say.

## The Causes API and its wrappers

| API | Endpoints | Compatible with | Returns |
|---|---|---|---|
| Causes | `/v1/causes` | | the `cause` alone |
| Chat | `/v1/chat/completions`, `/v1/responses`, `/v1/messages` | OpenAI, Anthropic | the model's answer, with its `cause` |
| Decisions | `/v1/decisions`, `/v1/systemone` | OpenAI, TypeSafe | typed `answers`, with a `cause` per question |

A wrapper takes `face@model`: the face's cause steers that model's answer, in one request. A
face named alone (`alice`, with no `@model`) returns the cause alone. In the CLI, `chat:*` and
`faces decide` are the wrappers, and `faces causes alice -m "…"` returns the cause alone.

A wrapper sends the answering model more than the cause: the face's name and the identity
details relevant to the request. On the chat wrappers, `--style <medium>` also sends the face's
built style for that medium, so the reply reads the way the face would write it there. Style
applies only on the chat wrappers; causes and decisions do not use it.

The same face can make different choices on similar prompts through chat and through decide.
Chat is open-ended: the model writes its own answer. A decision is closed-ended: the model
picks among the options or levels given, and returns typed answers. A style, which only chat
uses, can also shift a reply.

## Compiled, not trained

A face is compiled from unstructured text. There is no dataset to prepare and no training run,
and a face is not tied to any one model: pair it with any chat model in the catalog. Add a
source and compile it; delete one and what it contributed goes with it. A face's cost per
request does not depend on how much has been compiled into it.

## Composable and comparable

Faces combine with **boolean set algebra** into composites:

| Operator | Syntax |
|---|---|
| Union | `a \| b` |
| Intersection | `a & b` |
| Difference | `a - b` |
| Symmetric difference | `a ^ b` |

Parentheses group: `(a | b) - c`. A composite can be **persisted** as a named face
(`face:create --formula "a | b"`) or composed **per request** by putting the formula where a
face goes (`chat:chat "(a | b)@model"`). A per-request composite answers under the name of its
first operand. A formula whose result is empty is refused with `422 empty_composite` ("the
intersection between these two faces is null"). See
[REFERENCE.md → Run-time composite faces](REFERENCE.md#run-time-composite-faces).

Compiled faces are also **comparable**: `face:diff` scores how alike two faces are, from `-1` to
`1`, and `face:neighbors` finds the most and least similar faces to one face. When either face
is not yours, the similarity is rounded to one decimal place.

## Style

Every source text has a **medium**: `email`, `text message`, `social post`, `essay`,
`academic paper`, `blog post`, `legal document`, `thread reply`, `conversation`, `lecture` or
`other`. A **style build** reads a face's own writing in one medium and installs a style for
that medium, so the face writes better in it. A face holds a separate style per medium.

A style is applied per request with `--style <medium>` on the chat commands only (not on
`faces causes` or `faces decide`), and adds roughly
2,000 to 3,500 input tokens to each request that uses it. Most faces never need one; it is
worth building when the face is a real person and you have their own writing. See
[REFERENCE.md → Style](REFERENCE.md#style-how-a-face-writes-style).

For example use cases, see [USE_CASES.md](USE_CASES.md).
