# OAuth — Connect ChatGPT (Subscription Connect plan only)

Subscription Connect users can link their own ChatGPT Plus/Pro account to use select OpenAI models at no extra cost for both compiling and chatting with faces.

**The human approves once in their browser. After that, tokens are stored server-side and the agent never asks again.** No browser extension and no localhost server are required — connection uses the OAuth 2.0 Device Authorization Grant, so it works over SSH, in containers, and headless.

## How the flow works

`faces auth:connect openai` prints a short code and a URL, then waits (polling automatically) until the human approves:

```
To connect ChatGPT:
  1. Open this URL in any browser (phone, laptop — anywhere):
       https://auth.openai.com/codex/device
  2. Enter this code:  QUHO-OSQNW
  3. Sign in to ChatGPT and click Continue.
```

The code expires after 15 minutes; the command polls until it's approved, then prints the connected account and plan. Ctrl-C cancels cleanly.

## The enable-setting gate (read this)

Device-code authorization is **opt-in per ChatGPT account**. OpenAI enforces it on their consent screen, *not* on our side — so the human will get a code fine, then hit a red "enable device code authorization for Codex" warning after entering it. Tell the human up front:

> If this is your first time, you may need to enable device-code authorization in ChatGPT first:
> 1. Open https://chatgpt.com/#settings/Security  (the settings panel can take a few seconds to appear — give it a moment)
> 2. Turn on "Enable device code authorization for Codex"
> 3. Then enter the code

## Recommended agent flow

```bash
# 1. Check if already connected — do this first, skip the rest if openai is listed.
faces auth:connections --json

# 2. If not connected, task the human to run this in THEIR terminal (it prints a
#    code + URL and blocks while polling — don't run it as a silent background call):
faces auth:connect openai

# 3. Confirm once they're done.
faces auth:connections --json   # should show openai with their email + plan

# 4. Disconnect (when asked).
faces auth:disconnect openai
```

**Tasking the human:** if `auth:connections` returns `[]`, say: *"Run `faces auth:connect openai` in your terminal. It'll show a short code and a URL — open the URL in any browser (your phone works too), enter the code, and approve in ChatGPT. First time? You may need to turn on 'Enable device code authorization for Codex' at chatgpt.com → Settings → Security first."*

`auth:connections` reports the linked account, e.g. `openai  connected as you@example.com (Plus)`. If the plan shows as `free` or is missing, warn the human that their ChatGPT plan may not include API access — connecting requires a paid plan (Plus/Pro/Team, etc.).

Once connected, OAuth routing is transparent — no flag needed on inference commands. Requests to supported OpenAI models route through the user's ChatGPT subscription automatically.

## If `auth:connect` errors

- **`Connecting ChatGPT requires the Subscription Connect plan`** — the account isn't on connect. Upgrade with `faces billing checkout`.
- **`Device-code authorization is not enabled on your ChatGPT account yet`** — the enable-setting gate above; have the human flip the setting, then rerun.
- **`Your Faces session is missing or expired`** — run `faces auth:login` and retry.
- **`The code expired…`** — they took longer than 15 minutes; just rerun `faces auth:connect openai` for a fresh code.

## Fallback behavior (Subscription Connect only)

All OAuth and fallback settings (`api_fallback`, `--oauth-only`) apply only to Subscription Connect users with a linked ChatGPT account. Pay-per-token users do not route through OAuth and are unaffected.

By default, `api_fallback` is `false` — if OAuth fails (token revoked, model unsupported, rate limit), the request returns a **422** error instead of silently falling back to paid system keys.

The 422 response includes:
- `error: "oauth_rejected"` — stable code
- `fallback_available: true/false` — whether the user has credit balance to fall back on
- `detail` — human-readable explanation

**To enable paid fallback:**
```bash
faces account:preferences api_fallback true
```

**Per-request override:**
```bash
faces chat:chat alice -m "hello" --oauth-only    # force OAuth, no fallback (even if api_fallback is true)
```

The `--oauth-only` flag is available on `chat:chat`, `chat:messages`, `chat:responses`, `compile:thread:create`, and `compile:thread:message`.

## A reply that stops partway (`502 oauth_incomplete`)

ChatGPT sometimes ends a reply before finishing. Faces retries once. If the second attempt
also stops short, `api_fallback` decides: **on**, it is answered on the paid route and billed;
**off**, it is a `502 oauth_incomplete` and nothing is charged, so retrying is free. The same
rule covers compile interviews and style captures; a style capture that is free-only never
falls back, it retries and then fails.

## Subscription Connect onboarding

A new Subscription Connect user who hasn't linked OAuth will get 422 errors when using select OpenAI models until they either:
1. Link their OpenAI account: `faces auth:connect openai`
2. Enable paid fallback: `faces account:preferences api_fallback true`
3. Pass `--oauth-only` explicitly (to diagnose which requests use OAuth)

The recommended onboarding path is to link OAuth first, then compile.

## Supported OAuth models

Which models can run on ChatGPT changes, so it is read from the catalog rather than listed here:
a model with `codex_eligible: true` in `GET /v1/models` auto-routes to `/v1/responses` and is
billed $0 while a ChatGPT account is linked (the paid API rate otherwise). There is one entry
per model; the separate `provider: "openai_oauth"` copies are gone. Eligible means it **can**
run there, not that every ChatGPT plan serves it: a plan that does not answers
`422 model_not_supported`. See [REFERENCE.md](REFERENCE.md#chat-auto-routing) for the full
routing table.

**Was a call free?** Read `_meta.billing` in `--json` chat output (faces-cli 1.13.0+), from the
`X-Faces-Billing` header: `oauth` means the linked ChatGPT subscription paid, `credits` means it
was billed. `_meta.provider` is the model's lab and no longer reads `openai-codex` for a free call.
