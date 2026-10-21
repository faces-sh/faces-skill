# Billing & Credits

All billing commands: `faces billing:COMMAND`. Use `--json` on any command for
structured output.

## Plans

| plan | price | what it includes |
|---|---|---|
| `free` | $0 | Everything pays as it goes, from credits |
| `connect` | $17/month | The allowances below; chat runs free on the user's linked ChatGPT subscription for models with `codex_eligible: true` (`gpt-5.6-luna`, `gpt-5.6-sol`, `gpt-5.6-terra`, `gpt-6-astra`, `gpt-6-luna` and `gpt-6.1-sol` today) |
| `pro` | $49/month | Larger allowances, and the same ChatGPT routing |
| `team` | comped | No limits, never charged. By promo code only |

The old **Standard** plan is retired: never offer it. `plan` in `billing:subscription --json`
is one of `free`, `connect`, `pro`, `team`.

A subscription is an **allowance**, not a fee per request. It covers compiling and a face's
**reasoning** (its cause, in chat and `decide`), up to the limits below. The **answering model**
(`alias@model`, or a decision model) is never part of it: on every plan that is paid at the
provider's price plus 5%, unless it runs free on the user's ChatGPT subscription. So a Connect
or Pro user still needs credit for most chats, and always for `faces decide`.

| allowance | Connect | Pro |
|---|---|---|
| compile, per month | 250k source tokens | 1M |
| reasoning, per month | 10M tokens | 25M |
| reasoning, per week | 2.5M | 6.25M |
| reasoning, per 5 hours (rolling) | 640k | 1.6M |

- **Compile** counts a source's tokens **each time** it is compiled; a recompile counts again.
- **Reasoning** counts the input tokens the face's reasoning read for a turn **plus 1,500**, with
  no minimum. In a
  chat with `alias@model` that is at most 10k a turn however long the conversation; the
  reasoning alone (`--reasoning-only`) and `decide` read up to 30k.
- The month is the subscription's 30-day window, weeks are 7-day blocks of it, and the 5-hour
  window rolls.

**Past an allowance**, the `api_fallback` preference decides:

- **on:** the work carries on, paid from credits at the pay-as-you-go rates. With no credit it
  is a `402`.
- **off** (the default): refused with a `429`, and nothing is charged. The message names the
  allowance and when it resets, for example: "Your Connect plan has used its weekly allowance
  (2,500,000 of 2,500,000 tokens). It resets at 2026-10-22 14:00 UTC. Turn on API fallback to
  continue on credits in the meantime. Nothing was charged." Show it as it is, and offer
  `faces account:preferences api_fallback true` only if the user agrees to pay from credits.

**Pay-as-you-go rates** (the Free plan, and past an allowance with fallback on): a face's
reasoning $0.75 per million tokens (each turn's input tokens plus 1,500), compile $25 per
million source tokens, any model you name the provider's price + 5%. `billing:subscription
--json` carries them as `rates` (`cause_usd_per_million_input_tokens`, `cause_added_tokens`,
`compile_usd_per_million_source_tokens`, `model_markup`), and the public `GET /v1/rates` has
them with each plan's allowances. Read them there rather than quoting them from memory.

## Check the plan and its allowances

```bash
faces billing:subscription
faces billing:subscription --json
```

Shows the plan, renewal date and, on a paid plan, a meter of each allowance (faces-cli 1.17.0+):

```
Connect allowances (tokens):
  reasoning, rolling 5 hours  3018 of 640k (0%)  rolls
  reasoning, this week        3018 of 2.5M (0%)  resets 2026-10-26 09:44 UTC
  reasoning, this month       32.5k of 10M (0%)  resets 2026-10-28 09:44 UTC
  compile, this month         4072 of 250k (2%)  resets 2026-10-28 09:44 UTC
```

In `--json`, `allowances` holds `cause_5h`, `cause_week`, `cause_month` and `compile_month`,
each `{limit, used, remaining, resets_at}`. It is `null` on Free. On Team every `limit` is
`-1`, meaning **unlimited, never used up**, and `remaining` is `null`. `cause_5h` rolls, so its
`resets_at` is `null`. The `absorbed_*` fields are deprecated: do not read them.

The same negative-means-unlimited rule applies to `compile:stats`' `compile_this_month.limit`.

## Subscribe

```bash
faces billing:subscribe --plan connect      # alias of billing:subscription:activate
faces billing:subscribe --plan pro
```

From the Free plan, prints a Stripe Checkout URL. The human must open it in a browser to pay; the
page takes a **promo code**, which can make a plan free for a while or add credits. If the
subscription is set to cancel and is still in its period, this reactivates it instead.

Checkout is for a **first** subscription only. Already on Connect, Pro or Team, a second checkout
would bill twice, so it is refused (`409`); the CLI says so before asking. Switch instead.

## Switch between Connect and Pro

```bash
faces billing:subscription:plan pro         # asks to confirm; --yes skips that
faces billing:subscription:plan connect
```

Switches in place. Stripe prorates the difference on the default card, and the new allowances
apply at once. Confirm with the user before running it: it charges. A `409` means there is no
subscription to switch (subscribe instead) or the plan is Team, which cannot switch. While the
plan is set to cancel, the switch is refused (`409 cancellation_pending`, before anything is
charged), since the proration would be charged and the plan would still end: keep it first with
`billing:subscription:activate`.

## Cancel

```bash
faces billing:subscription:cancel
```

Soft cancel: keeps the plan until the current period ends, then reverts to Free. To keep it,
run `billing:subscription:activate` before then.

## Credits

```bash
faces billing:balance --json                 # balance_usd, has_payment_method (= a default card exists)
faces billing:topup --amount 5               # charges the default card; minimum $1
faces billing:topup --amount 5 --card pm_…   # charges another saved card (faces-cli 1.17.0+)
```

A top-up must be whole cents. A repeat of a recent top-up is a `409` with
`detail.error_code: "duplicate_topup"` and nothing charged: it usually means a retry of one that
went through. Check `faces billing:balance` before trying again.

Credits are applied at once. A `402` anywhere means there is no credit for that request,
including `faces decide` on Connect and Pro, whose decision model is always paid. Top up and
retry; the CLI names the command.

## Cards

An account can save several cards. One is the **default**: the subscription renews on it, and a
top-up charges it unless `--card` names another. The card used at checkout becomes the default.
(faces-cli 1.17.0+)

```bash
faces billing:cards                          # newest first: brand, last 4, expiry, id, (default)
faces billing:card-setup                     # alias billing:card:add: prints a Stripe link to save a card
faces billing:card-setup --no-default        # save it without making it the default
faces billing:card:default pm_…              # the next renewal charges this one
faces billing:card:remove pm_…  [--yes]
```

- Saving a card charges nothing. The new card becomes the default unless `--no-default`; the
  first card always does. It is listed **a few seconds after** the user finishes, because it
  arrives through Stripe's webhook: if `billing:cards` does not show it yet, wait and look again.
- Removing the default makes the newest other card the default. The **last** card cannot be
  removed while a paid subscription renews on it (`409`): add another first, or cancel.
- `404` on any of these means the card is not on this account: list them with `billing:cards`.

## Check compilation stats

```bash
faces compile:stats --json
```

Shows the plan, the source tokens compiled this month against the plan's compile allowance, and
the pay-as-you-go compile rate (faces-cli 1.18.0+):

```
Plan: connect
Compiled this month: 4,072 of 250,000 source tokens (2%), resets 2026-10-28
Pay-as-you-go compile rate: $25 per million source tokens (past the allowance, with api_fallback on)
```

`--json` is `{plan, compile_this_month: {limit, used, remaining, resets_at}, pay_as_you_go:
{usd_per_million_source_tokens}}`; `compile_this_month` is `null` on Free. Older versions read a
retired endpoint and fail. Per-face compile and chat numbers are in `faces face:stats`.

## View LLM pricing

```bash
faces billing:llm-costs --json
faces billing:llm-costs --provider openai
faces billing:llm-costs --provider anthropic
```

Lists available LLMs, their per-token costs and the user's spend on each. Each model appears
once, under the id its lab gives it, and `--provider` filters by that **lab** (openai,
anthropic, xai, qwen, z-ai, moonshot, …; the row's `lab`), never by the service that runs it.
A model's price is fixed whichever service runs it, so read it here rather than quoting one from
memory. Each row carries `markup_rate` and `prices_include_markup`; 1.21.0+ states the markup
from them, then lists compile and reasoning prices and what each plan includes, from
`GET /v1/models?kind=compile,cause` (`faces-compile-latest`: $25 per million source tokens,
`included_tokens_per_month` Connect 250,000, Pro 1,000,000).

## Usage analytics

```bash
faces billing:usage --json
faces billing:usage --group-by model --from 2026-03-01 --to 2026-03-31
```

Aggregated usage analytics. Group by `api_key`, `model`, `llm`, or `date`. Provider cost counts
only the user's own requests, so provider cost plus markup is the total. `absorbed_cost_usd` is
what Faces paid on the user's behalf (a plan's allowance, a free route), which they were not
charged.

## Rough cost reference

| Operation | Approximate cost |
|-----------|-----------------|
| Audio/video transcription | ~$0.37/hour |
| Compile, past an allowance or on Free | $25 per million source tokens |

The compile price went from $28 to $25 per million source tokens on 2026-10-21. Quote the
current one from `GET /v1/rates` (`compile.usd_per_million_source_tokens`) or
`faces billing:llm-costs`, never from memory.
| A face's reasoning, past an allowance or on Free | $0.75 per million tokens, each turn's input tokens plus 1,500 |
| The answering model | Varies by model; see `faces billing:llm-costs` |

## Common scenarios

**402:** No credit for the request. Run `faces billing:balance --json` to confirm, then
`faces billing:topup --amount <USD>` (with no card saved, `faces billing:card-setup` first)
and retry.

**429 naming an allowance:** A plan's allowance is used and `api_fallback` is off. Wait for the
reset the message names, or, if the user agrees to pay from credits,
`faces account:preferences api_fallback true`. An ordinary rate-limit `429` names no allowance.

**429 Rate limit:** Every route that runs a model or a compile counts against a per-account,
per-minute limit set by plan, published by `GET /v1/rates` under `limits.requests_per_minute`.
Nothing is charged for the refused request. faces-cli 1.19.0+ waits the `Retry-After` once and
asks again; after a second refusal, wait the seconds the message names. Never retry in a loop.

**422 oauth_only_unavailable:** `--oauth-only` where the ChatGPT route cannot serve the request:
always on pay-per-token (Free), which runs on credits, and on Connect or Pro when the model or the
link cannot. Turning `api_fallback` off on Free is refused too. Nothing is charged. Drop the flag
to pay from credits, or, on Free, subscribe to Connect to use a linked ChatGPT account.

**422 oauth_rejected:** OAuth request failed and fallback is disabled. Enable
fallback: `faces account:preferences api_fallback true`. If no credits, run
`faces billing:topup` first. See [OAUTH.md](OAUTH.md) for details.

**Connect and Pro users:** Link a ChatGPT account (`faces auth:connect openai`) so the models
marked `codex_eligible: true` in `GET /v1/models` (`gpt-5.6-luna`, `gpt-5.6-sol`, `gpt-5.6-terra`, `gpt-6-astra`, `gpt-6-luna` and `gpt-6.1-sol` today) run free
on it at `/v1/responses` (which `chat:chat` routes them to). Every other model, including
`gpt-5-mini`, `gpt-5.4` and the rest of gpt-5 through gpt-5.5, is paid from credits at the
provider's price plus 5%. If the ChatGPT route fails and `api_fallback` is `false` (the default
on Connect and Pro), the request is refused instead of billed. On Free `api_fallback` is always
`true`, and setting it to `false` is refused with a `422`.
